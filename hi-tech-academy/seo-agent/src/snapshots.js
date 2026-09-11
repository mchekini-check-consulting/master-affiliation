// Stockage des snapshots de veille (agent 1) : un instantané par run et par
// domaine surveillé ; le run suivant compare avec le dernier pour ne remonter
// que les deltas. Postgres en production (table seo_watch_snapshots, à côté
// de dfs_cache), mémoire en test.

export async function createPgSnapshotStore(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS seo_watch_snapshots (
      id         bigserial PRIMARY KEY,
      target     text NOT NULL,
      payload    jsonb NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`);
  await pool.query(
      'CREATE INDEX IF NOT EXISTS seo_watch_snapshots_target_idx ON seo_watch_snapshots (target, created_at DESC)');

  return {
    /** Dernier snapshot enregistré pour ce domaine (null au premier run). */
    async getLatest(target) {
      const { rows } = await pool.query(
          'SELECT payload FROM seo_watch_snapshots WHERE target = $1 ORDER BY created_at DESC LIMIT 1',
          [target]);
      return rows[0]?.payload ?? null;
    },

    async save(target, payload) {
      await pool.query(
          'INSERT INTO seo_watch_snapshots (target, payload) VALUES ($1, $2::jsonb)',
          [target, JSON.stringify(payload)]);
    },
  };
}

export function createMemorySnapshotStore() {
  const byTarget = new Map(); // target -> [payloads]
  return {
    async getLatest(target) {
      const list = byTarget.get(target);
      return list?.at(-1) ?? null;
    },
    async save(target, payload) {
      if (!byTarget.has(target)) byTarget.set(target, []);
      byTarget.get(target).push(structuredClone(payload));
    },
  };
}
