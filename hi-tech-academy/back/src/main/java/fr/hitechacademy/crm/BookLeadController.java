package fr.hitechacademy.crm;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Optional;
import java.util.regex.Pattern;

/**
 * Capture publique du lead « livre IA offert » affiché en fin d'article de
 * blog : email et/ou téléphone requis. Le lead atterrit directement dans le
 * CRM, colonne « À contacter », avec une trace de l'article d'origine —
 * s'il existe déjà (même email ou téléphone), seule une note est ajoutée.
 */
@RestController
@RequestMapping("/leads")
public class BookLeadController {

    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    private static final Pattern PHONE = Pattern.compile("^\\+?[0-9 .()-]{6,20}$");
    private static final String SOURCE = "Livre IA (blog)";

    public record BookLeadRequest(String firstName, String lastName, String email, String phone,
                                  String articleSlug) {
    }

    public record BookLeadResponse(boolean ok) {
    }

    private final CrmContactRepository contacts;
    private final CrmActivityRepository activities;
    private final fr.hitechacademy.mail.MailService mailService;

    public BookLeadController(CrmContactRepository contacts, CrmActivityRepository activities,
                              fr.hitechacademy.mail.MailService mailService) {
        this.contacts = contacts;
        this.activities = activities;
        this.mailService = mailService;
    }

    @PostMapping("/book")
    @Transactional
    public BookLeadResponse submit(@RequestBody BookLeadRequest body) {
        String firstName = clean(body.firstName());
        String lastName = clean(body.lastName());
        String email = clean(body.email());
        String phone = clean(body.phone());
        if (firstName == null || lastName == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Renseignez votre prénom et votre nom.");
        }
        if (email == null && phone == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Renseignez au moins un email ou un numéro de téléphone.");
        }
        if (email != null && !EMAIL.matcher(email).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Adresse email invalide.");
        }
        if (phone != null && !PHONE.matcher(phone).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Numéro de téléphone invalide.");
        }

        String origin = body.articleSlug() != null && !body.articleSlug().isBlank()
                ? "l'article « " + body.articleSlug().trim() + " »" : "le blog";

        // Déduplication : contact déjà connu par email ou téléphone → note
        Optional<CrmContact> existing = Optional.<CrmContact>empty()
                .or(() -> email != null ? contacts.findFirstByEmailIgnoreCase(email) : Optional.empty())
                .or(() -> phone != null ? contacts.findFirstByPhone(phone) : Optional.empty());

        CrmContact contact = existing.orElseGet(() -> {
            CrmContact created = new CrmContact();
            created.setFirstName(firstName);
            created.setLastName(lastName);
            created.setEmail(email);
            created.setPhone(phone);
            created.setSource(SOURCE);
            created.setStage(CrmStage.TO_CONTACT);
            created.setPosition(contacts.countByStage(CrmStage.TO_CONTACT));
            return contacts.save(created);
        });

        // Contact déjà connu : compléter les coordonnées manquantes, et
        // remplacer les anciens noms génériques (« Prospect ») par les vrais
        if (existing.isPresent()) {
            if (contact.getEmail() == null && email != null) contact.setEmail(email);
            if (contact.getPhone() == null && phone != null) contact.setPhone(phone);
            if ("Prospect".equalsIgnoreCase(contact.getFirstName())) {
                contact.setFirstName(firstName);
                contact.setLastName(lastName);
            }
        }
        contact.setUpdatedAt(Instant.now());
        contacts.save(contact);

        CrmActivity activity = new CrmActivity();
        activity.setContactId(contact.getId());
        activity.setType(CrmActivityType.NOTE);
        activity.setContent("A demandé le livre IA offert via " + origin + ".");
        activities.save(activity);

        // Livraison du livre par email (lien de téléchargement)
        if (email != null) {
            mailService.sendBookOffer(email);
        }

        return new BookLeadResponse(true);
    }

    private static String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
