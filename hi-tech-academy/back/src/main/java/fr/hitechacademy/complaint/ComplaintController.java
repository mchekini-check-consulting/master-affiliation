package fr.hitechacademy.complaint;

import fr.hitechacademy.complaint.ComplaintDtos.CreateComplaintRequest;
import fr.hitechacademy.complaint.ComplaintDtos.CreatedResponse;
import fr.hitechacademy.mail.MailService;
import fr.hitechacademy.registration.ApplicantType;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Dépôt public d'une réclamation depuis le site. */
@RestController
@RequestMapping("/complaints")
public class ComplaintController {

    private final ComplaintRepository repository;
    private final MailService mailService;

    public ComplaintController(ComplaintRepository repository, MailService mailService) {
        this.repository = repository;
        this.mailService = mailService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreatedResponse create(@Valid @RequestBody CreateComplaintRequest body) {
        Complaint c = new Complaint();
        c.setFormationId(body.formationId());
        c.setFormationTitle(body.formationTitle());
        c.setComplainantType(body.complainantType());
        c.setCompanyName(body.complainantType() == ApplicantType.INDIVIDUAL ? null : blankToNull(body.companyName()));
        c.setFirstName(body.firstName().trim());
        c.setLastName(body.lastName().trim());
        c.setEmail(body.email().trim());
        c.setMessage(body.message().trim());

        Complaint saved = repository.save(c);

        // Notification à l'organisme + accusé de réception au réclamant
        mailService.notifyAdminNewComplaint(saved.getFormationTitle(),
                saved.getFirstName() + " " + saved.getLastName(), saved.getEmail(), saved.getMessage());
        mailService.acknowledgeComplaint(saved.getEmail(), saved.getFirstName(), saved.getLastName(),
                saved.getFormationTitle());

        return new CreatedResponse(saved.getId(), saved.getStatus());
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
