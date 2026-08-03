// Enregistrement du service worker (PWA) : silencieux et sans blocage.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // PWA indisponible (vieux navigateur, mode privé…) : le site marche sans
    });
  });
}
