// Agent 3 — sélection & clustering. Aucun appel DataForSEO : il travaille
// sur la sortie de l'agent 2 (validée à la réception). Le mot-clé pilier est
// imposé par l'admin ; l'agent choisit les mots-clés secondaires du cluster
// et définit l'angle éditorial (un appel LLM court, sortie JSON validée).
// L'intention et le KD moyen sont recalculés côté code à partir des données
// de l'agent 2 (le LLM ne décide que de ce qui est éditorial).

import { validateAgent2Output, validateAgent3Output } from '../contracts.js';

const SYSTEM = `Tu es le stratège SEO de Hi-Tech Academy, organisme de formation
certifié Qualiopi (formations Kubernetes, IA, facturation électronique,
finançables OPCO). Tu réponds UNIQUEMENT en JSON valide, sans texte autour.`;

const DEFAULTS = {
  maxSecondary: 10,      // taille max du cluster secondaire
  candidatesInPrompt: 40, // candidats montrés au LLM (maîtrise du contexte)
};

/** Longueur cible indicative selon l'intention (affinée par l'agent 4 sur la SERP). */
const WORD_COUNT_BY_INTENT = {
  informational: 1600,
  commercial: 1300,
  transactional: 1000,
  navigational: 800,
  unknown: 1300,
};

export function createSelectAgent(options) {
  const { llm, log = () => {} } = options;
  const config = { ...DEFAULTS, ...options };

  return {
    /** @param analysis sortie de l'agent 2 (contrat validé à la réception) */
    async select(analysis) {
      validateAgent2Output(analysis);

      const [pillar, ...others] = analysis.keywords;
      const candidates = others.slice(0, config.candidatesInPrompt);

      const table = candidates.map((k) =>
        `- "${k.kw}" (volume ${k.volume}, kd ${k.kd}, intention ${k.intent}, source ${k.source}${k.gap_score ? `, gap ${k.gap_score}` : ''})`).join('\n');

      const prompt = `Mot-clé pilier (imposé, ne pas le changer) : "${pillar.kw}"
Volume ${pillar.volume}, difficulté ${pillar.kd}, intention ${pillar.intent}.

Mots-clés candidats pour le cluster de l'article :
${table || '(aucun candidat — cluster réduit au pilier)'}

Choisis les mots-clés secondaires (3 à ${config.maxSecondary}, uniquement parmi les
candidats listés, jamais le pilier lui-même) qui renforcent un article unique
sur le pilier : même famille d'intention, sous-thèmes complémentaires, pas de
doublons sémantiques. Définis ensuite l'angle éditorial de l'article (une à
deux phrases : la promesse et le parti pris qui le différencient du top 10)
et une longueur cible en mots (entre 800 et 2500, cohérente avec l'intention).

Réponds uniquement avec cet objet JSON :
{"secondary_kws": ["..."], "angle": "...", "target_word_count": 1400}`;

      const raw = await llm.generateJson(prompt, {
        system: SYSTEM,
        validate: (out) => {
          if (!Array.isArray(out.secondary_kws) || out.secondary_kws.length === 0) {
            throw new Error('secondary_kws doit être un tableau non vide');
          }
          if (typeof out.angle !== 'string' || out.angle.trim().length < 10) {
            throw new Error('angle doit être une chaîne d\'au moins 10 caractères');
          }
          if (!Number.isInteger(out.target_word_count)) {
            throw new Error('target_word_count doit être un entier');
          }
          return out;
        },
      });

      // Garde-fous côté code : uniquement des candidats réels, jamais le
      // pilier, bornés à maxSecondary ; repli déterministe si le LLM a
      // tout inventé (top volume même intention).
      const known = new Map(candidates.map((k) => [k.kw.toLowerCase(), k]));
      let secondary = [...new Set(raw.secondary_kws
          .map((k) => String(k).trim())
          .filter((k) => k && k.toLowerCase() !== pillar.kw.toLowerCase())
          .filter((k) => known.has(k.toLowerCase())))]
          .slice(0, config.maxSecondary);
      if (secondary.length === 0 && candidates.length > 0) {
        log('agent 3 : sélection LLM hors candidats, repli sur le top volume');
        secondary = candidates
            .filter((k) => k.intent === pillar.intent || k.intent === 'unknown')
            .slice(0, Math.min(5, config.maxSecondary))
            .map((k) => k.kw);
        if (secondary.length === 0) secondary = candidates.slice(0, 3).map((k) => k.kw);
      }

      const clusterEntries = [pillar, ...secondary.map((k) => known.get(k.toLowerCase()))];
      const avgKd = Math.round(
          clusterEntries.reduce((sum, k) => sum + k.kd, 0) / clusterEntries.length * 10) / 10;

      const targetWordCount = Number.isInteger(raw.target_word_count)
          && raw.target_word_count >= 300 && raw.target_word_count <= 5000
          ? raw.target_word_count
          : WORD_COUNT_BY_INTENT[pillar.intent];

      return validateAgent3Output({
        keyword_id: analysis.keyword_id,
        pillar_kw: pillar.kw,
        secondary_kws: secondary.length > 0 ? secondary : [pillar.kw],
        intent: pillar.intent,
        angle: raw.angle.trim(),
        target_word_count: targetWordCount,
        avg_kd: avgKd,
      });
    },
  };
}
