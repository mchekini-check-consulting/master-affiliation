// Quiz par thématique (mêmes slugs que les cours) + quiz général.
import principesEtValeurs from './principes-et-valeurs.json';
import systemeInstitutionnel from './systeme-institutionnel.json';
import droitsEtDevoirs from './droits-et-devoirs.json';
import histoireGeographieCulture from './histoire-geographie-culture.json';
import vivreEnFrance from './vivre-en-france.json';

export const quizParTheme = [
  principesEtValeurs,
  systemeInstitutionnel,
  droitsEtDevoirs,
  histoireGeographieCulture,
  vivreEnFrance,
];

export const NB_QUESTIONS_GENERAL = 20;

/** Tirage du quiz général : questions mélangées de toutes les thématiques. */
export function tirerQuizGeneral() {
  const toutes = quizParTheme.flatMap((q) => q.questions);
  for (let i = toutes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [toutes[i], toutes[j]] = [toutes[j], toutes[i]];
  }
  return toutes.slice(0, NB_QUESTIONS_GENERAL);
}
