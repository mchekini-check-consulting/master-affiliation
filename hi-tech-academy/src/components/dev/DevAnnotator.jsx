import React, { Suspense, lazy } from 'react';

// Agentation — barre d'annotation visuelle pour les agents de code : on clique
// un élément de la page, on écrit une note, et l'outil produit un markdown avec
// le sélecteur exact, ce qui évite de décrire « le bouton vert en haut ».
//
// C'est un outil de DÉVELOPPEMENT : il ne doit jamais partir en production.
// Deux garde-fous, volontairement redondants :
//   1. `import.meta.env.DEV` — remplacé par `false` à la compilation, donc
//      Rollup élimine la branche et le paquet sort du bundle de production ;
//   2. l'import est paresseux, ce qui garde le code hors du chunk principal
//      même en développement.
const Agentation = import.meta.env.DEV
  ? lazy(() => import('agentation').then((module) => ({ default: module.Agentation })))
  : null;

export default function DevAnnotator() {
  if (!Agentation) return null;

  return (
    <Suspense fallback={null}>
      <Agentation />
    </Suspense>
  );
}
