import { Component, inject } from '@angular/core';
import { LucideAngularModule, ArrowRight, Rocket } from 'lucide-angular';
import { AuthService } from '../core/auth.service';
import { InViewDirective } from '../core/in-view.directive';

@Component({
  selector: 'app-cta-banner',
  imports: [LucideAngularModule, InViewDirective],
  template: `
    <section class="py-20 bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-600 relative overflow-hidden">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMzYgMzRoLTJWMGgydjM0em0tNCAwVjBoLTJ2MzRoMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div appInView>
          <lucide-icon [img]="ic.Rocket" class="w-10 h-10 text-white/80 mx-auto mb-6" />
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            Créez votre espace gratuit et débloquez tout
          </h2>
          <p class="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Simulateur intelligent, communauté, bons plans exclusifs, missions et bien plus encore.
          </p>
          <button
            (click)="handleSignup()"
            class="ui-btn ui-btn-lg bg-white text-blue-700 hover:bg-blue-50 px-8 py-6 text-lg rounded-xl shadow-xl group font-semibold">
            Commencer gratuitement
            <lucide-icon [img]="ic.ArrowRight" class="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  `,
})
export class CtaBannerComponent {
  private auth = inject(AuthService);
  protected readonly ic = { ArrowRight, Rocket };

  handleSignup(): void {
    this.auth.redirectToLogin('/Onboarding');
  }
}
