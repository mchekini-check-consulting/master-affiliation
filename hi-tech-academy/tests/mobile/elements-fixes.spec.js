import { test, expect } from '@playwright/test';
import { preparerContexte, contextePour } from './helpers.js';

const VENTE = '/formations/kubernetes-fondamentaux';
const HAUTEUR_FENETRE = 740; // voir contextePour() : hauteur des largeurs mobiles
const retourEnHaut = (page) => page.getByRole('button', { name: 'Revenir en haut de la page' });
const barre = (page) => page.locator('[data-bottom-bar]');
const hauteurPubliee = (page) =>
  page.evaluate(() => document.documentElement.style.getPropertyValue('--bottom-bar-h').trim());

async function descendre(page, y) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
}

/** Attend que la barre ait fini de glisser dans la fenêtre, puis rend sa boîte. */
async function barreAffichee(page) {
  await expect
    .poll(async () => {
      const c = await barre(page).boundingBox();
      return Math.round(c.y + c.height);
    })
    .toBeLessThanOrEqual(HAUTEUR_FENETRE + 1);
  return barre(page).boundingBox();
}

for (const largeur of [320, 375]) {
  test.describe(`éléments fixes à ${largeur} px`, () => {
    test.use(contextePour(largeur));

    test('le bouton retour en haut ne recouvre pas la barre CTA', async ({ page, context }) => {
      await preparerContexte(context);
      await page.goto(VENTE, { waitUntil: 'networkidle' });
      await descendre(page, 3000);
      await barreAffichee(page);

      // Le bouton remonte en 300 ms : on attend qu'il soit au-dessus de la barre.
      await expect
        .poll(async () => {
          const b = await retourEnHaut(page).boundingBox();
          const c = await barre(page).boundingBox();
          return Math.round(b.y + b.height - c.y);
        })
        .toBeLessThanOrEqual(0);
    });

    test('la barre CTA tient dans la fenêtre', async ({ page, context }) => {
      await preparerContexte(context);
      await page.goto(VENTE, { waitUntil: 'networkidle' });
      await descendre(page, 3000);
      await barreAffichee(page);

      const l = await barre(page).getByRole('link').boundingBox();
      expect(l.x).toBeGreaterThanOrEqual(0);
      expect(l.x + l.width).toBeLessThanOrEqual(largeur);
    });

    test('la barre CTA reste basse : bouton sur une ligne, résumé entier', async ({ page, context }) => {
      await preparerContexte(context);
      await page.goto(VENTE, { waitUntil: 'networkidle' });
      await descendre(page, 3000);
      const c = await barreAffichee(page);

      expect(c.height).toBeLessThanOrEqual(72);
      const lien = await barre(page).getByRole('link').boundingBox();
      expect(lien.height).toBeLessThanOrEqual(44);
      const resumeCoupe = await barre(page)
        .locator('.truncate')
        .evaluate((el) => el.scrollWidth > el.clientWidth);
      expect(resumeCoupe).toBe(false);
    });

    test('la hauteur publiée revient à zéro quand la barre disparaît', async ({ page, context }) => {
      await preparerContexte(context);
      await page.goto(VENTE, { waitUntil: 'networkidle' });

      await descendre(page, 3000);
      await barreAffichee(page);
      expect(parseFloat(await hauteurPubliee(page))).toBeGreaterThan(40);

      await descendre(page, 0);
      await expect.poll(() => hauteurPubliee(page)).toBe('0px');
    });

    test('la hauteur publiée revient à zéro en changeant de page sans rechargement', async ({ page, context }) => {
      await preparerContexte(context);
      await page.goto(VENTE, { waitUntil: 'networkidle' });

      // Bas de page : la barre est affichée et le pied de page est à l'écran.
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await barreAffichee(page);
      expect(parseFloat(await hauteurPubliee(page))).toBeGreaterThan(40);

      // Lien interne (react-router) : le document n'est pas rechargé, seul le
      // démontage de la barre peut remettre la variable à zéro.
      await page.evaluate(() => { window.__sansRechargement = true; });
      // Sous 640 px, les colonnes du pied de page sont des accordéons repliés.
      await page.getByRole('button', { name: 'Informations légales' }).click();
      await page.locator('footer a[href="/mentions-legales"]').first().click();
      await expect(page).toHaveURL(/\/mentions-legales$/);
      expect(await page.evaluate(() => window.__sansRechargement)).toBe(true);
      await expect.poll(() => hauteurPubliee(page)).toBe('0px');
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

test.describe('éléments fixes à 1280 px', () => {
  test.use(contextePour(1280));

  // La comparaison pleine page est prise en haut de page : ni la barre ni le
  // bouton n'y figurent. Cette capture de fenêtre les couvre.
  test('barre CTA et bouton retour en haut, après défilement', async ({ page, context }) => {
    await preparerContexte(context);
    await page.goto(VENTE, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await descendre(page, 3000);
    await expect
      .poll(async () => {
        const c = await barre(page).boundingBox();
        return Math.round(c.y + c.height);
      })
      .toBeLessThanOrEqual(801);

    const bas = { x: 0, y: 600, width: 1280, height: 200 };
    await expect(page).toHaveScreenshot('vente-bas-de-fenetre.png', { clip: bas, maxDiffPixels: 200 });
  });
});
