import React from 'react';
import { headingFont, serifFont, bodyFont } from '@/components/design';

/**
 * Héro des pages intérieures (Contact, À propos) : même base que le héro de
 * la page formation (classe `.vente-hero` : aplat #002d74, arc en pied,
 * ombre interne), sans photo ni carte. Le header doit être rendu en
 * `embedded` au-dessus, comme sur l'accueil.
 *
 * `kicker`   : sur-titre en #9cbdff (accent sur fond sombre).
 * `title`    : H1 ; un <span> à l'intérieur passe en #9cbdff.
 * `intro`    : chapô, limité à ~68 caractères par ligne.
 * `children` : rangée facultative sous le chapô (faits, liens directs).
 */
export default function PageHero({ kicker, title, intro, children }) {
  return (
    <div className="vente-hero page-hero">
      <div className="relative z-[1] max-w-site mx-auto px-4 sm:px-6 pt-36 sm:pt-44 pb-16 sm:pb-24">
        {kicker && (
          <p className="text-body-sm font-semibold mb-5" style={{ color: '#9cbdff', ...headingFont }}>
            {kicker}
          </p>
        )}
        <h1
          className="font-serif-display text-white max-w-[20ch]"
          style={{ fontSize: 'clamp(36px, 4.2vw, 60px)', lineHeight: 1.08, letterSpacing: '-0.02em', ...serifFont }}>
          {title}
        </h1>
        {intro && (
          <p className="text-body-lg leading-[1.55] mt-6 max-w-measure" style={{ color: '#dbebff', ...bodyFont }}>
            {intro}
          </p>
        )}
        {children && <div className="mt-10">{children}</div>}
      </div>
    </div>
  );
}
