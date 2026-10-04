import { test, expect } from '@playwright/test';
import { preparerContexte, ouvrir, contextePour } from './helpers.js';

const avantages = (page) => page.locator('.academy-hero__benefit');

// Position et taille de chaque avantage affiché (les copies masquées sont exclues).
const mesures = (page) =>
  avantages(page).evaluateAll((elements) =>
    elements
      .map((el) => el.getBoundingClientRect())
      .filter((b) => b.width > 0)
      .map((b) => ({ gauche: b.left, haut: Math.round(b.top), largeur: b.width })),
  );

for (const largeur of [320, 375]) {
  test.describe(`avantages du héro à ${largeur} px, animations permises`, () => {
    test.use({ ...contextePour(largeur), reducedMotion: 'no-preference' });

    test('ils défilent en continu sur une seule ligne', async ({ page, context }) => {
      await preparerContexte(context);
      await ouvrir(page, '/');

      const depart = await mesures(page);
      // Trois avantages et leur copie, tous sur la même ligne.
      expect(depart).toHaveLength(6);
      expect(new Set(depart.map((m) => m.haut)).size).toBe(1);

      await page.waitForTimeout(1000);
      const ensuite = await mesures(page);
      expect(ensuite[0].gauche).not.toBeCloseTo(depart[0].gauche, 0);
    });

    test('la boucle reprend sans saut : les deux moitiés ont la même largeur', async ({ page, context }) => {
      await preparerContexte(context);
      await ouvrir(page, '/');
      const m = await mesures(page);
      const somme = (liste) => liste.reduce((total, { largeur: l }) => total + l, 0);
      expect(somme(m.slice(0, 3))).toBeCloseTo(somme(m.slice(3)), 0);
      // Une moitié couvre au moins l'écran, sinon un vide apparaîtrait en fin de boucle.
      expect(somme(m.slice(0, 3))).toBeGreaterThanOrEqual(largeur);
    });

    test('la page ne défile pas horizontalement', async ({ page, context }) => {
      await preparerContexte(context);
      await ouvrir(page, '/');
      const deborde = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(deborde).toBe(false);
    });

    test('la copie est masquée aux lecteurs d\'écran', async ({ page, context }) => {
      await preparerContexte(context);
      await ouvrir(page, '/');
      await expect(page.locator('.academy-hero__benefit[aria-hidden="true"]')).toHaveCount(3);
    });
  });
}

test.describe('avantages du héro à 375 px, animations réduites', () => {
  test.use(contextePour(375));

  test('ils restent empilés, sans mouvement ni copie', async ({ page, context }) => {
    await preparerContexte(context);
    await ouvrir(page, '/');
    const depart = await mesures(page);
    expect(depart).toHaveLength(3);
    expect(new Set(depart.map((m) => m.haut)).size).toBe(3);
    await page.waitForTimeout(1000);
    expect(await mesures(page)).toEqual(depart);
  });
});

test.describe('avantages du héro à 1280 px', () => {
  test.use({ ...contextePour(1280), reducedMotion: 'no-preference' });

  test('les trois avantages restent côte à côte, sans mouvement ni copie', async ({ page, context }) => {
    await preparerContexte(context);
    await ouvrir(page, '/');
    const depart = await mesures(page);
    expect(depart).toHaveLength(3);
    expect(new Set(depart.map((m) => m.haut)).size).toBe(1);
    await page.waitForTimeout(1000);
    expect(await mesures(page)).toEqual(depart);
  });
});
