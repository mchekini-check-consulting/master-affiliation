// Exécution d'un run du pipeline :
//   1. journal (seo_runs) — création, ou réclamation d'un run « requested »
//      déposé par le bouton « Lancer l'agent » de l'admin
//   2. lecture de la config ; agent désactivé → run « skipped », zéro appel
//      DataForSEO et zéro appel LLM
//   3. traitement des mots-clés to_process par la chaîne d'agents
//   4. attente aléatoire de 1 à 40 minutes (runs cron uniquement)
//   5. publication des articles validated dont publish_at est échu
// L'étape courante est remontée en continu dans seo_runs.current_step,
// affichée en direct dans l'onglet SEO / GEO de l'admin.

const RANDOM_DELAY_MIN_S = 60;    // 1 minute
const RANDOM_DELAY_MAX_S = 2400;  // 40 minutes

export async function executeRun(deps, { trigger = 'cron', runId = null } = {}) {
  const {
    api,
    agents,
    publisher,
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    rng = Math.random,
    now = () => new Date(),
    getCost = null,
    log = () => {},
  } = deps;

  const iso = () => now().toISOString();

  // 1. Journal : réclamer le run demandé, ou en ouvrir un nouveau
  const run = runId
      ? await api.updateRun(runId, { status: 'running', started_at: iso() })
      : await api.createRun(trigger);
  const patch = (p) => api.updateRun(run.id, p);

  try {
    // 2. Config : court-circuit total si l'agent est désactivé
    const config = await api.getConfig();
    if (!config.agent_enabled) {
      log('agent désactivé : run court-circuité');
      await patch({
        status: 'skipped',
        skipped: true,
        current_step: 'Agent désactivé — aucun appel DataForSEO ni LLM',
        finished_at: iso(),
      });
      return { skipped: true, processed: 0, published: 0 };
    }

    // 3. Mots-clés à traiter
    const toProcess = config.keywords.filter((k) => k.status === 'to_process');
    let processed = 0;
    for (const [index, keyword] of toProcess.entries()) {
      await patch({
        current_step: `Traitement du mot-clé (${index + 1}/${toProcess.length})`,
        current_keyword: keyword.keyword,
      });
      await api.updateKeyword(keyword.id, { status: 'processing' });
      try {
        const outcome = await agents.processKeyword({
          api,
          log,
          updateStep: (step) => patch({ current_step: step }),
        }, keyword);

        if (outcome?.implemented === false) {
          // Chaîne d'agents pas encore livrée : rendre le mot-clé à traiter
          await api.updateKeyword(keyword.id, { status: 'to_process', last_run_at: iso() });
          await patch({ current_step: outcome.reason });
        } else {
          await api.updateKeyword(keyword.id, { status: 'done', last_run_at: iso() });
          processed++;
          await patch({ keywords_processed: processed });
        }
      } catch (err) {
        // Un mot-clé en échec ne bloque pas les suivants
        log(`mot-clé « ${keyword.keyword} » en erreur : ${err.message}`);
        await api.updateKeyword(keyword.id, {
          status: 'error',
          error_message: String(err.message ?? err).slice(0, 2000),
          last_run_at: iso(),
        });
      }
    }

    // 4. Attente aléatoire avant publication (cron uniquement : les runs
    // manuels servent à vérifier le pipeline, l'admin attend un retour direct)
    if (trigger === 'cron') {
      const delayS = Math.floor(RANDOM_DELAY_MIN_S + rng() * (RANDOM_DELAY_MAX_S - RANDOM_DELAY_MIN_S));
      await patch({ current_step: `Attente aléatoire de ${Math.round(delayS / 60)} min avant publication` });
      await sleep(delayS * 1000);
    }

    // 5. Publication des articles validés échus
    let published = 0;
    const due = await api.listArticles({ status: 'validated', publishBefore: iso() });
    if (due.length > 0 && !publisher.isConfigured()) {
      await patch({ current_step: `Publication CMS non configurée (étape 7) — ${due.length} article(s) validé(s) en attente` });
    } else {
      for (const article of due) {
        await patch({ current_step: `Publication : ${article.title}` });
        const cmsUrl = await publisher.publishArticle(article);
        // Le backend refuse la re-publication (statut ≠ validated → 409)
        await api.updateArticle(article.id, {
          status: 'published',
          cms_url: cmsUrl,
          published_at: iso(),
        });
        published++;
        await patch({ articles_published: published });
      }
    }

    const summary = {
      status: 'done',
      current_step: 'Terminé',
      keywords_processed: processed,
      articles_published: published,
      finished_at: iso(),
    };
    const cost = getCost?.();
    if (typeof cost === 'number' && cost > 0) summary.cost_usd = cost;
    await patch(summary);
    return { skipped: false, processed, published };
  } catch (err) {
    // Clôture en erreur — sans masquer l'erreur d'origine si l'API est down
    await api.updateRun(run.id, {
      status: 'error',
      error: String(err.message ?? err).slice(0, 2000),
      finished_at: iso(),
    }).catch(() => {});
    throw err;
  }
}
