package fr.hitechacademy.registration;

import java.util.List;

/**
 * Contenu du test de positionnement « Gérer et transformer les processus de
 * travail des équipes avec l'IA » (document « Test de positionnement – V1.0 »
 * du 23/09/2026). Les bonnes réponses vivent uniquement ici, côté serveur :
 * l'endpoint public expose les questions sans l'index de la bonne réponse,
 * la correction se fait à la soumission. Le test porte sur les prérequis
 * (pratique managériale, outils numériques), pas sur l'IA elle-même.
 */
public final class PositioningTestManagementIaCatalog {

    private PositioningTestManagementIaCatalog() {
    }

    public static final List<String> SELF_LEVELS = List.of(
            "Débutant (je n'ai jamais utilisé d'IA générative)",
            "Notions (usage ponctuel pour des tâches simples)",
            "Intermédiaire (usage régulier, prompts structurés)");

    public static final List<String> KNOWN_TERMS = List.of(
            "IA générative",
            "Prompt",
            "Hallucination",
            "AI Act",
            "RAG");

    public static final List<PositioningTestCatalog.QcmQuestion> QUESTIONS = List.of(
            new PositioningTestCatalog.QcmQuestion(1, "Prérequis — Pratique managériale",
                    "Quel livrable attend-on classiquement d'une réunion d'équipe hebdomadaire ?",
                    List.of("Un bilan comptable", "Un relevé de décisions et d'actions",
                            "Un contrat de travail", "Un cahier des charges technique"), 1),
            new PositioningTestCatalog.QcmQuestion(2, "Prérequis — Pratique managériale",
                    "Qu'est-ce qu'un processus de travail ?",
                    List.of("L'organigramme de l'entreprise", "Le règlement intérieur",
                            "Une suite d'étapes reproductibles qui transforme des entrées en un résultat",
                            "Un outil de messagerie"), 2),
            new PositioningTestCatalog.QcmQuestion(3, "Prérequis — Pratique managériale",
                    "À quoi sert un indicateur de performance (KPI) ?",
                    List.of("Sanctionner un collaborateur", "Décrire une fiche de poste",
                            "Remplacer les entretiens annuels",
                            "Mesurer l'atteinte d'un objectif dans le temps"), 3),
            new PositioningTestCatalog.QcmQuestion(4, "Prérequis — Outils numériques",
                    "Pour co-éditer un document avec l'équipe, le plus adapté est…",
                    List.of("Un document partagé en ligne (Google Docs, Office 365…)",
                            "Une impression papier", "Un fax", "Un SMS"), 0),
            new PositioningTestCatalog.QcmQuestion(5, "Prérequis — Outils numériques",
                    "Dans un tableur, une formule sert à…",
                    List.of("Imprimer la feuille",
                            "Calculer automatiquement une valeur à partir d'autres cellules",
                            "Changer la couleur du texte", "Envoyer un e-mail"), 1),
            new PositioningTestCatalog.QcmQuestion(6, "Prérequis — Outils numériques",
                    "Une visioconférence avec partage d'écran nécessite…",
                    List.of("Une imprimante réseau", "Un serveur local dédié",
                            "Un navigateur ou une application dédiée et une connexion internet",
                            "Une carte SIM professionnelle"), 2));
}
