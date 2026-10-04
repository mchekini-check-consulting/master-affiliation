import React, { useRef } from 'react';
import PrimaryButton from '@/components/ui/primary-button';
import { LINE, BODY_MUTED, headingFont, bodyFont } from '@/components/design';
import { useBottomBar } from '@/hooks/use-bottom-bar';

/**
 * Barre d'action fixe en bas d'écran, à toutes les largeurs : prix + devis
 * (+ inscription sur desktop). Elle glisse hors champ tant que le héro — qui
 * porte déjà le CTA — est visible.
 */
export default function BarreCta({ visible, prixHT, resume, inscriptionTo }) {
  const ref = useRef(null);
  useBottomBar(ref, visible);

  return (
    <div
      ref={ref}
      data-bottom-bar
      className={`fixed inset-x-0 bottom-0 bg-white transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      style={{ zIndex: 'var(--z-bottom-bar)', borderTop: `1px solid ${LINE}`, boxShadow: '0 -8px 24px rgba(0,45,116,.10)' }}>
      {/* Le padding bas absorbe la zone réservée par l'iPhone (barre d'accueil). */}
      <div
        className="max-w-site mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 pt-3"
        style={{ paddingBottom: 'calc(0.75rem + var(--safe-bottom))' }}>
        <span className="min-w-0">
          <span className="block text-body-base font-bold leading-tight tabular-nums" style={{ color: '#243037', ...headingFont }}>
            {prixHT} <span className="text-caption font-semibold" style={{ color: BODY_MUTED }}>HT</span>
          </span>
          <span className="block text-caption leading-snug truncate" style={{ color: BODY_MUTED, ...bodyFont }}>{resume}</span>
        </span>
        {/* Libellé court sous 640 px : le libellé complet passait sur deux
            lignes et tronquait le résumé. Seul le résumé cède de la place. */}
        <span className="flex items-center gap-5 shrink-0">
          <PrimaryButton to={inscriptionTo} size="sm">
            <span className="sm:hidden">S'inscrire</span>
            <span className="hidden sm:inline">Demander une inscription</span>
          </PrimaryButton>
        </span>
      </div>
    </div>
  );
}
