import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideAngularModule, Zap, Calculator, Users, Briefcase, Tag, BookOpen, Rocket,
  Settings, LogOut, Menu, X, Home, ChevronRight, FileText, LucideIconData,
} from 'lucide-angular';
import { AuthService } from '../../core/auth.service';
import { User } from '../../core/models';

interface MenuItem { icon: LucideIconData; label: string; path: string | null; soon?: boolean; }

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterLink, LucideAngularModule],
  template: `
    @if (!user) {
      <div class="min-h-screen flex items-center justify-center bg-slate-50">
        <div class="w-8 h-8 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    } @else {
      <div class="min-h-screen bg-slate-50">
        <!-- Mobile Header -->
        <header class="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200">
          <div class="flex items-center justify-between h-16 px-4">
            <button (click)="mobileOpen = !mobileOpen" class="p-2">
              @if (mobileOpen) {
                <lucide-icon [img]="ic.X" class="w-6 h-6" />
              } @else {
                <lucide-icon [img]="ic.Menu" class="w-6 h-6" />
              }
            </button>
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-lg flex items-center justify-center">
                <lucide-icon [img]="ic.Zap" class="w-4 h-4 text-white" />
              </div>
              <span class="font-bold text-slate-900">freelance-now</span>
            </div>
            <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
              {{ initials }}
            </div>
          </div>
        </header>

        <!-- Mobile Sidebar Overlay -->
        @if (mobileOpen) {
          <div class="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" (click)="mobileOpen = false"></div>
        }

        <!-- Barre supérieure desktop : profil connecté en haut à droite -->
        <header class="hidden lg:flex fixed top-0 left-72 right-0 z-30 h-16 bg-white border-b border-slate-200 items-center justify-end px-6">
          <div class="flex items-center gap-3">
            <div class="text-right min-w-0">
              <p class="text-sm font-semibold text-slate-900 truncate">{{ user.full_name }}</p>
              <p class="text-xs text-slate-500 truncate">
                {{ user.specialties?.length ? user.specialties![0] : 'Freelance IT' }}
              </p>
            </div>
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-400 text-white font-bold flex items-center justify-center">
              {{ initials }}
            </div>
          </div>
        </header>

        <!-- Sidebar -->
        <aside
          class="fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-200 z-50 transition-transform duration-300"
          [class]="mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'">
          <div class="flex flex-col h-full">
            <!-- Logo -->
            <div class="h-16 flex items-center justify-between px-6 border-b border-slate-200">
              <a routerLink="/Home" class="flex items-center gap-2.5">
                <div class="w-9 h-9 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-lg flex items-center justify-center">
                  <lucide-icon [img]="ic.Zap" class="w-5 h-5 text-white" />
                </div>
                <span class="text-lg font-bold text-slate-900">freelance-now</span>
              </a>
            </div>

            <!-- Navigation -->
            <nav class="flex-1 overflow-y-auto py-4 px-3">
              <div class="space-y-1">
                @for (item of menuItems; track item.label) {
                  @if (!item.path) {
                    <div class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 cursor-not-allowed">
                      <lucide-icon [img]="item.icon" class="w-5 h-5" />
                      <span class="text-sm font-medium flex-1">{{ item.label }}</span>
                      @if (item.soon) {
                        <span class="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Bientôt</span>
                      }
                    </div>
                  } @else {
                    <a
                      [routerLink]="item.path"
                      (click)="mobileOpen = false"
                      class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
                      [class]="isActive(item.path)
                        ? 'bg-gradient-to-r from-blue-50 to-emerald-50 text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50'">
                      <lucide-icon [img]="item.icon" class="w-5 h-5" />
                      <span class="text-sm font-medium flex-1">{{ item.label }}</span>
                      @if (isActive(item.path)) {
                        <lucide-icon [img]="ic.ChevronRight" class="w-4 h-4" />
                      }
                    </a>
                  }
                }
              </div>
            </nav>

            <!-- Footer Actions -->
            <div class="p-3 border-t border-slate-200 space-y-1">
              <button class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                <lucide-icon [img]="ic.Settings" class="w-5 h-5" />
                <span class="text-sm font-medium">Paramètres</span>
              </button>
              <button
                (click)="logout()"
                class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors">
                <lucide-icon [img]="ic.LogOut" class="w-5 h-5" />
                <span class="text-sm font-medium">Déconnexion</span>
              </button>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="lg:pl-72 pt-16">
          <div class="min-h-screen">
            <ng-content />
          </div>
        </main>
      </div>
    }
  `,
})
export class DashboardLayoutComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  protected readonly ic = { Zap, Menu, X, Settings, LogOut, ChevronRight };

  user: User | null = null;
  mobileOpen = false;

  protected readonly menuItems: MenuItem[] = [
    { icon: Home, label: 'Accueil', path: '/Dashboard' },
    { icon: Calculator, label: 'Simulateur Avancé', path: '/AdvancedSimulator' },
    { icon: FileText, label: 'Mes Simulations', path: '/MySimulations' },
    { icon: Users, label: 'Communauté', path: '/Community' },
    { icon: Briefcase, label: 'Missions', path: '/Missions' },
    { icon: Tag, label: 'Bons Plans', path: '/Deals' },
    { icon: BookOpen, label: 'Documents', path: '/Documents' },
    { icon: Rocket, label: 'Accompagnement', path: null, soon: true },
  ];

  ngOnInit(): void {
    this.auth.me().then((u) => {
      this.user = u;
      if (!u.onboarding_completed) {
        this.router.navigateByUrl('/Onboarding');
      }
    }).catch(() => {
      this.auth.redirectToLogin(window.location.pathname);
    });
  }

  get initials(): string {
    return this.user?.full_name
      ? this.user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
      : 'U';
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  logout(): void {
    this.auth.logout();
  }
}
