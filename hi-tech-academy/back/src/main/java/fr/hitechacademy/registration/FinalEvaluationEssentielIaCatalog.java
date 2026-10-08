package fr.hitechacademy.registration;

import java.util.List;

/**
 * Contenu de l'évaluation finale « L'essentiel de l'IA : fondamentaux, outils
 * et cas d'usage métiers » (document « Évaluation finale – V1.0 » du
 * 05/10/2026). Partie A : QCM /10 (chaque objectif opérationnel couvert par
 * deux questions) ; la partie B (atelier « boîte à outils IA métier » /10)
 * est notée par le formateur. Les bonnes réponses vivent uniquement ici,
 * côté serveur ; l'ordre des options est mélangé.
 */
public final class FinalEvaluationEssentielIaCatalog {

    private FinalEvaluationEssentielIaCatalog() {
    }

    public static final List<FinalEvaluationCatalog.QcmQuestion> QUESTIONS = List.of(
            new FinalEvaluationCatalog.QcmQuestion(1,
                    "Que peut-il arriver quand on pose une question à une IA ?",
                    List.of("Elle a toujours raison",
                            "Elle peut se tromper et inventer une réponse qui a l'air vraie",
                            "Elle refuse toujours de répondre", "Elle ne répond qu'en anglais"), 1),
            new FinalEvaluationCatalog.QcmQuestion(2,
                    "Quelle information vaut-il mieux ne pas donner à une IA ?",
                    List.of("Le sujet d'un e-mail à rédiger", "Une question de culture générale",
                            "Un mot de passe ou des données confidentielles de clients",
                            "Le plan d'une présentation"), 2),
            new FinalEvaluationCatalog.QcmQuestion(3,
                    "Pour obtenir une bonne réponse de l'IA, il vaut mieux...",
                    List.of("Écrire un seul mot", "Poser dix questions d'un coup",
                            "Écrire en majuscules",
                            "Expliquer clairement ce qu'on veut : le contexte, la tâche et le format attendu"), 3),
            new FinalEvaluationCatalog.QcmQuestion(4,
                    "Une bibliothèque de prompts sert à...",
                    List.of("Garder ses meilleures instructions pour les réutiliser",
                            "Payer moins cher", "Supprimer son historique", "Traduire ses messages"), 0),
            new FinalEvaluationCatalog.QcmQuestion(5,
                    "Pour prendre connaissance d'un long PDF rapidement, le plus efficace est de...",
                    List.of("Le recopier à la main", "L'imprimer",
                            "Le donner à l'IA et lui demander un résumé des points clés",
                            "Le lire trois fois"), 2),
            new FinalEvaluationCatalog.QcmQuestion(6,
                    "Connecter l'IA à ses propres documents permet...",
                    List.of("De rendre l'ordinateur plus rapide",
                            "D'obtenir des réponses appuyées sur ses documents, avec les sources",
                            "De compresser les fichiers", "De changer la langue du clavier"), 1),
            new FinalEvaluationCatalog.QcmQuestion(7,
                    "Pour préparer une présentation rapidement avec l'IA, on peut...",
                    List.of("Décrire le sujet et le plan attendu, puis ajuster le résultat",
                            "Scanner des diapositives papier", "C'est impossible sans graphiste",
                            "Recopier un modèle à la main"), 0),
            new FinalEvaluationCatalog.QcmQuestion(8,
                    "Créer un site web ou une application sans code, c'est...",
                    List.of("Impossible", "Réservé aux informaticiens",
                            "Possible uniquement en payant un développeur",
                            "Possible en décrivant à l'IA le site ou l'application souhaité"), 3),
            new FinalEvaluationCatalog.QcmQuestion(9,
                    "Un agent IA, c'est une IA qui...",
                    List.of("Parle plus fort", "Fonctionne sans internet",
                            "Peut agir pour vous (remplir, réserver, envoyer) et pas seulement répondre",
                            "Est forcément payante"), 2),
            new FinalEvaluationCatalog.QcmQuestion(10,
                    "Vous recevez une vidéo surprenante qui semble truquée. Le bon réflexe est de...",
                    List.of("La partager tout de suite", "Y croire si l'image est nette",
                            "Répondre en donnant vos coordonnées",
                            "Vérifier la source avant d'y croire ou de la partager"), 3));
}
