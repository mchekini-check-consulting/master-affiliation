package fr.hitechacademy.registration;

import java.util.List;

/**
 * Contenu du test de positionnement « L'essentiel de l'IA : fondamentaux,
 * outils et cas d'usage métiers » (document « Test de positionnement – V1.1 »
 * du 08/10/2026). Le test vérifie le prérequis (pratique numérique régulière)
 * et situe les notions d'IA et le cadre d'usage, pour adapter la session ;
 * il n'est pas éliminatoire. Les bonnes réponses vivent uniquement ici, côté
 * serveur ; l'ordre des options est mélangé.
 */
public final class PositioningTestEssentielIaCatalog {

    private PositioningTestEssentielIaCatalog() {
    }

    public static final List<String> SELF_LEVELS = List.of(
            "Débutant (je n'ai jamais ou presque jamais utilisé d'IA)",
            "Notions (j'utilise un assistant IA de temps en temps)",
            "Intermédiaire (usage régulier, je cherche des usages concrets pour mon métier)");

    public static final List<String> KNOWN_TERMS = List.of(
            "Prompt",
            "IA générative",
            "LLM (modèle de langage)",
            "Hallucination",
            "Agent IA",
            "RAG",
            "AI Act");

    public static final List<PositioningTestCatalog.QcmQuestion> QUESTIONS = List.of(
            new PositioningTestCatalog.QcmQuestion(1, "Votre pratique numérique",
                    "Pour partager un document volumineux avec un collègue, la solution la plus adaptée est...",
                    List.of("L'imprimer et le remettre en main propre",
                            "Un lien vers le fichier stocké en ligne (Drive, OneDrive…)",
                            "Le recopier dans le corps de l'e-mail", "L'envoyer par SMS"), 1),
            new PositioningTestCatalog.QcmQuestion(2, "Votre pratique numérique",
                    "Enregistrer un document au format PDF sert à...",
                    List.of("Figer la mise en page pour le partager tel quel",
                            "Réduire la qualité du document", "Le rendre modifiable par tous",
                            "Le protéger contre les virus"), 0),
            new PositioningTestCatalog.QcmQuestion(3, "L'IA : notions",
                    "Qu'est-ce qu'un LLM (grand modèle de langage) ?",
                    List.of("Un moteur de recherche qui classe des pages web",
                            "Un modèle entraîné sur de grands volumes de texte, capable de générer des réponses",
                            "Une base de données de réponses rédigées à l'avance",
                            "Un logiciel de traduction mot à mot"), 1),
            new PositioningTestCatalog.QcmQuestion(4, "L'IA : notions",
                    "Une « hallucination » d'IA désigne...",
                    List.of("Un bug d'affichage", "Une réponse inventée présentée comme vraie",
                            "Une panne de serveur", "Une image générée floue"), 1),
            new PositioningTestCatalog.QcmQuestion(5, "L'IA : notions",
                    "Un « prompt », c'est...",
                    List.of("Le nom du modèle", "Un abonnement payant",
                            "Un raccourci clavier",
                            "L'instruction ou la question que l'on donne à l'IA"), 3),
            new PositioningTestCatalog.QcmQuestion(6, "L'IA : notions",
                    "Le RAG (génération augmentée par la recherche) permet...",
                    List.of("d'entraîner un nouveau modèle sur vos données",
                            "d'appuyer les réponses de l'IA sur vos propres documents",
                            "d'accélérer la connexion internet",
                            "de traduire automatiquement vos fichiers"), 1),
            new PositioningTestCatalog.QcmQuestion(7, "L'IA : notions",
                    "Un agent IA se distingue d'un simple assistant conversationnel parce qu'il...",
                    List.of("répond plus vite",
                            "peut enchaîner des actions et utiliser des outils (agenda, e-mails, fichiers) pour accomplir une tâche",
                            "fonctionne sans connexion internet", "est toujours gratuit"), 1),
            new PositioningTestCatalog.QcmQuestion(8, "Cadre d'usage",
                    "Quand vous utilisez une IA en ligne avec des données clients, le RGPD prévoit que...",
                    List.of("le RGPD ne s'applique pas à l'IA",
                            "vous restez responsable de la protection des données transmises",
                            "l'éditeur de l'IA devient seul responsable",
                            "il suffit de retirer le nom de l'entreprise"), 1));
}
