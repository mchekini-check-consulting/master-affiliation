// Modes d'entraînement présentés sur l'accueil, dans l'ordre d'affichage.
// Les modes en ligne pointent leur page d'entrée via `lien` ; les autres
// arriveront sur toutes les préparations et d'autres thématiques.
export interface Mode {
  slug: string;
  label: string;
  description: string;
  disponible: boolean;
  // Lien d'entrée du mode quand il est en ligne
  lien?: string;
  // Précision affichée à côté de l'état (ex. préparation couverte)
  precision?: string;
}

export const modes: Mode[] = [
  {
    slug: 'fiches',
    label: 'Fiches & quiz',
    description:
      'Des fiches de révision corrigées au stylo — mauvais exemples barrés en rouge, bons cochés en vert — et une interro à la fin de chaque fiche.',
    disponible: true,
  },
  {
    slug: 'simulation-entretien',
    label: 'Simulation d’entretien',
    description:
      'Un entretien technique grandeur nature : les questions s’enchaînent comme face à un recruteur, avec un débrief à la fin.',
    disponible: true,
    lien: '/fullstack/simulation/',
    precision: 'Dév Full Stack',
  },
  {
    slug: 'quiz',
    label: 'Quiz',
    description:
      'Des séries de QCM par thématique pour s’évaluer vite et repérer les chapitres à retravailler.',
    disponible: true,
    lien: '/fullstack/quiz/',
    precision: 'Dév Full Stack',
  },
  {
    slug: 'codingame',
    label: 'Codingame',
    description:
      'Un mélange de quiz et d’exercices de dev à résoudre, sur différentes thématiques et par niveau.',
    disponible: false,
  },
];
