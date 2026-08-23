package fr.hitechacademy.billing;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Devis ou facture émis par l'organisme. Les coordonnées du client sont
 * copiées au moment de l'émission (et non référencées) : un document émis est
 * figé, même si la demande d'inscription d'origine évolue ensuite. Le PDF
 * envoyé est conservé dans archived_pdfs (traçabilité + sauvegardes).
 */
@Entity
@Table(name = "billing_documents")
public class BillingDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillingDocumentType type;

    /** Numéro séquentiel annuel : FA-2026-0001 (facture) / DE-2026-0001 (devis). */
    @Column(nullable = false, unique = true)
    private String number;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillingDocumentStatus status = BillingDocumentStatus.ISSUED;

    @Column(nullable = false)
    private LocalDate issueDate;

    /** Facture : date limite de paiement (émission + 30 jours). */
    private LocalDate dueDate;

    /** Devis : date limite de validité (émission + 30 jours). */
    private LocalDate validUntil;

    /** Période de réalisation de la prestation (dates de formation). */
    private LocalDate serviceStartDate;
    private LocalDate serviceEndDate;

    // --- Client (copié à l'émission) ---------------------------------
    @Column(nullable = false)
    private String clientName;
    private String clientContactName;
    @Column(nullable = false)
    private String clientAddressLine;
    @Column(nullable = false)
    private String clientPostalCode;
    @Column(nullable = false)
    private String clientCity;
    private String clientCountry;
    private String clientSiret;
    private String clientVatNumber;
    private String clientEmail;

    // --- Lignes et totaux --------------------------------------------
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "billing_document_lines", joinColumns = @JoinColumn(name = "document_id"))
    @OrderColumn(name = "position")
    private List<BillingLine> lines = new ArrayList<>();

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalHt;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalVat;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalTtc;

    /** Mention libre reprise sur le PDF (conditions particulières…). */
    @Column(length = 1000)
    private String notes;

    /** Demande d'inscription d'origine, si le document en découle. */
    private UUID registrationId;

    /** Pour une facture issue d'un devis : numéro du devis d'origine. */
    private String sourceQuoteNumber;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    private Instant sentAt;
    private String lastSentTo;
    private LocalDate paidAt;

    public UUID getId() { return id; }

    public BillingDocumentType getType() { return type; }
    public void setType(BillingDocumentType type) { this.type = type; }

    public String getNumber() { return number; }
    public void setNumber(String number) { this.number = number; }

    public BillingDocumentStatus getStatus() { return status; }
    public void setStatus(BillingDocumentStatus status) { this.status = status; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public LocalDate getValidUntil() { return validUntil; }
    public void setValidUntil(LocalDate validUntil) { this.validUntil = validUntil; }

    public LocalDate getServiceStartDate() { return serviceStartDate; }
    public void setServiceStartDate(LocalDate serviceStartDate) { this.serviceStartDate = serviceStartDate; }

    public LocalDate getServiceEndDate() { return serviceEndDate; }
    public void setServiceEndDate(LocalDate serviceEndDate) { this.serviceEndDate = serviceEndDate; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public String getClientContactName() { return clientContactName; }
    public void setClientContactName(String clientContactName) { this.clientContactName = clientContactName; }

    public String getClientAddressLine() { return clientAddressLine; }
    public void setClientAddressLine(String clientAddressLine) { this.clientAddressLine = clientAddressLine; }

    public String getClientPostalCode() { return clientPostalCode; }
    public void setClientPostalCode(String clientPostalCode) { this.clientPostalCode = clientPostalCode; }

    public String getClientCity() { return clientCity; }
    public void setClientCity(String clientCity) { this.clientCity = clientCity; }

    public String getClientCountry() { return clientCountry; }
    public void setClientCountry(String clientCountry) { this.clientCountry = clientCountry; }

    public String getClientSiret() { return clientSiret; }
    public void setClientSiret(String clientSiret) { this.clientSiret = clientSiret; }

    public String getClientVatNumber() { return clientVatNumber; }
    public void setClientVatNumber(String clientVatNumber) { this.clientVatNumber = clientVatNumber; }

    public String getClientEmail() { return clientEmail; }
    public void setClientEmail(String clientEmail) { this.clientEmail = clientEmail; }

    public List<BillingLine> getLines() { return lines; }
    public void setLines(List<BillingLine> lines) { this.lines = lines; }

    public BigDecimal getTotalHt() { return totalHt; }
    public void setTotalHt(BigDecimal totalHt) { this.totalHt = totalHt; }

    public BigDecimal getTotalVat() { return totalVat; }
    public void setTotalVat(BigDecimal totalVat) { this.totalVat = totalVat; }

    public BigDecimal getTotalTtc() { return totalTtc; }
    public void setTotalTtc(BigDecimal totalTtc) { this.totalTtc = totalTtc; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public UUID getRegistrationId() { return registrationId; }
    public void setRegistrationId(UUID registrationId) { this.registrationId = registrationId; }

    public String getSourceQuoteNumber() { return sourceQuoteNumber; }
    public void setSourceQuoteNumber(String sourceQuoteNumber) { this.sourceQuoteNumber = sourceQuoteNumber; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getSentAt() { return sentAt; }
    public void setSentAt(Instant sentAt) { this.sentAt = sentAt; }

    public String getLastSentTo() { return lastSentTo; }
    public void setLastSentTo(String lastSentTo) { this.lastSentTo = lastSentTo; }

    public LocalDate getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDate paidAt) { this.paidAt = paidAt; }
}
