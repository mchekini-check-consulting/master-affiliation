import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { NAV } from '../core/navigation';
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

  readonly nav = NAV;
  readonly menuOuvert = signal(false); // sidebar mobile

  basculerMenu(): void {
    this.menuOuvert.update((v) => !v);
  }

  deconnexion(): void {
    this.auth.deconnexion();
    this.router.navigate(['/connexion']);
  }
}
