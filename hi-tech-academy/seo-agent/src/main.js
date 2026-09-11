// Point d'entrée du conteneur seo-agent : assemble les dépendances réelles
// (API backend, cache Postgres, snapshots de veille, chaîne d'agents,
// publication) et démarre le démon. Variables d'environnement : README.md.

import { createBackendApi } from './backendApi.js';
import { createAgents } from './agents/index.js';
import { createPublisher } from './publisher.js';
import { createDaemon } from './daemon.js';
import { createPgCache } from './cache.js';
import { createPgSnapshotStore, createMemorySnapshotStore } from './snapshots.js';

const log = (...args) => console.log(new Date().toISOString(), '—', ...args);

// Postgres (cache DataForSEO + snapshots de veille) : optionnel — sans base,
// cache absent et snapshots en mémoire (les deltas repartent au redémarrage).
let cache = null;
let snapshots = createMemorySnapshotStore();
try {
  const { default: pg } = await import('pg');
  const pool = new pg.Pool({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME ?? 'hi_tech_academy',
    user: process.env.DB_USERNAME ?? 'hi_tech_academy',
    password: process.env.DB_PASSWORD ?? 'changeme',
    connectionTimeoutMillis: 5000,
  });
  cache = await createPgCache(pool);
  snapshots = await createPgSnapshotStore(pool);
  log('Postgres connecté : cache dfs_cache + snapshots de veille');
} catch (err) {
  log(`Postgres indisponible (${err.message}) : cache désactivé, snapshots en mémoire`);
}

const api = createBackendApi();
const agents = createAgents({ cache, snapshots, log });
if (!agents.implemented) {
  log('chaîne d\'agents inactive (variables manquantes) — le démon tourne, les runs rendront les mots-clés « à traiter »');
}

const daemon = createDaemon({
  api,
  agents,
  publisher: createPublisher(),
  getCost: agents.getCost,
  log,
});

daemon.start();

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log(`${signal} reçu, arrêt de l'orchestrateur`);
    process.exit(0);
  });
}
