import { Component } from '@angular/core';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';
import { InViewDirective } from '../core/in-view.directive';

@Component({
  selector: 'app-faq-section',
  imports: [LucideAngularModule, InViewDirective],
  template: `
    <section class="py-20 bg-slate-50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div appInView class="text-center mb-12">
          <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Questions fréquentes
          </h2>
          <p class="text-lg text-slate-600">
            Tout ce que vous devez savoir sur IndepBoost
          </p>
        </div>

        <div appInView class="space-y-4">
          @for (faq of faqs; track faq.q; let i = $index) {
            <div
              class="bg-white rounded-xl border-2 px-6 transition-all"
              [class]="open === i ? 'border-blue-300 shadow-lg' : 'border-slate-200'">
              <button
                (click)="open = open === i ? -1 : i"
                class="flex w-full items-center justify-between text-left font-semibold text-slate-900 py-5 hover:text-blue-600 transition-colors">
                {{ faq.q }}
                <lucide-icon
                  [img]="ic.ChevronDown"
                  class="w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200"
                  [class.rotate-180]="open === i" />
              </button>
              @if (open === i) {
                <div class="text-slate-700 pb-5 leading-relaxed text-sm anim-fade-in">
                  {{ faq.a }}
                </div>
              }
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class FaqSectionComponent {
  protected readonly ic = { ChevronDown };
  protected open = -1;

  protected readonly faqs = [
    {
      q: 'IndepBoost est-il vraiment gratuit ?',
      a: "Oui, 100% gratuit. Nous nous rémunérons via des partenariats (experts-comptables, assurances, etc.) et de l'apport d'affaires. Aucun coût caché, jamais.",
    },
    {
      q: 'Le simulateur prend-il en compte toutes les charges ?',
      a: 'Oui, nos simulateurs incluent cotisations sociales, IR, IS, flat-tax, CFP, ACRE, ARE, ARCE. Ils sont mis à jour chaque année avec les derniers barèmes officiels.',
    },
    {
      q: 'Puis-je sauvegarder mes simulations ?',
      a: 'Avec un compte gratuit, oui. Vous pouvez créer, sauvegarder et comparer autant de simulations que vous le souhaitez.',
    },
    {
      q: 'Comment accéder aux bons plans et missions ?',
      a: 'Créez votre compte gratuit en 2 minutes. Vous aurez immédiatement accès aux codes promo négociés et pourrez activer les alertes missions selon vos critères.',
    },
    {
      q: 'Qui peut rejoindre IndepBoost ?',
      a: 'Tous les freelances IT en France : développeurs, data scientists, DevOps, product managers, designers UX/UI, etc. Que vous débutiez ou que vous soyez confirmé.',
    },
  ];
}
