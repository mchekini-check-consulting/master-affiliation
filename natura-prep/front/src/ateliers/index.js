// Registre des ateliers interactifs, rattachés aux thématiques de cours.
import frise from './frise.js';
import carteFrance from './carte-france.js';
import galeriePersonnages from './galerie-personnages.js';
import parcoursLoi from './parcours-loi.js';
import quiElitQui from './qui-elit-qui.js';
import symbolesLaicite from './symboles-laicite.js';
import vivreLaDevise from './vivre-la-devise.js';
import droitOuDevoir from './droit-ou-devoir.js';
import conqueteDroits from './conquete-droits.js';
import bonGuichet from './bon-guichet.js';
import parcoursSoins from './parcours-soins.js';

export const ateliers = [
  frise,
  carteFrance,
  galeriePersonnages,
  parcoursLoi,
  quiElitQui,
  symbolesLaicite,
  vivreLaDevise,
  droitOuDevoir,
  conqueteDroits,
  bonGuichet,
  parcoursSoins,
];

export function ateliersDeThematique(slugThematique) {
  return ateliers.filter((a) => a.thematique === slugThematique);
}

export function trouverAtelier(slugThematique, slugAtelier) {
  return ateliers.find((a) => a.thematique === slugThematique && a.slug === slugAtelier);
}
