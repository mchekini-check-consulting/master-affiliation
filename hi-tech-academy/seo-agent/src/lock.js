// Verrou fichier (runs.lock) : garantit qu'un seul run s'exécute à la fois,
// même si deux processus orchestrateurs se chevauchent. Un verrou plus vieux
// que staleMs est considéré comme orphelin (crash) et cassé.

import fs from 'node:fs';

const DEFAULT_STALE_MS = 3 * 3600 * 1000; // 3 h : bien au-delà d'un run normal

export function acquireLock(path, { staleMs = DEFAULT_STALE_MS, now = Date.now } = {}) {
  try {
    fs.writeFileSync(path, JSON.stringify({ pid: process.pid, at: now() }), { flag: 'wx' });
    return true;
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
    try {
      const holder = JSON.parse(fs.readFileSync(path, 'utf8'));
      if (now() - holder.at > staleMs) {
        fs.unlinkSync(path);
        return acquireLock(path, { staleMs, now });
      }
    } catch {
      // verrou illisible : on le considère actif plutôt que de le casser
    }
    return false;
  }
}

export function releaseLock(path) {
  try {
    fs.unlinkSync(path);
  } catch {
    // déjà libéré
  }
}
