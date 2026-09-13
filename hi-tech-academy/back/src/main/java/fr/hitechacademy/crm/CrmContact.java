package fr.hitechacademy.crm;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Contact du CRM : une carte du kanban de suivi commercial. Les notes et
 * l'historique des conversations vivent dans CrmActivity.
 */
@Entity
@Table(name = "crm_contacts")
public class CrmContact {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String firstName;

    @Column(nullable = false, length = 100)
    private String lastName;

    @Column(length = 200)
    private String email;

    @Column(length = 30)
    private String phone;

    @Column(length = 200)
    private String company;

    @Column(length = 150)
    private String jobTitle;

    /** Formation d'intérêt (id du catalogue formations.jsx). */
    @Column(length = 100)
    private String formationId;

    /** Origine du contact : Site web, Téléphone, LinkedIn, Recommandation… */
    @Column(length = 100)
    private String source;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CrmStage stage = CrmStage.TO_CONTACT;

    /** Ordre d'affichage dans la colonne. */
    @Column(nullable = false)
    private int position = 0;

    /** Prochaine relance planifiée (mise en évidence si dépassée). */
    private LocalDate nextFollowUpAt;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    public UUID getId() { return id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getFormationId() { return formationId; }
    public void setFormationId(String formationId) { this.formationId = formationId; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public CrmStage getStage() { return stage; }
    public void setStage(CrmStage stage) { this.stage = stage; }

    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }

    public LocalDate getNextFollowUpAt() { return nextFollowUpAt; }
    public void setNextFollowUpAt(LocalDate nextFollowUpAt) { this.nextFollowUpAt = nextFollowUpAt; }

    public Instant getCreatedAt() { return createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
