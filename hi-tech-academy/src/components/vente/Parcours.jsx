import React from 'react';
import { LINE, MINT_LIGHT, BODY, BODY_MUTED, headingFont, serifFont, bodyFont } from '@/components/design';
import { Bande, RADIUS } from './atomes';

// « Votre parcours avec nous » : les cinq étapes réelles, du premier contact
// au suivi après la session. C'est le processus Qualiopi de l'organisme,
// raconté du point de vue du participant — il répond à « et après, il se
// passe quoi ? », l'incertitude qui fait remettre un devis à plus tard.
// Numérotation légitime : c'est une chronologie.

const ETAPES = [
  {
    quand: 'Aujourd\'hui',
    titre: 'Vous demandez un devis',
    texte: 'Trois champs, une minute. Aucun engagement : c\'est une prise de contact.',
  },
  {
    quand: 'Sous 24 h ouvrées',
    titre: 'Nous vous appelons',
    texte: 'Quinze minutes pour comprendre votre projet, valider le financement et fixer une date. Devis, programme et convention suivent par e-mail.',
  },
  {
    quand: 'Avant la session',
    titre: 'Vous vous positionnez',
    texte: 'Un court questionnaire et un test de positionnement, non éliminatoire, pour adapter la session à votre niveau. Convocation et accès vous parviennent la veille.',
  },
  {
    quand: 'Le jour J',
    titre: 'Vous pratiquez, en direct',
    texte: 'Classe virtuelle avec le formateur, votre propre environnement, des travaux pratiques corrigés au fil de la journée. Évaluation des acquis en fin de session.',
  },
  {
    quand: 'Après',
    titre: 'Vous repartez attesté, et suivi',
    texte: 'Attestation de fin de formation sous quelques jours, supports conservés, et un questionnaire à froid quelques semaines plus tard pour mesurer ce que vous avez mis en œuvre.',
  },
];

export default function Parcours({ couleur }) {
  const accent = couleur.fond;

  return (
    <Bande id="parcours">
      <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 lg:gap-20 items-end pb-12 sm:pb-16">
        <div>
          <p className="text-body-sm font-semibold mb-3" style={{ color: accent, ...headingFont }}>Votre parcours avec nous</p>
          <h2 className="font-serif-display max-w-[16ch]" style={{ fontSize: 'clamp(32px, 3.4vw, 48px)', lineHeight: 1.1, letterSpacing: '-0.02em', color: '#243037', ...serifFont }}>
            Du premier contact à l'attestation, tout est balisé
          </h2>
        </div>
        <p className="text-body-lg leading-[1.6] max-w-measure lg:pb-2" style={{ color: BODY_MUTED, ...bodyFont }}>
          Vous savez à l'avance ce qui se passe, quand, et ce que nous attendons de vous. Cinq étapes,
          aucune surprise, c'est aussi ce que la certification Qualiopi nous impose.
        </p>
      </div>

      <ol className="grid md:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-10">
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

      <p className="text-body-sm mt-12 pt-6 max-w-measure" style={{ color: BODY, borderTop: `1px solid ${LINE}`, borderRadius: RADIUS, ...bodyFont }}>
        En situation de handicap ? Notre référent étudie avec vous les adaptations nécessaires dès la
        demande d'inscription : rythme, supports, outils.
      </p>
    </Bande>
  );
}
