package fr.hitechacademy.registration;

import fr.hitechacademy.registration.RegistrationDtos.AdminDetail;
import fr.hitechacademy.registration.RegistrationDtos.AdminListItem;
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

    public RegistrationAdminController(RegistrationRepository repository) {
        this.repository = repository;
    }

    // Permet au front de vérifier les identifiants saisis sur l'écran de connexion
    @GetMapping("/me")
    public Map<String, String> me(Principal principal) {
        return Map.of("email", principal.getName());
    }

    @GetMapping("/registrations")
    @Transactional(readOnly = true)
    public List<AdminListItem> list() {
        return repository.findAllByOrderByCreatedAtDesc().stream()
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
        if (body.status() == RegistrationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Une demande ne peut être repassée en attente");
        }
        RegistrationRequest r = find(id);
        r.setStatus(body.status());
        r.setDecidedAt(Instant.now());
        return AdminDetail.from(repository.save(r));
    }

    private RegistrationRequest find(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demande d'inscription introuvable"));
    }
}
