import { Component } from '@angular/core';
import { LucideAngularModule, Briefcase, MapPin, Clock, Euro, Bell, Filter, Bookmark } from 'lucide-angular';
import { DashboardLayoutComponent } from '../dashboard/dashboard-layout.component';

@Component({
  selector: 'app-missions',
  imports: [LucideAngularModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout>
      <div class="p-6 lg:p-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-slate-900 mb-2">Missions</h1>
          <p class="text-slate-600">Découvrez les dernières opportunités</p>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap items-center gap-3 mb-6">
          <button class="ui-btn bg-blue-600 hover:bg-blue-700 text-white">
            <lucide-icon [img]="ic.Bell" class="w-4 h-4 mr-2" />
            Créer une alerte
          </button>
          <button class="ui-btn ui-btn-outline">
            <lucide-icon [img]="ic.Filter" class="w-4 h-4 mr-2" />
            Filtres avancés
          </button>
          <div class="ml-auto flex gap-2">
            <button class="ui-btn ui-btn-sm" [class]="filter === 'all' ? '' : 'ui-btn-outline'" (click)="filter = 'all'">
              Toutes
            </button>
            <button class="ui-btn ui-btn-sm" [class]="filter === 'remote' ? '' : 'ui-btn-outline'" (click)="filter = 'remote'">
              Full remote
            </button>
            <button class="ui-btn ui-btn-sm" [class]="filter === 'featured' ? '' : 'ui-btn-outline'" (click)="filter = 'featured'">
              Exclusives
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="ui-card"><div class="ui-card-content pt-6">
            <p class="text-3xl font-bold text-slate-900">{{ missions.length }}</p>
            <p class="text-sm text-slate-600 mt-1">Missions disponibles</p>
          </div></div>
          <div class="ui-card"><div class="ui-card-content pt-6">
            <p class="text-3xl font-bold text-blue-600">34</p>
            <p class="text-sm text-slate-600 mt-1">Ajoutées cette semaine</p>
          </div></div>
          <div class="ui-card"><div class="ui-card-content pt-6">
            <p class="text-3xl font-bold text-emerald-600">5</p>
            <p class="text-sm text-slate-600 mt-1">Alertes actives</p>
          </div></div>
          <div class="ui-card"><div class="ui-card-content pt-6">
            <p class="text-3xl font-bold text-orange-600">12</p>
            <p class="text-sm text-slate-600 mt-1">Missions sauvegardées</p>
          </div></div>
        </div>

        <!-- Liste des missions -->
        <div class="space-y-4">
          @for (mission of filteredMissions; track mission.id) {
            <div class="anim-fade-up">
              <div class="ui-card hover:shadow-lg transition-all" [class]="mission.featured ? 'border-l-4 border-l-blue-600' : ''">
                <div class="p-6">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                      <div class="flex items-start gap-3 mb-3">
                        <div class="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <lucide-icon [img]="ic.Briefcase" class="w-6 h-6 text-slate-600" />
                        </div>
                        <div class="flex-1">
                          <div class="flex items-start gap-3 mb-2">
                            <h3 class="text-xl font-bold text-slate-900">{{ mission.title }}</h3>
                            @if (mission.featured) {
                              <span class="ui-badge bg-blue-100 text-blue-700">Exclusive</span>
                            }
                            @if (mission.remote) {
                              <span class="ui-badge ui-badge-outline">🌍 Remote</span>
                            }
                          </div>
                          <p class="text-slate-600 font-medium mb-3">{{ mission.company }}</p>

                          <div class="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
                            <div class="flex items-center gap-1">
                              <lucide-icon [img]="ic.MapPin" class="w-4 h-4" />
                              <span>{{ mission.location }}</span>
                            </div>
                            <div class="flex items-center gap-1">
                              <lucide-icon [img]="ic.Euro" class="w-4 h-4" />
                              <span class="font-semibold text-slate-900">{{ mission.tjm }}€/jour</span>
                            </div>
                            <div class="flex items-center gap-1">
                              <lucide-icon [img]="ic.Clock" class="w-4 h-4" />
                              <span>{{ mission.duration }}</span>
                            </div>
                            <div class="flex items-center gap-1">
                              <span class="text-slate-400">•</span>
                              <span>Démarrage: {{ mission.startDate }}</span>
                            </div>
                          </div>

                          <div class="flex flex-wrap gap-2">
                            @for (tag of mission.tags; track tag) {
                              <span class="ui-badge ui-badge-outline text-xs">{{ tag }}</span>
                            }
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="flex flex-col gap-2 flex-shrink-0">
                      <button class="ui-btn ui-btn-sm bg-blue-600 hover:bg-blue-700 text-white">
                        Postuler
                      </button>
                      <button class="ui-btn ui-btn-sm ui-btn-outline">
                        <lucide-icon [img]="ic.Bookmark" class="w-4 h-4" />
                      </button>
                      <span class="text-xs text-slate-400 text-center">{{ mission.postedAt }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </app-dashboard-layout>
  `,
})
export class MissionsComponent {
  protected readonly ic = { Briefcase, MapPin, Clock, Euro, Bell, Filter, Bookmark };
  filter: 'all' | 'remote' | 'featured' = 'all';

  protected readonly missions = [
    {
      id: 1,
      title: 'Développeur Full Stack React/Node.js',
      company: 'Fintech Paris',
      location: 'Paris (Télétravail partiel)',
      tjm: '550-650', duration: '6 mois renouvelable', startDate: 'ASAP',
      tags: ['React', 'Node.js', 'TypeScript', 'AWS'],
      remote: true, featured: true, postedAt: 'Il y a 2h',
    },
    {
      id: 2,
      title: 'DevOps Senior - Infrastructure Cloud',
      company: 'Scale-up Lyon',
      location: 'Lyon (Full remote)',
      tjm: '600-700', duration: '12 mois', startDate: '1er mars',
      tags: ['Kubernetes', 'Docker', 'Terraform', 'GCP'],
      remote: true, featured: true, postedAt: 'Il y a 5h',
    },
    {
      id: 3,
      title: 'Lead Developer Mobile Flutter',
      company: 'Retail Tech',
      location: 'Bordeaux',
      tjm: '500-600', duration: '9 mois', startDate: '15 mars',
      tags: ['Flutter', 'Firebase', 'iOS', 'Android'],
      remote: false, featured: false, postedAt: 'Il y a 1j',
    },
    {
      id: 4,
      title: 'Data Engineer - Big Data',
      company: 'Grand Groupe',
      location: 'La Défense',
      tjm: '650-750', duration: '12 mois', startDate: 'ASAP',
      tags: ['Python', 'Spark', 'Kafka', 'Databricks'],
      remote: true, featured: false, postedAt: 'Il y a 2j',
    },
    {
      id: 5,
      title: 'Tech Lead Backend Java/Spring',
      company: 'ESN Paris',
      location: 'Paris (2j/semaine sur site)',
      tjm: '600-700', duration: '18 mois', startDate: '1er avril',
      tags: ['Java', 'Spring Boot', 'Microservices', 'Kafka'],
      remote: true, featured: false, postedAt: 'Il y a 3j',
    },
    {
      id: 6,
      title: 'Architecte Solutions Cloud',
      company: 'Consulting IT',
      location: 'Full remote',
      tjm: '700-850', duration: '6 mois', startDate: 'Flexible',
      tags: ['Azure', 'Architecture', 'Cloud', 'DevOps'],
      remote: true, featured: false, postedAt: 'Il y a 4j',
    },
  ];

  get filteredMissions() {
    if (this.filter === 'remote') return this.missions.filter(m => m.remote);
    if (this.filter === 'featured') return this.missions.filter(m => m.featured);
    return this.missions;
  }
}
