package fr.hitechacademy.veille;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
import java.util.UUID;

/**
 * Kanban de veille de l'espace admin : une colonne par axe du plan de
 * veille, cartes créables et déplaçables par glisser-déposer.
 */
@RestController
@RequestMapping("/admin/veille")
public class VeilleAdminController {

    public record VeilleItemView(UUID id, VeilleAxis axis, LocalDate entryDate, String content,
                                 int position, Instant createdAt) {
        static VeilleItemView from(VeilleItem i) {
            return new VeilleItemView(i.getId(), i.getAxis(), i.getEntryDate(), i.getContent(),
                    i.getPosition(), i.getCreatedAt());
        }
    }

    public record CreateRequest(@NotNull VeilleAxis axis, LocalDate entryDate, @NotBlank String content) {
    }

    public record MoveRequest(@NotNull VeilleAxis axis) {
    }

    private final VeilleRepository repository;

    public VeilleAdminController(VeilleRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<VeilleItemView> list() {
        return repository.findAllByOrderByAxisAscPositionAsc().stream()
                .map(VeilleItemView::from)
                .toList();
    }

    @PostMapping
    @Transactional
    public VeilleItemView create(@Valid @RequestBody CreateRequest body) {
        VeilleItem item = new VeilleItem();
        item.setAxis(body.axis());
        item.setEntryDate(body.entryDate() != null ? body.entryDate() : LocalDate.now());
        item.setContent(body.content().trim());
        item.setPosition(repository.countByAxis(body.axis()));
        return VeilleItemView.from(repository.save(item));
    }

    /** Déplace une carte vers un axe (en fin de colonne). */
    @PatchMapping("/{id}")
    @Transactional
    public VeilleItemView move(@PathVariable UUID id, @Valid @RequestBody MoveRequest body) {
        VeilleItem item = find(id);
        if (item.getAxis() != body.axis()) {
            item.setAxis(body.axis());
            item.setPosition(repository.countByAxis(body.axis()));
        }
        return VeilleItemView.from(repository.save(item));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void delete(@PathVariable UUID id) {
        repository.delete(find(id));
    }

    private VeilleItem find(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Carte de veille introuvable"));
    }
}
