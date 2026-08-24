// Préparations proposées sur l'accueil, dans l'ordre d'affichage.
// `slug` = segment d'URL de la page de la préparation.
// Seule la préparation Dév Full Stack a du contenu pour l'instant : les
// autres affichent une page « programme en cours d'écriture ».
export interface Preparation {
  slug: string;
  label: string;
  description: string;
  matieres: string;
  disponible: boolean;
}

export const preparations: Preparation[] = [
  {
    slug: 'fullstack',
    label: 'Dév Full Stack',
    description:
      'Le programme complet pour les entretiens de développeur : fiches corrigées au stylo, avec une interro à la fin de chaque fiche.',
    matieres: 'Java · Spring · Git · DevOps · Craftmanship · Agilité · Maven',
    disponible: true,
  },
  {
    slug: 'business-analyst',
    label: 'Business Analyst',
    description:
      'La préparation BA orientée assurance : le métier, les questions d’entretien, et des ateliers interactifs SQL, API et asynchrone.',
    matieres: 'Métier assurance · 77 questions · SQL · API · Kafka',
    disponible: true,
  },
  {
    slug: 'qa',
    label: 'QA',
    description:
      'Stratégie de test, automatisation, qualité logicielle et outillage.',
    matieres: 'Programme en cours d’écriture',
    disponible: false,
  },
  {
    slug: 'devops',
    label: 'DevOps',
    description:
      'De Terraform à l’IA : fiches par thématique, questions d’entretien avec cas situationnels réels, et quiz sur chaque sujet.',
    matieres: 'Terraform · CI/CD · Kubernetes · ArgoCD · Istio · Cloud · IA',
    disponible: true,
  },
];
