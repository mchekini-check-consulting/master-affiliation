import React from 'react';
import { motion } from 'framer-motion';

const items = [
  '🚀 Lancez votre carrière tech',
  '✦ 95% de taux d\'insertion',
  '🎓 Formations intensives & certifiantes',
  '✦ +2 000 étudiants formés',
  '💡 Mentorat d\'élite',
  '✦ Apprenez. Créez. Réussissez.',
  '🌍 Rejoignez la révolution digitale',
  '✦ Inscription ouverte maintenant',
];

const content = [...items, ...items];

export default function MarqueeStrip() {
  return (
    <div
      className="w-full overflow-hidden py-3 sm:py-4 flex items-center"
      style={{ backgroundColor: '#F8B102' }}
    >
      <motion.div
        className="flex gap-8 sm:gap-12 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ repeat: Infinity, duration: 28, ease: 'linear' }}
      >
        {content.map((item, i) => (
          <span
            key={i}
            className="text-xs sm:text-sm font-bold text-black uppercase tracking-widest shrink-0"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}