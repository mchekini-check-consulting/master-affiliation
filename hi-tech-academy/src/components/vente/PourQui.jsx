import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from '@phosphor-icons/react';
import PrimaryButton from '@/components/ui/primary-button';
import { useMediaQuery } from '@/hooks/use-media-query';
import { LINE, BODY, BODY_MUTED, headingFont, serifFont, bodyFont } from '@/components/design';
import { Bande, Fold, RADIUS } from './atomes';

// « Faite pour vous ? » — la section qui qualifie. Deux panneaux face à face
// (au bon endroit / pas encore), puis les profils et le niveau de départ.
// Un visiteur qui n'est pas la cible est ORIENTÉ vers la bonne formation au
// lieu d'être perdu : chaque « pas encore » peut porter un lien `redirige`.
// Registre éditorial : typographie, filets, un seul aplat coloré, pas d'icône.

// Version mobile (sous 768 px), tournée vers l'action. Le visiteur qui se
// reconnaît dans le panneau marine trouve le bouton d'inscription juste en
// dessous, sans avoir à traverser le reste. Tout ce qui qualifie sans vendre
// (niveau de départ, contre-indications, profils) est replié dans une seule
// carte, et le doute se règle par un lien de contact en fin de section.
// Lien texte vers l'action rendez-vous : <a> si Calendly est branché (href),
// <Link> sinon (formulaire interne, `to`). Même contrat que PrimaryButton.
function LienRdv({ action, className, style, children }) {
  return action.href
    ? <a href={action.href} target={action.target} rel={action.rel} className={className} style={style}>{children}</a>
    : <Link to={action.to} className={className} style={style}>{children}</Link>;
}

function PourQuiMobile({ pour, pasPour, personas, prerequis, couleur, rdvAction }) {
  const accent = couleur.fond;
  const [ouvert, setOuvert] = useState('niveau');
  const basculer = (cle) => setOuvert((actuel) => (actuel === cle ? null : cle));

  return (
    <Bande id="public" tone="pale">
      <p className="text-body-sm font-semibold mb-3" style={{ color: accent, ...headingFont }}>À qui s'adresse cette formation</p>
      <h2 className="font-serif-display text-h1" style={{ color: '#243037', ...serifFont }}>
        Faite pour vous si vous vous reconnaissez ici
      </h2>

      <div className="mt-6 p-5 text-white" style={{ borderRadius: RADIUS, background: accent }}>
        <h3 className="font-serif-display text-h3 text-white" style={serifFont}>Vous êtes au bon endroit si…</h3>
        <ul className="mt-5 space-y-4">
          {pour.map((p) => (
            <li key={p} className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center shrink-0 w-6 h-6 rounded-full" style={{ background: couleur.accent }}>
                <Check weight="bold" className="w-3.5 h-3.5" style={{ color: accent }} />
              </span>
              <span className="text-body-base leading-[1.5]" style={bodyFont}>{p}</span>
            </li>
          ))}
        </ul>
        {rdvAction && (
          <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${couleur.accent}` }}>
            <PrimaryButton {...rdvAction} inverted block>Réserver mon appel gratuit</PrimaryButton>
            <p className="text-body-sm text-center mt-3" style={{ color: '#dbebff', ...bodyFont }}>
              30 minutes en visio, gratuit et sans engagement
            </p>
          </div>
        )}
      </div>

      {/* Le filet de la dernière ligne doublerait la bordure de la carte. */}
      <div className="mt-4 px-5 bg-white [&>div:last-child]:!border-b-0" style={{ borderRadius: RADIUS, border: `1px solid ${LINE}` }}>
        <Fold title="Votre niveau de départ" open={ouvert === 'niveau'} onToggle={() => basculer('niveau')}>
          <ul className="space-y-3">
            {prerequis.map((p) => (
              <li key={p} className="flex items-start gap-3 text-body-base leading-[1.5]" style={{ color: BODY, ...bodyFont }}>
                <span className="w-1.5 h-1.5 rounded-full mt-2.5 shrink-0" style={{ background: accent }} />{p}
              </li>
            ))}
          </ul>
          <p className="text-body-sm mt-4" style={{ color: BODY_MUTED, ...bodyFont }}>
            Vérifié en amont par un court test de positionnement, non éliminatoire, il sert à adapter la session à votre groupe.
          </p>
        </Fold>

        {pasPour.length > 0 && (
          <Fold title="Pas encore, si…" open={ouvert === 'pasPour'} onToggle={() => basculer('pasPour')}>
            <ul>
              {pasPour.map(({ texte, redirige }, i) => (
                <li key={texte} className={i === 0 ? 'pb-4' : 'py-4'} style={{ borderTop: i === 0 ? 'none' : `1px solid ${LINE}` }}>
                  <p className="text-body-base leading-[1.5]" style={{ color: BODY, ...bodyFont }}>{texte}</p>
                  {redirige && (
                    <Link
                      to={`/formations/${redirige.id}`}
                      className="inline-flex items-center gap-2 min-h-[44px] text-body-sm font-semibold"
                      style={{ color: accent, ...headingFont }}>
                      Découvrir « {redirige.title} » <ArrowRight className="w-4 h-4 shrink-0" />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </Fold>
        )}

        {personas.length > 0 && (
          <Fold title="Les profils que nous formons" open={ouvert === 'profils'} onToggle={() => basculer('profils')}>
            <ul className="space-y-4">
              {personas.map(({ titre, texte }) => (
                <li key={titre}>
                  <h4 className="text-body-base font-semibold" style={{ color: '#243037', ...headingFont }}>{titre}</h4>
                  <p className="text-body-base leading-[1.5] mt-1" style={{ color: BODY_MUTED, ...bodyFont }}>{texte}</p>
                </li>
              ))}
            </ul>
          </Fold>
        )}
      </div>

      <p className="text-body-base mt-6" style={{ color: BODY, ...bodyFont }}>
        Pas sûr d'être au niveau ?{' '}
        <LienRdv
          action={rdvAction}
          className="inline-flex items-center gap-2 min-h-[44px] font-semibold underline underline-offset-4"
          style={{ color: accent, ...headingFont }}>
          Parlons-en, sans engagement <ArrowRight className="w-4 h-4 shrink-0" />
        </LienRdv>
      </p>
    </Bande>
  );
}

export default function PourQui(props) {
  const { pour, pasPour, personas, prerequis, couleur, rdvAction } = props;
  const accent = couleur.fond;
  const mobile = useMediaQuery('(max-width: 767px)');

  if (mobile) return <PourQuiMobile {...props} />;

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
            Un doute ? Posez-le pendant l'appel gratuit de 30 minutes, nous vous répondons franchement.
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
          <PrimaryButton {...rdvAction} style={{ background: accent }}>Réserver mon appel gratuit</PrimaryButton>
        </div>
      </div>
    </Bande>
  );
}
