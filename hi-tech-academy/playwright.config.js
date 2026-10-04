import { defineConfig } from '@playwright/test';

// Les tests tournent contre le build de production servi par `vite preview` :
// en dev, la barre d'annotation (DevAnnotator) se poserait sur les captures.
export default defineConfig({
  testDir: './tests/mobile',
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  expect: {
    // L'accueil est long : deux captures pleine page consécutives dépassent
    // les 5 s accordées par défaut.
    timeout: 30_000,
    // Seuil absolu : un ratio, sur une page de 9 000 px de haut, laisserait
    // passer un bloc entier qui change de taille.
    toHaveScreenshot: { maxDiffPixels: 300, animations: 'disabled' },
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
    // Jamais de serveur réutilisé : il servirait un ancien build, et les
    // tests valideraient du code qui n'est plus celui de l'arbre de travail.
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
