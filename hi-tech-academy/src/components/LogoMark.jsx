import React, { useId } from 'react';

/**
 * Emblème Hi-Tech Academy — le bloc isométrique.
 *
 * La marque est bicolore par construction : un volume plein (`currentColor`,
 * donc la couleur du texte du conteneur) creusé par trois arêtes évidées. Ces
 * arêtes ne sont pas blanches, elles sont de la COULEUR DU FOND : d'où la prop
 * `voidColor`, à passer dès que le logo ne repose pas sur du blanc (`#000c5b`
 * dans le footer). Aucune ombre, aucun dégradé.
 *
 * `tilt` = l'inclinaison des faces supérieures, en degrés. 30° est la
 * projection isométrique canonique (le cube « vrai ») : c'est la valeur par
 * défaut, et il n'y a pas de raison d'en sortir sans intention.
 *
 * `rotate` = la rotation de tout l'emblème autour de son centre, en degrés.
 * Les initiales tournent avec lui, ce qui est juste : elles sont posées sur les
 * faces, donc le bloc bascule avec son marquage. Au-delà d'une dizaine de
 * degrés elles deviennent pénibles à lire — le réglage du site est à -7°.
 *
 * `initials` = les trois lettres posées sur les faces visibles (null pour les
 * retirer, ce qu'il faut faire en dessous de 40 px : à la taille d'un favicon
 * elles se referment en tache). Chaque lettre est projetée DANS le plan de sa
 * face via une matrice construite sur les arêtes du bloc : elle est donc
 * cisaillée comme la face qui la porte, ce qui fait toute la différence entre
 * « du texte devant un cube » et « du texte gravé sur un cube ».
 *
 * Le T est posé à cheval sur l'arête frontale, dessiné deux fois et détouré de
 * part et d'autre, de sorte qu'il se plie sur l'angle du bloc. Il n'est pas
 * tracé avec un glyphe mais avec deux rectangles, uniquement pour pouvoir
 * allonger sa barre (`keyBarStretch`) sans changer sa hauteur ni sa graisse :
 * une police ne permet pas de ne toucher qu'au chapeau d'une lettre.
 */
const CX = 120;
const CY = 120;
const HALF_W = 78; // demi-largeur du bloc
const EDGE = 62; // longueur des arêtes verticales (les flancs)

// Le tracé d'origine flottait dans un carré de 240 avec une large marge morte :
// à taille égale, la marque paraissait deux fois plus petite qu'elle ne l'est.
// On recadre le viewBox au rayon maximal du bloc (sommet latéral + demi-épaisseur
// de trait), ce qui reste valable QUELLE QUE SOIT la rotation puisque le rayon
// ne change pas quand on pivote. Le rendu remplit alors sa boîte.
const R = Math.hypot(HALF_W, EDGE / 2) + 5; // 5 = moitié du stroke du contour
const BOX = `${CX - R} ${CY - R} ${2 * R} ${2 * R}`;

export default function LogoMark({
  size = 40,
  className = '',
  style,
  voidColor = '#ffffff',
  tilt = 30,
  rotate = 0,
  initials = 'HTA',
  letterSize = 42,
  keyBarStretch = 1.45,
  title = 'Hi-Tech Academy',
}) {
  // Les identifiants de détourage doivent être uniques : plusieurs emblèmes
  // peuvent coexister sur une même page (header et footer, notamment).
  const uid = useId().replace(/:/g, '');

  // Géométrie dérivée de l'inclinaison : le bloc reste centré et sa largeur
  // ne bouge pas, seule la hauteur des faces haute et basse varie.
  const drop = HALF_W * Math.tan((tilt * Math.PI) / 180);
  const r = (n) => Math.round(n * 100) / 100;

  const shoulderTop = CY - EDGE / 2; // sommets latéraux hauts
  const shoulderBottom = CY + EDGE / 2; // sommets latéraux bas
  const apex = r(shoulderTop - drop); // pointe haute
  const base = r(shoulderBottom + drop); // pointe basse
  const meet = r(shoulderTop + drop); // point de rencontre des trois faces

  const points = [
    `${CX},${apex}`,
    `${CX + HALF_W},${shoulderTop}`,
    `${CX + HALF_W},${shoulderBottom}`,
    `${CX},${base}`,
    `${CX - HALF_W},${shoulderBottom}`,
    `${CX - HALF_W},${shoulderTop}`,
  ].join(' ');

  // ── Projection des initiales ────────────────────────────────────────────
  // U est l'arête unitaire montant vers le sommet latéral droit. L'axe
  // horizontal d'une lettre suit l'arête haute de sa face, son axe vertical
  // reste le flanc. Le reste n'est que de la mise en place.
  const L = Math.hypot(HALF_W, drop);
  const ux = HALF_W / L;
  const uy = -drop / L; // vers le haut-droite
  const m = (a, b, c, d, tx, ty) => `translate(${r(tx)} ${r(ty)}) matrix(${r(a)} ${r(b)} ${r(c)} ${r(d)} 0 0)`;
  const onLeft = (tx, ty) => m(ux, -uy, 0, 1, tx, ty);
  const onRight = (tx, ty) => m(ux, uy, 0, 1, tx, ty);

  // Hauteur commune aux trois lettres, mesurée DANS le plan des faces et non à
  // l'écran : le centre d'un flanc, décalé d'une demi-largeur le long de
  // l'arête, tombe exactement sur le milieu de l'arête frontale. Les trois
  // lettres sont donc à la même hauteur sur le volume, même si leurs
  // ordonnées écran diffèrent.
  const faceMid = (shoulderTop + meet + base + shoulderBottom) / 4;
  const edgeMid = r(meet + EDGE / 2);

  const letters = initials
    ? [
        { key: 'h', char: initials[0], t: onLeft(CX - HALF_W / 2, faceMid) },
        { key: 'a', char: initials[2], t: onRight(CX + HALF_W / 2, faceMid) },
      ].filter((f) => f.char)
    : [];

  // Le T en deux rectangles, aux proportions d'une capitale DM Sans Bold de
  // `letterSize` : hauteur de capitale, graisse de fût, largeur de barre. Seule
  // la barre est multipliée par `keyBarStretch`, le reste ne bouge pas.
  const capH = r(letterSize * 0.72);
  const stemW = r(letterSize * 0.145);
  const barW = r(letterSize * 0.63 * keyBarStretch);
  const key = initials && initials[1]
    ? `M ${r(-barW / 2)},${r(-capH / 2)} h ${barW} v ${stemW} h ${r(-(barW - stemW) / 2)} v ${r(capH - stemW)} h ${r(-stemW)} v ${r(-(capH - stemW))} h ${r(-(barW - stemW) / 2)} Z`
    : null;

  const spokes = [
    `M ${CX},${meet} L ${CX},${apex}`,
    `M ${CX},${meet} L ${CX - HALF_W},${shoulderTop}`,
    `M ${CX},${meet} L ${CX + HALF_W},${shoulderTop}`,
  ].join(' ');

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={BOX}
      width={size}
      height={size}
      role="img"
      className={className}
      style={style}>
      <title>{title}</title>
      <defs>
        {/* Deux demi-plans qui se rejoignent sur l'arête frontale. */}
        <clipPath id={`${uid}-l`}>
          <rect x={CX - R} y={CY - R} width={R} height={2 * R} />
        </clipPath>
        <clipPath id={`${uid}-r`}>
          <rect x={CX} y={CY - R} width={R} height={2 * R} />
        </clipPath>
      </defs>
      <g transform={rotate ? `rotate(${rotate} ${CX} ${CY})` : undefined}>
        <polygon
          points={points}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinejoin="round"
        />
        <path
          d={spokes}
          stroke={voidColor}
          strokeWidth="5.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Le détourage est porté par le <g>, jamais par le <text> : en SVG, un
            élément qui cumule `transform` et `clip-path` voit son détourage
            transformé lui aussi, donc les deux demi-plans seraient cisaillés
            par la matrice de la lettre et s'annuleraient. */}
        {letters.map((letter) => (
          <text
            key={letter.key}
            transform={letter.t}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="'DM Sans', sans-serif"
            fontWeight="700"
            fontSize={letterSize}
            fill={voidColor}>
            {letter.char}
          </text>
        ))}
        {key && (
          <>
            <g clipPath={`url(#${uid}-l)`}>
              <path d={key} transform={onLeft(CX, edgeMid)} fill={voidColor} />
            </g>
            <g clipPath={`url(#${uid}-r)`}>
              <path d={key} transform={onRight(CX, edgeMid)} fill={voidColor} />
            </g>
          </>
        )}
      </g>
    </svg>
  );
}
