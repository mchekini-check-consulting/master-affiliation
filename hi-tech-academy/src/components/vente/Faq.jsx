import React, { useState } from 'react';
import { TEAL, BODY_MUTED, headingFont, serifFont, bodyFont } from '@/components/design';
import { Bande, Fold } from './atomes';

/**
 * Les objections, une par ligne dépliable (une seule ouverte à la fois).
 * Titre centré en haut, questions dessous dans une colonne de lecture
 * `max-w-3xl` (la largeur FAQ du design système) : pas de colonne vide.
 */
export default function Faq({ faq }) {
  const [ouverte, setOuverte] = useState(0);
  if (!faq || faq.length === 0) return null;

  return (
    <Bande id="faq">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-body-sm font-semibold mb-3" style={{ color: TEAL, ...headingFont }}>Questions fréquentes</p>
          <h2 className="font-serif-display text-h1" style={{ color: '#243037', ...serifFont }}>
            Vous hésitez encore ?
          </h2>
        </div>
        <div style={{ borderTop: '1px solid #dbebff' }}>
          {faq.map((item, i) => (
            <Fold key={item.q} title={item.q} open={ouverte === i} onToggle={() => setOuverte(ouverte === i ? null : i)}>
              <p className="text-body-base leading-[1.6]" style={{ color: BODY_MUTED, ...bodyFont }}>{item.r}</p>
            </Fold>
          ))}
        </div>
      </div>
    </Bande>
  );
}
