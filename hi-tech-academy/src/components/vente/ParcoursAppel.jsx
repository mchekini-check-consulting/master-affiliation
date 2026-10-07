import React from 'react';
import PrimaryButton from '@/components/ui/primary-button';
import { LINE, MINT_LIGHT, BODY, BODY_MUTED, headingFont, serifFont, bodyFont } from '@/components/design';
import { Bande } from './atomes';

// « Comment ça se passe » : la chronologie du tunnel rendez-vous, racontée du
// point de vue du participant. Tout part de l'appel découverte : c'est lui qui
// lève les deux freins réels (« est-ce pour moi ? » et « combien ça va me
// coûter ? »), le dossier de financement se monte ensuite avec nous.
// Numérotation légitime : c'est une chronologie.

const ETAPES = [
  {
    quand: "Aujourd'hui",
    titre: 'Vous réservez votre appel découverte',
    texte: "Trente minutes au téléphone, gratuites et sans engagement : votre projet, votre niveau de départ et vos options de financement.",
  },
  {
    quand: 'Sous quelques jours',
    titre: 'Nous montons le dossier de financement ensemble',
    texte: "Devis, programme et convention au format attendu par votre OPCO ou votre fonds d'assurance formation, pour une prise en charge jusqu'à 100 %. Vous déposez la demande, nous restons disponibles jusqu'à l'accord.",
  },
  {
    quand: 'Le jour J',
    titre: 'Vous êtes formé en direct',
    texte: 'Classe virtuelle avec le formateur, petit groupe, travaux pratiques corrigés au fil de la session. Évaluation des acquis en fin de journée.',
  },
  {
    quand: 'Après',
    titre: 'Vous repartez attesté, outillé et suivi',
    texte: 'Attestation de fin de formation, pack de fiches et de prompts conservé à vie, et un suivi individuel de 30 minutes quelques semaines plus tard.',
  },
];

export default function ParcoursAppel({ couleur, rdvAction }) {
  const accent = couleur.fond;

  return (
    <Bande id="parcours">
      <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 lg:gap-20 items-end pb-12 sm:pb-16">
        <div>
          <p className="text-body-sm font-semibold mb-3" style={{ color: accent, ...headingFont }}>Comment ça se passe</p>
          <h2 className="font-serif-display max-w-[16ch]" style={{ fontSize: 'clamp(32px, 3.4vw, 48px)', lineHeight: 1.1, letterSpacing: '-0.02em', color: '#243037', ...serifFont }}>
            Un appel de 30 minutes, et tout s'enchaîne
          </h2>
        </div>
        <p className="text-body-lg leading-[1.6] max-w-measure lg:pb-2" style={{ color: BODY_MUTED, ...bodyFont }}>
          Vous savez à l'avance ce qui se passe, quand, et ce que nous attendons de vous. Quatre étapes,
          aucune surprise : c'est aussi ce que la certification Qualiopi nous impose.
        </p>
      </div>

      <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        {ETAPES.map(({ quand, titre, texte }, i) => {
          const dernier = i === ETAPES.length - 1;
          return (
            <li key={titre} className="relative pt-6" style={{ borderTop: `2px solid ${dernier ? accent : LINE}` }}>
              {/* Point sur le fil : plein sur la dernière étape, l'arrivée. */}
              <span
                aria-hidden="true"
                className="absolute left-0 -top-[7px] w-3 h-3 rounded-full"
                style={{ background: dernier ? accent : '#ffffff', border: `2px solid ${accent}` }}
              />
              <span className="inline-flex items-center h-7 px-3 rounded-full text-caption font-semibold" style={{ background: dernier ? accent : MINT_LIGHT, color: dernier ? '#ffffff' : accent, ...headingFont }}>
                {quand}
              </span>
              <h3 className="text-h4 mt-4 leading-[1.3]" style={{ color: '#243037', ...headingFont }}>
                <span className="font-serif-display tabular-nums mr-2" style={{ color: accent, ...serifFont }}>{i + 1}.</span>{titre}
              </h3>
              <p className="text-body-sm leading-[1.55] mt-2" style={{ color: BODY_MUTED, ...bodyFont }}>{texte}</p>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-6 mt-12 pt-8" style={{ borderTop: `1px solid ${LINE}` }}>
        <p className="text-body-base max-w-measure" style={{ color: BODY, ...bodyFont }}>
          En situation de handicap ? Notre référent étudie avec vous les adaptations nécessaires dès le
          premier échange : rythme, supports, outils.
        </p>
        <PrimaryButton {...rdvAction} size="lg" style={{ background: accent }}>Réserver mon appel gratuit</PrimaryButton>
      </div>
    </Bande>
  );
}
