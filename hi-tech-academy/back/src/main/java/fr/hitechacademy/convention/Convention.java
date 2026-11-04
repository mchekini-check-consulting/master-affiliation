package fr.hitechacademy.convention;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.CollectionTable;
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
 * Convention de formation professionnelle émise depuis l'admin et signée
 * électroniquement via Yousign. Les données client et tarifaires sont copiées
 * à l'émission (figées), comme pour les documents de facturation ; le PDF signé
 * est stocké sur la convention elle-même une fois la signature terminée.
 */
@Entity
@Table(name = "conventions")
public class Convention {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String number; // CV-AAAA-NNNN

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConventionStatus status = ConventionStatus.DRAFT;

    @Column(nullable = false)
    private LocalDate issueDate;

    // Formation (copie figée du catalogue)
    @Column(nullable = false)
    private String formationId;
    @Column(nullable = false, length = 300)
    private String formationTitle;

    // Client (société ou particulier)
    @Column(nullable = false)
    private String clientName;
    private String clientRepresentativeName;
    @Column(nullable = false)
    private String clientAddressLine;
    @Column(nullable = false)
    private String clientPostalCode;
    @Column(nullable = false)
    private String clientCity;
    private String clientSiret;

    // Signataire côté client (destinataire Yousign)
    @Column(nullable = false)
    private String signerFirstName;
    @Column(nullable = false)
    private String signerLastName;
    @Column(nullable = false)
    private String signerEmail;

    // Session
    @Column(nullable = false)
    private LocalDate sessionStartDate;
    @Column(nullable = false)
    private LocalDate sessionEndDate;
    @Column(length = 4000)
    private String scheduleText;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "convention_participants", joinColumns = @JoinColumn(name = "convention_id"))
    @OrderColumn(name = "position")
    @Column(name = "full_name", nullable = false)
    private List<String> participants = new ArrayList<>();

    // Prix (copié du catalogue, modifiable à la création)
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal priceHt;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal priceTtc;

    // Indicateurs de résultats de l'organisme, copiés de la configuration au
    // moment de la création (le document émis ne bouge pas si les taux évoluent)
    @Column(precision = 5, scale = 2)
    private BigDecimal satisfactionRate;
    @Column(precision = 5, scale = 2)
    private BigDecimal recommendationRate;
    private String indicatorsBasis;

    // Financement OPCO : clause suspensive
    @Column(nullable = false)
    private boolean opcoFunded;
    private String opcoName;
    private LocalDate opcoDeadline;
    @Enumerated(EnumType.STRING)
    private OpcoPartialMode opcoPartialMode;

    // Suivi Yousign
    private String yousignRequestId;
    private String yousignStatus;
    private Instant sentAt;
    private Instant signedAt;

    /** PDF signé (avec les signatures Yousign), stocké une fois le circuit terminé. */
    private byte[] signedPdf;

    private UUID registrationId;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public String getNumber() { return number; }
    public void setNumber(String number) { this.number = number; }
    public ConventionStatus getStatus() { return status; }
    public void setStatus(ConventionStatus status) { this.status = status; }
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    public String getFormationId() { return formationId; }
    public void setFormationId(String formationId) { this.formationId = formationId; }
    public String getFormationTitle() { return formationTitle; }
    public void setFormationTitle(String formationTitle) { this.formationTitle = formationTitle; }
    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }
    public String getClientRepresentativeName() { return clientRepresentativeName; }
    public void setClientRepresentativeName(String v) { this.clientRepresentativeName = v; }
    public String getClientAddressLine() { return clientAddressLine; }
    public void setClientAddressLine(String clientAddressLine) { this.clientAddressLine = clientAddressLine; }
    public String getClientPostalCode() { return clientPostalCode; }
    public void setClientPostalCode(String clientPostalCode) { this.clientPostalCode = clientPostalCode; }
    public String getClientCity() { return clientCity; }
    public void setClientCity(String clientCity) { this.clientCity = clientCity; }
    public String getClientSiret() { return clientSiret; }
    public void setClientSiret(String clientSiret) { this.clientSiret = clientSiret; }
    public String getSignerFirstName() { return signerFirstName; }
    public void setSignerFirstName(String signerFirstName) { this.signerFirstName = signerFirstName; }
    public String getSignerLastName() { return signerLastName; }
    public void setSignerLastName(String signerLastName) { this.signerLastName = signerLastName; }
    public String getSignerEmail() { return signerEmail; }
    public void setSignerEmail(String signerEmail) { this.signerEmail = signerEmail; }
    public LocalDate getSessionStartDate() { return sessionStartDate; }
    public void setSessionStartDate(LocalDate sessionStartDate) { this.sessionStartDate = sessionStartDate; }
    public LocalDate getSessionEndDate() { return sessionEndDate; }
    public void setSessionEndDate(LocalDate sessionEndDate) { this.sessionEndDate = sessionEndDate; }
    public String getScheduleText() { return scheduleText; }
    public void setScheduleText(String scheduleText) { this.scheduleText = scheduleText; }
    public List<String> getParticipants() { return participants; }
    public void setParticipants(List<String> participants) { this.participants = participants; }
    public BigDecimal getPriceHt() { return priceHt; }
    public void setPriceHt(BigDecimal priceHt) { this.priceHt = priceHt; }
    public BigDecimal getPriceTtc() { return priceTtc; }
    public void setPriceTtc(BigDecimal priceTtc) { this.priceTtc = priceTtc; }
    public BigDecimal getSatisfactionRate() { return satisfactionRate; }
    public void setSatisfactionRate(BigDecimal satisfactionRate) { this.satisfactionRate = satisfactionRate; }
    public BigDecimal getRecommendationRate() { return recommendationRate; }
    public void setRecommendationRate(BigDecimal recommendationRate) { this.recommendationRate = recommendationRate; }
    public String getIndicatorsBasis() { return indicatorsBasis; }
    public void setIndicatorsBasis(String indicatorsBasis) { this.indicatorsBasis = indicatorsBasis; }
    public boolean isOpcoFunded() { return opcoFunded; }
    public void setOpcoFunded(boolean opcoFunded) { this.opcoFunded = opcoFunded; }
    public String getOpcoName() { return opcoName; }
    public void setOpcoName(String opcoName) { this.opcoName = opcoName; }
    public LocalDate getOpcoDeadline() { return opcoDeadline; }
    public void setOpcoDeadline(LocalDate opcoDeadline) { this.opcoDeadline = opcoDeadline; }
    public OpcoPartialMode getOpcoPartialMode() { return opcoPartialMode; }
    public void setOpcoPartialMode(OpcoPartialMode opcoPartialMode) { this.opcoPartialMode = opcoPartialMode; }
    public String getYousignRequestId() { return yousignRequestId; }
    public void setYousignRequestId(String yousignRequestId) { this.yousignRequestId = yousignRequestId; }
    public String getYousignStatus() { return yousignStatus; }
    public void setYousignStatus(String yousignStatus) { this.yousignStatus = yousignStatus; }
    public Instant getSentAt() { return sentAt; }
    public void setSentAt(Instant sentAt) { this.sentAt = sentAt; }
    public Instant getSignedAt() { return signedAt; }
    public void setSignedAt(Instant signedAt) { this.signedAt = signedAt; }
    public byte[] getSignedPdf() { return signedPdf; }
    public void setSignedPdf(byte[] signedPdf) { this.signedPdf = signedPdf; }
    public UUID getRegistrationId() { return registrationId; }
    public void setRegistrationId(UUID registrationId) { this.registrationId = registrationId; }
    public Instant getCreatedAt() { return createdAt; }
}
