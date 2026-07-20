import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { adminGetComplaint, adminListComplaints, adminUpdateComplaint } from '@/api/backend';
import { Badge, Card, EmptyState, Field, ViewHeader, bodyFont, formatDate, headingFont } from './common';

const COMPLAINANT_LABELS = {
  COMPANY: 'Entreprise',
  INDEPENDENT: 'Indépendant',
  INDIVIDUAL: 'Particulier',
};

const STATUS_META = {
  RECEIVED: { label: 'Reçue', background: '#fdf3e2', color: '#8a5a00' },
  IN_PROGRESS: { label: 'En cours', background: '#eaf1fb', color: '#1c4e80' },
  CLOSED: { label: 'Traitée', background: '#e5f6ec', color: '#116632' },
};

const STATUS_OPTIONS = [
  { key: 'RECEIVED', label: 'Reçue' },
  { key: 'IN_PROGRESS', label: 'En cours de traitement' },
  { key: 'CLOSED', label: 'Traitée / clôturée' },
];

function ComplaintStatusBadge({ status }) {
  const meta = STATUS_META[status] ?? { label: status, background: '#f0f3fa', color: '#6b7a9b' };
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: meta.background, color: meta.color, ...headingFont }}>
      {meta.label}
    </span>
  );
}

// --- Détail d'une réclamation ----------------------------------------
function ComplaintDetail({ auth, id, onBack, onChanged }) {
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('RECEIVED');
  const [response, setResponse] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    adminGetComplaint(auth, id)
      .then((d) => {
        setDetail(d);
        setStatus(d.status);
        setResponse(d.response ?? '');
      })
      .catch((e) => setError(e.message));
  }, [auth, id]);

  useEffect(load, [load]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await adminUpdateComplaint(auth, id, { status, response: response.trim() || null });
      setDetail(updated);
      onChanged?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (error && !detail) return <p className="text-sm" style={{ color: '#a12626', ...bodyFont }}>{error}</p>;
  if (!detail) return <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>Chargement…</p>;

  const dirty = status !== detail.status || (response.trim() || null) !== (detail.response || null);

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold mb-5"
        style={{ color: '#005064', ...headingFont }}>
        <ArrowLeft className="w-4 h-4" />
        Retour aux réclamations
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#001a4a', ...headingFont }}>
            Réclamation — {detail.first_name} {detail.last_name}
            {detail.company_name ? ` (${detail.company_name})` : ''}
          </h2>
          <p className="text-sm mt-1" style={{ color: '#6b7a9b', ...bodyFont }}>
            {COMPLAINANT_LABELS[detail.complainant_type]} · Déposée le {formatDate(detail.created_at)} ·
            Formation : <strong>{detail.formation_title}</strong>
          </p>
        </div>
        <ComplaintStatusBadge status={detail.status} />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Card title="Réclamant">
          <div className="space-y-3">
            <Field label="Type" value={COMPLAINANT_LABELS[detail.complainant_type]} />
            <Field label="Entreprise" value={detail.company_name} />
            <Field label="Prénom" value={detail.first_name} />
            <Field label="Nom" value={detail.last_name} />
            <Field label="Adresse email" value={detail.email} />
            <Field label="Formation concernée" value={detail.formation_title} />
          </div>
        </Card>

        <Card title="Message de la réclamation">
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#001a4a', ...bodyFont }}>
            {detail.message}
          </p>
        </Card>

        <Card title="Traitement" className="md:col-span-2">
          <div className="space-y-4">
            {detail.handled_at && (
              <Field label="Pris en charge le" value={formatDate(detail.handled_at)} />
            )}
            <div>
              <span className="block text-xs font-semibold mb-2" style={{ color: '#002d74', ...headingFont }}>Statut</span>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStatus(key)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      border: status === key ? '1.5px solid #005064' : '1px solid #e0e8f4',
                      background: status === key ? '#f0f3fa' : 'white',
                      color: status === key ? '#005064' : '#6b7a9b',
                      ...headingFont,
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="block text-xs font-semibold mb-1.5" style={{ color: '#002d74', ...headingFont }}>
                Réponse / actions correctives (note interne)
              </span>
              <textarea
                rows={4}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Analyse, réponse apportée au réclamant, actions correctives engagées…"
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#005064]"
                style={{ borderColor: '#e0e8f4', color: '#001a4a', ...bodyFont }} />
            </label>
            {error && (
              <p className="text-xs rounded-xl px-4 py-3" style={{ background: '#fdecec', color: '#a12626', ...bodyFont }}>{error}</p>
            )}
            <button
              type="button"
              onClick={save}
              disabled={!dirty || saving}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#005064', color: 'white', ...headingFont }}>
              {saving ? 'Enregistrement…' : 'Enregistrer le traitement'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// --- Liste des réclamations ------------------------------------------
export default function ComplaintsView({ auth }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(() => {
    setError(null);
    adminListComplaints(auth).then(setItems).catch((e) => setError(e.message));
  }, [auth]);

  useEffect(load, [load, reloadKey]);

  const openCount = useMemo(
    () => (items ?? []).filter((i) => i.status !== 'CLOSED').length,
    [items]
  );

  if (selectedId) {
    return (
      <ComplaintDetail
        auth={auth}
        id={selectedId}
        onBack={() => setSelectedId(null)}
        onChanged={() => setReloadKey((k) => k + 1)} />
    );
  }

  if (error) return <p className="text-sm" style={{ color: '#a12626', ...bodyFont }}>{error}</p>;
  if (!items) return <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>Chargement…</p>;

  return (
    <div>
      <ViewHeader
        title="Réclamations"
        subtitle={`${items.length} réclamation${items.length > 1 ? 's' : ''} — ${openCount} à traiter`}
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

      {items.length === 0 ? (
        <EmptyState>Aucune réclamation reçue pour le moment.</EmptyState>
      ) : (
        <div className="rounded-2xl overflow-x-auto" style={{ background: 'white', border: '1px solid #e0e8f4' }}>
          <table className="w-full text-left" style={{ minWidth: 720 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e0e8f4' }}>
                {['Date', 'Réclamant', 'Type', 'Formation', 'Statut'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[11px] uppercase tracking-wide font-semibold"
                    style={{ color: '#6b7a9b', ...headingFont }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className="cursor-pointer transition-colors hover:bg-[#f7f9fd]"
                  style={{ borderBottom: '1px solid #f0f3fa' }}>
                  <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: '#6b7a9b', ...bodyFont }}>
                    {formatDate(item.created_at)}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-semibold" style={{ color: '#001a4a', ...headingFont }}>
                      {item.first_name} {item.last_name}
                    </p>
                    {item.company_name && (
                      <p className="text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>{item.company_name}</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: '#001a4a', ...bodyFont }}>
                    {COMPLAINANT_LABELS[item.complainant_type]}
                  </td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: '#001a4a', ...bodyFont }}>
                    {item.formation_title}
                  </td>
                  <td className="px-4 py-3.5">
                    <ComplaintStatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
