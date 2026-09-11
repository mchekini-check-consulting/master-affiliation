// Chaîne des agents du pipeline, en deux phases pilotées par l'admin :
//   Recherche  — veille (1) + analyse (2) → mots-clés proposés avec leurs
//                métriques (volume, KD, concurrence…), déposés en suggestions
//                pour sélection manuelle dans l'admin.
//   Rédaction  — pour chaque mot-clé sélectionné : sélection (3) + rédaction
//                (4) → article to_validate. Les enrichissements de la phase
//                de recherche sont servis par le cache (30 j) : rédiger 5-10
//                articles sur des mots-clés proches coûte très peu de plus.
// Sans identifiants DataForSEO + token LLM, la chaîne reste inactive
// (zéro consommation).

import { createDataForSeoClient } from '../dataforseo.js';
import { createLlm } from '../llm.js';
import { createMemorySnapshotStore } from '../snapshots.js';
import { createWatchAgent } from './watch.js';
import { createAnalyzeAgent } from './analyze.js';
import { createSelectAgent } from './select.js';
import { createWriteAgent } from './write.js';

/** Pages internes proposées à l'agent 4 pour le maillage (3-5 liens). */
const INTERNAL_PAGES = [
  { url: '/formations', label: 'Catalogue des formations certifiées Qualiopi' },
  { url: '/formations/kubernetes-fondamentaux', label: 'Formation Kubernetes – Fondamentaux' },
  { url: '/formations/facturation-electronique-pennylane', label: 'Formation Facturation électronique & Pennylane' },
  { url: '/formations/ia-pour-tous', label: 'Formation IA pour tous' },
  { url: '/formations/ia-for-business', label: 'Formation IA for Business' },
  { url: '/formations/ia-for-tech', label: 'Formation IA for Tech' },
  { url: '/financements', label: 'Guide des financements (OPCO, 0 € de reste à charge)' },
];

export function createAgents(deps = {}) {
  const { log = () => {} } = deps;

  const missing = [];
  if (!deps.dfs && !(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD)) {
    missing.push('DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD');
  }
  if (!deps.llm && !process.env.CLAUDE_CODE_OAUTH_TOKEN) {
    missing.push('CLAUDE_CODE_OAUTH_TOKEN');
  }
  if (missing.length > 0) {
    const reason = `Chaîne d'agents inactive — variables manquantes : ${missing.join(', ')}`;
    const inactive = async () => ({ implemented: false, reason });
    return {
      implemented: false,
      getCost: () => 0,
      researchKeyword: inactive,
      writeSuggestion: inactive,
    };
  }

  const dfs = deps.dfs ?? createDataForSeoClient({
    cache: deps.cache ?? null,
    // Détail du coût de chaque appel dans les logs du conteneur
    onCost: (cost, path) => log(`DataForSEO ${path} : ${cost.toFixed(4)} $`),
  });
  const llm = deps.llm ?? createLlm({ log });
  const snapshots = deps.snapshots ?? createMemorySnapshotStore();

  const watchAgent = createWatchAgent({ dfs, snapshots, log });
  const analyzeAgent = createAnalyzeAgent({ dfs, log });

  // La veille est propre au site, pas au mot-clé : un seul passage par run
  // (mémoïsée 30 min) au lieu d'un par mot-clé — ~10 appels Labs économisés
  // par mot-clé supplémentaire.
  const WATCH_TTL_MS = 30 * 60 * 1000;
  let watchMemo = null; // { at, output }
  async function runWatch(keywordId) {
    if (watchMemo && Date.now() - watchMemo.at < WATCH_TTL_MS) return watchMemo.output;
    const output = await watchAgent.watch({ keywordId });
    watchMemo = { at: Date.now(), output };
    return output;
  }
  const selectAgent = createSelectAgent({ llm, log });
  const writeAgent = createWriteAgent({
    dfs, llm, log,
    internalPages: deps.internalPages ?? INTERNAL_PAGES,
  });

  // Agent 1, tolérant aux pannes : sans veille, la suite tourne sans gap
  async function collectGapKeywords(keywordId, updateStep) {
    try {
      await updateStep('Agent 1 — veille concurrentielle');
      const watch = await runWatch(keywordId);
      return watch.competitors.flatMap((c) => c.gap_keywords);
    } catch (err) {
      if (err.retryNextRun) throw err;
      log(`veille en échec (${err.message}) — pipeline poursuivi sans gap`);
      return [];
    }
  }

  return {
    implemented: true,

    /** Coût DataForSEO cumulé (le moteur de run consigne le delta par run). */
    getCost: () => dfs.getTotalCost(),

    /**
     * Phase recherche : veille + analyse du pilier → dépôt des mots-clés
     * proposés (avec métriques) pour sélection manuelle dans l'admin.
     */
    async researchKeyword(ctx, keyword) {
      const { updateStep } = ctx;
      const gapKeywords = await collectGapKeywords(keyword.id, updateStep);

      await updateStep('Agent 2 — analyse volumes & concurrence');
      const analysis = await analyzeAgent.analyze(keyword.keyword, {
        keywordId: keyword.id,
        gapKeywords,
      });

      await updateStep('Dépôt des mots-clés proposés (sélection dans l\'admin)');
      await ctx.api.replaceSuggestions(keyword.id, analysis.keywords.map((k) => ({
        kw: k.kw,
        volume: k.volume,
        cpc: k.cpc,
        competition: k.competition,
        kd: k.kd,
        intent: k.intent,
        trend_12m: k.trend_12m,
        gap_score: k.gap_score,
        source: k.source,
      })));
      return { suggestionsCount: analysis.keywords.length };
    },

    /**
     * Phase rédaction : un mot-clé sélectionné par l'admin devient pilier
     * d'article — analyse (surtout servie par le cache), sélection du
     * cluster, rédaction, dépôt to_validate.
     */
    async writeSuggestion(ctx, suggestion) {
      const { updateStep } = ctx;
      const gapKeywords = await collectGapKeywords(suggestion.keyword_id, updateStep);

      await updateStep(`Agent 2 — cluster autour de « ${suggestion.kw} »`);
      const analysis = await analyzeAgent.analyze(suggestion.kw, {
        keywordId: suggestion.keyword_id,
        gapKeywords,
      });

      await updateStep('Agent 3 — sélection & clustering');
      const selection = await selectAgent.select(analysis);

      const article = await writeAgent.write(selection, { updateStep });

      await updateStep('Dépôt de l\'article (à valider dans l\'admin)');
      const created = await ctx.api.createArticle({
        keyword_id: suggestion.keyword_id,
        keyword: suggestion.kw,
        title: article.title,
        meta_description: article.meta_description,
        slug: article.slug,
        hn_outline: article.hn_outline,
        body_md: article.body_md,
        internal_links: article.internal_links,
        faq: article.faq,
        schema_org: article.schema_org,
        audit_score: Math.round(article.audit.score),
        audit_issues: article.audit.issues,
      });
      return { articleId: created.id };
    },
  };
}
