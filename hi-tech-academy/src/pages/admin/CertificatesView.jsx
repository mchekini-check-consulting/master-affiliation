import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Award, Download, RefreshCw, X } from 'lucide-react';
import { adminIssueCertificate, adminListCertificates, adminListRegistrations } from '@/api/backend';
import { downloadCertificatePdf } from '@/lib/certificatePdf';
import {
  APPLICANT_LABELS, Badge, Card, EmptyState, ViewHeader,
  bodyFont, formatDate, formatDay, headingFont,
} from './common';

// Formulaire d'émission (dates de session + durée) pour une demande validée.
function IssueForm({ auth, registration, onClose, onIssued }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hours, setHours] = useState('7');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const certificate = await adminIssueCertificate(auth, registration.id, {
        session_start_date: startDate,
        session_end_date: endDate || startDate,
        duration_hours: Number(hours),
      });
      downloadCertificatePdf(certificate);
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
          <label className="block">
            <span className="block text-xs font-semibold mb-1.5" style={{ color: '#002d74', ...headingFont }}>
              Durée réalisée (heures) <span style={{ color: '#c2410c' }}>*</span>
            </span>
            <input type="number" min="1" required value={hours} onChange={(e) => setHours(e.target.value)}
              className={inputClass} style={inputStyle} />
          </label>
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
  const [reloadKey, setReloadKey] = useState(0);

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
                  <p className="text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>
                    {r.formation_title} · {APPLICANT_LABELS[r.applicant_type]} · validée
                  </p>
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
                {['Émis le', 'Apprenant', 'Formation', 'Session', 'Durée', ''].map((h, i) => (
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
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge tone="info">{c.duration_hours} h</Badge>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => downloadCertificatePdf(c)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold"
                      style={{ color: '#005064', ...headingFont }}>
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
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
    </div>
  );
}
