import React from 'react';
import PrimaryButton from '@/components/ui/primary-button';
import { headingFont, serifFont, bodyFont } from '@/components/design';

/**
 * Héro plein écran : photo en fond, voile plein de la couleur de la formation,
 * accroche en très gros à gauche, carte d'information (prix, faits clés,
 * actions) à droite. La base reprend celle du héro de l'accueil (classe
 * `.vente-hero` dans index.css : arc, inclinaison, ombre interne).
 *
 * `couleur` : { fond, accent, trait } — propre à chaque formation (ventes.js).
 * `carte`   : le nœud <CarteHero /> rendu dans la colonne droite.
 * `heroRef` : la page s'en sert pour afficher la barre CTA quand le héro sort.
 */
export default function HeroVente({ heroRef, formation, accroche, sousTitre, image, imagePosition = 'center', alt, facts, inscriptionTo, couleur, carte }) {
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
      {/* Voile : la photo reste lisible en fond, le texte reste blanc pur dessus. */}
      <div aria-hidden="true" className="absolute inset-0" style={{ background: couleur.fond, opacity: image ? 0.84 : 1 }} />

      <div className="relative z-[1] max-w-site mx-auto px-4 sm:px-6 pt-36 sm:pt-44 pb-20 sm:pb-28">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_420px] gap-12 lg:gap-16 items-end">
          <div className="min-w-0">
            <p className="text-body-sm font-semibold mb-5" style={{ color: couleur.accent, ...headingFont }}>
              {formation.tag} : {formation.title}
            </p>

            <h1
              className="font-serif-display text-white max-w-[16ch]"
              style={{ fontSize: 'clamp(36px, 4.2vw, 60px)', lineHeight: 1.08, letterSpacing: '-0.02em', ...serifFont }}>
              {accroche}
            </h1>

            <p className="text-body-lg leading-[1.55] mt-6 max-w-measure text-white" style={bodyFont}>
              {sousTitre}
            </p>

            <div className="flex flex-wrap items-center gap-x-7 gap-y-4 mt-9">
              <PrimaryButton to={inscriptionTo} size="lg" inverted style={{ color: couleur.fond }}>Demander une inscription</PrimaryButton>
            </div>

            <ul className="flex flex-wrap gap-x-8 gap-y-2 mt-10 pt-6" style={{ borderTop: `1px solid ${couleur.trait}` }}>
              {facts.map((f) => (
                <li key={f} className="text-body-sm font-medium text-white" style={bodyFont}>{f}</li>
              ))}
            </ul>
          </div>

          <div className="w-full">{carte}</div>
        </div>
      </div>
    </div>
  );
}
