// Contrats JSON stricts entre agents : chaque sortie est validée à la
// réception ; une sortie invalide est rejetée avec la liste des écarts
// (et relancée côté agents LLM).

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

/**
 * Sortie de l'agent 1 — veille concurrentielle :
 * { keyword_id, competitors: [{ domain, visibility_score, top_pages:
 *   [{ url, keywords_count, etv }], new_urls_since_last_run, gap_keywords }] }
 */
export function validateAgent1Output(output) {
  const errors = [];
  if (output === null || typeof output !== 'object' || Array.isArray(output)) {
    throw new Error('Contrat agent 1 invalide : la sortie doit être un objet.');
  }
  if (output.keyword_id != null && typeof output.keyword_id !== 'string') {
    errors.push('keyword_id doit être une chaîne (ou null)');
  }
  if (!Array.isArray(output.competitors)) {
    errors.push('competitors doit être un tableau');
  } else {
    output.competitors.forEach((c, i) => {
      const at = `competitors[${i}]`;
      if (typeof c?.domain !== 'string' || c.domain.trim() === '') {
        errors.push(`${at}.domain doit être une chaîne non vide`);
      }
      if (!isNumber(c?.visibility_score) || c.visibility_score < 0) {
        errors.push(`${at}.visibility_score doit être un nombre ≥ 0`);
      }
      if (!Array.isArray(c?.top_pages)) {
        errors.push(`${at}.top_pages doit être un tableau`);
      } else {
        c.top_pages.forEach((p, j) => {
          if (typeof p?.url !== 'string' || !isNumber(p?.keywords_count) || !isNumber(p?.etv)) {
            errors.push(`${at}.top_pages[${j}] doit avoir url (chaîne), keywords_count et etv (nombres)`);
          }
        });
      }
      if (!Array.isArray(c?.new_urls_since_last_run) || c.new_urls_since_last_run.some((u) => typeof u !== 'string')) {
        errors.push(`${at}.new_urls_since_last_run doit être un tableau de chaînes`);
      }
      if (!Array.isArray(c?.gap_keywords)) {
        errors.push(`${at}.gap_keywords doit être un tableau`);
      }
    });
  }
  if (errors.length > 0) {
    throw new Error(`Contrat agent 1 invalide : ${errors.join(' ; ')}`);
  }
  return output;
}

/**
 * Sortie de l'agent 3 — sélection & clustering :
 * { keyword_id, pillar_kw, secondary_kws, intent, angle, target_word_count, avg_kd }
 */
export function validateAgent3Output(output) {
  const errors = [];
  if (output === null || typeof output !== 'object' || Array.isArray(output)) {
    throw new Error('Contrat agent 3 invalide : la sortie doit être un objet.');
  }
  if (output.keyword_id != null && typeof output.keyword_id !== 'string') {
    errors.push('keyword_id doit être une chaîne (ou null)');
  }
  if (typeof output.pillar_kw !== 'string' || output.pillar_kw.trim() === '') {
    errors.push('pillar_kw doit être une chaîne non vide');
  }
  if (!Array.isArray(output.secondary_kws) || output.secondary_kws.length === 0
      || output.secondary_kws.length > 15
      || output.secondary_kws.some((k) => typeof k !== 'string' || k.trim() === '')) {
    errors.push('secondary_kws doit être un tableau de 1 à 15 chaînes non vides');
  }
  if (!AGENT2_INTENTS.has(output.intent)) {
    errors.push(`intent doit être l'un de : ${[...AGENT2_INTENTS].join(', ')}`);
  }
  if (typeof output.angle !== 'string' || output.angle.trim().length < 10) {
    errors.push('angle doit être une chaîne d\'au moins 10 caractères');
  }
  if (!Number.isInteger(output.target_word_count)
      || output.target_word_count < 300 || output.target_word_count > 5000) {
    errors.push('target_word_count doit être un entier entre 300 et 5000');
  }
  if (!isNumber(output.avg_kd) || output.avg_kd < 0 || output.avg_kd > 100) {
    errors.push('avg_kd doit être un nombre entre 0 et 100');
  }
  if (errors.length > 0) {
    throw new Error(`Contrat agent 3 invalide : ${errors.join(' ; ')}`);
  }
  return output;
}

/**
 * Brief SEO intermédiaire de l'agent 4 (avant rédaction) :
 * { title, meta_description, slug, hn_outline: [{ level, text }], faq_questions }
 */
export function validateAgent4Brief(brief) {
  const errors = [];
  if (brief === null || typeof brief !== 'object' || Array.isArray(brief)) {
    throw new Error('Brief agent 4 invalide : la sortie doit être un objet.');
  }
  if (typeof brief.title !== 'string' || brief.title.trim().length < 15) {
    errors.push('title doit être une chaîne d\'au moins 15 caractères');
  }
  if (typeof brief.meta_description !== 'string' || brief.meta_description.trim().length < 50) {
    errors.push('meta_description doit être une chaîne d\'au moins 50 caractères');
  }
  if (typeof brief.slug !== 'string' || brief.slug.trim() === '') {
    errors.push('slug doit être une chaîne non vide');
  }
  if (!Array.isArray(brief.hn_outline) || brief.hn_outline.length < 3
      || brief.hn_outline.some((h) => ![2, 3].includes(h?.level)
          || typeof h?.text !== 'string' || h.text.trim() === '')) {
    errors.push('hn_outline doit être un tableau d\'au moins 3 entrées { level: 2|3, text }');
  }
  if (!Array.isArray(brief.faq_questions) || brief.faq_questions.length < 3
      || brief.faq_questions.length > 5
      || brief.faq_questions.some((q) => typeof q !== 'string' || q.trim() === '')) {
    errors.push('faq_questions doit être un tableau de 3 à 5 questions');
  }
  if (errors.length > 0) {
    throw new Error(`Brief agent 4 invalide : ${errors.join(' ; ')}`);
  }
  return brief;
}

/**
 * Sortie finale de l'agent 4 — article prêt à déposer :
 * { keyword_id, title, meta_description, slug, hn_outline, body_md,
 *   internal_links, faq: [{ q, a }], schema_org, audit: { score, issues } }
 */
export function validateAgent4Output(output) {
  const errors = [];
  if (output === null || typeof output !== 'object' || Array.isArray(output)) {
    throw new Error('Contrat agent 4 invalide : la sortie doit être un objet.');
  }
  if (output.keyword_id != null && typeof output.keyword_id !== 'string') {
    errors.push('keyword_id doit être une chaîne (ou null)');
  }
  if (typeof output.title !== 'string' || output.title.trim().length < 15) {
    errors.push('title doit être une chaîne d\'au moins 15 caractères');
  }
  if (typeof output.meta_description !== 'string' || output.meta_description.trim().length < 50) {
    errors.push('meta_description doit être une chaîne d\'au moins 50 caractères');
  }
  if (typeof output.slug !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(output.slug)) {
    errors.push('slug doit être en minuscules-avec-tirets (a-z, 0-9)');
  }
  if (!Array.isArray(output.hn_outline)) {
    errors.push('hn_outline doit être un tableau');
  }
  if (typeof output.body_md !== 'string' || output.body_md.trim().length < 500) {
    errors.push('body_md doit être une chaîne d\'au moins 500 caractères');
  }
  if (!Array.isArray(output.internal_links)
      || output.internal_links.some((l) => typeof l !== 'string')) {
    errors.push('internal_links doit être un tableau de chaînes');
  }
  if (!Array.isArray(output.faq) || output.faq.length < 3
      || output.faq.some((f) => typeof f?.q !== 'string' || typeof f?.a !== 'string'
          || f.q.trim() === '' || f.a.trim() === '')) {
    errors.push('faq doit être un tableau d\'au moins 3 entrées { q, a } non vides');
  }
  if (output.schema_org === null || typeof output.schema_org !== 'object'
      || Array.isArray(output.schema_org)) {
    errors.push('schema_org doit être un objet');
  }
  if (output.audit === null || typeof output.audit !== 'object'
      || !isNumber(output.audit?.score) || output.audit.score < 0 || output.audit.score > 100
      || !Array.isArray(output.audit?.issues)) {
    errors.push('audit doit être { score: 0-100, issues: [] }');
  }
  if (errors.length > 0) {
    throw new Error(`Contrat agent 4 invalide : ${errors.join(' ; ')}`);
  }
  return output;
}
