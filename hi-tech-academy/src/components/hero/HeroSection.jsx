import React from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, Landmark, MonitorPlay, Users } from 'lucide-react';
import { INK, ACCENT, BODY_DARK, Starfield, Pill, headingFont, bodyFont } from '@/components/design';

// Héro « Onlineformapro » : bande sombre pleine hauteur, starfield discret,
// titre géant centré avec mot-clé en dégradé, sous-titre, CTAs en pilules et
// bande de preuves (l'équivalent du bandeau presse d'OFP).
const PROOFS = [
  { icon: BadgeCheck, label: 'Certifié Qualiopi' },
  { icon: Landmark, label: 'Finançable OPCO' },
  { icon: MonitorPlay, label: '100 % à distance, en direct' },
  { icon: Users, label: 'Sessions dès 1 participant' },
];

const HeroSection = ({ title, subtitle, actions }) => {
  return (
    <section className="relative w-full overflow-hidden" style={{ background: INK, minHeight: '92vh' }}>
      <Starfield />

      <div
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center"
        style={{ minHeight: '92vh', paddingTop: '7rem', paddingBottom: '4rem' }}>

        <motion.div
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center">

          {/* Eyebrow */}
          <span
            className="text-[11px] font-extrabold uppercase tracking-[0.3em] mb-6"
            style={{ color: ACCENT, ...headingFont }}>
            Organisme de formation certifié Qualiopi
          </span>

          {/* Title */}
          <h1
            className="font-extrabold text-white leading-[1.05] tracking-tight text-4xl sm:text-5xl lg:text-[4.25rem]"
            style={headingFont}>
            {title}
          </h1>

          {/* Subtitle */}
          <p
            className="mt-7 max-w-2xl leading-relaxed text-sm sm:text-base"
            style={{ color: BODY_DARK, ...bodyFont }}>
            {subtitle}
          </p>

          {/* Actions */}
          <div className="mt-9 flex flex-wrap justify-center gap-3 sm:gap-4">
            {actions && actions.map((action, i) => (
              <Pill
                key={action.text}
                as="button"
                onClick={action.onClick}
                variant={i === 0 ? 'primary' : 'secondary'}
                dark>
                {action.text}
              </Pill>
            ))}
          </div>

          {/* Bande de preuves */}
          <div className="mt-14 flex flex-wrap justify-center gap-3">
            {PROOFS.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  color: 'rgba(255,255,255,0.85)',
                  ...headingFont,
                }}>
                <Icon className="w-4 h-4" style={{ color: ACCENT }} />
                {label}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
