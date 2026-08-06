import { Component, computed, inject, signal } from '@angular/core';
import { Annonce, AnnoncesService } from './annonces.service';

const TYPES = ['Tout', 'Appartement', 'Maison', 'Local commercial', 'Parking'] as const;

const LIBELLES: Record<string, string> = {
  Tout: 'Tout',
  Appartement: 'Appartements',
  Maison: 'Maisons',
  'Local commercial': 'Locaux commerciaux',
  Parking: 'Parkings',
};

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly service = inject(AnnoncesService);

  protected readonly types = TYPES;
  protected readonly libelles = LIBELLES;

  protected readonly annonces = signal<Annonce[]>([]);
  protected readonly chargement = signal(true);
  protected readonly erreur = signal(false);
  protected readonly filtreType = signal<string>('Tout');
  protected readonly libreUniquement = signal(false);

  /** Annonces visibles selon les filtres actifs. */
  protected readonly visibles = computed(() =>
    this.annonces().filter(
      (a) =>
        (this.filtreType() === 'Tout' || a.type === this.filtreType()) &&
        (!this.libreUniquement() || a.statut === 'Libre')
    )
  );

  protected readonly prixMoyen = computed(() => this.moyenne((a) => a.prix));
  protected readonly prixM2Moyen = computed(() => this.moyenne((a) => a.prix_m2));
  protected readonly nbLibres = computed(
    () => this.visibles().filter((a) => a.statut === 'Libre').length
  );

  constructor() {
    this.service.lister().subscribe({
      next: (annonces) => {
        this.annonces.set(annonces);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set(true);
        this.chargement.set(false);
      },
    });
  }

  private moyenne(champ: (a: Annonce) => number): number {
    const liste = this.visibles();
    if (!liste.length) return 0;
    return Math.round(liste.reduce((somme, a) => somme + champ(a), 0) / liste.length);
  }

  protected choisirType(type: string): void {
    this.filtreType.set(type);
  }

  protected basculerLibre(): void {
    this.libreUniquement.update((v) => !v);
  }

  protected euros(valeur: number): string {
    return valeur.toLocaleString('fr-FR') + ' €';
  }

  protected surface(valeur: number): string {
    return valeur.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' m²';
  }

  /** "2026-08-12T10:30:00" → "12/08 · 10h30" */
  protected dateAudience(iso: string): string {
    const d = new Date(iso);
    const jour = String(d.getDate()).padStart(2, '0');
    const mois = String(d.getMonth() + 1).padStart(2, '0');
    const heures = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${jour}/${mois} · ${heures}h${minutes}`;
  }

  protected classeStatut(statut: string): string {
    return { Libre: 'statut--libre', 'Occupé': 'statut--occupe', 'Loué': 'statut--loue' }[statut] ?? '';
  }
}
