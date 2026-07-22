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

export function getPositioningTestContent() {
  return request('/registrations/positioning-test');
}

export function submitPositioningTest(id, payload) {
  return request(`/registrations/${id}/positioning-test`, { method: 'POST', body: payload });
}

export function submitTraineePositioningTest(id, traineeId, payload) {
  return request(`/registrations/${id}/trainees/${traineeId}/positioning-test`, { method: 'POST', body: payload });
}

export function getFinalEvaluationContent() {
  return request('/registrations/final-evaluation');
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
