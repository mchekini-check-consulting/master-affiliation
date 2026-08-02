import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Site multi-pages : landing publique + authentification + espace membre.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        accueil: resolve(__dirname, 'index.html'),
        connexion: resolve(__dirname, 'connexion/index.html'),
        inscription: resolve(__dirname, 'inscription/index.html'),
        espace: resolve(__dirname, 'espace/index.html'),
      },
    },
  },
});
