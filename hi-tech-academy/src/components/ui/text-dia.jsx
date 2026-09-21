import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Mot qui défile : le mot sortant glisse vers le haut en se floutant, le
// suivant arrive du bas, puis un dégradé balaie le texte de droite à gauche.
// Adapté de « text-dia » (21st.dev) : framer-motion au lieu de motion/react,
// dégradé aux couleurs de la marque.
//   <DiaText words={['IA', 'Cloud']} duration={2000} />
export function DiaText({ words, duration = 2000, className, ...props }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, duration);
    return () => clearInterval(interval);
  }, [words, duration]);

  return (
    <span
      className={cn('relative inline-block min-w-[2ch] overflow-hidden align-bottom', className)}
      style={{ verticalAlign: 'bottom' }}
      {...props}>
      {/* Lu par les lecteurs d'écran : le mot animé est masqué pour eux */}
      <span className="sr-only">{words[index]}</span>

      <AnimatePresence initial={false}>
        <motion.span
          key={index}
          aria-hidden="true"
          initial={{ y: '100%', opacity: 0, filter: 'blur(4px)' }}
          animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-100%', opacity: 0, filter: 'blur(4px)' }}
          transition={{
            y: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
            filter: { duration: 0.2 },
          }}
          className="absolute inset-0 inline-block">
          <motion.span
            className="inline-block bg-clip-text pb-1"
            style={{
              WebkitTextFillColor: 'transparent',
              backgroundImage:
                'linear-gradient(90deg, currentColor 50%, #000c5b 50%, #002d74, #0066b0, #9cbdff)',
              backgroundSize: '250% 100%',
            }}
            initial={{ backgroundPosition: '100% 0%' }}
            animate={{ backgroundPosition: '0% 0%' }}
            transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.1 }}>
            {words[index]}
          </motion.span>
        </motion.span>
      </AnimatePresence>

      {/* Réserve la largeur du mot pour éviter les sauts de mise en page */}
      <span className="invisible" aria-hidden="true">{words[index]}</span>
    </span>
  );
}

export default DiaText;
