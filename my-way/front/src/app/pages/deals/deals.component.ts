import { Component, inject } from '@angular/core';
import { LucideAngularModule, Tag, ExternalLink, Copy, Sparkles } from 'lucide-angular';
import { DashboardLayoutComponent } from '../dashboard/dashboard-layout.component';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-deals',
  imports: [LucideAngularModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout>
      <div class="p-6 lg:p-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-slate-900 mb-2">Bons Plans</h1>
          <p class="text-slate-600">Réductions exclusives négociées pour vous</p>
        </div>

        <!-- Catégories -->
        <div class="mb-6 flex flex-wrap gap-2">
          @for (cat of categories; track cat) {
            <button
              class="ui-btn ui-btn-sm"
              [class]="selectedCategory === cat ? 'bg-blue-600 text-white hover:bg-blue-700' : 'ui-btn-outline'"
              (click)="selectedCategory = cat">
              {{ cat }}
            </button>
          }
        </div>

        <!-- Stats rapides -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="ui-card">
            <div class="ui-card-content pt-6">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <lucide-icon [img]="ic.Tag" class="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-slate-900">{{ deals.length }}</p>
                  <p class="text-sm text-slate-600">Offres disponibles</p>
                </div>
              </div>
            </div>
          </div>
          <div class="ui-card">
            <div class="ui-card-content pt-6">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <lucide-icon [img]="ic.Sparkles" class="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-slate-900">~8,500€</p>
                  <p class="text-sm text-slate-600">Économies possibles/an</p>
                </div>
              </div>
            </div>
          </div>
          <div class="ui-card">
            <div class="ui-card-content pt-6">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                  <span class="text-2xl">🔥</span>
                </div>
                <div>
                  <p class="text-2xl font-bold text-slate-900">3</p>
                  <p class="text-sm text-slate-600">Offres du moment</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Liste des deals -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (deal of filteredDeals; track deal.id) {
            <div class="anim-fade-up">
              <div class="ui-card overflow-hidden hover:shadow-lg transition-all" [class]="deal.featured ? 'border-2 border-blue-200' : ''">
                @if (deal.featured) {
                  <div class="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-center py-1 text-xs font-semibold">
                    ⭐ OFFRE EXCLUSIVE
                  </div>
                }
                <div class="ui-card-header">
                  <div class="flex items-start justify-between mb-3">
                    <div class="text-4xl">{{ deal.logo }}</div>
                    <span class="ui-badge bg-emerald-100 text-emerald-700">{{ deal.discount }}</span>
                  </div>
                  <span class="ui-card-title !text-lg font-semibold">{{ deal.title }}</span>
                  <p class="text-sm text-slate-600">{{ deal.description }}</p>
                </div>
                <div class="ui-card-content space-y-3">
                  <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p class="text-xs text-slate-500 mb-1">Code promo</p>
                      <p class="font-mono font-bold text-slate-900">{{ deal.code }}</p>
                    </div>
                    <button class="ui-btn ui-btn-sm ui-btn-outline ml-2" (click)="copyCode(deal.code)">
                      <lucide-icon [img]="ic.Copy" class="w-4 h-4" />
                    </button>
                  </div>
                  <div class="flex items-center justify-between text-xs text-slate-500">
                    <span>Valide jusqu'au {{ deal.validUntil }}</span>
                    <span class="ui-badge ui-badge-outline">{{ deal.category }}</span>
                  </div>
                  <button class="ui-btn ui-btn-outline w-full">
                    <lucide-icon [img]="ic.ExternalLink" class="w-4 h-4 mr-2" />
                    Voir l'offre
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </app-dashboard-layout>
  `,
})
export class DealsComponent {
  private toast = inject(ToastService);
  protected readonly ic = { Tag, ExternalLink, Copy, Sparkles };

  selectedCategory = 'Tous';
  protected readonly categories = ['Tous', 'Développement', 'Banque', 'Cloud', 'Design', 'Productivité', 'Paiement', 'Email'];

  protected readonly deals = [
    {
      id: 1, company: 'GitHub', logo: '🐙',
      title: 'GitHub Team - 50% de réduction',
      description: 'Offre exclusive pour les freelances IndepBoost sur GitHub Team',
      discount: '-50%', code: 'INDEP50', category: 'Développement',
      validUntil: '30 juin 2026', featured: true,
    },
    {
      id: 2, company: 'JetBrains', logo: '⚡',
      title: 'Licence All Products Pack',
      description: 'Accès à tous les IDEs JetBrains pour 1 an',
      discount: '-35%', code: 'JETFREE35', category: 'Développement',
      validUntil: '31 déc 2026', featured: true,
    },
    {
      id: 3, company: 'Qonto', logo: '🏦',
      title: 'Compte pro Qonto - 3 mois offerts',
      description: 'Compte professionnel avec carte Mastercard',
      discount: '3 mois gratuits', code: 'INDEPQONTO', category: 'Banque',
      validUntil: '15 sept 2026', featured: false,
    },
    {
      id: 4, company: 'AWS', logo: '☁️',
      title: 'Crédits AWS - 1000€',
      description: '1000€ de crédits AWS pour vos projets cloud',
      discount: '1000€ offerts', code: 'AWSINDEP1K', category: 'Cloud',
      validUntil: '31 mars 2026', featured: true,
    },
    {
      id: 5, company: 'Figma', logo: '🎨',
      title: 'Figma Professional - 40% off',
      description: 'Abonnement Figma Professional à tarif réduit',
      discount: '-40%', code: 'FIGMA40', category: 'Design',
      validUntil: '30 avril 2026', featured: false,
    },
    {
      id: 6, company: 'Notion', logo: '📝',
      title: 'Notion Plus - 6 mois gratuits',
      description: 'Workspace illimité pour organiser vos projets',
      discount: '6 mois offerts', code: 'NOTIONINDEP', category: 'Productivité',
      validUntil: '31 août 2026', featured: false,
    },
    {
      id: 7, company: 'Stripe', logo: '💳',
      title: 'Stripe - Frais de transaction réduits',
      description: 'Taux préférentiel sur vos paiements en ligne',
      discount: '-0.5%', code: 'Automatique', category: 'Paiement',
      validUntil: 'Permanent', featured: false,
    },
    {
      id: 8, company: 'Mailjet', logo: '✉️',
      title: 'Mailjet - 100k emails/mois',
      description: "Service d'emailing professionnel",
      discount: '100k emails gratuits', code: 'MJINDEP100K', category: 'Email',
      validUntil: '31 mai 2026', featured: false,
    },
  ];

  get filteredDeals() {
    return this.selectedCategory === 'Tous'
      ? this.deals
      : this.deals.filter(d => d.category === this.selectedCategory);
  }

  copyCode(code: string): void {
    navigator.clipboard.writeText(code);
    this.toast.success('Code copié !');
  }
}
