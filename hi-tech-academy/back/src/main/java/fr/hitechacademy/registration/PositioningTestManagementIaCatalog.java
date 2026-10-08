package fr.hitechacademy.registration;

import java.util.List;

/**
 * Contenu du test de positionnement « Gérer et transformer les processus de
 * travail des équipes avec l'IA » (document « Test de positionnement – V1.1 »
 * du 08/10/2026). Les bonnes réponses vivent uniquement ici, côté serveur :
 * l'endpoint public expose les questions sans l'index de la bonne réponse,
 * la correction se fait à la soumission. Le test vérifie les prérequis
 * (pratique managériale, outils numériques) puis situe les notions d'IA et
 * de cadre réglementaire ; il n'est pas éliminatoire.
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
            "RAG",
            "Conduite du changement");

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
            new PositioningTestCatalog.QcmQuestion(5, "L'IA : notions",
                    "Qu'est-ce qu'un LLM (grand modèle de langage) ?",
                    List.of("Un moteur de recherche qui classe des pages web",
                            "Un modèle entraîné sur de grands volumes de texte, capable de générer des réponses",
                            "Une base de données de réponses rédigées à l'avance",
                            "Un logiciel de visioconférence"), 1),
            new PositioningTestCatalog.QcmQuestion(6, "L'IA : notions",
                    "Dans une équipe, le principal risque d'un usage non encadré des IA en ligne est...",
                    List.of("La hausse du coût des licences",
                            "L'exposition de données sensibles et la diffusion de contenus non vérifiés",
                            "La saturation du réseau wifi",
                            "L'obsolescence des ordinateurs"), 1),
            new PositioningTestCatalog.QcmQuestion(7, "Cadre réglementaire",
                    "L'AI Act européen...",
                    List.of("Interdit l'IA générative en entreprise",
                            "Classe les systèmes d'IA par niveau de risque et impose des obligations selon ce niveau",
                            "Ne concerne que les éditeurs américains",
                            "Remplace le RGPD"), 1));
}
