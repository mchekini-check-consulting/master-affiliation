import React, { useState } from 'react';
import { Check, Minus, Plus } from '@phosphor-icons/react';
import PrimaryButton from '@/components/ui/primary-button';
import { LINE, MINT_LIGHT, BODY, BODY_MUTED, headingFont, serifFont, bodyFont } from '@/components/design';
import { Bande, RADIUS } from './atomes';

// Tarif et financement, compact et orienté décision. Le visiteur choisit son
// profil : le panneau lui dit qui paie, ce que nous fournissons et quoi faire
// maintenant — c'est la réponse à « combien ça me coûte, à MOI ». À droite,
// le prix et ce qu'il comprend ; dessous, la fiche pratique (mentions
// Qualiopi) en grille serrée plutôt qu'en tableau.

const PROFILS = [
  {
    key: 'entreprise',
    label: 'Entreprise',
    titre: 'Prise en charge par votre OPCO ou votre plan de compétences',
    texte: "Pour un salarié, la formation relève du plan de développement des compétences : votre OPCO peut la financer en tout ou partie selon votre branche. Nous fournissons le devis, le programme et la convention au format attendu, et nous vous accompagnons dans le dépôt du dossier.",
    etapes: ['Vous demandez un devis', 'Nous préparons devis, programme et convention', 'Vous déposez la demande auprès de votre OPCO', 'La session est planifiée'],
    cta: 'Demander une inscription',
  },
  {
    key: 'independant',
    label: 'Indépendant',
    titre: "Financement par votre fonds d'assurance formation",
    texte: "Travailleur indépendant, vous cotisez à un fonds d'assurance formation (AGEFICE, FIF PL, FAFCEA…) qui peut prendre en charge tout ou partie du coût. Nous vous remettons les pièces demandées par votre fonds et une convention à votre nom.",
    etapes: ['Vous demandez un devis', 'Nous fournissons devis, programme et convention', 'Vous sollicitez votre fonds de formation', 'La session est planifiée'],
    cta: 'Demander une inscription',
  },
  {
    key: 'particulier',
    label: 'Particulier',
    titre: 'Financement personnel, sans surprise',
    texte: "Vous vous formez à titre personnel : le tarif TTC est le prix final, sans frais annexes. Un devis et une convention de formation vous sont remis avant tout engagement, avec un délai de rétractation.",
    etapes: ['Vous demandez un devis', 'Nous validons ensemble la date et votre niveau', 'Vous signez la convention', 'La session est planifiée'],
    cta: 'Demander une inscription',
  },
];

export default function Tarif({ prixHT, mentionTTC, inclus, infosPratiques, couleur, inscriptionTo }) {
  const [profil, setProfil] = useState(PROFILS[0]);
  const [ficheOuverte, setFicheOuverte] = useState(false);
  const accent = couleur.fond;

  // Trois blocs posés sur une grille. Desktop : titre et financement à gauche,
  // prix à droite sur toute la hauteur. Sous 1024 px, l'ordre devient celui de
  // la décision : titre, prix, financement, action.
  return (
    <Bande id="tarif">
      <div className="grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:grid-rows-[auto_1fr] gap-y-8 lg:gap-y-0 lg:gap-x-16 items-start">
        <div className="lg:col-start-1 lg:row-start-1">
          <p className="text-body-sm font-semibold mb-3" style={{ color: accent, ...headingFont }}>Tarif et financement</p>
          <h2 className="font-serif-display max-w-[18ch]" style={{ fontSize: 'clamp(28px, 3.4vw, 48px)', lineHeight: 1.1, letterSpacing: '-0.02em', color: '#243037', ...serifFont }}>
            Un prix clair. Trois façons de le financer.
          </h2>
        </div>

        {/* Prix */}
        <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2 overflow-hidden" style={{ borderRadius: RADIUS, border: `1px solid ${LINE}` }}>
          <div className="px-5 sm:px-7 pt-6 sm:pt-7 pb-5 sm:pb-6" style={{ background: MINT_LIGHT, borderBottom: `1px solid ${LINE}` }}>
            <p className="text-body-sm font-semibold" style={{ color: BODY_MUTED, ...headingFont }}>Tarif par stagiaire</p>
            <p className="flex items-baseline gap-2 mt-1">
              <span className="font-serif-display tabular-nums" style={{ fontSize: 'clamp(40px, 3.6vw, 52px)', lineHeight: 1, letterSpacing: '-0.02em', color: '#243037', ...serifFont }}>{prixHT}</span>
              <span className="text-body-base font-bold" style={{ color: BODY_MUTED, ...headingFont }}>HT</span>
            </p>
            {mentionTTC && <p className="text-body-sm mt-2" style={{ color: BODY_MUTED, ...bodyFont }}>{mentionTTC}</p>}
          </div>
          <ul className="px-5 sm:px-7 py-5 space-y-3 sm:space-y-2.5">
            {inclus.map(({ titre, texte }) => (
              <li key={titre} className="flex items-start gap-3 text-body-base sm:text-body-sm leading-[1.5] sm:leading-[1.5]" style={{ color: BODY, ...bodyFont }}>
                <Check weight="bold" className="w-4 h-4 mt-1 sm:mt-0.5 shrink-0" style={{ color: accent }} />
                <span><strong style={headingFont}>{titre}</strong>{texte ? ` : ${texte}` : ''}</span>
              </li>
            ))}
          </ul>
          {/* Fiche pratique (mentions Qualiopi) : repliée sous 640 px pour ne pas
              éloigner le prix de l'action, toujours dépliée au-dessus. */}
          <button
            type="button"
            onClick={() => setFicheOuverte((o) => !o)}
            aria-expanded={ficheOuverte}
            aria-controls="tarif-fiche"
            className="sm:hidden w-full flex items-center justify-between gap-4 px-5 min-h-[52px] text-left text-body-base font-semibold"
            style={{ color: BODY, borderTop: `1px solid ${LINE}`, ...headingFont }}>
            Fiche pratique
            {ficheOuverte
              ? <Minus className="w-5 h-5 shrink-0" style={{ color: accent }} />
              : <Plus className="w-5 h-5 shrink-0" style={{ color: BODY_MUTED }} />}
          </button>
          <dl
            id="tarif-fiche"
            className={`${ficheOuverte ? 'grid' : 'hidden'} sm:grid sm:grid-cols-2 gap-x-6 gap-y-3 px-5 sm:px-7 pb-5 sm:py-5 sm:border-t`}
            style={{ borderColor: LINE }}>
            {infosPratiques.map(([label, valeur]) => (
              <div key={label} className="min-w-0">
                <dt className="text-caption" style={{ color: BODY_MUTED, ...bodyFont }}>{label}</dt>
                <dd className="text-body-sm font-medium leading-snug mt-0.5" style={{ color: BODY, ...bodyFont }}>{valeur}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Financement selon le profil */}
        <div className="lg:col-start-1 lg:row-start-2">
          <div role="tablist" aria-label="Votre situation" className="grid grid-cols-3 sm:inline-flex sm:flex-wrap gap-1 lg:mt-8 p-1" style={{ borderRadius: 999, background: MINT_LIGHT }}>
            {PROFILS.map((p) => {
              const actif = p.key === profil.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  role="tab"
                  aria-selected={actif}
                  onClick={() => setProfil(p)}
                  className="h-11 sm:h-10 px-0.5 sm:px-5 rounded-full text-body-sm font-semibold transition-colors"
                  style={{ background: actif ? accent : 'transparent', color: actif ? '#ffffff' : BODY, ...headingFont }}>
                  {p.label}
                </button>
              );
            })}
          </div>

          <div role="tabpanel" className="mt-6 sm:mt-7">
            <h3 className="text-h3" style={{ color: '#243037', ...headingFont }}>{profil.titre}</h3>
            <p className="text-body-base leading-[1.6] mt-3 max-w-measure" style={{ color: BODY_MUTED, ...bodyFont }}>{profil.texte}</p>
            <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mt-6">
              {profil.etapes.map((e, i) => (
                <li key={e} className="flex items-start gap-3 text-body-base sm:text-body-sm leading-[1.5] sm:leading-[1.5]" style={{ color: BODY, ...bodyFont }}>
                  <span className="inline-flex items-center justify-center shrink-0 w-6 h-6 rounded-full text-caption font-bold tabular-nums" style={{ background: MINT_LIGHT, color: accent, ...headingFont }}>{i + 1}</span>
                  {e}
                </li>
              ))}
            </ol>
            <PrimaryButton to={inscriptionTo} block className="mt-7" style={{ background: accent }}>{profil.cta}</PrimaryButton>
            <p className="sm:hidden text-body-sm text-center mt-3" style={{ color: BODY_MUTED, ...bodyFont }}>
              Réponse sous 24 h ouvrées, sans engagement
            </p>
          </div>
        </div>
      </div>
    </Bande>
  );
}
