import React from 'react';
import PrimaryButton from '@/components/ui/primary-button';
import { LINE, BODY_MUTED, headingFont, bodyFont } from '@/components/design';

/**
 * Barre d'action fixe en bas d'écran, à toutes les largeurs : prix + devis
 * (+ inscription sur desktop). Elle glisse hors champ tant que le héro — qui
 * porte déjà le CTA — est visible.
 */
export default function BarreCta({ visible, prixHT, resume, inscriptionTo }) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 bg-white transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      style={{ borderTop: `1px solid ${LINE}`, boxShadow: '0 -8px 24px rgba(0,45,116,.10)' }}>
      <div className="max-w-site mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 py-3">
        <span className="min-w-0">
          <span className="block text-body-base font-bold leading-tight tabular-nums" style={{ color: '#243037', ...headingFont }}>
            {prixHT} <span className="text-caption font-semibold" style={{ color: BODY_MUTED }}>HT</span>
          </span>
          <span className="block text-caption leading-snug truncate" style={{ color: BODY_MUTED, ...bodyFont }}>{resume}</span>
        </span>
        <span className="flex items-center gap-5">
          <PrimaryButton to={inscriptionTo} size="sm">Demander une inscription</PrimaryButton>
        </span>
      </div>
    </div>
  );
}
