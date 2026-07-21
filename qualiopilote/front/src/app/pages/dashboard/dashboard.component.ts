import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { NAV_ITEMS, NavItem } from '../../core/navigation';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  // Raccourcis vers les modules (toutes rubriques hors tableau de bord)
  readonly raccourcis: NavItem[] = NAV_ITEMS.filter((i) => i.path !== '');
}
