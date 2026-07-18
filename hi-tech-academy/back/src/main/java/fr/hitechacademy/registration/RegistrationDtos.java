package fr.hitechacademy.registration;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.time.LocalDate;
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

    // --- Suivi public d'une demande (page questionnaire) ---------------
    public record PublicView(
            UUID id,
            RegistrationStatus status,
            String formationId,
            String formationTitle,
            ApplicantType applicantType,
            String firstName,
            String lastName,
            String companyName,
            boolean hasNeedsAnalysis) {
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
            boolean hasCertificate) {

        static AdminListItem from(RegistrationRequest r) {
            NeedsAnalysis na = r.getNeedsAnalysis();
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
                    r.getCertificate() != null);
        }
    }

    // --- Certificats de réalisation --------------------------------------
    public record IssueCertificateRequest(
            @NotNull LocalDate sessionStartDate,
            @NotNull LocalDate sessionEndDate,
            @NotNull Integer durationHours) {
    }

    public record CertificateView(
            UUID id,
            Instant issuedAt,
            LocalDate sessionStartDate,
            LocalDate sessionEndDate,
            int durationHours,
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
            CertificateView certificate) {

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
                    r.getCertificate() != null ? CertificateView.from(r.getCertificate()) : null);
        }
    }

    public record StatusUpdateRequest(@NotNull RegistrationStatus status) {
    }
}
