package fr.hitechacademy.crm;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * CRM de l'espace admin : kanban de suivi des prospects (drag & drop entre
 * les colonnes du parcours), fiches contact, notes et historique des
 * conversations. Les déplacements de colonne sont tracés automatiquement
 * dans l'historique.
 */
@RestController
@RequestMapping("/admin/crm")
public class CrmAdminController {

    /** Libellés français des colonnes (pour l'historique automatique). */
    private static final Map<CrmStage, String> STAGE_LABELS = Map.of(
            CrmStage.TO_CONTACT, "À contacter",
            CrmStage.CONTACTED, "Contacté",
            CrmStage.VALIDATED, "Validé",
            CrmStage.REJECTED, "Rejeté",
            CrmStage.FILE_SUBMITTED, "Dossier déposé",
            CrmStage.FILE_VALIDATED, "Dossier validé",
            CrmStage.FILE_REFUSED, "Dossier refusé");

    public record ContactView(UUID id, String firstName, String lastName, String email, String phone,
                              String company, String jobTitle, String formationId, String source,
                              CrmStage stage, int position, LocalDate nextFollowUpAt,
                              Instant createdAt, Instant updatedAt) {
        static ContactView from(CrmContact c) {
            return new ContactView(c.getId(), c.getFirstName(), c.getLastName(), c.getEmail(), c.getPhone(),
                    c.getCompany(), c.getJobTitle(), c.getFormationId(), c.getSource(),
                    c.getStage(), c.getPosition(), c.getNextFollowUpAt(),
                    c.getCreatedAt(), c.getUpdatedAt());
        }
    }

    public record ActivityView(UUID id, UUID contactId, CrmActivityType type, String content,
                               Instant createdAt) {
        static ActivityView from(CrmActivity a) {
            return new ActivityView(a.getId(), a.getContactId(), a.getType(), a.getContent(), a.getCreatedAt());
        }
    }

    public record CreateContactRequest(@NotBlank String firstName, @NotBlank String lastName,
                                       String email, String phone, String company, String jobTitle,
                                       String formationId, String source, CrmStage stage,
                                       LocalDate nextFollowUpAt) {
    }

    /** Tous les champs optionnels : seuls ceux fournis sont modifiés. */
    public record UpdateContactRequest(String firstName, String lastName, String email, String phone,
                                       String company, String jobTitle, String formationId, String source,
                                       CrmStage stage, LocalDate nextFollowUpAt, Boolean clearFollowUp) {
    }

    public record CreateActivityRequest(CrmActivityType type, @NotBlank String content) {
    }

    private final CrmContactRepository contacts;
    private final CrmActivityRepository activities;

    public CrmAdminController(CrmContactRepository contacts, CrmActivityRepository activities) {
        this.contacts = contacts;
        this.activities = activities;
    }

    // --- Contacts (cartes du kanban) ------------------------------------

    @GetMapping("/contacts")
    @Transactional(readOnly = true)
    public List<ContactView> listContacts() {
        return contacts.findAllByOrderByStageAscPositionAsc().stream()
                .map(ContactView::from)
                .toList();
    }

    @PostMapping("/contacts")
    @Transactional
    public ContactView createContact(@Valid @RequestBody CreateContactRequest body) {
        CrmContact contact = new CrmContact();
        contact.setFirstName(body.firstName().trim());
        contact.setLastName(body.lastName().trim());
        contact.setEmail(clean(body.email()));
        contact.setPhone(clean(body.phone()));
        contact.setCompany(clean(body.company()));
        contact.setJobTitle(clean(body.jobTitle()));
        contact.setFormationId(clean(body.formationId()));
        contact.setSource(clean(body.source()));
        contact.setStage(body.stage() != null ? body.stage() : CrmStage.TO_CONTACT);
        contact.setNextFollowUpAt(body.nextFollowUpAt());
        contact.setPosition(contacts.countByStage(contact.getStage()));
        return ContactView.from(contacts.save(contact));
    }

    /**
     * Mise à jour d'une fiche, y compris le déplacement de colonne (drag &
     * drop) : la carte arrive en fin de colonne et le mouvement est tracé
     * dans l'historique.
     */
    @PatchMapping("/contacts/{id}")
    @Transactional
    public ContactView updateContact(@PathVariable UUID id, @RequestBody UpdateContactRequest body) {
        CrmContact contact = findContact(id);

        if (body.firstName() != null && !body.firstName().isBlank()) contact.setFirstName(body.firstName().trim());
        if (body.lastName() != null && !body.lastName().isBlank()) contact.setLastName(body.lastName().trim());
        if (body.email() != null) contact.setEmail(clean(body.email()));
        if (body.phone() != null) contact.setPhone(clean(body.phone()));
        if (body.company() != null) contact.setCompany(clean(body.company()));
        if (body.jobTitle() != null) contact.setJobTitle(clean(body.jobTitle()));
        if (body.formationId() != null) contact.setFormationId(clean(body.formationId()));
        if (body.source() != null) contact.setSource(clean(body.source()));
        if (Boolean.TRUE.equals(body.clearFollowUp())) contact.setNextFollowUpAt(null);
        else if (body.nextFollowUpAt() != null) contact.setNextFollowUpAt(body.nextFollowUpAt());

        if (body.stage() != null && body.stage() != contact.getStage()) {
            CrmStage from = contact.getStage();
            contact.setStage(body.stage());
            contact.setPosition(contacts.countByStage(body.stage()));
            // Trace automatique du déplacement dans l'historique
            CrmActivity trace = new CrmActivity();
            trace.setContactId(contact.getId());
            trace.setType(CrmActivityType.STAGE_CHANGE);
            trace.setContent(STAGE_LABELS.get(from) + " → " + STAGE_LABELS.get(body.stage()));
            activities.save(trace);
        }

        contact.setUpdatedAt(Instant.now());
        return ContactView.from(contacts.save(contact));
    }

    @DeleteMapping("/contacts/{id}")
    @Transactional
    public void deleteContact(@PathVariable UUID id) {
        CrmContact contact = findContact(id);
        activities.deleteByContactId(contact.getId());
        contacts.delete(contact);
    }

    // --- Notes & historique des conversations ---------------------------

    @GetMapping("/contacts/{id}/activities")
    @Transactional(readOnly = true)
    public List<ActivityView> listActivities(@PathVariable UUID id) {
        return activities.findByContactIdOrderByCreatedAtDesc(findContact(id).getId()).stream()
                .map(ActivityView::from)
                .toList();
    }

    @PostMapping("/contacts/{id}/activities")
    @Transactional
    public ActivityView createActivity(@PathVariable UUID id, @Valid @RequestBody CreateActivityRequest body) {
        CrmContact contact = findContact(id);
        CrmActivity activity = new CrmActivity();
        activity.setContactId(contact.getId());
        activity.setType(body.type() != null ? body.type() : CrmActivityType.NOTE);
        activity.setContent(body.content().trim());
        contact.setUpdatedAt(Instant.now());
        contacts.save(contact);
        return ActivityView.from(activities.save(activity));
    }

    @DeleteMapping("/activities/{id}")
    @Transactional
    public void deleteActivity(@PathVariable UUID id) {
        CrmActivity activity = activities.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Entrée introuvable"));
        activities.delete(activity);
    }

    // --- Helpers ---------------------------------------------------------

    private CrmContact findContact(UUID id) {
        return contacts.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contact introuvable"));
    }

    private static String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
