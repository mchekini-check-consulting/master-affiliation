// Évaluation de l'agent 2 sur le jeu de référence (reference/keywords.json).
//
//   DATAFORSEO_LOGIN=... DATAFORSEO_PASSWORD=... node scripts/evaluate-agent2.mjs [n]
//
// Traite les n premiers mots-clés de référence (défaut : tous les 20) avec de
// vrais appels DataForSEO (batchés + cachés), affiche un tableau de synthèse
// (candidats, volume du seed, KD, intention, coût) et enregistre la sortie
// complète dans reference/eval-agent2-<date>.json pour inspection manuelle.
// Le cache Postgres est utilisé si la base est joignable (DB_*), sinon cache
// mémoire — relancer le script coûte alors presque rien.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDataForSeoClient } from '../src/dataforseo.js';
import { createMemoryCache, createPgCache } from '../src/cache.js';
import { createAnalyzeAgent } from '../src/agents/analyze.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const referencePath = path.join(here, '../reference/keywords.json');

if (!process.env.DATAFORSEO_LOGIN || !process.env.DATAFORSEO_PASSWORD) {
  console.error('DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD requis pour une évaluation réelle.');
  process.exit(1);
}

// Cache : Postgres si joignable, sinon mémoire
let cache;
try {
  const { default: pg } = await import('pg');
  const pool = new pg.Pool({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME ?? 'hi_tech_academy',
    user: process.env.DB_USERNAME ?? 'hi_tech_academy',
    password: process.env.DB_PASSWORD ?? 'changeme',
    connectionTimeoutMillis: 3000,
  });
  cache = await createPgCache(pool);
  console.log('Cache : Postgres (dfs_cache)');
} catch {
  cache = createMemoryCache();
  console.log('Cache : mémoire (base injoignable)');
}

const dfs = createDataForSeoClient({ cache });
const agent = createAnalyzeAgent({ dfs, log: (m) => console.log('  ·', m) });

const { keywords } = JSON.parse(fs.readFileSync(referencePath, 'utf8'));
const count = Math.min(Number(process.argv[2]) || keywords.length, keywords.length);
const outputs = [];

console.log(`Évaluation de l'agent 2 sur ${count} mot(s)-clé(s) de référence\n`);
for (const { kw, theme } of keywords.slice(0, count)) {
  const before = dfs.getTotalCost();
  const output = await agent.analyze(kw);
  const cost = dfs.getTotalCost() - before;
  const seed = output.keywords[0];
  outputs.push({ theme, seed: kw, cost_usd: cost, output });
  console.log(
      `${kw.padEnd(45)} candidats=${String(output.keywords.length).padStart(3)}` +
      ` volume=${String(seed.volume).padStart(7)} kd=${String(seed.kd).padStart(3)}` +
      ` intent=${seed.intent.padEnd(13)} coût=${cost.toFixed(4)} $`);
}

const totalCost = outputs.reduce((sum, o) => sum + o.cost_usd, 0);
console.log(`\nCoût total : ${totalCost.toFixed(4)} $ (${(totalCost / count).toFixed(4)} $/mot-clé)`);

const outPath = path.join(here, `../reference/eval-agent2-${new Date().toISOString().slice(0, 10)}.json`);
fs.writeFileSync(outPath, JSON.stringify(outputs, null, 2));
console.log(`Sorties complètes : ${outPath}`);
