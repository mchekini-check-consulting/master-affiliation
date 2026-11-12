package fr.hitechacademy.session;

import fr.hitechacademy.registration.RegistrationRequest;
import fr.hitechacademy.registration.Trainee;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * Trace d'envoi d'un document de session à un apprenant (règlement intérieur,
 * CGV, programme, livret d'accueil, convocation, support de cours). Le
 * catalogue des documents (libellés, URL par formation) vit côté front
 * (src/data/sessionDocuments.js) ; le back trace et envoie le lien par email.
 */
@Entity
@Table(name = "document_dispatches")
public class DocumentDispatch {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String docKey;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id", nullable = false)
    private RegistrationRequest registration;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainee_id")
    private Trainee trainee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private TrainingSession session;

    @Column(nullable = false)
    private String recipientEmail;
    @Column(nullable = false)
    private String recipientName;
    @Column(nullable = false)
    private Instant sentAt = Instant.now();

    public UUID getId() { return id; }
    public String getDocKey() { return docKey; }
    public void setDocKey(String docKey) { this.docKey = docKey; }
    public RegistrationRequest getRegistration() { return registration; }
    public void setRegistration(RegistrationRequest registration) { this.registration = registration; }
    public Trainee getTrainee() { return trainee; }
    public void setTrainee(Trainee trainee) { this.trainee = trainee; }
    public TrainingSession getSession() { return session; }
    public void setSession(TrainingSession session) { this.session = session; }
    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }
    public Instant getSentAt() { return sentAt; }
    public void setSentAt(Instant sentAt) { this.sentAt = sentAt; }
}
