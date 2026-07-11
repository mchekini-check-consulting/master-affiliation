import React from 'react';
import { motion } from 'framer-motion';

const HERO_IMG = "/images/e141141b5_Designsanstitre.jpg";

const HeroSection = ({ title, subtitle, actions }) => {
  return (
    <section className="relative w-full" style={{ minHeight: '100vh' }}>
      {/* Background image */}
      <img
        src={HERO_IMG}
        alt="Hero Hi Tech Academy"
        className="absolute inset-0 w-full h-full object-cover"
      />



      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-12 flex items-center" style={{ minHeight: '100vh' }}>
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl pt-24 pb-16"
        >
          {/* Badge */}
          <div className="mb-6 inline-flex">
            <span
              className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{ background: 'rgba(248,177,2,0.15)', color: '#F8B102', border: '1px solid rgba(248,177,2,0.35)' }}
            >
              ✦ Organisme de formation déclaré
            </span>
          </div>

          {/* Title */}
          <h1
            className="font-bold leading-tight text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {title}
          </h1>

          {/* Subtitle */}
          <p
            className="mt-5 leading-relaxed text-sm sm:text-base"
            style={{ color: 'rgba(255,255,255,0.72)', fontFamily: "'Inter', sans-serif" }}
          >
            {subtitle}
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
            {actions && actions.map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                className="h-11 px-6 rounded-lg font-bold text-sm uppercase tracking-widest transition-all duration-200 hover:opacity-90 hover:shadow-lg"
                style={
                  i === 0
                    ? { background: '#F8B102', color: '#000', fontFamily: "'Plus Jakarta Sans', sans-serif" }
                    : { background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)', fontFamily: "'Plus Jakarta Sans', sans-serif" }
                }
              >
                {action.text}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;