package fr.hitechacademy.session;

import fr.hitechacademy.registration.RegistrationRequest;
import fr.hitechacademy.registration.Trainee;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * Invitation à un questionnaire de satisfaction et sa réponse. Une ligne est
 * créée à l'envoi de l'email (invitedAt) ; la réponse du destinataire remplit
 * answers (JSON clé → valeur, questions dans src/data/satisfactionData.js) et
 * submittedAt. L'UUID de la ligne sert de jeton dans le lien public.
 *
 * kind : HOT_LEARNER (à chaud apprenant), CLIENT (satisfaction client),
 * COLD_LEARNER (à froid apprenant).
 */
@Entity
@Table(name = "satisfaction_responses")
public class SatisfactionResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String kind;

    @ManyToOne(optional = false, fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "registration_id", nullable = false)
    private RegistrationRequest registration;

    /** Salarié destinataire pour une demande entreprise, null sinon. */
    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "trainee_id")
    private Trainee trainee;

    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private TrainingSession session;

    @Column(nullable = false)
    private String recipientEmail;
    @Column(nullable = false)
    private String recipientName;

    @Column(nullable = false)
    private Instant invitedAt = Instant.now();
    private Instant submittedAt;

    @Column(columnDefinition = "text")
    private String answers;

    public UUID getId() { return id; }
    public String getKind() { return kind; }
    public void setKind(String kind) { this.kind = kind; }
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
    public Instant getInvitedAt() { return invitedAt; }
    public void setInvitedAt(Instant invitedAt) { this.invitedAt = invitedAt; }
    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }
    public String getAnswers() { return answers; }
    public void setAnswers(String answers) { this.answers = answers; }
}
