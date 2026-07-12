import { Component, HostListener, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Zap, Menu, X, ArrowRight } from 'lucide-angular';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, LucideAngularModule],
  template: `
    <nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      [class]="scrolled ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200' : 'bg-transparent'">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <a routerLink="/Home" class="flex items-center gap-2.5">
            <div class="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <lucide-icon [img]="ic.Zap" class="w-5 h-5 text-white" />
            </div>
            <span class="text-xl font-bold text-slate-900">IndepBoost</span>
          </a>

          <!-- Desktop nav -->
          <div class="hidden md:flex items-center gap-6">
            <a routerLink="/Simulator" class="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">
              Simulateur
            </a>
            <a routerLink="/Contact" class="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">
              Contact
            </a>

            @if (isAuth) {
              <a routerLink="/Dashboard">
                <button class="ui-btn ui-btn-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                  Mon espace
                </button>
              </a>
            } @else {
              <div class="flex items-center gap-3">
                <button (click)="handleLogin()" class="ui-btn ui-btn-sm ui-btn-ghost text-slate-700 hover:text-blue-600">
                  Connexion
                </button>
                <button
                  (click)="handleSignup()"
                  class="ui-btn ui-btn-sm bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg shadow-lg shadow-emerald-500/30 group">
                  S'inscrire gratuitement
                  <lucide-icon [img]="ic.ArrowRight" class="ml-1 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            }
          </div>

          <!-- Mobile toggle -->
          <button class="md:hidden p-2 text-slate-900" (click)="mobileOpen = !mobileOpen">
            @if (mobileOpen) {
              <lucide-icon [img]="ic.X" class="w-6 h-6" />
            } @else {
              <lucide-icon [img]="ic.Menu" class="w-6 h-6" />
            }
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      @if (mobileOpen) {
        <div class="md:hidden bg-white border-t border-slate-200 shadow-lg">
          <div class="px-4 py-4 space-y-3">
            <a routerLink="/Simulator" class="block py-2 text-sm font-medium text-slate-700" (click)="mobileOpen = false">
              Simulateur
            </a>
            <a routerLink="/Contact" class="block py-2 text-sm font-medium text-slate-700" (click)="mobileOpen = false">
              Contact
            </a>
            @if (isAuth) {
              <a routerLink="/Dashboard" (click)="mobileOpen = false">
                <button class="ui-btn w-full bg-blue-600 hover:bg-blue-700 text-white">Mon espace</button>
              </a>
            } @else {
              <div class="space-y-2 pt-2 border-t border-slate-200">
                <button class="ui-btn ui-btn-outline w-full" (click)="handleLogin()">Connexion</button>
                <button class="ui-btn w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white" (click)="handleSignup()">
                  S'inscrire gratuitement
                </button>
              </div>
            }
          </div>
        </div>
      }
    </nav>
  `,
})
export class NavbarComponent implements OnInit {
  private auth = inject(AuthService);
  protected readonly ic = { Zap, Menu, X, ArrowRight };

  scrolled = false;
  mobileOpen = false;
  isAuth = false;

  ngOnInit(): void {
    this.auth.isAuthenticated().then(v => this.isAuth = v);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 20;
  }

  handleLogin(): void {
    this.auth.redirectToLogin();
  }

  handleSignup(): void {
    this.auth.redirectToLogin('/Onboarding');
  }
}
