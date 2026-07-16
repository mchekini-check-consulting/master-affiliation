// Catégories du programme de révision, dans l'ordre d'affichage.
// `slug` = segment d'URL et nom du sous-dossier dans src/content/fiches/.
export interface Categorie {
  slug: string;
  label: string;
  description: string;
}

export const categories: Categorie[] = [
  {
    slug: 'craftmanship',
    label: 'Craftmanship',
    description: 'Code de qualité, SOLID, TDD, design patterns et architecture',
  },
  {
    slug: 'git',
    label: 'Git',
    description: 'Merge, rebase, workflows et gestion des environnements',
  },
  {
    slug: 'devops',
    label: 'DevOps',
    description: 'CI/CD, déploiement, secrets, monitoring et alerting',
  },
  {
    slug: 'java',
    label: 'Java',
    description: 'Versions LTS, POO, collections, génériques et exceptions',
  },
  {
    slug: 'spring',
    label: 'Spring',
    description: 'Core, Boot, MVC, Data, Security et l’écosystème Spring',
  },
  {
    slug: 'agilite',
    label: 'Agilité',
    description: 'Scrum, user stories, cérémonies et estimation',
  },
  {
    slug: 'maven',
    label: 'Maven',
    description: 'Cycle de vie, dépendances et plugins',
  },
];
