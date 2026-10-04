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
