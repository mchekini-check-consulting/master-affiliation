import React, { useState } from 'react';
import { BODY_MUTED, bodyFont } from '@/components/design';
import { Bande, SectionTitle, Fold } from './atomes';

/** Les objections, une par ligne dépliable (une seule ouverte à la fois). */
export default function Faq({ faq }) {
  const [ouverte, setOuverte] = useState(0);
  if (!faq || faq.length === 0) return null;

  return (
    <Bande id="faq">
      <div className="grid lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] gap-x-16">
        <SectionTitle kicker="Questions fréquentes">Vous hésitez encore ?</SectionTitle>
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
