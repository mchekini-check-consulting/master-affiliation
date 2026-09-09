package fr.hitechacademy.registration;

import java.util.List;

/**
 * QCM de l'évaluation finale « IA for Tech » (document « Évaluation finale –
 * V1.0 » du 09/09/2026, partie A — la partie B « projet final : application
 * agentique déployée (RAG + MCP + evals) » est évaluée par le formateur).
 * Chaque objectif opérationnel du programme est couvert par deux questions ;
 * le corrigé vit uniquement côté serveur.
 */
public final class FinalEvaluationIaTechCatalog {

    private FinalEvaluationIaTechCatalog() {
    }

    public static final List<FinalEvaluationCatalog.QcmQuestion> QUESTIONS = List.of(
            new FinalEvaluationCatalog.QcmQuestion(1,
                    "La fenêtre de contexte d'un modèle limite...",
                    List.of("Le nombre d'utilisateurs simultanés",
                            "La quantité de tokens que le modèle peut traiter dans un échange",
                            "La durée d'une conversation en minutes",
                            "Le nombre de langues supportées"), 1),
            new FinalEvaluationCatalog.QcmQuestion(2,
                    "Quand privilégier un petit modèle ?",
                    List.of("Jamais : le plus gros modèle est toujours meilleur",
                            "Pour les raisonnements les plus complexes",
                            "Pour les tâches simples à fort volume où latence et coût priment",
                            "Uniquement en environnement de test"), 2),
            new FinalEvaluationCatalog.QcmQuestion(3,
                    "En production, face aux erreurs de rate limit (429), la bonne pratique est...",
                    List.of("Réessayer immédiatement en boucle",
                            "Ignorer l'erreur et rendre une réponse vide",
                            "Changer de fournisseur à chaque erreur",
                            "Des retries avec backoff exponentiel et une gestion de quota"), 3),
            new FinalEvaluationCatalog.QcmQuestion(4,
                    "Le tool use / function calling permet...",
                    List.of("Au modèle de demander l'exécution de fonctions définies par le développeur",
                            "Au modèle de modifier son propre code",
                            "De réduire le coût des appels",
                            "De supprimer les hallucinations"), 0),
            new FinalEvaluationCatalog.QcmQuestion(5,
                    "Dans un pipeline RAG, les embeddings servent à...",
                    List.of("Chiffrer les documents",
                            "Représenter les textes en vecteurs pour la recherche sémantique",
                            "Compresser la base de données",
                            "Générer les réponses finales"), 1),
            new FinalEvaluationCatalog.QcmQuestion(6,
                    "Le RAG est préférable au fine-tuning quand...",
                    List.of("On veut changer le style de réponse du modèle",
                            "Le budget GPU est illimité",
                            "Les connaissances changent souvent et doivent être sourcées",
                            "Les données tiennent dans le prompt"), 2),
            new FinalEvaluationCatalog.QcmQuestion(7,
                    "MCP (Model Context Protocol) est...",
                    List.of("Un format de fichier de prompts",
                            "Un protocole standard pour connecter modèles, outils et sources de données",
                            "Une base de données vectorielle",
                            "Un modèle open-source"), 1),
            new FinalEvaluationCatalog.QcmQuestion(8,
                    "Le sandboxing d'un agent qui exécute du code sert à...",
                    List.of("Accélérer l'exécution",
                            "Réduire la consommation de tokens",
                            "Améliorer la qualité du code généré",
                            "Isoler l'exécution pour protéger le système hôte"), 3),
            new FinalEvaluationCatalog.QcmQuestion(9,
                    "Un « LLM-as-judge » est...",
                    List.of("Un modèle qui évalue les sorties d'un autre selon des critères définis",
                            "Un tribunal d'arbitrage pour litiges IA",
                            "Un modèle spécialisé en droit",
                            "Un composant qui bloque les requêtes interdites"), 0),
            new FinalEvaluationCatalog.QcmQuestion(10,
                    "La prompt injection est...",
                    List.of("Une technique d'optimisation des prompts",
                            "Une manipulation du modèle via du contenu malveillant dans le contexte, à contrer par guardrails et moindre privilège",
                            "Un bug d'affichage des conversations",
                            "Une méthode de compression du contexte"), 1));
}
