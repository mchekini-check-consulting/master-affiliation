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
 * Questionnaire des attentes du commanditaire — rempli par l'entreprise qui
 * inscrit ses salariés, obligatoire avant transmission de la demande à
 * l'admin (la demande reste INCOMPLETE tant qu'il n'est pas renseigné).
 */
@Entity
@Table(name = "sponsor_surveys")
public class SponsorSurvey {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(optional = false)
    @JoinColumn(name = "registration_id", nullable = false, unique = true)
    private RegistrationRequest registration;

    @Column(nullable = false)
    private Instant submittedAt = Instant.now();

    // 1. Le projet de formation
    @Column(length = 4000)
    private String trainingReason;        // pourquoi cette formation, contexte du projet

    @Column(length = 4000)
    private String needOrigin;            // comment le besoin a été identifié (Qualiopi ind. 4)

    private Integer traineeCount;         // nombre de salariés concernés

    @Column(length = 4000)
    private String traineeProfiles;       // profils / fonctions des salariés à former

    // 2. Les attentes de l'entreprise
    @Column(length = 4000)
    private String expectedSkills;        // compétences attendues à l'issue

    @Column(length = 4000)
    private String successCriteria;       // comment l'entreprise jugera la formation réussie

    @Column(length = 4000)
    private String applicationProject;    // projet concret d'application après la formation

    // 3. Organisation et financement
    @Column(length = 2000)
    private String planningConstraints;   // contraintes de planning / disponibilité

    private String funding;               // OPCO / fonds propres / autre

    private boolean needsAdaptation;      // salarié(s) en situation de handicap

    @Column(length = 2000)
    private String adaptationDetails;

    @Column(length = 4000)
    private String comments;

    public UUID getId() { return id; }

    public RegistrationRequest getRegistration() { return registration; }
    public void setRegistration(RegistrationRequest registration) { this.registration = registration; }

    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }

    public String getTrainingReason() { return trainingReason; }
    public void setTrainingReason(String trainingReason) { this.trainingReason = trainingReason; }

    public String getNeedOrigin() { return needOrigin; }
    public void setNeedOrigin(String needOrigin) { this.needOrigin = needOrigin; }

    public Integer getTraineeCount() { return traineeCount; }
    public void setTraineeCount(Integer traineeCount) { this.traineeCount = traineeCount; }

    public String getTraineeProfiles() { return traineeProfiles; }
    public void setTraineeProfiles(String traineeProfiles) { this.traineeProfiles = traineeProfiles; }

    public String getExpectedSkills() { return expectedSkills; }
    public void setExpectedSkills(String expectedSkills) { this.expectedSkills = expectedSkills; }

    public String getSuccessCriteria() { return successCriteria; }
    public void setSuccessCriteria(String successCriteria) { this.successCriteria = successCriteria; }

    public String getApplicationProject() { return applicationProject; }
    public void setApplicationProject(String applicationProject) { this.applicationProject = applicationProject; }

    public String getPlanningConstraints() { return planningConstraints; }
    public void setPlanningConstraints(String planningConstraints) { this.planningConstraints = planningConstraints; }

    public String getFunding() { return funding; }
    public void setFunding(String funding) { this.funding = funding; }

    public boolean isNeedsAdaptation() { return needsAdaptation; }
    public void setNeedsAdaptation(boolean needsAdaptation) { this.needsAdaptation = needsAdaptation; }

    public String getAdaptationDetails() { return adaptationDetails; }
    public void setAdaptationDetails(String adaptationDetails) { this.adaptationDetails = adaptationDetails; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}
