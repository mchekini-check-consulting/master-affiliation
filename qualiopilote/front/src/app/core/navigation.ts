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
      { path: 'clients', libelle: 'Clients', icone: 'building-2', description: 'Entreprises et particuliers clients de votre organisme.' },
      { path: 'apprenants', libelle: 'Apprenants', icone: 'graduation-cap', description: 'Stagiaires rattachés à vos clients et à vos sessions.' },
      { path: 'formateurs', libelle: 'Formateurs', icone: 'user-check', description: 'Formateurs internes et sous-traitants.' },
    ],
  },
  {
    titre: 'Activité',
    items: [
      { path: 'formations', libelle: 'Formations', icone: 'book-open', description: 'Catalogue de vos formations et leurs modules.' },
      { path: 'sessions', libelle: 'Sessions', icone: 'calendar-days', description: 'Sessions concrètes, séances, inscriptions et automatisations.' },
      { path: 'catalogue-public', libelle: 'Catalogue public', icone: 'globe', description: 'Vitrine publique et demandes d’inscription en ligne.' },
    ],
  },
  {
    titre: 'Contenus',
    items: [
      { path: 'bibliotheque', libelle: 'Bibliothèque de modèles', icone: 'library', description: 'Modèles de documents, questionnaires et emails à variables de fusion.' },
      { path: 'questionnaires', libelle: 'Questionnaires', icone: 'clipboard-list', description: "Attentes, positionnement et enquêtes de satisfaction." },
      { path: 'quiz', libelle: 'Quiz', icone: 'list-checks', description: 'Quiz d’évaluation avec correction automatique.' },
      { path: 'e-learning', libelle: 'E-learning', icone: 'play-circle', description: 'Chapitres, leçons vidéo et suivi de progression.' },
    ],
  },
  {
    titre: 'Suivi',
    items: [
      { path: 'emargement', libelle: 'Émargement', icone: 'pen-line', description: 'Feuilles d’émargement et signature électronique.' },
      { path: 'bpf', libelle: 'BPF', icone: 'bar-chart-3', description: 'Bilan Pédagogique et Financier annuel.' },
    ],
  },
  {
    titre: 'Organisation',
    items: [
      { path: 'parametres', libelle: 'Paramètres', icone: 'settings', description: 'Informations de l’organisme, mentions légales, comptes et emails.' },
      { path: 'abonnement', libelle: 'Abonnement', icone: 'credit-card', description: 'Formule, options, factures et méthode de paiement.' },
      { path: 'affiliation', libelle: "Programme d'affiliation", icone: 'gift', description: 'Lien d’affiliation, statistiques et récompenses.' },
    ],
  },
];

/** Aplati toutes les rubriques (pour générer les routes enfants de /app). */
export const NAV_ITEMS: NavItem[] = NAV.flatMap((g) => g.items);
