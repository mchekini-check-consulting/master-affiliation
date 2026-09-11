// Publication des articles validés. Le « CMS » est le site lui-même : les
// articles publiés (statut published) sont servis par l'API publique du
// backend (GET /api/blog/articles) et rendus par la SPA sur /blog/<slug>.
// Publier = fournir l'URL publique ; le moteur de run fait ensuite passer
// l'article à published via PATCH /api/seo/articles/{id} (le backend refuse
// toute re-publication : idempotence).

export function createPublisher(options = {}) {
  const {
    baseUrl = process.env.SEO_PUBLIC_BASE_URL ?? 'https://hi-tech-academy.fr',
  } = options;

  return {
    isConfigured() {
      return true;
    },

    async publishArticle(article) {
      if (!article?.slug) {
        throw new Error(`Article ${article?.id ?? '?'} sans slug : publication impossible.`);
      }
      return `${baseUrl.replace(/\/+$/, '')}/blog/${article.slug}`;
    },
  };
}
