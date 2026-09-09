package fr.hitechacademy.registration;

import java.util.List;

/**
 * QCM de l'évaluation finale « IA pour tous » (document « Évaluation finale –
 * V1.0 » du 09/09/2026, partie A — la partie B « atelier boîte à outils IA »
 * est évaluée par le formateur pendant la session). Chaque objectif
 * opérationnel du programme est couvert par deux questions ; le corrigé vit
 * uniquement côté serveur.
 */
public final class FinalEvaluationIaCatalog {

    private FinalEvaluationIaCatalog() {
    }

    public static final List<FinalEvaluationCatalog.QcmQuestion> QUESTIONS = List.of(
            new FinalEvaluationCatalog.QcmQuestion(1,
                    "Un LLM (modèle de langage) est...",
                    List.of("Une base de réponses rédigées par des humains",
                            "Un modèle entraîné à prédire du texte à partir d'immenses corpus",
                            "Un moteur de recherche amélioré", "Un robot physique"), 1),
            new FinalEvaluationCatalog.QcmQuestion(2,
                    "Face à une réponse d'IA contenant des faits importants, le bon réflexe est de...",
                    List.of("La copier telle quelle", "Considérer que l'IA ne se trompe jamais",
                            "Vérifier les informations à la source avant de les utiliser",
                            "La partager immédiatement"), 2),
            new FinalEvaluationCatalog.QcmQuestion(3,
                    "Un bon prompt contient généralement...",
                    List.of("Le moins de détails possible",
                            "Un rôle, un contexte, une tâche précise et un format attendu",
                            "Uniquement des mots-clés", "Des majuscules pour insister"), 1),
            new FinalEvaluationCatalog.QcmQuestion(4,
                    "Les projets et instructions personnalisées servent à...",
                    List.of("Payer moins cher son abonnement",
                            "Configurer une fois ses préférences pour toutes les conversations",
                            "Accélérer sa connexion internet", "Supprimer l'historique"), 1),
            new FinalEvaluationCatalog.QcmQuestion(5,
                    "Le RAG consiste à...",
                    List.of("Rendre l'IA plus rapide",
                            "Générer des images réalistes",
                            "Connecter l'IA à ses documents pour des réponses fiables et sourcées",
                            "Traduire automatiquement"), 2),
            new FinalEvaluationCatalog.QcmQuestion(6,
                    "Deep Research sert à...",
                    List.of("Obtenir un rapport documenté et sourcé en quelques minutes",
                            "Coder un site web", "Retoucher des photos", "Envoyer des e-mails"), 0),
            new FinalEvaluationCatalog.QcmQuestion(7,
                    "Créer un site web sans coder avec l'IA...",
                    List.of("Est impossible sans développeur",
                            "Est possible avec les outils de génération dédiés",
                            "N'existe qu'en anglais", "Nécessite d'installer un serveur"), 1),
            new FinalEvaluationCatalog.QcmQuestion(8,
                    "Pour obtenir une bonne image générée par IA, il faut...",
                    List.of("Écrire un seul mot", "Savoir dessiner",
                            "Décrire précisément le sujet, le style et la composition",
                            "Obligatoirement téléverser une photo"), 2),
            new FinalEvaluationCatalog.QcmQuestion(9,
                    "Un agent IA se distingue d'un simple chatbot car...",
                    List.of("Il est plus poli", "Il fonctionne sans internet",
                            "Il est toujours gratuit",
                            "Il peut effectuer des actions (naviguer, réserver, remplir) et pas seulement répondre"), 3),
            new FinalEvaluationCatalog.QcmQuestion(10,
                    "Face à une vidéo suspecte (deepfake possible), le bon réflexe est de...",
                    List.of("La partager pour demander l'avis de ses proches",
                            "Vérifier la source et recouper avant de partager",
                            "Faire confiance si elle semble réaliste",
                            "Considérer qu'aucune vérification n'est possible"), 1));
}
