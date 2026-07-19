package fr.hitechacademy.registration;

import fr.hitechacademy.mail.MailService;
import fr.hitechacademy.registration.RegistrationDtos.CreateRegistrationRequest;
import fr.hitechacademy.registration.RegistrationDtos.CreatedResponse;
import fr.hitechacademy.registration.RegistrationDtos.NeedsAnalysisRequest;
import fr.hitechacademy.registration.RegistrationDtos.PublicView;
import fr.hitechacademy.registration.RegistrationDtos.PositioningTestRequest;
import fr.hitechacademy.registration.RegistrationDtos.SponsorSurveyRequest;
import fr.hitechacademy.registration.RegistrationDtos.TraineeCreatedResponse;
import fr.hitechacademy.registration.RegistrationDtos.TraineeRequest;
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

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Parcours public : dépôt d'une demande d'inscription puis réponse au
 * questionnaire d'analyse du besoin.
 */
@RestController
@RequestMapping("/registrations")
public class RegistrationController {

    private final RegistrationRepository repository;
    private final MailService mailService;

    public RegistrationController(RegistrationRepository repository, MailService mailService) {
        this.repository = repository;
        this.mailService = mailService;
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
                r.getSponsorSurvey() != null,
                r.getPositioningTest() != null,
                r.getTrainees().size());
    }

    /** Contenu du test de positionnement — sans les bonnes réponses. */
    @GetMapping("/positioning-test")
    public Map<String, Object> positioningTestContent() {
        return Map.of(
                "self_levels", PositioningTestCatalog.SELF_LEVELS,
                "known_terms", PositioningTestCatalog.KNOWN_TERMS,
                "questions", PositioningTestCatalog.QUESTIONS.stream()
                        .map(q -> Map.of(
                                "id", q.id(),
                                "section", q.section(),
                                "text", q.text(),
                                "options", q.options()))
                        .toList());
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
        boolean transmitted = completeIfRequiredSurveyDone(r);
        repository.save(r);
        if (transmitted) {
            mailService.notifyAdminNewRequest(r);
        }
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
        s.setNeedOrigin(body.needOrigin());
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
        boolean transmitted = completeIfRequiredSurveyDone(r);
        repository.save(r);
        if (transmitted) {
            mailService.notifyAdminNewRequest(r);
        }
    }

    /**
     * Questionnaire d'analyse du besoin d'un apprenant salarié (demandes
     * d'entreprise) : chaque salarié inscrit remplit le sien via le lien
     * partagé par le référent.
     */
    @PostMapping("/{id}/trainees")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public TraineeCreatedResponse submitTrainee(@PathVariable UUID id, @Valid @RequestBody TraineeRequest body) {
        RegistrationRequest r = find(id);
        if (r.getApplicantType() != ApplicantType.COMPANY) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le questionnaire apprenant est réservé aux demandes d'entreprise");
        }
        boolean alreadySubmitted = r.getTrainees().stream()
                .anyMatch(t -> t.getEmail().equalsIgnoreCase(body.email().trim()));
        if (alreadySubmitted) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Un questionnaire a déjà été renseigné avec cette adresse email");
        }

        Trainee t = new Trainee();
        t.setRegistration(r);
        t.setFirstName(body.firstName().trim());
        t.setLastName(body.lastName().trim());
        t.setEmail(body.email().trim());
        t.setJobTitle(body.jobTitle());
        t.setActivityContext(body.activityContext());
        t.setProblemToSolve(body.problemToSolve());
        t.setExpectedObjectives(body.expectedObjectives());
        t.setLevelLinux(body.levelLinux());
        t.setLevelDocker(body.levelDocker());
        t.setLevelKubernetes(body.levelKubernetes());
        t.setSpecificUseCase(body.specificUseCase());
        t.setNeedsAdaptation(Boolean.TRUE.equals(body.needsAdaptation()));
        t.setAdaptationDetails(body.adaptationDetails());
        t.setPlanningConstraints(body.planningConstraints());
        t.setScore(levelPoints(body.levelLinux()) + levelPoints(body.levelDocker()) + levelPoints(body.levelKubernetes()));
        t.setMaxScore(9);

        r.getTrainees().add(t);
        repository.save(r);
        // L'id permet d'enchaîner sur le test de positionnement du salarié
        return new TraineeCreatedResponse(
                r.getTrainees().stream()
                        .filter(saved -> saved.getEmail().equalsIgnoreCase(body.email().trim()))
                        .findFirst()
                        .map(Trainee::getId)
                        .orElse(null));
    }

    /** Test de positionnement du demandeur (particulier / indépendant). */
    @PostMapping("/{id}/positioning-test")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public void submitPositioningTest(@PathVariable UUID id, @Valid @RequestBody PositioningTestRequest body) {
        RegistrationRequest r = find(id);
        if (r.getApplicantType() == ApplicantType.COMPANY) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Pour une entreprise, le test est passé par chaque salarié");
        }
        if (r.getPositioningTest() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Le test a déjà été passé pour cette demande");
        }
        PositioningTest pt = buildPositioningTest(body);
        pt.setRegistration(r);
        r.setPositioningTest(pt);
        boolean transmitted = completeIfRequiredSurveyDone(r);
        repository.save(r);
        if (transmitted) {
            mailService.notifyAdminNewRequest(r);
        }
    }

    /** Test de positionnement d'un apprenant salarié (demandes entreprise). */
    @PostMapping("/{id}/trainees/{traineeId}/positioning-test")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public void submitTraineePositioningTest(@PathVariable UUID id, @PathVariable UUID traineeId,
                                             @Valid @RequestBody PositioningTestRequest body) {
        RegistrationRequest r = find(id);
        Trainee t = r.getTrainees().stream()
                .filter(x -> x.getId().equals(traineeId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Apprenant introuvable"));
        if (t.getPositioningTest() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Le test a déjà été passé par cet apprenant");
        }
        PositioningTest pt = buildPositioningTest(body);
        pt.setTrainee(t);
        t.setPositioningTest(pt);
        repository.save(r);
    }

    // Corrige le QCM côté serveur à partir du catalogue
    private static PositioningTest buildPositioningTest(PositioningTestRequest body) {
        List<PositioningTestCatalog.QcmQuestion> catalog = PositioningTestCatalog.QUESTIONS;
        if (body.answers().size() != catalog.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le test comporte " + catalog.size() + " questions");
        }
        int score = 0;
        StringBuilder answers = new StringBuilder();
        for (int i = 0; i < catalog.size(); i++) {
            Integer chosen = body.answers().get(i);
            if (chosen == null || chosen < 0 || chosen >= catalog.get(i).options().size()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Réponse invalide à la question " + catalog.get(i).id());
            }
            if (chosen == catalog.get(i).correctIndex()) {
                score++;
            }
            if (i > 0) {
                answers.append(',');
            }
            answers.append(chosen);
        }

        PositioningTest pt = new PositioningTest();
        pt.setSelfLevel(body.selfLevel());
        pt.setAnswers(answers.toString());
        pt.setKubernetesPurpose(body.kubernetesPurpose());
        pt.setKnownTerms(body.knownTerms() == null || body.knownTerms().isEmpty()
                ? null
                : String.join(";", body.knownTerms()));
        pt.setExpectations(body.expectations());
        pt.setScore(score);
        pt.setMaxScore(catalog.size());
        return pt;
    }

    // Le questionnaire obligatoire vient d'être renseigné : la demande est
    // transmise à l'admin (INCOMPLETE -> PENDING). Retourne true si la
    // transition a eu lieu (déclenche la notification email).
    private static boolean completeIfRequiredSurveyDone(RegistrationRequest r) {
        if (r.getStatus() == RegistrationStatus.INCOMPLETE && r.requiredSurveyCompleted()) {
            r.setStatus(RegistrationStatus.PENDING);
            return true;
        }
        return false;
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
