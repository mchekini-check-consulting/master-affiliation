import React from 'react';
import { Link } from 'react-router-dom';
import PrimaryButton from '@/components/ui/primary-button';
import { TEAL, MINT_LIGHT, LINE, BODY, BODY_MUTED, headingFont, serifFont, bodyFont } from '@/components/design';
import { CheckLine, RADIUS } from './atomes';

/**
 * Carte d'information du héro (colonne droite) : tout ce qu'un visiteur venu
 * d'une publicité doit savoir avant de s'engager — le prix en premier, puis
 * durée, format, session, effectif, sanction — et les deux actions.
 * `facts` : [{ icon, label, valeur, detail }]. `couleur` : celle de la formation.
 */
export default function CarteHero({ prixHT, mentionTTC, facts, inscriptionTo, couleur, reassurances }) {
  return (
    <div
      className="bg-white overflow-hidden w-full"
      style={{ borderRadius: RADIUS, boxShadow: '0 18px 40px -20px rgba(0,12,91,.28)' }}>
      <div className="px-6 pt-5 pb-4" style={{ background: MINT_LIGHT, borderBottom: `1px solid ${LINE}` }}>
        <p className="text-body-sm font-semibold" style={{ color: BODY_MUTED, ...headingFont }}>Tarif par stagiaire</p>
        <p className="flex items-baseline gap-2 mt-1">
          <span className="font-serif-display tabular-nums" style={{ fontSize: 36, lineHeight: 1, letterSpacing: '-0.02em', color: '#243037', ...serifFont }}>{prixHT}</span>
          <span className="text-body-base font-bold" style={{ color: BODY_MUTED, ...headingFont }}>HT</span>
        </p>
        {mentionTTC && (
          <p className="text-body-sm mt-2" style={{ color: BODY_MUTED, ...bodyFont }}>{mentionTTC} · prise en charge OPCO possible</p>
        )}
      </div>

      {/* Faits clés en mosaïque 2 × 2 : une pastille d'icône, le libellé en
          petit, la valeur en gras. Compact, et l'œil accroche l'icône avant le
          texte. */}
      <dl className="grid grid-cols-2 gap-px" style={{ background: LINE }}>
        {facts.map(({ icon: Icon, label, valeur, detail }) => (
          <div key={label} className="bg-white flex items-start gap-3 px-5 py-3.5">
            <span
              className="inline-flex items-center justify-center shrink-0 w-8 h-8"
              style={{ borderRadius: RADIUS, background: MINT_LIGHT }}>
              <Icon className="w-4 h-4" style={{ color: TEAL }} />
            </span>
            <div className="min-w-0">
              <dt className="text-caption leading-tight" style={{ color: BODY_MUTED, ...bodyFont }}>{label}</dt>
              <dd className="text-body-sm font-semibold leading-snug mt-0.5" style={{ color: BODY, ...headingFont }}>
                {valeur}
                {detail && <span className="block text-caption font-normal truncate" style={{ color: BODY_MUTED, ...bodyFont }}>{detail}</span>}
              </dd>
            </div>
          </div>
        ))}
      </dl>

      <div className="px-6 pt-5 pb-5" style={{ borderTop: `1px solid ${LINE}` }}>
        <PrimaryButton href="#devis" className="w-full" style={{ background: couleur.fond }}>Recevoir un devis</PrimaryButton>
        <Link
          to={inscriptionTo}
          className="mt-3 w-full inline-flex items-center justify-center h-11 rounded-full text-body-sm font-semibold transition-colors hover:bg-[#f0f7ff]"
          style={{ color: '#243037', border: `1px solid ${LINE}`, ...headingFont }}>
          Demander une inscription
        </Link>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5">
          {reassurances.map((r) => <li key={r}><CheckLine className="text-body-sm">{r}</CheckLine></li>)}
        </ul>
      </div>
    </div>
  );
}
