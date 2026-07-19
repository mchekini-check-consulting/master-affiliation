package fr.hitechacademy.registration;

import fr.hitechacademy.mail.MailService;
import fr.hitechacademy.registration.RegistrationDtos.AdminDetail;
import fr.hitechacademy.registration.RegistrationDtos.AdminListItem;
import fr.hitechacademy.registration.RegistrationDtos.CertificateView;
import fr.hitechacademy.registration.RegistrationDtos.IssueCertificateRequest;
import fr.hitechacademy.registration.RegistrationDtos.StatusUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Espace admin (protégé par basic auth) : liste des demandes d'inscription,
 * détail d'un apprenant (avec questionnaire d'analyse du besoin) et
 * validation / refus des demandes.
 */
@RestController
@RequestMapping("/admin")
public class RegistrationAdminController {

    private final RegistrationRepository repository;
    private final CertificateRepository certificateRepository;
    private final MailService mailService;

    public RegistrationAdminController(RegistrationRepository repository, CertificateRepository certificateRepository,
                                       MailService mailService) {
        this.repository = repository;
        this.certificateRepository = certificateRepository;
        this.mailService = mailService;
    }

    // Permet au front de vérifier les identifiants saisis sur l'écran de connexion
    @GetMapping("/me")
    public Map<String, String> me(Principal principal) {
        return Map.of("email", principal.getName());
    }

    @GetMapping("/registrations")
    @Transactional(readOnly = true)
    public List<AdminListItem> list() {
        // Les demandes INCOMPLETE (questionnaire obligatoire non renseigné)
        // ne sont pas encore transmises à l'admin.
        return repository.findAllByStatusNotOrderByCreatedAtDesc(RegistrationStatus.INCOMPLETE).stream()
                .map(AdminListItem::from)
                .toList();
    }

    @GetMapping("/registrations/{id}")
    @Transactional(readOnly = true)
    public AdminDetail detail(@PathVariable UUID id) {
        return AdminDetail.from(find(id));
    }

    @PostMapping("/registrations/{id}/status")
    @Transactional
    public AdminDetail updateStatus(@PathVariable UUID id, @Valid @RequestBody StatusUpdateRequest body) {
        if (body.status() != RegistrationStatus.VALIDATED && body.status() != RegistrationStatus.REFUSED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Statut cible invalide : VALIDATED ou REFUSED attendu");
        }
        RegistrationRequest r = find(id);
        if (r.getStatus() == RegistrationStatus.INCOMPLETE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La demande ne peut être traitée : le questionnaire obligatoire n'a pas été renseigné");
        }
        r.setStatus(body.status());
        r.setDecidedAt(Instant.now());
        RegistrationRequest saved = repository.save(r);
        mailService.notifyApplicantDecision(saved);
        return AdminDetail.from(saved);
    }

    // --- Évaluation finale : envoi du QCM à un apprenant choisi -------

    @PostMapping("/registrations/{id}/final-evaluation/send")
    @Transactional
    public AdminDetail sendFinalEvaluation(@PathVariable UUID id) {
        RegistrationRequest r = find(id);
        if (r.getApplicantType() == ApplicantType.COMPANY) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Pour une entreprise, l'évaluation s'envoie à chaque salarié");
        }
        requireValidated(r);
        FinalEvaluation fe = r.getFinalEvaluation();
        if (fe != null && fe.isSubmitted()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "L'évaluation a déjà été passée");
        }
        if (fe == null) {
            fe = new FinalEvaluation();
            fe.setRegistration(r);
            r.setFinalEvaluation(fe);
        } else {
            fe.setInvitedAt(Instant.now()); // renvoi de l'invitation
        }
        RegistrationRequest saved = repository.save(r);
        mailService.sendFinalEvaluationInvitation(
                r.getEmail(), r.getFirstName(), r.getLastName(), r.getFormationTitle(),
                "/inscription/demande/" + r.getId() + "/evaluation-finale");
        return AdminDetail.from(saved);
    }

    @PostMapping("/registrations/{id}/trainees/{traineeId}/final-evaluation/send")
    @Transactional
    public AdminDetail sendTraineeFinalEvaluation(@PathVariable UUID id, @PathVariable UUID traineeId) {
        RegistrationRequest r = find(id);
        requireValidated(r);
        Trainee t = r.getTrainees().stream()
                .filter(x -> x.getId().equals(traineeId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Apprenant introuvable"));
        FinalEvaluation fe = t.getFinalEvaluation();
        if (fe != null && fe.isSubmitted()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "L'évaluation a déjà été passée par cet apprenant");
        }
        if (fe == null) {
            fe = new FinalEvaluation();
            fe.setTrainee(t);
            t.setFinalEvaluation(fe);
        } else {
            fe.setInvitedAt(Instant.now());
        }
        RegistrationRequest saved = repository.save(r);
        mailService.sendFinalEvaluationInvitation(
                t.getEmail(), t.getFirstName(), t.getLastName(), r.getFormationTitle(),
                "/inscription/demande/" + r.getId() + "/evaluation-finale?trainee=" + t.getId());
        return AdminDetail.from(saved);
    }

    private static void requireValidated(RegistrationRequest r) {
        if (r.getStatus() != RegistrationStatus.VALIDATED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "L'évaluation finale ne peut être envoyée que pour une demande validée");
        }
    }

    // --- Certificats de réalisation ---------------------------------

    @GetMapping("/certificates")
    @Transactional(readOnly = true)
    public List<CertificateView> listCertificates() {
        return certificateRepository.findAllByOrderByIssuedAtDesc().stream()
                .map(CertificateView::from)
                .toList();
    }

    @PostMapping("/registrations/{id}/certificate")
    @Transactional
    public CertificateView issueCertificate(@PathVariable UUID id, @Valid @RequestBody IssueCertificateRequest body) {
        RegistrationRequest r = find(id);
        if (r.getStatus() != RegistrationStatus.VALIDATED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le certificat ne peut être émis que pour une demande validée");
        }
        if (r.getCertificate() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Un certificat a déjà été émis pour cette demande");
        }
        if (body.sessionEndDate().isBefore(body.sessionStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La date de fin de session doit être postérieure ou égale à la date de début");
        }
        if (body.durationHours() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La durée doit être positive");
        }

        Certificate c = new Certificate();
        c.setRegistration(r);
        c.setSessionStartDate(body.sessionStartDate());
        c.setSessionEndDate(body.sessionEndDate());
        c.setDurationHours(body.durationHours());
        r.setCertificate(c);
        repository.save(r);
        return CertificateView.from(r.getCertificate());
    }

    private RegistrationRequest find(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demande d'inscription introuvable"));
    }
}
