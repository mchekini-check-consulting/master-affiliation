// Génération de mots-clés candidats par le LLM, ancrée sur le site :
// Claude connaît le catalogue Hi-Tech Academy et propose des requêtes Google
// réalistes autour du pilier — c'est la source principale de candidats,
// DataForSEO ne sert ensuite qu'à les valider (volume, difficulté,
// concurrence) pour calculer le score d'opportunité.

const CATALOG_CONTEXT = `Hi-Tech Academy est un organisme de formation français
certifié Qualiopi (100 % à distance, finançable OPCO, souvent sans reste à
charge). Catalogue :
- Kubernetes – Fondamentaux : conteneurs, Docker, DevOps, cloud (7 h)
- IA pour tous : productivité avec ChatGPT/Claude, prompts, automatisation
  des tâches, pour non-techniciens (80 h)
- IA for Business : dirigeants et PME, lancer un micro-business avec l'IA (100 h)
- IA for Tech : développeurs — LLM, RAG, agents, intégration IA (100 h)
- Facturation électronique & Pennylane : réforme 2026, comptabilité (14 h)
Sujets connexes légitimes : financement de formation (OPCO, CPF),
reconversion vers la tech, compétences numériques en entreprise.`;

const SYSTEM = `Tu es le stratège SEO de Hi-Tech Academy.
${CATALOG_CONTEXT}
Tu réponds UNIQUEMENT en JSON valide, sans texte autour.`;

export function createBrainstormAgent(options) {
  const { llm, count = 40, log = () => {} } = options;

  return {
    /**
     * Propose ~count requêtes Google françaises réalistes autour du pilier,
     * dans les domaines du site. Les mots-clés de gap de la veille servent
     * d'inspiration (ce sur quoi les concurrents rankent et pas nous).
     */
    async generate(pillar, { gapKeywords = [] } = {}) {
      const gapHint = gapKeywords.slice(0, 15).map((g) => (typeof g === 'string' ? g : g.kw));
      const prompt = `Mot-clé pilier choisi par l'admin : "${pillar}"

Propose ${count} requêtes Google en français que des prospects de Hi-Tech
Academy tapent réellement, toutes proches du pilier ET dans les domaines du
site (jamais hors sujet). Mélange les intentions : questions
(« comment… », « qu'est-ce que… »), comparaisons (« X vs Y », « meilleur… »),
requêtes commerciales (« formation… », « prix… ») et cas d'usage concrets.
2 à 6 mots par requête, minuscules, sans ponctuation superflue, pas de
doublons ni de quasi-doublons.
${gapHint.length > 0 ? `\nInspiration (requêtes où nos concurrents apparaissent et pas nous) :\n${gapHint.map((k) => `- ${k}`).join('\n')}\n` : ''}
Réponds uniquement avec : {"keywords": ["...", "..."]}`;

      const out = await llm.generateJson(prompt, {
        system: SYSTEM,
        validate: (o) => {
          if (!Array.isArray(o.keywords) || o.keywords.length < 10) {
            throw new Error('keywords doit être un tableau d\'au moins 10 requêtes');
          }
          if (o.keywords.some((k) => typeof k !== 'string' || !k.trim() || k.length > 80)) {
            throw new Error('chaque requête doit être une chaîne non vide de moins de 80 caractères');
          }
          return o;
        },
      });

      const unique = [...new Set(out.keywords.map((k) => k.trim().toLowerCase()).filter(Boolean))];
      log(`brainstorm : ${unique.length} requêtes proposées par le LLM pour « ${pillar} »`);
      return unique.slice(0, count * 2);
    },
  };
}
