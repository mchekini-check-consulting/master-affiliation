import React from 'react';
import { Star, Quotes } from '@phosphor-icons/react';
import { LINE, BODY, BODY_MUTED, headingFont, serifFont, bodyFont } from '@/components/design';
import { Bande, ZonePhoto, RADIUS } from './atomes';

function Etoiles({ note, taille = 18, couleur }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${note} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          weight={n <= note ? 'fill' : 'regular'}
          style={{ width: taille, height: taille, color: n <= note ? couleur : '#adaaaa' }}
        />
      ))}
    </span>
  );
}

function Signature({ nom, role, entreprise, photo, couleur }) {
  return (
    <div className="flex items-center gap-3">
      {photo ? (
        <ZonePhoto src={photo} alt={nom} ratio="1 / 1" className="w-11 h-11 shrink-0" style={{ borderRadius: 999 }} />
      ) : (
        <span
          className="inline-flex items-center justify-center w-11 h-11 rounded-full text-body-base font-bold shrink-0 text-white"
          style={{ background: couleur, ...headingFont }}>
          {nom.charAt(0)}
        </span>
      )}
      <span className="min-w-0">
        <span className="block text-body-base font-semibold leading-tight" style={{ color: BODY, ...headingFont }}>{nom}</span>
        <span className="block text-body-sm mt-0.5" style={{ color: BODY_MUTED, ...bodyFont }}>
          {role}{entreprise ? `, ${entreprise}` : ''}
        </span>
      </span>
    </div>
  );
}

/**
 * Avis des participants de CETTE formation, avec leur note. Colonne gauche :
 * la moyenne en gros et le nombre d'avis ; à droite : les avis en cartes.
 * Le bloc n'existe pas sans avis réel : un faux témoignage est une fausse
 * preuve. `temoignages` : [{ texte, nom, role, entreprise, photo, note }].
 */
export default function Temoignages({ temoignages, couleur }) {
  if (!temoignages || temoignages.length === 0) return null;

  const notes = temoignages.map((t) => t.note).filter((n) => typeof n === 'number');
  const moyenne = notes.length ? notes.reduce((a, b) => a + b, 0) / notes.length : null;
  const accent = couleur?.fond ?? '#000c5b';

  return (
    <Bande id="avis" tone="pale">
      <div className="grid lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] gap-12 lg:gap-20 items-start">
        <div>
          <p className="text-body-sm font-semibold mb-3" style={{ color: accent, ...headingFont }}>Avis des participants</p>
          <h2 className="font-serif-display text-h1 max-w-[16ch]" style={{ color: '#243037', ...serifFont }}>
            Ils ont suivi cette formation
          </h2>

          {moyenne !== null && (
            <div className="mt-8 pt-8" style={{ borderTop: `1px solid ${LINE}` }}>
              <p className="flex items-baseline gap-2">
                <span className="font-serif-display tabular-nums" style={{ fontSize: 'clamp(48px, 5vw, 72px)', lineHeight: 1, letterSpacing: '-0.02em', color: '#243037', ...serifFont }}>
                  {moyenne.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </span>
                <span className="text-h4" style={{ color: BODY_MUTED, ...headingFont }}>/ 5</span>
              </p>
              <div className="mt-3"><Etoiles note={Math.round(moyenne)} taille={22} couleur={accent} /></div>
              <p className="text-body-sm mt-3" style={{ color: BODY_MUTED, ...bodyFont }}>
                {temoignages.length} avis · évaluations de satisfaction recueillies en fin de session
              </p>
            </div>
          )}
        </div>

        <ul className={`grid gap-4 ${temoignages.length >= 3 ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-2'}`}>
          {temoignages.map((t) => (
            <li
              key={t.nom + t.role}
              className="flex flex-col bg-white p-6 sm:p-7"
              style={{ borderRadius: RADIUS, border: `1px solid ${LINE}` }}>
              <div className="flex items-center justify-between gap-4">
                {typeof t.note === 'number' ? <Etoiles note={t.note} couleur={accent} /> : <span />}
                <Quotes weight="fill" className="w-6 h-6 shrink-0" style={{ color: LINE }} />
              </div>
              <blockquote className="flex-1 text-body-base leading-[1.6] m-0 mt-4" style={{ color: BODY, ...bodyFont }}>
                « {t.texte} »
              </blockquote>
              <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${LINE}` }}>
                <Signature {...t} couleur={accent} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Bande>
  );
}
