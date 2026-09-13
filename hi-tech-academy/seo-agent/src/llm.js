// Client LLM du pipeline — Claude via l'abonnement (Claude Agent SDK).
// Auth : CLAUDE_CODE_OAUTH_TOKEN (généré par `claude setup-token`), jamais
// ANTHROPIC_API_KEY (qui prendrait le dessus et basculerait en facturation
// API). Générations texte pures : 1 tour, aucun outil.
//
// generateJson : sortie JSON contrainte par un validateur de contrat —
// en cas de sortie invalide, une relance unique renvoie l'erreur au modèle
// (règle « schéma validé à la réception, relance si invalide »).
// Un rate limit (quota partagé avec l'usage interactif) lève une erreur
// marquée retryNextRun : l'orchestrateur reporte le mot-clé au run suivant.

const DEFAULT_MODEL = process.env.SEO_LLM_MODEL ?? 'claude-sonnet-4-6';

const RATE_LIMIT_PATTERN = /rate.?limit|overloaded|quota|429|too many requests|usage limit/i;

/** Extrait le premier objet JSON d'une réponse (brut ou dans un bloc ```). */
export function extractJson(text) {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end <= start) {
    throw new Error('Aucun objet JSON trouvé dans la réponse du modèle.');
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

export function createLlm(options = {}) {
  const {
    model = DEFAULT_MODEL,
    maxAttempts = 3,        // tentatives en cas de rate limit / erreur transitoire
    retryBaseMs = 30_000,   // backoff : 30 s puis 60 s
    // Garde-fou : un appel qui dépasse ce délai est abandonné et le mot-clé
    // reporté au run suivant (une génération saine prend 1 à 5 min ; le
    // throttling de quota peut monter à ~15 min)
    timeoutMs = Number(process.env.SEO_LLM_TIMEOUT_MS ?? 20 * 60_000),
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    queryImpl = null,       // injection de test ; sinon Claude Agent SDK
    log = () => {},
  } = options;

  async function callOnce(prompt, system) {
    let queryFn = queryImpl;
    if (!queryFn) {
      const sdk = await import('@anthropic-ai/claude-agent-sdk');
      queryFn = (params) => sdk.query(params);
    }
    const stream = queryFn({
      prompt,
      options: {
        model,
        maxTurns: 1,
        allowedTools: [],
        ...(system ? { systemPrompt: system } : {}),
      },
    });

    const consume = async () => {
      for await (const message of stream) {
        if (message.type === 'result') {
          if (message.subtype === 'success' && !message.is_error) {
            return message.result ?? '';
          }
          throw new Error(`LLM : ${message.subtype}${message.result ? ` — ${message.result}` : ''}`);
        }
      }
      throw new Error('LLM : flux terminé sans message de résultat.');
    };

    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        const err = new Error(`LLM : délai dépassé (${Math.round(timeoutMs / 60_000)} min) — appel abandonné`);
        err.retryNextRun = true; // report au run suivant, pas un échec définitif
        reject(err);
      }, timeoutMs);
    });
    try {
      return await Promise.race([consume(), timeout]);
    } finally {
      clearTimeout(timer);
      // Meilleur effort : arrêter le sous-processus si l'appel est abandonné
      stream?.interrupt?.().catch?.(() => {});
      stream?.return?.().catch?.(() => {});
    }
  }

  async function generate(prompt, { system } = {}) {
    const startedAt = Date.now();
    for (let attempt = 0; ; attempt++) {
      try {
        const result = await callOnce(prompt, system);
        log(`LLM : réponse en ${Math.round((Date.now() - startedAt) / 1000)} s`);
        return result;
      } catch (err) {
        if (err.retryNextRun) throw err; // timeout : ne pas réessayer ici
        const rateLimited = RATE_LIMIT_PATTERN.test(String(err.message));
        if (attempt + 1 >= maxAttempts) {
          if (rateLimited) err.retryNextRun = true; // report au run suivant
          throw err;
        }
        if (!rateLimited) throw err;
        const wait = retryBaseMs * 2 ** attempt;
        log(`LLM rate limit, nouvel essai dans ${Math.round(wait / 1000)} s`);
        await sleep(wait);
      }
    }
  }

  /**
   * Génération d'un objet JSON au contrat `validate` (fonction qui lève en
   * cas d'écart). Sortie invalide → une relance avec l'erreur en contexte.
   */
  async function generateJson(prompt, { system, validate = null, retries = 1 } = {}) {
    let lastError = null;
    let currentPrompt = prompt;
    for (let attempt = 0; attempt <= retries; attempt++) {
      const text = await generate(currentPrompt, { system });
      try {
        const parsed = extractJson(text);
        return validate ? validate(parsed) : parsed;
      } catch (err) {
        lastError = err;
        log(`sortie LLM invalide (tentative ${attempt + 1}) : ${err.message}`);
        currentPrompt = `${prompt}\n\nTa sortie précédente était invalide : ${err.message}\n` +
            'Réponds UNIQUEMENT avec l\'objet JSON corrigé, sans texte autour.';
      }
    }
    throw new Error(`LLM : sortie JSON invalide après relance — ${lastError.message}`);
  }

  return { generate, generateJson, model };
}
