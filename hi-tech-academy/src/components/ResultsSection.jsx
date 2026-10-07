import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { NAVY, MINT, headingFont, serifFont, bodyFont } from '@/components/design';

// Indicateurs de résultats publiés (obligation de transparence Qualiopi).
// Bande marine pleine largeur, le contenu reste dans `max-w-site` : même
// rythme que les autres bandes sombres du site (héro, bonus des pages de
// vente).
const indicators = [
  { value: 95, suffix: '%', label: 'Taux de satisfaction', detail: 'Participants satisfaits ou très satisfaits' },
  { value: 100, suffix: '%', label: 'Taux de recommandation', detail: 'Participants qui recommanderaient la formation' },
];

/** Compteur animé qui démarre à l'entrée dans le viewport. */
function CountUp({ to, suffix, start }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return undefined;
    // Onglet masqué ou animations réduites : afficher directement la valeur
    // finale (pas d'animation, indicateur exact).
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || document.visibilityState === 'hidden') {
      setN(to);
      return undefined;
    }
    let raf;
    let t0;
    const duration = 1400;
    const tick = (t) => {
      if (t0 === undefined) t0 = t;
      const p = Math.min((t - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Filet de sécurité : garantit la valeur finale même si rAF est throttlé
    // (onglet en arrière-plan), l'indicateur reste toujours exact.
    const settle = setTimeout(() => setN(to), duration + 100);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, [start, to]);
  return <>{n}{suffix}</>;
}

export default function ResultsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} id="resultats" className="py-16 sm:py-24" style={{ background: NAVY }}>
      <div className="max-w-site mx-auto px-4 sm:px-6">
        <div>
          <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 sm:gap-10 lg:gap-20 items-start">
            <div>
              <p className="text-body-sm font-semibold mb-3" style={{ color: MINT, ...headingFont }}>Nos résultats</p>
              <h2 className="font-serif-display text-h1 max-w-[16ch] text-white" style={serifFont}>
                Ce que nos participants déclarent en fin de session
              </h2>
              <p className="text-body-base leading-[1.6] mt-4 max-w-measure" style={{ color: '#dbebff', ...bodyFont }}>
                Mesuré à partir des questionnaires de satisfaction à chaud, renseignés par chaque
                bénéficiaire à l&apos;issue de sa formation. Publié tel quel.
              </p>
            </div>

            {/* Une liste de définitions : le chiffre est la valeur, le libellé
                son terme. `tabular` fige la largeur des chiffres pour que la
                mise en page ne sautille pas pendant le décompte.
                Sous 640 px, chaque indicateur tient sur une ligne : le chiffre
                (40 px) à gauche, son libellé à droite. Le second filet, en
                #002d74 donc invisible sur le panneau, y passe en #0066b0 pour
                séparer les deux lignes. */}
            <dl className="grid sm:grid-cols-2 gap-x-12">
              {indicators.map(({ value, suffix, label, detail }, i) => (
                <div
                  key={label}
                  className={`grid grid-cols-[96px_minmax(0,1fr)] gap-x-4 items-start py-5 border-t-2 sm:block sm:pt-6 sm:pb-2 ${i === 0 ? 'border-[#9cbdff]' : 'border-[#0066b0] sm:border-[#002d74]'}`}>
                  <dd
                    className="row-span-2 font-serif-display tabular leading-none text-white text-[40px] sm:text-[clamp(48px,5vw,72px)]"
                    style={{ letterSpacing: '-0.02em', ...serifFont }}>
                    <CountUp to={value} suffix={suffix} start={inView} />
                  </dd>
                  <dt className="text-h5 sm:text-h4 sm:mt-4 text-white [overflow-wrap:anywhere]" style={headingFont}>{label}</dt>
                  <p className="text-body-sm leading-[1.5] mt-1 max-w-[30ch]" style={{ color: '#dbebff', ...bodyFont }}>{detail}</p>
                </div>
              ))}
            </dl>
          </div>

          {/* Mention réglementaire : elle reste, c'est une obligation de transparence. */}
          <p className="text-caption mt-6 sm:mt-12 pt-5 max-w-measure" style={{ color: '#dbebff', borderTop: '1px solid #002d74', ...bodyFont }}>
            Indicateurs issus des questionnaires de satisfaction à chaud des bénéficiaires, mis à jour au
            21/07/2026. Hi-Tech Academy, organisme de formation certifié Qualiopi.
          </p>
        </div>
      </div>
    </section>
  );
}
