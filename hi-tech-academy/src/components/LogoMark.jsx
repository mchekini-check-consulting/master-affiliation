import React from 'react';

/**
 * Emblème Hi-Tech Academy : un carré aux angles arrondis portant les initiales
 * « HT ».
 *
 * Le carré prend `currentColor` (la couleur du texte du conteneur) et les
 * initiales `voidColor`. Sur fond blanc : carré `#002d74`, lettres blanches
 * (réglage par défaut). Sur fond sombre (footer) : on inverse, carré blanc via
 * `color: #ffffff` et `voidColor="#002d74"`. Aucune ombre, aucun dégradé.
 *
 * Les lettres sont en DM Sans 700 (police de titres du site), resserrées
 * de −0,02em pour que le « HT » se lise comme un bloc et non comme deux
 * lettres posées côte à côte.
 */
export default function LogoMark({
  size = 40,
  className = '',
  style,
  voidColor = '#ffffff',
  initials = 'HT',
  title = 'Hi-Tech Academy',
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      role="img"
      className={className}
      style={style}>
      <title>{title}</title>
      <rect width="48" height="48" rx="13" fill="currentColor" />
      <text
        x="24"
        y="25"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'DM Sans', sans-serif"
        fontWeight="700"
        fontSize="21"
        letterSpacing="-0.4"
        fill={voidColor}>
        {initials}
      </text>
    </svg>
  );
}
