import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule, Award, Briefcase, ChevronDown, HeartPulse, PiggyBank, ShieldCheck, ShieldOff, TrendingUp, Umbrella } from 'lucide-angular';
import { FoyerResult } from '../../core/fiscal/types';

// Carte résultat d'un statut : net mensuel, prélèvements, droits sociaux, détail dépliable.
@Component({
  selector: 'app-statut-card',
  imports: [LucideAngularModule],
  template: `
    <button
      type="button"
      (click)="select.emit()"
      class="anim-fade-up relative w-full text-left rounded-2xl p-6 border-2 transition-all cursor-pointer"
      [class]="best
        ? 'bg-gradient-to-br from-blue-50 to-emerald-50 border-blue-300 shadow-lg shadow-blue-100/50'
        : selected
          ? 'bg-white border-blue-300 shadow-md'
          : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md'">
      @if (best) {
        <div class="absolute -top-3 left-6">
          <span class="ui-badge bg-gradient-to-r from-blue-600 to-emerald-500 text-white px-3 py-1 text-xs font-semibold shadow-md">
            <lucide-icon [img]="ic.Award" class="w-3 h-3 mr-1" />
            Recommandé
          </span>
        </div>
      }

      <h3 class="font-bold text-lg text-slate-900 mt-1">{{ result.statut.label }}</h3>

      @if (!result.statut.eligible) {
        <p class="mt-3 text-sm text-amber-600">{{ result.statut.raison }}</p>
      } @else {
        <div class="mt-3">
          <span class="text-3xl font-extrabold" [class]="best ? 'text-blue-700' : 'text-slate-900'">
            {{ mensuel(result.netDeclarantApresImpot) }} €
          </span>
          <span class="text-sm text-slate-500"> net/mois après impôt</span>
        </div>

        <div class="mt-4 space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-500">Cotisations sociales</span>
            <span class="font-semibold text-red-500">{{ fmtPrelevement(result.statut.cotisations) }} €/an</span>
          </div>
          @if (result.statut.impotSociete > 0) {
            <div class="flex justify-between">
              <span class="text-slate-500">Impôt sur les sociétés</span>
              <span class="font-semibold text-red-500">-{{ fmt(result.statut.impotSociete) }} €/an</span>
            </div>
          }
          <div class="flex justify-between">
            <span class="text-slate-500">Impôt sur le revenu du foyer</span>
            <span class="font-semibold text-red-500">{{ fmtPrelevement(result.impotTotal) }} €/an</span>
          </div>
          <div class="flex justify-between border-t border-slate-100 pt-2">
            <span class="font-semibold text-slate-700">Revenu du foyer après impôt</span>
            <span class="font-bold text-slate-900">{{ fmt(result.netFoyerApresImpot) }} €/an</span>
          </div>
          <div class="flex items-center gap-2 pt-1">
            <lucide-icon [img]="ic.TrendingUp" class="w-4 h-4 text-emerald-500" />
            <span class="text-xs text-slate-500">Taux de prélèvement global : {{ tauxPrelevement() }}%</span>
          </div>
        </div>

        <!-- Droits sociaux acquis -->
        <div class="mt-4 pt-3 border-t border-slate-100">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Droits acquis avec les cotisations</p>
          <div class="flex flex-wrap gap-2">
            <span class="ui-badge px-2 py-1 text-xs font-medium" [class]="badge(result.statut.droits.trimestresRetraite > 0)">
              <lucide-icon [img]="ic.PiggyBank" class="w-3 h-3 mr-1" />
              Retraite : {{ result.statut.droits.trimestresRetraite }} trimestre{{ result.statut.droits.trimestresRetraite > 1 ? 's' : '' }}/an
            </span>
            <span class="ui-badge px-2 py-1 text-xs font-medium" [class]="badge(result.statut.droits.retraiteComplementaire !== 'Aucune ou faible')">
              <lucide-icon [img]="ic.Briefcase" class="w-3 h-3 mr-1" />
              Complémentaire : {{ result.statut.droits.retraiteComplementaire }}
            </span>
            <span class="ui-badge px-2 py-1 text-xs font-medium" [class]="badge(result.statut.droits.chomage)">
              <lucide-icon [img]="result.statut.droits.chomage ? ic.ShieldCheck : ic.ShieldOff" class="w-3 h-3 mr-1" />
              {{ result.statut.droits.chomage ? 'Assurance chômage' : 'Pas de chômage' }}
            </span>
            <span class="ui-badge px-2 py-1 text-xs font-medium" [class]="badge(result.statut.droits.indemnitesJournalieres === 'Complètes')">
              <lucide-icon [img]="ic.HeartPulse" class="w-3 h-3 mr-1" />
              IJ maladie : {{ result.statut.droits.indemnitesJournalieres }}
            </span>
          </div>
        </div>

        <!-- Détail du calcul -->
        <div class="mt-3">
          <span
            role="button"
            tabindex="0"
            (click)="toggleDetails($event)"
            (keydown.enter)="toggleDetails($event)"
            class="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
            <lucide-icon [img]="ic.ChevronDown" class="w-3.5 h-3.5 transition-transform" [class.rotate-180]="showDetails" />
            {{ showDetails ? 'Masquer le détail' : 'Voir le détail du calcul' }}
          </span>
          @if (showDetails) {
            <div class="mt-2 rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-1.5">
              @for (ligne of result.statut.details; track ligne.label) {
                <div class="flex justify-between text-xs" [class.font-semibold]="ligne.emphase">
                  <span class="text-slate-500" [class.text-slate-800]="ligne.emphase">{{ ligne.label }}</span>
                  <span [class]="ligne.montant < 0 ? 'text-red-500' : 'text-slate-700'">
                    {{ fmt(ligne.montant) }} €
                  </span>
                </div>
              }
              <div class="flex justify-between text-xs border-t border-slate-200 pt-1.5">
                <span class="text-slate-500">Quote-part d'impôt sur le revenu</span>
                <span class="text-red-500">-{{ fmt(irDeclarant()) }} €</span>
              </div>
            </div>
          }
        </div>
      }
    </button>
  `,
})
export class StatutCardComponent {
  @Input({ required: true }) result!: FoyerResult;
  @Input() best = false;
  @Input() selected = false;
  @Output() select = new EventEmitter<void>();

  protected readonly ic = { Award, Briefcase, ChevronDown, HeartPulse, PiggyBank, ShieldCheck, ShieldOff, TrendingUp, Umbrella };
  showDetails = false;

  toggleDetails(event: Event): void {
    event.stopPropagation();
    this.showDetails = !this.showDetails;
  }

  fmt(v: number): string {
    return Math.round(v).toLocaleString('fr-FR');
  }

  /** Formate un prélèvement : "-1 234" si non nul, "0" sinon (évite l'affichage "-0"). */
  fmtPrelevement(v: number): string {
    const r = Math.round(v);
    return r > 0 ? `-${r.toLocaleString('fr-FR')}` : '0';
  }

  mensuel(v: number): string {
    return Math.round(v / 12).toLocaleString('fr-FR');
  }

  irDeclarant(): number {
    return this.result.statut.netAvantImpot - this.result.netDeclarantApresImpot;
  }

  tauxPrelevement(): string {
    const ca = this.result.statut.caAnnuel;
    if (ca <= 0) return '0';
    return (100 * (1 - this.result.netDeclarantApresImpot / ca)).toFixed(1);
  }

  badge(positif: boolean): string {
    return positif
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
      : 'bg-slate-100 text-slate-500 border border-slate-200';
  }
}
