import React, { useState } from 'react';
import { Certificate as Award } from '@phosphor-icons/react';
import { LINE, BODY_MUTED, headingFont, serifFont, bodyFont } from '@/components/design';
import { Bande, RADIUS } from './atomes';

// « Ce que vous saurez faire » — deuxième section de la page, la première
// raison de rester. Registre : une grande promesse à gauche, qui reste sous
// les yeux (colonne collante), et à droite six compétences en très grande
// typographie, une par ligne, comme un sommaire. Pas d'icône, pas de carte :
// l'espace, la taille du texte et la couleur de la formation font le travail.
// Le survol d'une ligne l'allume dans la couleur de la formation : c'est le
// seul mouvement, et il répond au visiteur.

export default function Objectifs({ objectifs, couleur, photo, sanction }) {
  const [survol, setSurvol] = useState(null);
  if (!objectifs || objectifs.length === 0) return null;
  const accent = couleur.fond;

  return (
    <Bande id="objectifs">
      <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-12 lg:gap-20 items-start">
        {/* Colonne collante : promesse + photo */}
        <div className="lg:sticky lg:top-28">
          <p className="text-body-sm font-semibold mb-4" style={{ color: accent, ...headingFont }}>Objectifs pédagogiques</p>
          <h2
            className="font-serif-display max-w-[14ch]"
            style={{ fontSize: 'clamp(36px, 4vw, 56px)', lineHeight: 1.05, letterSpacing: '-0.02em', color: '#243037', ...serifFont }}>
            À la fin de la session, vous saurez.
          </h2>
          <p className="text-body-lg leading-[1.6] mt-6 max-w-[38ch]" style={{ color: BODY_MUTED, ...bodyFont }}>
            Pas « aurez vu » : saurez faire. Chaque compétence ci-contre est mise en pratique pendant la
            session, puis évaluée à la fin.
          </p>

          <figure className="relative overflow-hidden m-0 mt-10 hidden lg:block" style={{ borderRadius: RADIUS, aspectRatio: '4 / 3', background: couleur.trait }}>
            {photo && <img src={photo} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />}
            <figcaption className="absolute left-0 right-0 bottom-0 flex items-center gap-3 px-5 py-4 text-white" style={{ background: accent }}>
              <Award weight="fill" className="w-5 h-5 shrink-0" style={{ color: couleur.accent }} />
              <span className="text-body-sm font-medium" style={bodyFont}>Compétences attestées : {sanction}</span>
            </figcaption>
          </figure>
        </div>

        {/* Les compétences, une par ligne */}
        <ol style={{ borderTop: `1px solid ${LINE}` }}>
          {objectifs.map(({ titre, texte }, i) => {
            const actif = survol === i;
            return (
              <li
                key={titre}
                onMouseEnter={() => setSurvol(i)}
                onMouseLeave={() => setSurvol(null)}
                className="grid grid-cols-[56px_minmax(0,1fr)] sm:grid-cols-[72px_minmax(0,1fr)] gap-x-4 py-7 sm:py-8 transition-colors"
                style={{ borderBottom: `1px solid ${LINE}` }}>
                <span
                  className="font-serif-display tabular-nums leading-none pt-1 transition-colors"
                  style={{ fontSize: 'clamp(22px, 2vw, 28px)', letterSpacing: '-0.02em', color: actif ? accent : '#adaaaa', ...serifFont }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <h3
                    className="font-serif-display transition-colors"
                    style={{ fontSize: 'clamp(24px, 2.4vw, 34px)', lineHeight: 1.15, letterSpacing: '-0.015em', color: actif ? accent : '#243037', ...serifFont }}>
                    {titre}
                  </h3>
                  <p className="text-body-lg leading-[1.55] mt-3 max-w-[46ch]" style={{ color: BODY_MUTED, ...bodyFont }}>{texte}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </Bande>
  );
}
