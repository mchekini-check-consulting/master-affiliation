package fr.hitechacademy.convention;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** DTO de l'espace admin pour les conventions de formation. */
public final class ConventionDtos {

    private ConventionDtos() {}

    public record CreateConventionRequest(
            @NotBlank String formationId,
            @NotBlank String formationTitle,
            @NotBlank String clientName,
            String clientRepresentativeName,
            @NotBlank String clientAddressLine,
            @NotBlank String clientPostalCode,
            @NotBlank String clientCity,
            String clientSiret,
            @NotBlank String signerFirstName,
            @NotBlank String signerLastName,
            @NotBlank @Email String signerEmail,
            @NotNull LocalDate sessionStartDate,
            @NotNull LocalDate sessionEndDate,
            String scheduleText,
            List<String> participants,
            @NotNull BigDecimal priceHt,
            @NotNull BigDecimal priceTtc,
            boolean opcoFunded,
            String opcoName,
            LocalDate opcoDeadline,
            OpcoPartialMode opcoPartialMode,
            UUID registrationId) {}

    /** Champ de signature positionné par le générateur PDF du front (points 72 dpi). */
    public record SignatureFieldPayload(
            @NotBlank String signer, // ORGANIZATION | CLIENT
            int page, int x, int y, int width, int height) {}

    public record SignRequest(
            @NotBlank String pdfBase64,
            @NotEmpty List<@Valid SignatureFieldPayload> signatureFields) {}

    public record StatusUpdateRequest(@NotNull ConventionStatus status) {}

    public record UploadSignedPdfRequest(@NotBlank String pdfBase64) {}

    public record ConventionView(
            UUID id, String number, ConventionStatus status, LocalDate issueDate,
            String formationId, String formationTitle,
            String clientName, String clientRepresentativeName, String clientAddressLine,
            String clientPostalCode, String clientCity, String clientSiret,
            String signerFirstName, String signerLastName, String signerEmail,
            LocalDate sessionStartDate, LocalDate sessionEndDate, String scheduleText,
            List<String> participants,
            BigDecimal priceHt, BigDecimal priceTtc,
            BigDecimal satisfactionRate, BigDecimal recommendationRate, String indicatorsBasis,
            boolean opcoFunded, String opcoName, LocalDate opcoDeadline, OpcoPartialMode opcoPartialMode,
            String yousignStatus, Instant sentAt, Instant signedAt, boolean hasSignedPdf,
            UUID registrationId, Instant createdAt) {

        static ConventionView of(Convention c) {
            return new ConventionView(
                    c.getId(), c.getNumber(), c.getStatus(), c.getIssueDate(),
                    c.getFormationId(), c.getFormationTitle(),
                    c.getClientName(), c.getClientRepresentativeName(), c.getClientAddressLine(),
                    c.getClientPostalCode(), c.getClientCity(), c.getClientSiret(),
                    c.getSignerFirstName(), c.getSignerLastName(), c.getSignerEmail(),
                    c.getSessionStartDate(), c.getSessionEndDate(), c.getScheduleText(),
                    c.getParticipants(),
                    c.getPriceHt(), c.getPriceTtc(),
                    c.getSatisfactionRate(), c.getRecommendationRate(), c.getIndicatorsBasis(),
                    c.isOpcoFunded(), c.getOpcoName(), c.getOpcoDeadline(), c.getOpcoPartialMode(),
                    c.getYousignStatus(), c.getSentAt(), c.getSignedAt(), c.getSignedPdf() != null,
                    c.getRegistrationId(), c.getCreatedAt());
        }
    }
}
