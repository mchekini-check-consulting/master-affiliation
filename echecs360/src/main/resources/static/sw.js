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

const CACHE = 'echecs360-static-v2';

/* Chemins statiques éligibles au cache (jamais /app lui-même ni /api). */
const STATIC_PATH = /^\/(css|img|fonts|videos)\/|^\/app\/(js|css)\//;

/* Fichiers applicatifs qui changent à chaque déploiement : réseau d'abord
   (fraîcheur garantie), cache en secours hors ligne. Stockfish (~7 Mo),
   polices, images et vidéos restent servis depuis le cache d'abord. */
const FRESH_FIRST = /^\/(css\/|app\/(css\/|js\/(?!stockfish\/)))/;

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
        // On ne met en cache que les vraies réponses statiques : une
        // redirection (session expirée sur /app/js/…) ne doit jamais y entrer.
        if (resp.ok && resp.type === 'basic' && !resp.redirected) {
          cache.put(event.request, resp.clone());
        }
        return resp;
      });
      if (FRESH_FIRST.test(url.pathname)) {
        return network.catch(() => {
          if (cached) return cached;
          throw new Error('hors ligne sans cache');
        });
      }
      network.catch(() => { /* hors ligne : le cache a déjà répondu */ });
      return cached || network;
    })
  );
});
