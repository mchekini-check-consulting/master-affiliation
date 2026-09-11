// Publication CMS des articles validés (étape 7). Tant qu'elle n'est pas
// livrée, isConfigured() vaut false : l'orchestrateur laisse les articles
// au statut validated et le consigne dans le journal du run.

export function createPublisher() {
  return {
    isConfigured() {
      return false;
    },

    /** Publie l'article sur le blog du site et renvoie son URL publique. */
    async publishArticle(_article) {
      throw new Error('Publication CMS non implémentée (étape 7).');
    },
  };
}
