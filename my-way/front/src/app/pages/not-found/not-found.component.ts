import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div class="max-w-md w-full">
        <div class="text-center space-y-6">
          <div class="space-y-2">
            <h1 class="text-7xl font-light text-slate-300">404</h1>
            <div class="h-0.5 w-16 bg-slate-200 mx-auto"></div>
          </div>

          <div class="space-y-3">
            <h2 class="text-2xl font-medium text-slate-800">Page introuvable</h2>
            <p class="text-slate-600 leading-relaxed">
              La page que vous cherchez n'existe pas ou a été déplacée.
            </p>
          </div>

          <div class="pt-6">
            <a
              routerLink="/"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors duration-200">
              Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NotFoundComponent {}
