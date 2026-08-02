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
      'Recueil du besoin, spécifications, modélisation, agilité et pilotage produit.',
    matieres: 'Programme en cours d’écriture',
    disponible: false,
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
      'Conteneurs, orchestration, cloud, CI/CD et observabilité au quotidien.',
    matieres: 'Programme en cours d’écriture',
    disponible: false,
  },
];
