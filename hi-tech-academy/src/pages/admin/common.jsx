import React from 'react';

// Éléments partagés par les vues de l'espace admin.

export const headingFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
export const bodyFont = { fontFamily: "'Inter', sans-serif" };

export const APPLICANT_LABELS = {
  COMPANY: 'Entreprise',
  INDEPENDENT: 'Indépendant',
  INDIVIDUAL: 'Particulier',
};

export const STATUS_META = {
  PENDING: { label: 'En attente', background: '#fdf3e2', color: '#8a5a00' },
  VALIDATED: { label: 'Validée', background: '#e5f6ec', color: '#116632' },
  REFUSED: { label: 'Refusée', background: '#fdecec', color: '#a12626' },
};

export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function formatDay(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? { label: status, background: '#f0f3fa', color: '#6b7a9b' };
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: meta.background, color: meta.color, ...headingFont }}>
      {meta.label}
    </span>
  );
}

export function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: { background: '#f0f3fa', color: '#6b7a9b' },
    info: { background: '#f0f3fa', color: '#005064' },
    success: { background: '#e5f6ec', color: '#116632' },
    warning: { background: '#fdf3e2', color: '#8a5a00' },
  };
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ ...tones[tone], ...headingFont }}>
      {children}
    </span>
  );
}

export function Field({ label, value }) {
  if (value === null || value === undefined || value === '' || value === false) return null;
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: '#6b7a9b', ...headingFont }}>{label}</p>
      <p className="text-sm" style={{ color: '#001a4a', ...bodyFont }}>{value === true ? 'Oui' : value}</p>
    </div>
  );
}

export function Card({ title, children, className = '' }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{ background: 'white', border: '1px solid #e0e8f4' }}>
      {title && <h3 className="font-bold text-sm mb-4" style={{ color: '#001a4a', ...headingFont }}>{title}</h3>}
      {children}
    </div>
  );
}

export function EmptyState({ children }) {
  return (
    <div className="rounded-2xl p-10 text-center" style={{ background: 'white', border: '1px solid #e0e8f4' }}>
      <p className="text-sm" style={{ color: '#6b7a9b', ...bodyFont }}>{children}</p>
    </div>
  );
}

export function ViewHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: '#001a4a', ...headingFont }}>{title}</h2>
        {subtitle && <p className="text-sm mt-1" style={{ color: '#6b7a9b', ...bodyFont }}>{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
