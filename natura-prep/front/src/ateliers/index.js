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
import bonPalais from './bon-palais.js';
import europe from './europe.js';
import joursFeries from './jours-feries.js';
import ecole from './ecole.js';

export const ateliers = [
  frise,
  carteFrance,
  galeriePersonnages,
  joursFeries,
  parcoursLoi,
  quiElitQui,
  bonPalais,
  europe,
  symbolesLaicite,
  vivreLaDevise,
  droitOuDevoir,
  conqueteDroits,
  bonGuichet,
  parcoursSoins,
  ecole,
];

export function ateliersDeThematique(slugThematique) {
  return ateliers.filter((a) => a.thematique === slugThematique);
}

export function trouverAtelier(slugThematique, slugAtelier) {
  return ateliers.find((a) => a.thematique === slugThematique && a.slug === slugAtelier);
}
