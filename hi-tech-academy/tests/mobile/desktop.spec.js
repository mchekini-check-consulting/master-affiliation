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
