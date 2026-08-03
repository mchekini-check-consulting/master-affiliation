/* Atelier « Carte de France interactive » — thématique histoire-geographie-culture.
   Source de vérité : donnees/cours/histoire-geographie-culture.json,
   fiche « la-geographie-de-la-france ». */

import './carte-france.css';

/* ------------------------------------------------------------------ */
/* Données                                                             */
/* ------------------------------------------------------------------ */

const ONGLETS = [
  { id: 'fleuves', libelle: 'Fleuves', consigne: 'Cliquez sur un fleuve (dans la liste ou sur la carte) pour le situer.' },
  { id: 'montagnes', libelle: 'Montagnes', consigne: 'Cliquez sur une chaîne de montagnes pour la situer.' },
  { id: 'mers', libelle: 'Mers et océans', consigne: 'Cliquez sur une mer ou un océan qui borde la France.' },
  { id: 'villes', libelle: 'Grandes villes', consigne: 'Cliquez sur une ville pour la situer.' },
];

const FLEUVES = [
  {
    id: 'loire', nom: 'La Loire', chiffre: 'Le plus long fleuve de France',
    info: 'La Loire est le plus long fleuve de France. Elle prend sa source dans le Massif central, passe par Orléans et Tours, puis rejoint l’océan Atlantique après Nantes.',
    points: '367,407 374,331 337,272 286,216 237,248 147,258 124,259',
    etiquette: [252, 236],
  },
  {
    id: 'seine', nom: 'La Seine', chiffre: 'Traverse Paris',
    info: 'La Seine est le fleuve qui traverse Paris. Elle coule ensuite vers Rouen et se jette dans la Manche, au Havre.',
    points: '407,241 374,192 304,158 254,122 216,116',
    etiquette: [356, 182],
  },
  {
    id: 'garonne', nom: 'La Garonne', chiffre: 'Sud-Ouest',
    info: 'La Garonne coule dans le Sud-Ouest. Elle descend des Pyrénées, traverse Toulouse puis Bordeaux, avant l’estuaire de la Gironde.',
    points: '234,530 268,480 235,444 186,404 167,362',
    etiquette: [222, 458],
  },
  {
    id: 'rhone', nom: 'Le Rhône', chiffre: 'Sud-Est',
    info: 'Le Rhône coule dans le Sud-Est. Venu de Suisse, il traverse Lyon puis descend vers la mer Méditerranée, près de Marseille.',
    points: '455,318 404,348 407,399 403,459 405,494',
    etiquette: [392, 425],
  },
  {
    id: 'rhin', nom: 'Le Rhin', chiffre: 'Frontière avec l’Allemagne',
    info: 'Le Rhin marque la frontière entre la France et l’Allemagne, dans l’Est du pays, près de Strasbourg.',
    points: '515,239 528,205 536,174 540,150',
    etiquette: [552, 208],
  },
  {
    id: 'marne', nom: 'La Marne', chiffre: 'Grande rivière',
    info: 'La Marne est une grande rivière (et non un fleuve) : elle rejoint la Seine tout près de Paris.',
    points: '424,219 385,151 325,151 306,156',
    etiquette: [356, 141],
  },
  {
    id: 'dordogne', nom: 'La Dordogne', chiffre: 'Grande rivière',
    info: 'La Dordogne est une grande rivière du Sud-Ouest : née dans le Massif central, elle rejoint la Garonne près de Bordeaux pour former l’estuaire de la Gironde.',
    points: '320,364 275,385 229,404 174,378',
    etiquette: [262, 373],
  },
];

const MONTAGNES = [
  {
    id: 'alpes', nom: 'Les Alpes', chiffre: 'Mont Blanc : 4 809 m',
    info: 'Les Alpes, dans le Sud-Est, abritent le mont Blanc (4 809 mètres), le point culminant, situé entre la France et l’Italie.',
    zone: '453,322 486,342 495,392 489,422 470,468 446,438 440,382 444,340',
    pics: [[468, 358], [462, 404], [455, 442]],
    etiquette: [428, 462],
    montBlanc: [484, 340],
  },
  {
    id: 'pyrenees', nom: 'Les Pyrénées', chiffre: 'Frontière avec l’Espagne',
    info: 'Les Pyrénées forment une longue chaîne au sud, à la frontière entre la France et l’Espagne.',
    zone: '155,500 240,524 330,545 326,558 235,540 150,514',
    pics: [[196, 519], [262, 535]],
    etiquette: [214, 566],
  },
  {
    id: 'massif-central', nom: 'Le Massif central', chiffre: 'Centre-sud du pays',
    info: 'Le Massif central occupe le centre-sud de la France. La Loire et la Dordogne y prennent leur source.',
    zone: '300,360 350,375 370,420 345,455 300,450 280,405',
    pics: [[318, 400], [340, 428]],
    etiquette: [324, 472],
  },
  {
    id: 'vosges', nom: 'Les Vosges', chiffre: 'Nord-Est',
    info: 'Les Vosges se trouvent dans le Nord-Est de la France, entre la Lorraine et l’Alsace, non loin de Strasbourg.',
    zone: '489,164 507,180 504,220 484,215 479,185',
    pics: [[493, 192]],
    etiquette: [458, 200],
  },
  {
    id: 'jura', nom: 'Le Jura', chiffre: 'Frontière avec la Suisse',
    info: 'Le Jura est une chaîne de moyenne montagne de l’Est, le long de la frontière avec la Suisse.',
    zone: '450,255 485,270 492,310 470,315 448,285',
    pics: [[469, 285]],
    etiquette: [428, 268],
  },
];

const MERS = [
  {
    id: 'manche', nom: 'La Manche', chiffre: 'Au nord-ouest',
    info: 'La Manche borde le nord-ouest de la France et la sépare du Royaume-Uni. La Seine s’y jette, au Havre.',
    pos: [150, 62],
  },
  {
    id: 'mer-du-nord', nom: 'La mer du Nord', chiffre: 'Au nord',
    info: 'La mer du Nord borde l’extrême nord du pays, près de Dunkerque et de la frontière belge.',
    pos: [420, 34],
  },
  {
    id: 'atlantique', nom: 'L’océan Atlantique', chiffre: 'À l’ouest',
    info: 'L’océan Atlantique borde toute la façade ouest de la France, de la Bretagne au Pays basque.',
    pos: [76, 330],
  },
  {
    id: 'mediterranee', nom: 'La mer Méditerranée', chiffre: 'Au sud',
    info: 'La mer Méditerranée borde le sud de la France. Le Rhône s’y jette, près de Marseille. L’île de Corse s’y trouve.',
    pos: [430, 560],
  },
];

const VILLES = [
  {
    id: 'paris', nom: 'Paris', chiffre: 'Capitale de la France', etoile: true,
    info: 'Paris, au nord-centre du pays, est la capitale de la France. La ville est traversée par la Seine.',
    pos: [304, 158], dx: 0, dy: -16, ancre: 'middle',
  },
  {
    id: 'marseille', nom: 'Marseille', chiffre: 'Grand port du Sud-Est',
    info: 'Marseille est un grand port du Sud-Est, sur la mer Méditerranée, près de l’embouchure du Rhône.',
    pos: [426, 499], dx: 4, dy: 20, ancre: 'middle',
  },
  {
    id: 'lyon', nom: 'Lyon', chiffre: 'Sur le Rhône',
    info: 'Lyon, dans le Sud-Est, est traversée par le Rhône, entre le Massif central et les Alpes.',
    pos: [404, 348], dx: -12, dy: 5, ancre: 'end',
  },
  {
    id: 'toulouse', nom: 'Toulouse', chiffre: 'Sur la Garonne',
    info: 'Toulouse, grande ville du Sud-Ouest, est traversée par la Garonne, entre les Pyrénées et le Massif central.',
    pos: [268, 480], dx: 12, dy: 5, ancre: 'start',
  },
  {
    id: 'nice', nom: 'Nice', chiffre: 'Bord de la Méditerranée',
    info: 'Nice se trouve tout au sud-est, sur la mer Méditerranée, près de la frontière italienne.',
    pos: [502, 474], dx: 4, dy: 20, ancre: 'middle',
  },
  {
    id: 'nantes', nom: 'Nantes', chiffre: 'Près de l’estuaire de la Loire',
    info: 'Nantes, dans l’Ouest, est la dernière grande ville traversée par la Loire avant l’océan Atlantique.',
    pos: [147, 258], dx: 0, dy: -12, ancre: 'middle',
  },
  {
    id: 'strasbourg', nom: 'Strasbourg', chiffre: 'Près du Rhin',
    info: 'Strasbourg, dans le Nord-Est, se trouve près du Rhin, qui marque la frontière avec l’Allemagne.',
    pos: [520, 175], dx: -12, dy: -8, ancre: 'end',
  },
  {
    id: 'bordeaux', nom: 'Bordeaux', chiffre: 'Sur la Garonne',
    info: 'Bordeaux, dans le Sud-Ouest, est traversée par la Garonne, non loin de l’océan Atlantique.',
    pos: [186, 404], dx: -12, dy: 5, ancre: 'end',
  },
  {
    id: 'lille', nom: 'Lille', chiffre: 'Grande ville du Nord',
    info: 'Lille est la grande ville du Nord de la France, près de la frontière belge.',
    pos: [333, 52], dx: 12, dy: 5, ancre: 'start',
  },
];

const DONNEES = {
  fleuves: FLEUVES,
  montagnes: MONTAGNES,
  mers: MERS,
  villes: VILLES,
};

const OUTREMER = [
  { nom: 'Guadeloupe', num: '971' },
  { nom: 'Martinique', num: '972' },
  { nom: 'Guyane', num: '973' },
  { nom: 'La Réunion', num: '974' },
  { nom: 'Mayotte', num: '976' },
];

/* Contour simplifié de la France métropolitaine (« hexagone » stylisé). */
const CONTOUR =
  '305,24 284,30 253,92 214,116 195,138 144,107 147,171 97,180 18,186 22,210 ' +
  '46,223 121,256 163,324 163,360 159,419 147,487 238,536 270,548 337,552 ' +
  '332,517 368,487 393,496 425,504 447,511 476,505 502,478 512,469 492,413 ' +
  '496,388 488,339 451,315 488,278 514,238 536,174 541,151 492,137 459,120 ' +
  '411,100 405,81 351,57';

/* Corse (repère décoratif, mentionnée dans le cours parmi les 13 régions). */
const CORSE = '549,502 561,513 559,558 545,563 542,528';

/* Étoile à 5 branches (Paris). */
const ETOILE =
  'M0,-9 L2.4,-3.2 L8.6,-2.8 L3.8,1.2 L5.3,7.3 L0,4 L-5.3,7.3 L-3.8,1.2 L-8.6,-2.8 L-2.4,-3.2 Z';

/* ------------------------------------------------------------------ */
/* Gabarits SVG                                                        */
/* ------------------------------------------------------------------ */

function svgPics(pics) {
  return pics
    .map(([x, y]) => `M${x - 11},${y + 9} L${x},${y - 11} L${x + 11},${y + 9} Z`)
    .join(' ');
}

function svgVagues([x, y]) {
  const v = (dx) =>
    `M${x + dx - 14},${y + 12} q7,-6 14,0 q7,6 14,0`;
  return `<path class="at-carte-vagues" d="${v(-16)} ${v(16)}" />`;
}

function svgFleuves() {
  const trace = FLEUVES.map((f) => `
    <g class="at-carte-el" data-id="${f.id}" tabindex="-1" role="button" aria-label="${f.nom}">
      <polyline class="at-carte-hit" points="${f.points}" />
      <polyline class="at-carte-trace" points="${f.points}" />
      <text class="at-carte-etiquette" x="${f.etiquette[0]}" y="${f.etiquette[1]}" text-anchor="middle">${f.nom.replace(/^(La|Le)\s/, '')}</text>
    </g>`).join('');
  return `<g class="at-carte-couche" data-couche="fleuves">${trace}</g>`;
}

function svgMontagnes() {
  const trace = MONTAGNES.map((m) => {
    const mtBlanc = m.montBlanc
      ? `<path class="at-carte-mtblanc" d="M${m.montBlanc[0] - 13},${m.montBlanc[1] + 10} L${m.montBlanc[0]},${m.montBlanc[1] - 14} L${m.montBlanc[0] + 13},${m.montBlanc[1] + 10} Z" />
         <text class="at-carte-etiquette at-carte-etiquette-mtblanc" x="${m.montBlanc[0] - 6}" y="${m.montBlanc[1] - 20}" text-anchor="middle">Mont Blanc — 4 809 m</text>`
      : '';
    return `
    <g class="at-carte-el" data-id="${m.id}" tabindex="-1" role="button" aria-label="${m.nom}">
      <polygon class="at-carte-zone" points="${m.zone}" />
      <path class="at-carte-pics" d="${svgPics(m.pics)}" />
      ${mtBlanc}
      <text class="at-carte-etiquette" x="${m.etiquette[0]}" y="${m.etiquette[1]}" text-anchor="middle">${m.nom.replace(/^(Les|Le)\s/, '')}</text>
    </g>`;
  }).join('');
  return `<g class="at-carte-couche" data-couche="montagnes">${trace}</g>`;
}

function svgMers() {
  const trace = MERS.map((m) => `
    <g class="at-carte-el" data-id="${m.id}" tabindex="-1" role="button" aria-label="${m.nom}">
      <rect class="at-carte-hit-rect" x="${m.pos[0] - 72}" y="${m.pos[1] - 22}" width="144" height="44" rx="10" />
      <text class="at-carte-mer-texte" x="${m.pos[0]}" y="${m.pos[1] - 4}" text-anchor="middle">${m.nom.replace(/^(La|L’)\s?/, '')}</text>
      ${svgVagues(m.pos)}
    </g>`).join('');
  return `<g class="at-carte-couche" data-couche="mers">${trace}</g>`;
}

function svgVilles() {
  const trace = VILLES.map((v) => {
    const symbole = v.etoile
      ? `<path class="at-carte-etoile" d="${ETOILE}" />`
      : '<circle class="at-carte-point" r="6" />';
    return `
    <g class="at-carte-el" data-id="${v.id}" tabindex="-1" role="button" aria-label="${v.nom}"
       transform="translate(${v.pos[0]},${v.pos[1]})">
      <circle class="at-carte-hit-rond" r="16" />
      ${symbole}
      <text class="at-carte-etiquette at-carte-etiquette-ville" x="${v.dx}" y="${v.dy}" text-anchor="${v.ancre}">${v.nom}</text>
    </g>`;
  }).join('');
  return `<g class="at-carte-couche" data-couche="villes">${trace}</g>`;
}

function svgCarte() {
  return `
  <svg class="at-carte-svg" viewBox="0 0 600 580" role="img"
       aria-label="Carte simplifiée de la France métropolitaine">
    <polygon class="at-carte-fond" points="${CONTOUR}" />
    <polygon class="at-carte-corse" points="${CORSE}" />
    ${svgFleuves()}
    ${svgMontagnes()}
    ${svgMers()}
    ${svgVilles()}
  </svg>`;
}

/* ------------------------------------------------------------------ */
/* Gabarits HTML                                                       */
/* ------------------------------------------------------------------ */

function gabaritOnglets() {
  return ONGLETS.map((o, i) => `
    <button type="button" class="at-carte-onglet${i === 0 ? ' at-carte-onglet-actif' : ''}"
            role="tab" aria-selected="${i === 0}" data-onglet="${o.id}">${o.libelle}</button>`).join('');
}

function gabaritListe(coucheId) {
  return DONNEES[coucheId].map((el) => `
    <li>
      <button type="button" class="at-carte-item" data-id="${el.id}">
        <span class="at-carte-puce" aria-hidden="true"></span>
        <span class="at-carte-item-nom">${el.nom}</span>
      </button>
    </li>`).join('');
}

function gabaritInfoVide(coucheId) {
  const onglet = ONGLETS.find((o) => o.id === coucheId);
  return `<p class="at-carte-info-vide">${onglet.consigne}</p>`;
}

function gabaritInfo(el) {
  return `
    <p class="at-carte-info-nom">${el.nom}</p>
    <p class="at-carte-badge">${el.chiffre}</p>
    <p class="at-carte-info-texte">${el.info}</p>`;
}

function gabaritOutremer() {
  const vignettes = OUTREMER.map((t) => `
    <div class="at-carte-vignette">
      <span class="at-carte-vignette-num">${t.num}</span>
      <span class="at-carte-vignette-nom">${t.nom}</span>
    </div>`).join('');
  return `
    <p class="at-carte-outremer-titre">Et l’outre-mer&nbsp;: la France compte 101 départements, dont 5 d’outre-mer (qui sont aussi des régions).</p>
    <div class="at-carte-vignettes">${vignettes}</div>`;
}

function gabarit() {
  return `
  <div class="at-carte">
    <div class="at-carte-onglets" role="tablist" aria-label="Couches de la carte">
      ${gabaritOnglets()}
    </div>
    <div class="at-carte-corps">
      <div class="at-carte-scene">
        ${svgCarte()}
      </div>
      <aside class="at-carte-panneau">
        <ul class="at-carte-liste" role="list"></ul>
        <div class="at-carte-info" aria-live="polite"></div>
      </aside>
    </div>
    <div class="at-carte-outremer">
      ${gabaritOutremer()}
    </div>
  </div>`;
}

/* ------------------------------------------------------------------ */
/* Module                                                              */
/* ------------------------------------------------------------------ */

export default {
  slug: 'carte-france',
  thematique: 'histoire-geographie-culture',
  titre: 'La carte de France interactive',
  description: 'Fleuves, montagnes, mers et grandes villes : cliquez pour les situer.',
  icone: '\u{1F5FA}️',

  rendre(conteneur) {
    conteneur.innerHTML = gabarit();

    /* État local à cet appel : ré-appeler rendre() repart de zéro. */
    let coucheActive = 'fleuves';
    let idActif = null;

    const svg = conteneur.querySelector('.at-carte-svg');
    const listeEl = conteneur.querySelector('.at-carte-liste');
    const infoEl = conteneur.querySelector('.at-carte-info');
    const ongletsEl = conteneur.querySelector('.at-carte-onglets');

    function majCouches() {
      svg.querySelectorAll('.at-carte-couche').forEach((g) => {
        const active = g.dataset.couche === coucheActive;
        g.classList.toggle('at-carte-couche-active', active);
        g.querySelectorAll('.at-carte-el').forEach((el) => {
          el.setAttribute('tabindex', active ? '0' : '-1');
        });
      });
    }

    function majSelection() {
      svg.querySelectorAll('.at-carte-el').forEach((g) => {
        g.classList.toggle('at-carte-actif', g.dataset.id === idActif);
      });
      listeEl.querySelectorAll('.at-carte-item').forEach((b) => {
        b.classList.toggle('at-carte-item-actif', b.dataset.id === idActif);
      });
      const el = DONNEES[coucheActive].find((d) => d.id === idActif);
      infoEl.innerHTML = el ? gabaritInfo(el) : gabaritInfoVide(coucheActive);
    }

    function changerOnglet(coucheId) {
      coucheActive = coucheId;
      idActif = null;
      ongletsEl.querySelectorAll('.at-carte-onglet').forEach((b) => {
        const actif = b.dataset.onglet === coucheId;
        b.classList.toggle('at-carte-onglet-actif', actif);
        b.setAttribute('aria-selected', String(actif));
      });
      listeEl.innerHTML = gabaritListe(coucheId);
      majCouches();
      majSelection();
    }

    function selectionner(id) {
      idActif = idActif === id ? null : id;
      majSelection();
    }

    ongletsEl.addEventListener('click', (ev) => {
      const bouton = ev.target.closest('.at-carte-onglet');
      if (bouton) changerOnglet(bouton.dataset.onglet);
    });

    listeEl.addEventListener('click', (ev) => {
      const item = ev.target.closest('.at-carte-item');
      if (item) selectionner(item.dataset.id);
    });

    svg.addEventListener('click', (ev) => {
      const el = ev.target.closest('.at-carte-couche-active .at-carte-el');
      if (el) selectionner(el.dataset.id);
    });

    svg.addEventListener('keydown', (ev) => {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      const el = ev.target.closest('.at-carte-couche-active .at-carte-el');
      if (el) {
        ev.preventDefault();
        selectionner(el.dataset.id);
      }
    });

    changerOnglet('fleuves');
  },
};
