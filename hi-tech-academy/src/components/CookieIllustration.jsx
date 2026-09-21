import React from 'react';

// Cookie dessiné à la main plutôt qu'emprunté à une banque d'images : il
// reprend exactement les teintes de la charte et reste net à toute taille.
// Les pépites sont posées à la main pour éviter la symétrie trop régulière
// qui trahit une forme générée.
const CHIPS = [
  { cx: 18, cy: 20, r: 4.2 },
  { cx: 34, cy: 14, r: 2.6 },
  { cx: 41, cy: 30, r: 3.6 },
  { cx: 22, cy: 38, r: 3 },
  { cx: 31, cy: 45, r: 2.2 },
  { cx: 12, cy: 32, r: 2.4 },
];

const CRUMBS = [
  { cx: 27, cy: 27, r: 1.1 },
  { cx: 37, cy: 21, r: 0.9 },
  { cx: 16, cy: 43, r: 1 },
];

export default function CookieIllustration({ size = 56, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      className={className}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      {/* Le biscuit : un disque entamé d'une croquée en haut à droite. */}
      <path
        d="M28 4c3.1 0 6 .6 8.8 1.8-.6 3.4 1.9 6.4 5.3 6.2.9 2.3 3.2 3.8 5.7 3.5A24 24 0 1 1 28 4Z"
        fill="#dfedff"
        stroke="#000c5b"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {CHIPS.map((chip) => (
        <circle key={`${chip.cx}-${chip.cy}`} {...chip} fill="#000c5b" />
      ))}
      {CRUMBS.map((crumb) => (
        <circle key={`${crumb.cx}-${crumb.cy}`} {...crumb} fill="#0062e1" />
      ))}
    </svg>
  );
}
