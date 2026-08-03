/*
 * Natura Prep — service worker (PWA).
 *
 * Stratégie « stale-while-revalidate » sur les ressources statiques du même
 * domaine : les bundles hachés de Vite (/assets/), les vidéos, le logo et
 * les icônes. Les pages HTML et l'API ne sont jamais interceptées :
 * l'authentification par session reste servie par le réseau.
 */
'use strict';

const CACHE = 'natura-prep-static-v1';

/* Chemins statiques éligibles au cache (jamais les pages ni /api). */
const STATIC_PATH = /^\/(assets|videos)\/|^\/(logo\.png|icon-192\.png|icon-512\.png|icon-512-maskable\.png|apple-touch-icon\.png)$/;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin
      || !STATIC_PATH.test(url.pathname)) {
    return; // le navigateur gère (pages, API, domaines externes)
  }
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(event.request);
      const network = fetch(event.request).then((resp) => {
        // Jamais de redirection en cache (session expirée → HTML de login)
        if (resp.ok && resp.type === 'basic' && !resp.redirected) {
          cache.put(event.request, resp.clone());
        }
        return resp;
      });
      network.catch(() => { /* hors ligne : le cache a déjà répondu */ });
      return cached || network;
    })
  );
});
