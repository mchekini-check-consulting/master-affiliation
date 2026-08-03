// Suivi de progression du membre : fiches lues, ateliers lancés, meilleurs
// scores de quiz. Cache mémoire chargé à l'ouverture de l'espace ; les
// enregistrements partent en tâche de fond (l'UI n'attend jamais le réseau).
import { api } from './api.js';

const cache = new Map(); // "type:cle" -> valeur

export async function chargerProgression() {
  try {
    const lignes = await api('/progression');
    cache.clear();
    lignes.forEach((l) => cache.set(`${l.type}:${l.cle}`, l.valeur));
  } catch {
    // Hors ligne ou erreur : l'espace fonctionne sans progression
  }
}

export function enregistrerProgression(type, cle, valeur) {
  const actuelle = cache.get(`${type}:${cle}`) ?? -1;
  if (valeur <= actuelle) return; // on ne garde que le meilleur
  cache.set(`${type}:${cle}`, valeur);
  api('/progression', { methode: 'POST', corps: { type, cle, valeur } }).catch(() => {});
}

export function ficheLue(slugThematique, slugFiche) {
  return cache.has(`fiche:${slugThematique}/${slugFiche}`);
}

export function compterFichesLues(thematique) {
  return thematique.fiches.filter((f) => ficheLue(thematique.slug, f.slug)).length;
}

export function atelierLance(slugAtelier) {
  return cache.has(`atelier:${slugAtelier}`);
}

export function meilleurScoreQuiz(slugQuiz) {
  return cache.get(`quiz:${slugQuiz}`) ?? null;
}

/** Avancement global d'une thématique en %, fiches + ateliers + quiz confondus. */
export function avancementThematique(thematique, ateliers, slugQuiz) {
  const total = thematique.fiches.length + ateliers.length + (slugQuiz ? 1 : 0);
  if (!total) return 0;
  let fait = compterFichesLues(thematique);
  fait += ateliers.filter((a) => atelierLance(a.slug)).length;
  if (slugQuiz && meilleurScoreQuiz(slugQuiz) !== null) fait += 1;
  return Math.round((fait / total) * 100);
}
