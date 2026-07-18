package fr.hitechacademy.registration;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Certificat de réalisation émis pour une demande d'inscription validée
 * (un certificat au plus par demande). Le PDF est généré côté front à
 * partir de ces données ; elles restent en base pour la traçabilité
 * Qualiopi et le re-téléchargement.
 */
@Entity
@Table(name = "certificates")
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(optional = false)
    @JoinColumn(name = "registration_id", nullable = false, unique = true)
    private RegistrationRequest registration;

    @Column(nullable = false)
    private Instant issuedAt = Instant.now();

    @Column(nullable = false)
    private LocalDate sessionStartDate;

    @Column(nullable = false)
    private LocalDate sessionEndDate;

    @Column(nullable = false)
    private int durationHours;

    public UUID getId() { return id; }

    public RegistrationRequest getRegistration() { return registration; }
    public void setRegistration(RegistrationRequest registration) { this.registration = registration; }

    public Instant getIssuedAt() { return issuedAt; }
    public void setIssuedAt(Instant issuedAt) { this.issuedAt = issuedAt; }

    public LocalDate getSessionStartDate() { return sessionStartDate; }
    public void setSessionStartDate(LocalDate sessionStartDate) { this.sessionStartDate = sessionStartDate; }

    public LocalDate getSessionEndDate() { return sessionEndDate; }
    public void setSessionEndDate(LocalDate sessionEndDate) { this.sessionEndDate = sessionEndDate; }

    public int getDurationHours() { return durationHours; }
    public void setDurationHours(int durationHours) { this.durationHours = durationHours; }
}
