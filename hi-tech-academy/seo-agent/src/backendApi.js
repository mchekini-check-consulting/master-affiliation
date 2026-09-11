// Client de l'API de service du backend Hi-Tech Academy (/api/seo/*),
// authentifié par le token Bearer SEO_AGENT_TOKEN. C'est le seul canal de
// l'orchestrateur vers la base : config, mots-clés, articles, journal des runs.

export function createBackendApi(options = {}) {
  const {
    baseUrl = process.env.SEO_API_BASE ?? 'http://localhost:8080/api',
    token = process.env.SEO_AGENT_TOKEN,
    fetchImpl = globalThis.fetch,
  } = options;

  if (!token) {
    throw new Error('SEO_AGENT_TOKEN manquant : impossible de joindre /api/seo/*.');
  }

  async function request(method, path, body) {
    const response = await fetchImpl(baseUrl + path, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        const data = await response.json();
        if (data.message) message = data.message;
      } catch { /* réponse sans corps JSON */ }
      throw new Error(`API backend ${method} ${path} : ${message}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  return {
    /** { agent_enabled, keywords: [...] } — lu au début de chaque run. */
    getConfig() {
      return request('GET', '/seo/config');
    },

    updateKeyword(id, patch) {
      return request('PATCH', `/seo/keywords/${id}`, patch);
    },

    /** Dépôt d'un article rédigé (agent 4) au statut to_validate. */
    createArticle(payload) {
      return request('POST', '/seo/articles', payload);
    },

    /** Articles filtrés — ex. { status: 'validated', publishBefore: iso }. */
    listArticles({ status, publishBefore } = {}) {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (publishBefore) params.set('publish_before', publishBefore);
      const query = params.toString();
      return request('GET', `/seo/articles${query ? `?${query}` : ''}`);
    },

    updateArticle(id, patch) {
      return request('PATCH', `/seo/articles/${id}`, patch);
    },

    /** Runs par statut — sert à réclamer les lancements manuels (requested). */
    listRuns(status) {
      return request('GET', `/seo/runs${status ? `?status=${status}` : ''}`);
    },

    createRun(trigger) {
      return request('POST', '/seo/runs', { trigger });
    },

    updateRun(id, patch) {
      return request('PATCH', `/seo/runs/${id}`, patch);
    },
  };
}
