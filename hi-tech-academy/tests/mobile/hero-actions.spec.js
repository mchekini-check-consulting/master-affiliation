import { test, expect } from '@playwright/test';
import { preparerContexte, ouvrir, contextePour } from './helpers.js';

const mesures = (page) =>
  page.locator('.academy-hero__actions > a').evaluateAll((elements) => {
    const cadre = elements[0].parentElement.getBoundingClientRect();
    return {
      cadre: { gauche: cadre.left, droite: cadre.right },
      boutons: elements.map((el) => {
        const b = el.getBoundingClientRect();
        return { haut: Math.round(b.top), hauteur: Math.round(b.height), gauche: b.left, droite: b.right };
      }),
    };
  });

for (const largeur of [320, 375, 414]) {
  test.describe(`actions du héro à ${largeur} px`, () => {
    test.use(contextePour(largeur));

    test('les deux boutons tiennent sur une ligne, à la même hauteur', async ({ page, context }) => {
      await preparerContexte(context);
      await ouvrir(page, '/');
      const { cadre, boutons } = await mesures(page);

      expect(boutons).toHaveLength(2);
      expect(boutons[0].haut).toBe(boutons[1].haut);
      // 56 px chacun : aucun libellé n'est passé sur deux lignes.
      expect(boutons[0].hauteur).toBe(56);
      expect(boutons[1].hauteur).toBe(56);
      expect(boutons[0].droite).toBeLessThanOrEqual(boutons[1].gauche);
      expect(boutons[0].gauche).toBeGreaterThanOrEqual(cadre.gauche - 0.5);
      expect(boutons[1].droite).toBeLessThanOrEqual(cadre.droite + 0.5);
    });

    test('les libellés courts sont affichés', async ({ page, context }) => {
      await preparerContexte(context);
      await ouvrir(page, '/');
      const actions = page.locator('.academy-hero__actions');
      await expect(actions.getByText('Nos formations', { exact: true })).toBeVisible();
      await expect(actions.getByText('La méthode', { exact: true })).toBeVisible();
      await expect(actions.getByText('Découvrir nos formations')).toBeHidden();
    });
  });
}

test.describe('actions du héro à 1280 px', () => {
  test.use(contextePour(1280));

  test('les libellés longs sont conservés', async ({ page, context }) => {
    await preparerContexte(context);
    await ouvrir(page, '/');
    const actions = page.locator('.academy-hero__actions');
    await expect(actions.getByText('Découvrir nos formations')).toBeVisible();
    await expect(actions.getByText('Comment ça marche ?')).toBeVisible();
  });
});
