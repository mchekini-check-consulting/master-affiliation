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
 * Réponses au questionnaire d'analyse du besoin (document
 * « Analyse du besoin – V1.0 »), rattachées à une demande d'inscription.
 * La note est calculée à partir de l'auto-évaluation du niveau de départ
 * (Linux, Docker, Kubernetes : 1 à 3 points chacun, soit un total sur 9).
 */
@Entity
@Table(name = "needs_analyses")
public class NeedsAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(optional = false)
    @JoinColumn(name = "registration_id", nullable = false, unique = true)
    private RegistrationRequest registration;

    @Column(nullable = false)
    private Instant submittedAt = Instant.now();

    // 1. Identité
    private String beneficiaryName;
    private String companyRole;
    private String funder;

    // 2. Contexte et besoin
    @Column(length = 4000)
    private String activityContext;

    @Column(length = 4000)
    private String problemToSolve;

    @Column(length = 4000)
    private String expectedObjectives;

    // 3. Niveau de départ (auto-évaluation)
    private String levelLinux;       // Débutant / Intermédiaire / Confirmé
    private String levelDocker;      // Débutant / Intermédiaire / Confirmé
    private String levelKubernetes;  // Aucune notion / Notions / Déjà utilisé

    // 4. Attentes spécifiques
    @Column(length = 4000)
    private String specificUseCase;

    // 5. Contraintes et accessibilité
    @Column(length = 2000)
    private String planningConstraints;

    private boolean needsAdaptation;

    @Column(length = 2000)
    private String adaptationDetails;

    // Note issue de l'auto-évaluation (sur maxScore)
    @Column(nullable = false)
    private int score;

    @Column(nullable = false)
    private int maxScore;

    public UUID getId() { return id; }

    public RegistrationRequest getRegistration() { return registration; }
    public void setRegistration(RegistrationRequest registration) { this.registration = registration; }

    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }

    public String getBeneficiaryName() { return beneficiaryName; }
    public void setBeneficiaryName(String beneficiaryName) { this.beneficiaryName = beneficiaryName; }

    public String getCompanyRole() { return companyRole; }
    public void setCompanyRole(String companyRole) { this.companyRole = companyRole; }

    public String getFunder() { return funder; }
    public void setFunder(String funder) { this.funder = funder; }

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

    public String getPlanningConstraints() { return planningConstraints; }
    public void setPlanningConstraints(String planningConstraints) { this.planningConstraints = planningConstraints; }

    public boolean isNeedsAdaptation() { return needsAdaptation; }
    public void setNeedsAdaptation(boolean needsAdaptation) { this.needsAdaptation = needsAdaptation; }

    public String getAdaptationDetails() { return adaptationDetails; }
    public void setAdaptationDetails(String adaptationDetails) { this.adaptationDetails = adaptationDetails; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getMaxScore() { return maxScore; }
    public void setMaxScore(int maxScore) { this.maxScore = maxScore; }
}
