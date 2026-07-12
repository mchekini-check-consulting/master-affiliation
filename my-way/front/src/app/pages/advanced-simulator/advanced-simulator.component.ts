import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule, ArrowLeft, ArrowRight, Baby, Briefcase, Calculator, Check,
  ChevronDown, Heart, HeartPulse, Landmark, Loader2, PiggyBank, RotateCcw, Save,
  ShieldCheck, ShieldOff, User, Users,
} from 'lucide-angular';
import { DashboardLayoutComponent } from '../dashboard/dashboard-layout.component';
import { SimulationService } from '../../core/simulation.service';
import { ToastService } from '../../core/toast.service';
import { SliderComponent } from '../../shared/slider.component';
import { SwitchComponent } from '../../shared/switch.component';
import { FiscalEngineService } from '../../core/fiscal/fiscal-engine.service';
import { ActiviteMicro, FoyerResult, PersonneInput, StatutId } from '../../core/fiscal/types';

interface ChoixStatut { id: StatutId; label: string; description: string; }

@Component({
  selector: 'app-advanced-simulator',
  imports: [FormsModule, LucideAngularModule, DashboardLayoutComponent, SliderComponent, SwitchComponent],
  template: `
    <app-dashboard-layout>
      <div class="p-6 lg:p-8 max-w-4xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-slate-900 mb-2">Simulateur Avancé</h1>
          <p class="text-slate-600">Un parcours guidé : votre foyer, votre activité, puis le détail complet du calcul</p>
        </div>

        <!-- Étapes -->
        <div class="flex items-center gap-2 mb-8">
          @for (etape of etapes; track etape.n) {
            <div class="flex items-center gap-2" [class.flex-1]="etape.n < 3">
              <button
                type="button"
                (click)="etape.n < step ? step = etape.n : null"
                class="flex items-center gap-2"
                [class.cursor-pointer]="etape.n < step">
                <span
                  class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                  [class]="step > etape.n
                    ? 'bg-emerald-500 text-white'
                    : step === etape.n
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-500'">
                  @if (step > etape.n) {
                    <lucide-icon [img]="ic.Check" class="w-4 h-4" />
                  } @else {
                    {{ etape.n }}
                  }
                </span>
                <span class="text-sm font-semibold hidden sm:inline"
                  [class]="step >= etape.n ? 'text-slate-900' : 'text-slate-400'">{{ etape.label }}</span>
              </button>
              @if (etape.n < 3) {
                <div class="flex-1 h-0.5 rounded" [class]="step > etape.n ? 'bg-emerald-400' : 'bg-slate-200'"></div>
              }
            </div>
          }
        </div>

        @if (loading) {
          <div class="flex flex-col items-center justify-center py-24 text-slate-400">
            <lucide-icon [img]="ic.Loader2" class="w-8 h-8 animate-spin mb-3" />
            <p class="text-sm">Chargement du moteur de calcul URSSAF…</p>
          </div>
        } @else {

          <!-- ================= Étape 1 : Foyer ================= -->
          @if (step === 1) {
            <div class="ui-card anim-fade-up">
              <div class="ui-card-header">
                <span class="ui-card-title !text-base font-semibold flex items-center gap-2">
                  <lucide-icon [img]="ic.Users" class="w-5 h-5 text-blue-600" />
                  Votre foyer
                </span>
                <p class="text-sm text-slate-500 mt-1">Ces informations déterminent vos parts fiscales et l'impôt sur le revenu du foyer.</p>
              </div>
              <div class="ui-card-content space-y-6">
                <div>
                  <span class="ui-label mb-3 block">Situation maritale</span>
                  <div class="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      (click)="marie = false"
                      class="rounded-xl border-2 p-4 text-left transition-all"
                      [class]="!marie ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'">
                      <lucide-icon [img]="ic.User" class="w-5 h-5 mb-2" [class]="!marie ? 'text-blue-600' : 'text-slate-400'" />
                      <p class="font-semibold text-slate-900">Célibataire</p>
                      <p class="text-xs text-slate-500 mt-0.5">1 part fiscale de base</p>
                    </button>
                    <button
                      type="button"
                      (click)="marie = true"
                      class="rounded-xl border-2 p-4 text-left transition-all"
                      [class]="marie ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'">
                      <lucide-icon [img]="ic.Heart" class="w-5 h-5 mb-2" [class]="marie ? 'text-blue-600' : 'text-slate-400'" />
                      <p class="font-semibold text-slate-900">Marié·e / pacsé·e</p>
                      <p class="text-xs text-slate-500 mt-0.5">2 parts fiscales de base</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label class="ui-label mb-2 flex items-center gap-2">
                    <lucide-icon [img]="ic.Baby" class="w-4 h-4 text-slate-400" />
                    Nombre d'enfants à charge
                  </label>
                  <input type="number" min="0" max="10" class="ui-input w-40 font-semibold" [(ngModel)]="enfants" />
                  <p class="text-xs text-slate-400 mt-1">½ part par enfant, 1 part entière à partir du 3ᵉ</p>
                </div>

                <button (click)="step = 2" class="ui-btn ui-btn-lg w-full bg-blue-600 hover:bg-blue-700 text-white group">
                  Continuer
                  <lucide-icon [img]="ic.ArrowRight" class="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          }

          <!-- ================= Étape 2 : Activité ================= -->
          @if (step === 2) {
            <div class="ui-card anim-fade-up">
              <div class="ui-card-header">
                <span class="ui-card-title !text-base font-semibold flex items-center gap-2">
                  <lucide-icon [img]="ic.Briefcase" class="w-5 h-5 text-blue-600" />
                  Votre activité
                </span>
                <p class="text-sm text-slate-500 mt-1">Choisissez un statut : le formulaire s'adapte automatiquement.</p>
              </div>
              <div class="ui-card-content space-y-6">
                <div>
                  <span class="ui-label mb-3 block">Statut</span>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                    @for (choix of statuts; track choix.id) {
                      <button
                        type="button"
                        (click)="statut = choix.id"
                        class="rounded-xl border-2 p-3 text-left transition-all"
                        [class]="statut === choix.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'">
                        <p class="text-sm font-semibold text-slate-900">{{ choix.label }}</p>
                        <p class="text-xs text-slate-500 mt-0.5">{{ choix.description }}</p>
                      </button>
                    }
                  </div>
                </div>

                <!-- Champs dynamiques selon le statut -->
                @if (statut === 'salarie') {
                  <div class="anim-fade-up">
                    <label class="ui-label mb-2 block">Salaire brut annuel</label>
                    <div class="relative w-64">
                      <input type="number" class="ui-input font-semibold pr-8" [(ngModel)]="salaireBrut" />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                    </div>
                  </div>
                } @else {
                  <div class="anim-fade-up grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="ui-label mb-2 block">Taux Journalier Moyen (TJM)</label>
                      <div class="flex items-center gap-3">
                        <app-slider class="flex-1" [min]="200" [max]="1500" [step]="10" [value]="tjm" (valueChange)="tjm = $event" />
                        <input type="number" class="ui-input w-24" [(ngModel)]="tjm" />
                      </div>
                      <p class="text-sm text-slate-500 mt-1">{{ tjm }} €/jour</p>
                    </div>
                    <div>
                      <label class="ui-label mb-2 block">Jours travaillés par mois</label>
                      <div class="flex items-center gap-3">
                        <app-slider class="flex-1" [min]="1" [max]="22" [step]="1" [value]="joursParMois" (valueChange)="joursParMois = $event" />
                        <input type="number" class="ui-input w-24" [(ngModel)]="joursParMois" />
                      </div>
                      <p class="text-sm text-slate-500 mt-1">{{ joursParMois }} jours/mois — CA : {{ fmt(tjm * joursParMois * 12) }} €/an</p>
                    </div>

                    @if (statut === 'portage') {
                      <div>
                        <label class="ui-label mb-2 block">Commission de portage</label>
                        <div class="flex items-center gap-3">
                          <app-slider class="flex-1" [min]="3" [max]="15" [step]="0.5" [value]="commissionPortage" (valueChange)="commissionPortage = $event" />
                          <span class="text-sm font-semibold text-slate-700 w-14">{{ commissionPortage }} %</span>
                        </div>
                        <p class="text-xs text-slate-400 mt-1">CDI de portage, statut cadre</p>
                      </div>
                    }

                    <div>
                      <label class="ui-label mb-2 block">Cumul des dépenses annuelles</label>
                      <div class="relative">
                        <input type="number" class="ui-input font-semibold pr-8" [(ngModel)]="depenses" />
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                      </div>
                      <p class="text-xs text-slate-400 mt-1">
                        @if (statut === 'micro') { Non déductibles en micro : elles réduisent votre trésorerie }
                        @else if (statut === 'portage') { Frais professionnels remboursés par la société de portage }
                        @else { Déduites du résultat avant rémunération et dividendes }
                      </p>
                    </div>
                  </div>

                  @if (statut === 'eurl' || statut === 'sasu-is') {
                    <div class="anim-fade-up rounded-xl border border-slate-200 p-4">
                      <label class="ui-label mb-2 block">
                        Répartition du bénéfice distribuable : {{ partRemuneration }} % en rémunération, {{ 100 - partRemuneration }} % en dividendes
                      </label>
                      <app-slider [min]="0" [max]="100" [step]="5" [value]="partRemuneration" (valueChange)="partRemuneration = $event" />
                      @if (statut === 'sasu-is') {
                        <div class="mt-4">
                          <span class="ui-label text-xs mb-1 block">Imposition des dividendes</span>
                          <div class="flex rounded-lg bg-slate-100 p-1 w-72">
                            <button type="button" class="flex-1 rounded-md py-1.5 text-xs font-semibold"
                              [class]="dividendes === 'pfu' ? 'bg-white text-blue-700 shadow' : 'text-slate-500'"
                              (click)="dividendes = 'pfu'">Flat tax (PFU)</button>
                            <button type="button" class="flex-1 rounded-md py-1.5 text-xs font-semibold"
                              [class]="dividendes === 'bareme' ? 'bg-white text-blue-700 shadow' : 'text-slate-500'"
                              (click)="dividendes = 'bareme'">Barème (réel)</button>
                          </div>
                        </div>
                      }
                    </div>
                  }

                  @if (statut === 'sasu-ir') {
                    <div class="anim-fade-up">
                      <label class="ui-label mb-2 block">Salaire brut annuel du président (optionnel)</label>
                      <div class="relative w-64">
                        <input type="number" class="ui-input pr-8" [(ngModel)]="salairePresident" />
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                      </div>
                      <p class="text-xs text-slate-400 mt-1">Le bénéfice restant est imposé à l'IR + prélèvements sociaux 18,6 %</p>
                    </div>
                  }

                  @if (statut === 'micro') {
                    <div class="anim-fade-up rounded-xl border border-slate-200 p-4 space-y-4">
                      <div>
                        <label class="ui-label mb-2 block">Type d'activité</label>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          @for (a of activites; track a.id) {
                            <button
                              type="button"
                              (click)="activite = a.id"
                              class="rounded-lg border-2 p-3 text-left transition-all"
                              [class]="activite === a.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'">
                              <p class="text-sm font-semibold text-slate-900">{{ a.label }}</p>
                              <p class="text-xs text-slate-500">Abattement {{ a.abattement }} % (hors versement libératoire)</p>
                            </button>
                          }
                        </div>
                      </div>
                      <div class="flex items-center justify-between">
                        <div>
                          <span class="text-sm font-medium text-slate-700">ACRE</span>
                          <p class="text-xs text-slate-400">Réduction de cotisations la 1ère année</p>
                        </div>
                        <app-switch [checked]="acre" (checkedChange)="acre = $event" />
                      </div>
                      <div class="flex items-center justify-between">
                        <div>
                          <span class="text-sm font-medium text-slate-700">Versement libératoire</span>
                          <p class="text-xs text-slate-400">IR payé en % du CA avec les cotisations</p>
                        </div>
                        <app-switch [checked]="versementLiberatoire" (checkedChange)="versementLiberatoire = $event" />
                      </div>
                    </div>
                  }
                }

                <div class="flex gap-3">
                  <button (click)="step = 1" class="ui-btn ui-btn-outline">
                    <lucide-icon [img]="ic.ArrowLeft" class="mr-2 w-4 h-4" />
                    Retour
                  </button>
                  <button (click)="calculer()" class="ui-btn ui-btn-lg flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    <lucide-icon [img]="ic.Calculator" class="w-4 h-4 mr-2" />
                    Calculer
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- ================= Étape 3 : Résultats ================= -->
          @if (step === 3 && resultat) {
            <div class="space-y-6 anim-fade-up">
              <!-- Net mensuel -->
              <div class="ui-card bg-gradient-to-br from-blue-600 to-blue-500 text-white border-0">
                <div class="ui-card-content pt-6">
                  <p class="text-sm text-blue-100">{{ resultat.statut.label }} — net mensuel après impôt</p>
                  <p class="text-5xl font-bold mt-1">{{ fmt(resultat.netDeclarantApresImpot / 12) }} €</p>
                  <p class="text-sm text-blue-100 mt-2">
                    soit {{ fmt(resultat.netDeclarantApresImpot) }} €/an pour {{ fmt(resultat.statut.caAnnuel) }} € de
                    {{ statut === 'salarie' ? 'salaire brut' : "chiffre d'affaires" }}
                  </p>
                </div>
              </div>

              @if (!resultat.statut.eligible) {
                <div class="ui-card border-amber-200 bg-amber-50">
                  <div class="ui-card-content pt-6 text-amber-700 font-medium">{{ resultat.statut.raison }}</div>
                </div>
              } @else {
                <!-- Bénéfice distribuable / détail -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="ui-card">
                    <div class="ui-card-header">
                      <span class="ui-card-title !text-sm font-semibold">
                        {{ statut === 'eurl' || statut === 'sasu-is' || statut === 'sasu-ir' ? 'Bénéfice distribuable' : 'Base de calcul' }}
                      </span>
                    </div>
                    <div class="ui-card-content space-y-3 text-sm">
                      @if (statut === 'eurl' || statut === 'sasu-is' || statut === 'sasu-ir') {
                        <div class="flex justify-between">
                          <span class="text-slate-600">Chiffre d'affaires</span>
                          <span class="font-semibold">{{ fmt(resultat.statut.caAnnuel) }} €</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-slate-600">Dépenses déduites</span>
                          <span class="font-semibold text-orange-600">-{{ fmt(resultat.statut.depenses) }} €</span>
                        </div>
                        <div class="flex justify-between border-t pt-2">
                          <span class="font-semibold text-slate-800">Bénéfice distribuable</span>
                          <span class="font-bold text-blue-700">{{ fmt(resultat.statut.caAnnuel - resultat.statut.depenses) }} €</span>
                        </div>
                      } @else {
                        @for (ligne of resultat.statut.details.slice(0, 3); track ligne.label) {
                          <div class="flex justify-between">
                            <span class="text-slate-600">{{ ligne.label }}</span>
                            <span class="font-semibold" [class.text-orange-600]="ligne.montant < 0">{{ fmt(ligne.montant) }} €</span>
                          </div>
                        }
                      }
                      <div class="flex justify-between">
                        <span class="text-slate-600">Cotisations sociales</span>
                        <span class="font-semibold text-orange-600">{{ fmtPrelevement(resultat.statut.cotisations) }} €</span>
                      </div>
                      @if (resultat.statut.impotSociete > 0) {
                        <div class="flex justify-between">
                          <span class="text-slate-600">Impôt sur les sociétés</span>
                          <span class="font-semibold text-orange-600">-{{ fmt(resultat.statut.impotSociete) }} €</span>
                        </div>
                      }
                      @if (resultat.statut.dividendesBruts > 0) {
                        <div class="flex justify-between">
                          <span class="text-slate-600">Dividendes nets de PS</span>
                          <span class="font-semibold">{{ fmt(resultat.statut.dividendesNets) }} €</span>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Impôt du foyer -->
                  <div class="ui-card">
                    <div class="ui-card-header">
                      <span class="ui-card-title !text-sm font-semibold flex items-center gap-2">
                        <lucide-icon [img]="ic.Landmark" class="w-4 h-4 text-slate-500" />
                        Impôt sur le revenu du foyer
                      </span>
                    </div>
                    <div class="ui-card-content space-y-3 text-sm">
                      <div class="flex justify-between">
                        <span class="text-slate-600">Situation</span>
                        <span class="font-semibold">
                          {{ marie ? 'Couple' : 'Célibataire' }}{{ enfants > 0 ? ' · ' + enfants + ' enfant' + (enfants > 1 ? 's' : '') : '' }}
                        </span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-600">Parts fiscales</span>
                        <span class="font-semibold">{{ resultat.parts.toLocaleString('fr-FR') }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-600">Revenu imposable</span>
                        <span class="font-semibold">{{ fmt(resultat.revenuImposableFoyer) }} €</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-600">Impôt au barème</span>
                        <span class="font-semibold text-orange-600">{{ fmtPrelevement(resultat.impotBareme) }} €</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-600">Flat tax & versement libératoire</span>
                        <span class="font-semibold text-orange-600">{{ fmtPrelevement(resultat.impotForfaitaire) }} €</span>
                      </div>
                      <div class="flex justify-between border-t pt-2">
                        <span class="font-semibold text-slate-800">Revenu du foyer après impôt</span>
                        <span class="font-bold text-emerald-600">{{ fmt(resultat.netFoyerApresImpot) }} €/an</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Détail complet -->
                <div class="ui-card">
                  <div class="ui-card-header">
                    <span class="ui-card-title !text-sm font-semibold">Détail du calcul</span>
                  </div>
                  <div class="ui-card-content space-y-2 text-sm">
                    @for (ligne of resultat.statut.details; track ligne.label) {
                      <div class="flex justify-between" [class.font-semibold]="ligne.emphase">
                        <span class="text-slate-600" [class.text-slate-900]="ligne.emphase">{{ ligne.label }}</span>
                        <span [class]="ligne.montant < 0 ? 'text-orange-600' : 'text-slate-800'">{{ fmt(ligne.montant) }} €</span>
                      </div>
                    }
                    <div class="flex justify-between border-t pt-2">
                      <span class="text-slate-600">Quote-part d'impôt sur le revenu</span>
                      <span class="text-orange-600">{{ fmtPrelevement(resultat.statut.netAvantImpot - resultat.netDeclarantApresImpot) }} €</span>
                    </div>
                    <div class="flex justify-between font-bold">
                      <span class="text-slate-900">Net après impôt</span>
                      <span class="text-emerald-600">{{ fmt(resultat.netDeclarantApresImpot) }} €</span>
                    </div>
                  </div>
                </div>

                <!-- Droits sociaux -->
                <div class="ui-card">
                  <div class="ui-card-header">
                    <span class="ui-card-title !text-sm font-semibold">Droits acquis avec les cotisations</span>
                  </div>
                  <div class="ui-card-content flex flex-wrap gap-2">
                    <span class="ui-badge px-2.5 py-1 text-xs font-medium" [class]="badge(resultat.statut.droits.trimestresRetraite > 0)">
                      <lucide-icon [img]="ic.PiggyBank" class="w-3 h-3 mr-1" />
                      Retraite : {{ resultat.statut.droits.trimestresRetraite }} trimestre{{ resultat.statut.droits.trimestresRetraite > 1 ? 's' : '' }}/an
                    </span>
                    <span class="ui-badge px-2.5 py-1 text-xs font-medium" [class]="badge(resultat.statut.droits.retraiteComplementaire !== 'Aucune ou faible')">
                      <lucide-icon [img]="ic.Briefcase" class="w-3 h-3 mr-1" />
                      Complémentaire : {{ resultat.statut.droits.retraiteComplementaire }}
                    </span>
                    <span class="ui-badge px-2.5 py-1 text-xs font-medium" [class]="badge(resultat.statut.droits.chomage)">
                      <lucide-icon [img]="resultat.statut.droits.chomage ? ic.ShieldCheck : ic.ShieldOff" class="w-3 h-3 mr-1" />
                      {{ resultat.statut.droits.chomage ? 'Assurance chômage' : 'Pas de chômage' }}
                    </span>
                    <span class="ui-badge px-2.5 py-1 text-xs font-medium" [class]="badge(resultat.statut.droits.indemnitesJournalieres === 'Complètes')">
                      <lucide-icon [img]="ic.HeartPulse" class="w-3 h-3 mr-1" />
                      IJ maladie : {{ resultat.statut.droits.indemnitesJournalieres }}
                    </span>
                  </div>
                </div>
              }

              <div class="flex flex-wrap gap-3">
                <button (click)="step = 2" class="ui-btn ui-btn-outline">
                  <lucide-icon [img]="ic.ArrowLeft" class="mr-2 w-4 h-4" />
                  Modifier
                </button>
                <button (click)="recommencer()" class="ui-btn ui-btn-outline">
                  <lucide-icon [img]="ic.RotateCcw" class="mr-2 w-4 h-4" />
                  Recommencer
                </button>
                <button (click)="sauvegarder()" [disabled]="saving" class="ui-btn flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  <lucide-icon [img]="ic.Save" class="w-4 h-4 mr-2" />
                  {{ saving ? 'Sauvegarde…' : 'Sauvegarder cette simulation' }}
                </button>
              </div>
            </div>
          }
        }
      </div>
    </app-dashboard-layout>
  `,
})
export class AdvancedSimulatorComponent implements OnInit {
  private simulationService = inject(SimulationService);
  private toast = inject(ToastService);
  private fiscal = inject(FiscalEngineService);
  private platformId = inject(PLATFORM_ID);
  protected readonly ic = {
    ArrowLeft, ArrowRight, Baby, Briefcase, Calculator, Check, ChevronDown, Heart,
    HeartPulse, Landmark, Loader2, PiggyBank, RotateCcw, Save, ShieldCheck, ShieldOff, User, Users,
  };

  protected readonly etapes = [
    { n: 1, label: 'Votre foyer' },
    { n: 2, label: 'Votre activité' },
    { n: 3, label: 'Résultats' },
  ];

  protected readonly statuts: ChoixStatut[] = [
    { id: 'micro', label: 'Micro-entreprise', description: 'Cotisations en % du CA' },
    { id: 'eurl', label: 'EURL (IS)', description: 'Gérant TNS, rému + dividendes' },
    { id: 'sasu-is', label: 'SASU (IS)', description: 'Assimilé salarié + dividendes' },
    { id: 'sasu-ir', label: 'SASU (IR)', description: 'Bénéfice imposé à l’IR' },
    { id: 'portage', label: 'Portage salarial', description: 'CDI cadre, commission' },
    { id: 'salarie', label: 'Salarié', description: 'À partir du brut' },
  ];

  protected readonly activites: { id: ActiviteMicro; label: string; abattement: number }[] = [
    { id: 'bnc', label: 'Libérale (BNC)', abattement: 34 },
    { id: 'service-bic', label: 'Services (BIC)', abattement: 50 },
    { id: 'commerce', label: 'Commerciale', abattement: 71 },
  ];

  step = 1;

  // Étape 1 — foyer
  marie = false;
  enfants = 0;

  // Étape 2 — activité
  statut: StatutId = 'micro';
  tjm = 500;
  joursParMois = 18;
  depenses = 0;
  salaireBrut = 45000;
  commissionPortage = 8;
  partRemuneration = 60;
  dividendes: 'pfu' | 'bareme' = 'pfu';
  salairePresident = 0;
  activite: ActiviteMicro = 'bnc';
  acre = false;
  versementLiberatoire = false;

  resultat: FoyerResult | null = null;
  loading = true;
  saving = false;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.fiscal.init().then(() => this.loading = false);
    }
  }

  calculer(): void {
    if (!this.fiscal.ready) return;
    const personne: PersonneInput = {
      statut: this.statut,
      revenu: {
        mode: 'tjm',
        tjm: this.tjm || 0,
        joursParMois: this.joursParMois || 0,
        ca: 0,
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
    const statutResult = this.fiscal.computeStatut(personne);
    this.resultat = this.fiscal.computeFoyer(statutResult, null, {
      marie: this.marie,
      enfants: Math.max(0, Math.round(this.enfants || 0)),
      conjoint: null,
      autresRevenus: 0,
    });
    this.step = 3;
  }

  recommencer(): void {
    this.resultat = null;
    this.step = 1;
  }

  async sauvegarder(): Promise<void> {
    if (!this.resultat) return;
    this.saving = true;
    try {
      await this.simulationService.create({
        name: `${this.resultat.statut.label} — ${new Date().toLocaleDateString('fr-FR')}`,
        tjm: this.statut === 'salarie' ? 0 : this.tjm,
        days_per_month: this.statut === 'salarie' ? 0 : this.joursParMois,
        monthly_expenses: Math.round((this.depenses || 0) / 12),
        family_shares: this.resultat.parts,
        household_income: 0,
        statuses_compared: [this.statut],
        acre: this.acre,
        results: {
          net_annuel: Math.round(this.resultat.netDeclarantApresImpot),
          net_mensuel: Math.round(this.resultat.netDeclarantApresImpot / 12),
          impot_foyer: Math.round(this.resultat.impotTotal),
          net_foyer: Math.round(this.resultat.netFoyerApresImpot),
        },
      });
      this.toast.success('Simulation sauvegardée !');
    } catch {
      this.toast.error('Erreur lors de la sauvegarde');
    }
    this.saving = false;
  }

  fmt(v: number): string {
    return Math.round(v).toLocaleString('fr-FR');
  }

  fmtPrelevement(v: number): string {
    const r = Math.round(v);
    return r > 0 ? `-${r.toLocaleString('fr-FR')}` : '0';
  }

  badge(positif: boolean): string {
    return positif
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
      : 'bg-slate-100 text-slate-500 border border-slate-200';
  }
}
