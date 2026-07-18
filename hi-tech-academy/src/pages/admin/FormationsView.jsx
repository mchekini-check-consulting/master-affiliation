import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Users } from 'lucide-react';
import { adminListRegistrations } from '@/api/backend';
import { formations } from '@/data/formations';
import { Badge, Card, ViewHeader, bodyFont, headingFont } from './common';

// Catalogue des formations avec statistiques des demandes reçues.
export default function FormationsView({ auth, onOpenRequests }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminListRegistrations(auth).then(setItems).catch((e) => setError(e.message));
  }, [auth]);

  // Statistiques par formation (y compris d'éventuelles formations retirées
  // du catalogue mais encore présentes dans les demandes en base).
  const stats = useMemo(() => {
    const byId = new Map();
    for (const r of items ?? []) {
      const entry = byId.get(r.formation_id) ?? {
        formationId: r.formation_id,
        title: r.formation_title,
        total: 0, pending: 0, validated: 0, refused: 0, answered: 0, certificates: 0,
      };
      entry.total += 1;
      if (r.status === 'PENDING') entry.pending += 1;
      if (r.status === 'VALIDATED') entry.validated += 1;
      if (r.status === 'REFUSED') entry.refused += 1;
      if (r.has_needs_analysis) entry.answered += 1;
      if (r.has_certificate) entry.certificates += 1;
      byId.set(r.formation_id, entry);
    }
    return byId;
  }, [items]);

  if (error) return <p className="text-sm" style={{ color: '#a12626', ...bodyFont }}>{error}</p>;
  if (!items) return <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>Chargement…</p>;

  const catalogIds = new Set(formations.map((f) => f.id));
  const orphanStats = [...stats.values()].filter((s) => !catalogIds.has(s.formationId));

  return (
    <div>
      <ViewHeader
        title="Formations"
        subtitle={`${formations.length} formation${formations.length > 1 ? 's' : ''} au catalogue`} />

      <div className="grid lg:grid-cols-2 gap-5">
        {formations.map((formation) => {
          const s = stats.get(formation.id);
          return (
            <Card key={formation.id}>
              <div className="flex gap-4">
                <img
                  src={formation.image}
                  alt={formation.title}
                  className="w-24 h-24 rounded-xl object-cover shrink-0" />
                <div className="min-w-0">
                  <Badge tone="info">{formation.tag}</Badge>
                  <h3 className="font-bold text-base mt-2" style={{ color: '#001a4a', ...headingFont }}>
                    {formation.title}
                  </h3>
                  <p className="text-xs mt-1" style={{ color: '#6b7a9b', ...bodyFont }}>
                    {formation.version}
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-1.5">
                {formation.keyFacts.slice(0, 3).map(({ label, value }) => (
                  <li key={label} className="text-xs" style={{ color: '#0f2e2f', ...bodyFont }}>
                    <strong style={headingFont}>{label} :</strong> {value}
                  </li>
                ))}
              </ul>

              <div className="mt-4 pt-4 flex flex-wrap items-center gap-2" style={{ borderTop: '1px solid #f0f3fa' }}>
                <Badge tone="info">{s?.total ?? 0} demande{(s?.total ?? 0) > 1 ? 's' : ''}</Badge>
                <Badge tone="warning">{s?.pending ?? 0} en attente</Badge>
                <Badge tone="success">{s?.validated ?? 0} validée{(s?.validated ?? 0) > 1 ? 's' : ''}</Badge>
                <Badge>{s?.refused ?? 0} refusée{(s?.refused ?? 0) > 1 ? 's' : ''}</Badge>
                <Badge>{s?.certificates ?? 0} certificat{(s?.certificates ?? 0) > 1 ? 's' : ''}</Badge>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <button
                  type="button"
                  onClick={onOpenRequests}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: '#005064', ...headingFont }}>
                  <Users className="w-4 h-4" />
                  Voir les demandes
                </button>
                <a
                  href={formation.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: '#005064', ...headingFont }}>
                  <FileText className="w-4 h-4" />
                  Programme (PDF)
                </a>
              </div>
            </Card>
          );
        })}
      </div>

      {orphanStats.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold text-sm mb-3" style={{ color: '#001a4a', ...headingFont }}>
            Demandes sur des formations hors catalogue
          </h3>
          <div className="grid lg:grid-cols-2 gap-5">
            {orphanStats.map((s) => (
              <Card key={s.formationId} title={s.title}>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="info">{s.total} demande{s.total > 1 ? 's' : ''}</Badge>
                  <Badge tone="warning">{s.pending} en attente</Badge>
                  <Badge tone="success">{s.validated} validée{s.validated > 1 ? 's' : ''}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
