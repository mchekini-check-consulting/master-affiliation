package fr.hitechacademy.registration;

import java.util.List;

/**
 * Contenu du test de positionnement « IA pour tous » (document « Test de
 * positionnement – V1.1 » du 08/10/2026). La formation est sans prérequis :
 * le test sert d'état des lieux (usages numériques, notions d'IA, cadre
 * d'usage) pour adapter la session, pas de filtre. Les bonnes réponses vivent
 * uniquement ici, côté serveur ; l'ordre des options est mélangé.
 */
public final class PositioningTestIaCatalog {

    private PositioningTestIaCatalog() {
    }

    public static final List<String> SELF_LEVELS = List.of(
            "Débutant (je n'ai jamais ou presque jamais utilisé d'IA)",
            "Notions (j'utilise un assistant IA de temps en temps)",
            "Intermédiaire (usage régulier, je veux structurer et aller plus loin)");

    public static final List<String> KNOWN_TERMS = List.of(
            "Prompt",
            "LLM (modèle de langage)",
            "IA générative",
            "Hallucination",
            "Agent IA",
            "RAG");

    public static final List<PositioningTestCatalog.QcmQuestion> QUESTIONS = List.of(
            new PositioningTestCatalog.QcmQuestion(1, "Vos usages numériques",
                    "Le « cloud » désigne...",
                    List.of("La mémoire de l'ordinateur", "Le wifi",
                            "Un logiciel de météo",
                            "Des services et fichiers accessibles en ligne via internet"), 3),
            new PositioningTestCatalog.QcmQuestion(2, "Vos usages numériques",
                    "Un mot de passe robuste est...",
                    List.of("Le même partout, pour s'en souvenir",
                            "Long et unique pour chaque service",
                            "Votre date de naissance", "Le nom de votre entreprise"), 1),
            new PositioningTestCatalog.QcmQuestion(3, "L'IA : notions",
                    "Qu'est-ce qu'un LLM (grand modèle de langage) ?",
                    List.of("Un moteur de recherche qui classe des pages web",
                            "Un modèle entraîné sur de grands volumes de texte, capable de générer des réponses",
                            "Une base de données de réponses rédigées à l'avance",
                            "Un logiciel de traduction mot à mot"), 1),
            new PositioningTestCatalog.QcmQuestion(4, "L'IA : notions",
                    "Qu'est-ce qu'une IA générative ?",
                    List.of("Un programme qui exécute des règles écrites à la main",
                            "Un système qui recopie des contenus existants",
                            "Un modèle qui produit des contenus nouveaux (texte, image, audio) à partir d'une consigne",
                            "Un assistant vocal téléphonique"), 2),
            new PositioningTestCatalog.QcmQuestion(5, "L'IA : notions",
                    "Une « hallucination » d'IA désigne...",
                    List.of("Un bug d'affichage", "Une réponse inventée présentée comme vraie",
                            "Une panne de serveur", "Une image floue"), 1),
            new PositioningTestCatalog.QcmQuestion(6, "L'IA : notions",
                    "Un « prompt », c'est...",
                    List.of("Le nom du modèle", "Un abonnement payant",
                            "L'instruction ou la question que l'on donne à l'IA",
                            "Un raccourci clavier"), 2),
            new PositioningTestCatalog.QcmQuestion(7, "L'IA : notions",
                    "Un agent IA se distingue d'un simple assistant conversationnel parce qu'il...",
                    List.of("répond plus vite",
                            "peut enchaîner des actions et utiliser des outils (agenda, e-mails, fichiers) pour accomplir une tâche",
                            "fonctionne sans connexion internet", "est toujours gratuit"), 1),
            new PositioningTestCatalog.QcmQuestion(8, "Cadre d'usage",
                    "Avant de confier un document de travail à une IA en ligne, le bon réflexe est de...",
                    List.of("l'envoyer tel quel, les IA sont confidentielles",
                            "vérifier la sensibilité des données (RGPD) et les règles de son organisation",
                            "supprimer les accents du document", "le convertir en image"), 1));
}
