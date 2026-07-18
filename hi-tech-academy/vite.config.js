import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // En dev, /api est proxifié vers le backend Spring Boot local
  // (en production c'est le nginx du front qui joue ce rôle).
  server: {
    proxy: {
      '/api': process.env.API_PROXY_TARGET || 'http://localhost:8080',
    },
  },
});
