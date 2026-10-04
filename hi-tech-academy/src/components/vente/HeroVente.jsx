import React from 'react';
import { Check } from '@phosphor-icons/react';
import PrimaryButton from '@/components/ui/primary-button';
import { headingFont, serifFont, bodyFont } from '@/components/design';

/**
 * Héro plein écran : photo en fond, voile plein de la couleur de la formation,
 * nom de la formation en très gros et en gras à gauche, accroche dessous, carte
 * d'information (prix, faits clés, actions) à droite. La base reprend celle du héro de l'accueil (classe
 * `.vente-hero` dans index.css : arc, inclinaison, ombre interne).
 *
 * `titre`   : nom court de la formation, c'est le <h1>. L'accroche publicitaire
 *             (`accroche`) le suit en sous-titre.
 * `couleur` : { fond, accent, trait } — propre à chaque formation (ventes.js).
 * `carte`   : le nœud <CarteHero /> rendu dans la colonne droite.
 * `heroRef` : la page s'en sert pour afficher la barre CTA quand le héro sort.
 */
export default function HeroVente({ heroRef, formation, titre, accroche, sousTitre, image, imagePosition = 'center', alt, facts, inscriptionTo, couleur, carte }) {
  // Les garanties sont rendues à deux endroits, un seul visible à la fois :
  // sous le texte à partir de 640 px, sous la carte en dessous. Sur mobile
  // elles repoussaient le prix et le bouton d'un demi-écran.
  const garanties = (className) => (
    <ul className={`${className} gap-x-8 gap-y-3 sm:gap-y-2 pt-6`} style={{ borderTop: `1px solid ${couleur.trait}` }}>
      {facts.map((f) => (
        <li key={f} className="flex items-start gap-3 text-body-base sm:text-body-sm font-medium sm:font-medium text-white" style={bodyFont}>
          <Check weight="bold" className="sm:hidden w-4 h-4 mt-1 shrink-0" style={{ color: couleur.accent }} />
          {f}
        </li>
      ))}
    </ul>
  );

  return (
    <div ref={heroRef} className="vente-hero" style={{ '--vente-fond': couleur.fond }}>
      {image && (
        <img
          src={image}
          alt={alt}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
          // Le héro est bien plus large et bas que la plupart des photos
          // fournies (jusqu'à ~2,3:1) : `object-cover` zoome donc fortement
          // pour remplir le cadre, et un centrage par défaut coupe le sujet
          // symétriquement en haut et en bas. `imagePosition` (ventes.js,
          // `preuves.hero.position`) cadre vers la partie qui doit rester
          // visible plutôt que de subir un recadrage centré.
          style={{ objectPosition: imagePosition }}
        />
      )}
      {/* Voile : la photo reste lisible en fond, le texte reste blanc pur dessus.
          Sous 1024 px il s'allège (0,8) pour que la photo porte le héro : même
          sur une zone blanche de la photo, le blanc du texte garde un contraste
          supérieur à 4,5:1. */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 ${image ? 'opacity-[0.8] lg:opacity-[0.84]' : ''}`}
        style={{ background: couleur.fond }}
      />

      <div className="relative z-[1] max-w-site mx-auto px-4 sm:px-6 pt-28 sm:pt-44 pb-14 sm:pb-28">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_420px] gap-6 sm:gap-12 lg:gap-16 items-end lg:items-stretch">
          <div className="min-w-0">
            <p className="text-body-sm font-semibold mb-4 sm:mb-5" style={{ color: couleur.accent, ...headingFont }}>
              {formation.tag}
            </p>

            <h1
              className="font-serif-display text-white max-w-[18ch] [text-wrap:balance]"
              style={{ fontSize: 'clamp(36px, 4.2vw, 60px)', lineHeight: 1.08, letterSpacing: '-0.02em', fontWeight: 700, ...serifFont }}>
              {titre}
            </h1>

            <p className="font-serif-display text-h3 text-white mt-4 sm:mt-5 max-w-[32ch]" style={serifFont}>
              {accroche}
            </p>

            <p className="text-body-base sm:text-body-lg leading-[1.55] sm:leading-[1.55] mt-5 sm:mt-6 max-w-measure text-white" style={bodyFont}>
              {sousTitre}
            </p>

            {/* Masqué sous 640 px : la carte, empilée juste dessous, porte déjà
                le même bouton à côté du prix. */}
            <div className="hidden sm:flex flex-wrap items-center gap-x-7 gap-y-4 mt-9">
              <PrimaryButton to={inscriptionTo} size="lg" inverted style={{ color: couleur.fond }}>Demander une inscription</PrimaryButton>
            </div>

            {garanties('hidden sm:flex flex-row flex-wrap mt-10')}
          </div>

          <div className="w-full">
            {carte}
            {/* Sous 640 px : une garantie par ligne, cochée dans l'accent de la formation. */}
            {garanties('flex sm:hidden flex-col mt-8')}
          </div>
        </div>
      </div>
    </div>
  );
}
