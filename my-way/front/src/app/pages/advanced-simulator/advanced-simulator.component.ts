import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Calculator, Download, Save } from 'lucide-angular';
import { DashboardLayoutComponent } from '../dashboard/dashboard-layout.component';
import { SimulationService } from '../../core/simulation.service';
import { ToastService } from '../../core/toast.service';
import { SliderComponent } from '../../shared/slider.component';
import { SwitchComponent } from '../../shared/switch.component';

interface AdvResult {
  statut: string;
  revenu_annuel: number;
  charges_sociales: number;
  impot_revenu?: number;
  impot_societes?: number;
  dividendes?: number;
  frais_gestion?: number;
  net_annuel: number;
  net_mensuel: number;
  taux_global: number;
}

@Component({
  selector: 'app-advanced-simulator',
  imports: [FormsModule, LucideAngularModule, DashboardLayoutComponent, SliderComponent, SwitchComponent],
  template: `
    <app-dashboard-layout>
      <div class="p-6 lg:p-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-slate-900 mb-2">Simulateur Avancé</h1>
          <p class="text-slate-600">Comparez tous les statuts avec des paramètres détaillés</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Formulaire de paramètres -->
          <div class="lg:col-span-2 space-y-6">
            <div class="ui-card">
              <div class="ui-card-header">
                <span class="ui-card-title !text-base font-semibold flex items-center gap-2">
                  <lucide-icon [img]="ic.Calculator" class="w-5 h-5 text-blue-600" />
                  Paramètres de simulation
                </span>
              </div>
              <div class="ui-card-content space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="ui-label">Taux Journalier Moyen (TJM)</label>
                    <div class="flex items-center gap-4">
                      <app-slider class="flex-1" [min]="200" [max]="1500" [step]="50" [value]="tjm" (valueChange)="tjm = $event" />
                      <input type="number" class="ui-input w-24" [(ngModel)]="tjm" />
                    </div>
                    <p class="text-sm text-slate-500">{{ tjm }}€/jour</p>
                  </div>

                  <div class="space-y-2">
                    <label class="ui-label">Jours travaillés par mois</label>
                    <div class="flex items-center gap-4">
                      <app-slider class="flex-1" [min]="1" [max]="22" [step]="1" [value]="daysPerMonth" (valueChange)="daysPerMonth = $event" />
                      <input type="number" class="ui-input w-24" [(ngModel)]="daysPerMonth" />
                    </div>
                    <p class="text-sm text-slate-500">{{ daysPerMonth }} jours/mois</p>
                  </div>

                  <div class="space-y-2">
                    <label class="ui-label">Frais professionnels mensuels</label>
                    <input type="number" class="ui-input" [(ngModel)]="monthlyExpenses" />
                  </div>

                  <div class="space-y-2">
                    <label class="ui-label">Parts fiscales</label>
                    <select class="ui-input ui-select" [(ngModel)]="familyShares">
                      <option [ngValue]="1">1 part</option>
                      <option [ngValue]="1.5">1.5 parts</option>
                      <option [ngValue]="2">2 parts</option>
                      <option [ngValue]="2.5">2.5 parts</option>
                      <option [ngValue]="3">3 parts</option>
                    </select>
                  </div>

                  <div class="space-y-2">
                    <label class="ui-label">Autres revenus du foyer</label>
                    <input type="number" class="ui-input" [(ngModel)]="householdIncome" />
                  </div>
                </div>

                <div class="border-t pt-6">
                  <span class="ui-label mb-4 block text-base font-semibold">Dispositifs d'aide</span>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <span class="ui-label font-medium">ACRE (Exonération de charges)</span>
                        <p class="text-sm text-slate-500">Réduction de charges sociales la 1ère année</p>
                      </div>
                      <app-switch [checked]="acre" (checkedChange)="acre = $event" />
                    </div>
                    <div class="flex items-center justify-between">
                      <div>
                        <span class="ui-label font-medium">ARCE (Capital Pôle Emploi)</span>
                        <p class="text-sm text-slate-500">45% des droits restants en capital</p>
                      </div>
                      <app-switch [checked]="arce" (checkedChange)="arce = $event" />
                    </div>
                    <div class="flex items-center justify-between">
                      <div>
                        <span class="ui-label font-medium">ARE (Maintien allocations)</span>
                        <p class="text-sm text-slate-500">Cumul activité et allocations chômage</p>
                      </div>
                      <app-switch [checked]="are" (checkedChange)="are = $event" />
                    </div>
                  </div>
                </div>

                <button (click)="calculateResults()" class="ui-btn ui-btn-lg w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <lucide-icon [img]="ic.Calculator" class="w-4 h-4 mr-2" />
                  Calculer les résultats
                </button>
              </div>
            </div>
          </div>

          <!-- Résumé rapide -->
          <div class="space-y-6">
            <div class="ui-card bg-gradient-to-br from-blue-600 to-blue-500 text-white border-0">
              <div class="ui-card-header">
                <span class="ui-card-title !text-base font-semibold text-white">Revenu annuel brut</span>
              </div>
              <div class="ui-card-content">
                <p class="text-4xl font-bold">{{ (tjm * daysPerMonth * 12).toLocaleString('fr-FR') }}€</p>
                <p class="text-sm text-blue-100 mt-2">Chiffre d'affaires annuel</p>
              </div>
            </div>

            <div class="ui-card">
              <div class="ui-card-header">
                <span class="ui-card-title !text-sm font-semibold">Statuts à comparer</span>
              </div>
              <div class="ui-card-content space-y-2">
                @for (status of statuses; track status.id) {
                  <div class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      class="ui-checkbox w-4 h-4"
                      [id]="'st-' + status.id"
                      [checked]="statusesToCompare.includes(status.id)"
                      (change)="toggleStatus(status.id, $event)" />
                    <label class="ui-label text-sm cursor-pointer" [for]="'st-' + status.id">{{ status.label }}</label>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Résultats -->
        @if (results) {
          <div class="anim-fade-up mt-8 space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-bold text-slate-900">Résultats de la comparaison</h2>
              <div class="flex gap-3">
                <button class="ui-btn ui-btn-outline" (click)="saveSimulation()" [disabled]="saving">
                  <lucide-icon [img]="ic.Save" class="w-4 h-4 mr-2" />
                  {{ saving ? 'Sauvegarde...' : 'Sauvegarder' }}
                </button>
                <button class="ui-btn ui-btn-outline">
                  <lucide-icon [img]="ic.Download" class="w-4 h-4 mr-2" />
                  Exporter PDF
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              @for (statusId of statusesToCompare; track statusId) {
                @if (results[statusId]; as result) {
                  <div class="ui-card hover:shadow-lg transition-shadow">
                    <div class="ui-card-header pb-3">
                      <span class="ui-card-title !text-lg font-semibold">{{ result.statut }}</span>
                      <p class="text-3xl font-bold text-blue-600">{{ round(result.net_mensuel).toLocaleString('fr-FR') }}€</p>
                      <p class="text-sm text-slate-500">par mois net</p>
                    </div>
                    <div class="ui-card-content space-y-3 text-sm">
                      <div class="flex justify-between">
                        <span class="text-slate-600">Revenu annuel</span>
                        <span class="font-semibold">{{ round(result.revenu_annuel).toLocaleString('fr-FR') }}€</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-600">Charges sociales</span>
                        <span class="font-semibold text-orange-600">-{{ round(result.charges_sociales).toLocaleString('fr-FR') }}€</span>
                      </div>
                      @if (result.impot_revenu) {
                        <div class="flex justify-between">
                          <span class="text-slate-600">Impôt sur le revenu</span>
                          <span class="font-semibold text-orange-600">-{{ round(result.impot_revenu).toLocaleString('fr-FR') }}€</span>
                        </div>
                      }
                      @if (result.impot_societes) {
                        <div class="flex justify-between">
                          <span class="text-slate-600">Impôt société</span>
                          <span class="font-semibold text-orange-600">-{{ round(result.impot_societes).toLocaleString('fr-FR') }}€</span>
                        </div>
                      }
                      <div class="pt-3 border-t">
                        <div class="flex justify-between items-center">
                          <span class="text-slate-600 font-medium">Taux global</span>
                          <span class="text-lg font-bold text-slate-900">{{ result.taux_global }}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              }
            </div>
          </div>
        }
      </div>
    </app-dashboard-layout>
  `,
})
export class AdvancedSimulatorComponent {
  private simulationService = inject(SimulationService);
  private toast = inject(ToastService);
  protected readonly ic = { Calculator, Download, Save };

  tjm = 500;
  daysPerMonth = 18;
  monthlyExpenses = 500;
  familyShares = 1;
  householdIncome = 0;
  acre = false;
  arce = false;
  are = false;
  statusesToCompare: string[] = ['ae', 'sasu', 'eurl', 'portage'];

  results: Record<string, AdvResult> | null = null;
  saving = false;

  protected readonly statuses = [
    { id: 'ae', label: 'Auto-Entrepreneur' },
    { id: 'sasu', label: 'SASU' },
    { id: 'eurl', label: 'EURL' },
    { id: 'portage', label: 'Portage Salarial' },
  ];

  toggleStatus(id: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.statusesToCompare = checked
      ? [...this.statusesToCompare, id]
      : this.statusesToCompare.filter(s => s !== id);
  }

  calculateResults(): void {
    const annualRevenue = this.tjm * this.daysPerMonth * 12;

    this.results = {
      ae: {
        statut: 'Auto-Entrepreneur',
        revenu_annuel: annualRevenue,
        charges_sociales: annualRevenue * 0.22,
        impot_revenu: annualRevenue * 0.08,
        net_annuel: annualRevenue * 0.70,
        net_mensuel: (annualRevenue * 0.70) / 12,
        taux_global: 30,
      },
      sasu: {
        statut: 'SASU',
        revenu_annuel: annualRevenue,
        charges_sociales: annualRevenue * 0.45,
        impot_societes: annualRevenue * 0.15,
        dividendes: annualRevenue * 0.25,
        net_annuel: annualRevenue * 0.65,
        net_mensuel: (annualRevenue * 0.65) / 12,
        taux_global: 35,
      },
      eurl: {
        statut: 'EURL',
        revenu_annuel: annualRevenue,
        charges_sociales: annualRevenue * 0.42,
        impot_revenu: annualRevenue * 0.10,
        net_annuel: annualRevenue * 0.68,
        net_mensuel: (annualRevenue * 0.68) / 12,
        taux_global: 32,
      },
      portage: {
        statut: 'Portage Salarial',
        revenu_annuel: annualRevenue,
        frais_gestion: annualRevenue * 0.10,
        charges_sociales: annualRevenue * 0.45,
        net_annuel: annualRevenue * 0.60,
        net_mensuel: (annualRevenue * 0.60) / 12,
        taux_global: 40,
      },
    };
  }

  async saveSimulation(): Promise<void> {
    this.saving = true;
    try {
      await this.simulationService.create({
        name: `Simulation ${new Date().toLocaleDateString('fr-FR')}`,
        tjm: this.tjm,
        days_per_month: this.daysPerMonth,
        monthly_expenses: this.monthlyExpenses,
        family_shares: this.familyShares,
        household_income: this.householdIncome,
        statuses_compared: this.statusesToCompare,
        acre: this.acre,
        arce: this.arce,
        are: this.are,
        results: this.results,
      });
      this.toast.success('Simulation sauvegardée !');
    } catch {
      this.toast.error('Erreur lors de la sauvegarde');
    }
    this.saving = false;
  }

  round(v: number): number { return Math.round(v); }
}
