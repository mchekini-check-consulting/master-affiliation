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
