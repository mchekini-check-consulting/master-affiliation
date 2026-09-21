import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

// Éventail de cartes animé (GSAP) : entrée élastique, les voisines s'écartent
// au survol, pagination par flèches au-delà de 7 cartes.
// Adapté de « card-fan-carousel » (21st.dev) :
//   - cards : [{ imgUrl, alt?, linkUrl?, title?, subtitle? }]
//   - spread : facteur d'écartement horizontal (1 = éventail pleine largeur)
//   - fit : calcule l'écartement pour que l'éventail tienne dans la largeur
//     de son conteneur (ignore spread) ; fitMargin = marge en largeurs de
//     carte réservée à la rotation des cartes extrêmes (plus petit = plus écarté)
//   - autoRotate : délai en ms entre deux rotations automatiques (0 = désactivé).
//     Chaque carte passe tour à tour au centre ; pause au survol / focus et
//     désactivé si l'utilisateur préfère réduire les animations.
//     Le mouvement est volontairement sobre (fondu + glissement, pas de rebond).
//   - size : 'md' (défaut) ou 'lg' (cartes agrandies)
//   - tilt : facteur d'inclinaison des cartes latérales (1 = ±21°, 0 = cartes droites)
//   - hoverEffect : false pour figer les cartes au survol (aucun écartement ni
//     élévation ; les liens restent cliquables)
// Le gabarit (.fan-layout / .fan-card) est défini dans src/index.css.

const MAX_VISIBLE = 7;
const HALF = 3;

const FAN_POSITIONS = [
  { rot: -21, scale: 0.7756, x: -30, y: 7.3, zIndex: 1 },
  { rot: -14, scale: 0.8498, x: -22, y: 4.0, zIndex: 2 },
  { rot: -7, scale: 0.9346, x: -11, y: 1.3, zIndex: 3 },
  { rot: 0, scale: 1.0, x: 0, y: 0.0, zIndex: 10 },
  { rot: 7, scale: 0.9346, x: 11, y: 1.3, zIndex: 3 },
  { rot: 14, scale: 0.8498, x: 22, y: 4.0, zIndex: 2 },
  { rot: 21, scale: 0.7756, x: 30, y: 7.3, zIndex: 1 },
];

function getResponsiveMultiplier(width) {
  if (width < 480) return 0.28;
  if (width < 640) return 0.38;
  if (width < 768) return 0.5;
  if (width < 1024) return 0.75;
  return 1.0;
}

/** Réduit les décalages verticaux quand la fenêtre est trop basse. */
function getHeightMultiplier(width) {
  let idealPx;
  if (width < 480) idealPx = 22 * 16;
  else if (width < 640) idealPx = 26 * 16;
  else if (width < 768) idealPx = 28 * 16;
  else if (width < 1024) idealPx = 34 * 16;
  else idealPx = 38 * 16;

  const available = window.innerHeight * 0.7;
  return available >= idealPx ? 1 : available / idealPx;
}

function getSlotConfig(totalCards, slot) {
  if (totalCards >= MAX_VISIBLE) return FAN_POSITIONS[slot];
  const center = totalCards >> 1;
  const distance = totalCards > 1 ? (slot - center) / center : 0;
  const absDistance = Math.abs(distance);
  return {
    rot: distance * 21,
    scale: 1.0 - 0.2244 * absDistance * absDistance,
    x: distance * 30,
    y: absDistance * absDistance * 7.3,
    zIndex: 10 - Math.abs(slot - center),
  };
}

const ARROW_CLASSES =
  "relative flex items-center justify-center rounded-full border-[1.5px] border-[#000c5b]/15 bg-white/70 backdrop-blur-[16px] text-[#000c5b]/60 cursor-pointer shrink-0 z-30 outline-none shadow-[0_4px_20px_rgba(0,12,91,0.12)] hover:border-[#000c5b]/35 hover:text-[#000c5b] active:opacity-70 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[#0066b0]";

function CardContent({ card, index, large }) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <img
        src={card.imgUrl}
        loading="lazy"
        alt={card.alt || card.title || `Carte ${index + 1}`}
        className="absolute inset-0 z-10 h-full w-full object-cover" />
      {(card.title || card.subtitle) && (
        <>
          <div
            className={`absolute inset-x-0 bottom-0 z-30 text-left ${large ? 'p-6' : 'p-4'}`}>
            {card.subtitle && (
              <span
                className="block text-caption font-semibold uppercase tracking-wider"
                style={{ color: '#9cbdff', fontFamily: "'Inter', sans-serif" }}>
                {card.subtitle}
              </span>
            )}
            {card.title && (
              <span
                className={`mt-1 block font-semibold leading-snug text-white ${large ? 'text-xl' : 'text-body-base'}`}
                style={{ fontFamily: "'Inter', sans-serif" }}>
                {card.title}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function CardFanCarousel({ cards, spread = 1, fit = false, fitMargin = 1.8, autoRotate = 0, size = 'md', tilt = 1, hoverEffect = true, className = '' }) {
  const containerRef = useRef(null);
  const isAnimating = useRef(false);
  const hasEntered = useRef(false);
  const directionRef = useRef(null);
  const prevVisible = useRef(new Set());
  const pausedRef = useRef(false);

  const totalCards = cards.length;
  const needsPagination = totalCards > MAX_VISIBLE;
  const [centerIndex, setCenterIndex] = useState(needsPagination ? HALF : totalCards >> 1);

  const getVisibleMap = useCallback((center) => {
    const map = new Map();
    if (!needsPagination) {
      // Toutes les cartes sont visibles : on décale leurs positions pour que
      // la carte `center` occupe la place centrale (rotation circulaire).
      const middle = totalCards >> 1;
      cards.forEach((_, i) => map.set(i, (((i - center + middle) % totalCards) + totalCards) % totalCards));
      return map;
    }
    for (let slot = 0; slot < MAX_VISIBLE; slot++) {
      map.set(((center + slot - HALF) % totalCards + totalCards) % totalCards, slot);
    }
    return map;
  }, [totalCards, needsPagination, cards]);

  const cycle = useCallback((direction) => {
    if (isAnimating.current || totalCards < 2) return;
    isAnimating.current = true;
    directionRef.current = direction;
    setCenterIndex((prev) =>
      direction === 'right' ? (prev + 1) % totalCards : (prev - 1 + totalCards) % totalCards
    );
  }, [totalCards]);

  // Rotation automatique
  useEffect(() => {
    if (!autoRotate || totalCards < 2) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = setInterval(() => {
      if (!pausedRef.current && !document.hidden) cycle('right');
    }, autoRotate);
    return () => clearInterval(id);
  }, [autoRotate, totalCards, cycle]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !totalCards) return undefined;

    const cardElements = Array.from(container.querySelectorAll('.fan-card'));
    if (!cardElements.length) return undefined;

    const visibleMap = getVisibleMap(centerIndex);
    const previouslyVisible = prevVisible.current;
    const direction = directionRef.current;
    const isFirstMount = !hasEntered.current;
    // Écartement : fixe (spread) ou ajusté à la largeur du conteneur (fit).
    // Les cartes extrêmes sont décalées de 30rem × multiplicateur ; on garde
    // ~1.8 largeur de carte de marge pour leur rotation.
    const getMultiplier = () => {
      if (!fit) return getResponsiveMultiplier(window.innerWidth) * spread;
      const cardWidth = cardElements[0].offsetWidth;
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const edge = (container.clientWidth - cardWidth * fitMargin) / 2;
      return Math.max(0, Math.min(1, edge / (30 * rem)));
    };
    const multiplier = getMultiplier();
    const hMult = getHeightMultiplier(window.innerWidth);
    const slotCount = needsPagination ? MAX_VISIBLE : totalCards;
    const config = (slot) => {
      const c = getSlotConfig(slotCount, slot);
      return { ...c, rot: c.rot * tilt, y: c.y * tilt };
    };

    if (isFirstMount) isAnimating.current = true;

    let completedCount = 0;
    const visibleCount = visibleMap.size;
    const onCardDone = () => {
      if (++completedCount >= visibleCount) {
        isAnimating.current = false;
        if (isFirstMount) hasEntered.current = true;
      }
    };

    cardElements.forEach((card, cardIndex) => {
      const slot = visibleMap.get(cardIndex);
      const wasVisible = previouslyVisible.has(cardIndex);

      if (slot !== undefined) {
        const { x, y, rot, scale, zIndex } = config(slot);
        const target = {
          x: `${x * multiplier}rem`,
          y: `${y * hMult}rem`,
          rotation: rot,
          scale,
          opacity: 1,
          zIndex,
        };

        if (isFirstMount) {
          // Entrée sobre : léger fondu montant, sans rebond élastique.
          gsap.set(card, { x: `${x * multiplier}rem`, y: `${y * hMult + 1.6 * hMult}rem`, rotation: rot, scale: scale * 0.96, opacity: 0 });
          gsap.to(card, { ...target, duration: 0.7, ease: 'power2.out', delay: 0.15 + slot * 0.05, onComplete: onCardDone });
        } else if (!wasVisible) {
          const enterX = direction === 'right' ? 40 : -40;
          gsap.set(card, { x: `${enterX}rem`, y: `${y * hMult}rem`, rotation: direction === 'right' ? 30 : -30, scale: 0.5, opacity: 0 });
          gsap.to(card, { ...target, duration: 0.6, ease: 'power2.out', onComplete: onCardDone });
        } else {
          gsap.to(card, { ...target, duration: 0.6, ease: 'power3.out', onComplete: onCardDone });
        }
      } else if (wasVisible) {
        const exitX = direction === 'right' ? -40 : 40;
        gsap.to(card, { x: `${exitX}rem`, opacity: 0, scale: 0.5, rotation: direction === 'right' ? -30 : 30, duration: 0.4, ease: 'power2.in', zIndex: 0 });
      } else if (isFirstMount) {
        gsap.set(card, { opacity: 0, scale: 0.3, x: 0, y: 0, zIndex: 0 });
      }
    });

    prevVisible.current = new Set(visibleMap.keys());

    // Survol : la carte visée monte, les voisines s'écartent
    const visibleEntries = [];
    cardElements.forEach((el, i) => {
      const slot = visibleMap.get(i);
      if (slot !== undefined) visibleEntries.push({ el, slot });
    });
    visibleEntries.sort((a, b) => a.slot - b.slot);

    let activeSlot = null;
    let leaveTimer = null;
    const centerSlot = visibleEntries.length >> 1;

    const updateHoverLayout = (hoveredSlot) => {
      const mult = getMultiplier();
      const hM = getHeightMultiplier(window.innerWidth);

      visibleEntries.forEach(({ el, slot }) => {
        const base = config(slot);
        let targetX = base.x * mult;
        let targetY = base.y * hM;
        let targetRot = base.rot;
        let targetScale = base.scale;
        let delay = 0;

        if (hoveredSlot !== null) {
          const distance = Math.abs(slot - hoveredSlot);
          delay = distance * 0.015;

          if (slot === hoveredSlot) {
            targetY -= 1.1 * hM;
            targetScale *= 1.03;
          } else {
            const normalized = centerSlot > 0 ? (slot - centerSlot) / centerSlot : 0;
            const pushStrength = 2.6 * (1 - Math.abs(normalized)) * (1 + 0.2 * Math.max(0, 3 - distance));

            if (slot < hoveredSlot) {
              targetX -= pushStrength * mult;
              targetRot -= 1.2 / (distance + 1);
            } else {
              targetX += pushStrength * mult;
              targetRot += 1.2 / (distance + 1);
            }

            if (slot === visibleEntries.length - 1 && hoveredSlot < centerSlot) targetY -= 1 * hM;
            if (slot === 0 && hoveredSlot > centerSlot) targetY -= 1 * hM;
          }
        } else {
          delay = Math.abs(slot - centerSlot) * 0.02;
        }

        gsap.to(el, {
          x: `${targetX}rem`, y: `${targetY}rem`, rotation: targetRot, scale: targetScale,
          duration: 0.4, delay, ease: 'power2.out', overwrite: 'auto',
        });
        // La carte survolée passe au premier plan pour que son titre soit lisible
        gsap.set(el, { zIndex: slot === hoveredSlot ? 20 : base.zIndex });
      });
    };

    const enterHandlers = hoverEffect
      ? visibleEntries.map(({ el, slot }) => {
          const handler = () => {
            if (isAnimating.current) return;
            if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }
            if (activeSlot !== slot) { activeSlot = slot; updateHoverLayout(slot); }
          };
          el.addEventListener('mouseenter', handler);
          el.addEventListener('focus', handler);
          return { el, handler };
        })
      : [];

    const onMouseLeave = () => {
      if (isAnimating.current) return;
      if (leaveTimer) clearTimeout(leaveTimer);
      leaveTimer = setTimeout(() => { activeSlot = null; updateHoverLayout(null); }, 50);
    };
    if (hoverEffect) container.addEventListener('mouseleave', onMouseLeave);

    const onResize = () => { if (!isAnimating.current) updateHoverLayout(activeSlot); };
    window.addEventListener('resize', onResize);

    return () => {
      enterHandlers.forEach(({ el, handler }) => {
        el.removeEventListener('mouseenter', handler);
        el.removeEventListener('focus', handler);
      });
      container.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', onResize);
      if (leaveTimer) clearTimeout(leaveTimer);
    };
  }, [centerIndex, totalCards, getVisibleMap, needsPagination, spread, fit, fitMargin, tilt, hoverEffect]);

  if (!totalCards) return null;

  const chevron = (direction) => (
    <svg className="relative z-[2] h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points={direction === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
    </svg>
  );

  return (
    <div className={`relative z-20 flex w-full flex-col items-center ${className}`}>
      <div
        ref={containerRef}
        className={`fan-layout ${size === 'lg' ? 'fan-layout--lg' : ''} relative flex w-full items-center justify-center`}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
        onFocus={() => { pausedRef.current = true; }}
        onBlur={() => { pausedRef.current = false; }}>
        {cards.map((card, index) => {
          const key = card.linkUrl || index;
          const content = <CardContent card={card} index={index} large={size === 'lg'} />;
          if (!card.linkUrl) return <div key={key} className="fan-card">{content}</div>;
          if (card.linkUrl.startsWith('http')) {
            return (
              <a key={key} href={card.linkUrl} target="_blank" rel="noopener noreferrer" className="fan-card block cursor-pointer">
                {content}
              </a>
            );
          }
          return (
            <Link key={key} to={card.linkUrl} className="fan-card block cursor-pointer">
              {content}
            </Link>
          );
        })}
      </div>

      {needsPagination && (
        <div className="z-30 mt-4 flex items-center justify-center gap-4 md:mt-6">
          <button type="button" className={`${ARROW_CLASSES} h-10 w-10 md:h-12 md:w-12`} onClick={() => cycle('left')} aria-label="Précédent">
            {chevron('left')}
          </button>
          <div className="flex items-center gap-2">
            {cards.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${i === centerIndex ? 'scale-[1.3] bg-[#000c5b]' : 'bg-[#000c5b]/20'}`} />
            ))}
          </div>
          <button type="button" className={`${ARROW_CLASSES} h-10 w-10 md:h-12 md:w-12`} onClick={() => cycle('right')} aria-label="Suivant">
            {chevron('right')}
          </button>
        </div>
      )}
    </div>
  );
}
