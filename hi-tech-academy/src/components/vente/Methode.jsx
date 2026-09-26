import React from 'react';
import { Check } from '@phosphor-icons/react';
import PrimaryButton from '@/components/ui/primary-button';
import { LINE, MINT_LIGHT, BODY, BODY_MUTED, headingFont, serifFont, bodyFont } from '@/components/design';
import { Bande, RADIUS } from './atomes';

// « L'expérience de formation » : la section qui répond à « concrètement, ça
// se passe comment ? ». Registre éditorial : grands titres, filets, colonnes
// — la page d'un programme exécutif, pas une liste de fonctionnalités.
//   1. Les temps d'une session, en colonnes.
//   2. La journée heure par heure, face à une photo bord à bord.
//   3. L'encart « mise en pratique » (si renseigné) et ce qui est inclus.
//   4. Un rappel du CTA, sobre.

function TempsDeSession({ approche, accent }) {
  return (
    <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8">
      {approche.map(({ titre, texte }, i) => (
        <li key={titre} className="pt-5 pb-8" style={{ borderTop: `2px solid ${i === 0 ? accent : LINE}` }}>
          <span className="text-body-sm font-semibold tabular-nums" style={{ color: accent, ...headingFont }}>Temps {i + 1}</span>
          <h3 className="text-h3 mt-3 leading-[1.25]" style={{ color: '#243037', ...headingFont }}>{titre}</h3>
          <p className="text-body-base leading-[1.55] mt-2 max-w-[30ch]" style={{ color: BODY_MUTED, ...bodyFont }}>{texte}</p>
        </li>
      ))}
    </ol>
  );
}

function Journee({ parcours, accent }) {
  return (
    <ol className="relative">
      {parcours.map(({ horaire, titre, items, texte }, i) => (
        <li key={horaire} className="grid grid-cols-[112px_minmax(0,1fr)] sm:grid-cols-[160px_minmax(0,1fr)] gap-x-6 py-6" style={{ borderTop: i === 0 ? 'none' : `1px solid ${LINE}` }}>
          <div>
            <span className="block font-serif-display text-h3 tabular-nums leading-none" style={{ color: accent, ...serifFont }}>{horaire.split(' – ')[0]}</span>
            <span className="block text-body-sm mt-2" style={{ color: BODY_MUTED, ...bodyFont }}>{horaire.split(' – ')[1] ? `→ ${horaire.split(' – ')[1]}` : ''}</span>
          </div>
          <div className="min-w-0">
            <h4 className="text-h4" style={{ color: '#243037', ...headingFont }}>{titre}</h4>
            {items ? (
              <ul className="mt-2 space-y-1.5">
                {items.map((it) => (
                  <li key={it} className="flex items-start gap-3 text-body-base leading-[1.5]" style={{ color: BODY, ...bodyFont }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-2.5 shrink-0" style={{ background: accent }} />{it}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body-base leading-[1.55] mt-1" style={{ color: BODY_MUTED, ...bodyFont }}>{texte}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function Methode({ inclus, approche, parcours, misePratique, photo, couleur, inscriptionTo }) {
  const accent = couleur.fond;

  return (
    <Bande id="methode">
      {/* En-tête éditorial */}
      <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 lg:gap-20 items-end pb-12 sm:pb-16">
        <div>
          <p className="text-body-sm font-semibold mb-3" style={{ color: accent, ...headingFont }}>L'expérience de formation</p>
          <h2 className="font-serif-display max-w-[18ch]" style={{ fontSize: 'clamp(32px, 3.4vw, 48px)', lineHeight: 1.1, letterSpacing: '-0.02em', color: '#243037', ...serifFont }}>
            Une journée conçue pour que vous repartiez opérationnel
          </h2>
        </div>
        <p className="text-body-lg leading-[1.6] max-w-measure lg:pb-2" style={{ color: BODY_MUTED, ...bodyFont }}>
          Pas de vidéos à regarder seul : un formateur en direct, votre propre environnement de travail, et
          des travaux pratiques corrigés au fil de la journée. Vous apprenez en faisant, et vous repartez
          avec ce que vous avez construit.
        </p>
      </div>

      <TempsDeSession approche={approche} accent={accent} />

      {/* Journée + photo */}
      {parcours && (
        <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-16 mt-8 pt-12 sm:pt-16" style={{ borderTop: `1px solid ${LINE}` }}>
          <figure className="relative overflow-hidden m-0 min-h-[280px] lg:min-h-0" style={{ borderRadius: RADIUS, background: couleur.trait }}>
            {photo && <img src={photo} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />}
            <figcaption className="absolute left-0 right-0 bottom-0 px-6 py-4 text-body-sm text-white" style={{ background: accent, ...bodyFont }}>
              Classe virtuelle en direct : chaque participant travaille sur son propre environnement.
            </figcaption>
          </figure>
          <div>
            <h3 className="font-serif-display text-h1 mb-2" style={{ color: '#243037', ...serifFont }}>La journée, heure par heure</h3>
            <p className="text-body-base mb-6" style={{ color: BODY_MUTED, ...bodyFont }}>Heure de Paris. Le rythme s'adapte au groupe, les objectifs ne bougent pas.</p>
            <Journee parcours={parcours} accent={accent} />
          </div>
        </div>
      )}

      {/* Mise en pratique + inclus */}
      <div className={`grid gap-6 mt-12 sm:mt-16 ${misePratique ? 'lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]' : ''}`}>
        {misePratique && (
          <div className="p-8 sm:p-10 text-white" style={{ borderRadius: RADIUS, background: accent }}>
            <p className="text-body-sm font-semibold mb-3" style={{ color: couleur.accent, ...headingFont }}>{misePratique.badge}</p>
            <h3 className="font-serif-display text-h1 text-white max-w-[20ch]" style={serifFont}>{misePratique.titre}</h3>
            <p className="text-body-lg leading-[1.6] mt-4 max-w-measure" style={bodyFont}>{misePratique.texte}</p>
            <ul className="flex flex-wrap gap-x-8 gap-y-3 mt-8">
              {misePratique.points.map((p) => (
                <li key={p} className="flex items-center gap-2 text-body-base font-semibold" style={headingFont}>
                  <Check weight="bold" className="w-4 h-4 shrink-0" style={{ color: couleur.accent }} />{p}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="p-8 sm:p-10" style={{ borderRadius: RADIUS, background: MINT_LIGHT }}>
          <h3 className="text-h3 mb-6" style={{ color: '#243037', ...headingFont }}>Ce qui est inclus</h3>
          <ul className="space-y-4">
            {inclus.map(({ titre, texte }) => (
              <li key={titre} className="flex items-start gap-4">
                <span className="inline-flex items-center justify-center shrink-0 w-7 h-7 rounded-full mt-0.5" style={{ background: accent }}>
                  <Check weight="bold" className="w-3.5 h-3.5 text-white" />
                </span>
                <span className="min-w-0">
                  <span className="block text-body-base font-semibold leading-snug" style={{ color: BODY, ...headingFont }}>{titre}</span>
                  <span className="block text-body-sm leading-[1.5] mt-0.5" style={{ color: BODY_MUTED, ...bodyFont }}>{texte}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Rappel sobre du CTA */}
      <div className="flex flex-wrap items-center justify-between gap-6 mt-12 pt-8" style={{ borderTop: `1px solid ${LINE}` }}>
        <p className="text-h4 max-w-[40ch]" style={{ color: '#243037', ...headingFont }}>
          Une session s'ouvre dès un participant. La prochaine peut être la vôtre.
        </p>
        <PrimaryButton to={inscriptionTo} style={{ background: accent }}>Demander une inscription</PrimaryButton>
      </div>
    </Bande>
  );
}
