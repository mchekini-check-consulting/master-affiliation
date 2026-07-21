/**
 * Rubriques du back-office, source unique partagée par la sidebar et par la
 * configuration des routes (titre + description des pages « Bientôt disponible »).
 * `path` est relatif à /app ('' = tableau de bord).
 */
export interface NavItem {
  path: string;
  libelle: string;
  icone: string; // nom d'icône lucide (via <lucide-angular>) ou emoji de repli
  description: string;
  /**
   * Module RBAC backend correspondant (enum fr.qualiopilote.rbac.Module).
   * La sidebar n'affiche l'entrée que si l'utilisateur a l'action VOIR dessus.
   * Absent = toujours visible (ex. tableau de bord).
   */
  module?: string;
}

export interface NavGroup {
  titre: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    titre: 'Pilotage',
    items: [
      {
        path: '',
        libelle: 'Tableau de bord',
        icone: 'layout-dashboard',
        description: "Vue d'ensemble de l'activité de votre organisme de formation.",
      },
    ],
  },
  {
    titre: 'Parties prenantes',
    items: [
      { path: 'clients', libelle: 'Clients', icone: 'building-2', description: 'Entreprises et particuliers clients de votre organisme.', module: 'CLIENTS' },
      { path: 'apprenants', libelle: 'Apprenants', icone: 'graduation-cap', description: 'Stagiaires rattachés à vos clients et à vos sessions.', module: 'APPRENANTS' },
      { path: 'formateurs', libelle: 'Formateurs', icone: 'user-check', description: 'Formateurs internes et sous-traitants.', module: 'FORMATEURS' },
    ],
  },
  {
    titre: 'Activité',
    items: [
      { path: 'formations', libelle: 'Formations', icone: 'book-open', description: 'Catalogue de vos formations et leurs modules.', module: 'FORMATIONS' },
      { path: 'sessions', libelle: 'Sessions', icone: 'calendar-days', description: 'Sessions concrètes, séances, inscriptions et automatisations.', module: 'SESSIONS' },
      { path: 'catalogue-public', libelle: 'Catalogue public', icone: 'globe', description: 'Vitrine publique et demandes d’inscription en ligne.', module: 'CATALOGUE_PUBLIC' },
    ],
  },
  {
    titre: 'Contenus',
    items: [
      { path: 'bibliotheque', libelle: 'Bibliothèque de modèles', icone: 'library', description: 'Modèles de documents, questionnaires et emails à variables de fusion.', module: 'BIBLIOTHEQUE' },
      { path: 'questionnaires', libelle: 'Questionnaires', icone: 'clipboard-list', description: "Attentes, positionnement et enquêtes de satisfaction.", module: 'QUESTIONNAIRES' },
      { path: 'quiz', libelle: 'Quiz', icone: 'list-checks', description: 'Quiz d’évaluation avec correction automatique.', module: 'QUIZ' },
      { path: 'e-learning', libelle: 'E-learning', icone: 'play-circle', description: 'Chapitres, leçons vidéo et suivi de progression.', module: 'E_LEARNING' },
    ],
  },
  {
    titre: 'Suivi',
    items: [
      { path: 'emargement', libelle: 'Émargement', icone: 'pen-line', description: 'Feuilles d’émargement et signature électronique.', module: 'EMARGEMENT' },
      { path: 'bpf', libelle: 'BPF', icone: 'bar-chart-3', description: 'Bilan Pédagogique et Financier annuel.', module: 'BPF' },
    ],
  },
  {
    titre: 'Organisation',
    items: [
      { path: 'parametres', libelle: 'Paramètres', icone: 'settings', description: 'Informations de l’organisme, mentions légales, comptes et emails.', module: 'PARAMETRES' },
      { path: 'abonnement', libelle: 'Abonnement', icone: 'credit-card', description: 'Formule, options, factures et méthode de paiement.', module: 'ABONNEMENT' },
      { path: 'affiliation', libelle: "Programme d'affiliation", icone: 'gift', description: 'Lien d’affiliation, statistiques et récompenses.', module: 'AFFILIATION' },
    ],
  },
];

/** Aplati toutes les rubriques (pour générer les routes enfants de /app). */
export const NAV_ITEMS: NavItem[] = NAV.flatMap((g) => g.items);
