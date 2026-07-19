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
 * Test de positionnement passé après l'analyse du besoin. Rattaché soit à
 * la demande (particulier / indépendant), soit à un apprenant salarié
 * (demande entreprise) — exactement un des deux liens est renseigné.
 * Les réponses au QCM sont stockées comme indices séparés par des virgules
 * (dans l'ordre du catalogue) ; la note est corrigée côté serveur.
 */
@Entity
@Table(name = "positioning_tests")
public class PositioningTest {

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
    private Instant submittedAt = Instant.now();

    // A. Auto-évaluation Kubernetes
    private String selfLevel;

    // B/C. Réponses au QCM (indices choisis, ex : "1,2,1,2,1,0")
    @Column(nullable = false)
    private String answers;

    // D. Connaissances Kubernetes (facultatif)
    @Column(length = 4000)
    private String kubernetesPurpose;

    private String knownTerms; // termes cochés, séparés par « ; »

    // E. Attentes
    @Column(length = 4000)
    private String expectations;

    @Column(nullable = false)
    private int score;

    @Column(nullable = false)
    private int maxScore;

    public UUID getId() { return id; }

    public RegistrationRequest getRegistration() { return registration; }
    public void setRegistration(RegistrationRequest registration) { this.registration = registration; }

    public Trainee getTrainee() { return trainee; }
    public void setTrainee(Trainee trainee) { this.trainee = trainee; }

    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }

    public String getSelfLevel() { return selfLevel; }
    public void setSelfLevel(String selfLevel) { this.selfLevel = selfLevel; }

    public String getAnswers() { return answers; }
    public void setAnswers(String answers) { this.answers = answers; }

    public String getKubernetesPurpose() { return kubernetesPurpose; }
    public void setKubernetesPurpose(String kubernetesPurpose) { this.kubernetesPurpose = kubernetesPurpose; }

    public String getKnownTerms() { return knownTerms; }
    public void setKnownTerms(String knownTerms) { this.knownTerms = knownTerms; }

    public String getExpectations() { return expectations; }
    public void setExpectations(String expectations) { this.expectations = expectations; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getMaxScore() { return maxScore; }
    public void setMaxScore(int maxScore) { this.maxScore = maxScore; }
}
