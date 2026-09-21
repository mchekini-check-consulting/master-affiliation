import React from 'react';
import { Check, Image as ImageIcon, Minus, Plus } from '@phosphor-icons/react';
import { NAVY, TEAL, MINT, MINT_LIGHT, LINE, BODY, BODY_MUTED, headingFont, serifFont, bodyFont } from '@/components/design';

// Atomes de la page de vente (src/components/vente), style éditorial sombre.
// Deux formes seulement : un rectangle à 8 px de rayon pour les surfaces, une
// pilule pour ce qui se clique. Aplats pleins, filets francs, pas de dégradé
// décoratif, pas d'ombre flottante, pas d'emoji, pas d'étiquette en capitales
// espacées — ce sont les tics des pages générées.

export const RADIUS = 8;

/**
 * Bande pleine largeur : c'est l'unité de rythme de la page. `tone` fixe le
 * fond ('white' | 'pale' | 'navy'), le contenu reste dans `max-w-site`.
 * `flush` retire le padding vertical pour les bandes qui posent une photo
 * bord à bord.
 */
export function Bande({ id, tone = 'white', children, flush = false, className = '' }) {
  const fonds = { white: '#ffffff', pale: MINT_LIGHT, navy: NAVY };
  return (
    <section
      id={id}
      style={{ background: fonds[tone], scrollMarginTop: 96 }}
      className={`${flush ? '' : 'py-16 sm:py-24'} ${className}`}>
      {flush ? children : <div className="max-w-site mx-auto px-4 sm:px-6">{children}</div>}
    </section>
  );
}

/** Titre de section : sur-titre en bas de casse, titre DM Sans, chapô optionnel. */
export function SectionTitle({ kicker, children, sub, dark = false, className = '' }) {
  return (
    <div className={`mb-8 sm:mb-10 ${className}`}>
      {kicker && (
        <p className="text-body-sm font-semibold mb-3" style={{ color: dark ? MINT : TEAL, ...headingFont }}>
          {kicker}
        </p>
      )}
      <h2 className="font-serif-display text-h1 max-w-[22ch]" style={{ color: dark ? '#ffffff' : '#243037', ...serifFont }}>
        {children}
      </h2>
      {sub && (
        <p className="text-body-lg leading-[1.6] mt-4 max-w-measure" style={{ color: dark ? '#dbebff' : BODY_MUTED, ...bodyFont }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/** Pastille d'icône carrée à coins arrondis. */
export function IconTile({ icon: Icon, size = 44, dark = false }) {
  if (!Icon) return null;
  return (
    <span
      className="inline-flex items-center justify-center shrink-0"
      style={{
        width: size, height: size, borderRadius: RADIUS,
        background: dark ? '#002d74' : MINT_LIGHT,
        border: dark ? 'none' : `1px solid ${LINE}`,
      }}>
      <Icon style={{ width: size * 0.45, height: size * 0.45, color: dark ? MINT : TEAL }} />
    </span>
  );
}

/** Ligne « ✓ argument ». */
export function CheckLine({ children, dark = false, className = '' }) {
  return (
    <span className={`inline-flex items-start gap-3 text-body-base leading-[1.5] ${className}`} style={{ color: dark ? '#dbebff' : BODY_MUTED, ...bodyFont }}>
      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: dark ? MINT : TEAL }} />
      <span>{children}</span>
    </span>
  );
}

/** Ligne dépliable : titre + « + / − ». Sert à la FAQ. */
export function Fold({ title, children, open, onToggle, dark = false }) {
  return (
    <div style={{ borderBottom: `1px solid ${dark ? '#002d74' : LINE}` }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center gap-4 text-left py-5 min-h-[56px]">
        <span className="flex-1 font-semibold text-h4 leading-snug" style={{ color: dark ? '#ffffff' : BODY, ...headingFont }}>
          {title}
        </span>
        {open
          ? <Minus className="w-5 h-5 shrink-0" style={{ color: dark ? MINT : TEAL }} />
          : <Plus className="w-5 h-5 shrink-0" style={{ color: dark ? MINT : BODY_MUTED }} />}
      </button>
      {open && children && <div className="pb-6 max-w-measure">{children}</div>}
    </div>
  );
}

/**
 * Emplacement photo. Avec `src`, l'image en `cover` ; sans, un aplat discret —
 * jamais un faux visuel. `priority` charge tout de suite (héro).
 */
export function ZonePhoto({ src, alt = '', ratio = '16 / 10', className = '', priority = false, style = {}, dark = false }) {
  return (
    <figure
      className={`relative overflow-hidden m-0 ${className}`}
      style={{
        aspectRatio: ratio, borderRadius: RADIUS,
        background: dark ? '#002d74' : MINT_LIGHT,
        border: dark ? 'none' : `1px solid ${LINE}`,
        ...style,
      }}>
      {src ? (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
          <ImageIcon className="w-8 h-8" style={{ color: MINT }} />
        </span>
      )}
    </figure>
  );
}

/** Photo d'ambiance bord à bord dans une colonne : remplit la hauteur du parent. */
export function PhotoColonne({ src, alt = '', className = '', minHeight = 320 }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ minHeight, background: '#002d74' }}>
      {src && <img src={src} alt={alt} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />}
    </div>
  );
}
