// Registre des ateliers interactifs, rattachés aux thématiques de cours.
import frise from './frise.js';
import carteFrance from './carte-france.js';
import parcoursLoi from './parcours-loi.js';
import symbolesLaicite from './symboles-laicite.js';
import droitOuDevoir from './droit-ou-devoir.js';
import bonGuichet from './bon-guichet.js';

export const ateliers = [frise, carteFrance, parcoursLoi, symbolesLaicite, droitOuDevoir, bonGuichet];

export function ateliersDeThematique(slugThematique) {
  return ateliers.filter((a) => a.thematique === slugThematique);
}

export function trouverAtelier(slugThematique, slugAtelier) {
  return ateliers.find((a) => a.thematique === slugThematique && a.slug === slugAtelier);
}
