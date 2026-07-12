import { Component, inject } from '@angular/core';
import { LucideAngularModule, CheckCircle, X, ArrowRight } from 'lucide-angular';
import { AuthService } from '../core/auth.service';
import { InViewDirective } from '../core/in-view.directive';

interface Feature { name: string; free: boolean; account: boolean | string; }

@Component({
  selector: 'app-comparison-section',
  imports: [LucideAngularModule, InViewDirective],
  template: `
    <section class="py-20 bg-white">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div appInView class="text-center mb-12">
          <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Votre <span class="text-blue-600">compte gratuit</span>, vos avantages
          </h2>
          <p class="text-lg text-slate-600">
            Créez votre espace en 2 minutes et profitez de tous les services
          </p>
        </div>

        <div appInView class="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-white/5 border-b border-white/10">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-bold text-white">Fonctionnalité</th>
                  <th class="px-6 py-4 text-center text-sm font-bold text-blue-300">Gratuit</th>
                  <th class="px-6 py-4 text-center text-sm font-bold text-emerald-400">Avec compte</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (feature of features; track feature.name) {
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-4 text-sm font-medium text-slate-900">{{ feature.name }}</td>
                    <td class="px-6 py-4 text-center">
                      @if (feature.free) {
                        <lucide-icon [img]="ic.CheckCircle" class="w-5 h-5 text-emerald-500 mx-auto" />
                      } @else {
                        <lucide-icon [img]="ic.X" class="w-5 h-5 text-slate-300 mx-auto" />
                      }
                    </td>
                    <td class="px-6 py-4">
                      @if (isBoolean(feature.account)) {
                        <div class="flex justify-center">
                          @if (feature.account) {
                            <lucide-icon [img]="ic.CheckCircle" class="w-5 h-5 text-blue-600" />
                          } @else {
                            <lucide-icon [img]="ic.X" class="w-5 h-5 text-slate-300" />
                          }
                        </div>
                      } @else {
                        <p class="text-sm text-center font-medium text-blue-700">{{ feature.account }}</p>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <div appInView class="text-center mt-10">
          <button
            (click)="handleSignup()"
            class="ui-btn ui-btn-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-emerald-500/30 group">
            Créer mon espace gratuit
            <lucide-icon [img]="ic.ArrowRight" class="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  `,
})
export class ComparisonSectionComponent {
  private auth = inject(AuthService);
  protected readonly ic = { CheckCircle, X, ArrowRight };

  protected readonly features: Feature[] = [
    { name: 'Simulateur public', free: true, account: true },
    { name: 'Sauvegarde de simulations', free: false, account: true },
    { name: 'Comparaisons avancées', free: false, account: 'Illimité' },
    { name: 'Accès communauté', free: false, account: true },
    { name: 'Bons plans partenaires', free: false, account: true },
    { name: 'Alertes missions', free: false, account: true },
    { name: 'Accompagnement', free: false, account: 'Tarifs négociés' },
  ];

  isBoolean(v: boolean | string): v is boolean {
    return typeof v === 'boolean';
  }

  handleSignup(): void {
    this.auth.redirectToLogin('/Onboarding');
  }
}
