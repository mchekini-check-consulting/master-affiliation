import { Component, inject } from '@angular/core';
import { LucideAngularModule, ArrowRight, CheckCircle, Sparkles } from 'lucide-angular';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-hero-section',
  imports: [LucideAngularModule],
  template: `
    <section class="relative min-h-[90vh] flex items-center overflow-hidden bg-white">
      <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-blue-100/60 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-100/40 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="max-w-4xl mx-auto text-center">
          <div class="anim-fade-up">
            <div class="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 mb-8 shadow-sm">
              <lucide-icon [img]="ic.Sparkles" class="w-4 h-4 text-emerald-500" />
              <span class="text-sm font-medium text-blue-900">La plateforme #1 des freelances IT en France</span>
            </div>
          </div>

          <h1
            class="anim-fade-up text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]"
            style="animation-delay: 0.1s">
            Tout ce dont vous avez besoin pour
            <span class="bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 bg-clip-text text-transparent">
              réussir en freelance IT
            </span>
            — gratuitement.
          </h1>

          <p
            class="anim-fade-up mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
            style="animation-delay: 0.2s">
            Simulateurs, communauté, missions, accompagnement, bons plans — la plateforme tout-en-un créée par des indépendants, pour des indépendants.
          </p>

          <div
            class="anim-fade-up mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            style="animation-delay: 0.3s">
            <button
              (click)="handleSignup()"
              class="ui-btn ui-btn-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 group">
              Créer mon espace gratuit
              <lucide-icon [img]="ic.ArrowRight" class="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              (click)="scrollToServices()"
              class="ui-btn ui-btn-lg ui-btn-outline px-8 py-6 text-lg rounded-xl border-slate-200 hover:bg-slate-50">
              Découvrir nos services
            </button>
          </div>

          <div
            class="anim-fade-in mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-600"
            style="animation-delay: 0.5s">
            @for (item of checks; track item) {
              <span class="flex items-center gap-1.5">
                <lucide-icon [img]="ic.CheckCircle" class="w-4 h-4 text-emerald-500" />
                {{ item }}
              </span>
            }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class HeroSectionComponent {
  private auth = inject(AuthService);
  protected readonly ic = { ArrowRight, CheckCircle, Sparkles };
  protected readonly checks = ['100% gratuit', 'Sans engagement', 'Accès immédiat'];

  handleSignup(): void {
    this.auth.redirectToLogin('/Onboarding');
  }

  scrollToServices(): void {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  }
}
