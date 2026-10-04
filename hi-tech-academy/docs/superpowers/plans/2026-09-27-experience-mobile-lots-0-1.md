# Expérience mobile, lots 0 et 1 : plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Installer l'outil de vérification mobile (captures et tests Playwright) et livrer le socle commun : bouton primaire qui passe à la ligne, hauteurs d'écran en `dvh`, éléments fixes qui ne se recouvrent plus, titre de la section profils à l'échelle.

**Architecture:** Le responsive se fait en CSS, dans le système de style déjà en place de chaque fichier (Tailwind, styles inline, `index.css`). Le JavaScript n'intervient que pour publier la hauteur de la barre fixe dans une variable CSS. La vérification passe par `@playwright/test`, lancé contre le build de production servi par `vite preview`.

**Tech Stack:** React 18, Vite 6, Tailwind 3.4, react-router 6, `@playwright/test` (nouveau, dépendance de développement), Node 24.

**Spec:** `docs/superpowers/specs/2026-09-27-experience-mobile-design.md`

## Périmètre de ce plan

La spec compte six lots. Ce plan couvre les **lots 0 et 1**. Les lots 2 à 5
auront chacun leur plan, écrit après le lot 0 : l'audit repose sur une lecture
du code, et les captures du lot 0 donneront l'état réel de chaque page.

Quatre éléments que la spec range dans le socle sont déplacés, parce qu'ils
n'ont aucun consommateur avant le lot 2 et ne seraient donc pas testables ici :

| Élément de la spec | Déplacé vers | Raison |
|---|---|---|
| 3.7 Composant de rail | Lot 2, première tâche | Premier usage : catalogue de l'accueil |
| 3.8 Animation d'apparition | Lot 2, deuxième tâche | Premier usage : sections de l'accueil |
| 3.2 Remplacement des `clamp()` inline et des tailles Tailwind en dur | Lot de chaque section ou page | 37 occurrences dans 19 fichiers, chacune dans une section retouchée plus tard |
| 3.6 Retrait des `overflow-x-clip` | Lot 2 (accueil) et lot 5 (À propos) | La cause est dans les sections. Le rapport du lot 0 la localise |

Le libellé court « S'inscrire » et le masquage de la barre CTA devant la
section Tarif restent dans le lot 3, comme prévu par la spec.

## Global Constraints

- Toutes les commandes se lancent depuis `hi-tech-academy/`, préfixées par `rtk` (règle du poste : `rtk npm run build`, `rtk git add`...).
- Palette de la charte (`hi-tech-academy/CLAUDE.md`) : primaire `#002d74`, survol `#011f55`. Ombres en `rgba(0,45,116,…)` uniquement.
- Tout CTA principal utilise `PrimaryButton`. Pas d'icône, pas d'animation de survol.
- Échelle mobile (sous 768 px) : Hero 36 px, H1 28 px, H2 22 px, H3 18 px, corps 16 px minimum.
- Cible tactile : 44 × 44 px minimum.
- Nouveaux seuils : 640, 768 et 1024 px uniquement.
- À 1280 px, le rendu est identique à l'actuel.
- Les règles globales `h1` à `h6` et `p` de `src/index.css` (l.144-156) ne sont pas modifiées : elles s'appliquent aussi à l'admin.
- Hors périmètre : `src/pages/Admin.jsx`, `src/pages/admin/*`, `AuditQualiopiContent`, le back, les composants jamais importés.
- Aucun tiret cadratin dans les textes affichés sur le site.
- Commentaires de code en français, style du dépôt : ils expliquent le pourquoi.
- Commits : uniquement si le porteur du projet les a autorisés. Sinon, laisser les changements dans l'arbre de travail et sauter l'étape de commit.

## Review Focus

1. **Libellé de bouton très long à 320 px.** Un `PrimaryButton` dont le texte dépasse deux lignes doit grandir en hauteur et rester dans son conteneur. Test : tâche 4.
2. **Bandeau cookies affiché en même temps que la barre CTA.** Le bandeau passe au-dessus et reste cliquable. Test : tâche 3.
3. **Barre CTA qui disparaît** (retour en haut de page, changement de route). `--bottom-bar-h` revient à `0px` et le bouton « retour en haut » redescend. Test : tâche 3.
4. **Navigateur sans `dvh`.** `--screen-h` garde sa valeur en `100vh`. Couvert par la déclaration de repli de la tâche 2, contrôlée par relecture (aucun navigateur de test sans `dvh`).
5. **Carrousel du héro en mouvement pendant la comparaison desktop.** Il défile seul toutes les 5 s et ferait échouer la comparaison à tort. Il est masqué dans les captures de référence. Test : tâche 1.

---

### Task 1 : Outil de vérification et référence desktop (lot 0)

**Files:**
- Modify: `package.json` (scripts et dépendance de développement)
- Modify: `.gitignore`
- Create: `playwright.config.js`
- Create: `tests/mobile/routes.js`
- Create: `tests/mobile/helpers.js`
- Create: `tests/mobile/debordement.spec.js`
- Create: `tests/mobile/desktop.spec.js`
- Create: `scripts/captures-mobile.mjs`

**Interfaces:**
- Produces :
  - `ROUTES` : `Array<{ nom: string, chemin: string }>` et `LARGEURS_MOBILE = [320, 375, 414, 768]`, `LARGEUR_DESKTOP = 1280` (dans `tests/mobile/routes.js`).
  - `preparerContexte(context)` : pose le choix de cookies et simule `/api`. `derouler(page)` : fait défiler la page jusqu'en bas puis revient en haut. `ouvrir(page, chemin)` : navigation + attente + `derouler` (dans `tests/mobile/helpers.js`).
  - Scripts npm : `test:mobile`, `captures`, `reference:desktop`.

- [ ] **Étape 1 : installer Playwright**

```bash
rtk npm install --save-dev @playwright/test
rtk npx playwright install chromium
```

Attendu : `@playwright/test` apparaît dans `devDependencies`, Chromium est téléchargé.

- [ ] **Étape 2 : ajouter les scripts npm**

Dans `package.json`, bloc `scripts`, après `"preview": "vite preview"` :

```json
    "preview": "vite preview",
    "test:mobile": "playwright test",
    "reference:desktop": "playwright test tests/mobile/desktop.spec.js --update-snapshots",
    "captures": "vite build && node scripts/captures-mobile.mjs"
```

- [ ] **Étape 3 : ignorer les sorties**

À la fin de `.gitignore` :

```gitignore

# Vérification mobile (Playwright) : captures et rapports, jamais versionnés
captures/
test-results/
playwright-report/
tests/mobile/*-snapshots/
```

- [ ] **Étape 4 : écrire la configuration Playwright**

`playwright.config.js` :

```js
import { defineConfig } from '@playwright/test';

// Les tests tournent contre le build de production servi par `vite preview` :
// en dev, la barre d'annotation (DevAnnotator) se poserait sur les captures.
export default defineConfig({
  testDir: './tests/mobile',
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: 'disabled' },
  },
  use: {
    baseURL: 'http://localhost:4173',
    browserName: 'chromium',
    locale: 'fr-FR',
    // Les animations d'apparition se désactivent sous ce réglage : sans lui,
    // les blocs hors écran resteraient invisibles sur une capture pleine page.
    reducedMotion: 'reduce',
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
```

- [ ] **Étape 5 : lister les routes**

`tests/mobile/routes.js` :

```js
// Routes publiques vérifiées à chaque lot. Les pages du parcours après
// inscription (/inscription/demande/:id/...) dépendent du back : elles sont
// ajoutées par le plan du lot 4, avec leurs réponses simulées.
export const ROUTES = [
  { nom: 'accueil', chemin: '/' },
  { nom: 'formations', chemin: '/formations' },
  { nom: 'vente-kubernetes', chemin: '/formations/kubernetes-fondamentaux' },
  { nom: 'vente-management-ia', chemin: '/formations/management-processus-ia' },
  { nom: 'financements', chemin: '/financements' },
  { nom: 'contact', chemin: '/contact' },
  { nom: 'contact-rdv', chemin: '/contact?mode=rendez-vous' },
  { nom: 'a-propos', chemin: '/a-propos' },
  { nom: 'reclamations', chemin: '/reclamations' },
  { nom: 'blog', chemin: '/blog' },
  { nom: 'article', chemin: '/blog/demarrer-avec-kubernetes-sans-se-perdre' },
  { nom: 'inscription', chemin: '/inscription/kubernetes-fondamentaux' },
  { nom: 'mentions-legales', chemin: '/mentions-legales' },
  { nom: 'confidentialite', chemin: '/politique-confidentialite' },
  { nom: 'cookies', chemin: '/politique-cookies' },
  { nom: 'conditions-vente', chemin: '/conditions-vente' },
  { nom: 'introuvable', chemin: '/page-qui-n-existe-pas' },
];

export const LARGEURS_MOBILE = [320, 375, 414, 768];
export const LARGEUR_DESKTOP = 1280;
```

- [ ] **Étape 6 : écrire les fonctions partagées**

`tests/mobile/helpers.js` :

```js
// Clé et forme du choix de cookies : voir src/lib/cookieConsent.js.
const CLE_COOKIES = 'hta.cookie-consent.v1';

/**
 * Prépare un contexte de navigation : cookies déjà refusés (le bandeau ne
 * masque pas le bas des captures) et back simulé (vite preview n'a pas de
 * proxy /api ; sans cette règle, il renverrait index.html à la place du JSON).
 * `bandeau: true` laisse le bandeau s'afficher, pour les tests qui le visent.
 */
export async function preparerContexte(context, { bandeau = false } = {}) {
  if (!bandeau) {
    await context.addInitScript((cle) => {
      const choix = { necessary: true, analytics: false, ads: false, date: Date.now() };
      window.localStorage.setItem(cle, JSON.stringify(choix));
    }, CLE_COOKIES);
  }
  await context.route('**/api/**', (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }),
  );
}

/** Fait défiler toute la page, pour charger les images différées, puis remonte. */
export async function derouler(page) {
  await page.evaluate(async () => {
    const pas = Math.max(200, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += pas) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 200));
  });
}

export async function ouvrir(page, chemin) {
  await page.goto(chemin, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await derouler(page);
}

/** Options de contexte pour une largeur donnée (tactile sous 1024 px). */
export function contextePour(largeur) {
  const mobile = largeur < 1024;
  return {
    viewport: { width: largeur, height: mobile ? 740 : 800 },
    deviceScaleFactor: mobile ? 2 : 1,
    isMobile: mobile,
    hasTouch: mobile,
  };
}
```

- [ ] **Étape 7 : écrire le test de débordement horizontal**

`tests/mobile/debordement.spec.js` :

```js
import { test, expect } from '@playwright/test';
import { ROUTES, LARGEURS_MOBILE } from './routes.js';
import { preparerContexte, ouvrir, contextePour } from './helpers.js';

// Critère 1 de la spec : aucune page ne défile horizontalement.
for (const largeur of LARGEURS_MOBILE) {
  test.describe(`largeur ${largeur} px`, () => {
    test.use(contextePour(largeur));

    for (const route of ROUTES) {
      test(`${route.nom} : pas de défilement horizontal`, async ({ page, context }) => {
        await preparerContexte(context);
        await ouvrir(page, route.chemin);
        const mesure = await page.evaluate(() => ({
          contenu: document.documentElement.scrollWidth,
          fenetre: document.documentElement.clientWidth,
        }));
        expect(mesure.contenu, `contenu ${mesure.contenu} px pour une fenêtre de ${mesure.fenetre} px`)
          .toBeLessThanOrEqual(mesure.fenetre);
      });
    }
  });
}
```

- [ ] **Étape 8 : écrire la comparaison desktop**

`tests/mobile/desktop.spec.js` :

```js
import { test, expect } from '@playwright/test';
import { ROUTES, LARGEUR_DESKTOP } from './routes.js';
import { preparerContexte, ouvrir, contextePour } from './helpers.js';

// Critère 6 de la spec : à 1280 px, le rendu ne bouge pas. La référence est
// prise avant le lot 1 par `npm run reference:desktop`.
test.use(contextePour(LARGEUR_DESKTOP));

for (const route of ROUTES) {
  test(`${route.nom} : rendu desktop inchangé`, async ({ page, context }) => {
    await preparerContexte(context);
    await ouvrir(page, route.chemin);
    await expect(page).toHaveScreenshot(`${route.nom}.png`, {
      fullPage: true,
      // Le carrousel du héro défile seul toutes les 5 s.
      mask: [page.locator('.hcc')],
    });
  });
}
```

- [ ] **Étape 9 : écrire le script de captures et de rapport**

`scripts/captures-mobile.mjs` :

```js
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
```

- [ ] **Étape 10 : prendre l'état initial**

```bash
rtk npm run captures -- avant
```

Attendu : 85 captures dans `captures/avant/` (17 routes × 5 largeurs) et `captures/avant/rapport.json`. Le script peut sortir en erreur si des pages défilent horizontalement : c'est l'état de départ, pas un échec de la tâche. Noter la liste des pages concernées dans le compte rendu.

- [ ] **Étape 11 : prendre la référence desktop**

```bash
rtk npm run reference:desktop
```

Attendu : 17 images dans `tests/mobile/desktop.spec.js-snapshots/`.

- [ ] **Étape 12 : vérifier que la comparaison est stable**

```bash
rtk npx playwright test tests/mobile/desktop.spec.js
```

Attendu : 17 tests réussis, deux fois de suite. Si une page échoue sans aucun changement de code, elle contient un élément animé : ajouter son sélecteur au tableau `mask` de `desktop.spec.js`, reprendre la référence (étape 11) et relancer.

- [ ] **Étape 13 : lancer le test de débordement**

```bash
rtk npx playwright test tests/mobile/debordement.spec.js
```

Attendu : 68 tests exécutés. Des échecs sont possibles à ce stade : ils décrivent l'état de départ. Les noter dans le compte rendu, ils serviront de liste de travail aux lots 2 à 5.

- [ ] **Étape 14 : contrôler lint et build**

```bash
rtk npm run lint
rtk npm run build
```

Attendu : aucun message d'erreur.

- [ ] **Étape 15 : commit (si autorisé)**

```bash
rtk git add package.json package-lock.json .gitignore playwright.config.js tests/mobile scripts/captures-mobile.mjs
rtk git commit -m "hi-tech-academy : outil de vérification mobile (captures et tests Playwright)"
```

---

### Task 2 : Hauteurs d'écran, zone sûre et variables d'empilement

**Files:**
- Modify: `index.html:6`
- Modify: `src/index.css:17-22`
- Create: `tests/mobile/socle.spec.js`

**Interfaces:**
- Produces : variables CSS sur `:root` : `--screen-h` (en `dvh` si géré), `--safe-bottom`, `--bottom-bar-h` (défaut `0px`), `--z-back-to-top` (30), `--z-bottom-bar` (40), `--z-cookies` (2147483600).

- [ ] **Étape 1 : écrire le test qui échoue**

`tests/mobile/socle.spec.js` :

```js
import { test, expect } from '@playwright/test';
import { preparerContexte, ouvrir, contextePour } from './helpers.js';

const variable = (page, nom) =>
  page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), nom);

test.describe('socle : variables et viewport', () => {
  test.use(contextePour(375));

  test('la hauteur d\'écran suit la barre d\'adresse mobile (dvh)', async ({ page, context }) => {
    await preparerContexte(context);
    await ouvrir(page, '/');
    expect(await variable(page, '--screen-h')).toContain('100dvh');
  });

  test('la zone sûre et la pile des éléments fixes sont déclarées', async ({ page, context }) => {
    await preparerContexte(context);
    await ouvrir(page, '/');
    expect(await variable(page, '--bottom-bar-h')).toBe('0px');
    expect(await variable(page, '--z-back-to-top')).toBe('30');
    expect(await variable(page, '--z-bottom-bar')).toBe('40');
    expect(await variable(page, '--z-cookies')).toBe('2147483600');
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('viewport-fit=cover');
  });
});
```

- [ ] **Étape 2 : vérifier que le test échoue**

```bash
rtk npx playwright test tests/mobile/socle.spec.js
```

Attendu : 2 échecs (`--screen-h` contient `100vh`, `--bottom-bar-h` est vide).

- [ ] **Étape 3 : étendre la meta viewport**

`index.html`, ligne 6 :

```html
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

- [ ] **Étape 4 : déclarer les variables**

Dans `src/index.css`, remplacer le bloc `:root` des lignes 17 à 22 par :

```css
:root {
  --page-zoom: 1;
  --screen-h: calc(100vh / var(--page-zoom));
  --screen-svh: calc(100svh / var(--page-zoom));
  --screen-w: calc(100vw / var(--page-zoom));

  /* Bas d'écran. `--safe-bottom` est la zone réservée par l'iPhone (barre
     d'accueil) ; `--bottom-bar-h` est publiée par la barre fixe de la page
     (hook useBottomBar) et vaut 0 quand il n'y en a pas. */
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --bottom-bar-h: 0px;

  /* Pile des éléments fixes, du plus bas au plus haut. Le bandeau cookies
     reste au-dessus de tout : tant qu'il est là, il faut pouvoir y répondre. */
  --z-back-to-top: 30;
  --z-bottom-bar: 40;
  --z-cookies: 2147483600;
}
/* `100vh` compte la barre d'adresse mobile même quand elle est affichée : le
   bas d'un bloc « plein écran » passait dessous. `dvh` suit la hauteur
   réellement visible. Les navigateurs qui ne le gèrent pas gardent `100vh`. */
@supports (height: 100dvh) {
  :root { --screen-h: calc(100dvh / var(--page-zoom)); }
}
```

- [ ] **Étape 5 : vérifier que le test passe**

```bash
rtk npx playwright test tests/mobile/socle.spec.js
```

Attendu : 2 tests réussis.

- [ ] **Étape 6 : vérifier que le desktop n'a pas bougé**

```bash
rtk npx playwright test tests/mobile/desktop.spec.js
```

Attendu : 17 tests réussis.

- [ ] **Étape 7 : commit (si autorisé)**

```bash
rtk git add index.html src/index.css tests/mobile/socle.spec.js
rtk git commit -m "hi-tech-academy : hauteurs d'écran en dvh, zone sûre et pile des éléments fixes"
```

---

### Task 3 : Éléments fixes en bas d'écran

**Files:**
- Create: `src/hooks/use-bottom-bar.js`
- Modify: `src/components/vente/BarreCta.jsx`
- Modify: `src/components/BackToTop.jsx:37-42` et `:59`
- Modify: `src/components/CookieConsent.jsx:140`
- Create: `tests/mobile/elements-fixes.spec.js`

**Interfaces:**
- Consumes : `--bottom-bar-h`, `--safe-bottom`, `--z-back-to-top`, `--z-bottom-bar`, `--z-cookies` (tâche 2).
- Produces : `useBottomBar(ref: React.RefObject<HTMLElement>, active: boolean): void`. Tant que `active` est vrai, la hauteur de `ref.current` est écrite dans `--bottom-bar-h` sur `<html>`. Sinon la variable vaut `0px`. Attribut `data-bottom-bar` sur la racine de toute barre fixe. Le lot 4 réutilise les deux.

- [ ] **Étape 1 : écrire les tests qui échouent**

`tests/mobile/elements-fixes.spec.js` :

```js
import { test, expect } from '@playwright/test';
import { preparerContexte, contextePour } from './helpers.js';

const VENTE = '/formations/kubernetes-fondamentaux';
const retourEnHaut = (page) => page.getByRole('button', { name: 'Revenir en haut de la page' });
const barre = (page) => page.locator('[data-bottom-bar]');

async function descendre(page, y) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.waitForTimeout(500); // transitions de la barre et du bouton
}

for (const largeur of [320, 375]) {
  test.describe(`éléments fixes à ${largeur} px`, () => {
    test.use(contextePour(largeur));

    test('le bouton retour en haut ne recouvre pas la barre CTA', async ({ page, context }) => {
      await preparerContexte(context);
      await page.goto(VENTE, { waitUntil: 'networkidle' });
      await descendre(page, 3000);

      const b = await retourEnHaut(page).boundingBox();
      const c = await barre(page).boundingBox();
      expect(b.y + b.height).toBeLessThanOrEqual(c.y);
    });

    test('la barre CTA tient dans la fenêtre', async ({ page, context }) => {
      await preparerContexte(context);
      await page.goto(VENTE, { waitUntil: 'networkidle' });
      await descendre(page, 3000);

      const lien = barre(page).getByRole('link');
      const l = await lien.boundingBox();
      expect(l.x).toBeGreaterThanOrEqual(0);
      expect(l.x + l.width).toBeLessThanOrEqual(largeur);
    });

    test('la hauteur publiée revient à zéro quand la barre disparaît', async ({ page, context }) => {
      await preparerContexte(context);
      await page.goto(VENTE, { waitUntil: 'networkidle' });
      const hauteur = () =>
        page.evaluate(() => document.documentElement.style.getPropertyValue('--bottom-bar-h').trim());

      await descendre(page, 3000);
      expect(parseFloat(await hauteur())).toBeGreaterThan(40);

      await descendre(page, 0);
      expect(await hauteur()).toBe('0px');

      // Changement de route : la page d'accueil n'a pas de barre fixe.
      await descendre(page, 3000);
      await page.goto('/', { waitUntil: 'networkidle' });
      expect(['', '0px']).toContain(await hauteur());
    });

    test('le bandeau cookies passe au-dessus de la barre CTA et reste cliquable', async ({ page, context }) => {
      await preparerContexte(context, { bandeau: true });
      await page.goto(VENTE, { waitUntil: 'networkidle' });
      await descendre(page, 3000);

      await page.getByRole('button', { name: 'Tout refuser' }).click();
      await expect(page.getByRole('dialog', { name: 'Gestion des cookies' })).toHaveCount(0);
    });
  });
}
```

- [ ] **Étape 2 : vérifier que les tests échouent**

```bash
rtk npx playwright test tests/mobile/elements-fixes.spec.js
```

Attendu : échec sur le sélecteur `[data-bottom-bar]` (il n'existe pas encore).

- [ ] **Étape 3 : écrire le hook**

`src/hooks/use-bottom-bar.js` :

```js
import { useEffect } from 'react';

// Publie la hauteur d'une barre fixée en bas d'écran dans `--bottom-bar-h`
// (sur <html>). Le bouton « retour en haut » s'en sert pour se placer
// au-dessus de la barre au lieu de la recouvrir. Une seule barre par page.
export function useBottomBar(ref, active) {
  useEffect(() => {
    const racine = document.documentElement;
    const element = ref.current;
    if (!active || !element) {
      racine.style.setProperty('--bottom-bar-h', '0px');
      return undefined;
    }

    const publier = () => {
      racine.style.setProperty('--bottom-bar-h', `${Math.round(element.getBoundingClientRect().height)}px`);
    };
    publier();

    // La hauteur change quand le libellé du bouton passe sur deux lignes.
    const observateur = new ResizeObserver(publier);
    observateur.observe(element);

    return () => {
      observateur.disconnect();
      racine.style.setProperty('--bottom-bar-h', '0px');
    };
  }, [ref, active]);
}
```

- [ ] **Étape 4 : brancher la barre CTA**

Remplacer tout le contenu de `src/components/vente/BarreCta.jsx` par :

```jsx
import React, { useRef } from 'react';
import PrimaryButton from '@/components/ui/primary-button';
import { LINE, BODY_MUTED, headingFont, bodyFont } from '@/components/design';
import { useBottomBar } from '@/hooks/use-bottom-bar';

/**
 * Barre d'action fixe en bas d'écran, à toutes les largeurs : prix + devis
 * (+ inscription sur desktop). Elle glisse hors champ tant que le héro — qui
 * porte déjà le CTA — est visible.
 */
export default function BarreCta({ visible, prixHT, resume, inscriptionTo }) {
  const ref = useRef(null);
  useBottomBar(ref, visible);

  return (
    <div
      ref={ref}
      data-bottom-bar
      className={`fixed inset-x-0 bottom-0 bg-white transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      style={{ zIndex: 'var(--z-bottom-bar)', borderTop: `1px solid ${LINE}`, boxShadow: '0 -8px 24px rgba(0,45,116,.10)' }}>
      {/* Le padding bas absorbe la zone réservée par l'iPhone (barre d'accueil). */}
      <div
        className="max-w-site mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 pt-3"
        style={{ paddingBottom: 'calc(0.75rem + var(--safe-bottom))' }}>
        <span className="min-w-0">
          <span className="block text-body-base font-bold leading-tight tabular-nums" style={{ color: '#243037', ...headingFont }}>
            {prixHT} <span className="text-caption font-semibold" style={{ color: BODY_MUTED }}>HT</span>
          </span>
          <span className="block text-caption leading-snug truncate" style={{ color: BODY_MUTED, ...bodyFont }}>{resume}</span>
        </span>
        <span className="flex items-center gap-5 min-w-0">
          <PrimaryButton to={inscriptionTo} size="sm">Demander une inscription</PrimaryButton>
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Étape 5 : replacer le bouton « retour en haut »**

Dans `src/components/BackToTop.jsx`, remplacer les lignes 38 à 42 :

```jsx
        position: "fixed",
        right: "1.5rem",
        bottom: "1.5rem",
        // Au-dessus de tout, y compris la barre d'annotation de dev (Agentation).
        zIndex: 2147483000,
```

par :

```jsx
        position: "fixed",
        right: "1.5rem",
        // Il se pose au-dessus de la barre fixe de la page quand il y en a une
        // (`--bottom-bar-h`), et hors de la zone réservée par l'iPhone. Il
        // recouvrait le bouton d'inscription de la page de vente.
        bottom: "calc(var(--bottom-bar-h, 0px) + 1.5rem + var(--safe-bottom, 0px))",
        zIndex: "var(--z-back-to-top)",
```

Puis la ligne de transition (l.59) :

```jsx
        transition: "opacity .25s ease, transform .25s ease, background .2s ease",
```

devient :

```jsx
        transition: "opacity .25s ease, transform .25s ease, background .2s ease, bottom .3s ease",
```

Note : la spec donne 16 px d'écart. Le plan garde les 24 px actuels (`1.5rem`) pour que la position desktop ne change pas.

- [ ] **Étape 6 : passer le bandeau cookies sur la variable**

Dans `src/components/CookieConsent.jsx`, ligne 140 :

```jsx
        zIndex: 2147483600,
```

devient :

```jsx
        zIndex: 'var(--z-cookies)',
```

- [ ] **Étape 7 : vérifier l'état des tests**

```bash
rtk npx playwright test tests/mobile/elements-fixes.spec.js
```

Attendu : à 375 px, les 4 tests passent. À 320 px, « la barre CTA tient dans la fenêtre » peut encore échouer : le bouton ne passe pas à la ligne avant la tâche 4. Les 3 autres passent.

- [ ] **Étape 8 : vérifier que le desktop n'a pas bougé**

```bash
rtk npx playwright test tests/mobile/desktop.spec.js
rtk npm run lint
```

Attendu : 17 tests réussis, lint sans erreur.

- [ ] **Étape 9 : commit (si autorisé)**

```bash
rtk git add src/hooks/use-bottom-bar.js src/components/vente/BarreCta.jsx src/components/BackToTop.jsx src/components/CookieConsent.jsx tests/mobile/elements-fixes.spec.js
rtk git commit -m "hi-tech-academy : le bouton retour en haut ne recouvre plus la barre CTA"
```

---

### Task 4 : Bouton primaire qui passe à la ligne

**Files:**
- Modify: `src/components/ui/primary-button.jsx`
- Modify: `src/components/FinancementSection.jsx:116`
- Modify: `CLAUDE.md` (section « Bouton primaire »)
- Create: `tests/mobile/bouton.spec.js`

**Interfaces:**
- Produces : `PrimaryButton` accepte une prop `block: boolean` (défaut `false`). Sous 640 px, `block` donne la pleine largeur. À partir de 640 px, le rendu est celui d'avant, avec ou sans `block`.

- [ ] **Étape 1 : écrire les tests qui échouent**

`tests/mobile/bouton.spec.js` :

```js
import { test, expect } from '@playwright/test';
import { preparerContexte, ouvrir, contextePour } from './helpers.js';

const LIBELLE = 'Choisir ma formation et demander une inscription';
const bouton = (page) => page.getByRole('link', { name: LIBELLE });

for (const largeur of [320, 375]) {
  test.describe(`bouton primaire à ${largeur} px`, () => {
    test.use(contextePour(largeur));

    test('un libellé long reste dans son conteneur', async ({ page, context }) => {
      await preparerContexte(context);
      await ouvrir(page, '/');
      await bouton(page).scrollIntoViewIfNeeded();

      const mesure = await bouton(page).evaluate((el) => {
        const b = el.getBoundingClientRect();
        const parent = el.parentElement.getBoundingClientRect();
        return { gauche: b.left, droite: b.right, hauteur: b.height, pGauche: parent.left, pDroite: parent.right };
      });
      expect(mesure.gauche).toBeGreaterThanOrEqual(mesure.pGauche - 0.5);
      expect(mesure.droite).toBeLessThanOrEqual(mesure.pDroite + 0.5);
      // Deux lignes : le bouton grandit au lieu de rogner son texte.
      expect(mesure.hauteur).toBeGreaterThanOrEqual(48);
    });

    test('avec block, il occupe toute la largeur disponible', async ({ page, context }) => {
      await preparerContexte(context);
      await ouvrir(page, '/');
      const mesure = await bouton(page).evaluate((el) => ({
        bouton: el.getBoundingClientRect().width,
        parent: el.parentElement.clientWidth,
      }));
      expect(Math.abs(mesure.bouton - mesure.parent)).toBeLessThanOrEqual(1);
    });
  });
}

test.describe('bouton primaire à 1280 px', () => {
  test.use(contextePour(1280));

  test('il reste sur une ligne, à sa hauteur d\'origine', async ({ page, context }) => {
    await preparerContexte(context);
    await ouvrir(page, '/');
    const mesure = await bouton(page).evaluate((el) => ({
      retour: getComputedStyle(el).whiteSpace,
      hauteur: el.getBoundingClientRect().height,
    }));
    expect(mesure.retour).toBe('nowrap');
    expect(mesure.hauteur).toBe(48);
  });
});
```

- [ ] **Étape 2 : vérifier que les tests échouent**

```bash
rtk npx playwright test tests/mobile/bouton.spec.js
```

Attendu : les 4 tests mobiles échouent (le bouton dépasse de son parent), le test à 1280 px passe.

- [ ] **Étape 3 : modifier le bouton**

Dans `src/components/ui/primary-button.jsx`, remplacer le commentaire d'en-tête et `SIZES` (lignes 13 à 21) par :

```jsx
// `inverted` : variante blanche pour les fonds sombres.
// `size`     : 'sm' (44 px, header) · 'md' (48 px, défaut) · 'lg' (56 px, héro).
// `block`    : pleine largeur sous 640 px (CTA de section sur mobile).
//
// Les hauteurs sont des cibles tactiles : 44 px minimum partout. Sous 640 px
// ce sont des hauteurs MINIMALES : un libellé long passe sur deux lignes et le
// bouton grandit, au lieu de déborder de son conteneur.
const SIZES = {
  sm: 'min-h-[44px] py-2 px-6 text-body-sm sm:h-11 sm:py-0',
  md: 'min-h-[48px] py-2.5 px-7 text-body-base sm:h-12 sm:py-0',
  lg: 'min-h-[56px] py-3 px-8 text-body-base sm:h-14 sm:py-0',
};
```

Remplacer la signature (ligne 24) :

```jsx
  ({ to, href, children, className, inverted = false, size = 'md', disabled, ...props }, ref) => {
```

par :

```jsx
  ({ to, href, children, className, inverted = false, size = 'md', block = false, disabled, ...props }, ref) => {
```

Remplacer la première ligne de `classes` (ligne 30) :

```jsx
      'inline-flex items-center justify-center w-fit rounded-full font-semibold whitespace-nowrap',
```

par :

```jsx
      'inline-flex items-center justify-center max-w-full rounded-full font-semibold text-center',
      'whitespace-normal sm:whitespace-nowrap',
      block ? 'w-full sm:w-fit' : 'w-fit',
```

- [ ] **Étape 4 : poser `block` sur le CTA de la section financement**

`src/components/FinancementSection.jsx`, ligne 116 :

```jsx
                <PrimaryButton to="/formations" block>Choisir ma formation et demander une inscription</PrimaryButton>
```

- [ ] **Étape 5 : documenter la prop dans la charte**

Dans `CLAUDE.md`, section « Bouton primaire », ajouter une ligne à l'exemple de code, après la ligne `size="lg"` :

```jsx
<PrimaryButton to="/x" block>…</PrimaryButton>                         // pleine largeur sous 640 px
```

Et remplacer le paragraphe « Props : ... » par :

```markdown
Props : `to` | `href` | (sinon `<button>`), `inverted`, `size` (`sm` 44 px ·
`md` 48 px · `lg` 56 px), `block` (pleine largeur sous 640 px), `className`, et
tout attribut natif. Une prop `icon` éventuellement transmise par un ancien
appel est absorbée sans effet.

Sous 640 px, le libellé peut passer à la ligne : les hauteurs deviennent des
hauteurs minimales. Ne pas reposer `whitespace-nowrap` sur un bouton.
```

- [ ] **Étape 6 : vérifier que les tests passent**

```bash
rtk npx playwright test tests/mobile/bouton.spec.js tests/mobile/elements-fixes.spec.js
```

Attendu : tous les tests passent, y compris « la barre CTA tient dans la fenêtre » à 320 px.

- [ ] **Étape 7 : vérifier que le desktop n'a pas bougé**

```bash
rtk npx playwright test tests/mobile/desktop.spec.js
rtk npm run lint
```

Attendu : 17 tests réussis, lint sans erreur.

- [ ] **Étape 8 : commit (si autorisé)**

```bash
rtk git add src/components/ui/primary-button.jsx src/components/FinancementSection.jsx CLAUDE.md tests/mobile/bouton.spec.js
rtk git commit -m "hi-tech-academy : le bouton primaire passe à la ligne sous 640 px, prop block"
```

---

### Task 5 : Titre de la section profils à l'échelle mobile

**Files:**
- Modify: `src/index.css:225`
- Modify: `tests/mobile/socle.spec.js`

**Interfaces:**
- Consumes : `--text-h2` (22 px sous 768 px, déjà défini dans `src/index.css:100`).

- [ ] **Étape 1 : écrire le test qui échoue**

À la fin de `tests/mobile/socle.spec.js` :

```js
test.describe('socle : titres à l\'échelle mobile', () => {
  test.use(contextePour(375));

  test('le titre de la section profils fait 22 px', async ({ page, context }) => {
    await preparerContexte(context);
    await ouvrir(page, '/');
    const taille = await page
      .locator('.audience-section__intro h2')
      .evaluate((el) => getComputedStyle(el).fontSize);
    expect(taille).toBe('22px');
  });
});
```

- [ ] **Étape 2 : vérifier que le test échoue**

```bash
rtk npx playwright test tests/mobile/socle.spec.js -g "profils"
```

Attendu : échec, taille reçue `38px`.

- [ ] **Étape 3 : corriger la règle**

`src/index.css`, ligne 225, remplacer :

```css
@media (max-width: 640px) { .audience-section__intro h2 { margin-top: 25px; font-size: 38px; }.audience-cards { grid-template-columns: 1fr; }.audience-card__image { height: 220px; }}
```

par :

```css
/* Le titre suit l'échelle mobile (H2 = 22 px). Il était forcé à 38 px, plus
   grand que sur desktop. */
@media (max-width: 640px) { .audience-section__intro h2 { margin-top: 24px; font-size: var(--text-h2); line-height: var(--lh-heading); letter-spacing: var(--ls-h2); }.audience-cards { grid-template-columns: 1fr; }.audience-card__image { height: 220px; }}
```

- [ ] **Étape 4 : vérifier que le test passe**

```bash
rtk npx playwright test tests/mobile/socle.spec.js
```

Attendu : 3 tests réussis.

- [ ] **Étape 5 : commit (si autorisé)**

```bash
rtk git add src/index.css tests/mobile/socle.spec.js
rtk git commit -m "hi-tech-academy : titre de la section profils ramené à l'échelle mobile"
```

---

### Task 6 : Vérification du lot et compte rendu

**Files:**
- Create: `docs/superpowers/plans/2026-09-27-experience-mobile-lots-0-1-compte-rendu.md`

**Interfaces:**
- Consumes : tous les tests et scripts des tâches 1 à 5.
- Produces : la liste de travail des lots 2 à 5 (pages qui défilent horizontalement, éléments qui dépassent, cibles tactiles trop petites).

- [ ] **Étape 1 : contrôles automatiques**

```bash
rtk npm run lint
rtk npm run build
rtk npm run test:mobile
```

Attendu : lint et build sans erreur. `socle`, `bouton`, `elements-fixes` et `desktop` passent. Les échecs restants de `debordement` sont ceux relevés à la tâche 1, moins ceux corrigés par le bouton.

- [ ] **Étape 2 : captures après le lot**

```bash
rtk npm run captures -- apres-lot-1
```

Attendu : 85 captures dans `captures/apres-lot-1/`.

- [ ] **Étape 3 : relire les captures**

Ouvrir, pour les largeurs 320 et 375, les captures de `accueil`, `vente-kubernetes` et `vente-management-ia` dans `captures/avant/` et `captures/apres-lot-1/`. Contrôler à l'œil :
- le CTA de la section financement tient dans son bloc ;
- aucun bouton primaire ne sort de son conteneur ;
- le titre de la section profils n'est plus surdimensionné.

- [ ] **Étape 4 : contrôler l'admin**

```bash
rtk npm run preview -- --port 4173 --strictPort
```

Ouvrir `http://localhost:4173/admin` à 1280 px et comparer à l'état d'avant le lot : titres, boutons et mise en page identiques. Le socle ne modifie aucune règle globale `h1` à `h6` ni `p`. L'admin n'utilise pas `PrimaryButton`. Arrêter le serveur ensuite.

- [ ] **Étape 5 : écrire le compte rendu**

`docs/superpowers/plans/2026-09-27-experience-mobile-lots-0-1-compte-rendu.md`, avec ces quatre parties remplies à partir des sorties réelles :

1. **Vérifié** : résultat de chaque commande de l'étape 1, avec le nombre de tests réussis et échoués.
2. **État de départ** : pour chaque page de `captures/avant/rapport.json` où `defilementHorizontal` vaut `true`, la page, la largeur et les trois premiers éléments de `depassements`.
3. **État après le lot 1** : la même liste tirée de `captures/apres-lot-1/rapport.json`.
4. **Non vérifié** : pages du parcours après inscription (absentes des routes, prévues au lot 4), articles dynamiques du blog (back simulé en 503), rendu sur un vrai iPhone pour la zone sûre.

- [ ] **Étape 6 : commit (si autorisé)**

```bash
rtk git add docs/superpowers/plans/2026-09-27-experience-mobile-lots-0-1-compte-rendu.md
rtk git commit -m "hi-tech-academy : compte rendu du socle mobile"
```
