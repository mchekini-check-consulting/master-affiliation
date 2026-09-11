// Tests du cache : mémoire (comportement TTL) et Postgres (requêtes émises,
// pool mocké — le schéma réel est vérifié à part sur la base de dev).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryCache, createPgCache } from '../src/cache.js';

test('cache mémoire : set/get, expiration au-delà du TTL', async () => {
  let clock = 0;
  const cache = createMemoryCache({ ttlDays: 30, now: () => clock });

  await cache.set('k', { a: 1 });
  assert.deepEqual(await cache.get('k'), { a: 1 });

  clock = 29 * 24 * 3600 * 1000;
  assert.deepEqual(await cache.get('k'), { a: 1 }); // encore valide

  clock = 31 * 24 * 3600 * 1000;
  assert.equal(await cache.get('k'), null); // expiré
});

test('cache mémoire : purgeExpired supprime uniquement les entrées expirées', async () => {
  let clock = 0;
  const cache = createMemoryCache({ ttlDays: 30, now: () => clock });
  await cache.set('vieille', 1);
  clock = 31 * 24 * 3600 * 1000;
  await cache.set('récente', 2);

  const purged = await cache.purgeExpired();
  assert.equal(purged, 1);
  assert.equal(cache.size(), 1);
  assert.equal(await cache.get('récente'), 2);
});

function makePool(rowsByQuery = () => []) {
  const queries = [];
  return {
    queries,
    async query(text, params) {
      queries.push({ text: text.replace(/\s+/g, ' ').trim(), params });
      return { rows: rowsByQuery(text, params) ?? [], rowCount: 0 };
    },
  };
}

test('cache Postgres : création de la table dfs_cache au démarrage', async () => {
  const pool = makePool();
  await createPgCache(pool);
  assert.match(pool.queries[0].text, /CREATE TABLE IF NOT EXISTS dfs_cache/);
});

test('cache Postgres : get filtre par clé et TTL, set fait un upsert', async () => {
  const pool = makePool((text) =>
    text.includes('SELECT') ? [{ payload: { cached: true } }] : []);
  const cache = await createPgCache(pool, { ttlDays: 30 });

  const value = await cache.get('clé');
  assert.deepEqual(value, { cached: true });
  const select = pool.queries.at(-1);
  assert.match(select.text, /make_interval\(days => \$2\)/);
  assert.deepEqual(select.params, ['clé', 30]);

  await cache.set('clé', { fresh: 1 });
  const upsert = pool.queries.at(-1);
  assert.match(upsert.text, /ON CONFLICT \(cache_key\)/);
  assert.deepEqual(upsert.params, ['clé', JSON.stringify({ fresh: 1 })]);
});
