import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, ArrowRight, ArrowLeft, CheckCircle2, User as UserIcon, Briefcase, Target, Zap } from 'lucide-angular';
import { AuthService } from '../../core/auth.service';
import { User } from '../../core/models';
import { SliderComponent } from '../../shared/slider.component';

@Component({
  selector: 'app-onboarding',
  imports: [FormsModule, LucideAngularModule, SliderComponent],
  template: `
    @if (!user) {
      <div class="min-h-screen flex items-center justify-center bg-slate-50">
        <div class="w-8 h-8 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    } @else {
      <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-4">
        <div class="w-full max-w-xl">
          <!-- Progress -->
          <div class="flex items-center justify-center gap-2 mb-8">
            @for (s of [1, 2, 3]; track s; let last = $last) {
              <div class="flex items-center gap-2">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                  [class]="step >= s
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-400'">
                  @if (step > s) {
                    <lucide-icon [img]="ic.CheckCircle2" class="w-5 h-5" />
                  } @else {
                    {{ s }}
                  }
                </div>
                @if (!last) {
                  <div class="w-12 sm:w-20 h-1 rounded-full transition-all" [class]="step > s ? 'bg-blue-500' : 'bg-slate-200'"></div>
                }
              </div>
            }
          </div>

          <div class="anim-slide-x bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8">
            <!-- Step 1: Profil -->
            @if (step === 1) {
              <div>
                <div class="flex items-center gap-3 mb-6">
                  <div class="p-2.5 bg-blue-50 rounded-xl">
                    <lucide-icon [img]="ic.UserIcon" class="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 class="text-xl font-bold text-slate-900">Votre profil</h2>
                    <p class="text-sm text-slate-500">Bienvenue {{ firstName }} ! Parlez-nous de vous.</p>
                  </div>
                </div>

                <div class="space-y-5">
                  <div>
                    <label class="ui-label text-sm font-semibold text-slate-700">Ville</label>
                    <input class="ui-input mt-1.5" [(ngModel)]="data.city" placeholder="Paris, Lyon, Marseille..." />
                  </div>
                  <div>
                    <label class="ui-label text-sm font-semibold text-slate-700 mb-3 block">Spécialité(s) IT</label>
                    <div class="flex flex-wrap gap-2">
                      @for (spec of specialties; track spec) {
                        <span
                          class="ui-badge cursor-pointer py-1.5 px-3 transition-all"
                          [class]="data.specialties.includes(spec)
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'ui-badge-outline hover:bg-slate-50 text-slate-600'"
                          (click)="toggleSpecialty(spec)">
                          {{ spec }}
                        </span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- Step 2: Situation -->
            @if (step === 2) {
              <div>
                <div class="flex items-center gap-3 mb-6">
                  <div class="p-2.5 bg-emerald-50 rounded-xl">
                    <lucide-icon [img]="ic.Briefcase" class="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 class="text-xl font-bold text-slate-900">Votre situation</h2>
                    <p class="text-sm text-slate-500">Ces infos alimenteront le simulateur.</p>
                  </div>
                </div>

                <div class="space-y-5">
                  <div>
                    <label class="ui-label text-sm font-semibold text-slate-700">Statut actuel</label>
                    <select class="ui-input ui-select mt-1.5" [(ngModel)]="data.current_status">
                      <option value="" disabled>Choisir...</option>
                      <option value="salarie">Salarié souhaitant se lancer</option>
                      <option value="independant">Déjà indépendant</option>
                      <option value="portage">En portage salarial</option>
                      <option value="demandeur_emploi">Demandeur d'emploi</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label class="ui-label text-sm font-semibold text-slate-700">TJM souhaité : {{ data.desired_tjm }}€/j</label>
                    <app-slider class="block mt-3" [min]="200" [max]="1500" [step]="10" [value]="data.desired_tjm" (valueChange)="data.desired_tjm = $event" />
                    <div class="flex justify-between text-xs text-slate-400 mt-1">
                      <span>200€</span><span>1 500€</span>
                    </div>
                  </div>

                  <div>
                    <label class="ui-label text-sm font-semibold text-slate-700">Jours travaillés par mois : {{ data.days_per_month }}j</label>
                    <app-slider class="block mt-3" [min]="5" [max]="22" [step]="1" [value]="data.days_per_month" (valueChange)="data.days_per_month = $event" />
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="ui-label text-sm font-semibold text-slate-700">Parts fiscales</label>
                      <input type="number" step="0.5" class="ui-input mt-1.5" [(ngModel)]="data.family_shares" />
                    </div>
                    <div>
                      <label class="ui-label text-sm font-semibold text-slate-700">Revenus du foyer (€/an)</label>
                      <input type="number" class="ui-input mt-1.5" [(ngModel)]="data.household_income" />
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- Step 3: Objectifs -->
            @if (step === 3) {
              <div>
                <div class="flex items-center gap-3 mb-6">
                  <div class="p-2.5 bg-amber-50 rounded-xl">
                    <lucide-icon [img]="ic.Target" class="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 class="text-xl font-bold text-slate-900">Vos objectifs</h2>
                    <p class="text-sm text-slate-500">Que cherchez-vous sur IndepBoost ?</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  @for (goal of goals; track goal.id) {
                    <button
                      (click)="toggleGoal(goal.id)"
                      class="p-4 rounded-xl border-2 text-left transition-all"
                      [class]="data.goals.includes(goal.id)
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-slate-100 hover:border-slate-200 bg-white'">
                      <span class="text-2xl mb-2 block">{{ goal.icon }}</span>
                      <span class="text-sm font-semibold" [class]="data.goals.includes(goal.id) ? 'text-blue-700' : 'text-slate-700'">
                        {{ goal.label }}
                      </span>
                    </button>
                  }
                </div>
              </div>
            }

            <!-- Navigation -->
            <div class="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              @if (step > 1) {
                <button class="ui-btn ui-btn-ghost" (click)="step = step - 1">
                  <lucide-icon [img]="ic.ArrowLeft" class="w-4 h-4 mr-2" />
                  Retour
                </button>
              } @else {
                <div></div>
              }

              @if (step < 3) {
                <button
                  (click)="step = step + 1"
                  class="ui-btn bg-gradient-to-r from-blue-700 to-blue-600 text-white group">
                  Continuer
                  <lucide-icon [img]="ic.ArrowRight" class="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              } @else {
                <button
                  (click)="handleFinish()"
                  [disabled]="saving"
                  class="ui-btn bg-gradient-to-r from-blue-700 to-emerald-600 text-white group">
                  @if (saving) {
                    <span class="flex items-center gap-2">
                      <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Finalisation...
                    </span>
                  } @else {
                    <lucide-icon [img]="ic.Zap" class="w-4 h-4 mr-2" />
                    Accéder à mon espace
                  }
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class OnboardingComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  protected readonly ic = { ArrowRight, ArrowLeft, CheckCircle2, UserIcon, Briefcase, Target, Zap };

  step = 1;
  user: User | null = null;
  saving = false;

  data = {
    city: '',
    specialties: [] as string[],
    current_status: '',
    desired_tjm: 500,
    days_per_month: 18,
    family_shares: 1,
    household_income: 0,
    goals: [] as string[],
  };

  protected readonly specialties = [
    'Dev Backend', 'Dev Frontend', 'Dev Full-Stack', 'DevOps', 'Data Engineer',
    'Data Scientist', 'Product Manager', 'UX/UI Designer', 'Infra/Cloud',
    'Cybersécurité', 'Architecte', 'Scrum Master', 'QA/Test', 'Autre',
  ];

  protected readonly goals = [
    { id: 'simulate', label: 'Simuler mes revenus', icon: '📊' },
    { id: 'missions', label: 'Trouver des missions', icon: '🎯' },
    { id: 'community', label: 'Rejoindre la communauté', icon: '👥' },
    { id: 'deals', label: 'Bons plans outils', icon: '🏷️' },
    { id: 'coaching', label: 'Accompagnement', icon: '🚀' },
    { id: 'all', label: "Tout m'intéresse", icon: '✨' },
  ];

  ngOnInit(): void {
    this.auth.me().then((u) => {
      this.user = u;
      if (u.onboarding_completed) {
        this.router.navigateByUrl('/Dashboard');
      }
    }).catch(() => {
      this.auth.redirectToLogin('/Onboarding');
    });
  }

  get firstName(): string {
    return this.user?.full_name?.split(' ')[0] ?? '';
  }

  toggleSpecialty(spec: string): void {
    this.data.specialties = this.data.specialties.includes(spec)
      ? this.data.specialties.filter(s => s !== spec)
      : [...this.data.specialties, spec];
  }

  toggleGoal(goalId: string): void {
    this.data.goals = this.data.goals.includes(goalId)
      ? this.data.goals.filter(g => g !== goalId)
      : [...this.data.goals, goalId];
  }

  async handleFinish(): Promise<void> {
    this.saving = true;
    await this.auth.updateMe({ ...this.data, onboarding_completed: true });
    this.router.navigateByUrl('/Dashboard');
  }
}
