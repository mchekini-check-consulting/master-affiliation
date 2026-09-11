// Chaîne des agents du pipeline : veille (1) → analyse (2) → sélection (3) →
// rédaction (4). Livrés aux étapes 4 à 6 — en attendant, ce stub ne consomme
// ni DataForSEO ni LLM et rend le mot-clé « à traiter » pour un run futur.

export function createAgents() {
  return {
    /** Faux tant que les agents 1-4 ne sont pas livrés. */
    implemented: false,

    /**
     * Traite un mot-clé pilier de bout en bout et dépose l'article via
     * ctx.api.createArticle. `ctx.updateStep(texte)` remonte l'étape courante
     * dans l'admin. Contrat de retour : { implemented: false, reason } tant
     * que la chaîne n'est pas livrée ; sinon { articleId }.
     */
    async processKeyword(_ctx, _keyword) {
      return {
        implemented: false,
        reason: 'Agents 1-4 non encore livrés (étapes 4-6) — mot-clé laissé à traiter',
      };
    },
  };
}
