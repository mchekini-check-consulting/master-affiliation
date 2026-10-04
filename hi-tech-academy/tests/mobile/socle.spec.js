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
