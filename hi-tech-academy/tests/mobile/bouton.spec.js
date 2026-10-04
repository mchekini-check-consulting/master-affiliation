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
