package fr.hitechacademy.registration;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Demande d'inscription à une formation — mêmes champs que le formulaire
 * Qualiobee. Une seule table : les champs entreprise sont vides pour un
 * particulier et inversement.
 */
@Entity
@Table(name = "registration_requests")
public class RegistrationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegistrationStatus status = RegistrationStatus.INCOMPLETE;

    private Instant decidedAt;

    // --- Formation demandée --------------------------------------------
    @Column(nullable = false)
    private String formationId;

    @Column(nullable = false)
    private String formationTitle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicantType applicantType;

    // --- Informations de l'entreprise (COMPANY / INDEPENDENT) ----------
    private String companyName;
    private String siret;
    private String naf;
    private String clientTypology;
    private String legalForm;
    private String billingEmail;

    // --- Adresse (entreprise ou particulier) ---------------------------
    private String addressLine;
    private String addressComplement;
    private String postalCode;
    private String city;
    private String country;

    // --- Référent / apprenant ------------------------------------------
    private String civility;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    private String jobTitle;

    @Column(length = 2000)
    private String notes;

    // --- Informations complémentaires (INDIVIDUAL) ---------------------
    private String phone2;
    private String traineeType;
    private LocalDate birthDate;
    private String birthCity;
    private String birthDepartment;
    private String nationality;
    private String socialSecurityNumber;
    private String diplomaLevel;
    private String diplomaTitle;
    private String currentPosition;
    private boolean needsAdaptation;

    // --- Questionnaire d'analyse du besoin -----------------------------
    @OneToOne(mappedBy = "registration", cascade = CascadeType.ALL, orphanRemoval = true)
    private NeedsAnalysis needsAnalysis;

    // --- Certificat de réalisation (demandes validées) ------------------
    @OneToOne(mappedBy = "registration", cascade = CascadeType.ALL, orphanRemoval = true)
    private Certificate certificate;

    // --- Questionnaire des attentes du commanditaire (COMPANY) ----------
    @OneToOne(mappedBy = "registration", cascade = CascadeType.ALL, orphanRemoval = true)
    private SponsorSurvey sponsorSurvey;

    // --- Apprenants salariés et leurs questionnaires (COMPANY) ----------
    @OneToMany(mappedBy = "registration", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("submittedAt ASC")
    private List<Trainee> trainees = new ArrayList<>();

    public UUID getId() { return id; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public RegistrationStatus getStatus() { return status; }
    public void setStatus(RegistrationStatus status) { this.status = status; }

    public Instant getDecidedAt() { return decidedAt; }
    public void setDecidedAt(Instant decidedAt) { this.decidedAt = decidedAt; }

    public String getFormationId() { return formationId; }
    public void setFormationId(String formationId) { this.formationId = formationId; }

    public String getFormationTitle() { return formationTitle; }
    public void setFormationTitle(String formationTitle) { this.formationTitle = formationTitle; }

    public ApplicantType getApplicantType() { return applicantType; }
    public void setApplicantType(ApplicantType applicantType) { this.applicantType = applicantType; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getSiret() { return siret; }
    public void setSiret(String siret) { this.siret = siret; }

    public String getNaf() { return naf; }
    public void setNaf(String naf) { this.naf = naf; }

    public String getClientTypology() { return clientTypology; }
    public void setClientTypology(String clientTypology) { this.clientTypology = clientTypology; }

    public String getLegalForm() { return legalForm; }
    public void setLegalForm(String legalForm) { this.legalForm = legalForm; }

    public String getBillingEmail() { return billingEmail; }
    public void setBillingEmail(String billingEmail) { this.billingEmail = billingEmail; }

    public String getAddressLine() { return addressLine; }
    public void setAddressLine(String addressLine) { this.addressLine = addressLine; }

    public String getAddressComplement() { return addressComplement; }
    public void setAddressComplement(String addressComplement) { this.addressComplement = addressComplement; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getCivility() { return civility; }
    public void setCivility(String civility) { this.civility = civility; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getPhone2() { return phone2; }
    public void setPhone2(String phone2) { this.phone2 = phone2; }

    public String getTraineeType() { return traineeType; }
    public void setTraineeType(String traineeType) { this.traineeType = traineeType; }

    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }

    public String getBirthCity() { return birthCity; }
    public void setBirthCity(String birthCity) { this.birthCity = birthCity; }

    public String getBirthDepartment() { return birthDepartment; }
    public void setBirthDepartment(String birthDepartment) { this.birthDepartment = birthDepartment; }

    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }

    public String getSocialSecurityNumber() { return socialSecurityNumber; }
    public void setSocialSecurityNumber(String socialSecurityNumber) { this.socialSecurityNumber = socialSecurityNumber; }

    public String getDiplomaLevel() { return diplomaLevel; }
    public void setDiplomaLevel(String diplomaLevel) { this.diplomaLevel = diplomaLevel; }

    public String getDiplomaTitle() { return diplomaTitle; }
    public void setDiplomaTitle(String diplomaTitle) { this.diplomaTitle = diplomaTitle; }

    public String getCurrentPosition() { return currentPosition; }
    public void setCurrentPosition(String currentPosition) { this.currentPosition = currentPosition; }

    public boolean isNeedsAdaptation() { return needsAdaptation; }
    public void setNeedsAdaptation(boolean needsAdaptation) { this.needsAdaptation = needsAdaptation; }

    public NeedsAnalysis getNeedsAnalysis() { return needsAnalysis; }
    public void setNeedsAnalysis(NeedsAnalysis needsAnalysis) { this.needsAnalysis = needsAnalysis; }

    public Certificate getCertificate() { return certificate; }
    public void setCertificate(Certificate certificate) { this.certificate = certificate; }

    public SponsorSurvey getSponsorSurvey() { return sponsorSurvey; }
    public void setSponsorSurvey(SponsorSurvey sponsorSurvey) { this.sponsorSurvey = sponsorSurvey; }

    public List<Trainee> getTrainees() { return trainees; }

    /**
     * Questionnaire obligatoire renseigné ? Entreprise : questionnaire
     * commanditaire ; particulier / indépendant : analyse du besoin.
     */
    public boolean requiredSurveyCompleted() {
        return applicantType == ApplicantType.COMPANY ? sponsorSurvey != null : needsAnalysis != null;
    }
}
