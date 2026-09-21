import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from '@phosphor-icons/react';
import PrimaryButton from '@/components/ui/primary-button';
import { LINE, BODY, BODY_MUTED, headingFont, serifFont, bodyFont } from '@/components/design';
import { Bande, RADIUS } from './atomes';

// « Faite pour vous ? » — la section qui qualifie. Deux panneaux face à face
// (au bon endroit / pas encore), puis les profils et le niveau de départ.
// Un visiteur qui n'est pas la cible est ORIENTÉ vers la bonne formation au
// lieu d'être perdu : chaque « pas encore » peut porter un lien `redirige`.
// Registre éditorial : typographie, filets, un seul aplat coloré, pas d'icône.

export default function PourQui({ pour, pasPour, personas, prerequis, couleur }) {
  const accent = couleur.fond;

  return (
    <Bande id="public" tone="pale">
      <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 lg:gap-20 items-end pb-12 sm:pb-16">
        <div>
          <p className="text-body-sm font-semibold mb-3" style={{ color: accent, ...headingFont }}>À qui s'adresse cette formation</p>
          <h2 className="font-serif-display max-w-[16ch]" style={{ fontSize: 'clamp(32px, 3.4vw, 48px)', lineHeight: 1.1, letterSpacing: '-0.02em', color: '#243037', ...serifFont }}>
            Faite pour vous si vous vous reconnaissez ici
          </h2>
        </div>
        <p className="text-body-lg leading-[1.6] max-w-measure lg:pb-2" style={{ color: BODY_MUTED, ...bodyFont }}>
          Une formation courte n'a de valeur que si elle tombe au bon moment de votre parcours. Lisez les
          deux colonnes : si vous êtes à gauche, vous êtes au bon endroit. Si vous êtes à droite, nous vous
          indiquons la meilleure marche à suivre.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="p-8 sm:p-10 text-white" style={{ borderRadius: RADIUS, background: accent }}>
          <h3 className="font-serif-display text-h2 text-white" style={serifFont}>Vous êtes au bon endroit si…</h3>
          <ul className="mt-7 space-y-5">
            {pour.map((p) => (
              <li key={p} className="flex items-start gap-4">
                <span className="inline-flex items-center justify-center shrink-0 w-7 h-7 rounded-full mt-0.5" style={{ background: couleur.accent }}>
                  <Check weight="bold" className="w-4 h-4" style={{ color: accent }} />
                </span>
                <span className="text-body-lg leading-[1.5]" style={bodyFont}>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-8 sm:p-10 bg-white" style={{ borderRadius: RADIUS, border: `1px solid ${LINE}` }}>
          <h3 className="font-serif-display text-h2" style={{ color: '#243037', ...serifFont }}>Pas encore, si…</h3>
          <ul className="mt-7">
            {pasPour.map(({ texte, redirige }, i) => (
              <li key={texte} className="py-5" style={{ borderTop: i === 0 ? 'none' : `1px solid ${LINE}` }}>
                <p className="text-body-lg leading-[1.5]" style={{ color: BODY, ...bodyFont }}>{texte}</p>
                {redirige && (
                  <Link
                    to={`/formations/${redirige.id}`}
                    className="inline-flex items-center gap-2 mt-3 text-body-sm font-semibold hover:underline"
                    style={{ color: accent, ...headingFont }}>
                    Découvrir « {redirige.title} » <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <p className="text-body-sm mt-4 pt-5" style={{ color: BODY_MUTED, borderTop: `1px solid ${LINE}`, ...bodyFont }}>
            Un doute ? Décrivez-nous votre situation dans la demande de devis : nous vous répondons franchement.
          </p>
        </div>
      </div>

      {personas.length > 0 && (
        <div className="mt-14 sm:mt-20">
          <h3 className="text-body-sm font-semibold mb-6" style={{ color: accent, ...headingFont }}>Les profils que nous formons</h3>
          <ul className="grid sm:grid-cols-3 gap-x-10">
            {personas.map(({ titre, texte }) => (
              <li key={titre} className="pt-5 pb-6" style={{ borderTop: `2px solid ${LINE}` }}>
                <h4 className="font-serif-display text-h3" style={{ color: '#243037', ...serifFont }}>{titre}</h4>
                <p className="text-body-base leading-[1.55] mt-2 max-w-[32ch]" style={{ color: BODY_MUTED, ...bodyFont }}>{texte}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-8 lg:gap-16 items-center mt-10 p-8 sm:p-10 bg-white" style={{ borderRadius: RADIUS, border: `1px solid ${LINE}` }}>
        <div>
          <h3 className="font-serif-display text-h2" style={{ color: '#243037', ...serifFont }}>Votre niveau de départ</h3>
          <ul className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-3">
            {prerequis.map((p) => (
              <li key={p} className="flex items-start gap-3 text-body-base leading-[1.5]" style={{ color: BODY, ...bodyFont }}>
                <span className="w-1.5 h-1.5 rounded-full mt-2.5 shrink-0" style={{ background: accent }} />{p}
              </li>
            ))}
          </ul>
          <p className="text-body-sm mt-5" style={{ color: BODY_MUTED, ...bodyFont }}>
            Vérifié en amont par un court test de positionnement, non éliminatoire, il sert à adapter la session à votre groupe.
          </p>
        </div>
        <div className="lg:text-right">
          <p className="text-h4 mb-4" style={{ color: '#243037', ...headingFont }}>Pas sûr d'être au niveau ?</p>
          <PrimaryButton href="#devis" style={{ background: accent }}>Parlons-en, sans engagement</PrimaryButton>
        </div>
      </div>
    </Bande>
  );
}
