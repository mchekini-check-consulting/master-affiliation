import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Calculator, TrendingUp, AlertTriangle, Award, ArrowRight, Lock } from 'lucide-angular';
import { NavbarComponent } from '../../landing/navbar.component';
import { FooterComponent } from '../../landing/footer.component';
import { SliderComponent } from '../../shared/slider.component';
import { SwitchComponent } from '../../shared/switch.component';
import { AuthService } from '../../core/auth.service';
import { SeoService } from '../../core/seo.service';
import { SimResult } from '../../core/models';
import { simulateAE, simulateSASU } from '../../core/simulator-config';

@Component({
  selector: 'app-simulator',
  imports: [FormsModule, LucideAngularModule, NavbarComponent, FooterComponent, SliderComponent, SwitchComponent],
  template: `
    <div class="min-h-screen bg-slate-50">
      <app-navbar />
      <div class="pt-24 pb-16">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="anim-fade-up text-center mb-12">
            <span class="text-sm font-semibold text-blue-600 tracking-wide uppercase">Simulateur</span>
            <h1 class="mt-3 text-3xl sm:text-4xl font-bold text-slate-900">
              Simulez votre avenir en 2 minutes
            </h1>
            <p class="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              Découvrez combien vous gagnerez vraiment — Auto-entrepreneur vs SASU
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Paramètres -->
            <div class="anim-fade-up" style="animation-delay: 0.1s">
              <div class="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8 sticky top-24">
                <h2 class="text-lg font-bold text-slate-900 mb-6">Vos paramètres</h2>
                <div class="space-y-6">
                  <div>
                    <label for="tjm" class="ui-label text-sm font-semibold text-slate-700 mb-2 block">
                      Taux Journalier Moyen (TJM)
                    </label>
                    <div class="relative">
                      <input
                        id="tjm" type="number" class="ui-input text-lg font-semibold pr-10"
                        [ngModel]="tjm" (ngModelChange)="tjm = $event; compute()" />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">€/j</span>
                    </div>
                    <app-slider class="block mt-3" [min]="200" [max]="1500" [step]="10" [value]="tjm" (valueChange)="tjm = $event; compute()" />
                    <div class="flex justify-between text-xs text-slate-400 mt-1">
                      <span>200€</span>
                      <span>1 500€</span>
                    </div>
                  </div>

                  <div>
                    <label for="days" class="ui-label text-sm font-semibold text-slate-700 mb-2 block">
                      Jours travaillés par mois
                    </label>
                    <div class="relative">
                      <input
                        id="days" type="number" class="ui-input text-lg font-semibold pr-14"
                        [ngModel]="daysPerMonth" (ngModelChange)="daysPerMonth = $event; compute()" />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">jours</span>
                    </div>
                    <app-slider class="block mt-3" [min]="5" [max]="22" [step]="1" [value]="daysPerMonth" (valueChange)="daysPerMonth = $event; compute()" />
                    <div class="flex justify-between text-xs text-slate-400 mt-1">
                      <span>5 jours</span>
                      <span>22 jours</span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div>
                      <span class="ui-label text-sm font-semibold text-slate-700">ACRE</span>
                      <p class="text-xs text-slate-500 mt-0.5">Réduction de charges la 1ère année</p>
                    </div>
                    <app-switch [checked]="acre" (checkedChange)="acre = $event; compute()" />
                  </div>

                  <div class="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div class="flex items-center gap-2 mb-1">
                      <lucide-icon [img]="ic.Calculator" class="w-4 h-4 text-blue-600" />
                      <span class="text-sm font-semibold text-slate-700">CA Annuel estimé</span>
                    </div>
                    <p class="text-2xl font-bold text-blue-700">
                      {{ (tjm * daysPerMonth * 12).toLocaleString('fr-FR') }} €
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Résultats -->
            <div class="anim-fade-up" style="animation-delay: 0.2s">
              <div class="space-y-6">
                <h3 class="text-lg font-bold text-slate-900">Résultats de la simulation</h3>

                <div class="grid grid-cols-1 gap-4">
                  @for (result of results; track result.statut) {
                    @if (!result.eligible) {
                      <div class="bg-slate-50 border border-slate-200 rounded-2xl p-6 opacity-60">
                        <div class="flex items-center gap-2 mb-3">
                          <lucide-icon [img]="ic.AlertTriangle" class="w-5 h-5 text-amber-500" />
                          <h3 class="font-bold text-slate-700">{{ result.statut || 'Auto-entrepreneur' }}</h3>
                        </div>
                        <p class="text-sm text-slate-500">{{ result.reason }}</p>
                      </div>
                    } @else {
                      <div
                        class="anim-fade-up relative rounded-2xl p-6 border-2 transition-all"
                        [class]="isBest(result)
                          ? 'bg-gradient-to-br from-blue-50 to-emerald-50 border-blue-300 shadow-lg shadow-blue-100/50'
                          : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md'">
                        @if (isBest(result)) {
                          <div class="absolute -top-3 left-6">
                            <span class="ui-badge bg-gradient-to-r from-blue-600 to-emerald-500 text-white px-3 py-1 text-xs font-semibold shadow-md">
                              <lucide-icon [img]="ic.Award" class="w-3 h-3 mr-1" />
                              Recommandé
                            </span>
                          </div>
                        }

                        <h3 class="font-bold text-lg text-slate-900 mb-4 mt-1">{{ result.statut }}</h3>

                        <div class="space-y-3">
                          <div class="flex justify-between items-center">
                            <span class="text-sm text-slate-500">CA mensuel</span>
                            <span class="font-semibold text-slate-700">{{ round(result.ca_mensuel).toLocaleString('fr-FR') }} €</span>
                          </div>
                          <div class="flex justify-between items-center">
                            <span class="text-sm text-slate-500">Charges + IR</span>
                            <span class="font-semibold text-red-500">
                              -{{ monthlyCharges(result).toLocaleString('fr-FR') }} €
                            </span>
                          </div>
                          <div class="border-t border-slate-100 pt-3">
                            <div class="flex justify-between items-center">
                              <span class="text-sm font-semibold text-slate-700">Net mensuel</span>
                              <span class="text-2xl font-extrabold" [class]="isBest(result) ? 'text-blue-700' : 'text-slate-900'">
                                {{ round(result.net_mensuel).toLocaleString('fr-FR') }} €
                              </span>
                            </div>
                          </div>
                          <div class="flex items-center gap-2 pt-1">
                            <lucide-icon [img]="ic.TrendingUp" class="w-4 h-4 text-emerald-500" />
                            <span class="text-xs text-slate-500">
                              Taux de prélèvement : {{ (result.taux_prelevement ?? 0).toFixed(1) }}%
                            </span>
                          </div>
                        </div>
                      </div>
                    }
                  }
                </div>

                @if (best) {
                  <div class="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl p-4 border border-blue-100">
                    <p class="text-sm text-slate-700">
                      <strong class="text-blue-700">{{ best.statut }}</strong> est le statut le plus avantageux pour votre profil avec
                      <strong>{{ round(best.net_mensuel).toLocaleString('fr-FR') }} € net/mois</strong>.
                    </p>
                  </div>
                }

                @if (!isAuth) {
                  <div class="anim-fade-up bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl p-6">
                    <div class="flex items-start gap-3">
                      <lucide-icon [img]="ic.Lock" class="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 class="font-bold mb-1">Débloquez le simulateur avancé</h4>
                        <p class="text-sm text-slate-300 mb-4">
                          Comparez EURL, Portage salarial, optimisez rémunération/dividendes, et plus encore — gratuitement.
                        </p>
                        <button
                          (click)="handleSignup()"
                          class="ui-btn bg-gradient-to-r from-blue-600 to-emerald-500 text-white hover:from-blue-700 hover:to-emerald-600 group">
                          Créer mon espace gratuit
                          <lucide-icon [img]="ic.ArrowRight" class="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
      <app-footer />
    </div>
  `,
})
export class SimulatorComponent implements OnInit {
  private auth = inject(AuthService);
  private seo = inject(SeoService);
  protected readonly ic = { Calculator, TrendingUp, AlertTriangle, Award, ArrowRight, Lock };

  tjm = 500;
  daysPerMonth = 18;
  acre = false;
  results: SimResult[] = [];
  best: SimResult | null = null;
  isAuth = false;

  ngOnInit(): void {
    this.seo.set({
      title: 'Simulateur de revenus freelance : Auto-entrepreneur vs SASU — IndepBoost',
      description: 'Simulez gratuitement vos revenus de freelance IT en 2 minutes : comparez Auto-entrepreneur et SASU (charges, IR, ACRE) et découvrez votre net mensuel réel.',
      path: '/',
    });
    this.auth.isAuthenticated().then(v => this.isAuth = v);
    this.compute();
  }

  compute(): void {
    const aeResult = simulateAE(this.tjm, this.daysPerMonth, this.acre);
    if (!aeResult.eligible) {
      aeResult.statut = 'Auto-entrepreneur';
    }
    const sasuResult = simulateSASU(this.tjm, this.daysPerMonth, 0, this.acre);
    this.results = [aeResult, sasuResult];
    const eligible = this.results.filter(r => r.eligible);
    this.best = eligible.length
      ? [...eligible].sort((a, b) => (b.net_mensuel ?? 0) - (a.net_mensuel ?? 0))[0]
      : null;
  }

  isBest(result: SimResult): boolean {
    return !!this.best && result.statut === this.best.statut;
  }

  monthlyCharges(result: SimResult): number {
    const charges = result.charges_mensuelles ?? ((result.charges_sociales ?? 0) / 12);
    return Math.round(charges + (result.ir_annuel ?? 0) / 12);
  }

  round(v?: number): number {
    return Math.round(v ?? 0);
  }

  handleSignup(): void {
    this.auth.redirectToLogin('/Onboarding');
  }
}
