import { Brain, Cloud, GraduationCap, Receipt } from '@phosphor-icons/react';
import { formations } from '@/data/formations';

// Catégories du catalogue, DÉDUITES des `tag` des formations : une formation
// ajoutée dans une nouvelle catégorie apparaît d'elle-même dans le méga-menu
// et dans les filtres de /formations. Seuls l'icône et la phrase d'accroche
// sont écrits à la main ; une catégorie inconnue retombe sur des valeurs par
// défaut plutôt que de disparaître.

const META = {
  'Infrastructure & Cloud': {
    icon: Cloud,
    description: 'Conteneurs, Kubernetes et déploiement de vos applications sur le cloud.',
  },
  'Gestion & Comptabilité': {
    icon: Receipt,
    description: 'Facturation électronique et pilotage de la gestion avec Pennylane.',
  },
  'Intelligence Artificielle': {
    icon: Brain,
    description: "De la prise en main de l'IA aux agents et processus en production.",
  },
};

/** « Gestion & Comptabilité » → « gestion-comptabilite » (paramètre d'URL). */
export function slugCategorie(tag) {
  return tag
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const categories = Array.from(new Set(formations.map((f) => f.tag))).map((tag) => {
  const liste = formations.filter((f) => f.tag === tag);
  return {
    tag,
    slug: slugCategorie(tag),
    icon: META[tag]?.icon ?? GraduationCap,
    description: META[tag]?.description ?? `${liste.length} formation${liste.length > 1 ? 's' : ''} au catalogue.`,
    formations: liste,
  };
});

export function getCategorieBySlug(slug) {
  return categories.find((c) => c.slug === slug) ?? null;
}
