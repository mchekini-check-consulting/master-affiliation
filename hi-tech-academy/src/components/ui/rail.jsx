import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Rail au balayage pour les listes de cartes. Sous 768 px : défilement
// horizontal natif, aimanté carte par carte, amorce de la carte suivante et
// barre de position. À partir de 768 px : `className` (la grille d'origine)
// s'applique telle quelle, le rail ne change rien. Tout le responsive est en
// CSS (index.css, `.rail`) ; le JavaScript ne fait que suivre la position.
//
//   <Rail label="Derniers articles" className="grid md:grid-cols-2 gap-8">
//     {cartes}
//   </Rail>
//
// `as` choisit la balise de la piste (`ul` pour une liste de `li`).
export default function Rail({ label, className, as: Track = 'div', children }) {
  const trackRef = useRef(null);
  const thumbRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return undefined;
    let frame = 0;
    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = track;
      // Rien à faire défiler (une seule carte) : pas de barre de position.
      thumb.parentElement.hidden = scrollWidth <= clientWidth + 1;
      thumb.style.width = `${(clientWidth / scrollWidth) * 100}%`;
      thumb.style.left = `${(scrollLeft / scrollWidth) * 100}%`;
    };
    const onScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(update);
    };
    update();
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [children]);

  return (
    <div className="rail" role="region" aria-label={label}>
      <Track className={cn('rail__track', className)} ref={trackRef}>
        {children}
      </Track>
      <div className="rail__progress" aria-hidden="true"><i ref={thumbRef} /></div>
    </div>
  );
}
