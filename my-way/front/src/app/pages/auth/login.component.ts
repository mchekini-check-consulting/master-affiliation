import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Zap, LogIn } from 'lucide-angular';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-4">
      <div class="w-full max-w-md anim-fade-up">
        <div class="text-center mb-8">
          <a routerLink="/Home" class="inline-flex items-center gap-2.5">
            <div class="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <lucide-icon [img]="ic.Zap" class="w-6 h-6 text-white" />
            </div>
            <span class="text-2xl font-bold text-slate-900">IndepBoost</span>
          </a>
        </div>

        <div class="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8">
          <h1 class="text-xl font-bold text-slate-900 mb-1">Connexion</h1>
          <p class="text-sm text-slate-500 mb-6">Heureux de vous revoir !</p>

          <form (ngSubmit)="submit()" class="space-y-4">
            <div>
              <label class="ui-label text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email" name="email" required autocomplete="email"
                [(ngModel)]="email" class="ui-input mt-1.5" placeholder="vous@exemple.fr" />
            </div>
            <div>
              <label class="ui-label text-sm font-semibold text-slate-700">Mot de passe</label>
              <input
                type="password" name="password" required autocomplete="current-password"
                [(ngModel)]="password" class="ui-input mt-1.5" placeholder="••••••••" />
            </div>

            @if (error) {
              <p class="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{{ error }}</p>
            }

            <button
              type="submit"
              [disabled]="loading || !email || !password"
              class="ui-btn w-full bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white py-5 rounded-xl">
              @if (loading) {
                <span class="flex items-center gap-2">
                  <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Connexion...
                </span>
              } @else {
                <span class="flex items-center gap-2">
                  <lucide-icon [img]="ic.LogIn" class="w-4 h-4" />
                  Se connecter
                </span>
              }
            </button>
          </form>

          <div class="flex items-center gap-3 my-6">
            <div class="h-px flex-1 bg-slate-200"></div>
            <span class="text-xs text-slate-400 uppercase">ou</span>
            <div class="h-px flex-1 bg-slate-200"></div>
          </div>

          <!-- Connexion Google (bientôt active) -->
          <button
            type="button"
            (click)="googleSoon()"
            class="ui-btn ui-btn-outline w-full py-5 rounded-xl font-medium">
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Se connecter avec Google
          </button>

          <p class="text-sm text-slate-500 text-center mt-6">
            Pas encore de compte ?
            <a routerLink="/Register" [queryParams]="fromParams" class="font-semibold text-blue-600 hover:text-blue-700">
              Créer mon espace gratuit
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  protected readonly ic = { Zap, LogIn };

  email = '';
  password = '';
  loading = false;
  error = '';

  get fromParams(): Record<string, string> | null {
    const from = this.route.snapshot.queryParamMap.get('from');
    return from ? { from } : null;
  }

  async submit(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      const user = await this.auth.login(this.email, this.password);
      const from = this.route.snapshot.queryParamMap.get('from');
      if (from) {
        this.router.navigateByUrl(from);
      } else {
        this.router.navigateByUrl(user.onboarding_completed ? '/Dashboard' : '/Onboarding');
      }
    } catch {
      this.error = 'Email ou mot de passe incorrect.';
    } finally {
      this.loading = false;
    }
  }

  googleSoon(): void {
    this.toast.success('La connexion Google arrive bientôt !');
  }
}
