import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, DownloadSimple as Download, Minus, Plus } from '@phosphor-icons/react';
import { LINE, MINT_LIGHT, BODY, BODY_MUTED, headingFont, serifFont, bodyFont } from '@/components/design';
import { Bande, SectionTitle, ZonePhoto, RADIUS } from './atomes';

/**
 * Programme en « étapes » : à gauche la progression (une seule active), à
 * droite le détail de l'étape sur un panneau de la couleur de la formation.
 * C'est la seule section où la numérotation a un sens : c'est une séquence.
 * Sur mobile, les étapes se déplient les unes sous les autres.
 * `modules` : [{ titre, items }]. `captures` : preuves « voici ce que vous
 * recevez », rendues sous le programme quand elles existent.
 */
export default function Programme({ modules, captures, pdf, promesseFinale, titre, couleur }) {
  const [active, setActive] = useState(0);
  const total = modules.length;
  const etape = modules[Math.max(0, active)] ?? modules[0];
  const accent = couleur.fond;

  return (
    <Bande id="programme">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionTitle
          kicker="Programme"
          sub={`${total} étapes progressives, chacune alternant démonstration et travaux pratiques.`}>
          {titre ?? `${total} étapes, du premier pas à l'autonomie`}
        </SectionTitle>
        {pdf && (
          <a
            href={pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-11 px-5 mb-8 sm:mb-10 rounded-full text-body-sm font-semibold"
            style={{ color: '#243037', border: `1px solid ${LINE}`, ...headingFont }}>
            <Download className="w-4 h-4" style={{ color: accent }} /> Programme officiel (PDF)
          </a>
        )}
      </div>

      {/* Desktop : progression + panneau */}
      <div className="hidden lg:grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 items-stretch">
        <ol style={{ borderTop: `1px solid ${LINE}` }}>
          {modules.map((m, i) => {
            const actif = i === active;
            return (
              <li key={m.titre} style={{ borderBottom: `1px solid ${LINE}` }}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-current={actif ? 'step' : undefined}
                  className="w-full flex items-center gap-6 text-left py-6 pr-4 transition-colors"
                  style={{ paddingLeft: actif ? 20 : 0, borderLeft: `3px solid ${actif ? accent : 'transparent'}` }}>
                  <span
                    className="font-serif-display tabular-nums leading-none"
                    style={{ fontSize: 40, letterSpacing: '-0.02em', color: actif ? accent : '#adaaaa', ...serifFont }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-h4 leading-[1.3]" style={{ color: actif ? '#243037' : BODY_MUTED, ...headingFont }}>{m.titre}</span>
                    {m.items && (
                      <span className="block text-body-sm mt-1" style={{ color: BODY_MUTED, ...bodyFont }}>
                        {m.items.length} points clés
                      </span>
                    )}
                  </span>
                  {actif && <ArrowRight className="w-5 h-5 shrink-0" style={{ color: accent }} />}
                </button>
              </li>
            );
          })}
        </ol>

        <div className="flex flex-col p-10 text-white" style={{ borderRadius: RADIUS, background: accent }}>
          <p className="text-body-sm font-semibold" style={{ color: couleur.accent, ...headingFont }}>
            Étape {Math.max(0, active) + 1} sur {total}
          </p>
          <h3 className="font-serif-display text-h1 text-white mt-3 max-w-[20ch]" style={serifFont}>{etape.titre}</h3>

          {etape.items ? (
            <ul className="mt-8 space-y-4">
              {etape.items.map((item) => (
                <li key={item} className="flex items-start gap-4 text-body-lg leading-[1.5]" style={bodyFont}>
                  <span className="inline-flex items-center justify-center shrink-0 w-7 h-7 rounded-full mt-0.5" style={{ background: couleur.accent }}>
                    <Check weight="bold" className="w-4 h-4" style={{ color: accent }} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-8 text-body-lg" style={bodyFont}>Détail dans le programme officiel.</p>
          )}

          <div className="flex items-center justify-between gap-4 mt-auto pt-10">
            <button
              type="button"
              onClick={() => setActive((a) => Math.max(0, a - 1))}
              disabled={active <= 0}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-full text-body-sm font-semibold bg-white disabled:opacity-40"
              style={{ color: accent, ...headingFont }}>
              <ArrowLeft className="w-4 h-4" /> Précédent
            </button>
            <button
              type="button"
              onClick={() => setActive((a) => Math.min(total - 1, a + 1))}
              disabled={active >= total - 1}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-full text-body-sm font-semibold bg-white disabled:opacity-40"
              style={{ color: accent, ...headingFont }}>
              Étape suivante <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / tablette : accordéon */}
      <ol className="lg:hidden" style={{ borderTop: `1px solid ${LINE}` }}>
        {modules.map((m, i) => {
          const ouvert = i === active;
          return (
            <li key={m.titre} style={{ borderBottom: `1px solid ${LINE}` }}>
              <button
                type="button"
                onClick={() => setActive(ouvert ? -1 : i)}
                aria-expanded={ouvert}
                className="w-full flex items-center gap-4 text-left py-5">
                <span className="font-serif-display tabular-nums leading-none" style={{ fontSize: 32, color: ouvert ? accent : '#adaaaa', ...serifFont }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 text-h4 leading-[1.3]" style={{ color: '#243037', ...headingFont }}>{m.titre}</span>
                {ouvert ? <Minus className="w-5 h-5 shrink-0" style={{ color: accent }} /> : <Plus className="w-5 h-5 shrink-0" style={{ color: BODY_MUTED }} />}
              </button>
              {ouvert && m.items && (
                <ul className="pb-6 pl-14 space-y-3">
                  {m.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-body-base leading-[1.5]" style={{ color: BODY, ...bodyFont }}>
                      <Check weight="bold" className="w-4 h-4 mt-1 shrink-0" style={{ color: accent }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>

      {(promesseFinale || (captures && captures.length > 0)) && (
        <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 mt-12">
          {promesseFinale && (
            <p className="p-7 text-h4 leading-[1.4]" style={{ borderRadius: RADIUS, background: MINT_LIGHT, color: '#243037', ...headingFont }}>
              {promesseFinale}
            </p>
          )}
          {captures && captures.length > 0 && (
            <div className={promesseFinale ? '' : 'lg:col-span-2'}>
              <h3 className="text-h4 mb-4" style={{ color: BODY, ...headingFont }}>Ce que vous aurez entre les mains</h3>
              <ul className={`grid gap-4 ${captures.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                {captures.map(({ image, legende }) => (
                  <li key={image}>
                    <ZonePhoto src={image} alt={legende} ratio="4 / 3" />
                    {legende && <p className="text-caption leading-snug mt-2" style={{ color: BODY_MUTED, ...bodyFont }}>{legende}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Bande>
  );
}
