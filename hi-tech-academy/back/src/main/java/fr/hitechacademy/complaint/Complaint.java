package fr.hitechacademy.complaint;

import fr.hitechacademy.registration.ApplicantType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * Réclamation déposée depuis le site public (procédure de traitement des
 * réclamations — indicateurs Qualiopi 31 et 32). Le réclamant renseigne le
 * minimum d'informations : formation concernée, type (entreprise /
 * indépendant / particulier), identité, email et le texte de la réclamation.
 */
@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintStatus status = ComplaintStatus.RECEIVED;

    // Formation concernée
    @Column(nullable = false)
    private String formationId;

    @Column(nullable = false)
    private String formationTitle;

    // Réclamant
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicantType complainantType;

    private String companyName;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, length = 4000)
    private String message;

    // Traitement côté organisme
    private Instant handledAt;

    @Column(length = 4000)
    private String response;

    public UUID getId() { return id; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public ComplaintStatus getStatus() { return status; }
    public void setStatus(ComplaintStatus status) { this.status = status; }

    public String getFormationId() { return formationId; }
    public void setFormationId(String formationId) { this.formationId = formationId; }

    public String getFormationTitle() { return formationTitle; }
    public void setFormationTitle(String formationTitle) { this.formationTitle = formationTitle; }

    public ApplicantType getComplainantType() { return complainantType; }
    public void setComplainantType(ApplicantType complainantType) { this.complainantType = complainantType; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Instant getHandledAt() { return handledAt; }
    public void setHandledAt(Instant handledAt) { this.handledAt = handledAt; }

    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
}
