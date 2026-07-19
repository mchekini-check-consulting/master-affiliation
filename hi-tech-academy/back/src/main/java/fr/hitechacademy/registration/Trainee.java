package fr.hitechacademy.registration;

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
 * Apprenant salarié d'une demande d'inscription entreprise : identité +
 * réponses à son questionnaire d'analyse du besoin individuel (avec note de
 * positionnement). Une demande COMPANY peut avoir plusieurs apprenants ;
 * pour un indépendant ou un particulier, l'analyse du besoin reste portée
 * par la demande elle-même (NeedsAnalysis).
 */
@Entity
@Table(name = "trainees")
public class Trainee {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "registration_id", nullable = false)
    private RegistrationRequest registration;

    @Column(nullable = false)
    private Instant submittedAt = Instant.now();

    // Identité du salarié
    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String email;

    private String jobTitle;

    // Contexte et besoin
    @Column(length = 4000)
    private String activityContext;

    @Column(length = 4000)
    private String problemToSolve;

    @Column(length = 4000)
    private String expectedObjectives;

    // Niveau de départ (auto-évaluation)
    private String levelLinux;
    private String levelDocker;
    private String levelKubernetes;

    // Attentes et besoins spécifiques
    @Column(length = 4000)
    private String specificUseCase;

    private boolean needsAdaptation;

    @Column(length = 2000)
    private String adaptationDetails;

    // Contraintes
    @Column(length = 2000)
    private String planningConstraints;

    // Note issue de l'auto-évaluation
    @Column(nullable = false)
    private int score;

    @Column(nullable = false)
    private int maxScore;

    public UUID getId() { return id; }

    public RegistrationRequest getRegistration() { return registration; }
    public void setRegistration(RegistrationRequest registration) { this.registration = registration; }

    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getActivityContext() { return activityContext; }
    public void setActivityContext(String activityContext) { this.activityContext = activityContext; }

    public String getProblemToSolve() { return problemToSolve; }
    public void setProblemToSolve(String problemToSolve) { this.problemToSolve = problemToSolve; }

    public String getExpectedObjectives() { return expectedObjectives; }
    public void setExpectedObjectives(String expectedObjectives) { this.expectedObjectives = expectedObjectives; }

    public String getLevelLinux() { return levelLinux; }
    public void setLevelLinux(String levelLinux) { this.levelLinux = levelLinux; }

    public String getLevelDocker() { return levelDocker; }
    public void setLevelDocker(String levelDocker) { this.levelDocker = levelDocker; }

    public String getLevelKubernetes() { return levelKubernetes; }
    public void setLevelKubernetes(String levelKubernetes) { this.levelKubernetes = levelKubernetes; }

    public String getSpecificUseCase() { return specificUseCase; }
    public void setSpecificUseCase(String specificUseCase) { this.specificUseCase = specificUseCase; }

    public boolean isNeedsAdaptation() { return needsAdaptation; }
    public void setNeedsAdaptation(boolean needsAdaptation) { this.needsAdaptation = needsAdaptation; }

    public String getAdaptationDetails() { return adaptationDetails; }
    public void setAdaptationDetails(String adaptationDetails) { this.adaptationDetails = adaptationDetails; }

    public String getPlanningConstraints() { return planningConstraints; }
    public void setPlanningConstraints(String planningConstraints) { this.planningConstraints = planningConstraints; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getMaxScore() { return maxScore; }
    public void setMaxScore(int maxScore) { this.maxScore = maxScore; }
}
