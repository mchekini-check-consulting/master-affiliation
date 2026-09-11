import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, Check, Star } from 'lucide-react';
import { NAVY, TEAL, ACCENT, HERO_GRADIENT, headingFont, serifFont, bodyFont } from '@/components/design';

// Héro du thème « École » : dégradé doux du vert menthe au blanc (pointe de
// bleu pâle), titre serif géant en phrases courtes, pilule bleue, rangée de
// coches — et à droite un éventail de cartes photos cliquables.
const CHECKS = [
  'Organisme certifié Qualiopi',
  'Finançable OPCO',
  '100 % à distance, en direct',
];

const CARDS = [
  { image: '/images/ce6db5335_generated_76fdd024.png', label: 'Je finance ma formation', href: '/financements' },
  { image: '/images/cbdcfde73_generated_f57bba76.png', label: 'Je choisis ma formation', href: '/formations', main: true },
  { image: '/images/3611d0da4_generated_60e6197e.png', label: 'Je forme mes équipes', href: '/#contact' },
];

const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden" style={{ background: HERO_GRADIENT }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-36 pb-20 lg:pt-44 lg:pb-28 grid lg:grid-cols-2 gap-14 items-center">

        {/* Colonne texte */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>

          {/* Ligne de preuve */}
          <p className="flex flex-wrap items-center gap-2 text-sm mb-6" style={{ color: '#1f2124', ...bodyFont }}>
            <span className="flex items-center gap-1 font-bold" style={headingFont}>
              <Star className="w-4 h-4" style={{ color: TEAL, fill: TEAL }} />
              95 % de satisfaction
            </span>
            <span style={{ color: '#5a6478' }}>· organisme de formation certifié Qualiopi</span>
          </p>

          <h1
            className="font-serif-display font-bold leading-[1.06] text-5xl sm:text-6xl lg:text-[4.5rem] mb-7"
            style={{ color: '#101418', ...serifFont }}>
            Apprendre.<br />Progresser.<br />Réussir.
          </h1>

          <p className="max-w-md text-base leading-relaxed mb-8" style={{ color: '#3d4451', ...bodyFont }}>
            Cloud, intelligence artificielle, facturation électronique : des formations 100 % à distance,
            animées en direct par des experts, conçues pour s'adapter à votre rythme et à vos objectifs.
          </p>

          <Link
            to="/formations"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-[15px] text-white transition-all hover:opacity-90 hover:shadow-xl mb-9"
            style={{ background: ACCENT, ...headingFont }}>
            Choisir ma formation
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {CHECKS.map((c) => (
              <span key={c} className="flex items-center gap-1.5 text-[13px]" style={{ color: '#1f2124', ...bodyFont }}>
                <Check className="w-4 h-4" style={{ color: TEAL }} />
                {c}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Éventail de cartes photos */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex items-center justify-center relative"
          style={{ minHeight: 420 }}>
          {CARDS.map(({ image, label, href, main }, i) => (
            <Link
              key={label}
              to={href}
              className="absolute overflow-hidden rounded-3xl group"
              style={{
                width: main ? 240 : 220,
                height: main ? 400 : 320,
                left: `${16 + i * 27}%`,
                zIndex: main ? 10 : 5,
                boxShadow: main ? '0 24px 50px rgba(0,56,44,0.30)' : '0 12px 30px rgba(0,56,44,0.18)',
              }}>
              <img
                src={image}
                alt={label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,40,30,0.85) 100%)' }} />
              <span
                className="absolute bottom-5 left-0 right-0 px-4 text-center text-white font-serif-display font-semibold"
                style={{ fontSize: main ? 19 : 15, ...serifFont }}>
                {label} <ArrowRight className="inline w-4 h-4" />
              </span>
            </Link>
          ))}
        </motion.div>
      </div>

      {/* Mobile : boutons d'orientation */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 sm:px-6 pb-12 flex flex-col gap-3">
        {CARDS.map(({ label, href }) => (
          <Link
            key={label}
            to={href}
            className="flex items-center justify-between px-5 py-4 rounded-2xl bg-white font-semibold text-sm"
            style={{ color: NAVY, border: '1px solid #e5e5e5', ...headingFont }}>
            {label}
            <ArrowRight className="w-4 h-4" />
          </Link>
        ))}
      </div>

      {/* Filet bas discret */}
      <div className="h-px w-full" style={{ background: 'rgba(0,76,60,0.08)' }} />
      <span className="sr-only"><BadgeCheck className="w-4 h-4" /></span>
    </section>
  );
};

export default HeroSection;
