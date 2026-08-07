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

  // --- Simulation d'acquisition (règles du fichier Plus-value.xlsx, partie revente) ---
  protected readonly simulation = signal<Annonce | null>(null);
  protected readonly detailEmoluments = signal(false);
  protected readonly simRevente = signal(0);
  protected readonly simTravaux = signal(0);
  protected readonly simAdjudication = signal(0);
  protected readonly simFraisPrealables = signal(11_000);
  protected readonly simHonoraires = signal(1_800);
  protected readonly simDivers = signal(120);

  /** Émoluments HT de la tranche > 30 000 € : (adjudication − 30 000) × 1,65 %. */
  protected readonly emolTranche4Ht = computed(
    () => (this.simAdjudication() - 30_000) * 0.0165
  );

  /** Sous-total des émoluments TTC : tranches fixes (520 + 346,5 + 286 HT) + tranche 4, × 1,2. */
  protected readonly emolumentsTtc = computed(
    () => (520 + 346.5 + 286 + this.emolTranche4Ht()) * 1.2
  );

  /** Droit d'enregistrement : 5,80 % TTC de l'adjudication. */
  protected readonly droitEnregistrement = computed(() => this.simAdjudication() * 0.058);

  /** Frais de publication : 0,10 % TTC + 270 €. */
  protected readonly fraisPublication = computed(() => this.simAdjudication() * 0.001 + 270);

  /** Honoraires & taxes de la barre de répartition : avocat + divers + émoluments + enregistrement + publication. */
  protected readonly honorairesTaxes = computed(
    () =>
      this.simHonoraires() +
      this.simDivers() +
      this.emolumentsTtc() +
      this.droitEnregistrement() +
      this.fraisPublication()
  );

  protected readonly coutRevientHorsTravaux = computed(
    () =>
      this.simAdjudication() +
      this.simFraisPrealables() +
      this.simHonoraires() +
      this.emolumentsTtc() +
      this.droitEnregistrement() +
      this.fraisPublication() +
      this.simDivers()
  );

  protected readonly coutRevientAvecTravaux = computed(
    () => this.coutRevientHorsTravaux() + this.simTravaux()
  );

  /** Valeur exacte − travaux − adjudication − frais − honoraires − émoluments − enregistrement − publication. */
  protected readonly beneficePotentiel = computed(
    () => this.simRevente() - this.simTravaux() - this.coutRevientHorsTravaux()
  );

  protected readonly margePct = computed(() =>
    this.coutRevientAvecTravaux() > 0
      ? (this.beneficePotentiel() / this.coutRevientAvecTravaux()) * 100
      : 0
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

  protected ouvrirSimulation(annonce: Annonce): void {
    this.simRevente.set(0);
    this.simTravaux.set(0);
    this.simAdjudication.set(annonce.prix);
    this.simFraisPrealables.set(11_000);
    this.simHonoraires.set(1_800);
    this.simDivers.set(120);
    this.detailEmoluments.set(false);
    this.simulation.set(annonce);
  }

  protected fermerSimulation(): void {
    this.simulation.set(null);
  }

  protected basculerDetailEmoluments(): void {
    this.detailEmoluments.update((v) => !v);
  }

  /** "30 000" ou "30000" → 30000 (saisie dans les champs formatés). */
  protected lireNombre(event: Event): number {
    const brut = (event.target as HTMLInputElement).value.replace(/[^\d-]/g, '');
    return Number(brut) || 0;
  }

  /** Valeur affichée dans un champ : "30 000" (sans le €, en suffixe dans le gabarit). */
  protected montant(valeur: number): string {
    return valeur.toLocaleString('fr-FR');
  }

  protected eurosRond(valeur: number): string {
    return Math.round(valeur).toLocaleString('fr-FR') + ' €';
  }

  protected eurosPrecis(valeur: number): string {
    return (
      valeur.toLocaleString('fr-FR', { maximumFractionDigits: 2, minimumFractionDigits: 0 }) + ' €'
    );
  }

  protected pourcent(valeur: number): string {
    return valeur.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' %';
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
    return (
      { Libre: 'statut--libre', 'Occupé': 'statut--occupe', 'Loué': 'statut--loue' }[statut] ??
      'statut--inconnu'
    );
  }
}
