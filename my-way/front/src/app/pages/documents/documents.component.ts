import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule, Archive, BookOpen, ChevronDown, Download, Eye, FileText,
  FileType, FileUp, FolderPlus, Image, Inbox, Loader2, Pencil, Plus, RefreshCw,
  RotateCcw, Search, Sheet, Trash2, Upload, X,
} from 'lucide-angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DashboardLayoutComponent } from '../dashboard/dashboard-layout.component';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { DocItem, DocTheme, DocumentService, FileFamily } from '../../core/document.service';

interface PendingUpload {
  file: File;
  title: string;
  themeId: number | null;
  description: string;
  tags: string;
  status: 'attente' | 'envoi' | 'ok' | 'erreur';
  erreur?: string;
}

interface ThemeGroup {
  theme: string;
  themeId: number;
  docs: DocItem[];
  replie: boolean;
}

const TYPES: { id: FileFamily; label: string }[] = [
  { id: 'PDF', label: 'PDF' },
  { id: 'WORD', label: 'Word' },
  { id: 'EXCEL', label: 'Excel' },
  { id: 'IMAGE', label: 'Image' },
];

@Component({
  selector: 'app-documents',
  imports: [FormsModule, LucideAngularModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout>
      <div class="p-6 lg:p-8">
        <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 mb-1">Documents</h1>
            <p class="text-slate-600">Guides, modèles et ressources organisés par thématique</p>
          </div>
          @if (isAdmin) {
            <div class="flex flex-wrap gap-2">
              <button (click)="panneauUpload = !panneauUpload; panneauThemes = false; panneauCorbeille = false"
                class="ui-btn" [class]="panneauUpload ? 'bg-blue-600 text-white' : 'ui-btn-outline'">
                <lucide-icon [img]="ic.Upload" class="w-4 h-4 mr-2" /> Ajouter des documents
              </button>
              <button (click)="panneauThemes = !panneauThemes; panneauUpload = false; panneauCorbeille = false"
                class="ui-btn" [class]="panneauThemes ? 'bg-blue-600 text-white' : 'ui-btn-outline'">
                <lucide-icon [img]="ic.FolderPlus" class="w-4 h-4 mr-2" /> Thématiques
              </button>
              <button (click)="ouvrirCorbeille()"
                class="ui-btn" [class]="panneauCorbeille ? 'bg-blue-600 text-white' : 'ui-btn-outline'">
                <lucide-icon [img]="ic.Archive" class="w-4 h-4 mr-2" /> Corbeille
              </button>
            </div>
          }
        </div>

        <!-- ============ Admin : upload multiple ============ -->
        @if (isAdmin && panneauUpload) {
          <div class="ui-card mb-6 anim-fade-up">
            <div class="ui-card-header pb-2">
              <span class="ui-card-title !text-base font-semibold">Ajouter des documents</span>
              <p class="text-sm text-slate-500 mt-0.5">PDF, Word, Excel ou images — 20 Mo max par fichier</p>
            </div>
            <div class="ui-card-content space-y-4">
              <label
                class="block border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors"
                [class]="survolDepot ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'"
                (dragover)="$event.preventDefault(); survolDepot = true"
                (dragleave)="survolDepot = false"
                (drop)="deposerFichiers($event)">
                <lucide-icon [img]="ic.FileUp" class="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p class="text-sm font-medium text-slate-700">Glissez-déposez vos fichiers ici, ou cliquez pour parcourir</p>
                <p class="text-xs text-slate-400 mt-1">Upload multiple accepté</p>
                <input type="file" multiple class="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpeg,.jpg,.png,.gif,.webp,.heic"
                  (change)="choisirFichiers($event)" />
              </label>

              @for (p of enAttente; track $index) {
                <div class="rounded-xl border p-4"
                  [class]="p.status === 'erreur' ? 'border-red-200 bg-red-50' : p.status === 'ok' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'">
                  <div class="flex items-center gap-2 mb-3">
                    <lucide-icon [img]="iconePourNom(p.file.name)" class="w-4 h-4 text-slate-500" />
                    <span class="text-sm font-semibold text-slate-800 flex-1 truncate">{{ p.file.name }}</span>
                    <span class="text-xs text-slate-400">{{ taille(p.file.size) }}</span>
                    @if (p.status === 'envoi') { <lucide-icon [img]="ic.Loader2" class="w-4 h-4 animate-spin text-blue-500" /> }
                    @if (p.status === 'ok') { <span class="text-xs font-semibold text-emerald-600">Publié ✓</span> }
                    @if (p.status !== 'envoi' && p.status !== 'ok') {
                      <button (click)="enAttente.splice($index, 1)" class="p-1 text-slate-400 hover:text-red-500">
                        <lucide-icon [img]="ic.X" class="w-4 h-4" />
                      </button>
                    }
                  </div>
                  @if (p.status !== 'ok') {
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input class="ui-input" placeholder="Titre" [(ngModel)]="p.title" />
                      <select class="ui-input ui-select" [(ngModel)]="p.themeId">
                        <option [ngValue]="null">Thématique * (obligatoire)</option>
                        @for (t of themes; track t.id) { <option [ngValue]="t.id">{{ t.name }}</option> }
                      </select>
                      <input class="ui-input" placeholder="Description (optionnelle)" [(ngModel)]="p.description" />
                      <input class="ui-input" placeholder="Tags séparés par des virgules" [(ngModel)]="p.tags" />
                    </div>
                    @if (p.erreur) { <p class="text-xs text-red-600 mt-2">{{ p.erreur }}</p> }
                  }
                </div>
              }

              @if (enAttente.length) {
                <button (click)="toutUploader()" [disabled]="uploadEnCours" class="ui-btn w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <lucide-icon [img]="ic.Upload" class="w-4 h-4 mr-2" />
                  {{ uploadEnCours ? 'Envoi en cours…' : 'Publier ' + nbAEnvoyer() + ' document(s)' }}
                </button>
              }
            </div>
          </div>
        }

        <!-- ============ Admin : thématiques ============ -->
        @if (isAdmin && panneauThemes) {
          <div class="ui-card mb-6 anim-fade-up">
            <div class="ui-card-header pb-2">
              <span class="ui-card-title !text-base font-semibold">Gérer les thématiques</span>
            </div>
            <div class="ui-card-content space-y-3">
              @for (t of themes; track t.id) {
                <div class="flex items-center gap-3">
                  @if (renommageId === t.id) {
                    <input class="ui-input flex-1" [(ngModel)]="renommageNom" (keydown.enter)="validerRenommage(t)" />
                    <button (click)="validerRenommage(t)" class="ui-btn ui-btn-sm bg-blue-600 text-white">OK</button>
                    <button (click)="renommageId = null" class="ui-btn ui-btn-sm ui-btn-outline">Annuler</button>
                  } @else {
                    <span class="flex-1 text-sm font-medium text-slate-800">{{ t.name }}
                      <span class="text-xs text-slate-400">({{ t.document_count }} doc{{ t.document_count > 1 ? 's' : '' }})</span>
                    </span>
                    <button (click)="renommageId = t.id; renommageNom = t.name" class="p-1.5 text-slate-400 hover:text-blue-600" title="Renommer">
                      <lucide-icon [img]="ic.Pencil" class="w-4 h-4" />
                    </button>
                    @if (suppressionThemeId === t.id && t.document_count > 0) {
                      <select class="ui-input ui-select w-56" [(ngModel)]="reaffectationId">
                        <option [ngValue]="null">Réaffecter les documents vers…</option>
                        @for (autre of themes; track autre.id) {
                          @if (autre.id !== t.id) { <option [ngValue]="autre.id">{{ autre.name }}</option> }
                        }
                      </select>
                      <button (click)="supprimerTheme(t)" [disabled]="reaffectationId === null" class="ui-btn ui-btn-sm bg-red-600 text-white disabled:opacity-40">Confirmer</button>
                      <button (click)="suppressionThemeId = null" class="ui-btn ui-btn-sm ui-btn-outline">Annuler</button>
                    } @else if (suppressionThemeId === t.id) {
                      <button (click)="supprimerTheme(t)" class="ui-btn ui-btn-sm bg-red-600 text-white">Confirmer la suppression</button>
                      <button (click)="suppressionThemeId = null" class="ui-btn ui-btn-sm ui-btn-outline">Annuler</button>
                    } @else {
                      <button (click)="suppressionThemeId = t.id; reaffectationId = null" class="p-1.5 text-slate-400 hover:text-red-500" title="Supprimer">
                        <lucide-icon [img]="ic.Trash2" class="w-4 h-4" />
                      </button>
                    }
                  }
                </div>
              }
              <div class="flex gap-3 pt-2 border-t border-slate-100">
                <input class="ui-input flex-1" placeholder="Nouvelle thématique" [(ngModel)]="nouvelleThematique" (keydown.enter)="creerTheme()" />
                <button (click)="creerTheme()" class="ui-btn ui-btn-outline">
                  <lucide-icon [img]="ic.Plus" class="w-4 h-4 mr-1" /> Créer
                </button>
              </div>
            </div>
          </div>
        }

        <!-- ============ Admin : corbeille ============ -->
        @if (isAdmin && panneauCorbeille) {
          <div class="ui-card mb-6 anim-fade-up">
            <div class="ui-card-header pb-2">
              <span class="ui-card-title !text-base font-semibold">Corbeille</span>
              <p class="text-sm text-slate-500 mt-0.5">Suppression définitive automatique après 30 jours</p>
            </div>
            <div class="ui-card-content space-y-2">
              @for (d of corbeille; track d.id) {
                <div class="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                  <lucide-icon [img]="icone(d.file_type)" class="w-4 h-4 text-slate-400" />
                  <span class="flex-1 text-sm text-slate-700 truncate">{{ d.title }}</span>
                  <span class="text-xs text-slate-400">supprimé le {{ dateFr(d.deleted_date!) }}</span>
                  <button (click)="restaurer(d)" class="ui-btn ui-btn-sm ui-btn-outline">
                    <lucide-icon [img]="ic.RotateCcw" class="w-4 h-4 mr-1" /> Restaurer
                  </button>
                </div>
              }
              @if (!corbeille.length) { <p class="text-sm text-slate-400">La corbeille est vide.</p> }
            </div>
          </div>
        }

        <!-- ============ Recherche multicritère ============ -->
        <div class="ui-card mb-6">
          <div class="ui-card-content pt-6 space-y-4">
            <div class="relative">
              <lucide-icon [img]="ic.Search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input class="ui-input pl-9" placeholder="Rechercher dans les titres, descriptions et tags…"
                [ngModel]="q" (ngModelChange)="q = $event; rechercher()" />
            </div>
            <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs font-semibold text-slate-500 uppercase">Thématiques</span>
                @for (t of themes; track t.id) {
                  <button type="button" (click)="basculerTheme(t.id)"
                    class="ui-badge px-2.5 py-1 text-xs font-medium border transition-colors"
                    [class]="themesChoisies.includes(t.id)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'">
                    {{ t.name }}
                  </button>
                }
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs font-semibold text-slate-500 uppercase">Type</span>
                @for (t of typesListe; track t.id) {
                  <button type="button" (click)="basculerType(t.id)"
                    class="ui-badge px-2.5 py-1 text-xs font-medium border transition-colors"
                    [class]="typesChoisis.includes(t.id)
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'">
                    {{ t.label }}
                  </button>
                }
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold text-slate-500 uppercase">Publié entre</span>
                <input type="date" class="ui-input w-40" [ngModel]="dateDebut" (ngModelChange)="dateDebut = $event; rechercher()" />
                <span class="text-slate-400">et</span>
                <input type="date" class="ui-input w-40" [ngModel]="dateFin" (ngModelChange)="dateFin = $event; rechercher()" />
              </div>
            </div>
            <div class="flex items-center justify-between border-t border-slate-100 pt-3">
              <span class="text-sm font-semibold text-slate-700">
                {{ resultats.length }} résultat{{ resultats.length > 1 ? 's' : '' }}
              </span>
              @if (filtresActifs()) {
                <button (click)="reinitialiser()" class="ui-btn ui-btn-sm ui-btn-outline">
                  <lucide-icon [img]="ic.RefreshCw" class="w-4 h-4 mr-1" /> Réinitialiser les filtres
                </button>
              }
            </div>
          </div>
        </div>

        <!-- ============ Liste groupée par thématique ============ -->
        @if (chargement) {
          <div class="flex justify-center py-16 text-slate-400">
            <lucide-icon [img]="ic.Loader2" class="w-7 h-7 animate-spin" />
          </div>
        } @else if (!resultats.length) {
          <div class="ui-card">
            <div class="ui-card-content py-14 text-center">
              <lucide-icon [img]="ic.Inbox" class="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p class="font-semibold text-slate-700">Aucun document ne correspond à votre recherche</p>
              <p class="text-sm text-slate-500 mt-1">Essayez de retirer des filtres ou d'élargir la période.</p>
              @if (filtresActifs()) {
                <button (click)="reinitialiser()" class="ui-btn ui-btn-outline mt-4">
                  <lucide-icon [img]="ic.RefreshCw" class="w-4 h-4 mr-1" /> Réinitialiser les filtres
                </button>
              }
            </div>
          </div>
        } @else {
          <div class="space-y-4">
            @for (groupe of groupes; track groupe.themeId) {
              <div class="ui-card overflow-hidden">
                <button type="button" (click)="basculerGroupe(groupe)"
                  class="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                  <span class="font-bold text-slate-900 flex items-center gap-2">
                    <lucide-icon [img]="ic.BookOpen" class="w-4 h-4 text-blue-600" />
                    {{ groupe.theme }}
                    <span class="text-xs font-medium text-slate-400">{{ groupe.docs.length }} document{{ groupe.docs.length > 1 ? 's' : '' }}</span>
                  </span>
                  <lucide-icon [img]="ic.ChevronDown" class="w-4 h-4 text-slate-400 transition-transform" [class.rotate-180]="!groupe.replie" />
                </button>
                @if (!groupe.replie) {
                  <div class="border-t border-slate-100">
                    @for (d of groupe.docs; track d.id) {
                      <div class="px-6 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                        <div class="flex items-start gap-4">
                          <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" [class]="fondIcone(d.file_type)">
                            <lucide-icon [img]="icone(d.file_type)" class="w-5 h-5" />
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="font-semibold text-slate-900">{{ d.title }}</p>
                            <p class="text-xs text-slate-400 mt-0.5">
                              {{ libelleType(d.file_type) }} · {{ taille(d.size_bytes) }} · publié le {{ dateFr(d.published_date) }}
                            </p>
                            @if (d.description) { <p class="text-sm text-slate-500 mt-1">{{ d.description }}</p> }
                            @if (d.tags.length) {
                              <p class="mt-1.5">
                                @for (tag of d.tags; track tag) {
                                  <span class="ui-badge bg-slate-100 text-slate-500 px-2 py-0.5 text-xs mr-1">{{ tag }}</span>
                                }
                              </p>
                            }
                          </div>
                          <div class="flex items-center gap-2 shrink-0">
                            @if (d.file_type === 'PDF' || d.file_type === 'IMAGE') {
                              <button (click)="voir(d)" class="ui-btn ui-btn-sm ui-btn-outline">
                                <lucide-icon [img]="ic.Eye" class="w-4 h-4 mr-1" /> Voir
                              </button>
                            }
                            <a [href]="urlTelechargement(d)" class="ui-btn ui-btn-sm bg-blue-600 hover:bg-blue-700 text-white">
                              <lucide-icon [img]="ic.Download" class="w-4 h-4 mr-1" /> Télécharger
                            </a>
                            @if (isAdmin) {
                              <button (click)="ouvrirEdition(d)" class="p-1.5 text-slate-400 hover:text-blue-600" title="Modifier">
                                <lucide-icon [img]="ic.Pencil" class="w-4 h-4" />
                              </button>
                              @if (suppressionDocId === d.id) {
                                <button (click)="supprimer(d)" class="ui-btn ui-btn-sm bg-red-600 text-white">Confirmer</button>
                                <button (click)="suppressionDocId = null" class="ui-btn ui-btn-sm ui-btn-outline">Annuler</button>
                              } @else {
                                <button (click)="suppressionDocId = d.id" class="p-1.5 text-slate-400 hover:text-red-500" title="Supprimer">
                                  <lucide-icon [img]="ic.Trash2" class="w-4 h-4" />
                                </button>
                              }
                            }
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- ============ Visionneuse intégrée ============ -->
        @if (visionneuse) {
          <div class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" (click)="visionneuse = null">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col" (click)="$event.stopPropagation()">
              <div class="flex items-center justify-between px-5 py-3 border-b border-slate-200">
                <p class="font-semibold text-slate-900 truncate">{{ visionneuse.title }}</p>
                <div class="flex items-center gap-2">
                  <a [href]="urlTelechargement(visionneuse)" class="ui-btn ui-btn-sm ui-btn-outline">
                    <lucide-icon [img]="ic.Download" class="w-4 h-4 mr-1" /> Télécharger
                  </a>
                  <button (click)="visionneuse = null" class="p-2 text-slate-400 hover:text-slate-700">
                    <lucide-icon [img]="ic.X" class="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div class="flex-1 overflow-auto bg-slate-100 rounded-b-2xl min-h-[70vh]">
                @if (visionneuse.file_type === 'PDF') {
                  <iframe [src]="urlVisionneuse" class="w-full h-[80vh] border-0" title="Visionneuse PDF"></iframe>
                } @else {
                  <div class="flex items-center justify-center p-6 min-h-[70vh]">
                    <img [src]="urlVisionneuse" [alt]="visionneuse.title" class="max-w-full max-h-[78vh] object-contain cursor-zoom-in"
                      (click)="zoomImage = !zoomImage" [class.max-h-none]="zoomImage" [class.max-w-none]="zoomImage" />
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- ============ Admin : modale d'édition ============ -->
        @if (edition) {
          <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" (click)="edition = null">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4" (click)="$event.stopPropagation()">
              <p class="font-bold text-slate-900">Modifier le document</p>
              <div>
                <label class="ui-label text-xs mb-1 block">Titre</label>
                <input class="ui-input" [(ngModel)]="editionTitre" />
              </div>
              <div>
                <label class="ui-label text-xs mb-1 block">Thématique</label>
                <select class="ui-input ui-select" [(ngModel)]="editionThemeId">
                  @for (t of themes; track t.id) { <option [ngValue]="t.id">{{ t.name }}</option> }
                </select>
              </div>
              <div>
                <label class="ui-label text-xs mb-1 block">Description</label>
                <input class="ui-input" [(ngModel)]="editionDescription" />
              </div>
              <div>
                <label class="ui-label text-xs mb-1 block">Tags (séparés par des virgules)</label>
                <input class="ui-input" [(ngModel)]="editionTags" />
              </div>
              <div>
                <label class="ui-label text-xs mb-1 block">Remplacer le fichier (nouvelle version, mêmes liens)</label>
                <input type="file" class="ui-input pt-1.5"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpeg,.jpg,.png,.gif,.webp,.heic"
                  (change)="editionFichier = fichierChoisi($event)" />
              </div>
              <div class="flex gap-3 pt-2">
                <button (click)="edition = null" class="ui-btn ui-btn-outline flex-1">Annuler</button>
                <button (click)="validerEdition()" [disabled]="editionEnCours" class="ui-btn flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  {{ editionEnCours ? 'Enregistrement…' : 'Enregistrer' }}
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </app-dashboard-layout>
  `,
})
export class DocumentsComponent implements OnInit {
  private docs = inject(DocumentService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private sanitizer = inject(DomSanitizer);
  protected readonly ic = {
    Archive, BookOpen, ChevronDown, Download, Eye, FileText, FileType, FileUp, FolderPlus,
    Image, Inbox, Loader2, Pencil, Plus, RefreshCw, RotateCcw, Search, Sheet, Trash2, Upload, X,
  };
  protected readonly typesListe = TYPES;

  isAdmin = false;
  chargement = true;

  // Recherche
  q = '';
  themesChoisies: number[] = [];
  typesChoisis: FileFamily[] = [];
  dateDebut = '';
  dateFin = '';
  resultats: DocItem[] = [];
  groupes: ThemeGroup[] = [];
  themes: DocTheme[] = [];
  private replies = new Set<number>();
  private rechercheTimer: ReturnType<typeof setTimeout> | null = null;

  // Visionneuse
  visionneuse: DocItem | null = null;
  urlVisionneuse: SafeResourceUrl | null = null;
  zoomImage = false;

  // Admin
  panneauUpload = false;
  panneauThemes = false;
  panneauCorbeille = false;
  survolDepot = false;
  enAttente: PendingUpload[] = [];
  uploadEnCours = false;
  corbeille: DocItem[] = [];
  nouvelleThematique = '';
  renommageId: number | null = null;
  renommageNom = '';
  suppressionThemeId: number | null = null;
  reaffectationId: number | null = null;
  suppressionDocId: number | null = null;
  edition: DocItem | null = null;
  editionTitre = ''; editionThemeId: number | null = null;
  editionDescription = ''; editionTags = '';
  editionFichier: File | null = null;
  editionEnCours = false;

  async ngOnInit(): Promise<void> {
    this.auth.me().then(u => this.isAdmin = (u.role ?? '').toUpperCase() === 'ADMIN').catch(() => {});
    await this.rafraichir();
  }

  // ------------------------------------------------------------------
  // Recherche et liste
  // ------------------------------------------------------------------

  rechercher(): void {
    if (this.rechercheTimer) clearTimeout(this.rechercheTimer);
    this.rechercheTimer = setTimeout(() => this.rafraichir(), 250);
  }

  private async rafraichir(): Promise<void> {
    try {
      const [themes, resultats] = await Promise.all([
        this.docs.themes(),
        this.docs.search({
          q: this.q, themeIds: this.themesChoisies, types: this.typesChoisis,
          from: this.dateDebut, to: this.dateFin,
        }),
      ]);
      this.themes = themes;
      this.resultats = resultats;
      this.grouper();
    } catch {
      this.toast.error('Impossible de charger les documents');
    }
    this.chargement = false;
  }

  private grouper(): void {
    const parTheme = new Map<number, ThemeGroup>();
    for (const d of this.resultats) {
      let groupe = parTheme.get(d.theme_id);
      if (!groupe) {
        groupe = { theme: d.theme_name, themeId: d.theme_id, docs: [], replie: this.replies.has(d.theme_id) };
        parTheme.set(d.theme_id, groupe);
      }
      groupe.docs.push(d);
    }
    this.groupes = [...parTheme.values()].sort((a, b) => a.theme.localeCompare(b.theme, 'fr'));
  }

  /** Replie/déplie une section en mémorisant l'état entre deux recherches. */
  basculerGroupe(groupe: ThemeGroup): void {
    groupe.replie = !groupe.replie;
    if (groupe.replie) this.replies.add(groupe.themeId);
    else this.replies.delete(groupe.themeId);
  }

  basculerTheme(id: number): void {
    this.themesChoisies = this.themesChoisies.includes(id)
      ? this.themesChoisies.filter(t => t !== id)
      : [...this.themesChoisies, id];
    this.rechercher();
  }

  basculerType(t: FileFamily): void {
    this.typesChoisis = this.typesChoisis.includes(t)
      ? this.typesChoisis.filter(x => x !== t)
      : [...this.typesChoisis, t];
    this.rechercher();
  }

  filtresActifs(): boolean {
    return !!(this.q.trim() || this.themesChoisies.length || this.typesChoisis.length || this.dateDebut || this.dateFin);
  }

  reinitialiser(): void {
    this.q = '';
    this.themesChoisies = [];
    this.typesChoisis = [];
    this.dateDebut = '';
    this.dateFin = '';
    this.rechercher();
  }

  // ------------------------------------------------------------------
  // Visionneuse et téléchargement
  // ------------------------------------------------------------------

  voir(d: DocItem): void {
    this.zoomImage = false;
    this.urlVisionneuse = this.sanitizer.bypassSecurityTrustResourceUrl(this.docs.fileUrl(d.id));
    this.visionneuse = d;
  }

  urlTelechargement(d: DocItem): string {
    return this.docs.downloadUrl(d.id);
  }

  // ------------------------------------------------------------------
  // Admin : upload
  // ------------------------------------------------------------------

  deposerFichiers(event: DragEvent): void {
    event.preventDefault();
    this.survolDepot = false;
    this.ajouterFichiers(event.dataTransfer?.files ?? null);
  }

  choisirFichiers(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.ajouterFichiers(input.files);
    input.value = '';
  }

  fichierChoisi(event: Event): File | null {
    return (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  private ajouterFichiers(files: FileList | null): void {
    if (!files) return;
    for (const file of Array.from(files)) {
      this.enAttente.push({
        file,
        title: file.name.replace(/\.[^.]+$/, ''),
        themeId: this.themes.length === 1 ? this.themes[0].id : null,
        description: '', tags: '', status: 'attente',
      });
    }
  }

  nbAEnvoyer(): number {
    return this.enAttente.filter(p => p.status !== 'ok').length;
  }

  async toutUploader(): Promise<void> {
    const manquants = this.enAttente.filter(p => p.status !== 'ok' && p.themeId === null);
    if (manquants.length) {
      manquants.forEach(p => p.erreur = 'La thématique est obligatoire');
      this.toast.error('Renseignez la thématique de chaque document');
      return;
    }
    this.uploadEnCours = true;
    for (const p of this.enAttente.filter(x => x.status !== 'ok')) {
      p.status = 'envoi';
      p.erreur = undefined;
      try {
        await this.docs.upload(p.file, p.title, p.themeId!, p.description, p.tags);
        p.status = 'ok';
      } catch (e: unknown) {
        p.status = 'erreur';
        p.erreur = this.messageErreur(e);
      }
    }
    this.uploadEnCours = false;
    const publies = this.enAttente.filter(p => p.status === 'ok').length;
    if (publies) this.toast.success(`${publies} document(s) publié(s)`);
    this.enAttente = this.enAttente.filter(p => p.status !== 'ok');
    if (!this.enAttente.length) this.panneauUpload = false;
    await this.rafraichir();
  }

  private messageErreur(e: unknown): string {
    const err = e as { error?: { message?: string }; status?: number };
    return err?.error?.message
      ?? (err?.status === 413 ? 'Fichier trop volumineux (20 Mo max)' : 'Échec de l’envoi');
  }

  // ------------------------------------------------------------------
  // Admin : édition, suppression, corbeille, thématiques
  // ------------------------------------------------------------------

  ouvrirEdition(d: DocItem): void {
    this.edition = d;
    this.editionTitre = d.title;
    this.editionThemeId = d.theme_id;
    this.editionDescription = d.description ?? '';
    this.editionTags = d.tags.join(', ');
    this.editionFichier = null;
  }

  async validerEdition(): Promise<void> {
    if (!this.edition) return;
    this.editionEnCours = true;
    try {
      await this.docs.update(this.edition.id, {
        title: this.editionTitre,
        description: this.editionDescription,
        tags: this.editionTags,
        themeId: this.editionThemeId ?? undefined,
      });
      if (this.editionFichier) {
        await this.docs.replaceFile(this.edition.id, this.editionFichier);
      }
      this.toast.success('Document mis à jour');
      this.edition = null;
      await this.rafraichir();
    } catch (e) {
      this.toast.error(this.messageErreur(e));
    }
    this.editionEnCours = false;
  }

  async supprimer(d: DocItem): Promise<void> {
    try {
      await this.docs.softDelete(d.id);
      this.suppressionDocId = null;
      this.toast.success('Document supprimé (restaurable 30 jours depuis la corbeille)');
      await this.rafraichir();
    } catch {
      this.toast.error('Suppression impossible');
    }
  }

  async ouvrirCorbeille(): Promise<void> {
    this.panneauCorbeille = !this.panneauCorbeille;
    this.panneauUpload = false;
    this.panneauThemes = false;
    if (this.panneauCorbeille) {
      try { this.corbeille = await this.docs.trash(); } catch { this.corbeille = []; }
    }
  }

  async restaurer(d: DocItem): Promise<void> {
    await this.docs.restore(d.id);
    this.corbeille = this.corbeille.filter(x => x.id !== d.id);
    this.toast.success('Document restauré');
    await this.rafraichir();
  }

  async creerTheme(): Promise<void> {
    const nom = this.nouvelleThematique.trim();
    if (!nom) return;
    try {
      await this.docs.createTheme(nom);
      this.nouvelleThematique = '';
      await this.rafraichir();
    } catch {
      this.toast.error('Cette thématique existe déjà');
    }
  }

  async validerRenommage(t: DocTheme): Promise<void> {
    const nom = this.renommageNom.trim();
    if (!nom) return;
    await this.docs.renameTheme(t.id, nom);
    this.renommageId = null;
    await this.rafraichir();
  }

  async supprimerTheme(t: DocTheme): Promise<void> {
    try {
      await this.docs.deleteTheme(t.id, t.document_count > 0 ? this.reaffectationId ?? undefined : undefined);
      this.suppressionThemeId = null;
      this.toast.success('Thématique supprimée');
      await this.rafraichir();
    } catch (e) {
      this.toast.error(this.messageErreur(e));
    }
  }

  // ------------------------------------------------------------------
  // Helpers d'affichage
  // ------------------------------------------------------------------

  icone(type: FileFamily) {
    switch (type) {
      case 'PDF': return FileText;
      case 'WORD': return FileType;
      case 'EXCEL': return Sheet;
      case 'IMAGE': return Image;
    }
  }

  iconePourNom(nom: string) {
    const ext = nom.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf') return FileText;
    if (['doc', 'docx'].includes(ext)) return FileType;
    if (['xls', 'xlsx'].includes(ext)) return Sheet;
    return Image;
  }

  fondIcone(type: FileFamily): string {
    switch (type) {
      case 'PDF': return 'bg-red-50 text-red-500';
      case 'WORD': return 'bg-blue-50 text-blue-600';
      case 'EXCEL': return 'bg-emerald-50 text-emerald-600';
      case 'IMAGE': return 'bg-violet-50 text-violet-600';
    }
  }

  libelleType(type: FileFamily): string {
    return TYPES.find(t => t.id === type)?.label ?? type;
  }

  taille(octets: number): string {
    if (octets >= 1_000_000) return (octets / 1_000_000).toFixed(1).replace('.', ',') + ' Mo';
    if (octets >= 1_000) return Math.round(octets / 1_000) + ' Ko';
    return octets + ' o';
  }

  dateFr(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR');
  }
}
