// Caches du wrapper DataForSEO — interface commune : get(key) / set(key, value).
//
// En production : cache Postgres (table dfs_cache, TTL 30 jours) dans la base
// hi_tech_academy, à côté des tables seo_* du backend. En test / local sans
// base : cache mémoire avec le même TTL.

const DEFAULT_TTL_DAYS = 30;

/**
 * Cache Postgres. `pool` est un pg.Pool déjà configuré (DB_HOST, DB_PORT,
 * DB_NAME, DB_USERNAME, DB_PASSWORD — mêmes variables que le backend).
 */
export async function createPgCache(pool, { ttlDays = DEFAULT_TTL_DAYS } = {}) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS dfs_cache (
      cache_key  text PRIMARY KEY,
      payload    jsonb NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`);

  return {
    async get(key) {
      const { rows } = await pool.query(
          `SELECT payload FROM dfs_cache
            WHERE cache_key = $1 AND created_at > now() - make_interval(days => $2)`,
          [key, ttlDays]);
      return rows[0]?.payload ?? null;
    },

    async set(key, value) {
      await pool.query(
          `INSERT INTO dfs_cache (cache_key, payload, created_at)
           VALUES ($1, $2::jsonb, now())
           ON CONFLICT (cache_key)
           DO UPDATE SET payload = EXCLUDED.payload, created_at = now()`,
          [key, JSON.stringify(value)]);
    },

    /** Purge des entrées expirées (à appeler en début de run). */
    async purgeExpired() {
      const { rowCount } = await pool.query(
          `DELETE FROM dfs_cache WHERE created_at <= now() - make_interval(days => $1)`,
          [ttlDays]);
      return rowCount;
    },
  };
}

/** Cache mémoire (tests, exécution locale sans base). */
export function createMemoryCache({ ttlDays = DEFAULT_TTL_DAYS, now = Date.now } = {}) {
  const ttlMs = ttlDays * 24 * 3600 * 1000;
  const entries = new Map(); // key -> { value, at }

  return {
    async get(key) {
      const entry = entries.get(key);
      if (!entry) return null;
      if (now() - entry.at > ttlMs) {
        entries.delete(key);
        return null;
      }
      return entry.value;
    },

    async set(key, value) {
      entries.set(key, { value, at: now() });
    },

    async purgeExpired() {
      let purged = 0;
      for (const [key, entry] of entries) {
        if (now() - entry.at > ttlMs) {
          entries.delete(key);
          purged++;
        }
      }
      return purged;
    },

    /** Taille actuelle (assertions de test). */
    size() {
      return entries.size;
    },
  };
}
