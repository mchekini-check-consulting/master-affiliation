import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

// Défilement « panneaux empilés » : chaque panneau est épinglé le temps que le
// suivant se redresse depuis 30° d'inclinaison, pivot en bas à gauche.
//
// Écarts assumés avec le composant d'origine :
//  · TypeScript → JSX, et `@gsap/react` n'est PAS installé : son hook `useGSAP`
//    n'est qu'un `useLayoutEffect` + `gsap.context()`, écrit ici directement.
//    Une dépendance de moins.
//  · `min-h-screen` → `min-h-[100svh]` : sur mobile, `vh` inclut la barre
//    d'URL, ce qui décale les points d'épinglage au premier défilement.
//  · `prefers-reduced-motion` ne désactive pas seulement l'animation : aucun
//    `ScrollTrigger` n'est créé, les panneaux s'enchaînent normalement.

/** Un panneau. La couleur de fond et le texte viennent de l'appelant. */
export function StoryPanel({ className, style = {}, children, 'aria-label': ariaLabel }) {
  return (
    <section
      data-story-panel
      aria-label={ariaLabel}
      className={cn('relative min-h-[100svh] w-full overflow-hidden', className)}>
      <div
        className="story-panel__inner relative flex min-h-[100svh] w-full flex-col justify-between gap-6 will-change-transform"
        style={{ transformOrigin: 'bottom left', ...style }}>
        <div className="max-w-site mx-auto flex min-h-[100svh] w-full flex-col justify-between gap-8 px-4 py-16 sm:px-6 sm:py-20">
          {children}
        </div>
      </div>
    </section>
  );
}

export default function StoryScroll({ children, className, 'aria-label': ariaLabel }) {
  const conteneur = useRef(null);
  const [motionReduite, setMotionReduite] = useState(false);
  const nbPanneaux = React.Children.count(children);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const maj = () => setMotionReduite(mq.matches);
    maj();
    mq.addEventListener('change', maj);
    return () => mq.removeEventListener('change', maj);
  }, []);

  useLayoutEffect(() => {
    if (!conteneur.current || motionReduite) return undefined;

    // `gsap.context` limite les sélecteurs au conteneur et permet de tout
    // défaire en un appel — y compris les ScrollTrigger créés à l'intérieur.
    const ctx = gsap.context(() => {
      const panneaux = gsap.utils.toArray('[data-story-panel]');
      if (panneaux.length === 0) return;

      panneaux.forEach((panneau, i) => {
        gsap.set(panneau, { zIndex: i + 1 });
        const inner = panneau.querySelector('.story-panel__inner');
        if (!inner) return;

        if (i > 0) {
          gsap.set(inner, { rotation: 30, transformOrigin: 'bottom left' });
          gsap.to(inner, {
            rotation: 0,
            ease: 'none',
            scrollTrigger: { trigger: panneau, start: 'top bottom', end: 'top 25%', scrub: true },
          });
        }

        if (i < panneaux.length - 1) {
          ScrollTrigger.create({
            trigger: panneau,
            start: 'bottom bottom',
            end: 'bottom top',
            pin: true,
            pinSpacing: false,
          });
        }
      });

      ScrollTrigger.refresh();
    }, conteneur);

    return () => ctx.revert();
  }, [motionReduite, nbPanneaux]);

  return (
    <div ref={conteneur} aria-label={ariaLabel} className={cn('w-full overflow-x-hidden', className)}>
      {children}
    </div>
  );
}
