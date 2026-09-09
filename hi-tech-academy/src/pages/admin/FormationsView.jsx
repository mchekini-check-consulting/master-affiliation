import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Users } from 'lucide-react';
import { adminListRegistrations } from '@/api/backend';
import { formations } from '@/data/formations';
import { Badge, ViewHeader, bodyFont, headingFont } from './common';

// Catalogue des formations en tableau, avec statistiques des demandes reçues.
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

  const factOf = (formation, label) =>
    formation.keyFacts.find((f) => f.label === label)?.value ?? '—';

  return (
    <div>
      <ViewHeader
        title="Formations"
        subtitle={`${formations.length} formation${formations.length > 1 ? 's' : ''} au catalogue`} />

      <div className="rounded-2xl overflow-x-auto" style={{ background: 'white', border: '1px solid #e0e8f4' }}>
        <table className="w-full text-left" style={{ minWidth: 920 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e0e8f4' }}>
              {['Formation', 'Durée', 'Tarif', 'Demandes', 'En attente', 'Validées', 'Refusées', 'Certificats', ''].map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-[11px] uppercase tracking-wide font-semibold whitespace-nowrap"
                  style={{ color: '#6b7a9b', ...headingFont }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {formations.map((formation) => {
              const s = stats.get(formation.id);
              return (
                <tr key={formation.id} style={{ borderBottom: '1px solid #f0f3fa' }}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={formation.image}
                        alt={formation.title}
                        className="w-11 h-11 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold" style={{ color: '#001a4a', ...headingFont }}>
                          {formation.title}
                        </p>
                        <p className="text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>
                          {formation.tag} · {formation.version}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: '#001a4a', ...bodyFont }}>
                    {factOf(formation, 'Durée').split(' — ')[0]}
                  </td>
                  <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: '#001a4a', ...bodyFont }}>
                    {factOf(formation, 'Tarif').split(' / ')[0].split(' — ')[0]}
                  </td>
                  <td className="px-4 py-3.5"><Badge tone="info">{s?.total ?? 0}</Badge></td>
                  <td className="px-4 py-3.5"><Badge tone="warning">{s?.pending ?? 0}</Badge></td>
                  <td className="px-4 py-3.5"><Badge tone="success">{s?.validated ?? 0}</Badge></td>
                  <td className="px-4 py-3.5"><Badge>{s?.refused ?? 0}</Badge></td>
                  <td className="px-4 py-3.5"><Badge>{s?.certificates ?? 0}</Badge></td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => onOpenRequests(formation.id)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold"
                        style={{ color: '#005064', ...headingFont }}>
                        <Users className="w-4 h-4" />
                        Demandes
                      </button>
                      <a
                        href={formation.pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold"
                        style={{ color: '#005064', ...headingFont }}>
                        <FileText className="w-4 h-4" />
                        PDF
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}

            {orphanStats.map((s) => (
              <tr key={s.formationId} style={{ borderBottom: '1px solid #f0f3fa', background: '#fdf9ef' }}>
                <td className="px-4 py-3.5">
                  <p className="text-sm font-semibold" style={{ color: '#001a4a', ...headingFont }}>{s.title}</p>
                  <p className="text-xs" style={{ color: '#8a5a00', ...bodyFont }}>Formation hors catalogue</p>
                </td>
                <td className="px-4 py-3.5 text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>—</td>
                <td className="px-4 py-3.5 text-xs" style={{ color: '#6b7a9b', ...bodyFont }}>—</td>
                <td className="px-4 py-3.5"><Badge tone="info">{s.total}</Badge></td>
                <td className="px-4 py-3.5"><Badge tone="warning">{s.pending}</Badge></td>
                <td className="px-4 py-3.5"><Badge tone="success">{s.validated}</Badge></td>
                <td className="px-4 py-3.5"><Badge>{s.refused}</Badge></td>
                <td className="px-4 py-3.5"><Badge>{s.certificates}</Badge></td>
                <td className="px-4 py-3.5">
                  <button
                    type="button"
                    onClick={() => onOpenRequests(s.formationId)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: '#005064', ...headingFont }}>
                    <Users className="w-4 h-4" />
                    Demandes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
