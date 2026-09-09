package fr.hitechacademy.registration;

import java.util.List;

/**
 * Contenu du test de positionnement « IA for Business » (document « Test de
 * positionnement – V1.0 » du 09/09/2026). La formation est sans prérequis :
 * le test sert d'état des lieux (usages de l'IA, notions business) pour
 * adapter la session, pas de filtre. Les bonnes réponses vivent uniquement
 * ici, côté serveur ; l'ordre des options est mélangé.
 */
public final class PositioningTestIaBusinessCatalog {

    private PositioningTestIaBusinessCatalog() {
    }

    public static final List<String> SELF_LEVELS = List.of(
            "Débutant (pas encore de projet / jamais utilisé d'IA)",
            "Notions (projet en réflexion, usage occasionnel de l'IA)",
            "Intermédiaire (activité lancée ou usage régulier de l'IA)");

    public static final List<String> KNOWN_TERMS = List.of(
            "Agent IA",
            "MCP",
            "CRM",
            "Landing page",
            "RAG");

    public static final List<PositioningTestCatalog.QcmQuestion> QUESTIONS = List.of(
            new PositioningTestCatalog.QcmQuestion(1, "Vos usages numériques et IA",
                    "ChatGPT est...",
                    List.of("Un moteur de recherche classique",
                            "Un assistant conversationnel fondé sur un modèle de langage",
                            "Un réseau social", "Un logiciel de comptabilité"), 1),
            new PositioningTestCatalog.QcmQuestion(2, "Vos usages numériques et IA",
                    "Un « prompt », c'est...",
                    List.of("Le nom du modèle", "Un abonnement payant",
                            "L'instruction ou la question que l'on donne à l'IA",
                            "Un raccourci clavier"), 2),
            new PositioningTestCatalog.QcmQuestion(3, "Vos usages numériques et IA",
                    "Un agent IA se distingue d'un simple chatbot car...",
                    List.of("Il peut effectuer des actions, pas seulement répondre",
                            "Il est plus poli", "Il est toujours gratuit",
                            "Il fonctionne sans internet"), 0),
            new PositioningTestCatalog.QcmQuestion(4, "Notions business",
                    "Un CRM sert à...",
                    List.of("Créer un logo", "Gérer ses contacts, prospects et clients",
                            "Héberger un site web", "Déclarer ses impôts"), 1),
            new PositioningTestCatalog.QcmQuestion(5, "Notions business",
                    "Une landing page est...",
                    List.of("La page d'accueil d'un blog",
                            "Une page d'erreur",
                            "Une page unique conçue pour convertir un visiteur (inscription, achat)",
                            "Un annuaire en ligne"), 2),
            new PositioningTestCatalog.QcmQuestion(6, "Notions business",
                    "Le chiffre d'affaires est...",
                    List.of("Le bénéfice de l'entreprise", "La trésorerie disponible",
                            "Le capital social", "Le total des ventes facturées"), 3));
}
