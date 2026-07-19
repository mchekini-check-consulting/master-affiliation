package fr.hitechacademy.registration;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Contrat JSON de l'API (sérialisé en snake_case par configuration Jackson).
 */
public final class RegistrationDtos {

    private RegistrationDtos() {
    }

    // --- Dépôt d'une demande (public) ----------------------------------
    public record CreateRegistrationRequest(
            @NotBlank String formationId,
            @NotBlank String formationTitle,
            @NotNull ApplicantType applicantType,
            // Entreprise / indépendant
            String companyName,
            String siret,
            String naf,
            String clientTypology,
            String legalForm,
            String billingEmail,
            // Adresse
            String addressLine,
            String addressComplement,
            String postalCode,
            String city,
            String country,
            // Référent / apprenant
            String civility,
            @NotBlank String firstName,
            @NotBlank String lastName,
            @NotBlank @Email String email,
            @NotBlank String phone,
            String jobTitle,
            String notes,
            // Particulier
            String phone2,
            String traineeType,
            LocalDate birthDate,
            String birthCity,
            String birthDepartment,
            String nationality,
            String socialSecurityNumber,
            String diplomaLevel,
            String diplomaTitle,
            String currentPosition,
            Boolean needsAdaptation) {
    }

    public record CreatedResponse(UUID id, RegistrationStatus status) {
    }

    // --- Suivi public d'une demande (pages questionnaires) --------------
    public record PublicView(
            UUID id,
            RegistrationStatus status,
            String formationId,
            String formationTitle,
            ApplicantType applicantType,
            String firstName,
            String lastName,
            String companyName,
            boolean hasNeedsAnalysis,
            boolean hasSponsorSurvey,
            boolean hasPositioningTest,
            int traineesCount,
            boolean finalEvaluationInvited,
            boolean finalEvaluationSubmitted) {
    }

    // --- Questionnaire d'analyse du besoin (public) --------------------
    public record NeedsAnalysisRequest(
            String beneficiaryName,
            String companyRole,
            String funder,
            String activityContext,
            String problemToSolve,
            String expectedObjectives,
            String levelLinux,
            String levelDocker,
            String levelKubernetes,
            String specificUseCase,
            String planningConstraints,
            Boolean needsAdaptation,
            String adaptationDetails) {
    }

    public record NeedsAnalysisView(
            Instant submittedAt,
            String beneficiaryName,
            String companyRole,
            String funder,
            String activityContext,
            String problemToSolve,
            String expectedObjectives,
            String levelLinux,
            String levelDocker,
            String levelKubernetes,
            String specificUseCase,
            String planningConstraints,
            boolean needsAdaptation,
            String adaptationDetails,
            int score,
            int maxScore) {

        static NeedsAnalysisView from(NeedsAnalysis na) {
            return new NeedsAnalysisView(
                    na.getSubmittedAt(),
                    na.getBeneficiaryName(),
                    na.getCompanyRole(),
                    na.getFunder(),
                    na.getActivityContext(),
                    na.getProblemToSolve(),
                    na.getExpectedObjectives(),
                    na.getLevelLinux(),
                    na.getLevelDocker(),
                    na.getLevelKubernetes(),
                    na.getSpecificUseCase(),
                    na.getPlanningConstraints(),
                    na.isNeedsAdaptation(),
                    na.getAdaptationDetails(),
                    na.getScore(),
                    na.getMaxScore());
        }
    }

    // --- Test de positionnement (public) ---------------------------------
    public record PositioningTestRequest(
            String selfLevel,
            @NotNull List<Integer> answers,
            String kubernetesPurpose,
            List<String> knownTerms,
            String expectations) {
    }

    /** Une question corrigée : réponse choisie + bonne réponse (vue admin). */
    public record QcmAnswerView(
            int id,
            String section,
            String question,
            List<String> options,
            Integer chosenIndex,
            int correctIndex,
            boolean correct) {
    }

    public record PositioningTestView(
            Instant submittedAt,
            String selfLevel,
            String kubernetesPurpose,
            List<String> knownTerms,
            String expectations,
            int score,
            int maxScore,
            List<QcmAnswerView> questions) {

        static PositioningTestView from(PositioningTest pt) {
            List<Integer> chosen = new ArrayList<>();
            for (String part : pt.getAnswers().split(",")) {
                try {
                    chosen.add(Integer.parseInt(part.trim()));
                } catch (NumberFormatException e) {
                    chosen.add(null);
                }
            }
            List<QcmAnswerView> questions = new ArrayList<>();
            List<PositioningTestCatalog.QcmQuestion> catalog = PositioningTestCatalog.QUESTIONS;
            for (int i = 0; i < catalog.size(); i++) {
                PositioningTestCatalog.QcmQuestion q = catalog.get(i);
                Integer answer = i < chosen.size() ? chosen.get(i) : null;
                questions.add(new QcmAnswerView(
                        q.id(), q.section(), q.text(), q.options(),
                        answer, q.correctIndex(),
                        answer != null && answer == q.correctIndex()));
            }
            List<String> terms = pt.getKnownTerms() == null || pt.getKnownTerms().isBlank()
                    ? List.of()
                    : List.of(pt.getKnownTerms().split(";"));
            return new PositioningTestView(
                    pt.getSubmittedAt(),
                    pt.getSelfLevel(),
                    pt.getKubernetesPurpose(),
                    terms,
                    pt.getExpectations(),
                    pt.getScore(),
                    pt.getMaxScore(),
                    questions);
        }
    }

    // --- Évaluation finale (QCM envoyé par l'admin) ----------------------
    public record FinalEvaluationRequest(@NotNull List<Integer> answers) {
    }

    public record FinalEvaluationView(
            Instant invitedAt,
            Instant submittedAt,
            Integer score,
            Integer maxScore,
            List<QcmAnswerView> questions) {

        static FinalEvaluationView from(FinalEvaluation fe) {
            List<QcmAnswerView> questions = null;
            if (fe.isSubmitted() && fe.getAnswers() != null) {
                List<Integer> chosen = new ArrayList<>();
                for (String part : fe.getAnswers().split(",")) {
                    try {
                        chosen.add(Integer.parseInt(part.trim()));
                    } catch (NumberFormatException e) {
                        chosen.add(null);
                    }
                }
                questions = new ArrayList<>();
                List<FinalEvaluationCatalog.QcmQuestion> catalog = FinalEvaluationCatalog.QUESTIONS;
                for (int i = 0; i < catalog.size(); i++) {
                    FinalEvaluationCatalog.QcmQuestion q = catalog.get(i);
                    Integer answer = i < chosen.size() ? chosen.get(i) : null;
                    questions.add(new QcmAnswerView(
                            q.id(), "QCM", q.text(), q.options(),
                            answer, q.correctIndex(),
                            answer != null && answer == q.correctIndex()));
                }
            }
            return new FinalEvaluationView(
                    fe.getInvitedAt(),
                    fe.getSubmittedAt(),
                    fe.getScore(),
                    fe.getMaxScore(),
                    questions);
        }
    }

    // --- Questionnaire apprenant salarié (public, demandes COMPANY) ------
    public record TraineeRequest(
            @NotBlank String firstName,
            @NotBlank String lastName,
            @NotBlank @Email String email,
            String jobTitle,
            String activityContext,
            String problemToSolve,
            String expectedObjectives,
            String levelLinux,
            String levelDocker,
            String levelKubernetes,
            String specificUseCase,
            Boolean needsAdaptation,
            String adaptationDetails,
            String planningConstraints) {
    }

    public record TraineeView(
            UUID id,
            Instant submittedAt,
            String firstName,
            String lastName,
            String email,
            String jobTitle,
            String activityContext,
            String problemToSolve,
            String expectedObjectives,
            String levelLinux,
            String levelDocker,
            String levelKubernetes,
            String specificUseCase,
            boolean needsAdaptation,
            String adaptationDetails,
            String planningConstraints,
            int score,
            int maxScore,
            PositioningTestView positioningTest,
            FinalEvaluationView finalEvaluation) {

        static TraineeView from(Trainee t) {
            return new TraineeView(
                    t.getId(),
                    t.getSubmittedAt(),
                    t.getFirstName(),
                    t.getLastName(),
                    t.getEmail(),
                    t.getJobTitle(),
                    t.getActivityContext(),
                    t.getProblemToSolve(),
                    t.getExpectedObjectives(),
                    t.getLevelLinux(),
                    t.getLevelDocker(),
                    t.getLevelKubernetes(),
                    t.getSpecificUseCase(),
                    t.isNeedsAdaptation(),
                    t.getAdaptationDetails(),
                    t.getPlanningConstraints(),
                    t.getScore(),
                    t.getMaxScore(),
                    t.getPositioningTest() != null ? PositioningTestView.from(t.getPositioningTest()) : null,
                    t.getFinalEvaluation() != null ? FinalEvaluationView.from(t.getFinalEvaluation()) : null);
        }
    }

    public record TraineeCreatedResponse(UUID id) {
    }

    // --- Questionnaire des attentes du commanditaire (public) -----------
    public record SponsorSurveyRequest(
            String trainingReason,
            String needOrigin,
            Integer traineeCount,
            String traineeProfiles,
            String expectedSkills,
            String successCriteria,
            String applicationProject,
            String planningConstraints,
            String funding,
            Boolean needsAdaptation,
            String adaptationDetails,
            String comments) {
    }

    public record SponsorSurveyView(
            Instant submittedAt,
            String trainingReason,
            String needOrigin,
            Integer traineeCount,
            String traineeProfiles,
            String expectedSkills,
            String successCriteria,
            String applicationProject,
            String planningConstraints,
            String funding,
            boolean needsAdaptation,
            String adaptationDetails,
            String comments) {

        static SponsorSurveyView from(SponsorSurvey s) {
            return new SponsorSurveyView(
                    s.getSubmittedAt(),
                    s.getTrainingReason(),
                    s.getNeedOrigin(),
                    s.getTraineeCount(),
                    s.getTraineeProfiles(),
                    s.getExpectedSkills(),
                    s.getSuccessCriteria(),
                    s.getApplicationProject(),
                    s.getPlanningConstraints(),
                    s.getFunding(),
                    s.isNeedsAdaptation(),
                    s.getAdaptationDetails(),
                    s.getComments());
        }
    }

    // --- Espace admin ---------------------------------------------------
    public record AdminListItem(
            UUID id,
            Instant createdAt,
            RegistrationStatus status,
            String formationId,
            String formationTitle,
            ApplicantType applicantType,
            String firstName,
            String lastName,
            String email,
            String phone,
            String companyName,
            boolean hasNeedsAnalysis,
            Integer needsAnalysisScore,
            Integer needsAnalysisMaxScore,
            boolean hasCertificate,
            boolean hasSponsorSurvey,
            int traineesCount,
            Integer expectedTraineesCount,
            Integer positioningTestScore,
            Integer positioningTestMaxScore,
            Integer finalEvaluationScore,
            Integer finalEvaluationMaxScore) {

        static AdminListItem from(RegistrationRequest r) {
            NeedsAnalysis na = r.getNeedsAnalysis();
            PositioningTest pt = r.getPositioningTest();
            FinalEvaluation fe = r.getFinalEvaluation();
            boolean feSubmitted = fe != null && fe.isSubmitted();
            return new AdminListItem(
                    r.getId(),
                    r.getCreatedAt(),
                    r.getStatus(),
                    r.getFormationId(),
                    r.getFormationTitle(),
                    r.getApplicantType(),
                    r.getFirstName(),
                    r.getLastName(),
                    r.getEmail(),
                    r.getPhone(),
                    r.getCompanyName(),
                    na != null,
                    na != null ? na.getScore() : null,
                    na != null ? na.getMaxScore() : null,
                    r.getCertificate() != null,
                    r.getSponsorSurvey() != null,
                    r.getTrainees().size(),
                    r.getSponsorSurvey() != null ? r.getSponsorSurvey().getTraineeCount() : null,
                    pt != null ? pt.getScore() : null,
                    pt != null ? pt.getMaxScore() : null,
                    feSubmitted ? fe.getScore() : null,
                    feSubmitted ? fe.getMaxScore() : null);
        }
    }

    // --- Certificats de réalisation --------------------------------------
    public record IssueCertificateRequest(
            @NotNull LocalDate sessionStartDate,
            @NotNull LocalDate sessionEndDate,
            @NotNull Integer durationHours,
            // Note QCM : reprise automatiquement de l'évaluation finale si
            // elle a été passée ; sinon cette valeur saisie est requise
            Integer qcmScore,
            @NotNull Integer practicalScore) {
    }

    public record CertificateView(
            UUID id,
            Instant issuedAt,
            LocalDate sessionStartDate,
            LocalDate sessionEndDate,
            int durationHours,
            Integer qcmScore,
            Integer practicalScore,
            Integer totalScore,
            Boolean objectivesAchieved,
            UUID registrationId,
            String formationId,
            String formationTitle,
            ApplicantType applicantType,
            String civility,
            String firstName,
            String lastName,
            String email,
            String companyName) {

        static CertificateView from(Certificate c) {
            RegistrationRequest r = c.getRegistration();
            return new CertificateView(
                    c.getId(),
                    c.getIssuedAt(),
                    c.getSessionStartDate(),
                    c.getSessionEndDate(),
                    c.getDurationHours(),
                    c.getQcmScore(),
                    c.getPracticalScore(),
                    c.getTotalScore(),
                    c.getObjectivesAchieved(),
                    r.getId(),
                    r.getFormationId(),
                    r.getFormationTitle(),
                    r.getApplicantType(),
                    r.getCivility(),
                    r.getFirstName(),
                    r.getLastName(),
                    r.getEmail(),
                    r.getCompanyName());
        }
    }

    public record AdminDetail(
            UUID id,
            Instant createdAt,
            RegistrationStatus status,
            Instant decidedAt,
            String formationId,
            String formationTitle,
            ApplicantType applicantType,
            String companyName,
            String siret,
            String naf,
            String clientTypology,
            String legalForm,
            String billingEmail,
            String addressLine,
            String addressComplement,
            String postalCode,
            String city,
            String country,
            String civility,
            String firstName,
            String lastName,
            String email,
            String phone,
            String jobTitle,
            String notes,
            String phone2,
            String traineeType,
            LocalDate birthDate,
            String birthCity,
            String birthDepartment,
            String nationality,
            String socialSecurityNumber,
            String diplomaLevel,
            String diplomaTitle,
            String currentPosition,
            boolean needsAdaptation,
            NeedsAnalysisView needsAnalysis,
            CertificateView certificate,
            SponsorSurveyView sponsorSurvey,
            List<TraineeView> trainees,
            PositioningTestView positioningTest,
            FinalEvaluationView finalEvaluation) {

        static AdminDetail from(RegistrationRequest r) {
            return new AdminDetail(
                    r.getId(),
                    r.getCreatedAt(),
                    r.getStatus(),
                    r.getDecidedAt(),
                    r.getFormationId(),
                    r.getFormationTitle(),
                    r.getApplicantType(),
                    r.getCompanyName(),
                    r.getSiret(),
                    r.getNaf(),
                    r.getClientTypology(),
                    r.getLegalForm(),
                    r.getBillingEmail(),
                    r.getAddressLine(),
                    r.getAddressComplement(),
                    r.getPostalCode(),
                    r.getCity(),
                    r.getCountry(),
                    r.getCivility(),
                    r.getFirstName(),
                    r.getLastName(),
                    r.getEmail(),
                    r.getPhone(),
                    r.getJobTitle(),
                    r.getNotes(),
                    r.getPhone2(),
                    r.getTraineeType(),
                    r.getBirthDate(),
                    r.getBirthCity(),
                    r.getBirthDepartment(),
                    r.getNationality(),
                    r.getSocialSecurityNumber(),
                    r.getDiplomaLevel(),
                    r.getDiplomaTitle(),
                    r.getCurrentPosition(),
                    r.isNeedsAdaptation(),
                    r.getNeedsAnalysis() != null ? NeedsAnalysisView.from(r.getNeedsAnalysis()) : null,
                    r.getCertificate() != null ? CertificateView.from(r.getCertificate()) : null,
                    r.getSponsorSurvey() != null ? SponsorSurveyView.from(r.getSponsorSurvey()) : null,
                    r.getTrainees().stream().map(TraineeView::from).toList(),
                    r.getPositioningTest() != null ? PositioningTestView.from(r.getPositioningTest()) : null,
                    r.getFinalEvaluation() != null ? FinalEvaluationView.from(r.getFinalEvaluation()) : null);
        }
    }

    public record StatusUpdateRequest(@NotNull RegistrationStatus status) {
    }
}
