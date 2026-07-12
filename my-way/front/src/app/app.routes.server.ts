import { RenderMode, ServerRoute } from '@angular/ssr';

// Pages publiques : prérendues en HTML statique au build (SEO).
// Espace connecté : rendu côté client (derrière login, pas de SEO).
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'Simulator', renderMode: RenderMode.Prerender },
  { path: 'Home', renderMode: RenderMode.Prerender },
  { path: 'Contact', renderMode: RenderMode.Prerender },
  { path: 'Login', renderMode: RenderMode.Prerender },
  { path: 'Register', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];
