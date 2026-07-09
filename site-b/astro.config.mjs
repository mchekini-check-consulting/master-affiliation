import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// TODO: remplacer par le vrai domaine du site quand la niche sera choisie.
export default defineConfig({
  site: 'https://site-b.example.com',
  integrations: [sitemap()],
});
