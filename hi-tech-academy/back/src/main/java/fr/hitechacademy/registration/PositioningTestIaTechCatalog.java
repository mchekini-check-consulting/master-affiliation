package fr.hitechacademy.registration;

import java.util.List;

/**
 * Contenu du test de positionnement « IA for Tech » (document « Test de
 * positionnement – V1.0 » du 09/09/2026). Les prérequis (pratique courante
 * d'un langage de programmation) sont vérifiés ici, complétés d'un état des
 * lieux des notions IA ; le test n'est pas éliminatoire. Les bonnes réponses
 * vivent uniquement côté serveur ; l'ordre des options est mélangé.
 */
public final class PositioningTestIaTechCatalog {

    private PositioningTestIaTechCatalog() {
    }

    public static final List<String> SELF_LEVELS = List.of(
            "Débutant (je n'ai jamais intégré de LLM dans du code)",
            "Notions (quelques appels d'API ou prototypes)",
            "Intermédiaire (déjà des fonctionnalités LLM en production)");

    public static final List<String> KNOWN_TERMS = List.of(
            "Embeddings",
            "Tool use / function calling",
            "RAG",
            "MCP",
            "Evals");

    public static final List<PositioningTestCatalog.QcmQuestion> QUESTIONS = List.of(
            new PositioningTestCatalog.QcmQuestion(1, "Prérequis — Programmation",
                    "Une API REST renvoie généralement ses données au format...",
                    List.of("PDF", "JSON", "CSV uniquement", "Binaire propriétaire"), 1),
            new PositioningTestCatalog.QcmQuestion(2, "Prérequis — Programmation",
                    "Une variable d'environnement sert à...",
                    List.of("Accélérer le processeur",
                            "Configurer une application sans modifier son code (secrets, URLs)",
                            "Stocker les logs", "Compiler le programme"), 1),
            new PositioningTestCatalog.QcmQuestion(3, "Prérequis — Programmation",
                    "La commande git commit sert à...",
                    List.of("Envoyer le code au serveur distant",
                            "Supprimer des fichiers",
                            "Enregistrer un instantané des modifications dans l'historique",
                            "Installer les dépendances"), 2),
            new PositioningTestCatalog.QcmQuestion(4, "Notions IA",
                    "Un LLM génère du texte en...",
                    List.of("Cherchant dans une base de réponses",
                            "Exécutant des règles écrites à la main",
                            "Copiant des pages web",
                            "Prédisant les tokens les plus probables"), 3),
            new PositioningTestCatalog.QcmQuestion(5, "Notions IA",
                    "Le paramètre « temperature » contrôle...",
                    List.of("La vitesse de réponse",
                            "Le degré d'aléa / créativité de la génération",
                            "Le coût de l'appel", "La taille du contexte"), 1),
            new PositioningTestCatalog.QcmQuestion(6, "Notions IA",
                    "Le RAG consiste à...",
                    List.of("Réentraîner le modèle sur ses données",
                            "Compresser le contexte",
                            "Fournir au modèle des documents récupérés pour ancrer ses réponses",
                            "Chiffrer les prompts"), 2));
}
