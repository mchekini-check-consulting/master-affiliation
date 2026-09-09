package fr.hitechacademy.registration;

import java.util.List;

/**
 * Contenu du test de positionnement « IA pour tous » (document « Test de
 * positionnement – V1.0 » du 09/09/2026). La formation est sans prérequis :
 * le test sert d'état des lieux (usages numériques, premières notions d'IA)
 * pour adapter la session, pas de filtre. Les bonnes réponses vivent
 * uniquement ici, côté serveur ; l'ordre des options est mélangé.
 */
public final class PositioningTestIaCatalog {

    private PositioningTestIaCatalog() {
    }

    public static final List<String> SELF_LEVELS = List.of(
            "Débutant (je n'ai jamais ou presque jamais utilisé d'IA)",
            "Notions (j'utilise ChatGPT ou équivalent de temps en temps)",
            "Intermédiaire (usage régulier, je veux structurer et aller plus loin)");

    public static final List<String> KNOWN_TERMS = List.of(
            "Prompt",
            "LLM (modèle de langage)",
            "Hallucination",
            "Agent IA",
            "RAG");

    public static final List<PositioningTestCatalog.QcmQuestion> QUESTIONS = List.of(
            new PositioningTestCatalog.QcmQuestion(1, "Vos usages numériques",
                    "Un navigateur web est...",
                    List.of("Uniquement un moteur de recherche",
                            "Un logiciel pour consulter des sites internet (Chrome, Safari…)",
                            "Un antivirus", "La marque de l'ordinateur"), 1),
            new PositioningTestCatalog.QcmQuestion(2, "Vos usages numériques",
                    "Une pièce jointe dans un e-mail est...",
                    List.of("L'adresse du destinataire", "La signature du message",
                            "Un fichier envoyé avec le message", "Forcément un virus"), 2),
            new PositioningTestCatalog.QcmQuestion(3, "Vos usages numériques",
                    "Le « cloud » désigne...",
                    List.of("La mémoire de l'ordinateur", "Le wifi",
                            "Un logiciel de météo",
                            "Des services et fichiers accessibles en ligne via internet"), 3),
            new PositioningTestCatalog.QcmQuestion(4, "L'IA : premières notions",
                    "ChatGPT est...",
                    List.of("Un moteur de recherche classique",
                            "Un assistant conversationnel fondé sur un modèle de langage",
                            "Un réseau social", "Un logiciel de retouche photo"), 1),
            new PositioningTestCatalog.QcmQuestion(5, "L'IA : premières notions",
                    "Une « hallucination » d'IA désigne...",
                    List.of("Un bug d'affichage", "Une réponse inventée présentée comme vraie",
                            "Une panne de serveur", "Une image floue"), 1),
            new PositioningTestCatalog.QcmQuestion(6, "L'IA : premières notions",
                    "Un « prompt », c'est...",
                    List.of("Le nom du modèle", "Un abonnement payant",
                            "L'instruction ou la question que l'on donne à l'IA",
                            "Un raccourci clavier"), 2));
}
