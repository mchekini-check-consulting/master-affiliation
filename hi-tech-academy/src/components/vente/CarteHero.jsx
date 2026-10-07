import React from 'react';
import { Link } from 'react-router-dom';
import PrimaryButton from '@/components/ui/primary-button';
import { TEAL, MINT_LIGHT, LINE, BODY, BODY_MUTED, headingFont, serifFont, bodyFont } from '@/components/design';
import { RADIUS } from './atomes';

/**
 * Carte d'information du héro (colonne droite), pensée comme la fiche d'un
 * programme universitaire : typographique, sans icône ni aplat décoratif. Le
 * prix HT et son équivalent TTC tiennent sur une ligne, le financement sur une
 * autre, les faits clés dans une grille 2 × 2 tracée par des filets, puis une
 * seule action.
 * `facts` : [{ label, valeur, detail }]. `couleur` : celle de la formation.
 *
 * À partir de 1024 px la carte prend toute la hauteur de la colonne de texte
 * (HeroVente étire la rangée) : c'est la grille des faits qui absorbe la
 * hauteur disponible, le prix et l'action restent ancrés en haut et en bas.
 *
 * Sous 640 px la carte ne sert qu'à convertir : prix, financement, bouton,
 * et seulement ensuite les faits, sans leurs précisions (elles sont dans la
 * fiche pratique de la section Tarif).
 */
export default function CarteHero({ prixHT, mentionTTC, facts, inscriptionTo, rdvAction, couleur, reassurances }) {
  return (
    <div
      className="bg-white overflow-hidden w-full h-full flex flex-col"
      // Filet dans l'accent : le fond de la formation se confondrait avec le héro.
      style={{ borderRadius: RADIUS, borderTop: `4px solid ${couleur.accent}`, boxShadow: '0 18px 40px -20px rgba(0,45,116,.28)' }}>
      <div className="order-1 px-4 sm:px-7 pt-4 sm:pt-7 pb-4 sm:pb-6">
        <p className="text-body-sm font-semibold" style={{ color: BODY_MUTED, ...headingFont }}>Tarif par stagiaire</p>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mt-2">
          <p className="flex items-baseline gap-2">
            <span
              className="font-serif-display tabular-nums text-[40px] sm:text-[48px]"
              style={{ lineHeight: 1, letterSpacing: '-0.02em', fontWeight: 700, color: '#243037', ...serifFont }}>
              {prixHT}
            </span>
            <span className="text-body-base font-semibold" style={{ color: BODY_MUTED, ...headingFont }}>HT</span>
          </p>
          {mentionTTC && (
            <p className="text-body-sm tabular-nums" style={{ color: BODY_MUTED, ...bodyFont }}>{mentionTTC}</p>
          )}
        </div>
      </div>

      {/* Financement : l'argument décisif a sa propre ligne, et mène à la
          section qui détaille qui paie selon le profil. */}
      <a
        href="#tarif"
        className="order-2 flex items-center justify-between gap-4 px-4 sm:px-7 min-h-[44px] sm:min-h-[48px] py-2 transition-colors hover:bg-[#dfedff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#002d74]"
        style={{ background: MINT_LIGHT, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
        <span className="text-body-sm font-semibold" style={{ color: BODY, ...headingFont }}>Finançable jusqu'à 100 % (OPCO, FAF)</span>
        {/* Libellé court sous 640 px : le libellé complet renvoyait la mention à la ligne. */}
        <span className="text-body-sm font-medium underline underline-offset-4 shrink-0" style={{ color: TEAL, ...bodyFont }}>
          <span className="sm:hidden">Détails</span>
          <span className="hidden sm:inline">Financements</span>
        </span>
      </a>

      {/* Grille 2 × 2 : le fond de la grille, visible dans la gouttière d'un
          pixel, trace les filets entre les cellules. `flex-1` + rangées égales :
          c'est elle qui s'étire quand la colonne de texte est plus haute. */}
      <dl className="order-4 sm:order-3 flex-1 grid grid-cols-2 auto-rows-fr gap-px" style={{ background: LINE }}>
        {facts.map(({ label, valeur, detail }) => (
          <div key={label} className="bg-white min-w-0 flex flex-col justify-center px-4 sm:px-7 py-3 sm:py-4">
            <dt className="text-caption sm:text-body-sm" style={{ color: BODY_MUTED, ...bodyFont }}>{label}</dt>
            <dd className="text-body-sm sm:text-body-base font-semibold leading-snug sm:leading-snug mt-0.5 sm:mt-1" style={{ color: BODY, ...headingFont }}>{valeur}</dd>
            {detail && (
              <dd className="hidden sm:block text-caption mt-1 [text-wrap:balance]" style={{ color: BODY_MUTED, ...bodyFont }}>{detail}</dd>
            )}
          </div>
        ))}
      </dl>

      <div className="order-3 sm:order-4 px-4 sm:px-7 pt-4 sm:pt-6 pb-4 sm:pb-6 border-b sm:border-b-0 sm:border-t" style={{ borderColor: LINE }}>
        <PrimaryButton {...rdvAction} size="lg" className="w-full px-4 sm:px-8" style={{ background: couleur.fond }}>Réserver mon appel gratuit</PrimaryButton>
        <p className="text-body-sm text-center mt-3 [text-wrap:balance]" style={{ color: BODY_MUTED, ...bodyFont }}>{reassurances.join(', ')}</p>
        <Link
          to={inscriptionTo}
          className="flex items-center justify-center w-full min-h-[44px] mt-1 text-body-sm font-medium underline underline-offset-4"
          style={{ color: TEAL, ...headingFont }}>
          Demander une inscription directement
        </Link>
      </div>
    </div>
  );
}
