package fr.hitechacademy.registration;

import java.util.List;

/**
 * Contenu du test de positionnement « IA for Tech » (document « Test de
 * positionnement – V1.1 » du 08/10/2026). Test volontairement poussé : il
 * vérifie les prérequis (pratique courante d'un langage de programmation)
 * puis sonde le niveau réel sur l'ingénierie LLM, le RAG, les systèmes
 * agentiques et la supervision en production, pour calibrer la session ;
 * il n'est pas éliminatoire. Les bonnes réponses vivent uniquement côté
 * serveur ; l'ordre des options est mélangé.
 */
public final class PositioningTestIaTechCatalog {

    private PositioningTestIaTechCatalog() {
    }

    public static final List<String> SELF_LEVELS = List.of(
            "Débutant (je n'ai jamais intégré de LLM dans du code)",
            "Notions (quelques appels d'API ou prototypes)",
            "Confirmé (fonctionnalités LLM en production : RAG, agents ou evals)");

    public static final List<String> KNOWN_TERMS = List.of(
            "Embeddings",
            "Hybrid search / reranking",
            "Tool use / function calling",
            "RAG agentique",
            "MCP",
            "Evals / LLM-as-judge",
            "Guardrails / prompt injection",
            "Observabilité des agents");

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
            new PositioningTestCatalog.QcmQuestion(4, "Ingénierie LLM",
                    "Un LLM génère du texte en...",
                    List.of("Cherchant dans une base de réponses",
                            "Exécutant des règles écrites à la main",
                            "Copiant des pages web",
                            "Prédisant les tokens les plus probables"), 3),
            new PositioningTestCatalog.QcmQuestion(5, "Ingénierie LLM",
                    "Le paramètre « temperature » contrôle...",
                    List.of("La vitesse de réponse",
                            "Le degré d'aléa / créativité de la génération",
                            "Le coût de l'appel", "La taille du contexte"), 1),
            new PositioningTestCatalog.QcmQuestion(6, "Ingénierie LLM",
                    "La fenêtre de contexte d'un LLM désigne...",
                    List.of("La durée maximale d'une session",
                            "La quantité de tokens que le modèle peut prendre en compte dans un échange",
                            "Le nombre d'utilisateurs simultanés",
                            "La mémoire disque du serveur d'inférence"), 1),
            new PositioningTestCatalog.QcmQuestion(7, "RAG",
                    "Le RAG consiste à...",
                    List.of("Réentraîner le modèle sur ses données",
                            "Compresser le contexte",
                            "Fournir au modèle des documents récupérés pour ancrer ses réponses",
                            "Chiffrer les prompts"), 2),
            new PositioningTestCatalog.QcmQuestion(8, "RAG",
                    "Dans un pipeline RAG, le « chunking » consiste à...",
                    List.of("Compresser le modèle",
                            "Découper les documents en segments avant de calculer leurs embeddings",
                            "Supprimer les doublons de la base",
                            "Chiffrer les requêtes"), 1),
            new PositioningTestCatalog.QcmQuestion(9, "RAG",
                    "Après une recherche hybride (vecteurs + mots-clés), le reranking sert à...",
                    List.of("Réordonner les passages récupérés selon leur pertinence réelle pour la requête",
                            "Mettre en cache les réponses",
                            "Réduire la facture d'API",
                            "Traduire les documents récupérés"), 0),
            new PositioningTestCatalog.QcmQuestion(10, "Systèmes agentiques",
                    "Dans une boucle agentique de type ReAct, le modèle...",
                    List.of("Génère la réponse finale en un seul appel",
                            "Alterne raisonnement et appels d'outils jusqu'à atteindre l'objectif",
                            "Réentraîne ses poids à chaque étape",
                            "Délègue toutes les décisions à un humain"), 1),
            new PositioningTestCatalog.QcmQuestion(11, "Systèmes agentiques",
                    "MCP (Model Context Protocol) sert à...",
                    List.of("Compresser les prompts",
                            "Standardiser l'accès des modèles à des outils et sources de données externes",
                            "Héberger des modèles open source",
                            "Mesurer la latence réseau"), 1),
            new PositioningTestCatalog.QcmQuestion(12, "Fiabilité et supervision",
                    "La « prompt injection » est...",
                    List.of("Une technique d'optimisation des prompts",
                            "Une attaque où un contenu externe détourne les instructions du système",
                            "Un bug du tokenizer",
                            "Une méthode de fine-tuning"), 1),
            new PositioningTestCatalog.QcmQuestion(13, "Fiabilité et supervision",
                    "Une eval « LLM-as-judge » consiste à...",
                    List.of("Demander aux utilisateurs de noter l'application",
                            "Faire noter les sorties du système par un modèle selon une grille définie",
                            "Mesurer uniquement la latence",
                            "Comparer les prix des fournisseurs"), 1),
            new PositioningTestCatalog.QcmQuestion(14, "Fiabilité et supervision",
                    "Pour superviser des agents IA en production, le signal le plus utile est...",
                    List.of("Le nombre de lignes de code",
                            "Les traces d'exécution (étapes, outils appelés, tokens, coûts) avec alertes sur les échecs",
                            "La fréquence des déploiements",
                            "Le nombre de commits par jour"), 1));
}
