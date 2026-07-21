import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Stratégie de rendu par route (outputMode: static) :
 * - pages publiques (landing, connexion) prérendues en HTML statique (SEO) ;
 * - back-office derrière authentification rendu côté client (CSR), servi via
 *   le fallback index.csr.html par le nginx du conteneur.
 */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'connexion', renderMode: RenderMode.Prerender },
  { path: 'app', renderMode: RenderMode.Client },
  { path: 'app/**', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender },
];
