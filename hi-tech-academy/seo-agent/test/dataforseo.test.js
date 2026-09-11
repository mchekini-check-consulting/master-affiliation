// Tests du wrapper DataForSEO sur réponses mockées (aucun appel réseau).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDataForSeoClient } from '../src/dataforseo.js';
import { createMemoryCache } from '../src/cache.js';

// --- Outillage ---------------------------------------------------------

/** Réponse DataForSEO bien formée autour d'une liste de tâches. */
function dfsResponse(tasks, cost = 0.01) {
  return {
    status_code: 20000,
    status_message: 'Ok.',
    cost,
    tasks: tasks.map((t) => ({ status_code: 20000, status_message: 'Ok.', ...t })),
  };
}

/**
 * fetch mocké : `handler(url, options, call)` renvoie soit un objet JSON
 * (→ 200), soit { httpStatus } pour simuler un statut HTTP. Toutes les
 * invocations sont consignées dans `calls`.
 */
function makeFetch(handler) {
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    const call = { url, options, body: options.body ? JSON.parse(options.body) : undefined };
    calls.push(call);
    const out = await handler(url, call, calls.length);
    if (out && typeof out.httpStatus === 'number') {
      return { ok: false, status: out.httpStatus, json: async () => ({}) };
    }
    return { ok: true, status: 200, json: async () => out };
  };
  return { fetchImpl, calls };
}

function makeClient(handler, options = {}) {
  const { fetchImpl, calls } = makeFetch(handler);
  const client = createDataForSeoClient({
    login: 'login-test',
    password: 'password-test',
    fetchImpl,
    sleep: async () => {}, // pas d'attente réelle dans les tests
    ...options,
  });
  return { client, calls };
}

const volumeItems = (keywords) => keywords.map((kw) => ({ keyword: kw, search_volume: 100, cpc: 1.2 }));

// --- Transport ----------------------------------------------------------

test('auth Basic et défauts France (location 2250, langue fr)', async () => {
  const { client, calls } = makeClient(() => dfsResponse([{ result: volumeItems(['kub']) }]));
  await client.searchVolume(['kub']);

  assert.equal(calls.length, 1);
  const call = calls[0];
  assert.equal(call.url, 'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live');
  assert.equal(call.options.method, 'POST');
  assert.equal(call.options.headers.Authorization,
      'Basic ' + Buffer.from('login-test:password-test').toString('base64'));
  assert.deepEqual(call.body, [{ keywords: ['kub'], location_code: 2250, language_code: 'fr' }]);
});

test('identifiants manquants → erreur explicite', () => {
  assert.throws(
      () => createDataForSeoClient({ login: '', password: '', fetchImpl: async () => {} }),
      /DATAFORSEO_LOGIN/);
});

test('retry exponentiel sur 5xx puis succès', async () => {
  const waits = [];
  const { client, calls } = makeClient(
      (url, call, n) => (n <= 2 ? { httpStatus: 503 } : dfsResponse([{ result: volumeItems(['a']) }])),
      { sleep: async (ms) => waits.push(ms), retryBaseMs: 1000 });

  const [item] = await client.searchVolume(['a']);
  assert.equal(item.keyword, 'a');
  assert.equal(calls.length, 3);
  assert.deepEqual(waits, [1000, 2000]); // backoff exponentiel
});

test('5xx persistant → erreur après maxRetries', async () => {
  const { client, calls } = makeClient(() => ({ httpStatus: 500 }), { maxRetries: 2 });
  await assert.rejects(() => client.searchVolume(['a']), /HTTP 500/);
  assert.equal(calls.length, 3); // 1 essai + 2 retries
});

test('429 (rate limit) est réessayé comme un 5xx', async () => {
  const { client, calls } = makeClient(
      (url, call, n) => (n === 1 ? { httpStatus: 429 } : dfsResponse([{ result: volumeItems(['a']) }])));
  await client.searchVolume(['a']);
  assert.equal(calls.length, 2);
});

test('status_code global ≠ 20000 → erreur', async () => {
  const { client } = makeClient(() => ({ status_code: 40101, status_message: 'Auth error.' }));
  await assert.rejects(() => client.searchVolume(['a']), /40101/);
});

test('tâche en échec (status_code 40501) → erreur', async () => {
  const { client } = makeClient(() =>
    ({ status_code: 20000, cost: 0, tasks: [{ status_code: 40501, status_message: 'Invalid field.' }] }));
  await assert.rejects(() => client.searchVolume(['a']), /40501/);
});

test('coût cumulé : onCost par appel et getTotalCost', async () => {
  const costs = [];
  const { client } = makeClient(() => dfsResponse([{ result: volumeItems(['a']) }], 0.05),
      { onCost: (cost, path) => costs.push({ cost, path }) });

  await client.searchVolume(['a']);
  await client.bulkKeywordDifficulty(['b']);
  assert.equal(client.getTotalCost(), 0.1);
  assert.equal(costs.length, 2);
  assert.equal(costs[0].cost, 0.05);
});

// --- Batching -----------------------------------------------------------

test('batching : 1 500 mots-clés → 2 requêtes (1 000 + 500)', async () => {
  const { client, calls } = makeClient((url, call) =>
    dfsResponse([{ result: volumeItems(call.body[0].keywords) }]));

  const keywords = Array.from({ length: 1500 }, (_, i) => `kw-${i}`);
  const results = await client.searchVolume(keywords);

  assert.equal(calls.length, 2);
  assert.equal(calls[0].body[0].keywords.length, 1000);
  assert.equal(calls[1].body[0].keywords.length, 500);
  assert.equal(results.length, 1500);
  assert.equal(results[42].keyword, 'kw-42'); // alignement entrée/sortie
});

test('mot-clé sans réponse DataForSEO → null à sa position', async () => {
  const { client } = makeClient(() => dfsResponse([{ result: volumeItems(['a']) }]));
  const results = await client.searchVolume(['a', 'introuvable']);
  assert.equal(results[0].keyword, 'a');
  assert.equal(results[1], null);
});

// --- Cache --------------------------------------------------------------

test('cache par mot-clé : le second appel ne refait aucune requête', async () => {
  const cache = createMemoryCache();
  const { client, calls } = makeClient(
      (url, call) => dfsResponse([{ result: volumeItems(call.body[0].keywords) }]), { cache });

  await client.searchVolume(['kubernetes', 'docker']);
  assert.equal(calls.length, 1);

  const results = await client.searchVolume(['kubernetes', 'docker']);
  assert.equal(calls.length, 1); // aucun nouvel appel
  assert.equal(results[0].keyword, 'kubernetes');
});

test('cache partiel : seuls les mots-clés manquants sont demandés', async () => {
  const cache = createMemoryCache();
  const { client, calls } = makeClient(
      (url, call) => dfsResponse([{ result: volumeItems(call.body[0].keywords) }]), { cache });

  await client.searchVolume(['a']);
  await client.searchVolume(['a', 'b']);

  assert.equal(calls.length, 2);
  assert.deepEqual(calls[1].body[0].keywords, ['b']); // « a » vient du cache
});

test('cache expiré (TTL 30 jours) → nouvelle requête', async () => {
  let clock = 0;
  const cache = createMemoryCache({ now: () => clock });
  const { client, calls } = makeClient(
      (url, call) => dfsResponse([{ result: volumeItems(call.body[0].keywords) }]), { cache });

  await client.searchVolume(['a']);
  clock = 31 * 24 * 3600 * 1000; // 31 jours plus tard
  await client.searchVolume(['a']);
  assert.equal(calls.length, 2);
});

test('le cache distingue les endpoints pour un même mot-clé', async () => {
  const cache = createMemoryCache();
  const { client, calls } = makeClient((url, call) => {
    if (url.includes('search_volume')) return dfsResponse([{ result: volumeItems(call.body[0].keywords) }]);
    return dfsResponse([{ result: [{ items: call.body[0].keywords.map((kw) => ({ keyword: kw, keyword_difficulty: 42 })) }] }]);
  }, { cache });

  await client.searchVolume(['a']);
  const [kd] = await client.bulkKeywordDifficulty(['a']);
  assert.equal(calls.length, 2); // pas de collision de cache entre endpoints
  assert.equal(kd.keyword_difficulty, 42);
});

// --- Endpoints labs (forme result[0].items) ------------------------------

test('searchIntent extrait result[0].items', async () => {
  const { client } = makeClient(() => dfsResponse([{
    result: [{ items: [{ keyword: 'a', keyword_intent: { label: 'informational' } }] }],
  }]));
  const [item] = await client.searchIntent(['a']);
  assert.equal(item.keyword_intent.label, 'informational');
});

test('keywordIdeas : limite de 200 seeds appliquée', async () => {
  const { client } = makeClient(() => dfsResponse([{ result: [{ items: [] }] }]));
  await assert.rejects(
      () => client.keywordIdeas(Array.from({ length: 201 }, (_, i) => `s${i}`)),
      /maximum 200/);
});

test('keywordIdeas : payload seeds + limit, cache sur les paramètres', async () => {
  const cache = createMemoryCache();
  const { client, calls } = makeClient(
      () => dfsResponse([{ result: [{ items: [{ keyword: 'idée' }] }] }]), { cache });

  const items = await client.keywordIdeas(['seed'], { limit: 500 });
  assert.deepEqual(calls[0].body[0],
      { location_code: 2250, language_code: 'fr', keywords: ['seed'], limit: 500 });
  assert.equal(items[0].keyword, 'idée');

  await client.keywordIdeas(['seed'], { limit: 500 });
  assert.equal(calls.length, 1); // servi par le cache

  await client.keywordIdeas(['seed'], { limit: 900 });
  assert.equal(calls.length, 2); // paramètres différents → nouvel appel
});

test('relatedKeywords : seed unique, profondeur par défaut 2', async () => {
  const { client, calls } = makeClient(() => dfsResponse([{ result: [{ items: [] }] }]));
  await client.relatedKeywords('formation kubernetes');
  assert.equal(calls[0].body[0].keyword, 'formation kubernetes');
  assert.equal(calls[0].body[0].depth, 2);
  assert.equal(calls[0].body[0].limit, 1000);
});

// --- Agent 1 — veille ----------------------------------------------------

test('rankedKeywords : filtre position ≤ 20 par défaut', async () => {
  const { client, calls } = makeClient(() => dfsResponse([{ result: [{ items: [] }] }]));
  await client.rankedKeywords('concurrent.fr');
  assert.deepEqual(calls[0].body[0].filters, ['ranked_serp_element.serp_item.rank_group', '<=', 20]);
  assert.equal(calls[0].body[0].target, 'concurrent.fr');
});

test('domainIntersection : intersections=false (gap)', async () => {
  const { client, calls } = makeClient(() => dfsResponse([{ result: [{ items: [] }] }]));
  await client.domainIntersection('concurrent.fr', 'hi-tech-academy.fr');
  const body = calls[0].body[0];
  assert.equal(body.target1, 'concurrent.fr');
  assert.equal(body.target2, 'hi-tech-academy.fr');
  assert.equal(body.intersections, false);
});

// --- Agent 4 — SERP en mode Standard -------------------------------------

test('serpOrganic : task_post → polling tasks_ready → task_get/advanced', async () => {
  const serpResult = { keyword: 'formation kubernetes', items: [{ type: 'organic', url: 'https://x.fr' }] };
  const { client, calls } = makeClient((url, call, n) => {
    if (url.endsWith('/serp/google/organic/task_post')) {
      return dfsResponse([{ id: 'task-1', status_code: 20100 }], 0.0006);
    }
    if (url.endsWith('/serp/google/organic/tasks_ready')) {
      // pas prête au 1er poll, prête au 2e
      const ready = calls.filter((c) => c.url.endsWith('tasks_ready')).length >= 2;
      return dfsResponse([{ result: ready ? [{ id: 'task-1' }] : [] }], 0);
    }
    if (url.endsWith('/serp/google/organic/task_get/advanced/task-1')) {
      return dfsResponse([{ id: 'task-1', result: [serpResult] }], 0);
    }
    throw new Error(`URL inattendue : ${url}`);
  });

  const result = await client.serpOrganic('formation kubernetes');
  assert.deepEqual(result, serpResult);

  const paths = calls.map((c) => c.url.split('/v3')[1]);
  assert.deepEqual(paths, [
    '/serp/google/organic/task_post',
    '/serp/google/organic/tasks_ready',
    '/serp/google/organic/tasks_ready',
    '/serp/google/organic/task_get/advanced/task-1',
  ]);
  // le POST de la tâche porte bien les défauts France
  assert.equal(calls[0].body[0].location_code, 2250);
  assert.equal(calls[0].body[0].language_code, 'fr');
});

test('serpOrganic : timeout si la tâche ne devient jamais prête', async () => {
  const { client } = makeClient((url) => {
    if (url.endsWith('task_post')) return dfsResponse([{ id: 'task-2', status_code: 20100 }]);
    return dfsResponse([{ result: [] }], 0); // tasks_ready toujours vide
  });
  await assert.rejects(
      () => client.serpOrganic('kw', { timeoutMs: 0, pollIntervalMs: 1 }),
      /non prête/);
});

test('contentParsing et instantPages renvoient result[0]', async () => {
  const { client, calls } = makeClient((url) => {
    if (url.endsWith('/on_page/content_parsing/live')) {
      return dfsResponse([{ result: [{ items: [{ type: 'h2', text: 'Titre' }] }] }]);
    }
    return dfsResponse([{ result: [{ onpage_score: 91 }] }]);
  });

  const parsed = await client.contentParsing('https://x.fr/article');
  assert.equal(parsed.items[0].text, 'Titre');
  assert.equal(calls[0].body[0].url, 'https://x.fr/article');

  const audit = await client.instantPages('https://hi-tech-academy.fr/blog/x');
  assert.equal(audit.onpage_score, 91);
});
