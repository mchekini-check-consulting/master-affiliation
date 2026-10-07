import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import PrimaryButton from '@/components/ui/primary-button';
import { LINE, BODY_MUTED, headingFont, bodyFont } from '@/components/design';
import { useBottomBar } from '@/hooks/use-bottom-bar';

/**
 * Barre d'action fixe en bas d'écran, à toutes les largeurs : prix + appel
 * découverte (+ lien inscription sur desktop). Elle glisse hors champ tant que
 * le héro — qui porte déjà le CTA — est visible.
 */
export default function BarreCta({ visible, prixHT, resume, inscriptionTo, rdvAction }) {
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
          <span className="block text-caption leading-snug truncate" style={{ color: BODY_MUTED, ...bodyFont }}>
            {resume}
            {/* La mention financement ne tient pas sous 640 px : le résumé doit
                rester entier (voir elements-fixes.spec.js). */}
            <span className="hidden sm:inline"> · Finançable jusqu'à 100 %</span>
          </span>
        </span>
        {/* Libellé court sous 640 px : le libellé complet passait sur deux
            lignes et tronquait le résumé. Seul le résumé cède de la place. */}
        <span className="flex items-center gap-5 shrink-0">
          <Link
            to={inscriptionTo}
            className="hidden sm:inline-flex items-center min-h-[44px] text-body-sm font-semibold underline underline-offset-4"
            style={{ color: '#243037', ...headingFont }}>
            Demander une inscription
          </Link>
          {/* Libellé court sous 640 px : « Réserver un appel » tronquait le
              résumé à 320 px (voir elements-fixes.spec.js). */}
          <PrimaryButton {...rdvAction} size="sm">
            <span className="sm:hidden">Appel gratuit</span>
            <span className="hidden sm:inline">Réserver mon appel gratuit</span>
          </PrimaryButton>
        </span>
      </div>
    </div>
  );
}
