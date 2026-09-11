# seo-agent — orchestrateur du pipeline SEO/GEO

Pipeline multi-agents de Hi-Tech Academy, en deux phases pilotées par
l'admin (onglet **SEO / GEO**) :

1. **Recherche** — pour chaque mot-clé pilier « à analyser » : veille
   concurrentielle (agent 1) + analyse volumes/concurrence (agent 2) →
   mots-clés proposés avec métriques (volume, KD, concurrence, CPC,
   intention, tendance 12 mois, origine) déposés en suggestions.
2. **Rédaction** — l'admin coche 5 à 10 mots-clés proches (recherches
   mutualisées, coût marginal faible) puis lance la rédaction : un article
   par sélection (agents 3-4), déposé « à valider ». La formation n'est
   mise en avant qu'en fin d'article (jamais dans l'introduction).

L'orchestrateur consomme l'API de service `/api/seo/*` (token Bearer).

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
- [x] Étape 5 — agent 3 « sélection & clustering » (`src/agents/select.js`,
      LLM court : secondaires + angle, garde-fous côté code) et agent 4
      « rédaction » (`src/agents/write.js` : SERP Standard + parsing top 10 →
      brief → draft → auto-audit, une correction si score < 80, schema.org
      généré côté code) ; client LLM `src/llm.js` (Claude Agent SDK,
      CLAUDE_CODE_OAUTH_TOKEN, JSON validé avec relance, rate limit →
      report du mot-clé au run suivant)
- [x] Étape 6 — agent 1 « veille concurrentielle » (`src/agents/watch.js` :
      concurrents, top pages, gap → agent 2 ; snapshots Postgres
      `seo_watch_snapshots`, deltas = nouvelles URLs d'un run à l'autre)
- [x] Étape 7 — publication : le CMS est le site lui-même — API publique
      `GET /api/blog/articles[/{slug}]` (backend) + pages /blog de la SPA
      (fusion devant les articles codés en dur, rendu Markdown, JSON-LD
      Article + FAQPage) ; `src/publisher.js` fournit l'URL publique et le
      moteur de run fait passer l'article à published (idempotent)

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
| `CLAUDE_CODE_OAUTH_TOKEN` | Auth LLM par abonnement (`claude setup-token`) ; ne jamais définir `ANTHROPIC_API_KEY` en parallèle |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USERNAME` / `DB_PASSWORD` | Postgres (cache `dfs_cache` + snapshots de veille) — mêmes valeurs que le backend |
| `SEO_LLM_MODEL` (optionnel) | Modèle Claude des agents 3-4 (défaut : `claude-sonnet-4-6`) |
| `SEO_SITE_DOMAIN` (optionnel) | Domaine surveillé par la veille (défaut : `hi-tech-academy.fr`) |
| `SEO_PUBLIC_BASE_URL` (optionnel) | Base des URLs publiées (défaut : `https://hi-tech-academy.fr`) |

En production, ces valeurs vivent dans `/opt/master-affiliation/.env.secrets`
(non versionné, survit aux déploiements).

## Tests

```bash
npm test   # node --test : wrapper sur réponses mockées + caches
```
