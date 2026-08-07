import { Component, computed, inject, signal } from '@angular/core';
import { Annonce, AnnoncesService } from './annonces.service';

const TYPES = ['Tout', 'Appartement', 'Maison', 'Local commercial', 'Parking'] as const;

const LIBELLES: Record<string, string> = {
  Tout: 'Tout',
  Appartement: 'Appartements',
  Maison: 'Maisons',
  'Local commercial': 'Locaux',
  Parking: 'Parkings',
};

const STATUTS = ['Tout', 'Libre', 'Occupé', 'Loué'] as const;

const LIBELLES_STATUT: Record<string, string> = {
  Tout: 'Tous',
  Libre: 'Libres',
  'Occupé': 'Occupés',
  'Loué': 'Loués',
};

/** Mots de liaison laissés en minuscules dans les noms de départements. */
const LIAISONS = new Set(['et', 'de', 'du', 'des', 'la', 'le', 'les', 'd', 'l']);

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
  protected readonly statuts = STATUTS;
  protected readonly libellesStatut = LIBELLES_STATUT;

  protected readonly annonces = signal<Annonce[]>([]);
  protected readonly chargement = signal(true);
  protected readonly erreur = signal(false);
  protected readonly filtreType = signal<string>('Tout');
  protected readonly filtreStatut = signal<string>('Tout');
  protected readonly recherche = signal('');

  /** Annonces visibles selon les filtres actifs. */
  protected readonly visibles = computed(() => {
    const requete = this.normaliser(this.recherche().trim());
    return this.annonces().filter(
      (a) =>
        (this.filtreType() === 'Tout' || a.type === this.filtreType()) &&
        (this.filtreStatut() === 'Tout' || a.statut === this.filtreStatut()) &&
        (!requete ||
          this.normaliser(a.ville).includes(requete) ||
          this.normaliser(a.adresse).includes(requete) ||
          this.normaliser(this.departement(a)).includes(requete))
    );
  });

  /** Minuscules sans accents, pour une recherche insensible à la casse et aux accents. */
  private normaliser(texte: string): string {
    return texte
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /** Lien Maps : ouvre Street View (photo du bien) sur les coordonnées de la fiche ;
   *  à défaut de coordonnées, retombe sur la carte fournie par Licitor. */
  protected lienMaps(annonce: Annonce): string {
    const coords = annonce.carte_url?.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    return coords
      ? `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${coords[1]},${coords[2]}`
      : (annonce.carte_url ?? '');
  }

  /** Infobulle de la colonne « Valeur marché » : provenance et fiabilité de la médiane DVF. */
  protected detailMarche(annonce: Annonce): string {
    if (!annonce.marche_prix_m2) {
      return 'Pas assez de ventes DVF comparables autour de cette adresse.';
    }
    return (
      `Médiane des ventes réelles (DVF) : ${this.euros(annonce.marche_prix_m2)}/m² · ` +
      `${annonce.marche_nb_ventes} vente${(annonce.marche_nb_ventes ?? 0) > 1 ? 's' : ''} ` +
      `à l'échelle « ${annonce.marche_echelle} »`
    );
  }

  /** "…/nogent-sur-seine/aube/109447.html" → "Aube" (le département est l'avant-dernier segment de l'URL Licitor). */
  protected departement(annonce: Annonce): string {
    const segments = annonce.url.split('/').filter(Boolean);
    if (segments.length < 2 || !segments[segments.length - 1].endsWith('.html')) return '';
    return segments[segments.length - 2]
      .split('-')
      .map((mot) => (LIAISONS.has(mot) ? mot : mot.charAt(0).toUpperCase() + mot.slice(1)))
      .join('-');
  }

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

  /** Achat via une société de marchand de biens : droits d'enregistrement réduits. */
  protected readonly simSociete = signal(false);

  /** Droit d'enregistrement : 5,80 % TTC, ou 0,715 % en société de marchand de biens (engagement de revente). */
  protected readonly droitEnregistrement = computed(
    () => this.simAdjudication() * (this.simSociete() ? 0.00715 : 0.058)
  );

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

  protected choisirStatut(statut: string): void {
    this.filtreStatut.set(statut);
  }

  /** La tuile « Biens libres » bascule le filtre de statut sur Libre. */
  protected basculerLibres(): void {
    this.filtreStatut.update((s) => (s === 'Libre' ? 'Tout' : 'Libre'));
  }

  protected lireTexte(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected ouvrirSimulation(annonce: Annonce): void {
    // La valeur de marché DVF sert de valeur de revente par défaut, ajustable.
    this.simRevente.set(annonce.marche_valeur ?? 0);
    this.simTravaux.set(0);
    this.simAdjudication.set(annonce.prix);
    this.simFraisPrealables.set(11_000);
    this.simHonoraires.set(1_800);
    this.simDivers.set(120);
    this.simSociete.set(false);
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
