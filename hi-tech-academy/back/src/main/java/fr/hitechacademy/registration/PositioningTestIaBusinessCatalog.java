package fr.hitechacademy.registration;

import java.util.List;

/**
 * Contenu du test de positionnement « IA for Business » (document « Test de
 * positionnement – V1.1 » du 08/10/2026). La formation est sans prérequis :
 * le test sert d'état des lieux (notions d'IA, notions business, cadre légal)
 * pour adapter la session, pas de filtre. Les bonnes réponses vivent
 * uniquement ici, côté serveur ; l'ordre des options est mélangé.
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
            "RAG",
            "ICP (profil client idéal)");

    public static final List<PositioningTestCatalog.QcmQuestion> QUESTIONS = List.of(
            new PositioningTestCatalog.QcmQuestion(1, "Vos notions d'IA",
                    "Qu'est-ce qu'un LLM (grand modèle de langage) ?",
                    List.of("Un moteur de recherche qui classe des pages web",
                            "Un modèle entraîné sur de grands volumes de texte, capable de générer des réponses",
                            "Une base de données de réponses rédigées à l'avance",
                            "Un logiciel de comptabilité"), 1),
            new PositioningTestCatalog.QcmQuestion(2, "Vos notions d'IA",
                    "Un « prompt », c'est...",
                    List.of("Le nom du modèle", "Un abonnement payant",
                            "L'instruction ou la question que l'on donne à l'IA",
                            "Un raccourci clavier"), 2),
            new PositioningTestCatalog.QcmQuestion(3, "Vos notions d'IA",
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
                    "Un ICP (profil client idéal) sert à...",
                    List.of("Classer ses factures",
                            "Cibler sa prospection et ses contenus sur les clients à plus forte valeur",
                            "Calculer la TVA", "Déposer sa marque"), 1),
            new PositioningTestCatalog.QcmQuestion(7, "Notions business",
                    "Le chiffre d'affaires est...",
                    List.of("Le bénéfice de l'entreprise", "La trésorerie disponible",
                            "Le capital social", "Le total des ventes facturées"), 3),
            new PositioningTestCatalog.QcmQuestion(8, "Cadre légal",
                    "La prospection automatisée par e-mail (cold outreach) en B2B doit...",
                    List.of("Être envoyée sans limite, aucune règle ne s'applique",
                            "Respecter le RGPD : identification claire de l'expéditeur et possibilité de se désinscrire",
                            "Être interdite en France",
                            "Utiliser des bases d'adresses achetées sans vérification"), 1));
}
