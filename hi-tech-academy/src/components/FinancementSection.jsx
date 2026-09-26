import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from '@phosphor-icons/react';
import PrimaryButton from '@/components/ui/primary-button';
import { NAVY, TEAL, MINT, MINT_LIGHT, LINE, BODY, BODY_MUTED, headingFont, serifFont, bodyFont } from '@/components/design';

// Accueil — « Et si votre formation ne vous coûtait rien ? ». Le financement
// est l'objection n°1 ; on y répond par un mini-simulateur : le visiteur
// choisit sa situation, la réponse arrive en une phrase, avec le reste à
// charge possible et la prochaine action. Tout ce qui est affirmé ici est
// repris de la page /financements (OPCO, fonds d'assurance formation).

const SITUATIONS = [
  {
    key: 'salarie',
    label: 'Salarié',
    verdict: "Jusqu'à 100 % pris en charge",
    reste: 'Reste à charge possible : 0 €',
    texte: "Votre entreprise mobilise son plan de développement des compétences ; selon votre branche, l'OPCO finance tout ou partie de la formation et paie directement l'organisme, sans aucune avance de votre part.",
    etapes: ['Vous demandez un devis', "Nous fournissons devis, programme et convention à votre employeur", "L'OPCO instruit la prise en charge"],
  },
  {
    key: 'dirigeant',
    label: "Dirigeant d'entreprise",
    verdict: 'Formation finançable par votre entreprise',
    reste: 'Reste à charge selon votre enveloppe OPCO',
    texte: "Vous formez vos équipes (ou vous-même en tant que salarié de votre structure) sur le budget formation de l'entreprise, avec l'appui de votre OPCO. Nous montons le dossier avec vous.",
    etapes: ['Vous demandez un devis', 'Nous préparons le dossier au format de votre OPCO', 'La session est planifiée dès accord'],
  },
  {
    key: 'independant',
    label: 'Indépendant',
    verdict: 'Prise en charge par votre fonds de formation',
    reste: 'Plafond annuel selon le fonds (AGEFICE, FIF PL, FAFCEA)',
    texte: "Travailleur non salarié, vous cotisez à un fonds d'assurance formation qui rembourse tout ou partie du coût. Nous vous remettons chaque pièce demandée, à votre nom.",
    etapes: ['Vous demandez un devis', 'Nous fournissons devis, programme et convention', 'Vous déposez la demande auprès de votre fonds'],
  },
  {
    key: 'particulier',
    label: 'Particulier',
    verdict: 'Tarif TTC, sans frais cachés',
    reste: 'Paiement à la convention, délai de rétractation',
    texte: "Vous vous formez à titre personnel : le prix affiché est le prix final. Un devis et une convention vous sont remis avant tout engagement.",
    etapes: ['Vous demandez un devis', 'Nous validons ensemble la date et votre niveau', 'Vous signez la convention'],
  },
];

export default function FinancementSection() {
  const [situation, setSituation] = useState(SITUATIONS[0]);

  return (
    <section id="financement" className="py-20 sm:py-28 bg-white">
      <div className="max-w-site mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-20 items-start">
          {/* Promesse + sélecteur */}
          <div>
            <p className="text-body-sm font-semibold mb-3" style={{ color: TEAL, ...headingFont }}>Financement</p>
            <h2
              className="font-serif-display max-w-[15ch]"
              style={{ fontSize: 'clamp(36px, 4vw, 56px)', lineHeight: 1.05, letterSpacing: '-0.02em', color: '#243037', ...serifFont }}>
              Et si votre formation ne vous coûtait rien ?
            </h2>
            <p className="text-body-lg leading-[1.6] mt-6 max-w-[40ch]" style={{ color: BODY_MUTED, ...bodyFont }}>
              La plupart de nos participants ne paient pas leur formation eux-mêmes. Dites-nous qui vous
              êtes, on vous dit qui paie.
            </p>

            <div role="tablist" aria-label="Votre situation" className="grid grid-cols-2 gap-2 mt-8 max-w-[440px]">
              {SITUATIONS.map((s) => {
                const actif = s.key === situation.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    role="tab"
                    aria-selected={actif}
                    onClick={() => setSituation(s)}
                    className="h-12 px-4 rounded-full text-body-sm font-semibold text-left transition-colors"
                    style={{
                      background: actif ? NAVY : MINT_LIGHT,
                      color: actif ? '#ffffff' : BODY,
                      border: `1px solid ${actif ? NAVY : LINE}`,
                      ...headingFont,
                    }}>
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Verdict */}
          <div role="tabpanel" className="bg-white overflow-hidden" style={{ borderRadius: 8, border: `1px solid ${LINE}` }}>
            <div className="px-8 sm:px-10 pt-8 sm:pt-10 pb-7 text-white" style={{ background: NAVY }}>
              <p className="text-body-sm font-semibold" style={{ color: MINT, ...headingFont }}>Si vous êtes {situation.label.toLowerCase()}</p>
              <p className="font-serif-display text-white mt-2" style={{ fontSize: 'clamp(26px, 2.6vw, 36px)', lineHeight: 1.15, letterSpacing: '-0.015em', ...serifFont }}>
                {situation.verdict}
              </p>
              <p className="text-body-base mt-3" style={{ color: '#dbebff', ...bodyFont }}>{situation.reste}</p>
            </div>

            <div className="px-8 sm:px-10 py-8">
              <p className="text-body-base leading-[1.6] max-w-measure" style={{ color: BODY, ...bodyFont }}>{situation.texte}</p>
              <ol className="mt-6 space-y-2.5">
                {situation.etapes.map((e, i) => (
                  <li key={e} className="flex items-start gap-3 text-body-sm leading-[1.5]" style={{ color: BODY, ...bodyFont }}>
                    <span className="inline-flex items-center justify-center shrink-0 w-6 h-6 rounded-full" style={{ background: MINT_LIGHT }}>
                      <Check weight="bold" className="w-3.5 h-3.5" style={{ color: TEAL }} />
                    </span>
                    <span><span className="font-semibold" style={headingFont}>{i + 1}.</span> {e}</span>
                  </li>
                ))}
              </ol>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-8 pt-6" style={{ borderTop: `1px solid ${LINE}` }}>
                <PrimaryButton to="/formations">Choisir ma formation et demander une inscription</PrimaryButton>
                <Link to="/financements" className="inline-flex items-center gap-2 text-body-sm font-semibold hover:underline" style={{ color: TEAL, ...headingFont }}>
                  Tout comprendre sur le financement <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
