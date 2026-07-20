package fr.hitechacademy.complaint;

import fr.hitechacademy.complaint.ComplaintDtos.AdminDetail;
import fr.hitechacademy.complaint.ComplaintDtos.AdminListItem;
import fr.hitechacademy.complaint.ComplaintDtos.UpdateComplaintRequest;
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

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Gestion des réclamations dans l'espace admin (basic auth). */
@RestController
@RequestMapping("/admin/complaints")
public class ComplaintAdminController {

    private final ComplaintRepository repository;

    public ComplaintAdminController(ComplaintRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<AdminListItem> list() {
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .map(AdminListItem::from)
                .toList();
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public AdminDetail detail(@PathVariable UUID id) {
        return AdminDetail.from(find(id));
    }

    @PostMapping("/{id}")
    @Transactional
    public AdminDetail update(@PathVariable UUID id, @Valid @RequestBody UpdateComplaintRequest body) {
        Complaint c = find(id);
        c.setStatus(body.status());
        c.setResponse(body.response());
        // Date de traitement au premier passage hors « reçue »
        if (body.status() != ComplaintStatus.RECEIVED && c.getHandledAt() == null) {
            c.setHandledAt(Instant.now());
        }
        return AdminDetail.from(repository.save(c));
    }

    private Complaint find(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Réclamation introuvable"));
    }
}
