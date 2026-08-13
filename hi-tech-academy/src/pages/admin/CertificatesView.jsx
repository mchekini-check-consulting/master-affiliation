import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Award, CheckCircle2, Download, Eye, RefreshCw, Send, X } from 'lucide-react';
import {
  adminArchiveCertificatePdf, adminIssueCertificate, adminListCertificates, adminListRegistrations,
  adminSendCertificate,
} from '@/api/backend';
import { certificatePdfBase64, certificatePdfBlobUrl, downloadCertificatePdf } from '@/lib/certificatePdf';
import PdfViewer from './PdfViewer';
import {
  APPLICANT_LABELS, Badge, Card, EmptyState, ViewHeader,
  bodyFont, formatDate, formatDay, headingFont,
} from './common';

// Archive la copie du PDF côté serveur (sans email) pour qu'elle parte dans
// les sauvegardes — silencieux : la visualisation ne doit pas échouer si
// l'archivage rate (il se refera à la prochaine ouverture).
function archiveCertificatePdf(auth, certificate) {
  adminArchiveCertificatePdf(auth, certificate.id, certificatePdfBase64(certificate)).catch(() => {});
}

// Formulaire d'émission (dates de session + durée) pour une demande validée.
function IssueForm({ auth, registration, onClose, onIssued }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hours, setHours] = useState('7');
  const [attendedHours, setAttendedHours] = useState('7');
  // Note QCM : récupérée automatiquement de l'évaluation finale si passée,
  // saisie manuelle sinon ; mise en pratique toujours saisie (partie B)
  const qcmAuto = registration.final_evaluation_score !== null && registration.final_evaluation_score !== undefined;
  const [qcmScore, setQcmScore] = useState(qcmAuto ? String(registration.final_evaluation_score) : '');
  const [practicalScore, setPracticalScore] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const total = qcmScore !== '' && practicalScore !== ''
    ? Number(qcmScore) + Number(practicalScore)
    : null;

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const certificate = await adminIssueCertificate(auth, registration.id, {
        session_start_date: startDate,
        session_end_date: endDate || startDate,
        duration_hours: Number(hours),
        attended_hours: Number(attendedHours),
        qcm_score: qcmAuto ? null : Number(qcmScore),
        practical_score: Number(practicalScore),
      });
      downloadCertificatePdf(certificate);
      archiveCertificatePdf(auth, certificate);
      onIssued();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-[#005064]';
  const inputStyle = { borderColor: '#e0e8f4', color: '#001a4a', ...bodyFont };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,26,74,0.35)' }}>
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: 'white', border: '1px solid #e0e8f4' }}>
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-base" style={{ color: '#001a4a', ...headingFont }}>
            Émettre le certificat de réalisation
          </h3>
          <button type="button" onClick={onClose} aria-label="Fermer">
            <X className="w-5 h-5" style={{ color: '#6b7a9b' }} />
          </button>
        </div>
        <p className="text-sm mb-5" style={{ color: '#6b7a9b', ...bodyFont }}>
          {registration.first_name} {registration.last_name} — {registration.formation_title}
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-semibold mb-1.5" style={{ color: '#002d74', ...headingFont }}>
                Début de session <span style={{ color: '#c2410c' }}>*</span>
              </span>
              <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className={inputClass} style={inputStyle} />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold mb-1.5" style={{ color: '#002d74', ...headingFont }}>
                Fin de session
              </span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className={inputClass} style={inputStyle} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-semibold mb-1.5" style={{ color: '#002d74', ...headingFont }}>
                Durée de la formation (h) <span style={{ color: '#c2410c' }}>*</span>
              </span>
              <input type="number" min="1" required value={hours} onChange={(e) => setHours(e.target.value)}
                className={inputClass} style={inputStyle} />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold mb-1.5" style={{ color: '#002d74', ...headingFont }}>
                Durée réalisée par l'apprenant (h) <span style={{ color: '#c2410c' }}>*</span>
              </span>
              <input
                type="number" min="1" max={hours || undefined} required value={attendedHours}
                onChange={(e) => setAttendedHours(e.target.value)}
                className={inputClass} style={inputStyle} />
              <span className="block text-[11px] mt-1" style={{ color: '#6b7a9b', ...bodyFont }}>
                Assiduité constatée (émargements, rapports de connexion)
              </span>
            </label>
          </div>

          {/* Évaluation des acquis (grille : QCM /10 + mise en pratique /10) */}
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-semibold mb-1.5" style={{ color: '#002d74', ...headingFont }}>
                QCM d'évaluation finale / 10 <span style={{ color: '#c2410c' }}>*</span>
              </span>
              <input
                type="number" min="0" max="10" required value={qcmScore}
                onChange={(e) => setQcmScore(e.target.value)}
                disabled={qcmAuto}
                className={`${inputClass} disabled:opacity-70`} style={inputStyle} />
              <span className="block text-[11px] mt-1" style={{ color: qcmAuto ? '#116632' : '#8a5a00', ...bodyFont }}>
                {qcmAuto ? '✓ Récupérée automatiquement du QCM passé en ligne' : 'QCM non passé en ligne : saisir la note'}
              </span>
            </label>
            <label className="block">
              <span className="block text-xs font-semibold mb-1.5" style={{ color: '#002d74', ...headingFont }}>
                Mise en pratique / 10 <span style={{ color: '#c2410c' }}>*</span>
              </span>
              <input
                type="number" min="0" max="10" required value={practicalScore}
                onChange={(e) => setPracticalScore(e.target.value)}
                className={inputClass} style={inputStyle} />
              <span className="block text-[11px] mt-1" style={{ color: '#6b7a9b', ...bodyFont }}>
                Partie B évaluée par le formateur (5+3+2 points)
              </span>
            </label>
          </div>

          {total !== null && (
            <p
              className="text-sm rounded-xl px-4 py-3 font-semibold"
              style={{
                background: total >= 12 ? '#e5f6ec' : '#fdecec',
                color: total >= 12 ? '#116632' : '#a12626',
                ...headingFont,
              }}>
              Total : {total} / 20 — objectifs {total >= 12 ? 'ATTEINTS' : 'NON ATTEINTS'} (seuil 60 %)
            </p>
          )}
        </div>

        {error && (
          <p className="text-xs mt-4 rounded-xl px-4 py-3" style={{ background: '#fdecec', color: '#a12626', ...bodyFont }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-5 py-3 rounded-xl font-bold text-sm disabled:opacity-50"
          style={{ background: '#005064', color: 'white', ...headingFont }}>
          {submitting ? 'Émission…' : 'Émettre et télécharger le PDF'}
        </button>
      </form>
    </div>
  );
}

export default function CertificatesView({ auth }) {
  const [certificates, setCertificates] = useState(null);
  const [registrations, setRegistrations] = useState(null);
  const [error, setError] = useState(null);
  const [issueFor, setIssueFor] = useState(null);
  const [viewerCert, setViewerCert] = useState(null); // certificat affiché dans la visionneuse
  const [reloadKey, setReloadKey] = useState(0);
  const [sendingCertId, setSendingCertId] = useState(null); // envoi email en cours
  const [sentCertIds, setSentCertIds] = useState(() => new Set()); // envoyés avec succès

  // Envoi du certificat (PDF généré ici) à l'apprenant par email
  const sendCert = async (c) => {
    setSendingCertId(c.id);
    setError(null);
    try {
      await adminSendCertificate(auth, c.id, certificatePdfBase64(c));
      setSentCertIds((prev) => new Set(prev).add(c.id));
    } catch (e) {
      setError(e.message);
    } finally {
      setSendingCertId(null);
    }
  };

  const load = useCallback(() => {
    setError(null);
    Promise.all([adminListCertificates(auth), adminListRegistrations(auth)])
      .then(([certs, regs]) => {
        setCertificates(certs);
        setRegistrations(regs);
      })
      .catch((e) => setError(e.message));
  }, [auth]);

  useEffect(load, [load, reloadKey]);

  // Demandes validées qui n'ont pas encore de certificat
  const eligible = useMemo(
    () => (registrations ?? []).filter((r) => r.status === 'VALIDATED' && !r.has_certificate),
    [registrations]
  );

  if (error) return <p className="text-sm" style={{ color: '#a12626', ...bodyFont }}>{error}</p>;
  if (!certificates || !registrations) {
    return <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>Chargement…</p>;
  }

  return (
    <div>
      <ViewHeader
        title="Certificats de réalisation"
        subtitle={`${certificates.length} certificat${certificates.length > 1 ? 's' : ''} émis — ${eligible.length} demande${eligible.length > 1 ? 's' : ''} validée${eligible.length > 1 ? 's' : ''} en attente de certificat`}
        actions={
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: '#005064', ...headingFont }}>
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        } />

      <Card title="À émettre (demandes validées)" className="mb-6">
        {eligible.length === 0 ? (
          <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>
            Toutes les demandes validées ont leur certificat.
          </p>
        ) : (
          <div className="space-y-3">
            {eligible.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3"
                style={{ background: '#f7f9fd', border: '1px solid #e0e8f4' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#001a4a', ...headingFont }}>
                    {r.first_name} {r.last_name}
                    {r.company_name ? ` — ${r.company_name}` : ''}
                  </p>
                  <p className="text-xs mb-1.5" style={{ color: '#6b7a9b', ...bodyFont }}>
                    {r.formation_title} · {APPLICANT_LABELS[r.applicant_type]} · validée
                  </p>
                  {r.final_evaluation_score !== null && r.final_evaluation_score !== undefined ? (
                    <Badge tone="success">QCM passé — {r.final_evaluation_score}/{r.final_evaluation_max_score}</Badge>
                  ) : (
                    <Badge tone="warning">QCM d'évaluation finale non passé</Badge>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIssueFor(r)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
                  style={{ background: '#005064', color: 'white', ...headingFont }}>
                  <Award className="w-4 h-4" />
                  Émettre le certificat
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {certificates.length === 0 ? (
        <EmptyState>Aucun certificat émis pour le moment.</EmptyState>
      ) : (
        <div className="rounded-2xl overflow-x-auto" style={{ background: 'white', border: '1px solid #e0e8f4' }}>
          <table className="w-full text-left" style={{ minWidth: 720 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e0e8f4' }}>
                {['Émis le', 'Apprenant', 'Formation', 'Session', 'Résultat', ''].map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-[11px] uppercase tracking-wide font-semibold"
                    style={{ color: '#6b7a9b', ...headingFont }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {certificates.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f0f3fa' }}>
                  <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: '#6b7a9b', ...bodyFont }}>
                    {formatDate(c.issued_at)}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-semibold" style={{ color: '#001a4a', ...headingFont }}>
                      {c.first_name} {c.last_name}
                    </p>
                    <p className="text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>
                      {c.company_name || c.email}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: '#001a4a', ...bodyFont }}>
                    {c.formation_title}
                  </td>
                  <td className="px-4 py-3.5 text-sm whitespace-nowrap" style={{ color: '#001a4a', ...bodyFont }}>
                    {c.session_start_date === c.session_end_date
                      ? formatDay(c.session_start_date)
                      : `${formatDay(c.session_start_date)} → ${formatDay(c.session_end_date)}`}
                    {c.attended_hours != null && (
                      <span className="block text-xs" style={{ color: '#6b7a9b' }}>
                        {c.attended_hours}/{c.duration_hours} h réalisées
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {c.total_score !== null && c.total_score !== undefined ? (
                      <span className="inline-flex items-center gap-1.5 flex-wrap">
                        <Badge tone="info">{c.total_score}/20</Badge>
                        <Badge tone={c.objectives_achieved ? 'success' : 'warning'}>
                          {c.objectives_achieved ? 'Objectifs atteints' : 'Non atteints'}
                        </Badge>
                      </span>
                    ) : (
                      <Badge tone="info">{c.duration_hours} h</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setViewerCert(c);
                          archiveCertificatePdf(auth, c);
                        }}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold"
                        style={{ color: '#005064', ...headingFont }}>
                        <Eye className="w-4 h-4" />
                        Visualiser
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          downloadCertificatePdf(c);
                          archiveCertificatePdf(auth, c);
                        }}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold"
                        style={{ color: '#005064', ...headingFont }}>
                        <Download className="w-4 h-4" />
                        Télécharger
                      </button>
                      {sentCertIds.has(c.id) ? (
                        <span
                          className="inline-flex items-center gap-1.5 text-sm font-semibold"
                          style={{ color: '#116632', ...headingFont }}>
                          <CheckCircle2 className="w-4 h-4" />
                          Envoyé
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={sendingCertId === c.id}
                          onClick={() => sendCert(c)}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold disabled:opacity-50"
                          style={{ color: '#005064', ...headingFont }}>
                          <Send className="w-4 h-4" />
                          {sendingCertId === c.id ? 'Envoi…' : "Envoyer à l'apprenant"}
                        </button>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {issueFor && (
        <IssueForm
          auth={auth}
          registration={issueFor}
          onClose={() => setIssueFor(null)}
          onIssued={() => {
            setIssueFor(null);
            setReloadKey((k) => k + 1);
          }} />
      )}

      {viewerCert && (
        <PdfViewer
          title={`Certificat de réalisation — ${viewerCert.first_name} ${viewerCert.last_name}`}
          url={certificatePdfBlobUrl(viewerCert)}
          onDownload={() => downloadCertificatePdf(viewerCert)}
          onClose={() => setViewerCert(null)} />
      )}
    </div>
  );
}
