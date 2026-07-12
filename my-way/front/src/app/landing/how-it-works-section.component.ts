import { Component } from '@angular/core';
import { LucideAngularModule, UserPlus, Settings, Zap } from 'lucide-angular';
import { InViewDirective } from '../core/in-view.directive';

@Component({
  selector: 'app-how-it-works-section',
  imports: [LucideAngularModule, InViewDirective],
  template: `
    <section class="py-20 bg-slate-50">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div appInView class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Comment ça marche ?
          </h2>
          <p class="text-lg text-slate-600">
            3 étapes simples pour accéder à tous les services
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
          @for (step of steps; track step.number; let i = $index; let last = $last) {
            <div appInView class="relative text-center">
              <div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl mb-6 shadow-lg relative z-10 border border-slate-200">
                <lucide-icon [img]="step.icon" class="w-9 h-9 text-blue-600" />
                <div class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {{ step.number }}
                </div>
              </div>
              <h3 class="text-xl font-bold text-slate-900 mb-3">{{ step.title }}</h3>
              <p class="text-slate-600 leading-relaxed">{{ step.description }}</p>
            </div>
            @if (!last) {
              <div
                class="hidden md:block absolute top-10 h-0.5 bg-gradient-to-r from-white/20 via-emerald-400/50 to-white/20"
                [style.left.%]="(i + 0.5) * 33.33"
                [style.width.%]="16.66"></div>
            }
          }
        </div>
      </div>
    </section>
  `,
})
export class HowItWorksSectionComponent {
  protected readonly steps = [
    {
      number: 1,
      icon: UserPlus,
      title: 'Créez votre compte',
      description: 'Inscription gratuite en 2 minutes. Complétez votre profil et vos préférences.',
    },
    {
      number: 2,
      icon: Settings,
      title: 'Personnalisez votre espace',
      description: 'Paramétrez vos simulations, alertes missions et préférences de partenaires.',
    },
    {
      number: 3,
      icon: Zap,
      title: 'Profitez des services',
      description: 'Accédez à tous les outils : simulateurs, communauté, missions, bons plans.',
    },
  ];
}
