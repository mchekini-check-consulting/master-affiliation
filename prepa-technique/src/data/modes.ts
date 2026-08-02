// Modes d'entraînement présentés sur l'accueil, dans l'ordre d'affichage.
// Les modes à venir toucheront toutes les préparations et d'autres
// thématiques ; seul le mode « Fiches & quiz » est en ligne aujourd'hui.
export interface Mode {
  slug: string;
  label: string;
  description: string;
  disponible: boolean;
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
    disponible: false,
  },
  {
    slug: 'quiz',
    label: 'Quiz',
    description:
      'Des séries de QCM par thématique pour s’évaluer vite et repérer les chapitres à retravailler.',
    disponible: false,
  },
  {
    slug: 'codingame',
    label: 'Codingame',
    description:
      'Un mélange de quiz et d’exercices de dev à résoudre, sur différentes thématiques et par niveau.',
    disponible: false,
  },
];
