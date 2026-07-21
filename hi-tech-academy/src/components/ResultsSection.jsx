import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Smile, ThumbsUp } from 'lucide-react';

// Indicateurs de résultats publiés (obligation de transparence Qualiopi).
const indicators = [
  {
    icon: Smile,
    value: 95,
    suffix: '%',
    label: 'Taux de satisfaction',
    hint: 'des apprenants satisfaits de leur formation',
  },
  {
    icon: ThumbsUp,
    value: 100,
    suffix: '%',
    label: 'Taux de recommandation',
    hint: 'des apprenants recommandent HI-TECH ACADEMY',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  }),
};

// Compteur animé qui démarre à l'entrée dans le viewport.
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
  return (
    <>
      {n}
      {suffix}
    </>
  );
}

export default function ResultsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      id="resultats"
      className="w-full py-16 sm:py-20 lg:py-24"
      style={{ background: 'linear-gradient(135deg, #001a4a 0%, #005064 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-3"
            style={{ color: '#F8B102', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Nos résultats
          </span>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
            style={{ color: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Indicateurs de résultats
          </h2>
          <p
            className="text-sm mt-4 max-w-2xl mx-auto"
            style={{ color: '#c0d4d8', fontFamily: "'Inter', sans-serif" }}>
            La qualité de nos formations mesurée à partir des questionnaires de satisfaction
            à chaud renseignés par les bénéficiaires en fin de formation.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {indicators.map((item, i) => (
            <motion.div
              key={item.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="rounded-3xl px-8 py-10 text-center"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>

              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(248,177,2,0.15)' }}>
                <item.icon className="w-7 h-7" style={{ color: '#F8B102' }} />
              </div>

              <div
                className="text-5xl sm:text-6xl font-bold leading-none mb-3"
                style={{ color: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <CountUp to={item.value} suffix={item.suffix} start={inView} />
              </div>

              <h3
                className="text-lg font-bold mb-2"
                style={{ color: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {item.label}
              </h3>
              <p className="text-sm" style={{ color: '#c0d4d8', fontFamily: "'Inter', sans-serif" }}>
                {item.hint}
              </p>
            </motion.div>
          ))}
        </div>

        <p
          className="text-center text-xs mt-10"
          style={{ color: '#8ea3c0', fontFamily: "'Inter', sans-serif" }}>
          Indicateurs issus des questionnaires de satisfaction à chaud des bénéficiaires — mis à jour
          au 21/07/2026. HI-TECH ACADEMY, organisme de formation certifié Qualiopi.
        </p>
      </div>
    </section>
  );
}
