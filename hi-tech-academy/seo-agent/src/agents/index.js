// Chaîne des agents du pipeline : veille (1) → analyse (2) → sélection (3) →
// rédaction (4) → dépôt de l'article (statut to_validate dans l'admin).
// Sans identifiants DataForSEO + token LLM, la chaîne reste inactive : les
// mots-clés sont rendus « à traiter » avec la liste des variables manquantes
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
    return {
      implemented: false,
      getCost: () => 0,
      async processKeyword() {
        return { implemented: false, reason };
      },
    };
  }

  const dfs = deps.dfs ?? createDataForSeoClient({ cache: deps.cache ?? null });
  const llm = deps.llm ?? createLlm({ log });
  const snapshots = deps.snapshots ?? createMemorySnapshotStore();

  const watchAgent = createWatchAgent({ dfs, snapshots, log });
  const analyzeAgent = createAnalyzeAgent({ dfs, log });
  const selectAgent = createSelectAgent({ llm, log });
  const writeAgent = createWriteAgent({
    dfs, llm, log,
    internalPages: deps.internalPages ?? INTERNAL_PAGES,
  });

  return {
    implemented: true,

    /** Coût DataForSEO cumulé (le moteur de run consigne le delta par run). */
    getCost: () => dfs.getTotalCost(),

    async processKeyword(ctx, keyword) {
      const { updateStep } = ctx;

      // Agent 1 — veille. Tolérante aux pannes : sans elle, le pipeline
      // continue simplement sans mots-clés de gap.
      let gapKeywords = [];
      try {
        await updateStep('Agent 1 — veille concurrentielle');
        const watch = await watchAgent.watch({ keywordId: keyword.id });
        gapKeywords = watch.competitors.flatMap((c) => c.gap_keywords);
      } catch (err) {
        if (err.retryNextRun) throw err;
        log(`veille en échec (${err.message}) — pipeline poursuivi sans gap`);
      }

      await updateStep('Agent 2 — analyse volumes & concurrence');
      const analysis = await analyzeAgent.analyze(keyword.keyword, {
        keywordId: keyword.id,
        gapKeywords,
      });

      await updateStep('Agent 3 — sélection & clustering');
      const selection = await selectAgent.select(analysis);

      const article = await writeAgent.write(selection, { updateStep });

      await updateStep('Dépôt de l\'article (à valider dans l\'admin)');
      const created = await ctx.api.createArticle({
        keyword_id: keyword.id,
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
