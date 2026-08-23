package fr.hitechacademy.billing;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Contrats JSON (snake_case) de l'espace admin devis / factures. */
public final class BillingDtos {

    private BillingDtos() {}

    public record LinePayload(
            @NotBlank String description,
            @NotNull @DecimalMin(value = "0.01") BigDecimal quantity,
            @NotNull @DecimalMin(value = "0") BigDecimal unitPriceHt,
            BigDecimal vatRate) {
    }

    public record CreateDocumentRequest(
            @NotNull BillingDocumentType type,
            UUID registrationId,
            @NotBlank String clientName,
            String clientContactName,
            @NotBlank String clientAddressLine,
            @NotBlank String clientPostalCode,
            @NotBlank String clientCity,
            String clientCountry,
            String clientSiret,
            String clientVatNumber,
            String clientEmail,
            LocalDate serviceStartDate,
            LocalDate serviceEndDate,
            String notes,
            @NotEmpty List<@Valid LinePayload> lines) {
    }

    public record StatusUpdateRequest(@NotNull BillingDocumentStatus status) {
    }

    public record SendRequest(@NotBlank String pdfBase64, String recipientEmail) {
    }

    public record LineView(String description, BigDecimal quantity, BigDecimal unitPriceHt, BigDecimal vatRate) {
        static LineView from(BillingLine l) {
            return new LineView(l.getDescription(), l.getQuantity(), l.getUnitPriceHt(), l.getVatRate());
        }
    }

    public record DocumentView(
            UUID id,
            BillingDocumentType type,
            String number,
            BillingDocumentStatus status,
            LocalDate issueDate,
            LocalDate dueDate,
            LocalDate validUntil,
            LocalDate serviceStartDate,
            LocalDate serviceEndDate,
            String clientName,
            String clientContactName,
            String clientAddressLine,
            String clientPostalCode,
            String clientCity,
            String clientCountry,
            String clientSiret,
            String clientVatNumber,
            String clientEmail,
            List<LineView> lines,
            BigDecimal totalHt,
            BigDecimal totalVat,
            BigDecimal totalTtc,
            String notes,
            UUID registrationId,
            String sourceQuoteNumber,
            Instant createdAt,
            Instant sentAt,
            String lastSentTo,
            LocalDate paidAt) {

        static DocumentView from(BillingDocument d) {
            return new DocumentView(
                    d.getId(),
                    d.getType(),
                    d.getNumber(),
                    d.getStatus(),
                    d.getIssueDate(),
                    d.getDueDate(),
                    d.getValidUntil(),
                    d.getServiceStartDate(),
                    d.getServiceEndDate(),
                    d.getClientName(),
                    d.getClientContactName(),
                    d.getClientAddressLine(),
                    d.getClientPostalCode(),
                    d.getClientCity(),
                    d.getClientCountry(),
                    d.getClientSiret(),
                    d.getClientVatNumber(),
                    d.getClientEmail(),
                    d.getLines().stream().map(LineView::from).toList(),
                    d.getTotalHt(),
                    d.getTotalVat(),
                    d.getTotalTtc(),
                    d.getNotes(),
                    d.getRegistrationId(),
                    d.getSourceQuoteNumber(),
                    d.getCreatedAt(),
                    d.getSentAt(),
                    d.getLastSentTo(),
                    d.getPaidAt());
        }
    }
}
