import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule, ArrowRight, Baby, Briefcase, Calculator, Euro, Heart,
  Landmark, Loader2, Lock, Settings2, Users, Wallet,
} from 'lucide-angular';
import { NavbarComponent } from '../../landing/navbar.component';
import { FooterComponent } from '../../landing/footer.component';
import { SliderComponent } from '../../shared/slider.component';
import { SwitchComponent } from '../../shared/switch.component';
import { AuthService } from '../../core/auth.service';
import { SeoService } from '../../core/seo.service';
import { FiscalEngineService } from '../../core/fiscal/fiscal-engine.service';
import {
  ActiviteMicro, FoyerResult, PersonneInput, StatutId, defaultOptions, defaultRevenu,
} from '../../core/fiscal/types';
import { StatutCardComponent } from './statut-card.component';

const STATUTS_COMPARES: StatutId[] = ['micro', 'eurl', 'sasu-is', 'sasu-ir', 'portage', 'salarie'];

type ConjointStatut = StatutId | 'aucun';

@Component({
  selector: 'app-simulator',
  imports: [FormsModule, LucideAngularModule, NavbarComponent, FooterComponent, SliderComponent, SwitchComponent, StatutCardComponent],
  template: `
    <div class="min-h-screen bg-slate-50">
      <app-navbar />
      <div class="pt-24 pb-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="anim-fade-up text-center mb-12">
            <span class="text-sm font-semibold text-blue-600 tracking-wide uppercase">Simulateur</span>
            <h1 class="mt-3 text-3xl sm:text-4xl font-bold text-slate-900">
              Comparez tous les statuts, impôt du foyer inclus
            </h1>
            <p class="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              Micro-entreprise, EURL, SASU (IS ou IR), portage salarial, salariat : cotisations calculées
              avec le moteur officiel de l'URSSAF et impôt sur le revenu au barème en vigueur.
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- ============ Colonne paramètres ============ -->
            <div class="anim-fade-up space-y-6" style="animation-delay: 0.1s">
              <!-- Activité -->
              <div class="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                <h2 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <lucide-icon [img]="ic.Calculator" class="w-5 h-5 text-blue-600" />
                  Votre activité
                </h2>

                <div class="flex rounded-xl bg-slate-100 p-1 mb-5">
                  <button
                    type="button"
                    class="flex-1 rounded-lg py-2 text-sm font-semibold transition-colors"
                    [class]="mode === 'tjm' ? 'bg-white text-blue-700 shadow' : 'text-slate-500'"
                    (click)="mode = 'tjm'; onChange()">TJM × jours</button>
                  <button
                    type="button"
                    class="flex-1 rounded-lg py-2 text-sm font-semibold transition-colors"
                    [class]="mode === 'ca' ? 'bg-white text-blue-700 shadow' : 'text-slate-500'"
                    (click)="mode = 'ca'; onChange()">Chiffre d'affaires</button>
                </div>

                <div class="space-y-5">
                  @if (mode === 'tjm') {
                    <div>
                      <label for="tjm" class="ui-label text-sm font-semibold text-slate-700 mb-2 block">Taux Journalier Moyen</label>
                      <div class="relative">
                        <input id="tjm" type="number" class="ui-input font-semibold pr-10"
                          [ngModel]="tjm" (ngModelChange)="tjm = $event; onChange()" />
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">€/j</span>
                      </div>
                      <app-slider class="block mt-3" [min]="200" [max]="1500" [step]="10" [value]="tjm" (valueChange)="tjm = $event; onChange()" />
                    </div>
                    <div>
                      <label for="jours" class="ui-label text-sm font-semibold text-slate-700 mb-2 block">Jours facturés par mois</label>
                      <div class="relative">
                        <input id="jours" type="number" class="ui-input font-semibold pr-14"
                          [ngModel]="joursParMois" (ngModelChange)="joursParMois = $event; onChange()" />
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">jours</span>
                      </div>
                      <app-slider class="block mt-3" [min]="5" [max]="22" [step]="1" [value]="joursParMois" (valueChange)="joursParMois = $event; onChange()" />
                    </div>
                  } @else {
                    <div>
                      <label for="ca" class="ui-label text-sm font-semibold text-slate-700 mb-2 block">Chiffre d'affaires annuel HT</label>
                      <div class="relative">
                        <input id="ca" type="number" class="ui-input font-semibold pr-8"
                          [ngModel]="ca" (ngModelChange)="ca = $event; onChange()" />
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">€</span>
                      </div>
                    </div>
                  }

                  <div>
                    <label for="depenses" class="ui-label text-sm font-semibold text-slate-700 mb-2 block">Dépenses annuelles déductibles</label>
                    <div class="relative">
                      <input id="depenses" type="number" class="ui-input font-semibold pr-8"
                        [ngModel]="depenses" (ngModelChange)="depenses = $event; onChange()" />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">€</span>
                    </div>
                    <p class="text-xs text-slate-400 mt-1">Comptable, matériel, mutuelle, déplacements… (non déductibles en micro)</p>
                  </div>

                  <div class="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <span class="text-sm font-semibold text-slate-700">CA annuel estimé</span>
                    <p class="text-2xl font-bold text-blue-700">{{ fmt(caAnnuel()) }} €</p>
                  </div>
                </div>
              </div>

              <!-- Foyer fiscal -->
              <div class="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                <h2 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <lucide-icon [img]="ic.Users" class="w-5 h-5 text-blue-600" />
                  Votre foyer
                </h2>
                <div class="space-y-5">
                  <div class="flex items-center justify-between p-3 bg-rose-50 rounded-xl border border-rose-100">
                    <div class="flex items-center gap-2">
                      <lucide-icon [img]="ic.Heart" class="w-4 h-4 text-rose-500" />
                      <span class="text-sm font-semibold text-slate-700">Marié·e ou pacsé·e</span>
                    </div>
                    <app-switch [checked]="marie" (checkedChange)="marie = $event; onChange()" />
                  </div>

                  @if (marie) {
                    <div class="rounded-xl border border-slate-200 p-4 space-y-4">
                      <p class="text-sm font-semibold text-slate-700">Revenu du conjoint</p>
                      <div>
                        <label class="ui-label text-xs font-semibold text-slate-500 mb-1 block">Statut du conjoint</label>
                        <select class="ui-input ui-select" [ngModel]="conjointStatut" (ngModelChange)="conjointStatut = $event; onChange()">
                          <option value="aucun">Sans revenu</option>
                          <option value="salarie">Salarié</option>
                          <option value="micro">Micro-entreprise</option>
                          <option value="eurl">EURL (IS)</option>
                          <option value="sasu-is">SASU (IS)</option>
                          <option value="sasu-ir">SASU (IR)</option>
                          <option value="portage">Portage salarial</option>
                        </select>
                      </div>
                      @if (conjointStatut === 'salarie') {
                        <div>
                          <label class="ui-label text-xs font-semibold text-slate-500 mb-1 block">Salaire brut annuel</label>
                          <div class="relative">
                            <input type="number" class="ui-input pr-8" [ngModel]="conjointBrut" (ngModelChange)="conjointBrut = $event; onChange()" />
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                          </div>
                        </div>
                      } @else if (conjointStatut !== 'aucun') {
                        <div>
                          <label class="ui-label text-xs font-semibold text-slate-500 mb-1 block">Chiffre d'affaires annuel</label>
                          <div class="relative">
                            <input type="number" class="ui-input pr-8" [ngModel]="conjointCa" (ngModelChange)="conjointCa = $event; onChange()" />
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                          </div>
                        </div>
                        @if (conjointStatut === 'micro') {
                          <div>
                            <label class="ui-label text-xs font-semibold text-slate-500 mb-1 block">Activité du conjoint</label>
                            <select class="ui-input ui-select" [ngModel]="conjointActivite" (ngModelChange)="conjointActivite = $event; onChange()">
                              <option value="bnc">Libérale (BNC)</option>
                              <option value="service-bic">Services (BIC)</option>
                              <option value="commerce">Commerce</option>
                            </select>
                          </div>
                        }
                      }
                    </div>
                  }

                  <div>
                    <label for="enfants" class="ui-label text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <lucide-icon [img]="ic.Baby" class="w-4 h-4 text-slate-400" />
                      Enfants à charge
                    </label>
                    <input id="enfants" type="number" min="0" max="10" class="ui-input font-semibold"
                      [ngModel]="enfants" (ngModelChange)="enfants = $event; onChange()" />
                  </div>

                  <div>
                    <label for="autres" class="ui-label text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <lucide-icon [img]="ic.Wallet" class="w-4 h-4 text-slate-400" />
                      Autres revenus imposables du foyer
                    </label>
                    <div class="relative">
                      <input id="autres" type="number" class="ui-input font-semibold pr-12"
                        [ngModel]="autresRevenus" (ngModelChange)="autresRevenus = $event; onChange()" />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">€/an</span>
                    </div>
                    <p class="text-xs text-slate-400 mt-1">Fonciers, pensions… montant annuel imposable</p>
                  </div>
                </div>
              </div>

              <!-- Options par statut -->
              <div class="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                <h2 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <lucide-icon [img]="ic.Settings2" class="w-5 h-5 text-blue-600" />
                  Options par statut
                </h2>
                <div class="space-y-5">
                  <div class="rounded-xl border border-slate-200 p-4">
                    <p class="text-sm font-semibold text-slate-700 mb-3">EURL & SASU à l'IS</p>
                    <label class="ui-label text-xs font-semibold text-slate-500 mb-1 block">
                      Part du disponible en rémunération : {{ partRemuneration }} % (reste en dividendes)
                    </label>
                    <app-slider [min]="0" [max]="100" [step]="5" [value]="partRemuneration" (valueChange)="partRemuneration = $event; onChange()" />
                    <div class="mt-3">
                      <label class="ui-label text-xs font-semibold text-slate-500 mb-1 block">Imposition des dividendes (SASU)</label>
                      <div class="flex rounded-lg bg-slate-100 p-1">
                        <button type="button" class="flex-1 rounded-md py-1.5 text-xs font-semibold"
                          [class]="dividendes === 'pfu' ? 'bg-white text-blue-700 shadow' : 'text-slate-500'"
                          (click)="dividendes = 'pfu'; onChange()">Flat tax (PFU)</button>
                        <button type="button" class="flex-1 rounded-md py-1.5 text-xs font-semibold"
                          [class]="dividendes === 'bareme' ? 'bg-white text-blue-700 shadow' : 'text-slate-500'"
                          (click)="dividendes = 'bareme'; onChange()">Barème (réel)</button>
                      </div>
                    </div>
                  </div>

                  <div class="rounded-xl border border-slate-200 p-4">
                    <p class="text-sm font-semibold text-slate-700 mb-3">SASU à l'IR</p>
                    <label class="ui-label text-xs font-semibold text-slate-500 mb-1 block">Salaire brut annuel du président (optionnel)</label>
                    <div class="relative">
                      <input type="number" class="ui-input pr-8" [ngModel]="salairePresident" (ngModelChange)="salairePresident = $event; onChange()" />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                    </div>
                    <p class="text-xs text-slate-400 mt-1">Le bénéfice restant est imposé à l'IR + prélèvements sociaux 18,6 %</p>
                  </div>

                  <div class="rounded-xl border border-slate-200 p-4 space-y-3">
                    <p class="text-sm font-semibold text-slate-700">Micro-entreprise</p>
                    <div>
                      <label class="ui-label text-xs font-semibold text-slate-500 mb-1 block">Nature de l'activité</label>
                      <select class="ui-input ui-select" [ngModel]="activite" (ngModelChange)="activite = $event; onChange()">
                        <option value="bnc">Libérale (BNC) — abattement 34 %</option>
                        <option value="service-bic">Services (BIC) — abattement 50 %</option>
                        <option value="commerce">Commerce — abattement 71 %</option>
                      </select>
                    </div>
                    <div class="flex items-center justify-between">
                      <div>
                        <span class="text-sm font-medium text-slate-700">ACRE</span>
                        <p class="text-xs text-slate-400">Taux réduits de 1ère année (en vigueur juillet 2026)</p>
                      </div>
                      <app-switch [checked]="acre" (checkedChange)="acre = $event; onChange()" />
                    </div>
                    <div class="flex items-center justify-between">
                      <div>
                        <span class="text-sm font-medium text-slate-700">Versement libératoire</span>
                        <p class="text-xs text-slate-400">IR payé avec les cotisations (au % du CA)</p>
                      </div>
                      <app-switch [checked]="versementLiberatoire" (checkedChange)="versementLiberatoire = $event; onChange()" />
                    </div>
                  </div>

                  <div class="rounded-xl border border-slate-200 p-4">
                    <p class="text-sm font-semibold text-slate-700 mb-3">Portage salarial</p>
                    <label class="ui-label text-xs font-semibold text-slate-500 mb-1 block">Commission de portage : {{ commissionPortage }} % du CA</label>
                    <app-slider [min]="3" [max]="15" [step]="0.5" [value]="commissionPortage" (valueChange)="commissionPortage = $event; onChange()" />
                    <p class="text-xs text-slate-400 mt-1">CDI de portage, statut cadre</p>
                  </div>

                  <div class="rounded-xl border border-slate-200 p-4">
                    <p class="text-sm font-semibold text-slate-700 mb-3">Salarié</p>
                    <label class="ui-label text-xs font-semibold text-slate-500 mb-1 block">Salaire brut annuel proposé</label>
                    <div class="relative">
                      <input type="number" class="ui-input pr-8" [ngModel]="salaireBrut" (ngModelChange)="salaireBrut = $event; onChange()" />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ============ Colonne résultats ============ -->
            <div class="anim-fade-up lg:col-span-2" style="animation-delay: 0.2s">
              @if (loading) {
                <div class="flex flex-col items-center justify-center py-24 text-slate-400">
                  <lucide-icon [img]="ic.Loader2" class="w-8 h-8 animate-spin mb-3" />
                  <p class="text-sm">Chargement du moteur de calcul URSSAF…</p>
                </div>
              } @else {
                <div class="space-y-6" [class.opacity-60]="computing">
                  <h3 class="text-lg font-bold text-slate-900">Résultats de la comparaison</h3>
                  <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    @for (r of results; track r.statut.id) {
                      <app-statut-card
                        [result]="r"
                        [best]="r.statut.id === bestId"
                        [selected]="r.statut.id === selectedId"
                        (select)="selectedId = r.statut.id" />
                    }
                  </div>

                  <!-- ============ Revenu global du foyer ============ -->
                  @if (selection(); as sel) {
                    <div class="anim-fade-up bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8">
                      <div class="flex items-center gap-2 mb-1">
                        <lucide-icon [img]="ic.Landmark" class="w-5 h-5 text-amber-400" />
                        <h3 class="text-lg font-bold">Revenu global du foyer — scénario {{ sel.statut.label }}</h3>
                      </div>
                      <p class="text-sm text-slate-400 mb-6">
                        {{ marie ? 'Couple' : 'Célibataire' }}{{ enfants > 0 ? ' · ' + enfants + ' enfant' + (enfants > 1 ? 's' : '') + ' à charge' : '' }}
                        · {{ partsFmt(sel.parts) }} part{{ sel.parts > 1 ? 's' : '' }} fiscale{{ sel.parts > 1 ? 's' : '' }}
                      </p>
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                          <p class="text-xs uppercase tracking-wide text-slate-400 mb-1">Revenu imposable</p>
                          <p class="text-xl font-bold">{{ fmt(sel.revenuImposableFoyer) }} €</p>
                        </div>
                        <div>
                          <p class="text-xs uppercase tracking-wide text-slate-400 mb-1">Impôt au barème</p>
                          <p class="text-xl font-bold text-red-300">-{{ fmt(sel.impotBareme) }} €</p>
                        </div>
                        <div>
                          <p class="text-xs uppercase tracking-wide text-slate-400 mb-1">Flat tax & libératoire</p>
                          <p class="text-xl font-bold text-red-300">-{{ fmt(sel.impotForfaitaire) }} €</p>
                        </div>
                        <div>
                          <p class="text-xs uppercase tracking-wide text-slate-400 mb-1">Net foyer après impôt</p>
                          <p class="text-2xl font-extrabold text-emerald-400">{{ fmt(sel.netFoyerApresImpot) }} €</p>
                          <p class="text-xs text-slate-400">soit {{ fmt(sel.netFoyerApresImpot / 12) }} €/mois</p>
                        </div>
                      </div>
                      @if (sel.conjoint) {
                        <p class="mt-5 pt-4 border-t border-white/10 text-sm text-slate-300">
                          Dont conjoint ({{ sel.conjoint.label }}) : {{ fmt(sel.conjoint.netAvantImpot) }} € net avant impôt.
                        </p>
                      }
                    </div>
                  }

                  <p class="text-xs text-slate-400">
                    Simulation indicative au barème {{ anneeBareme }} : cotisations calculées avec les règles officielles
                    URSSAF (modele-social, moteur de mon-entreprise.urssaf.fr), impôt sur le revenu au quotient familial
                    avec abattements par déclarant. Ne remplace pas un conseil comptable.
                  </p>

                  @if (!isAuth) {
                    <div class="anim-fade-up bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl p-6">
                      <div class="flex items-start gap-3">
                        <lucide-icon [img]="ic.Lock" class="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 class="font-bold mb-1">Sauvegardez et affinez vos simulations</h4>
                          <p class="text-sm text-slate-300 mb-4">
                            Créez votre espace gratuit pour enregistrer vos scénarios et suivre votre projet.
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
              }
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
  private fiscal = inject(FiscalEngineService);
  private platformId = inject(PLATFORM_ID);
  protected readonly ic = {
    ArrowRight, Baby, Briefcase, Calculator, Euro, Heart, Landmark, Loader2, Lock, Settings2, Users, Wallet,
  };
  protected readonly anneeBareme = 2026;

  // Activité
  mode: 'tjm' | 'ca' = 'tjm';
  tjm = 500;
  joursParMois = 18;
  ca = 108000;
  depenses = 3000;
  salaireBrut = 55000;

  // Options par statut
  partRemuneration = 60;
  dividendes: 'pfu' | 'bareme' = 'pfu';
  salairePresident = 0;
  activite: ActiviteMicro = 'bnc';
  acre = false;
  versementLiberatoire = false;
  commissionPortage = 8;

  // Foyer
  marie = false;
  enfants = 0;
  autresRevenus = 0;
  conjointStatut: ConjointStatut = 'salarie';
  conjointBrut = 35000;
  conjointCa = 60000;
  conjointActivite: ActiviteMicro = 'bnc';

  results: FoyerResult[] = [];
  bestId: StatutId | null = null;
  selectedId: StatutId | null = null;
  loading = true;
  computing = false;
  isAuth = false;

  private debounce: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.seo.set({
      title: 'Simulateur de revenus freelance : micro, EURL, SASU, portage, salariat — IndepBoost',
      description: 'Comparez gratuitement votre net après impôt sous tous les statuts (micro-entreprise, EURL, SASU IS/IR, portage salarial, salariat) avec le moteur officiel URSSAF, impôt du foyer et droits sociaux inclus.',
      path: '/',
    });
    this.auth.isAuthenticated().then(v => this.isAuth = v);
    if (isPlatformBrowser(this.platformId)) {
      this.fiscal.init().then(() => {
        this.loading = false;
        this.compute();
      });
    }
  }

  caAnnuel(): number {
    return this.mode === 'tjm' ? this.tjm * this.joursParMois * 12 : this.ca;
  }

  onChange(): void {
    if (this.loading) return;
    if (this.debounce) clearTimeout(this.debounce);
    this.computing = true;
    this.debounce = setTimeout(() => this.compute(), 250);
  }

  compute(): void {
    if (!this.fiscal.ready) return;

    const conjointResult = this.marie && this.conjointStatut !== 'aucun'
      ? this.fiscal.computeStatut(this.conjointInput(this.conjointStatut))
      : null;
    const foyer = {
      marie: this.marie,
      enfants: Math.max(0, Math.round(this.enfants || 0)),
      conjoint: null,
      autresRevenus: this.autresRevenus || 0,
    };

    this.results = STATUTS_COMPARES
      .map(statut => this.fiscal.computeStatut(this.personne(statut)))
      .map(statutResult => this.fiscal.computeFoyer(statutResult, conjointResult, foyer))
      .sort((a, b) => {
        if (a.statut.eligible !== b.statut.eligible) return a.statut.eligible ? -1 : 1;
        return b.netFoyerApresImpot - a.netFoyerApresImpot;
      });

    this.bestId = this.results.find(r => r.statut.eligible)?.statut.id ?? null;
    if (!this.results.some(r => r.statut.id === this.selectedId && r.statut.eligible)) {
      this.selectedId = this.bestId;
    }
    this.computing = false;
  }

  selection(): FoyerResult | null {
    return this.results.find(r => r.statut.id === this.selectedId) ?? null;
  }

  private personne(statut: StatutId): PersonneInput {
    return {
      statut,
      revenu: {
        mode: this.mode,
        tjm: this.tjm || 0,
        joursParMois: this.joursParMois || 0,
        ca: this.ca || 0,
        depenses: Math.max(0, this.depenses || 0),
        salaireBrut: Math.max(0, this.salaireBrut || 0),
      },
      options: {
        partRemuneration: this.partRemuneration,
        dividendes: this.dividendes,
        salairePresident: Math.max(0, this.salairePresident || 0),
        activite: this.activite,
        acre: this.acre,
        versementLiberatoire: this.versementLiberatoire,
        commissionPortage: this.commissionPortage,
      },
    };
  }

  private conjointInput(statut: StatutId): PersonneInput {
    const options = defaultOptions();
    options.activite = this.conjointActivite;
    const revenu = defaultRevenu();
    revenu.mode = 'ca';
    revenu.ca = Math.max(0, this.conjointCa || 0);
    revenu.depenses = 0;
    revenu.salaireBrut = Math.max(0, this.conjointBrut || 0);
    if (statut === 'sasu-ir') options.salairePresident = 0;
    return { statut, revenu, options };
  }

  fmt(v: number): string {
    return Math.round(v).toLocaleString('fr-FR');
  }

  partsFmt(parts: number): string {
    return parts.toLocaleString('fr-FR');
  }

  handleSignup(): void {
    this.auth.redirectToLogin('/Onboarding');
  }
}
