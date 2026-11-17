package fr.hitechacademy.registration;

import java.util.List;

/**
 * Contenu de l'évaluation finale « L'essentiel de l'IA : fondamentaux, outils
 * et cas d'usage métiers », aligné sur le support de cours V2.0 (PPTX
 * « fondamentaux, outils et cas d'usage », novembre 2026) : chaque question
 * renvoie à une partie du support et aux objectifs opérationnels. QCM /10 ;
 * la partie pratique (atelier « boîte à outils IA métier » /10) est notée par
 * le formateur. Les bonnes réponses vivent uniquement ici, côté serveur.
 */
public final class FinalEvaluationEssentielIaCatalog {

    private FinalEvaluationEssentielIaCatalog() {
    }

    public static final List<FinalEvaluationCatalog.QcmQuestion> QUESTIONS = List.of(
            new FinalEvaluationCatalog.QcmQuestion(1,
                    "Quelle est la grande différence entre la programmation classique et le machine learning ?",
                    List.of("Le machine learning est toujours plus rapide",
                            "En machine learning, on montre des exemples et la machine trouve les règles toute seule",
                            "La programmation classique n'est plus utilisée",
                            "Le machine learning n'a pas besoin de données"), 1),
            new FinalEvaluationCatalog.QcmQuestion(2,
                    "Que fait exactement un LLM comme ChatGPT ou Claude quand il rédige une réponse ?",
                    List.of("Il recopie une page trouvée sur Internet",
                            "Il comprend le sens profond de la question comme un humain",
                            "Il prédit, mot après mot (token après token), la suite la plus probable du texte",
                            "Il interroge une base de données de réponses toutes faites"), 2),
            new FinalEvaluationCatalog.QcmQuestion(3,
                    "L'IA cite un arrêt de justice qui n'existe pas, avec aplomb. Comment s'appelle ce phénomène ?",
                    List.of("La température",
                            "Le fine-tuning",
                            "Le contexte",
                            "Une hallucination"), 3),
            new FinalEvaluationCatalog.QcmQuestion(4,
                    "L'IA répond à partir du règlement intérieur que vous lui avez fourni, et cite l'article exact. Quelle technique est à l'œuvre ?",
                    List.of("Le RAG : l'IA s'appuie sur vos documents pour répondre",
                            "Le fine-tuning : le modèle a été réentraîné",
                            "La régression : l'IA prédit un chiffre",
                            "Le deepfake"), 0),
            new FinalEvaluationCatalog.QcmQuestion(5,
                    "Estimer le loyer d'un studio à partir de sa surface et de son quartier, c'est un problème de...",
                    List.of("Classification : ranger dans une case",
                            "IA générative : créer un contenu nouveau",
                            "Régression : prédire un chiffre",
                            "Connecteur (MCP)"), 2),
            new FinalEvaluationCatalog.QcmQuestion(6,
                    "Quelle information ne faut-il JAMAIS coller dans un assistant IA grand public ?",
                    List.of("Le plan d'une présentation à préparer",
                            "Le numéro de sécurité sociale d'un salarié ou un mot de passe",
                            "Une question de culture générale",
                            "Des notes de réunion anonymisées"), 1),
            new FinalEvaluationCatalog.QcmQuestion(7,
                    "Parmi ces demandes, laquelle applique le mieux la méthode de prompt vue en formation ?",
                    List.of("« Écris un mail à mon client »",
                            "« Fais vite un texte commercial »",
                            "« Tu es responsable ADV ; rédige un e-mail de relance courtois pour la facture n° 124 impayée depuis 30 jours, 10 lignes maximum, avec un objet »",
                            "« MAIL CLIENT URGENT »"), 2),
            new FinalEvaluationCatalog.QcmQuestion(8,
                    "Quelle est la différence entre une automatisation et un agent IA ?",
                    List.of("Aucune, ce sont deux noms pour la même chose",
                            "L'automatisation suit une recette fixe ; l'agent reçoit un objectif et choisit lui-même les étapes avec ses outils",
                            "Un agent est toujours gratuit",
                            "L'automatisation est interdite par l'AI Act"), 1),
            new FinalEvaluationCatalog.QcmQuestion(9,
                    "Avant de confier une tâche de son métier à l'IA, quel est le bon profil de tâche pour commencer ?",
                    List.of("Une décision stratégique engageant l'entreprise",
                            "Une tâche dont personne ne peut vérifier le résultat",
                            "Une tâche répétitive et chronophage, dont le résultat peut être vérifié avant usage",
                            "Une tâche impliquant des données médicales de salariés"), 2),
            new FinalEvaluationCatalog.QcmQuestion(10,
                    "Que prévoit l'AI Act, le règlement européen sur l'IA ?",
                    List.of("L'interdiction totale de l'IA en entreprise",
                            "Une classification des usages par niveau de risque, avec des obligations croissantes (transparence, haut risque, interdits)",
                            "Une taxe sur chaque prompt",
                            "Il ne concerne que les éditeurs américains"), 1));
}
