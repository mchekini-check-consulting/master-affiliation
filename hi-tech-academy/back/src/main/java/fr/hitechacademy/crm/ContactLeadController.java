package fr.hitechacademy.crm;

import fr.hitechacademy.mail.MailService;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Page Contact du site : message libre ou demande de rendez-vous.
 *
 * Même principe que {@link BookLeadController} : la demande atterrit dans le
 * CRM, colonne « À contacter » (ou complète le contact s'il existe déjà, par
 * email ou téléphone), avec une entrée d'historique qui en garde le contenu.
 * L'organisme est notifié par email et le demandeur reçoit un accusé de
 * réception.
 *
 * Le rendez-vous est une DEMANDE : la personne choisit un jour ouvré et un
 * créneau souhaités, l'équipe confirme par email. Rien n'est réservé
 * automatiquement, il n'y a donc pas d'agenda à tenir en base.
 */
@RestController
@RequestMapping("/leads")
public class ContactLeadController {

    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    private static final Pattern PHONE = Pattern.compile("^\\+?[0-9 .()-]{6,20}$");
    private static final ZoneId PARIS = ZoneId.of("Europe/Paris");
    private static final DateTimeFormatter JOUR =
            DateTimeFormatter.ofPattern("EEEE d MMMM yyyy", Locale.FRENCH);

    /** Créneaux proposés par la page Contact : à garder alignés avec Contact.jsx. */
    private static final Set<String> SLOTS = Set.of(
            "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00");
    private static final Set<String> FORMATS = Set.of("PHONE", "VISIO");
    private static final Set<String> PROFILES = Set.of("COMPANY", "INDEPENDENT", "INDIVIDUAL");
    private static final int MESSAGE_MAX = 3000;

    public record ContactRequest(
            String kind,             // MESSAGE | APPOINTMENT
            String applicantType,    // COMPANY | INDEPENDENT | INDIVIDUAL
            String company,
            String firstName,
            String lastName,
            String email,
            String phone,
            String subject,
            String formationId,
            String formationTitle,
            String message,
            String appointmentFormat, // PHONE | VISIO
            String appointmentDate,   // yyyy-MM-dd
            String appointmentSlot    // HH:mm
    ) {
    }

    public record ContactResponse(boolean ok) {
    }

    private final CrmContactRepository contacts;
    private final CrmActivityRepository activities;
    private final MailService mailService;

    public ContactLeadController(CrmContactRepository contacts, CrmActivityRepository activities,
                                 MailService mailService) {
        this.contacts = contacts;
        this.activities = activities;
        this.mailService = mailService;
    }

    @PostMapping("/contact")
    @Transactional
    public ContactResponse submit(@RequestBody ContactRequest body) {
        boolean appointment = "APPOINTMENT".equals(body.kind());
        String firstName = clean(body.firstName());
        String lastName = clean(body.lastName());
        String email = clean(body.email());
        String phone = clean(body.phone());
        String company = clean(body.company());
        String subject = clean(body.subject());
        String message = clean(body.message());
        String profile = PROFILES.contains(body.applicantType()) ? body.applicantType() : "INDIVIDUAL";

        if (firstName == null || lastName == null) {
            throw bad("Renseignez votre prénom et votre nom.");
        }
        if (email == null || !EMAIL.matcher(email).matches()) {
            throw bad("Adresse email invalide.");
        }
        if (phone != null && !PHONE.matcher(phone).matches()) {
            throw bad("Numéro de téléphone invalide.");
        }
        if (message != null && message.length() > MESSAGE_MAX) {
            throw bad("Votre message dépasse " + MESSAGE_MAX + " caractères.");
        }

        String format = null;
        LocalDate date = null;
        String slot = null;
        if (appointment) {
            format = body.appointmentFormat();
            slot = body.appointmentSlot();
            if (!FORMATS.contains(format)) throw bad("Choisissez un rendez-vous téléphonique ou en visio.");
            if (!SLOTS.contains(slot)) throw bad("Choisissez un créneau.");
            if ("PHONE".equals(format) && phone == null) {
                throw bad("Indiquez le numéro auquel vous rappeler.");
            }
            try {
                date = LocalDate.parse(body.appointmentDate());
            } catch (DateTimeParseException | NullPointerException e) {
                throw bad("Choisissez un jour.");
            }
            LocalDate today = LocalDate.now(PARIS);
            if (!date.isAfter(today) || date.isAfter(today.plusDays(45))
                    || date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
                throw bad("Choisissez un jour ouvré dans les prochaines semaines.");
            }
        } else if (message == null) {
            throw bad("Écrivez votre message.");
        }

        String source = appointment ? "Prise de rendez-vous (site)" : "Formulaire de contact (site)";

        // Déduplication : contact déjà connu par email ou téléphone → on complète
        Optional<CrmContact> existing = contacts.findFirstByEmailIgnoreCase(email)
                .or(() -> phone != null ? contacts.findFirstByPhone(phone) : Optional.empty());

        CrmContact contact = existing.orElseGet(() -> {
            CrmContact created = new CrmContact();
            created.setFirstName(firstName);
            created.setLastName(lastName);
            created.setEmail(email);
            created.setPhone(phone);
            created.setSource(source);
            created.setStage(CrmStage.TO_CONTACT);
            created.setPosition(contacts.countByStage(CrmStage.TO_CONTACT));
            return contacts.save(created);
        });
        if (existing.isPresent()) {
            if (contact.getEmail() == null) contact.setEmail(email);
            if (contact.getPhone() == null && phone != null) contact.setPhone(phone);
            if ("Prospect".equalsIgnoreCase(contact.getFirstName())) {
                contact.setFirstName(firstName);
                contact.setLastName(lastName);
            }
        }
        if (company != null && contact.getCompany() == null) contact.setCompany(truncate(company, 200));
        if (clean(body.formationId()) != null) contact.setFormationId(truncate(body.formationId().trim(), 100));
        // Rendez-vous : la relance du CRM tombe le jour demandé
        if (date != null) contact.setNextFollowUpAt(date);
        contact.setUpdatedAt(Instant.now());
        contacts.save(contact);

        String formationTitle = clean(body.formationTitle());
        String when = date != null ? JOUR.format(date) + " à " + slot.replace(":", " h ") : null;
        String formatLabel = "PHONE".equals(format) ? "téléphone" : "visio";

        StringBuilder note = new StringBuilder();
        if (appointment) {
            note.append("Demande de rendez-vous (").append(formatLabel).append(") : ").append(when).append(".");
        } else {
            note.append("Message depuis la page Contact.");
        }
        note.append("\nProfil : ").append(profileLabel(profile));
        if (company != null) note.append(" — ").append(company);
        if (subject != null) note.append("\nSujet : ").append(subject);
        if (formationTitle != null) note.append("\nFormation : ").append(formationTitle);
        if (message != null) note.append("\n\n").append(message);

        CrmActivity activity = new CrmActivity();
        activity.setContactId(contact.getId());
        activity.setType(appointment ? CrmActivityType.MEETING : CrmActivityType.NOTE);
        activity.setContent(truncate(note.toString(), 4000));
        activities.save(activity);

        String fullName = firstName + " " + lastName;
        mailService.notifyAdminContact(appointment, fullName, email, phone, note.toString());
        mailService.acknowledgeContact(email, firstName, appointment ? formatLabel : null, when);

        return new ContactResponse(true);
    }

    private static String profileLabel(String profile) {
        return switch (profile) {
            case "COMPANY" -> "Entreprise";
            case "INDEPENDENT" -> "Indépendant";
            default -> "Particulier";
        };
    }

    private static ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private static String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static String truncate(String value, int max) {
        return value.length() <= max ? value : value.substring(0, max);
    }
}
