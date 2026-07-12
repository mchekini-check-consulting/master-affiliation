import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Calculator, Trash2, Eye, Plus, Calendar } from 'lucide-angular';
import { DashboardLayoutComponent } from '../dashboard/dashboard-layout.component';
import { SimulationService } from '../../core/simulation.service';
import { Simulation } from '../../core/models';

@Component({
  selector: 'app-my-simulations',
  imports: [RouterLink, LucideAngularModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout>
      <div class="p-6 lg:p-8">
        <div class="anim-fade-up mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-slate-900 mb-2">Mes Simulations</h1>
              <p class="text-slate-500">Retrouvez toutes vos simulations sauvegardées</p>
            </div>
            <a routerLink="/Simulator">
              <button class="ui-btn bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white">
                <lucide-icon [img]="ic.Plus" class="w-4 h-4 mr-2" />
                Nouvelle simulation
              </button>
            </a>
          </div>
        </div>

        @if (loading) {
          <div class="flex items-center justify-center py-20">
            <div class="w-8 h-8 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        } @else if (simulations.length === 0) {
          <div class="anim-scale-in text-center py-20">
            <lucide-icon [img]="ic.Calculator" class="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 class="text-xl font-semibold text-slate-900 mb-2">Aucune simulation</h3>
            <p class="text-slate-500 mb-6">Commencez par créer votre première simulation</p>
            <a routerLink="/Simulator">
              <button class="ui-btn bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white">
                <lucide-icon [img]="ic.Plus" class="w-4 h-4 mr-2" />
                Créer une simulation
              </button>
            </a>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (sim of simulations; track sim.id) {
              <div class="anim-fade-up">
                <div class="ui-card hover:shadow-lg transition-shadow">
                  <div class="ui-card-header pb-3">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <span class="ui-card-title !text-lg font-semibold">
                          {{ sim.name || ('Simulation du ' + shortDate(sim.created_date)) }}
                        </span>
                        <div class="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          <lucide-icon [img]="ic.Calendar" class="w-3 h-3" />
                          {{ longDate(sim.created_date) }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="ui-card-content space-y-3">
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span class="text-slate-500">TJM</span>
                        <span class="font-semibold text-slate-900">{{ sim.tjm }}€/j</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-500">Jours/mois</span>
                        <span class="font-semibold text-slate-900">{{ sim.days_per_month }}j</span>
                      </div>
                      @if ((sim.monthly_expenses ?? 0) > 0) {
                        <div class="flex justify-between">
                          <span class="text-slate-500">Frais mensuels</span>
                          <span class="font-semibold text-slate-900">{{ sim.monthly_expenses }}€</span>
                        </div>
                      }
                    </div>

                    @if (sim.statuses_compared?.length) {
                      <div class="flex flex-wrap gap-1.5">
                        @for (status of sim.statuses_compared; track status) {
                          <span class="ui-badge ui-badge-secondary text-xs">{{ status }}</span>
                        }
                      </div>
                    }

                    <div class="flex gap-2 pt-2 border-t border-slate-100">
                      <button class="ui-btn ui-btn-sm ui-btn-outline flex-1" disabled>
                        <lucide-icon [img]="ic.Eye" class="w-3.5 h-3.5 mr-1.5" />
                        Voir
                      </button>
                      <button
                        (click)="handleDelete(sim.id!)"
                        class="ui-btn ui-btn-sm ui-btn-outline text-red-600 hover:text-red-700 hover:bg-red-50">
                        <lucide-icon [img]="ic.Trash2" class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </app-dashboard-layout>
  `,
})
export class MySimulationsComponent implements OnInit {
  private simulationService = inject(SimulationService);
  protected readonly ic = { Calculator, Trash2, Eye, Plus, Calendar };

  simulations: Simulation[] = [];
  loading = true;

  ngOnInit(): void {
    this.load();
  }

  private async load(): Promise<void> {
    try {
      this.simulations = await this.simulationService.list();
    } finally {
      this.loading = false;
    }
  }

  async handleDelete(id: number): Promise<void> {
    if (confirm('Voulez-vous vraiment supprimer cette simulation ?')) {
      await this.simulationService.delete(id);
      this.load();
    }
  }

  shortDate(date?: string): string {
    return date ? new Date(date).toLocaleDateString('fr-FR') : '';
  }

  longDate(date?: string): string {
    return date
      ? new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      : '';
  }
}
