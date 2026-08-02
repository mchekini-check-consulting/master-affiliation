import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Une « fiche » = un chapitre de révision. Rangée dans
// src/content/fiches/<categorie>/<slug>.md ; l'ordre dans la catégorie
// est porté par `ordre` (numérotation du parcours de révision).
// Le champ `preparations` définit dans quelles préparations cette fiche apparaît.
const fiches = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/fiches' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    categorie: z.enum([
      'craftmanship',
      'git',
      'devops',
      'java',
      'spring',
      'agilite',
      'maven',
    ]),
    ordre: z.number(),
    preparations: z.array(z.enum(['fullstack', 'business-analyst', 'qa', 'devops'])).default(['fullstack']),
  }),
});

export const collections = { fiches };
