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
import java.util.UUID;

/**
 * Entrée de l'historique d'un contact CRM : note, compte rendu d'appel,
 * d'email, de rendez-vous… Les déplacements de colonne y sont tracés
 * automatiquement (type STAGE_CHANGE).
 */
@Entity
@Table(name = "crm_activities")
public class CrmActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID contactId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CrmActivityType type = CrmActivityType.NOTE;

    @Column(nullable = false, length = 4000)
    private String content;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }

    public UUID getContactId() { return contactId; }
    public void setContactId(UUID contactId) { this.contactId = contactId; }

    public CrmActivityType getType() { return type; }
    public void setType(CrmActivityType type) { this.type = type; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Instant getCreatedAt() { return createdAt; }
}
