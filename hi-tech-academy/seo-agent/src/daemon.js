// Démon de l'orchestrateur : une boucle par minute qui
//   - réclame et exécute les runs « requested » (bouton « Lancer l'agent »)
//   - déclenche le run planifié aux heures cron (00 h et 12 h, heure locale
//     du conteneur — TZ=Europe/Paris en production)
// Chaque exécution est protégée par le verrou fichier runs.lock.

import { acquireLock, releaseLock } from './lock.js';
import { executeRun } from './run.js';

export function createDaemon(deps, options = {}) {
  const {
    lockPath = process.env.SEO_LOCK_PATH ?? './runs.lock',
    cronHours = [0, 12],
    tickMs = 60_000,
    now = () => new Date(),
    log = (...args) => console.log(new Date().toISOString(), '—', ...args),
  } = options;

  let lastCronSlot = null; // « AAAA-MM-JJ@H » du dernier créneau cron honoré
  let ticking = false;

  async function runLocked(label, params) {
    if (!acquireLock(lockPath, { now: () => now().getTime() })) {
      log(`${label} : verrou runs.lock déjà pris, exécution ignorée`);
      return;
    }
    try {
      const result = await executeRun(deps, params);
      log(`${label} : terminé`, JSON.stringify(result));
    } finally {
      releaseLock(lockPath);
    }
  }

  async function tick() {
    // 1. Lancements manuels déposés par l'admin
    const requested = await deps.api.listRuns('requested');
    for (const run of requested) {
      log(`run manuel ${run.id} réclamé`);
      await runLocked('run manuel', { trigger: 'manual', runId: run.id });
    }

    // 2. Créneaux cron (00 h / 12 h) — au plus un run par créneau
    const current = now();
    const slot = `${current.getFullYear()}-${current.getMonth() + 1}-${current.getDate()}@${current.getHours()}`;
    if (cronHours.includes(current.getHours()) && slot !== lastCronSlot) {
      lastCronSlot = slot;
      log(`créneau cron ${slot}`);
      await runLocked('run cron', { trigger: 'cron' });
    }
  }

  return {
    /** Un tour de boucle (exposé pour les tests). */
    tick,

    /** Boucle infinie : un tick par minute, les erreurs n'arrêtent pas le démon. */
    start() {
      log(`orchestrateur démarré (cron ${cronHours.map((h) => `${h} h`).join(' / ')}, tick ${tickMs / 1000} s)`);
      const loop = async () => {
        if (ticking) return; // pas de chevauchement si un run dure > 1 tick
        ticking = true;
        try {
          await tick();
        } catch (err) {
          log(`tick en erreur : ${err.message}`);
        } finally {
          ticking = false;
        }
      };
      loop();
      return setInterval(loop, tickMs);
    },
  };
}
