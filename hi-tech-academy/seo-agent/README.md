# seo-agent — orchestrateur du pipeline SEO/GEO

Pipeline multi-agents de Hi-Tech Academy : veille concurrentielle → analyse
volumes/concurrence → sélection de mots-clés → rédaction d'articles →
publication planifiée. Piloté depuis l'onglet **SEO / GEO** de l'admin
(`/api/admin/seo/*`) ; l'orchestrateur consomme l'API de service
`/api/seo/*` (token Bearer).

## État

- [x] Étape 2 — wrapper `dataforseo` + cache + tests mockés (`npm test`)
- [x] Étape 3 — orchestrateur : démon conteneurisé (`src/main.js`) avec cron
      interne 00 h / 12 h (TZ Europe/Paris), prise en charge des runs manuels
      « requested » du bouton admin, verrou `runs.lock` (stale 3 h),
      court-circuit total si `agent_enabled=false`, attente aléatoire
      1-40 min avant publication (cron uniquement), journal `seo_runs`
      avec étape courante affichée en direct dans l'admin
- [x] Étape 4 — agent 2 « analyse volumes & concurrence »
      (`src/agents/analyze.js`) : univers seed + gap (agent 1) + ideas +
      related, enrichi (volume, CPC, compétition, KD, intention, tendance
      12 mois) au contrat strict de `src/contracts.js` ; jeu de référence de
      20 mots-clés (`reference/keywords.json`) évaluable en réel avec
      `node scripts/evaluate-agent2.mjs` (identifiants DataForSEO requis)
- [ ] Étapes 5-7 — agents 3 et 4, agent 1, publication CMS
      (stubs `src/agents/index.js` et `src/publisher.js`)

## Wrapper DataForSEO (`src/dataforseo.js`)

Seul point de contact avec l'API DataForSEO v3. 12 fonctions typées :

| Agent | Fonctions |
|---|---|
| 2 — analyse | `searchVolume`, `bulkKeywordDifficulty`, `searchIntent`, `keywordIdeas`, `relatedKeywords` |
| 1 — veille | `competitorsDomain`, `rankedKeywords`, `domainIntersection`, `historicalRankOverview` |
| 4 — rédaction | `serpOrganic` (mode Standard : task_post → tasks_ready → task_get), `contentParsing`, `instantPages` |

Comportements intégrés : auth Basic, défauts France (`location_code` 2250,
`language_code` fr), batching par lots de 1 000, cache par mot-clé
(TTL 30 jours, table Postgres `dfs_cache` via `src/cache.js`), retry
exponentiel sur 5xx/429, cumul du champ `cost` (`getTotalCost()`, hook
`onCost`) à consigner dans `seo_runs.cost_usd`.

```js
import pg from 'pg';
import { createDataForSeoClient } from './src/dataforseo.js';
import { createPgCache } from './src/cache.js';

const pool = new pg.Pool({ /* DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD */ });
const cache = await createPgCache(pool);
const dfs = createDataForSeoClient({ cache, onCost: (c, path) => console.log(path, c) });

const volumes = await dfs.searchVolume(['formation kubernetes', 'formation ia']);
```

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `DATAFORSEO_LOGIN` / `DATAFORSEO_PASSWORD` | Identifiants API DataForSEO (auth Basic) |
| `SEO_AGENT_TOKEN` | Token de service vers `/api/seo/*` (le même que côté backend) |
| `CLAUDE_CODE_OAUTH_TOKEN` | Auth LLM par abonnement (`claude setup-token`) — étape 3 ; ne jamais définir `ANTHROPIC_API_KEY` en parallèle |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USERNAME` / `DB_PASSWORD` | Postgres (cache `dfs_cache`) — mêmes valeurs que le backend |

En production, ces valeurs vivent dans `/opt/master-affiliation/.env.secrets`
(non versionné, survit aux déploiements).

## Tests

```bash
npm test   # node --test : wrapper sur réponses mockées + caches
```
