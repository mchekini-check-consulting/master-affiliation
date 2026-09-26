import React from 'react';

// Système de design du site public — thème « École » : palette bleu marine,
// aplats francs du bleu au blanc, titres en DM Sans, corps
// et interface en Inter, pilules très arrondies. Les noms d'exports sont conservés
// d'une itération à l'autre pour ne pas casser les composants ; seules les
// valeurs changent. L'admin n'utilise pas ce fichier et reste inchangé.

// Palette de marque (4 couleurs identitaires) :
//   #002d74 (primaire) · #9cbdff (surfaces) · #0062e1 (accent) · #f0f7ff (fonds)
// + 2 paliers techniques dérivés du primaire, indispensables aux états et aux
//   filets (l'écart de luminance entre #002d74 et #9cbdff est trop grand pour
//   qu'un survol ou une bordure s'y loge) : #002d74 · #0066b0
export const INK = '#002d74';        // bandes sombres : primaire
export const NAVY = '#002d74';       // titres et textes forts (primaire)
export const TEAL = '#002d74';       // liens et icônes (6,9:1 sur blanc)
export const CYAN = '#0066b0';       // formes et accents décoratifs uniquement
export const ACCENT = '#002d74';     // bleu marine : CTA principaux (pilules)
export const LILAC = '#0062e1';      // accent : APLATS SEULEMENT, texte #ffffff
export const BODY = '#243037';       // texte courant sur fond clair
export const BODY_MUTED = '#5f6568'; // texte secondaire (gris neutre)
export const BODY_DARK = '#f0f7ff';  // texte courant sur fond sombre
export const LINE = '#dbebff';       // filets et bordures
export const MINT = '#9cbdff';       // fonds bleu clair (cartes, tags)
export const MINT_LIGHT = '#f0f7ff'; // bleu très pâle (surfaces)

// Duo typographique : DM Sans pour les TITRES, Inter pour le corps
// et toute l'interface. Les noms d'exports sont historiques et ne changent pas
// pour ne casser aucun composant : `serifFont` = police de titres (elle n'a
// plus rien d'une serif), `headingFont` = police d'interface (nav, boutons,
// badges), `bodyFont` = corps de texte. Préférer les variables CSS
// --font-heading / --font-body dans les feuilles de style.
export const headingFont = { fontFamily: "'Inter', sans-serif" };
export const serifFont = { fontFamily: "'DM Sans', sans-serif" };
export const bodyFont = { fontFamily: "'Inter', sans-serif" };

// Dégradés signature du thème : une seule diagonale, du vert menthe (haut
// gauche) vers le blanc (bas droite), pour finir sur la couleur de la section
// suivante sans rupture.
export const HERO_GRADIENT = 'linear-gradient(120deg, #9cbdff 0%, #dbebff 24%, #f0f7ff 48%, #ffffff 78%, #ffffff 100%)';
export const GREEN_BAND_GRADIENT = 'linear-gradient(135deg, #9cbdff 0%, #f0f7ff 45%, #ffffff 100%)';
export const KEYWORD_GRADIENT = 'linear-gradient(92deg, #002d74, #0066b0)';

/** Mot-clé coloré d'un titre : bleu de marque (accent sur fond sombre). */
export function Hi({ children, dark = false }) {
  if (dark) {
    return <span style={{ color: '#9cbdff' }}>{children}</span>;
  }
  return <span style={{ color: TEAL }}>{children}</span>;
}

/** Petit marqueur de kicker « • Le programme » façon pastille bleue. */
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
          className="inline-flex items-center gap-1.5 text-caption font-bold px-3.5 py-1.5 rounded-full mb-5"
          style={{
            background: dark ? 'rgba(255,255,255,0.12)' : MINT,
            color: dark ? '#9cbdff' : NAVY,
            ...headingFont,
          }}>
          <Slash />
          {kicker}
        </span>
      )}
      <h2
        className="font-serif-display text-hero"
        style={{ color: dark ? 'white' : BODY, ...serifFont }}>
        {children}
      </h2>
      {sub && (
        <p
          className={`${align === 'left' ? '' : 'mx-auto'} max-w-2xl text-base leading-relaxed mt-5`}
          style={{ color: dark ? BODY_DARK : BODY_MUTED, ...bodyFont }}>
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
  const base = 'inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm transition-all duration-200 hover:opacity-90';
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
          radial-gradient(ellipse 45% 55% at 8% 12%, rgba(79,154,130,0.18) 0, transparent 70%),
          radial-gradient(ellipse 40% 50% at 92% 20%, rgba(151,217,196,0.14) 0, transparent 70%),
          radial-gradient(ellipse 55% 45% at 50% 100%, rgba(29,101,81,0.12) 0, transparent 70%)
        `,
      }}
    />
  );
}
