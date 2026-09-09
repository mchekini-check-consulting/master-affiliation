import React from 'react';

// Système de design du site (grammaire « Onlineformapro » adaptée à la marque
// Hi-Tech Academy) : bandes pleine largeur alternées clair/sombre, titres
// géants centrés dont un mot-clé est coloré, slash ambre en signature, nav et
// boutons en pilules. Les couleurs restent celles de la marque (encre, teal,
// ambre) pour la cohérence avec le logo et les documents Qualiopi.

export const INK = '#06071f';        // bandes sombres (héro, footer, CTA)
export const NAVY = '#001a4a';       // titres sur fond clair
export const TEAL = '#005064';       // couleur de marque
export const CYAN = '#00a8c8';       // début du gradient de mot-clé
export const ACCENT = '#F8B102';     // ambre : CTA, tags, slash (rôle du rouge OFP)
export const BODY = '#5a6478';       // texte courant sur fond clair
export const BODY_DARK = '#aab3d0';  // texte courant sur fond sombre
export const LINE = '#e6eaf4';       // filets et bordures

export const headingFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
export const bodyFont = { fontFamily: "'Inter', sans-serif" };

// Dégradé appliqué au mot-clé des titres (équivalent du rose→violet OFP)
export const KEYWORD_GRADIENT = `linear-gradient(92deg, ${CYAN}, #35c9a3 55%, ${ACCENT})`;

/** Mot-clé coloré d'un titre : gradient sur fond sombre, teal sur fond clair. */
export function Hi({ children, dark = false }) {
  if (dark) {
    return (
      <span
        style={{
          background: KEYWORD_GRADIENT,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}>
        {children}
      </span>
    );
  }
  return <span style={{ color: TEAL }}>{children}</span>;
}

/** Slash ambre en signature, posé devant les titres alignés à gauche. */
export function Slash() {
  return (
    <span
      aria-hidden="true"
      className="inline-block mr-4 rounded-sm"
      style={{
        width: '0.62em',
        height: '0.16em',
        background: ACCENT,
        transform: 'rotate(-55deg) translateY(-0.28em)',
        transformOrigin: 'center',
      }}
    />
  );
}

/**
 * Titre de section : très grand, très gras, centré par défaut.
 * `kicker` : sur-titre en majuscules espacées. `dark` : variante fond sombre.
 * `slash` : signature ambre (pour les titres alignés à gauche).
 */
export function SectionHeading({ kicker, children, sub, dark = false, align = 'center', slash = false }) {
  const alignClass = align === 'left' ? 'text-left' : 'text-center';
  return (
    <div className={`${alignClass} mb-12 sm:mb-14`}>
      {kicker && (
        <span
          className="inline-block text-[11px] font-extrabold uppercase tracking-[0.3em] mb-4"
          style={{ color: dark ? ACCENT : TEAL, ...headingFont }}>
          {kicker}
        </span>
      )}
      <h2
        className="text-3xl sm:text-4xl lg:text-[3.25rem] font-extrabold leading-[1.15] tracking-tight"
        style={{ color: dark ? 'white' : NAVY, ...headingFont }}>
        {slash && <Slash />}
        {children}
      </h2>
      {sub && (
        <p
          className={`${align === 'left' ? '' : 'mx-auto'} max-w-2xl text-base leading-relaxed mt-5`}
          style={{ color: dark ? BODY_DARK : BODY, ...bodyFont }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/** Bouton pilule principal (ambre) ou secondaire (contour). */
export function Pill({ as: Tag = 'a', dark = false, variant = 'primary', className = '', style = {}, children, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-extrabold text-[13px] uppercase tracking-wider transition-all duration-200 hover:opacity-90 hover:shadow-lg';
  const styles =
    variant === 'primary'
      ? { background: ACCENT, color: '#0b0b0b' }
      : dark
        ? { background: 'transparent', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)' }
        : { background: 'white', color: TEAL, border: `1.5px solid ${TEAL}` };
  return (
    <Tag className={`${base} ${className}`} style={{ ...styles, ...headingFont, ...style }} {...props}>
      {children}
    </Tag>
  );
}

/** Fond « starfield » des bandes sombres (points lumineux discrets). */
export function Starfield() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          radial-gradient(1.5px 1.5px at 12% 28%, rgba(255,255,255,0.5) 0, transparent 100%),
          radial-gradient(1px 1px at 26% 68%, rgba(255,255,255,0.35) 0, transparent 100%),
          radial-gradient(1.5px 1.5px at 38% 18%, rgba(160,220,255,0.4) 0, transparent 100%),
          radial-gradient(1px 1px at 52% 82%, rgba(255,255,255,0.3) 0, transparent 100%),
          radial-gradient(2px 2px at 64% 34%, rgba(255,255,255,0.35) 0, transparent 100%),
          radial-gradient(1px 1px at 78% 62%, rgba(160,220,255,0.35) 0, transparent 100%),
          radial-gradient(1.5px 1.5px at 88% 22%, rgba(255,255,255,0.4) 0, transparent 100%),
          radial-gradient(1px 1px at 8% 84%, rgba(255,255,255,0.25) 0, transparent 100%),
          radial-gradient(1px 1px at 94% 88%, rgba(255,255,255,0.3) 0, transparent 100%),
          radial-gradient(ellipse 70% 55% at 50% -10%, rgba(0,80,100,0.55) 0, transparent 100%)
        `,
      }}
    />
  );
}
