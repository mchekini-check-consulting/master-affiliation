import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*                                  geometry                                  */
/* -------------------------------------------------------------------------- */

/** Un nombre est lu en pixels ; une chaîne passe telle quelle (`2rem` compris). */
const size = (value) => (typeof value === 'number' ? `${value}px` : value);

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

/**
 * La rangée, c'est quatre colonnes et une traîne de lattes ; c'est une bande
 * qui glisse, pas un anneau qui tourne.
 *
 * Les quatre colonnes se partagent ce qui reste une fois la carte ouverte, les
 * lattes et les gouttières payées. La carte ouverte part d'un bloc 16:9 puis en
 * rend un peu — d'où la première part négative. La colonne −1 et tout ce qui
 * dépasse la colonne 3 est une latte : une carte qui quitte le devant se réduit
 * donc en latte et poursuit sa sortie par la gauche.
 */
const SHARES = [-0.06, 0.61, 0.3, 0.15];

/** La colonne survolée prend plus de place. */
const STRETCHED = [0, 0.71, 0.4, 0.25];

/** Ses voisines cèdent un peu pour la payer. */
const SQUEEZED = [-0.12, 0.59, 0.28, 0.13];

/* -------------------------------------------------------------------------- */
/*                                    hooks                                   */
/* -------------------------------------------------------------------------- */

/** Vrai tant que le lecteur demande moins de mouvement. */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const read = () => setReduced(query.matches);
    read();
    query.addEventListener('change', read);
    return () => query.removeEventListener('change', read);
  }, []);

  return reduced;
}

/* -------------------------------------------------------------------------- */
/*                                 component                                  */
/* -------------------------------------------------------------------------- */

/**
 * Un carrousel qui donne toute la place à un panneau et comprime les autres en
 * lattes sur la droite. Ouvrir une latte l'élargit et fait glisser la rangée ;
 * le texte et le bouton en dessous se fondent pour suivre.
 *
 * Note d'intégration : la version d'origine embarquait la police Geist via une
 * CDN. Elle est retirée — le site impose Montserrat / Poppins / DM Sans, et le
 * composant hérite simplement de la typographie de la page.
 */
export function SqueezeCarousel({
  slides,
  defaultIndex = 0,
  onIndexChange,
  height = 'clamp(150px, 22cqi, 240px)',
  slatWidth = 8,
  slatGap = 8,
  gap = 14,
  radius = 12,
  duration = 900,
  hoverGrow = true,
  autoplay = false,
  interval = 6000,
  controls = true,
  accent = '#243037',
  accentForeground = '#ffffff',
  label = 'Formations',
  panelClassName,
  className,
  style,
  ...props
}) {
  const count = slides.length;
  const wrap = (i) => ((i % count) + count) % count;

  // Quatre colonnes plus une traîne de lattes. Moins de slides, traîne plus courte.
  const slats = clamp(count - 4, 1, 3);
  const visible = 4 + slats;

  const reduced = useReducedMotion();
  const ms = reduced ? 0 : duration;

  const ids = useId();
  const seed = useRef(0);
  const strip = useRef(null);

  /* --- la bande --------------------------------------------------------- */

  const window0 = () =>
    Array.from({ length: visible }, (_, p) => ({
      key: seed.current++,
      slide: wrap(defaultIndex + p),
    }));

  const [cards, setCards] = useState(window0);
  // La colonne où chaque carte se pose : sa place dans la bande, plus ceci.
  // Avancer d'un cran la pousse vers le bas : la carte qui était en colonne 0
  // passe en colonne −1 — une latte, en route vers la sortie par la gauche.
  const [column, setColumn] = useState(0);
  // Lu par le nettoyage ci-dessous, qui part d'un timer et ne peut donc pas se
  // fier à une valeur capturée au moment où il a été programmé.
  const columnRef = useRef(0);
  const forward = useRef(true);
  // De combien la bande est décalée, compté en lattes. Normalement identique à
  // `column` ; les deux divergent le temps d'une frame après une coupe ou avant
  // un retour en arrière, quand la bande doit bouger sans que ça se voie.
  const [slid, setSlid] = useState(0);
  const [still, setStill] = useState(false);
  const [hover, setHover] = useState(-1);

  const open = cards[-column]?.slide ?? defaultIndex;
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Un cran laisse la bande plus longue que nécessaire. Une fois le mouvement
  // fini, on la recoupe aux cartes affichées et on remet les compteurs à zéro —
  // même image, donc rien ne doit s'animer au passage.
  const settle = useCallback(() => {
    setCards((current) =>
      forward.current ? current.slice(-visible) : current.slice(0, visible),
    );
    columnRef.current = 0;
    setColumn(0);
    setSlid(0);
    setStill(true);
  }, [visible]);

  useLayoutEffect(() => {
    if (!still) return undefined;
    const id = requestAnimationFrame(() => setStill(false));
    return () => cancelAnimationFrame(id);
  }, [still]);

  const step = useCallback(
    (by) => {
      if (count < 2 || by === 0) return;

      timers.current.forEach(clearTimeout);
      timers.current = [];
      forward.current = by > 0;

      if (by > 0) {
        // La latte entrante rejoint la traîne à pleine taille avant que rien ne
        // bouge : le bout de la rangée n'est jamais à court d'une latte.
        setCards((current) => [
          ...current,
          ...Array.from({ length: by }, (_, k) => ({
            key: seed.current++,
            slide: wrap(current[current.length - 1].slide + 1 + k),
          })),
        ]);
        columnRef.current -= by;
        setColumn(columnRef.current);
        setSlid((s) => s - by);
      } else {
        // En arrière, la bande doit grandir par l'avant, ce qui pousse tout à
        // droite. On la décale à gauche d'autant sans transition, puis on la
        // laisse revenir en douceur.
        setCards((current) => [
          ...Array.from({ length: -by }, (_, k) => ({
            key: seed.current++,
            slide: wrap(current[0].slide - (-by - k)),
          })),
          ...current,
        ]);
        setSlid((s) => s + by);
        setStill(true);
        timers.current.push(window.setTimeout(() => setSlid(0), 0));
      }

      timers.current.push(window.setTimeout(settle, ms + 20));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, ms, settle],
  );

  useEffect(() => {
    onIndexChange?.(open);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* --- lecture automatique ---------------------------------------------- */

  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!autoplay || paused || reduced || count < 2) return undefined;
    const timer = window.setTimeout(() => step(1), interval);
    return () => clearTimeout(timer);
  }, [autoplay, paused, reduced, count, open, interval, step]);

  /* --- clavier ----------------------------------------------------------- */

  const onKeyDown = (event) => {
    const moves = { ArrowRight: 1, ArrowLeft: -1 };
    const by = moves[event.key];
    if (by === undefined) return;
    event.preventDefault();
    step(by);
  };

  if (!count) return null;

  /* --- rendu ------------------------------------------------------------- */

  const slat = size(slatWidth);
  const shares = hoverGrow && hover >= 0 && hover <= 3 && !reduced ? null : SHARES;

  /** La part que prend une colonne, une fois le pointeur consulté. */
  const shareOf = (col) => {
    if (shares) return SHARES[col];
    return hover === col ? STRETCHED[col] : SQUEEZED[col];
  };

  /** La largeur d'une colonne, calculée en CSS pour n'avoir rien à mesurer. */
  const widthOf = (col) => {
    if (col < 0 || col > 3) return slat;
    if (col === 0) return `calc(var(--sq-hero) + var(--sq-room) * ${shareOf(0)})`;
    return `calc(var(--sq-room) * ${shareOf(col)})`;
  };

  const vars = {
    '--sq-h': size(height),
    '--sq-gap': size(gap),
    '--sq-slat-gap': size(slatGap),
    '--sq-radius': size(radius),
    '--sq-ms': `${ms}ms`,
    // easeOutExpo, la courbe sur laquelle glisse l'original
    '--sq-ease': 'cubic-bezier(0.16, 1, 0.3, 1)',
    '--sq-fill': accent,
    '--sq-on-fill': accentForeground,
    // Un bloc 16:9 fixe à la fois la carte ouverte et la taille à laquelle
    // chaque image est dessinée : une image garde donc une seule échelle, aussi
    // étroite que devienne sa carte.
    '--sq-hero': 'calc(var(--sq-h) * 16 / 9)',
    '--sq-room': `calc(100cqi - var(--sq-hero) - ${slats} * var(--sq-slat-gap) - 3 * var(--sq-gap) - ${slats} * ${slat})`,
  };

  const move = `translateX(calc(${slid} * (${slat} + var(--sq-gap))))`;

  return (
    <div
      className={cn('flex w-full flex-col', className)}
      // Les largeurs ci-dessous lisent la largeur donnée à ce carrousel, pas
      // celle de la fenêtre.
      style={{ containerType: 'inline-size', ...vars, ...style }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        setHover(-1);
      }}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      {...props}
    >
      {controls && count > 1 && (
        <div className="mb-3 flex justify-end gap-2">
          <Arrow back label="Formation précédente" onClick={() => step(-1)} />
          <Arrow label="Formation suivante" onClick={() => step(1)} />
        </div>
      )}

      <div className="w-full overflow-hidden" style={{ height: 'var(--sq-h)' }}>
        <div
          ref={strip}
          role="tablist"
          aria-label={label}
          aria-orientation="horizontal"
          onKeyDown={onKeyDown}
          className="flex h-full w-max"
          style={{
            transform: move,
            transition: still ? 'none' : 'transform var(--sq-ms) var(--sq-ease)',
          }}
        >
          {cards.map((card, place) => {
            const col = place + column;
            const slide = slides[card.slide];
            const front = col === 0;

            return (
              <button
                key={card.key}
                type="button"
                role="tab"
                id={`${ids}-tab-${card.key}`}
                aria-selected={front}
                aria-controls={`${ids}-panel`}
                aria-label={slide.title}
                tabIndex={front ? 0 : -1}
                onMouseMove={() => hoverGrow && setHover(col)}
                onClick={() => col > 0 && step(col)}
                className={cn(
                  'relative isolate h-full shrink-0 cursor-pointer overflow-hidden bg-[#f0f7ff] p-0',
                  'outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                  'focus-visible:ring-[var(--sq-fill)] focus-visible:ring-offset-white',
                  panelClassName,
                )}
                style={{
                  width: widthOf(col),
                  marginLeft:
                    place === 0 ? 0 : col < 4 ? 'var(--sq-gap)' : 'var(--sq-slat-gap)',
                  borderRadius: `min(var(--sq-radius), calc(${widthOf(col)} / 2))`,
                  transitionProperty: 'width, margin-left',
                  transitionDuration: still ? '0s' : 'var(--sq-ms)',
                  transitionTimingFunction: 'var(--sq-ease)',
                }}
              >
                <Picture slide={slide} />

                {slide.overlay && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end p-4 pt-16"
                    style={{
                      opacity: front ? 1 : 0,
                      transition: 'opacity var(--sq-ms) var(--sq-ease)',
                      backgroundImage:
                        'linear-gradient(to top, rgb(0 0 0 / 0.55), transparent)',
                    }}
                  >
                    {slide.overlay}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div id={`${ids}-panel`} role="tabpanel" aria-live="polite" className="mt-5 grid">
        {slides.map((slide, i) => {
          const shown = i === open;

          return (
            <div
              key={slide.id ?? i}
              aria-hidden={!shown}
              className="col-start-1 row-start-1 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-8"
              style={{
                opacity: shown ? 1 : 0,
                visibility: shown ? 'visible' : 'hidden',
                pointerEvents: shown ? 'auto' : 'none',
                transition:
                  'opacity var(--sq-ms) var(--sq-ease), visibility var(--sq-ms)',
              }}
            >
              <p
                className="max-w-measure text-balance text-body-base leading-[1.6]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <span className="font-semibold text-[#243037]">{slide.title}</span>{' '}
                {slide.description && (
                  <span className="text-[#5f6568]">{slide.description}</span>
                )}
              </p>

              {slide.action && <Action slide={slide} shown={shown} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   pièces                                   */
/* -------------------------------------------------------------------------- */

/**
 * Dessinée dans un bloc 16:9 fixe et centrée, jamais à la largeur de sa carte.
 * Laissé à lui-même, `object-fit: cover` suit le bord contraignant — la hauteur
 * tant que la carte est une latte, la largeur une fois ouverte — donc l'image
 * changerait d'échelle en plein glissement et serait rééchantillonnée à chaque
 * frame. Un seul bloc, une seule échelle : la carte ne change que ce qu'on en
 * voit.
 */
function Picture({ slide }) {
  const box = { width: 'var(--sq-hero)', minWidth: '100%' };

  if (slide.image) {
    return (
      <img
        src={slide.image}
        alt={slide.imageAlt ?? ''}
        draggable={false}
        className="absolute inset-y-0 left-1/2 h-full max-w-none -translate-x-1/2 object-cover"
        style={box}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="absolute inset-y-0 left-1/2 -translate-x-1/2"
      style={{ background: slide.background, ...box }}
    />
  );
}

function Arrow({ back = false, label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'grid size-9 cursor-pointer place-items-center rounded-full',
        'bg-[var(--sq-fill)] text-[var(--sq-on-fill)]',
        'outline-none transition-opacity hover:opacity-85',
        'focus-visible:ring-2 focus-visible:ring-[var(--sq-fill)]',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-white',
      )}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path
          d={
            back
              ? 'M9.6 2.6 5.1 7.1h9.1v1.8H5.1l4.5 4.5-1.2 1.2-6-6L1.8 8l.6-.6 6-6 1.2 1.2Z'
              : 'M6.4 2.6l4.5 4.5H1.8v1.8h9.1l-4.5 4.5 1.2 1.2 6-6 .6-.6-.6-.6-6-6-1.2 1.2Z'
          }
        />
      </svg>
    </button>
  );
}

/** Le bouton sous le texte. Un lien quand il a un `href`, un bouton sinon. */
function Action({ slide, shown }) {
  const inside = (
    <>
      {slide.action}
      <svg
        width="6"
        height="9"
        viewBox="0 0 6 9"
        fill="none"
        aria-hidden="true"
        className="transition-transform duration-200 group-hover/sq-action:translate-x-0.5"
      >
        <path
          d="M1.2 1 4.7 4.5 1.2 8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );

  const dress = cn(
    'group/sq-action inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full',
    'bg-[var(--sq-fill)] px-5 py-2.5 text-sm font-semibold text-[var(--sq-on-fill)]',
    'outline-none transition-opacity hover:opacity-85',
    'focus-visible:ring-2 focus-visible:ring-[var(--sq-fill)]',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  );

  if (slide.href) {
    return (
      <a
        href={slide.href}
        target={slide.target}
        rel={slide.target === '_blank' ? 'noreferrer' : undefined}
        tabIndex={shown ? 0 : -1}
        onClick={slide.onAction}
        className={dress}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {inside}
      </a>
    );
  }

  return (
    <button
      type="button"
      tabIndex={shown ? 0 : -1}
      onClick={slide.onAction}
      className={dress}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {inside}
    </button>
  );
}

export default SqueezeCarousel;
