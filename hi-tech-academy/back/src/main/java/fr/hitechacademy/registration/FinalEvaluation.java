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
import java.util.UUID;

/**
 * QCM d'évaluation finale : l'admin envoie l'invitation par email à un
 * apprenant choisi (demande validée), l'apprenant répond en ligne (une
 * seule tentative), la note est corrigée côté serveur. Rattachée soit à la
 * demande (particulier / indépendant), soit à un apprenant salarié.
 */
@Entity
@Table(name = "final_evaluations")
public class FinalEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "registration_id", unique = true)
    private RegistrationRequest registration;

    @OneToOne
    @JoinColumn(name = "trainee_id", unique = true)
    private Trainee trainee;

    @Column(nullable = false)
    private Instant invitedAt = Instant.now();

    private Instant submittedAt;

    // Indices choisis (ordre du catalogue), renseignés à la soumission
    private String answers;

    private Integer score;

    private Integer maxScore;

    public UUID getId() { return id; }

    public RegistrationRequest getRegistration() { return registration; }
    public void setRegistration(RegistrationRequest registration) { this.registration = registration; }

    public Trainee getTrainee() { return trainee; }
    public void setTrainee(Trainee trainee) { this.trainee = trainee; }

    public Instant getInvitedAt() { return invitedAt; }
    public void setInvitedAt(Instant invitedAt) { this.invitedAt = invitedAt; }

    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }

    public String getAnswers() { return answers; }
    public void setAnswers(String answers) { this.answers = answers; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public Integer getMaxScore() { return maxScore; }
    public void setMaxScore(Integer maxScore) { this.maxScore = maxScore; }

    public boolean isSubmitted() {
        return submittedAt != null;
    }
}
