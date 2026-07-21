import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { NAV, NavGroup } from '../core/navigation';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-back-office-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './back-office-layout.component.html',
  styleUrl: './back-office-layout.component.scss',
})
export class BackOfficeLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly session = this.auth.session;
  readonly menuOuvert = signal(false); // sidebar mobile

  /** Nav filtrée par les permissions RBAC : un module non autorisé disparaît. */
  readonly nav = computed<NavGroup[]>(() => {
    this.session(); // dépendance : recalcul quand la session change
    return NAV
      .map((groupe) => ({
        ...groupe,
        items: groupe.items.filter((item) => !item.module || this.auth.peut(item.module, 'VOIR')),
      }))
      .filter((groupe) => groupe.items.length > 0);
  });

  /** Nom affiché : « Prénom Nom » ou, à défaut, l'e-mail. */
  readonly nomAffiche = computed(() => {
    const u = this.session()?.user;
    if (!u) return '';
    const complet = `${u.first_name} ${u.last_name}`.trim();
    return complet || u.email;
  });

  basculerMenu(): void {
    this.menuOuvert.update((v) => !v);
  }

  deconnexion(): void {
    this.auth.deconnexion().subscribe({
      next: () => this.router.navigate(['/connexion']),
      error: () => this.router.navigate(['/connexion']),
    });
  }
}
