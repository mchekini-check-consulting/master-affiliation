// Client HTTP du backend Hi-Tech Academy (Spring Boot, servi sous /api).
// En production le nginx du front proxifie /api vers le conteneur backend ;
// en développement le proxy est assuré par Vite (vite.config.js).

const API_BASE = '/api';

async function request(path, { method = 'GET', body, auth } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) headers['Authorization'] = `Basic ${btoa(`${auth.email}:${auth.password}`)}`;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = `Erreur ${response.status}`;
    try {
      const data = await response.json();
      if (data.message) message = data.message;
    } catch { /* réponse sans corps JSON */ }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// --- Parcours public -------------------------------------------------
export function createRegistration(payload) {
  return request('/registrations', { method: 'POST', body: payload });
}

export function getRegistrationPublic(id) {
  return request(`/registrations/${id}/public`);
}

export function submitNeedsAnalysis(id, payload) {
  return request(`/registrations/${id}/needs-analysis`, { method: 'POST', body: payload });
}

export function submitSponsorSurvey(id, payload) {
  return request(`/registrations/${id}/sponsor-survey`, { method: 'POST', body: payload });
}

export function submitTrainee(id, payload) {
  return request(`/registrations/${id}/trainees`, { method: 'POST', body: payload });
}

// Catalogue du test de positionnement de la formation (Kubernetes par défaut)
export function getPositioningTestContent(formationId) {
  const query = formationId ? `?formation_id=${encodeURIComponent(formationId)}` : '';
  return request(`/registrations/positioning-test${query}`);
}

export function submitPositioningTest(id, payload) {
  return request(`/registrations/${id}/positioning-test`, { method: 'POST', body: payload });
}

export function submitTraineePositioningTest(id, traineeId, payload) {
  return request(`/registrations/${id}/trainees/${traineeId}/positioning-test`, { method: 'POST', body: payload });
}

// Catalogue du QCM d'évaluation finale de la formation (Kubernetes par défaut)
export function getFinalEvaluationContent(formationId) {
  const query = formationId ? `?formation_id=${encodeURIComponent(formationId)}` : '';
  return request(`/registrations/final-evaluation${query}`);
}

export function submitFinalEvaluation(id, payload) {
  return request(`/registrations/${id}/final-evaluation`, { method: 'POST', body: payload });
}

export function submitTraineeFinalEvaluation(id, traineeId, payload) {
  return request(`/registrations/${id}/trainees/${traineeId}/final-evaluation`, { method: 'POST', body: payload });
}

export function adminSendFinalEvaluation(auth, id) {
  return request(`/admin/registrations/${id}/final-evaluation/send`, { method: 'POST', auth });
}

export function adminSendTraineeFinalEvaluation(auth, id, traineeId) {
  return request(`/admin/registrations/${id}/trainees/${traineeId}/final-evaluation/send`, { method: 'POST', auth });
}

export function adminSendFinalEvaluationCorrection(auth, id, pdfBase64) {
  // Le backend désérialise en snake_case (spring.jackson.property-naming-strategy)
  return request(`/admin/registrations/${id}/final-evaluation/send-correction`, {
    method: 'POST', auth, body: { pdf_base64: pdfBase64 },
  });
}

export function adminSendTraineeFinalEvaluationCorrection(auth, id, traineeId, pdfBase64) {
  return request(`/admin/registrations/${id}/trainees/${traineeId}/final-evaluation/send-correction`, {
    method: 'POST', auth, body: { pdf_base64: pdfBase64 },
  });
}

export function adminSendCertificate(auth, certificateId, pdfBase64) {
  return request(`/admin/certificates/${certificateId}/send`, {
    method: 'POST', auth, body: { pdf_base64: pdfBase64 },
  });
}

// Archive la copie du certificat sans envoi d'email (le backend ignore
// l'appel si une copie « telle qu'envoyée » existe déjà)
export function adminArchiveCertificatePdf(auth, certificateId, pdfBase64) {
  return request(`/admin/certificates/${certificateId}/archive`, {
    method: 'POST', auth, body: { pdf_base64: pdfBase64 },
  });
}

// --- Devis & factures --------------------------------------------------
export function adminListBillingDocuments(auth) {
  return request('/admin/billing/documents', { auth });
}

export function adminCreateBillingDocument(auth, payload) {
  return request('/admin/billing/documents', { method: 'POST', body: payload, auth });
}

export function adminUpdateBillingStatus(auth, id, status) {
  return request(`/admin/billing/documents/${id}/status`, { method: 'POST', body: { status }, auth });
}

// Convertit un devis en facture (nouveau numéro FA, devis marqué accepté)
export function adminConvertQuoteToInvoice(auth, id) {
  return request(`/admin/billing/documents/${id}/invoice`, { method: 'POST', auth });
}

export function adminSendBillingDocument(auth, id, pdfBase64, recipientEmail) {
  return request(`/admin/billing/documents/${id}/send`, {
    method: 'POST', auth, body: { pdf_base64: pdfBase64, recipient_email: recipientEmail || undefined },
  });
}

// Archive la copie du document sans envoi d'email (le backend ignore
// l'appel si une copie « telle qu'envoyée » existe déjà)
export function adminArchiveBillingPdf(auth, id, pdfBase64) {
  return request(`/admin/billing/documents/${id}/archive`, {
    method: 'POST', auth, body: { pdf_base64: pdfBase64 },
  });
}

// --- Kanban de veille -------------------------------------------------
export function adminListVeille(auth) {
  return request('/admin/veille', { auth });
}

export function adminCreateVeille(auth, { axis, content, entryDate }) {
  return request('/admin/veille', {
    method: 'POST', auth, body: { axis, content, entry_date: entryDate || undefined },
  });
}

export function adminMoveVeille(auth, id, axis) {
  return request(`/admin/veille/${id}`, { method: 'PATCH', auth, body: { axis } });
}

export function adminDeleteVeille(auth, id) {
  return request(`/admin/veille/${id}`, { method: 'DELETE', auth });
}

export function adminListComplaints(auth) {
  return request('/admin/complaints', { auth });
}

export function adminGetComplaint(auth, id) {
  return request(`/admin/complaints/${id}`, { auth });
}

export function adminUpdateComplaint(auth, id, payload) {
  return request(`/admin/complaints/${id}`, { method: 'POST', body: payload, auth });
}

export function createComplaint(payload) {
  return request('/complaints', { method: 'POST', body: payload });
}

// --- Espace admin (basic auth) ---------------------------------------
const AUTH_STORAGE_KEY = 'hta-admin-auth';

export function getStoredAuth() {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeAuth(auth) {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

export function adminCheckCredentials(auth) {
  return request('/admin/me', { auth });
}

export function adminListRegistrations(auth) {
  return request('/admin/registrations', { auth });
}

export function adminGetRegistration(auth, id) {
  return request(`/admin/registrations/${id}`, { auth });
}

export function adminUpdateStatus(auth, id, status) {
  return request(`/admin/registrations/${id}/status`, { method: 'POST', body: { status }, auth });
}

export function adminListCertificates(auth) {
  return request('/admin/certificates', { auth });
}

export function adminIssueCertificate(auth, registrationId, payload) {
  return request(`/admin/registrations/${registrationId}/certificate`, { method: 'POST', body: payload, auth });
}

// --- Sauvegardes (export / import de toutes les données) --------------

function authHeader(auth) {
  return { Authorization: `Basic ${btoa(`${auth.email}:${auth.password}`)}` };
}

// Télécharge l'archive de sauvegarde. Renvoie { blob, filename }.
export async function adminExportBackup(auth) {
  const response = await fetch(`${API_BASE}/admin/backup`, { headers: authHeader(auth) });
  if (!response.ok) throw new Error(`Erreur ${response.status}`);
  const disposition = response.headers.get('Content-Disposition') ?? '';
  const filename = /filename="?([^";]+)"?/.exec(disposition)?.[1] ?? 'hi-tech-academy-backup.zip';
  return { blob: await response.blob(), filename };
}

// Restaure une sauvegarde (remplace toutes les données). Renvoie le rapport d'import.
export async function adminImportBackup(auth, file) {
  const form = new FormData();
  form.append('file', file);
  const response = await fetch(`${API_BASE}/admin/backup/import`, {
    method: 'POST',
    headers: authHeader(auth),
    body: form,
  });
  if (!response.ok) {
    let message = `Erreur ${response.status}`;
    try {
      const data = await response.json();
      if (data.message) message = data.message;
    } catch { /* réponse sans corps JSON */ }
    throw new Error(message);
  }
  return response.json();
}

// --- SEO / GEO (pipeline d'articles) ---------------------------------
export function adminGetSeoConfig(auth) {
  return request('/admin/seo/config', { auth });
}

export function adminUpdateSeoConfig(auth, agentEnabled) {
  return request('/admin/seo/config', { method: 'PATCH', auth, body: { agent_enabled: agentEnabled } });
}

export function adminListSeoKeywords(auth) {
  return request('/admin/seo/keywords', { auth });
}

export function adminCreateSeoKeyword(auth, keyword) {
  return request('/admin/seo/keywords', { method: 'POST', auth, body: { keyword } });
}

export function adminDeleteSeoKeyword(auth, id) {
  return request(`/admin/seo/keywords/${id}`, { method: 'DELETE', auth });
}

export function adminRetrySeoKeyword(auth, id) {
  return request(`/admin/seo/keywords/${id}/retry`, { method: 'POST', auth });
}

export function adminListSeoArticles(auth) {
  return request('/admin/seo/articles', { auth });
}

// Détail complet (corps Markdown) pour la prévisualisation
export function adminGetSeoArticle(auth, id) {
  return request(`/admin/seo/articles/${id}`, { auth });
}

// Valider / rejeter / mettre en attente, ou déplacer publish_at
export function adminUpdateSeoArticle(auth, id, { status, publishAt } = {}) {
  const body = {};
  if (status !== undefined) body.status = status;
  if (publishAt !== undefined) body.publish_at = publishAt;
  return request(`/admin/seo/articles/${id}`, { method: 'PATCH', auth, body });
}

export function adminListSeoRuns(auth) {
  return request('/admin/seo/runs', { auth });
}

// Bouton « Lancer l'agent » : dépose une demande de run pour l'orchestrateur
export function adminLaunchSeoRun(auth) {
  return request('/admin/seo/runs/launch', { method: 'POST', auth });
}

// --- Blog public (articles SEO publiés) ------------------------------
export function getPublishedBlogArticles() {
  return request('/blog/articles');
}

export function getPublishedBlogArticle(slug) {
  return request(`/blog/articles/${encodeURIComponent(slug)}`);
}

// Publication immédiate d'un article SEO (sans attendre le run planifié)
export function adminPublishSeoArticleNow(auth, id) {
  return request(`/admin/seo/articles/${id}/publish`, { method: 'POST', auth });
}

// Suggestions de mots-clés d'un pilier (phase recherche → sélection manuelle)
export function adminListSeoSuggestions(auth, keywordId) {
  return request(`/admin/seo/keywords/${keywordId}/suggestions`, { auth });
}

// Sélection / désélection d'un mot-clé proposé (status: selected | suggested)
export function adminUpdateSeoSuggestion(auth, id, status) {
  return request(`/admin/seo/suggestions/${id}`, { method: 'PATCH', auth, body: { status } });
}

// --- CRM (kanban de suivi des prospects) ------------------------------
export function adminListCrmContacts(auth) {
  return request('/admin/crm/contacts', { auth });
}

export function adminCreateCrmContact(auth, payload) {
  return request('/admin/crm/contacts', { method: 'POST', auth, body: payload });
}

// Mise à jour d'une fiche — un changement de stage trace l'historique
export function adminUpdateCrmContact(auth, id, payload) {
  return request(`/admin/crm/contacts/${id}`, { method: 'PATCH', auth, body: payload });
}

export function adminDeleteCrmContact(auth, id) {
  return request(`/admin/crm/contacts/${id}`, { method: 'DELETE', auth });
}

export function adminListCrmActivities(auth, contactId) {
  return request(`/admin/crm/contacts/${contactId}/activities`, { auth });
}

export function adminCreateCrmActivity(auth, contactId, { type, content }) {
  return request(`/admin/crm/contacts/${contactId}/activities`, {
    method: 'POST', auth, body: { type, content },
  });
}

export function adminDeleteCrmActivity(auth, id) {
  return request(`/admin/crm/activities/${id}`, { method: 'DELETE', auth });
}
