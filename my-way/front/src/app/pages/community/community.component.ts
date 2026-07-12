import { Component } from '@angular/core';
import { LucideAngularModule, Users, MessageCircle, ThumbsUp, TrendingUp, Clock, Eye } from 'lucide-angular';
import { DashboardLayoutComponent } from '../dashboard/dashboard-layout.component';

@Component({
  selector: 'app-community',
  imports: [LucideAngularModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout>
      <div class="p-6 lg:p-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-slate-900 mb-2">Communauté</h1>
          <p class="text-slate-600">Échangez avec des milliers de freelances IT</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Sidebar -->
          <div class="space-y-6">
            <div class="ui-card">
              <div class="ui-card-header">
                <span class="ui-card-title !text-base font-semibold">Catégories</span>
              </div>
              <div class="ui-card-content space-y-2">
                @for (cat of categories; track cat.name) {
                  <button
                    (click)="selectedCategory = cat.name"
                    class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                    [class]="selectedCategory === cat.name
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'">
                    <div class="flex items-center justify-between">
                      <span>{{ cat.name }}</span>
                      <span class="text-xs text-slate-400">{{ cat.count }}</span>
                    </div>
                  </button>
                }
              </div>
            </div>

            <div class="ui-card">
              <div class="ui-card-header">
                <span class="ui-card-title !text-base font-semibold flex items-center gap-2">
                  <lucide-icon [img]="ic.Users" class="w-4 h-4" />
                  Stats communauté
                </span>
              </div>
              <div class="ui-card-content space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-600">Membres actifs</span>
                  <span class="font-semibold">2,847</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Discussions</span>
                  <span class="font-semibold">1,234</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Réponses</span>
                  <span class="font-semibold">8,921</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Main content -->
          <div class="lg:col-span-3 space-y-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <button class="ui-btn bg-blue-600 hover:bg-blue-700 text-white">
                  <lucide-icon [img]="ic.MessageCircle" class="w-4 h-4 mr-2" />
                  Nouvelle discussion
                </button>
              </div>
              <select class="px-4 py-2 rounded-lg border border-slate-200 text-sm">
                <option>Plus récentes</option>
                <option>Plus populaires</option>
                <option>Plus actives</option>
              </select>
            </div>

            <div class="space-y-4">
              @for (topic of topics; track topic.id) {
                <div class="anim-fade-up">
                  <div class="ui-card hover:shadow-lg transition-shadow cursor-pointer">
                    <div class="p-6">
                      <div class="flex gap-4">
                        <div class="flex-shrink-0">
                          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                            {{ topic.author.charAt(0) }}
                          </div>
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-start justify-between gap-4 mb-2">
                            <div class="flex items-center gap-3 flex-wrap">
                              <h3 class="text-lg font-semibold text-slate-900 hover:text-blue-600">
                                {{ topic.title }}
                              </h3>
                              @if (topic.trending) {
                                <span class="ui-badge bg-orange-100 text-orange-700 text-xs">
                                  <lucide-icon [img]="ic.TrendingUp" class="w-3 h-3 mr-1" />
                                  Tendance
                                </span>
                              }
                            </div>
                          </div>
                          <p class="text-sm text-slate-600 mb-3 line-clamp-2">{{ topic.excerpt }}</p>
                          <div class="flex items-center gap-4 text-sm text-slate-500">
                            <span class="font-medium text-slate-700">{{ topic.author }}</span>
                            <span class="ui-badge ui-badge-outline text-xs">{{ topic.category }}</span>
                            <div class="flex items-center gap-1">
                              <lucide-icon [img]="ic.MessageCircle" class="w-4 h-4" />
                              <span>{{ topic.replies }}</span>
                            </div>
                            <div class="flex items-center gap-1">
                              <lucide-icon [img]="ic.Eye" class="w-4 h-4" />
                              <span>{{ topic.views }}</span>
                            </div>
                            <div class="flex items-center gap-1">
                              <lucide-icon [img]="ic.ThumbsUp" class="w-4 h-4" />
                              <span>{{ topic.likes }}</span>
                            </div>
                            <div class="flex items-center gap-1 ml-auto">
                              <lucide-icon [img]="ic.Clock" class="w-4 h-4" />
                              <span>{{ topic.timeAgo }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `,
})
export class CommunityComponent {
  protected readonly ic = { Users, MessageCircle, ThumbsUp, TrendingUp, Clock, Eye };
  selectedCategory = 'Tous';

  protected readonly categories = [
    { name: 'Tous', count: 156 },
    { name: 'Statuts', count: 42 },
    { name: 'Rémunération', count: 38 },
    { name: 'Fiscalité', count: 29 },
    { name: 'Vie de freelance', count: 24 },
    { name: 'Protection sociale', count: 14 },
    { name: 'Administratif', count: 9 },
  ];

  protected readonly topics = [
    {
      id: 1,
      title: "Passage SASU → Portage : retour d'expérience",
      author: 'Marie L.',
      category: 'Statuts',
      replies: 24, views: 342, likes: 18,
      timeAgo: 'Il y a 2h',
      excerpt: 'Après 3 ans en SASU, je suis passée en portage. Voici mon retour complet sur les avantages et inconvénients...',
      trending: true,
    },
    {
      id: 2,
      title: 'Quel TJM pour un Dev React senior en région parisienne ?',
      author: 'Thomas K.',
      category: 'Rémunération',
      replies: 45, views: 892, likes: 31,
      timeAgo: 'Il y a 5h',
      excerpt: 'Je discute avec plusieurs clients pour une mission longue durée. Quel TJM puis-je demander ?',
      trending: true,
    },
    {
      id: 3,
      title: 'Comment optimiser sa CFE ?',
      author: 'Paul D.',
      category: 'Fiscalité',
      replies: 12, views: 234, likes: 9,
      timeAgo: 'Il y a 1j',
      excerpt: 'Des astuces pour réduire légalement sa Cotisation Foncière des Entreprises ?',
      trending: false,
    },
    {
      id: 4,
      title: 'Freelance et crédit immobilier : votre expérience ?',
      author: 'Sophie M.',
      category: 'Vie de freelance',
      replies: 38, views: 567, likes: 22,
      timeAgo: 'Il y a 2j',
      excerpt: 'Je cherche à acheter un bien. Comment avez-vous réussi à convaincre les banques ?',
      trending: false,
    },
    {
      id: 5,
      title: 'Mutuelle freelance : comparatif 2026',
      author: 'Julien R.',
      category: 'Protection sociale',
      replies: 19, views: 445, likes: 15,
      timeAgo: 'Il y a 3j',
      excerpt: "J'ai comparé 8 mutuelles pour freelances IT. Voici mes conclusions...",
      trending: false,
    },
    {
      id: 6,
      title: 'Facturation inter-européenne : TVA et obligations',
      author: 'Clara B.',
      category: 'Administratif',
      replies: 8, views: 178, likes: 6,
      timeAgo: 'Il y a 4j',
      excerpt: 'Client en Allemagne, moi en France. Comment gérer la TVA ?',
      trending: false,
    },
  ];
}
