package fr.hitechacademy.registration;

import java.util.List;

/**
 * Sélectionne les catalogues de quizz (test de positionnement, évaluation
 * finale) selon la formation. Kubernetes reste le catalogue par défaut pour
 * conserver le comportement des demandes existantes.
 */
public final class QuizCatalogs {

    public static final String PENNYLANE_ID = "facturation-electronique-pennylane";
    public static final String IA_ID = "ia-pour-tous";
    public static final String IA_BUSINESS_ID = "ia-for-business";
    public static final String IA_TECH_ID = "ia-for-tech";

    private QuizCatalogs() {
    }

    public static List<PositioningTestCatalog.QcmQuestion> positioningQuestions(String formationId) {
        return switch (safe(formationId)) {
            case PENNYLANE_ID -> PositioningTestPennylaneCatalog.QUESTIONS;
            case IA_ID -> PositioningTestIaCatalog.QUESTIONS;
            case IA_BUSINESS_ID -> PositioningTestIaBusinessCatalog.QUESTIONS;
            case IA_TECH_ID -> PositioningTestIaTechCatalog.QUESTIONS;
            default -> PositioningTestCatalog.QUESTIONS;
        };
    }

    public static List<String> selfLevels(String formationId) {
        return switch (safe(formationId)) {
            case PENNYLANE_ID -> PositioningTestPennylaneCatalog.SELF_LEVELS;
            case IA_ID -> PositioningTestIaCatalog.SELF_LEVELS;
            case IA_BUSINESS_ID -> PositioningTestIaBusinessCatalog.SELF_LEVELS;
            case IA_TECH_ID -> PositioningTestIaTechCatalog.SELF_LEVELS;
            default -> PositioningTestCatalog.SELF_LEVELS;
        };
    }

    public static List<String> knownTerms(String formationId) {
        return switch (safe(formationId)) {
            case PENNYLANE_ID -> PositioningTestPennylaneCatalog.KNOWN_TERMS;
            case IA_ID -> PositioningTestIaCatalog.KNOWN_TERMS;
            case IA_BUSINESS_ID -> PositioningTestIaBusinessCatalog.KNOWN_TERMS;
            case IA_TECH_ID -> PositioningTestIaTechCatalog.KNOWN_TERMS;
            default -> PositioningTestCatalog.KNOWN_TERMS;
        };
    }

    public static List<FinalEvaluationCatalog.QcmQuestion> finalQuestions(String formationId) {
        return switch (safe(formationId)) {
            case PENNYLANE_ID -> FinalEvaluationPennylaneCatalog.QUESTIONS;
            case IA_ID -> FinalEvaluationIaCatalog.QUESTIONS;
            case IA_BUSINESS_ID -> FinalEvaluationIaBusinessCatalog.QUESTIONS;
            case IA_TECH_ID -> FinalEvaluationIaTechCatalog.QUESTIONS;
            default -> FinalEvaluationCatalog.QUESTIONS;
        };
    }

    private static String safe(String formationId) {
        return formationId == null ? "" : formationId;
    }
}
