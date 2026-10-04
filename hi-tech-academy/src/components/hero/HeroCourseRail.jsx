import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { CardContent, slides } from '@/components/hero/HeroCourseCarousel';

// Version mobile du carrousel de formations : un rail à plat, au défilement
// natif du navigateur (balayage au doigt, aimantation par `scroll-snap`).
// Aucune commande visible : la barre de progression indique la position et
// sert de minuteur au défilement automatique, qui s'arrête pour de bon dès
// que le visiteur touche le rail.
export default function HeroCourseRail() {
  const railRef = useRef(null);
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const reduced = useReducedMotion();
  const enMarche = auto && !reduced;

  const cardLeft = (index) => {
    const rail = railRef.current;
    const card = rail?.children[index];
    if (!card) return 0;
    return card.offsetLeft - rail.children[0].offsetLeft;
  };

  // Le segment actif se remplit en CSS ; la fin de son animation déclenche le
  // passage à la carte suivante. Un seul minuteur, toujours calé sur l'affichage.
  const next = useCallback(() => {
    setActive((current) => {
      const target = (current + 1) % slides.length;
      railRef.current?.scrollTo({ left: cardLeft(target), behavior: 'smooth' });
      return target;
    });
  }, []);

  // Une fois la main prise par le visiteur, la position vient du défilement.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || enMarche) return undefined;
    let frame = 0;
    const onScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const distances = slides.map((_, index) => Math.abs(cardLeft(index) - rail.scrollLeft));
        setActive(distances.indexOf(Math.min(...distances)));
      });
    };
    rail.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      rail.removeEventListener('scroll', onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [enMarche]);

  const stop = () => setAuto(false);

  return (
    <div className="hcr" role="region" aria-label="Formations mises en avant">
      <div
        className="hcr__rail"
        ref={railRef}
        onPointerDown={stop}
        onTouchStart={stop}
        onWheel={stop}
        onKeyDown={stop}
        onFocusCapture={stop}>
        {slides.map((slide) => (
          <article className="hcc-card hcr__card" key={slide.id}>
            <CardContent slide={slide} />
          </article>
        ))}
      </div>
      <div className="hcr__progress" aria-hidden="true">
        {slides.map((slide, index) => {
          const etat = index < active ? 'is-done' : index === active ? 'is-active' : '';
          return (
            <span key={slide.id} className={etat}>
              {index === active && enMarche && <i key={active} onAnimationEnd={next} />}
            </span>
          );
        })}
      </div>
    </div>
  );
}
