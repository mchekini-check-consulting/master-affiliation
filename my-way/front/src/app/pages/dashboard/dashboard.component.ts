import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Calculator, TrendingUp, Clock, Award, ArrowRight, Sparkles } from 'lucide-angular';
import { DashboardLayoutComponent } from './dashboard-layout.component';
import { AuthService } from '../../core/auth.service';
import { SimulationService } from '../../core/simulation.service';
import { Simulation, SimResult, User } from '../../core/models';
import { simulateAE, simulateSASU, getBestStatus } from '../../core/simulator-config';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, LucideAngularModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout>
      @if (user) {
        <div class="p-6 lg:p-8">
          <!-- Welcome Header -->
          <div class="anim-fade-up mb-8">
            <h1 class="text-3xl font-bold text-slate-900 mb-2">
              Bonjour {{ firstName }} 👋
            </h1>
            <p class="text-slate-500">Voici un aperçu de votre espace freelance-now</p>
          </div>

          <!-- Quick Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="anim-fade-up" style="animation-delay: 0.1s">
              <div class="ui-card bg-gradient-to-br from-blue-700 via-blue-600 to-emerald-600 text-white border-0 shadow-lg">
                <div class="ui-card-header pb-3">
                  <div class="flex items-center gap-2 text-blue-100">
                    <lucide-icon [img]="ic.Calculator" class="w-5 h-5" />
                    <span class="text-base font-medium">Estimation actuelle</span>
                  </div>
                </div>
                <div class="ui-card-content">
                  @if (quickSim) {
                    <p class="text-sm text-blue-100 mb-1">{{ quickSim.statut }}</p>
                    <p class="text-3xl font-bold">
                      {{ round(quickSim.net_mensuel).toLocaleString('fr-FR') }}€
                    </p>
                    <p class="text-sm text-blue-100 mt-1">par mois net</p>
                  } @else {
                    <p class="text-sm">Chargement...</p>
                  }
                </div>
              </div>
            </div>

            <div class="anim-fade-up" style="animation-delay: 0.15s">
              <div class="ui-card">
                <div class="ui-card-header pb-3">
                  <div class="flex items-center gap-2 text-emerald-600">
                    <lucide-icon [img]="ic.TrendingUp" class="w-5 h-5" />
                    <span class="text-base font-medium text-slate-900">Votre TJM</span>
                  </div>
                </div>
                <div class="ui-card-content">
                  <p class="text-3xl font-bold text-slate-900">{{ user.desired_tjm || 500 }}€</p>
                  <p class="text-sm text-slate-500 mt-1">Taux journalier moyen</p>
                </div>
              </div>
            </div>

            <div class="anim-fade-up" style="animation-delay: 0.2s">
              <div class="ui-card">
                <div class="ui-card-header pb-3">
                  <div class="flex items-center gap-2 text-amber-600">
                    <lucide-icon [img]="ic.Clock" class="w-5 h-5" />
                    <span class="text-base font-medium text-slate-900">Activité</span>
                  </div>
                </div>
                <div class="ui-card-content">
                  <p class="text-3xl font-bold text-slate-900">{{ user.days_per_month || 18 }}j</p>
                  <p class="text-sm text-slate-500 mt-1">par mois en moyenne</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions & Recent Sims -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="anim-fade-up" style="animation-delay: 0.25s">
              <div class="ui-card">
                <div class="ui-card-header">
                  <span class="ui-card-title !text-base flex items-center gap-2 font-semibold">
                    <lucide-icon [img]="ic.Sparkles" class="w-5 h-5 text-blue-600" />
                    Actions rapides
                  </span>
                </div>
                <div class="ui-card-content space-y-3">
                  <a routerLink="/AdvancedSimulator" class="block">
                    <button class="ui-btn w-full justify-between bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white group">
                      <span class="flex items-center gap-2">
                        <lucide-icon [img]="ic.Calculator" class="w-4 h-4" />
                        Lancer une simulation
                      </span>
                      <lucide-icon [img]="ic.ArrowRight" class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </a>
                  <button class="ui-btn ui-btn-outline w-full justify-between" disabled>
                    <span class="flex items-center gap-2 text-slate-400">
                      <lucide-icon [img]="ic.Award" class="w-4 h-4" />
                      Découvrir nos partenaires
                    </span>
                    <span class="text-xs bg-slate-100 px-2 py-0.5 rounded-full">Bientôt</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="anim-fade-up" style="animation-delay: 0.3s">
              <div class="ui-card">
                <div class="ui-card-header">
                  <div class="flex items-center justify-between">
                    <span class="ui-card-title !text-base flex items-center gap-2 font-semibold">
                      <lucide-icon [img]="ic.Clock" class="w-5 h-5 text-slate-600" />
                      Simulations récentes
                    </span>
                    @if (recentSims.length > 0) {
                      <a routerLink="/MySimulations">
                        <button class="ui-btn ui-btn-sm ui-btn-ghost text-blue-600">Tout voir</button>
                      </a>
                    }
                  </div>
                </div>
                <div class="ui-card-content">
                  @if (recentSims.length > 0) {
                    <div class="space-y-3">
                      @for (sim of recentSims; track sim.id) {
                        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p class="font-medium text-sm text-slate-900">
                              {{ sim.name || ('Simulation du ' + formatDate(sim.created_date)) }}
                            </p>
                            <p class="text-xs text-slate-500">
                              TJM: {{ sim.tjm }}€ • {{ sim.days_per_month }}j/mois
                            </p>
                          </div>
                        </div>
                      }
                    </div>
                  } @else {
                    <div class="text-center py-8 text-slate-500">
                      <lucide-icon [img]="ic.Calculator" class="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p class="text-sm">Aucune simulation sauvegardée</p>
                      <p class="text-xs mt-1">Lancez votre première simulation</p>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Profile Info -->
          <div class="anim-fade-up mt-6" style="animation-delay: 0.35s">
            <div class="ui-card">
              <div class="ui-card-header">
                <span class="ui-card-title !text-base font-semibold">Votre profil</span>
              </div>
              <div class="ui-card-content">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  @if (user.city) {
                    <div>
                      <p class="text-sm text-slate-500">Ville</p>
                      <p class="font-medium text-slate-900">{{ user.city }}</p>
                    </div>
                  }
                  @if (user.specialties?.length) {
                    <div>
                      <p class="text-sm text-slate-500">Spécialités</p>
                      <p class="font-medium text-slate-900">{{ user.specialties!.join(', ') }}</p>
                    </div>
                  }
                  <div>
                    <p class="text-sm text-slate-500">Statut actuel</p>
                    <p class="font-medium text-slate-900">{{ statusLabel }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-slate-500">Parts fiscales</p>
                    <p class="font-medium text-slate-900">{{ user.family_shares || 1 }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </app-dashboard-layout>
  `,
})
export class DashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private simulations = inject(SimulationService);
  protected readonly ic = { Calculator, TrendingUp, Clock, Award, ArrowRight, Sparkles };

  user: User | null = null;
  quickSim: SimResult | null = null;
  recentSims: Simulation[] = [];

  ngOnInit(): void {
    this.auth.me().then((u) => {
      this.user = u;
      const tjm = u.desired_tjm || 500;
      const days = u.days_per_month || 18;
      const ae = simulateAE(tjm, days);
      const sasu = simulateSASU(tjm, days);
      this.quickSim = getBestStatus([ae, sasu].filter(r => r.eligible));
    }).catch(() => { /* géré par le layout */ });

    this.simulations.list(3).then(sims => this.recentSims = sims).catch(() => {});
  }

  get firstName(): string {
    return this.user?.full_name?.split(' ')[0] ?? '';
  }

  get statusLabel(): string {
    switch (this.user?.current_status) {
      case 'salarie': return 'Salarié';
      case 'independant': return 'Indépendant';
      case 'portage': return 'Portage';
      case 'demandeur_emploi': return "Demandeur d'emploi";
      default: return 'Autre';
    }
  }

  round(v?: number): number { return Math.round(v ?? 0); }

  formatDate(date?: string): string {
    return date ? new Date(date).toLocaleDateString('fr-FR') : '';
  }
}
