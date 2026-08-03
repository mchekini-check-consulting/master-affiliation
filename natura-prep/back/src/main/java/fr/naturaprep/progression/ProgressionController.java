package fr.naturaprep.progression;

import fr.naturaprep.membre.Membre;
import fr.naturaprep.membre.MembreRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Suivi de progression du membre : fiches lues, ateliers lancés, scores de quiz. */
@RestController
@RequestMapping("/progression")
public class ProgressionController {

    private final ProgressionRepository progressions;
    private final MembreRepository membres;

    public ProgressionController(ProgressionRepository progressions, MembreRepository membres) {
        this.progressions = progressions;
        this.membres = membres;
    }

    private Membre membreConnecte(Authentication auth) {
        return membres.findByEmailIgnoreCase(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    @GetMapping
    public List<Map<String, Object>> lister(Authentication auth) {
        Membre membre = membreConnecte(auth);
        return progressions.findByMembreId(membre.getId()).stream()
                .map(p -> Map.<String, Object>of(
                        "type", p.getType(),
                        "cle", p.getCle(),
                        "valeur", p.getValeur()))
                .toList();
    }

    public record EnregistrementRequest(
            @NotBlank @Pattern(regexp = "fiche|atelier|quiz") String type,
            @NotBlank @Size(max = 160) String cle,
            @Min(0) @Max(100) int valeur) {
    }

    /** Enregistre en ne gardant que la meilleure valeur (idempotent). */
    @PostMapping
    @Transactional
    public Map<String, Object> enregistrer(@Valid @RequestBody EnregistrementRequest requete, Authentication auth) {
        Membre membre = membreConnecte(auth);
        Progression p = progressions
                .findByMembreIdAndTypeAndCle(membre.getId(), requete.type(), requete.cle())
                .orElseGet(() -> {
                    Progression neuve = new Progression();
                    neuve.setMembreId(membre.getId());
                    neuve.setType(requete.type());
                    neuve.setCle(requete.cle());
                    neuve.setValeur(requete.valeur());
                    return neuve;
                });
        if (requete.valeur() > p.getValeur()) {
            p.setValeur(requete.valeur());
        }
        p.setMajLe(Instant.now());
        progressions.save(p);
        return Map.of("type", p.getType(), "cle", p.getCle(), "valeur", p.getValeur());
    }
}
