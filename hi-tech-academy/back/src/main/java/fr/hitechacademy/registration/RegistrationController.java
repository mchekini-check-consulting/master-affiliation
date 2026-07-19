package fr.hitechacademy.registration;

import fr.hitechacademy.registration.RegistrationDtos.CreateRegistrationRequest;
import fr.hitechacademy.registration.RegistrationDtos.CreatedResponse;
import fr.hitechacademy.registration.RegistrationDtos.NeedsAnalysisRequest;
import fr.hitechacademy.registration.RegistrationDtos.PublicView;
import fr.hitechacademy.registration.RegistrationDtos.SponsorSurveyRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

/**
 * Parcours public : dépôt d'une demande d'inscription puis réponse au
 * questionnaire d'analyse du besoin.
 */
@RestController
@RequestMapping("/registrations")
public class RegistrationController {

    private final RegistrationRepository repository;

    public RegistrationController(RegistrationRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreatedResponse create(@Valid @RequestBody CreateRegistrationRequest body) {
        boolean isCompany = body.applicantType() != ApplicantType.INDIVIDUAL;
        if (isCompany && isBlank(body.companyName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nom de l'entreprise est obligatoire");
        }

        RegistrationRequest r = new RegistrationRequest();
        r.setFormationId(body.formationId());
        r.setFormationTitle(body.formationTitle());
        r.setApplicantType(body.applicantType());

        r.setCompanyName(body.companyName());
        r.setSiret(body.siret());
        r.setNaf(body.naf());
        r.setClientTypology(body.clientTypology());
        r.setLegalForm(body.legalForm());
        r.setBillingEmail(body.billingEmail());

        r.setAddressLine(body.addressLine());
        r.setAddressComplement(body.addressComplement());
        r.setPostalCode(body.postalCode());
        r.setCity(body.city());
        r.setCountry(body.country());

        r.setCivility(body.civility());
        r.setFirstName(body.firstName());
        r.setLastName(body.lastName());
        r.setEmail(body.email());
        r.setPhone(body.phone());
        r.setJobTitle(body.jobTitle());
        r.setNotes(body.notes());

        r.setPhone2(body.phone2());
        r.setTraineeType(body.traineeType());
        r.setBirthDate(body.birthDate());
        r.setBirthCity(body.birthCity());
        r.setBirthDepartment(body.birthDepartment());
        r.setNationality(body.nationality());
        r.setSocialSecurityNumber(body.socialSecurityNumber());
        r.setDiplomaLevel(body.diplomaLevel());
        r.setDiplomaTitle(body.diplomaTitle());
        r.setCurrentPosition(body.currentPosition());
        r.setNeedsAdaptation(Boolean.TRUE.equals(body.needsAdaptation()));

        RegistrationRequest saved = repository.save(r);
        return new CreatedResponse(saved.getId(), saved.getStatus());
    }

    @GetMapping("/{id}/public")
    @Transactional(readOnly = true)
    public PublicView publicView(@PathVariable UUID id) {
        RegistrationRequest r = find(id);
        return new PublicView(
                r.getId(),
                r.getStatus(),
                r.getFormationId(),
                r.getFormationTitle(),
                r.getApplicantType(),
                r.getFirstName(),
                r.getLastName(),
                r.getCompanyName(),
                r.getNeedsAnalysis() != null,
                r.getSponsorSurvey() != null);
    }

    @PostMapping("/{id}/needs-analysis")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public void submitNeedsAnalysis(@PathVariable UUID id, @RequestBody NeedsAnalysisRequest body) {
        RegistrationRequest r = find(id);
        if (r.getNeedsAnalysis() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Le questionnaire a déjà été renseigné pour cette demande");
        }

        NeedsAnalysis na = new NeedsAnalysis();
        na.setRegistration(r);
        na.setBeneficiaryName(body.beneficiaryName());
        na.setCompanyRole(body.companyRole());
        na.setFunder(body.funder());
        na.setActivityContext(body.activityContext());
        na.setProblemToSolve(body.problemToSolve());
        na.setExpectedObjectives(body.expectedObjectives());
        na.setLevelLinux(body.levelLinux());
        na.setLevelDocker(body.levelDocker());
        na.setLevelKubernetes(body.levelKubernetes());
        na.setSpecificUseCase(body.specificUseCase());
        na.setPlanningConstraints(body.planningConstraints());
        na.setNeedsAdaptation(Boolean.TRUE.equals(body.needsAdaptation()));
        na.setAdaptationDetails(body.adaptationDetails());

        // Note de positionnement : 1 à 3 points par thème auto-évalué (sur 9)
        int score = levelPoints(body.levelLinux()) + levelPoints(body.levelDocker()) + levelPoints(body.levelKubernetes());
        na.setScore(score);
        na.setMaxScore(9);

        r.setNeedsAnalysis(na);
        completeIfRequiredSurveyDone(r);
        repository.save(r);
    }

    @PostMapping("/{id}/sponsor-survey")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public void submitSponsorSurvey(@PathVariable UUID id, @RequestBody SponsorSurveyRequest body) {
        RegistrationRequest r = find(id);
        if (r.getApplicantType() != ApplicantType.COMPANY) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le questionnaire commanditaire est réservé aux demandes d'entreprise");
        }
        if (r.getSponsorSurvey() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Le questionnaire a déjà été renseigné pour cette demande");
        }

        SponsorSurvey s = new SponsorSurvey();
        s.setRegistration(r);
        s.setTrainingReason(body.trainingReason());
        s.setTraineeCount(body.traineeCount());
        s.setTraineeProfiles(body.traineeProfiles());
        s.setExpectedSkills(body.expectedSkills());
        s.setSuccessCriteria(body.successCriteria());
        s.setApplicationProject(body.applicationProject());
        s.setPlanningConstraints(body.planningConstraints());
        s.setFunding(body.funding());
        s.setNeedsAdaptation(Boolean.TRUE.equals(body.needsAdaptation()));
        s.setAdaptationDetails(body.adaptationDetails());
        s.setComments(body.comments());

        r.setSponsorSurvey(s);
        completeIfRequiredSurveyDone(r);
        repository.save(r);
    }

    // Le questionnaire obligatoire vient d'être renseigné : la demande est
    // transmise à l'admin (INCOMPLETE -> PENDING).
    private static void completeIfRequiredSurveyDone(RegistrationRequest r) {
        if (r.getStatus() == RegistrationStatus.INCOMPLETE && r.requiredSurveyCompleted()) {
            r.setStatus(RegistrationStatus.PENDING);
        }
    }

    private RegistrationRequest find(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demande d'inscription introuvable"));
    }

    private static int levelPoints(String level) {
        if (level == null) {
            return 0;
        }
        return switch (level) {
            case "Débutant", "Aucune notion" -> 1;
            case "Intermédiaire", "Notions" -> 2;
            case "Confirmé", "Déjà utilisé" -> 3;
            default -> 0;
        };
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
