// Contrats JSON stricts entre agents : chaque sortie est validée à la
// réception ; une sortie invalide est rejetée avec la liste des écarts
// (et relancée côté agents LLM). Ici : le contrat de l'agent 2.

const AGENT2_SOURCES = new Set(['seed', 'ideas', 'related', 'gap']);
const AGENT2_INTENTS = new Set([
  'informational', 'navigational', 'commercial', 'transactional', 'unknown',
]);

const isNumber = (v) => typeof v === 'number' && Number.isFinite(v);

/**
 * Sortie de l'agent 2 — analyse volumes & concurrence :
 * { keyword_id, keywords: [{ kw, volume, cpc, competition, kd, intent,
 *   trend_12m, gap_score, source }] }
 * Lève une erreur détaillée si le contrat n'est pas respecté, sinon renvoie
 * la sortie telle quelle.
 */
export function validateAgent2Output(output) {
  const errors = [];

  if (output === null || typeof output !== 'object' || Array.isArray(output)) {
    throw new Error('Contrat agent 2 invalide : la sortie doit être un objet.');
  }
  if (output.keyword_id != null && typeof output.keyword_id !== 'string') {
    errors.push('keyword_id doit être une chaîne (ou null)');
  }
  if (!Array.isArray(output.keywords) || output.keywords.length === 0) {
    errors.push('keywords doit être un tableau non vide');
  } else {
    output.keywords.forEach((entry, i) => {
      const at = `keywords[${i}]`;
      if (entry === null || typeof entry !== 'object') {
        errors.push(`${at} doit être un objet`);
        return;
      }
      if (typeof entry.kw !== 'string' || entry.kw.trim() === '') {
        errors.push(`${at}.kw doit être une chaîne non vide`);
      }
      if (!isNumber(entry.volume) || entry.volume < 0) {
        errors.push(`${at}.volume doit être un nombre ≥ 0`);
      }
      if (!isNumber(entry.cpc) || entry.cpc < 0) {
        errors.push(`${at}.cpc doit être un nombre ≥ 0`);
      }
      if (!isNumber(entry.competition) || entry.competition < 0 || entry.competition > 1) {
        errors.push(`${at}.competition doit être un nombre entre 0 et 1`);
      }
      if (!isNumber(entry.kd) || entry.kd < 0 || entry.kd > 100) {
        errors.push(`${at}.kd doit être un nombre entre 0 et 100`);
      }
      if (!AGENT2_INTENTS.has(entry.intent)) {
        errors.push(`${at}.intent doit être l'un de : ${[...AGENT2_INTENTS].join(', ')}`);
      }
      if (!Array.isArray(entry.trend_12m) || entry.trend_12m.length > 12
          || entry.trend_12m.some((v) => !isNumber(v) || v < 0)) {
        errors.push(`${at}.trend_12m doit être un tableau d'au plus 12 nombres ≥ 0`);
      }
      if (!isNumber(entry.gap_score) || entry.gap_score < 0) {
        errors.push(`${at}.gap_score doit être un nombre ≥ 0`);
      }
      if (!AGENT2_SOURCES.has(entry.source)) {
        errors.push(`${at}.source doit être l'un de : ${[...AGENT2_SOURCES].join(', ')}`);
      }
    });
  }

  if (errors.length > 0) {
    throw new Error(`Contrat agent 2 invalide : ${errors.join(' ; ')}`);
  }
  return output;
}
