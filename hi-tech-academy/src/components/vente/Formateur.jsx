import React from 'react';
import { TEAL, LINE, BODY, BODY_MUTED, headingFont, serifFont, bodyFont } from '@/components/design';
import { Bande, CheckLine, ZonePhoto } from './atomes';

/**
 * Le formateur : portrait, titre, bio et preuves. Rendu seulement quand les
 * données existent — on ne fabrique ni portrait ni parcours.
 */
export default function Formateur({ formateur }) {
  if (!formateur || !formateur.nom) return null;
  const { nom, titre, bio, photo, preuves = [] } = formateur;

  return (
    <Bande id="formateur" tone="pale">
      <div className="grid md:grid-cols-[minmax(0,300px)_minmax(0,1fr)] gap-10 md:gap-16 items-start">
        <ZonePhoto src={photo} alt={`Portrait de ${nom}`} ratio="4 / 5" />
        <div className="min-w-0">
          <p className="text-body-sm font-semibold mb-3" style={{ color: TEAL, ...headingFont }}>Votre formateur</p>
          <h2 className="font-serif-display text-h1" style={{ color: '#243037', ...serifFont }}>{nom}</h2>
          {titre && <p className="text-h4 mt-2" style={{ color: BODY, ...headingFont }}>{titre}</p>}
          {bio && <p className="text-body-lg leading-[1.6] mt-5 max-w-measure" style={{ color: BODY_MUTED, ...bodyFont }}>{bio}</p>}
          {preuves.length > 0 && (
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mt-8 pt-8" style={{ borderTop: `1px solid ${LINE}` }}>
              {preuves.map((p) => <li key={p}><CheckLine>{p}</CheckLine></li>)}
            </ul>
          )}
        </div>
      </div>
    </Bande>
  );
}
