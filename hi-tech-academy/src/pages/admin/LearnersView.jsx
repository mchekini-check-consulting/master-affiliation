import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';
import { adminListRegistrations } from '@/api/backend';
import {
  APPLICANT_LABELS, Badge, Card, EmptyState, Field, StatusBadge, ViewHeader,
  bodyFont, formatDate, headingFont,
} from './common';

// Regroupe les demandes par apprenant (adresse email).
function groupLearners(items) {
  const byEmail = new Map();
  for (const r of items) {
    const key = r.email.toLowerCase();
    const learner = byEmail.get(key) ?? { email: r.email, requests: [] };
    learner.requests.push(r);
    byEmail.set(key, learner);
  }
  return [...byEmail.values()]
    .map((l) => {
      const latest = l.requests.reduce((a, b) => (a.created_at > b.created_at ? a : b));
      const answered = l.requests.find((r) => r.has_needs_analysis);
      return {
        ...l,
        firstName: latest.first_name,
        lastName: latest.last_name,
        phone: latest.phone,
        companyName: latest.company_name,
        applicantType: latest.applicant_type,
        lastRequestAt: latest.created_at,
        score: answered?.needs_analysis_score ?? null,
        maxScore: answered?.needs_analysis_max_score ?? null,
      };
    })
    .sort((a, b) => (a.lastRequestAt < b.lastRequestAt ? 1 : -1));
}

function LearnerDetail({ learner, onBack, onOpenRequest }) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold mb-5"
        style={{ color: '#005064', ...headingFont }}>
        <ArrowLeft className="w-4 h-4" />
        Retour aux apprenants
      </button>

      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: '#001a4a', ...headingFont }}>
          {learner.firstName} {learner.lastName}
        </h2>
        <p className="text-sm mt-1" style={{ color: '#6b7a9b', ...bodyFont }}>
          {APPLICANT_LABELS[learner.applicantType]}
          {learner.companyName ? ` · ${learner.companyName}` : ''} · {learner.requests.length} demande{learner.requests.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-5">
        <Card title="Coordonnées">
          <div className="space-y-3">
            <Field label="Adresse email" value={learner.email} />
            <Field label="N° de téléphone" value={learner.phone} />
            <Field label="Entreprise" value={learner.companyName} />
          </div>
        </Card>
        <Card title="Questionnaire d'analyse du besoin">
          {learner.score !== null ? (
            <div
              className="rounded-xl px-4 py-3 text-sm font-bold inline-block"
              style={{ background: '#f0f3fa', color: '#005064', ...headingFont }}>
              Note de positionnement : {learner.score} / {learner.maxScore}
            </div>
          ) : (
            <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>
              Questionnaire non renseigné.
            </p>
          )}
          <p className="text-xs mt-3" style={{ color: '#6b7a9b', ...bodyFont }}>
            Le détail des réponses est visible en ouvrant la demande concernée.
          </p>
        </Card>
      </div>

      <Card title="Demandes d'inscription">
        <table className="w-full text-left">
          <thead>
            <tr style={{ borderBottom: '1px solid #e0e8f4' }}>
              {['Date', 'Formation', 'Questionnaire', 'Statut', ''].map((h, i) => (
                <th
                  key={i}
                  className="px-3 py-2 text-[11px] uppercase tracking-wide font-semibold"
                  style={{ color: '#6b7a9b', ...headingFont }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {learner.requests.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f0f3fa' }}>
                <td className="px-3 py-3 text-xs whitespace-nowrap" style={{ color: '#6b7a9b', ...bodyFont }}>
                  {formatDate(r.created_at)}
                </td>
                <td className="px-3 py-3 text-sm" style={{ color: '#001a4a', ...bodyFont }}>
                  {r.formation_title}
                </td>
                <td className="px-3 py-3">
                  {r.applicant_type === 'COMPANY' ? (
                    r.has_sponsor_survey ? (
                      <Badge tone="success">Commanditaire — répondu</Badge>
                    ) : (
                      <Badge>Non répondu</Badge>
                    )
                  ) : r.has_needs_analysis ? (
                    <Badge tone="success">Répondu — {r.needs_analysis_score}/{r.needs_analysis_max_score}</Badge>
                  ) : (
                    <Badge>Non répondu</Badge>
                  )}
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-3 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onOpenRequest(r.id)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: '#005064', ...headingFont }}>
                    <ExternalLink className="w-4 h-4" />
                    Ouvrir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default function LearnersView({ auth, onOpenRequest }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(() => {
    setError(null);
    adminListRegistrations(auth).then(setItems).catch((e) => setError(e.message));
  }, [auth]);

  useEffect(load, [load, reloadKey]);

  const learners = useMemo(() => groupLearners(items ?? []), [items]);

  if (error) return <p className="text-sm" style={{ color: '#a12626', ...bodyFont }}>{error}</p>;
  if (!items) return <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>Chargement…</p>;

  const selected = learners.find((l) => l.email.toLowerCase() === selectedEmail);
  if (selected) {
    return (
      <LearnerDetail
        learner={selected}
        onBack={() => setSelectedEmail(null)}
        onOpenRequest={onOpenRequest} />
    );
  }

  return (
    <div>
      <ViewHeader
        title="Dossiers apprenants"
        subtitle={`${learners.length} apprenant${learners.length > 1 ? 's' : ''} (regroupés par adresse email)`}
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

      {learners.length === 0 ? (
        <EmptyState>Aucun apprenant pour le moment.</EmptyState>
      ) : (
        <div className="rounded-2xl overflow-x-auto" style={{ background: 'white', border: '1px solid #e0e8f4' }}>
          <table className="w-full text-left" style={{ minWidth: 720 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e0e8f4' }}>
                {['Apprenant', 'Profil', 'Demandes', 'Note questionnaire', 'Dernière demande'].map((h) => (
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
              {learners.map((learner) => (
                <tr
                  key={learner.email}
                  onClick={() => setSelectedEmail(learner.email.toLowerCase())}
                  className="cursor-pointer transition-colors hover:bg-[#f7f9fd]"
                  style={{ borderBottom: '1px solid #f0f3fa' }}>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-semibold" style={{ color: '#001a4a', ...headingFont }}>
                      {learner.firstName} {learner.lastName}
                    </p>
                    <p className="text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>{learner.email}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: '#001a4a', ...bodyFont }}>
                    {APPLICANT_LABELS[learner.applicantType]}
                    {learner.companyName ? ` · ${learner.companyName}` : ''}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge tone="info">{learner.requests.length}</Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    {learner.score !== null ? (
                      <Badge tone="success">{learner.score}/{learner.maxScore}</Badge>
                    ) : learner.applicantType === 'COMPANY' ? (
                      <Badge tone="info">Commanditaire</Badge>
                    ) : (
                      <Badge>Non répondu</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: '#6b7a9b', ...bodyFont }}>
                    {formatDate(learner.lastRequestAt)}
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
