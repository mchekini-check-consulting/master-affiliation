// Agent 1 — veille concurrentielle. Aucun appel LLM : cartographie les
// concurrents du site (domaines qui rankent sur les mêmes mots-clés), leurs
// meilleures pages et le gap (mots-clés où ils rankent et pas nous). Un
// snapshot est stocké par run ; seuls les deltas (nouvelles URLs d'un run à
// l'autre) sont remontés. Les mots-clés de gap alimentent l'agent 2.

import { validateAgent1Output } from '../contracts.js';

const DEFAULTS = {
  siteDomain: process.env.SEO_SITE_DOMAIN ?? 'hi-tech-academy.fr',
  maxCompetitors: 5,
  rankedLimit: 100,   // mots-clés positionnés analysés par concurrent
  gapLimit: 50,       // intersection brute par concurrent
  gapKeywordsKept: 10, // gap remonté par concurrent (les plus gros volumes)
  topPagesKept: 10,
};

/** etv organique d'un item DataForSEO Labs, quelle que soit sa forme. */
const organicEtv = (metrics) => metrics?.organic?.etv ?? metrics?.etv ?? 0;

export function createWatchAgent(options) {
  const { dfs, snapshots, log = () => {} } = options;
  const config = { ...DEFAULTS, ...options };

  return {
    async watch({ keywordId = null } = {}) {
      const site = config.siteDomain;

      // 1. Concurrents : domaines qui rankent sur les mêmes mots-clés que nous
      const rawCompetitors = await dfs.competitorsDomain(site, {
        limit: config.maxCompetitors * 3,
      });
      const competitors = rawCompetitors
          .map((c) => ({
            domain: c?.domain ?? c?.target ?? null,
            visibilityScore: Math.round(organicEtv(c?.metrics ?? c?.full_domain_metrics) * 100) / 100,
          }))
          .filter((c) => c.domain && c.domain !== site)
          .slice(0, config.maxCompetitors);

      const previous = await snapshots.getLatest(site); // null au premier run
      const previousUrls = new Map((previous?.competitors ?? [])
          .map((c) => [c.domain, new Set((c.top_pages ?? []).map((p) => p.url))]));

      // 2. Par concurrent : meilleures pages + gap
      const output = { keyword_id: keywordId, competitors: [] };
      for (const competitor of competitors) {
        // Pages : agrégat des mots-clés positionnés (position ≤ 20)
        const ranked = await dfs.rankedKeywords(competitor.domain, { limit: config.rankedLimit });
        const pages = new Map(); // url -> { keywords_count, etv }
        for (const item of ranked) {
          const serpItem = item?.ranked_serp_element?.serp_item;
          const url = serpItem?.url ?? serpItem?.relative_url;
          if (!url) continue;
          if (!pages.has(url)) pages.set(url, { url, keywords_count: 0, etv: 0 });
          const page = pages.get(url);
          page.keywords_count += 1;
          page.etv += serpItem?.etv ?? 0;
        }
        const topPages = [...pages.values()]
            .sort((a, b) => b.etv - a.etv)
            .slice(0, config.topPagesKept)
            .map((p) => ({ ...p, etv: Math.round(p.etv * 100) / 100 }));

        // Delta : URLs absentes du snapshot précédent
        const seenBefore = previousUrls.get(competitor.domain);
        const newUrls = seenBefore
            ? topPages.map((p) => p.url).filter((url) => !seenBefore.has(url))
            : []; // premier run : pas de référence, pas de « nouveautés »

        // Gap : mots-clés où le concurrent ranke et pas nous
        const intersection = await dfs.domainIntersection(competitor.domain, site, {
          limit: config.gapLimit,
        });
        const gapKeywords = intersection
            .map((item) => ({
              kw: item?.keyword_data?.keyword ?? null,
              volume: item?.keyword_data?.keyword_info?.search_volume ?? 0,
              gap_score: Math.round((item?.first_domain_serp_element?.etv
                  ?? item?.keyword_data?.keyword_info?.search_volume ?? 0) * 100) / 100,
            }))
            .filter((g) => g.kw)
            .sort((a, b) => b.volume - a.volume)
            .slice(0, config.gapKeywordsKept)
            .map(({ kw, gap_score }) => ({ kw, gap_score }));

        output.competitors.push({
          domain: competitor.domain,
          visibility_score: competitor.visibilityScore,
          top_pages: topPages,
          new_urls_since_last_run: newUrls,
          gap_keywords: gapKeywords,
        });
      }

      // 3. Snapshot du run pour les deltas du prochain
      await snapshots.save(site, { competitors: output.competitors });
      log(`agent 1 : ${output.competitors.length} concurrent(s), ` +
          `${output.competitors.reduce((n, c) => n + c.gap_keywords.length, 0)} mot(s)-clé(s) de gap`);

      return validateAgent1Output(output);
    },
  };
}
