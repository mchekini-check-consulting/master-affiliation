package fr.hitechacademy.registration;

import java.util.List;

/**
 * Contenu du test de positionnement « L'essentiel de l'IA : fondamentaux,
 * outils et cas d'usage métiers » (document « Test de positionnement – V1.0 »
 * du 05/10/2026). Le test vérifie le prérequis (pratique numérique régulière)
 * et fait un état des lieux des premières notions d'IA pour adapter la
 * session ; il n'est pas éliminatoire. Les bonnes réponses vivent uniquement
 * ici, côté serveur ; l'ordre des options est mélangé.
 */
public final class PositioningTestEssentielIaCatalog {

    private PositioningTestEssentielIaCatalog() {
    }

    public static final List<String> SELF_LEVELS = List.of(
            "Débutant (je n'ai jamais ou presque jamais utilisé d'IA)",
            "Notions (j'utilise ChatGPT ou équivalent de temps en temps)",
            "Intermédiaire (usage régulier, je cherche des usages concrets pour mon métier)");

    public static final List<String> KNOWN_TERMS = List.of(
            "Prompt",
            "IA générative",
            "LLM (modèle de langage)",
            "Hallucination",
            "Agent IA");

    public static final List<PositioningTestCatalog.QcmQuestion> QUESTIONS = List.of(
            new PositioningTestCatalog.QcmQuestion(1, "Votre pratique numérique",
                    "Pour partager un document volumineux avec un collègue, la solution la plus adaptée est...",
                    List.of("L'imprimer et le remettre en main propre",
                            "Un lien vers le fichier stocké en ligne (Drive, OneDrive…)",
                            "Le recopier dans le corps de l'e-mail", "L'envoyer par SMS"), 1),
            new PositioningTestCatalog.QcmQuestion(2, "Votre pratique numérique",
                    "Un tableur (Excel, Google Sheets) sert principalement à...",
                    List.of("Retoucher des images", "Envoyer des e-mails",
                            "Naviguer sur internet",
                            "Organiser et calculer des données en lignes et colonnes"), 3),
            new PositioningTestCatalog.QcmQuestion(3, "Votre pratique numérique",
                    "Enregistrer un document au format PDF sert à...",
                    List.of("Figer la mise en page pour le partager tel quel",
                            "Réduire la qualité du document", "Le rendre modifiable par tous",
                            "Le protéger contre les virus"), 0),
            new PositioningTestCatalog.QcmQuestion(4, "L'IA : premières notions",
                    "ChatGPT, Claude ou Gemini sont...",
                    List.of("Des moteurs de recherche classiques", "Des réseaux sociaux",
                            "Des assistants conversationnels fondés sur des modèles de langage",
                            "Des logiciels de visioconférence"), 2),
            new PositioningTestCatalog.QcmQuestion(5, "L'IA : premières notions",
                    "Une « hallucination » d'IA désigne...",
                    List.of("Un bug d'affichage", "Une réponse inventée présentée comme vraie",
                            "Une panne de serveur", "Une image générée floue"), 1),
            new PositioningTestCatalog.QcmQuestion(6, "L'IA : premières notions",
                    "Un « prompt », c'est...",
                    List.of("Le nom du modèle", "Un abonnement payant",
                            "Un raccourci clavier",
                            "L'instruction ou la question que l'on donne à l'IA"), 3));
}
