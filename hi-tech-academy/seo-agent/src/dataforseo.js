// Wrapper unique de l'API DataForSEO v3 (https://api.dataforseo.com/v3/) —
// seul point de contact du pipeline avec le fournisseur de données SEO.
//
// - auth Basic depuis DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD
// - défauts France : location_code 2250, language_code "fr"
// - batching automatique (lots de 1 000 mots-clés)
// - cache optionnel par mot-clé (clé = endpoint + kw + location + language,
//   TTL géré par le cache — voir cache.js, table Postgres dfs_cache)
// - endpoints SERP en mode Standard : task_post → polling tasks_ready →
//   task_get (0,0006 $/SERP, jamais de live)
// - retry exponentiel sur 5xx / 429 / erreur réseau
// - cumul du champ `cost` de chaque réponse (à consigner dans seo_runs.cost_usd)

const BASE_URL = 'https://api.dataforseo.com/v3';
const DEFAULT_LOCATION_CODE = 2250; // France
const DEFAULT_LANGUAGE_CODE = 'fr';
const KEYWORD_BATCH_MAX = 1000; // limite DataForSEO par requête
const IDEAS_SEEDS_MAX = 200;    // limite de seeds de keyword_ideas

export function createDataForSeoClient(options = {}) {
  const {
    login = process.env.DATAFORSEO_LOGIN,
    password = process.env.DATAFORSEO_PASSWORD,
    fetchImpl = globalThis.fetch,
    cache = null,
    locationCode = DEFAULT_LOCATION_CODE,
    languageCode = DEFAULT_LANGUAGE_CODE,
    maxRetries = 4,
    retryBaseMs = 1000,
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    onCost = null,
    baseUrl = BASE_URL,
  } = options;

  if (!login || !password) {
    throw new Error('Identifiants DataForSEO manquants (DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD).');
  }

  const authHeader = 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');
  let totalCost = 0;

  // --- Transport : retry exponentiel, contrôle des status DataForSEO ---

  async function call(method, path, body) {
    for (let attempt = 0; ; attempt++) {
      let response;
      try {
        response = await fetchImpl(baseUrl + path, {
          method,
          headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });
      } catch (networkError) {
        if (attempt >= maxRetries) throw networkError;
        await sleep(retryBaseMs * 2 ** attempt);
        continue;
      }
      // 5xx et 429 (rate limit) : réessayer avec backoff
      if (response.status >= 500 || response.status === 429) {
        if (attempt >= maxRetries) {
          throw new Error(`DataForSEO HTTP ${response.status} sur ${path} après ${attempt + 1} tentatives`);
        }
        await sleep(retryBaseMs * 2 ** attempt);
        continue;
      }
      if (!response.ok) {
        throw new Error(`DataForSEO HTTP ${response.status} sur ${path}`);
      }
      const data = await response.json();
      if (data.status_code !== 20000) {
        throw new Error(`DataForSEO ${data.status_code} (${data.status_message ?? '?'}) sur ${path}`);
      }
      if (typeof data.cost === 'number' && data.cost > 0) {
        totalCost += data.cost;
        onCost?.(data.cost, path);
      }
      return data;
    }
  }

  /** POST d'une tâche unique ; renvoie la tâche (échec API de la tâche = erreur). */
  async function postTask(path, params) {
    const data = await call('POST', path, [params]);
    const task = data.tasks?.[0];
    if (!task) throw new Error(`Réponse DataForSEO sans tâche sur ${path}`);
    if (task.status_code >= 40000) {
      throw new Error(`Tâche DataForSEO ${task.status_code} (${task.status_message ?? '?'}) sur ${path}`);
    }
    return task;
  }

  // --- Cache par mot-clé (règle : clé = kw + location + language) ------

  const kwCacheKey = (endpointKey, keyword) =>
    `${endpointKey}|${locationCode}|${languageCode}|${keyword.trim().toLowerCase()}`;

  const paramsCacheKey = (endpointKey, params) =>
    `${endpointKey}|${locationCode}|${languageCode}|${JSON.stringify(params)}`;

  /**
   * Endpoints « données par mot-clé » : cache par mot-clé puis requêtes par
   * lots de 1 000 pour les manquants. Renvoie un tableau aligné sur l'entrée
   * (null si DataForSEO n'a rien renvoyé pour un mot-clé).
   */
  async function batchedKeywordLookup(endpointKey, path, keywords, extraParams, extractItems) {
    const wanted = [...new Set(keywords.map((k) => String(k).trim()).filter(Boolean))];
    const found = new Map(); // kw minuscule -> item

    let missing = wanted;
    if (cache) {
      missing = [];
      for (const kw of wanted) {
        const hit = await cache.get(kwCacheKey(endpointKey, kw));
        if (hit != null) found.set(kw.toLowerCase(), hit);
        else missing.push(kw);
      }
    }

    for (let i = 0; i < missing.length; i += KEYWORD_BATCH_MAX) {
      const chunk = missing.slice(i, i + KEYWORD_BATCH_MAX);
      const task = await postTask(path, {
        keywords: chunk,
        location_code: locationCode,
        language_code: languageCode,
        ...extraParams,
      });
      for (const item of extractItems(task)) {
        const kw = item?.keyword;
        if (!kw) continue;
        found.set(kw.toLowerCase(), item);
        if (cache) await cache.set(kwCacheKey(endpointKey, kw), item);
      }
    }

    return wanted.map((kw) => found.get(kw.toLowerCase()) ?? null);
  }

  /** Endpoints « exploration » : cache sur l'ensemble des paramètres. */
  async function cachedTask(endpointKey, path, params, extract) {
    const key = cache ? paramsCacheKey(endpointKey, params) : null;
    if (cache) {
      const hit = await cache.get(key);
      if (hit != null) return hit;
    }
    const result = extract(await postTask(path, {
      location_code: locationCode,
      language_code: languageCode,
      ...params,
    }));
    if (cache) await cache.set(key, result);
    return result;
  }

  // Formes de réponse : keywords_data → result = items ; labs → result[0].items
  const resultItems = (task) => task.result ?? [];
  const labsItems = (task) => task.result?.[0]?.items ?? [];

  return {
    // === Agent 2 — analyse volumes & concurrence ======================

    /** Volume mensuel Google Ads, CPC, compétition, monthly_searches (12 mois). */
    searchVolume(keywords) {
      return batchedKeywordLookup('search_volume',
          '/keywords_data/google_ads/search_volume/live', keywords, {}, resultItems);
    },

    /** Keyword difficulty 0-100. */
    bulkKeywordDifficulty(keywords) {
      return batchedKeywordLookup('bulk_kd',
          '/dataforseo_labs/google/bulk_keyword_difficulty/live', keywords, {}, labsItems);
    },

    /** Intention de recherche : informational / navigational / commercial / transactional. */
    searchIntent(keywords) {
      return batchedKeywordLookup('search_intent',
          '/dataforseo_labs/google/search_intent/live', keywords, {}, labsItems);
    },

    /** Élargissement depuis des mots-clés seeds (≤ 200), avec données de clustering. */
    async keywordIdeas(seedKeywords, { limit = 1000, ...params } = {}) {
      const seeds = seedKeywords.map((k) => String(k).trim()).filter(Boolean);
      if (seeds.length === 0) throw new Error('keywordIdeas : aucun mot-clé seed.');
      if (seeds.length > IDEAS_SEEDS_MAX) {
        throw new Error(`keywordIdeas : ${seeds.length} seeds (maximum ${IDEAS_SEEDS_MAX}).`);
      }
      return cachedTask('keyword_ideas', '/dataforseo_labs/google/keyword_ideas/live',
          { keywords: seeds, limit, ...params }, labsItems);
    },

    /** « Recherches associées » depuis un seed unique (profondeur 0-4). */
    async relatedKeywords(seedKeyword, { depth = 2, limit = 1000, ...params } = {}) {
      const keyword = String(seedKeyword ?? '').trim();
      if (!keyword) throw new Error('relatedKeywords : mot-clé seed manquant.');
      return cachedTask('related_keywords', '/dataforseo_labs/google/related_keywords/live',
          { keyword, depth, limit, ...params }, labsItems);
    },

    // === Agent 1 — veille concurrentielle (pas de cache : snapshots) ===

    /** Domaines qui rankent sur les mêmes mots-clés que le site cible. */
    async competitorsDomain(target, { limit = 50, ...params } = {}) {
      return labsItems(await postTask('/dataforseo_labs/google/competitors_domain/live', {
        target, location_code: locationCode, language_code: languageCode, limit, ...params,
      }));
    },

    /** Mots-clés et pages positionnés d'un domaine (position ≤ 20 par défaut). */
    async rankedKeywords(target, { limit = 1000, filters, ...params } = {}) {
      return labsItems(await postTask('/dataforseo_labs/google/ranked_keywords/live', {
        target,
        location_code: locationCode,
        language_code: languageCode,
        limit,
        filters: filters ?? ['ranked_serp_element.serp_item.rank_group', '<=', 20],
        ...params,
      }));
    },

    /** Gap : mots-clés où target1 ranke et pas target2 (intersections: false). */
    async domainIntersection(target1, target2, { limit = 1000, ...params } = {}) {
      return labsItems(await postTask('/dataforseo_labs/google/domain_intersection/live', {
        target1, target2, intersections: false,
        location_code: locationCode, language_code: languageCode, limit, ...params,
      }));
    },

    /** Évolution de visibilité d'un domaine depuis date_from. */
    async historicalRankOverview(target, { dateFrom, ...params } = {}) {
      return labsItems(await postTask('/dataforseo_labs/google/historical_rank_overview/live', {
        target, location_code: locationCode, language_code: languageCode,
        ...(dateFrom ? { date_from: dateFrom } : {}), ...params,
      }));
    },

    // === Agent 4 — rédaction ==========================================

    /**
     * SERP Google organique en mode Standard (file d'attente, pas de live) :
     * task_post → polling tasks_ready → task_get/advanced. Renvoie le
     * résultat SERP complet (top organique, PAA, featured snippet…).
     */
    async serpOrganic(keyword, { pollIntervalMs = 10_000, timeoutMs = 600_000, ...params } = {}) {
      const posted = await postTask('/serp/google/organic/task_post', {
        keyword, location_code: locationCode, language_code: languageCode, ...params,
      });
      const taskId = posted.id;
      if (!taskId) throw new Error('serpOrganic : task_post sans id de tâche.');

      const deadline = Date.now() + timeoutMs;
      for (;;) {
        const ready = await call('GET', '/serp/google/organic/tasks_ready');
        const readyIds = (ready.tasks ?? [])
            .flatMap((t) => t.result ?? [])
            .map((r) => r.id);
        if (readyIds.includes(taskId)) break;
        if (Date.now() >= deadline) {
          throw new Error(`serpOrganic : tâche ${taskId} non prête après ${timeoutMs} ms.`);
        }
        await sleep(pollIntervalMs);
      }

      const data = await call('GET', `/serp/google/organic/task_get/advanced/${taskId}`);
      const task = data.tasks?.[0];
      if (!task || task.status_code >= 40000) {
        throw new Error(`serpOrganic : task_get ${task?.status_code ?? '?'} (${task?.status_message ?? '?'}).`);
      }
      return task.result?.[0] ?? null;
    },

    /** Texte structuré (Hn, paragraphes) d'une page du top 10. */
    async contentParsing(url, params = {}) {
      const task = await postTask('/on_page/content_parsing/live', { url, ...params });
      return task.result?.[0] ?? null;
    },

    /** Audit on-page instantané d'une URL (article en préprod). */
    async instantPages(url, params = {}) {
      const task = await postTask('/on_page/instant_pages', { url, ...params });
      return task.result?.[0] ?? null;
    },

    // === Suivi du coût ================================================

    /** Coût cumulé (somme des champs cost) depuis la création du client. */
    getTotalCost() {
      return totalCost;
    },
  };
}
