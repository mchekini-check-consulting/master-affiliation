import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { NAV_ITEMS } from './core/navigation';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'connexion',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/back-office-layout.component').then((m) => m.BackOfficeLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      // Une page « Bientôt disponible » par rubrique (hors tableau de bord),
      // générée depuis la source unique NAV.
      ...NAV_ITEMS.filter((item) => item.path !== '').map((item) => ({
        path: item.path,
        data: { titre: item.libelle, description: item.description },
        loadComponent: () =>
          import('./shared/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
      })),
    ],
  },
  { path: '**', redirectTo: '' },
];
