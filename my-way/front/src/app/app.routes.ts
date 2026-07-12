import { Routes } from '@angular/router';

// Mêmes URLs que l'application d'origine (pages.config.js, mainPage: Simulator)
export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/simulator/simulator.component').then(m => m.SimulatorComponent) },
  { path: 'Simulator', loadComponent: () => import('./pages/simulator/simulator.component').then(m => m.SimulatorComponent) },
  { path: 'Home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'Contact', loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent) },
  { path: 'Login', loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent) },
  { path: 'Register', loadComponent: () => import('./pages/auth/register.component').then(m => m.RegisterComponent) },
  { path: 'Onboarding', loadComponent: () => import('./pages/onboarding/onboarding.component').then(m => m.OnboardingComponent) },
  { path: 'Dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'MySimulations', loadComponent: () => import('./pages/my-simulations/my-simulations.component').then(m => m.MySimulationsComponent) },
  { path: 'AdvancedSimulator', loadComponent: () => import('./pages/advanced-simulator/advanced-simulator.component').then(m => m.AdvancedSimulatorComponent) },
  { path: 'Community', loadComponent: () => import('./pages/community/community.component').then(m => m.CommunityComponent) },
  { path: 'Deals', loadComponent: () => import('./pages/deals/deals.component').then(m => m.DealsComponent) },
  { path: 'Missions', loadComponent: () => import('./pages/missions/missions.component').then(m => m.MissionsComponent) },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
