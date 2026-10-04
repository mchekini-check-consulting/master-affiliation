// Capture chaque route publique à chaque largeur, et écrit un rapport des
// éléments qui dépassent de la fenêtre et des cibles tactiles trop petites.
// Usage : npm run captures            → captures/actuel/
//         npm run captures -- avant   → captures/avant/
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { preview } from 'vite';
import { ROUTES, LARGEURS_MOBILE, LARGEUR_DESKTOP } from '../tests/mobile/routes.js';
import { preparerContexte, ouvrir, contextePour } from '../tests/mobile/helpers.js';

const dossier = path.resolve('captures', process.argv[2] ?? 'actuel');
const PORT = 4174;

// Exécuté dans la page. Un élément « dépasse » si son bord sort de la fenêtre
// sans être dans un conteneur qui défile horizontalement (rail, tableau).
function inspecter() {
  const largeur = document.documentElement.clientWidth;
  const decrire = (el) => {
    const classes = typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 4).join('.') : '';
    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${classes ? `.${classes}` : ''}`;
  };
  const dansUnDefilement = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const ox = getComputedStyle(p).overflowX;
      if ((ox === 'auto' || ox === 'scroll') && p.scrollWidth > p.clientWidth) return true;
    }
    return false;
  };
  const visible = (el, r) => {
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) > 0;
  };

  const depassements = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (!visible(el, r)) continue;
    if (r.right > largeur + 1 || r.left < -1) {
      if (dansUnDefilement(el)) continue;
      depassements.push({ element: decrire(el), gauche: Math.round(r.left), droite: Math.round(r.right) });
    }
  }

  const petitesCibles = [];
  for (const el of document.querySelectorAll('a, button, input, select, textarea, [role="button"], [role="switch"]')) {
    const r = el.getBoundingClientRect();
    if (!visible(el, r)) continue;
    if (r.width < 44 || r.height < 44) {
      petitesCibles.push({
        element: decrire(el),
        texte: (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 40),
        largeur: Math.round(r.width),
        hauteur: Math.round(r.height),
      });
    }
  }

  return {
    defilementHorizontal: document.documentElement.scrollWidth > largeur,
    depassements: depassements.slice(0, 40),
    petitesCibles: petitesCibles.slice(0, 80),
  };
}

const serveur = await preview({ preview: { port: PORT, strictPort: true } });
const navigateur = await chromium.launch();
const rapport = {};
let echecs = 0;

try {
  for (const largeur of [...LARGEURS_MOBILE, LARGEUR_DESKTOP]) {
    const contexte = await navigateur.newContext({
      ...contextePour(largeur),
      baseURL: `http://localhost:${PORT}`,
      locale: 'fr-FR',
      reducedMotion: 'reduce',
    });
    await preparerContexte(contexte);
    const page = await contexte.newPage();
    await mkdir(path.join(dossier, String(largeur)), { recursive: true });

    for (const route of ROUTES) {
      await ouvrir(page, route.chemin);
      await page.screenshot({ path: path.join(dossier, String(largeur), `${route.nom}.png`), fullPage: true });
      const resultat = await page.evaluate(inspecter);
      rapport[`${route.nom}@${largeur}`] = resultat;
      if (resultat.defilementHorizontal) echecs += 1;
      console.log(
        `${String(largeur).padStart(4)} px  ${route.nom.padEnd(22)} ` +
        `défilement: ${resultat.defilementHorizontal ? 'OUI' : 'non'}  ` +
        `dépassements: ${resultat.depassements.length}  petites cibles: ${resultat.petitesCibles.length}`,
      );
    }
    await contexte.close();
  }
} finally {
  await navigateur.close();
  await new Promise((fin) => serveur.httpServer.close(fin));
}

await writeFile(path.join(dossier, 'rapport.json'), JSON.stringify(rapport, null, 2));
console.log(`\nCaptures et rapport écrits dans ${dossier}`);
if (echecs > 0) {
  console.error(`${echecs} page(s) avec défilement horizontal.`);
  process.exit(1);
}
