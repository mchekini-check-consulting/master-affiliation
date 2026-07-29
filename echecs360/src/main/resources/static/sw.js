/*
 * Échecs360 — service worker (PWA).
 *
 * Stratégie « stale-while-revalidate » sur les ressources statiques du même
 * domaine (css, js, images, polices, vidéos, Stockfish WASM ~7 Mo) : la
 * réponse en cache part immédiatement, le réseau rafraîchit en arrière-plan.
 * Les pages HTML et l'API ne sont jamais interceptées : l'authentification
 * (Spring Security, CSRF) reste servie par le réseau.
 */
'use strict';

const CACHE = 'echecs360-static-v1';

/* Chemins statiques éligibles au cache (jamais /app lui-même ni /api). */
const STATIC_PATH = /^\/(css|img|fonts|videos)\/|^\/app\/(js|css)\//;

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
      const refresh = fetch(event.request).then((resp) => {
        // On ne met en cache que les vraies réponses statiques : une
        // redirection (session expirée sur /app/js/…) ne doit jamais y entrer.
        if (resp.ok && resp.type === 'basic' && !resp.redirected) {
          cache.put(event.request, resp.clone());
        }
        return resp;
      }).catch(() => cached);
      return cached || refresh;
    })
  );
});
