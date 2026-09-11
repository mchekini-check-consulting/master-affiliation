import React from 'react';

// Système de design du site public — thème « École » : palette vert forêt /
// menthe, dégradés doux du vert au blanc, grands titres serif
// (Source Serif 4), pilules très arrondies. Les noms d'exports sont conservés
// d'une itération à l'autre pour ne pas casser les composants ; seules les
// valeurs changent. L'admin n'utilise pas ce fichier et reste inchangé.

export const INK = '#00382c';        // bandes sombres : vert forêt profond
export const NAVY = '#004c3c';       // titres et textes forts (vert forêt)
export const TEAL = '#007f64';       // vert de marque (liens, icônes)
export const CYAN = '#00d1a5';       // émeraude vif (formes, accents)
export const ACCENT = '#004c3c';     // vert forêt : CTA principaux (pilules)
export const BODY = '#1f2124';       // texte courant sur fond clair
export const BODY_DARK = '#d6efe4';  // texte courant sur fond sombre
export const LINE = '#e5e5e5';       // filets et bordures
export const MINT = '#dff7ec';       // fonds menthe (cartes, tags)
export const MINT_LIGHT = '#eafff6'; // menthe très pâle (surfaces)

export const headingFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
export const serifFont = { fontFamily: "'Source Serif 4', Georgia, serif" };
export const bodyFont = { fontFamily: "'Roboto', 'Inter', sans-serif" };

// Dégradés signature du thème (du vert au blanc, pointe de bleu pâle)
export const HERO_GRADIENT = 'linear-gradient(115deg, #9ff0cf 0%, #dff7ec 28%, #ffffff 55%, #ffffff 68%, #cce2ff 100%)';
export const GREEN_BAND_GRADIENT = 'linear-gradient(135deg, #bff4e8 0%, #dff7ec 45%, #ffffff 100%)';
export const KEYWORD_GRADIENT = 'linear-gradient(92deg, #007f64, #00d1a5)';

/** Mot-clé coloré d'un titre : vert de marque (dégradé léger sur fond sombre). */
export function Hi({ children, dark = false }) {
  if (dark) {
    return <span style={{ color: '#7fe6c3' }}>{children}</span>;
  }
  return <span style={{ color: TEAL }}>{children}</span>;
}

/** Petit marqueur de kicker « • Le programme » façon pastille menthe. */
export function Slash() {
  return (
    <span
      aria-hidden="true"
      className="inline-block mr-2 rounded-full"
      style={{ width: '0.35em', height: '0.35em', background: CYAN, verticalAlign: 'middle' }}
    />
  );
}

/**
 * Titre de section : serif, grand, centré par défaut.
 * `kicker` : pastille menthe « • Sur-titre ». `dark` : variante fond sombre.
 */
export function SectionHeading({ kicker, children, sub, dark = false, align = 'center', slash = false }) {
  const alignClass = align === 'left' ? 'text-left' : 'text-center';
  return (
    <div className={`${alignClass} mb-12 sm:mb-14`}>
      {kicker && (
        <span
          className="inline-flex items-center gap-1.5 text-[12px] font-bold px-3.5 py-1.5 rounded-full mb-5"
          style={{
            background: dark ? 'rgba(255,255,255,0.12)' : MINT,
            color: dark ? '#bff4e8' : NAVY,
            ...headingFont,
          }}>
          <Slash />
          {kicker}
        </span>
      )}
      <h2
        className="font-serif-display text-3xl sm:text-4xl lg:text-[3rem] font-bold leading-[1.15]"
        style={{ color: dark ? 'white' : BODY, ...serifFont }}>
        {children}
      </h2>
      {sub && (
        <p
          className={`${align === 'left' ? '' : 'mx-auto'} max-w-2xl text-base leading-relaxed mt-5`}
          style={{ color: dark ? BODY_DARK : '#4b5563', ...bodyFont }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/**
 * Bouton pilule : primary et forest = vert forêt, secondary = contour.
 */
export function Pill({ as: Tag = 'a', dark = false, variant = 'primary', className = '', style = {}, children, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm transition-all duration-200 hover:opacity-90 hover:shadow-lg';
  const styles =
    variant === 'primary'
      ? { background: ACCENT, color: 'white' }
      : variant === 'forest'
        ? { background: NAVY, color: 'white' }
        : dark
          ? { background: 'transparent', color: 'white', border: '1.5px solid rgba(255,255,255,0.5)' }
          : { background: 'white', color: NAVY, border: `1.5px solid ${NAVY}` };
  return (
    <Tag className={`${base} ${className}`} style={{ ...styles, ...headingFont, ...style }} {...props}>
      {children}
    </Tag>
  );
}

/** Fond décoratif des bandes : halos organiques menthe/émeraude très doux. */
export function Starfield() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 45% 55% at 8% 12%, rgba(0,209,165,0.18) 0, transparent 70%),
          radial-gradient(ellipse 40% 50% at 92% 20%, rgba(191,244,232,0.14) 0, transparent 70%),
          radial-gradient(ellipse 55% 45% at 50% 100%, rgba(0,127,100,0.12) 0, transparent 70%)
        `,
      }}
    />
  );
}
