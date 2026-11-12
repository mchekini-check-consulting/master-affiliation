package fr.hitechacademy.session;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Session de formation : une formation sur une plage de dates, à laquelle on
 * rattache des demandes d'inscription. Son démarrage ouvre l'envoi des
 * questionnaires de satisfaction aux participants.
 */
@Entity
@Table(name = "training_sessions")
public class TrainingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String formationId;
    @Column(nullable = false, length = 300)
    private String formationTitle;
    @Column(nullable = false)
    private LocalDate startDate;
    @Column(nullable = false)
    private LocalDate endDate;

    /** PLANNED tant que la session n'est pas démarrée, STARTED ensuite. */
    @Column(nullable = false)
    private String status = "PLANNED";

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public String getFormationId() { return formationId; }
    public void setFormationId(String formationId) { this.formationId = formationId; }
    public String getFormationTitle() { return formationTitle; }
    public void setFormationTitle(String formationTitle) { this.formationTitle = formationTitle; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
}
