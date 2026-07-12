package fr.myway.contact;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/contact-messages")
public class ContactMessageController {

    private final ContactMessageRepository messages;

    public ContactMessageController(ContactMessageRepository messages) {
        this.messages = messages;
    }

    public record ContactRequest(
            @NotBlank String firstName,
            @NotBlank String lastName,
            @NotBlank @Email String email,
            String phone,
            @NotBlank String subject,
            @NotBlank String message) {}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Long> create(@Valid @RequestBody ContactRequest request) {
        ContactMessage msg = new ContactMessage();
        msg.setFirstName(request.firstName().trim());
        msg.setLastName(request.lastName().trim());
        msg.setEmail(request.email().trim());
        msg.setPhone(request.phone());
        msg.setSubject(request.subject());
        msg.setMessage(request.message());
        messages.save(msg);
        return Map.of("id", msg.getId());
    }
}
