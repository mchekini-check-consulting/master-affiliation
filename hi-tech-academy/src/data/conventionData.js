// Contenu des conventions de formation professionnelle, par formation.
// Chaque entrée alimente le générateur src/lib/conventionPdf.js (articles 1, 2,
// 5, 6 et 7 de la convention). Les articles juridiques communs (RGPD, qualité,
// réclamations, dédit…) vivent dans le générateur : ici, uniquement ce qui
// change d'une formation à l'autre.
//
// Pour ajouter une formation : copier la structure ci-dessous. Tant qu'une
// formation n'a pas d'entrée ici, l'admin ne propose pas de convention pour elle.

export const CONVENTION_DATA = {
  'essentiel-ia': {
    // Article 1 — objet
    categorieAction:
      "En l'espèce, l'action de formation prévue par la présente convention s'inscrit selon l'article " +
      "L.6313-1 du Code du travail dans le champ de l'acquisition, de l'entretien ou du perfectionnement des compétences.",
    objectifs: [
      "S'acculturer aux IA génératives : expliquer le fonctionnement et les limites des modèles (LLM, tokens, contexte, hallucinations, vie privée) et choisir l'outil adapté à chaque usage.",
      'Pratiquer le prompt engineering et les usages GenAI : méthode structurée, projets et instructions personnalisées, bibliothèque de prompts réutilisables.',
      "Appliquer l'IA à ses tâches professionnelles quotidiennes : rédaction, analyse de documents, RAG, Deep Research, mode vocal.",
      "Créer des contenus professionnels avec l'IA : images, présentations, sites web et applications web et mobiles sans code.",
      "Identifier et déployer des cas d'usage IA propres à son métier, automatiser ses premières tâches avec agents et connecteurs, et accompagner leur adoption dans son équipe.",
      'Inscrire ses usages dans le cadre réglementaire : RGPD, AI Act, protection des données sensibles et vérification des contenus générés.',
    ],
    contenu:
      "Cette formation permet d'acquérir l'essentiel de l'intelligence artificielle générative pour un usage " +
      'professionnel quotidien : fondamentaux des modèles (LLM), méthode de prompt engineering, application aux ' +
      "tâches courantes (rédaction, analyse de documents, recherche approfondie), création de contenus (images, " +
      "présentations, sites et applications sans code) et déploiement de cas d'usage propres à chaque métier, " +
      'dans le respect du cadre réglementaire (RGPD, AI Act). Le module « cas d’usage métiers » est animé par ' +
      'profil (commercial/marketing, RH/administratif, gestion/finance, support client).',
    nature: 'Action réalisée en distanciel (classe virtuelle synchrone Google Meet)',
    dureeLabel: '21 heures, réparties en séances à distance',
    prerequis: [
      'Aucun prérequis technique : formation non technique, accessible à tous.',
      'Pratique numérique régulière : ordinateur, navigateur web, messagerie et bureautique.',
    ],
    // Article 2 — effectif formé
    publicVise:
      "Entrepreneurs, indépendants, salariés et particuliers souhaitant acquérir l'essentiel de l'IA " +
      'générative pour leur quotidien professionnel.',
    // Article 5 — moyens pédagogiques et techniques
    moyensPedagogiques: [
      "Approche 100 % pratique ancrée dans les usages professionnels : démonstrations en direct, ateliers guidés, réalisations individuelles.",
      "Classe virtuelle synchrone Google Meet (caméra, partage d'écran, suivi de connexion).",
      "Manipulation des outils d'IA par chaque participant sur son propre poste, avec accompagnement individualisé.",
      'Support de cours, bibliothèque de prompts, fiches cas d’usage métiers et plan d’action personnel téléchargeables.',
    ],
    // Article 6 — suivi de l'exécution
    suiviExecution: [
      "Feuille d'émargement signée par demi-journée",
      'Rapport de connexion Google Meet pour suivi de présence',
      'Questionnaire de satisfaction à chaud en fin de formation',
      "Attestation de fin de formation (objectifs, nature, durée, résultats de l'évaluation)",
    ],
    // Article 7 — appréciation des résultats
    appreciationResultats: [
      "Positionnement initial via test de positionnement et questionnaire d'analyse du besoin",
      'Évaluation finale des acquis par QCM et atelier « boîte à outils IA métier » en fin de formation',
      'Évaluation à froid via questionnaire de satisfaction post-formation',
    ],
  },
};

/** Contenu de convention d'une formation, ou null si non couvert. */
export function getConventionData(formationId) {
  return CONVENTION_DATA[formationId] ?? null;
}
