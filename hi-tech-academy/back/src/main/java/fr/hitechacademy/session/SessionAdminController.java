package fr.hitechacademy.session;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.hitechacademy.mail.MailService;
import fr.hitechacademy.registration.ApplicantType;
import fr.hitechacademy.registration.RegistrationRepository;
import fr.hitechacademy.registration.RegistrationRequest;
import fr.hitechacademy.registration.RegistrationStatus;
import fr.hitechacademy.registration.Trainee;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

/**
 * Sessions de formation et questionnaires de satisfaction. Une session
 * regroupe des demandes validées sur une plage de dates ; une fois démarrée,
 * l'admin envoie les trois questionnaires (à chaud apprenant, satisfaction
 * client, à froid apprenant), individuellement ou à tout le monde. Chaque
 * envoi crée une ligne satisfaction_responses dont l'UUID sert de lien public.
 */
@RestController
@RequestMapping("/admin")
public class SessionAdminController {

    public static final Map<String, String> KIND_LABELS = Map.of(
            "HOT_LEARNER", "Satisfaction à chaud de l'apprenant",
            "CLIENT", "Satisfaction du client suite à la formation",
            "COLD_LEARNER", "Satisfaction à froid de l'apprenant");

    private final TrainingSessionRepository sessions;
    private final SatisfactionResponseRepository responses;
    private final DocumentDispatchRepository documents;
    private final RegistrationRepository registrations;
    private final MailService mailService;
    private final ObjectMapper mapper;

    public SessionAdminController(TrainingSessionRepository sessions, SatisfactionResponseRepository responses,
            DocumentDispatchRepository documents, RegistrationRepository registrations,
            MailService mailService, ObjectMapper mapper) {
        this.sessions = sessions;
        this.responses = responses;
        this.documents = documents;
        this.registrations = registrations;
        this.mailService = mailService;
        this.mapper = mapper;
    }

    // --- DTO ------------------------------------------------------------

    public record CreateSessionRequest(
            @NotBlank String formationId, @NotBlank String formationTitle,
            @NotNull LocalDate startDate, @NotNull LocalDate endDate) {}

    public record AttachRequest(@NotNull UUID registrationId) {}

    public record SendRequest(@NotBlank String kind, @NotNull UUID registrationId, UUID traineeId) {}

    public record SendAllRequest(@NotBlank String kind) {}

    public record RegistrationSummary(UUID id, String label, String applicantType) {}

    public record SessionView(UUID id, String formationId, String formationTitle,
            LocalDate startDate, LocalDate endDate, String status,
            List<RegistrationSummary> registrations, Instant createdAt) {}

    /** Un destinataire d'un questionnaire donné, avec l'état de son invitation. */
    public record RecipientView(String kind, UUID registrationId, UUID traineeId,
            String name, String email, String registrationLabel,
            UUID responseId, Instant invitedAt, Instant submittedAt) {}

    public record ResponseView(UUID id, String kind, String recipientName, String recipientEmail,
            String registrationLabel, String formationTitle,
            Instant invitedAt, Instant submittedAt, Map<String, Object> answers) {}

    // --- Sessions -------------------------------------------------------

    @GetMapping("/sessions")
    @Transactional(readOnly = true)
    public List<SessionView> list() {
        return sessions.findAllByOrderByStartDateDesc().stream().map(this::view).toList();
    }

    @PostMapping("/sessions")
    @Transactional
    public SessionView create(@Valid @RequestBody CreateSessionRequest body) {
        if (body.endDate().isBefore(body.startDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La fin de session doit suivre le début");
        }
        TrainingSession s = new TrainingSession();
        s.setFormationId(body.formationId());
        s.setFormationTitle(body.formationTitle());
        s.setStartDate(body.startDate());
        s.setEndDate(body.endDate());
        return view(sessions.save(s));
    }

    @DeleteMapping("/sessions/{id}")
    @Transactional
    public void delete(@PathVariable UUID id) {
        TrainingSession s = find(id);
        attachedTo(s).forEach(r -> r.setSession(null));
        responses.findBySessionId(id).forEach(resp -> resp.setSession(null));
        sessions.delete(s);
    }

    @PostMapping("/sessions/{id}/attach")
    @Transactional
    public SessionView attach(@PathVariable UUID id, @Valid @RequestBody AttachRequest body) {
        TrainingSession s = find(id);
        RegistrationRequest r = registrations.findById(body.registrationId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demande introuvable"));
        if (r.getStatus() != RegistrationStatus.VALIDATED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seule une demande validée se rattache à une session");
        }
        r.setSession(s);
        return view(s);
    }

    @PostMapping("/sessions/{id}/detach")
    @Transactional
    public SessionView detach(@PathVariable UUID id, @Valid @RequestBody AttachRequest body) {
        TrainingSession s = find(id);
        registrations.findById(body.registrationId()).ifPresent(r -> {
            if (s.equals(r.getSession())) r.setSession(null);
        });
        return view(s);
    }

    @PostMapping("/sessions/{id}/start")
    @Transactional
    public SessionView start(@PathVariable UUID id) {
        TrainingSession s = find(id);
        if (attachedTo(s).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Aucune demande rattachée : rien à démarrer");
        }
        s.setStatus("STARTED");
        return view(s);
    }

    // --- Destinataires et envois ----------------------------------------

    @GetMapping("/sessions/{id}/recipients")
    @Transactional(readOnly = true)
    public List<RecipientView> recipients(@PathVariable UUID id) {
        TrainingSession s = find(id);
        List<SatisfactionResponse> sent = new ArrayList<>();
        attachedTo(s).forEach(r -> sent.addAll(responses.findByRegistrationId(r.getId())));

        List<RecipientView> out = new ArrayList<>();
        for (RegistrationRequest r : attachedTo(s)) {
            for (String kind : List.of("HOT_LEARNER", "COLD_LEARNER")) {
                for (Recipient p : learnersOf(r)) out.add(toView(kind, r, p, sent));
            }
            if (r.getApplicantType() == ApplicantType.COMPANY) {
                out.add(toView("CLIENT", r, clientOf(r), sent));
            }
        }
        return out;
    }

    @PostMapping("/sessions/{id}/send")
    @Transactional
    public RecipientView sendOne(@PathVariable UUID id, @Valid @RequestBody SendRequest body) {
        TrainingSession s = find(id);
        requireStarted(s);
        RegistrationRequest r = registrations.findById(body.registrationId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demande introuvable"));
        Recipient p = resolveRecipient(r, body.kind(), body.traineeId());
        SatisfactionResponse resp = sendInvitation(s, r, body.kind(), p);
        return new RecipientView(body.kind(), r.getId(), p.traineeId(), p.name(), p.email(), label(r),
                resp.getId(), resp.getInvitedAt(), resp.getSubmittedAt());
    }

    @PostMapping("/sessions/{id}/send-all")
    @Transactional
    public List<RecipientView> sendAll(@PathVariable UUID id, @Valid @RequestBody SendAllRequest body) {
        TrainingSession s = find(id);
        requireStarted(s);
        for (RegistrationRequest r : attachedTo(s)) {
            if ("CLIENT".equals(body.kind())) {
                if (r.getApplicantType() == ApplicantType.COMPANY) sendInvitation(s, r, body.kind(), clientOf(r));
            } else {
                for (Recipient p : learnersOf(r)) sendInvitation(s, r, body.kind(), p);
            }
        }
        return recipients(id);
    }

    /** Réponse complète d'un questionnaire (visualisation admin). */
    @GetMapping("/satisfaction/{responseId}")
    @Transactional(readOnly = true)
    public ResponseView response(@PathVariable UUID responseId) {
        SatisfactionResponse resp = responses.findById(responseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Réponse introuvable"));
        return new ResponseView(resp.getId(), resp.getKind(), resp.getRecipientName(), resp.getRecipientEmail(),
                label(resp.getRegistration()), resp.getRegistration().getFormationTitle(),
                resp.getInvitedAt(), resp.getSubmittedAt(), parseAnswers(resp.getAnswers()));
    }

    /** Session et invitations satisfaction d'une demande (détail RequestsView). */
    @GetMapping("/registrations/{id}/session-info")
    @Transactional(readOnly = true)
    public Map<String, Object> sessionInfo(@PathVariable UUID id) {
        RegistrationRequest r = registrations.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demande introuvable"));
        TrainingSession s = r.getSession();
        List<SatisfactionResponse> sent = responses.findByRegistrationId(id);
        List<RecipientView> recips = new ArrayList<>();
        for (String kind : List.of("HOT_LEARNER", "COLD_LEARNER")) {
            for (Recipient p : learnersOf(r)) recips.add(toView(kind, r, p, sent));
        }
        if (r.getApplicantType() == ApplicantType.COMPANY) recips.add(toView("CLIENT", r, clientOf(r), sent));
        Map<String, Object> out = new java.util.HashMap<>();
        out.put("session", s == null ? null : view(s));
        out.put("recipients", recips);
        return out;
    }

    // --- Documents de session --------------------------------------------

    public record SendDocumentRequest(@NotBlank String docKey, @NotBlank String docLabel,
            @NotBlank String docUrl, UUID registrationId, UUID traineeId) {}

    public record DocumentDispatchView(String docKey, UUID registrationId, UUID traineeId, Instant sentAt) {}

    /** Traces d'envoi des documents pour les demandes de la session. */
    @GetMapping("/sessions/{id}/document-dispatches")
    @Transactional(readOnly = true)
    public List<DocumentDispatchView> documentDispatches(@PathVariable UUID id) {
        TrainingSession s = find(id);
        List<DocumentDispatchView> out = new ArrayList<>();
        for (RegistrationRequest r : attachedTo(s)) {
            for (DocumentDispatch d : documents.findByRegistrationId(r.getId())) {
                out.add(new DocumentDispatchView(d.getDocKey(), r.getId(),
                        d.getTrainee() == null ? null : d.getTrainee().getId(), d.getSentAt()));
            }
        }
        return out;
    }

    /** Envoi d'un document à un apprenant, ou à tous ceux de la session si registrationId est nul. */
    @PostMapping("/sessions/{id}/send-document")
    @Transactional
    public List<DocumentDispatchView> sendDocument(@PathVariable UUID id, @Valid @RequestBody SendDocumentRequest body) {
        TrainingSession s = find(id);
        requireStarted(s);
        if (body.registrationId() != null) {
            RegistrationRequest r = registrations.findById(body.registrationId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demande introuvable"));
            Recipient p = resolveRecipient(r, "HOT_LEARNER", body.traineeId());
            dispatchDocument(s, r, p, body);
        } else {
            for (RegistrationRequest r : attachedTo(s)) {
                for (Recipient p : learnersOf(r)) dispatchDocument(s, r, p, body);
            }
        }
        return documentDispatches(id);
    }

    private void dispatchDocument(TrainingSession s, RegistrationRequest r, Recipient p, SendDocumentRequest body) {
        DocumentDispatch d = documents.findByRegistrationId(r.getId()).stream()
                .filter(x -> x.getDocKey().equals(body.docKey())
                        && Objects.equals(x.getTrainee() == null ? null : x.getTrainee().getId(), p.traineeId()))
                .findFirst()
                .orElseGet(() -> {
                    DocumentDispatch x = new DocumentDispatch();
                    x.setDocKey(body.docKey());
                    x.setRegistration(r);
                    if (p.traineeId() != null) {
                        x.setTrainee(r.getTrainees().stream().filter(t -> t.getId().equals(p.traineeId())).findFirst().orElse(null));
                    }
                    return x;
                });
        d.setSession(s);
        d.setRecipientEmail(p.email());
        d.setRecipientName(p.name());
        d.setSentAt(Instant.now());
        documents.save(d);
        mailService.sendSessionDocument(p.email(), p.name(), body.docLabel(), r.getFormationTitle(), body.docUrl());
    }

    // --- Plomberie -------------------------------------------------------

    private record Recipient(UUID traineeId, String name, String email) {}

    private TrainingSession find(UUID id) {
        return sessions.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session introuvable"));
    }

    private void requireStarted(TrainingSession s) {
        if (!"STARTED".equals(s.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Démarrez la session avant d'envoyer les questionnaires");
        }
    }

    private List<RegistrationRequest> attachedTo(TrainingSession s) {
        return registrations.findAllByOrderByCreatedAtDesc().stream()
                .filter(r -> s.equals(r.getSession())).toList();
    }

    /** Apprenants d'une demande : les salariés déclarés (entreprise), sinon le demandeur. */
    private List<Recipient> learnersOf(RegistrationRequest r) {
        if (r.getApplicantType() == ApplicantType.COMPANY) {
            return r.getTrainees().stream()
                    .map(t -> new Recipient(t.getId(), (t.getFirstName() + " " + t.getLastName()).trim(), t.getEmail()))
                    .filter(p -> p.email() != null && !p.email().isBlank())
                    .toList();
        }
        return List.of(new Recipient(null, (r.getFirstName() + " " + r.getLastName()).trim(), r.getEmail()));
    }

    private Recipient clientOf(RegistrationRequest r) {
        String email = r.getBillingEmail() != null && !r.getBillingEmail().isBlank() ? r.getBillingEmail() : r.getEmail();
        String name = r.getCompanyName() != null && !r.getCompanyName().isBlank()
                ? r.getCompanyName() : (r.getFirstName() + " " + r.getLastName()).trim();
        return new Recipient(null, name, email);
    }

    private Recipient resolveRecipient(RegistrationRequest r, String kind, UUID traineeId) {
        if (!KIND_LABELS.containsKey(kind)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Questionnaire inconnu : " + kind);
        }
        if ("CLIENT".equals(kind)) return clientOf(r);
        if (traineeId == null) return learnersOf(r).stream().filter(p -> p.traineeId() == null).findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Précisez l'apprenant destinataire"));
        return learnersOf(r).stream().filter(p -> traineeId.equals(p.traineeId())).findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Apprenant introuvable sur cette demande"));
    }

    /** Crée (ou renvoie) l'invitation : une seule ligne par (kind, demande, apprenant). */
    private SatisfactionResponse sendInvitation(TrainingSession s, RegistrationRequest r, String kind, Recipient p) {
        SatisfactionResponse resp = responses.findByRegistrationId(r.getId()).stream()
                .filter(x -> x.getKind().equals(kind)
                        && Objects.equals(x.getTrainee() == null ? null : x.getTrainee().getId(), p.traineeId()))
                .findFirst()
                .orElseGet(() -> {
                    SatisfactionResponse x = new SatisfactionResponse();
                    x.setKind(kind);
                    x.setRegistration(r);
                    if (p.traineeId() != null) {
                        x.setTrainee(r.getTrainees().stream().filter(t -> t.getId().equals(p.traineeId())).findFirst().orElse(null));
                    }
                    return x;
                });
        if (resp.getSubmittedAt() != null) return resp; // déjà répondu : pas de renvoi
        resp.setSession(s);
        resp.setRecipientEmail(p.email());
        resp.setRecipientName(p.name());
        resp.setInvitedAt(Instant.now());
        SatisfactionResponse saved = responses.save(resp);
        mailService.sendSatisfactionInvitation(p.email(), p.name(), KIND_LABELS.get(kind),
                r.getFormationTitle(), "/satisfaction/" + saved.getId());
        return saved;
    }

    private RecipientView toView(String kind, RegistrationRequest r, Recipient p, List<SatisfactionResponse> sent) {
        SatisfactionResponse resp = sent.stream()
                .filter(x -> x.getKind().equals(kind) && x.getRegistration().getId().equals(r.getId())
                        && Objects.equals(x.getTrainee() == null ? null : x.getTrainee().getId(), p.traineeId()))
                .findFirst().orElse(null);
        return new RecipientView(kind, r.getId(), p.traineeId(), p.name(), p.email(), label(r),
                resp == null ? null : resp.getId(),
                resp == null ? null : resp.getInvitedAt(),
                resp == null ? null : resp.getSubmittedAt());
    }

    private String label(RegistrationRequest r) {
        String person = (r.getFirstName() + " " + r.getLastName()).trim();
        return r.getCompanyName() != null && !r.getCompanyName().isBlank()
                ? r.getCompanyName() + " — " + person : person;
    }

    private Map<String, Object> parseAnswers(String json) {
        if (json == null || json.isBlank()) return Map.of();
        try {
            return mapper.readValue(json, mapper.getTypeFactory().constructMapType(Map.class, String.class, Object.class));
        } catch (com.fasterxml.jackson.core.JacksonException e) {
            return Map.of();
        }
    }

    private SessionView view(TrainingSession s) {
        List<RegistrationSummary> regs = attachedTo(s).stream()
                .map(r -> new RegistrationSummary(r.getId(), label(r), r.getApplicantType().name()))
                .toList();
        return new SessionView(s.getId(), s.getFormationId(), s.getFormationTitle(),
                s.getStartDate(), s.getEndDate(), s.getStatus(), regs, s.getCreatedAt());
    }
}
