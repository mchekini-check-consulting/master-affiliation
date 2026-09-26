import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import PrimaryButton from '@/components/ui/primary-button';
import { headingFont, serifFont, bodyFont } from '@/components/design';

/**
 * « Pourquoi cette formation, pourquoi maintenant » — bande dans la couleur
 * de la formation. Les trois arguments différenciants (ventes.js,
 * `argumentsMarketing`) puis le levier d'urgence (`ctaUrgence`) et le CTA.
 * C'est le point de bascule de la page : après avoir vu le contenu, le
 * visiteur reçoit les raisons de ne pas remettre à plus tard.
 */
export default function Arguments({ arguments: args, urgence, projection, couleur, inscriptionTo }) {
  if (!args || args.length === 0) return null;

  return (
    <section id="pourquoi" className="py-16 sm:py-24" style={{ background: couleur.fond, scrollMarginTop: 96 }}>
      <div className="max-w-site mx-auto px-4 sm:px-6 text-white">
        <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 lg:gap-20 items-end pb-12 sm:pb-16" style={{ borderBottom: `1px solid ${couleur.trait}` }}>
          <div>
            <p className="text-body-sm font-semibold mb-3" style={{ color: couleur.accent, ...headingFont }}>Pourquoi cette formation</p>
            <h2 className="font-serif-display text-white max-w-[16ch]" style={{ fontSize: 'clamp(32px, 3.4vw, 48px)', lineHeight: 1.1, letterSpacing: '-0.02em', ...serifFont }}>
              Ce que vous ne trouverez pas dans un tutoriel
            </h2>
          </div>
          {projection && (
            <p className="text-body-lg leading-[1.6] max-w-measure lg:pb-2" style={bodyFont}>{projection}</p>
          )}
        </div>

        <ul className="grid md:grid-cols-3 gap-x-10 gap-y-8 pt-10 sm:pt-12">
          {args.map((a, i) => (
            <li key={a} className="pt-5" style={{ borderTop: `2px solid ${i === 0 ? couleur.accent : couleur.trait}` }}>
              <p className="text-h4 leading-[1.4] max-w-[30ch]" style={headingFont}>{a}</p>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-6 mt-14 sm:mt-20 p-8 sm:p-10" style={{ borderRadius: 8, background: couleur.trait }}>
          <p className="font-serif-display text-h2 max-w-[28ch]" style={serifFont}>{urgence}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <PrimaryButton to={inscriptionTo} size="lg" inverted style={{ color: couleur.fond }}>Demander une inscription</PrimaryButton>
            <Link to={inscriptionTo} className="inline-flex items-center gap-2 text-body-sm font-semibold text-white hover:underline" style={headingFont}>
              Je m'inscris directement <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
