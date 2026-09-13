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

/**
 * Noms-outils faibles : ils portent la forme du contenu, pas le sujet
 * (« comparateur », « logiciel », « liste »…). Seuls, ils attirent tout un
 * rayon sans rapport — « comparateur modèles IA » ne doit pas ramener
 * « comparateur de prix » ou « comparateur essence ».
 */
const WEAK_TOKENS = new Set([
  'comparateur', 'comparatif', 'comparaison', 'modele', 'modeles', 'logiciel',
  'logiciels', 'outil', 'outils', 'solution', 'solutions', 'plateforme',
  'plateformes', 'application', 'applications', 'appli', 'liste', 'top',
  'classement', 'exemple', 'exemples', 'alternative', 'alternatives',
  'meilleurs', 'meilleures', 'test', 'tests', 'gestion',
]);

/** Synonymes / variantes des termes du domaine (correspondance élargie). */
const SYNONYMS = {
  ia: ['ai', 'intelligence artificielle'],
  ai: ['ia', 'intelligence artificielle'],
  intelligence: ['ia', 'ai'],
  artificielle: ['ia', 'ai'],
  kubernetes: ['k8s'],
  k8s: ['kubernetes'],
  llm: ['ia', 'chatgpt', 'claude', 'gpt'],
  facturation: ['facture', 'factures'],
  facture: ['facturation'],
};

const normalize = (text) => String(text)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '');

const tokenize = (text) => normalize(text)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));

/** Correspondance souple : égalité, ou même racine (préfixe de 4 lettres). */
const tokensMatch = (a, b) => a === b
    || (a.length >= 4 && b.length >= 4 && a.slice(0, 4) === b.slice(0, 4));

/** Le candidat contient-il le terme t (ou l'un de ses synonymes) ? */
function containsToken(candidateTokens, candidateText, t) {
  if (candidateTokens.some((c) => tokensMatch(c, t))) return true;
  return (SYNONYMS[t] ?? []).some((syn) =>
    syn.includes(' ') ? candidateText.includes(syn) : candidateTokens.some((c) => tokensMatch(c, syn)));
}

/**
 * Score d'opportunité 0-100 : volume élevé, concurrence faible, difficulté
 * faible. Le volume est en échelle log pour qu'un mastodonte à 100 000
 * recherches n'écrase pas tout : ~20 pts par ordre de grandeur, pondérés
 * par (100-KD) et (1-concurrence).
 */
export function opportunityScore({ volume = 0, kd = 0, competition = 0 } = {}) {
  const volumeScore = Math.log10(1 + Math.max(0, volume)) * 20; // 100 → 40 pts, 10 000 → 80 pts
  const score = volumeScore * ((100 - Math.min(100, kd)) / 100) * (1 - Math.min(1, competition));
  return Math.round(Math.min(100, score) * 10) / 10;
}

/**
 * Prédicat de pertinence lié à un pilier. Les termes du pilier sont classés :
 * forts (le sujet : « ia », « kubernetes », « pennylane »…), faibles
 * (noms-outils : « comparateur », « modèles »…) et génériques (ignorés).
 * Un candidat passe s'il contient AU MOINS UN terme fort ; sans terme fort
 * dans le pilier, il doit couvrir la majorité des termes faibles ; pilier
 * entièrement générique → repli sur n'importe lequel de ses termes.
 */
export function relevanceFilter(pillar) {
  const pillarTokens = tokenize(pillar);
  const distinctive = pillarTokens.filter((t) => !GENERIC_TOKENS.has(t));
  const strong = distinctive.filter((t) => !WEAK_TOKENS.has(t));
  const weak = distinctive.filter((t) => WEAK_TOKENS.has(t));

  return (candidate) => {
    const candidateText = normalize(candidate);
    const candidateTokens = tokenize(candidate);
    const has = (t) => containsToken(candidateTokens, candidateText, t);

    if (strong.length > 0) return strong.some(has);
    if (weak.length > 0) {
      // Pilier sans terme fort : exiger la majorité des termes faibles
      // (au moins 2 dès qu'il y en a plusieurs)
      const needed = weak.length === 1 ? 1 : Math.max(2, Math.ceil(weak.length / 2));
      return weak.filter(has).length >= needed;
    }
    return pillarTokens.some(has);
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
     * @param extraCandidates requêtes proposées par le LLM à partir du site
     *   (source « llm ») — déjà cadrées par leur prompt, elles ne passent
     *   pas le filtre lexical (elles peuvent légitimement ne partager aucun
     *   terme avec le pilier, ex. « chatgpt vs claude » pour un pilier IA)
     */
    async analyze(keyword, { keywordId = null, gapKeywords = [], extraCandidates = [] } = {}) {
      const seed = String(keyword ?? '').trim();
      if (!seed) throw new Error('Agent 2 : mot-clé pilier manquant.');

      // 1. Univers de candidats — premier arrivé premier servi dans l'ordre
      //    de priorité : seed, gap (agent 1), llm (brainstorm), ideas,
      //    related. Gap/ideas/related passent le filtre de pertinence.
      const isRelevant = relevanceFilter(seed);
      const candidates = new Map(); // kw minuscule -> { kw, source, gapScore }
      let dropped = 0;
      const add = (kw, source, gapScore = 0) => {
        const text = String(kw ?? '').trim();
        if (!text) return;
        const trusted = source === 'seed' || source === 'llm';
        if (!trusted && !isRelevant(text)) {
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
      for (const kw of extraCandidates) add(kw, 'llm');

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

      // 4. Seed en tête, le reste trié par score d'opportunité décroissant
      //    (volume élevé, concurrence et difficulté faibles), sortie bornée
      const seedEntry = entries.find((e) => e.source === 'seed');
      entries = entries
          .filter((e) => e.source !== 'seed')
          .sort((a, b) => opportunityScore(b) - opportunityScore(a))
          .slice(0, Math.max(0, config.maxResults - 1));
      entries.unshift(seedEntry);

      return validateAgent2Output({ keyword_id: keywordId, keywords: entries });
    },
  };
}
