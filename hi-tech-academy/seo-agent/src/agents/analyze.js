// Agent 2 — analyse volumes & concurrence. Aucun appel LLM : uniquement le
// wrapper DataForSEO (batché + caché). À partir du mot-clé pilier imposé par
// l'admin (et des mots-clés de gap remontés par l'agent 1), il constitue
// l'univers de mots-clés candidats puis l'enrichit : volume, CPC,
// compétition, difficulté (KD), intention, tendance 12 mois.
//
// Sortie (contrat strict, voir contracts.js) :
//   { keyword_id, keywords: [{ kw, volume, cpc, competition, kd, intent,
//     trend_12m, gap_score, source: "seed|ideas|related|gap" }] }

import { validateAgent2Output } from '../contracts.js';

const DEFAULTS = {
  ideasLimit: 150,    // candidats issus de keyword_ideas
  relatedLimit: 100,  // candidats issus de related_keywords
  relatedDepth: 2,
  maxCandidates: 200, // univers enrichi (maîtrise du coût DataForSEO)
  maxResults: 100,    // taille max de la sortie (le seed est toujours gardé)
};

// --- Filtre de pertinence : un candidat doit partager un terme distinctif
// avec le pilier. Sans lui, keyword_ideas (qui ratisse par catégorie) et le
// gap de la veille (calculé au niveau du site) injectent des mots-clés hors
// sujet (« youtube »…) qui écrasent le pilier au tri par volume. ------------

const STOPWORDS = new Set([
  'le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'en', 'au', 'aux',
  'sur', 'pour', 'dans', 'par', 'avec', 'sans', 'est', 'que', 'qui', 'quoi',
  'comment', 'quel', 'quelle', 'quels', 'quelles', 'ce', 'cette', 'ces', 'se',
  'son', 'sa', 'ses', 'mon', 'ma', 'mes', 'votre', 'vos',
]);

/** Termes trop transverses pour distinguer un sujet (communs à tout le catalogue). */
const GENERIC_TOKENS = new Set([
  'formation', 'formations', 'cours', 'apprendre', 'devenir', 'metier',
  'emploi', 'salaire', 'definition', 'guide', 'tuto', 'tutoriel', 'tutoriels',
  'certification', 'certifiante', 'diplome', 'gratuit', 'gratuite', 'ligne',
  'distance', 'cpf', 'opco', 'prix', 'tarif', 'avis', 'meilleure', 'meilleur',
]);

const tokenize = (text) => String(text)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));

/** Correspondance souple : égalité, ou même racine (préfixe de 4 lettres). */
const tokensMatch = (a, b) => a === b
    || (a.length >= 4 && b.length >= 4 && a.slice(0, 4) === b.slice(0, 4));

/**
 * Prédicat de pertinence lié à un pilier : le candidat doit contenir au
 * moins un terme distinctif du pilier (hors termes génériques) — repli sur
 * tous les termes si le pilier n'en a pas (ex. pilier « formation cpf »).
 */
export function relevanceFilter(pillar) {
  const pillarTokens = tokenize(pillar);
  const distinctive = pillarTokens.filter((t) => !GENERIC_TOKENS.has(t));
  const required = distinctive.length > 0 ? distinctive : pillarTokens;
  return (candidate) => {
    const candidateTokens = tokenize(candidate);
    return required.some((t) => candidateTokens.some((c) => tokensMatch(c, t)));
  };
}

/** monthly_searches Google Ads (récent → ancien) → 12 valeurs chronologiques. */
function toTrend12m(monthlySearches) {
  if (!Array.isArray(monthlySearches)) return [];
  return [...monthlySearches]
      .sort((a, b) => (a.year - b.year) || (a.month - b.month))
      .slice(-12)
      .map((m) => m.search_volume ?? 0);
}

export function createAnalyzeAgent(options) {
  const { dfs, log = () => {} } = options;
  const config = { ...DEFAULTS, ...options };

  return {
    /**
     * @param keyword mot-clé pilier (imposé par l'admin)
     * @param gapKeywords mots-clés de gap de l'agent 1 — chaînes ou
     *   { kw, gap_score } (score : visibilité du concurrent sur ce mot-clé)
     */
    async analyze(keyword, { keywordId = null, gapKeywords = [] } = {}) {
      const seed = String(keyword ?? '').trim();
      if (!seed) throw new Error('Agent 2 : mot-clé pilier manquant.');

      // 1. Univers de candidats — premier arrivé premier servi dans l'ordre
      //    de priorité : seed, gap (agent 1), ideas, related. Tout candidat
      //    non-seed passe le filtre de pertinence (hors-sujet écartés).
      const isRelevant = relevanceFilter(seed);
      const candidates = new Map(); // kw minuscule -> { kw, source, gapScore }
      let dropped = 0;
      const add = (kw, source, gapScore = 0) => {
        const text = String(kw ?? '').trim();
        if (!text) return;
        if (source !== 'seed' && !isRelevant(text)) {
          dropped++;
          return;
        }
        const key = text.toLowerCase();
        if (!candidates.has(key)) candidates.set(key, { kw: text, source, gapScore });
      };

      add(seed, 'seed');
      for (const gap of gapKeywords) {
        if (typeof gap === 'string') add(gap, 'gap');
        else add(gap?.kw, 'gap', Number(gap?.gap_score) || 0);
      }

      const [ideas, related] = await Promise.all([
        // closely_variants : variantes proches du seed uniquement (sans quoi
        // keyword_ideas élargit à toute la catégorie)
        dfs.keywordIdeas([seed], { limit: config.ideasLimit, closely_variants: true }),
        dfs.relatedKeywords(seed, { depth: config.relatedDepth, limit: config.relatedLimit }),
      ]);
      for (const item of ideas) add(item?.keyword, 'ideas');
      for (const item of related) add(item?.keyword_data?.keyword ?? item?.keyword, 'related');

      const universe = [...candidates.values()].slice(0, config.maxCandidates);
      const kws = universe.map((c) => c.kw);
      log(`agent 2 : ${kws.length} candidats pour « ${seed} » ` +
          `(gap ${gapKeywords.length}, ideas ${ideas.length}, related ${related.length}, hors-sujet écartés ${dropped})`);

      // 2. Enrichissement batché (volume/CPC, KD, intention)
      const [volumes, difficulties, intents] = await Promise.all([
        dfs.searchVolume(kws),
        dfs.bulkKeywordDifficulty(kws),
        dfs.searchIntent(kws),
      ]);

      // 3. Assemblage au contrat
      let entries = universe.map((candidate, i) => {
        const volume = volumes[i];
        const competitionIndex = volume?.competition_index;
        return {
          kw: candidate.kw,
          volume: volume?.search_volume ?? 0,
          cpc: volume?.cpc ?? 0,
          competition: competitionIndex != null ? competitionIndex / 100 : 0,
          kd: difficulties[i]?.keyword_difficulty ?? 0,
          intent: intents[i]?.keyword_intent?.label ?? 'unknown',
          trend_12m: toTrend12m(volume?.monthly_searches),
          gap_score: candidate.gapScore,
          source: candidate.source,
        };
      });

      // 4. Seed en tête, le reste trié par volume décroissant, sortie bornée
      const seedEntry = entries.find((e) => e.source === 'seed');
      entries = entries
          .filter((e) => e.source !== 'seed')
          .sort((a, b) => b.volume - a.volume)
          .slice(0, Math.max(0, config.maxResults - 1));
      entries.unshift(seedEntry);

      return validateAgent2Output({ keyword_id: keywordId, keywords: entries });
    },
  };
}
