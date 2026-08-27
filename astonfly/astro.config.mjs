// @ts-check
import { defineConfig } from 'astro/config';

// Le site est l'export statique ASTONFLY.COM servi tel quel depuis public/
// (SPA React dc-runtime : index.html + en/index.html + assets).
export default defineConfig({
  site: 'https://astonfly.check-consulting.fr',
});
