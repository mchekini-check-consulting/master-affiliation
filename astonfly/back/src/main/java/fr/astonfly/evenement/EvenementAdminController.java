package fr.astonfly.evenement;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;
import fr.astonfly.commun.Langues;
import fr.astonfly.commun.Statut;
import fr.astonfly.traduction.TraductionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/admin/evenements")
public class EvenementAdminController {

    /** Champs saisis en français ; la traduction vers les 5 autres langues est automatique. */
    public record EvenementRequete(@NotNull LocalDate date, @NotBlank String image,
                                   @NotBlank String tag, @NotBlank String titre,
                                   @NotBlank String lieu, @NotBlank String horaire,
                                   @NotBlank String description) {
    }

    private final EvenementRepository evenements;
    private final TraductionService traduction;
    private final ObjectMapper mapper;

    public EvenementAdminController(EvenementRepository evenements, TraductionService traduction,
                                    ObjectMapper mapper) {
        this.evenements = evenements;
        this.traduction = traduction;
        this.mapper = mapper;
    }

    @GetMapping
    public List<Map<String, Object>> lister() {
        return evenements.findAll().stream()
                .sorted((a, b) -> a.getDate().compareTo(b.getDate()))
                .map(this::versDetail)
                .toList();
    }

    @PostMapping
    @Transactional
    public Map<String, Object> creer(@Valid @RequestBody EvenementRequete requete) {
        return enregistrer(new Evenement(), requete);
    }

    @PutMapping("/{id}")
    @Transactional
    public Map<String, Object> modifier(@PathVariable Long id, @Valid @RequestBody EvenementRequete requete) {
        return enregistrer(charger(id), requete);
    }

    @PostMapping("/{id}/publier")
    @Transactional
    public Map<String, Object> publier(@PathVariable Long id) {
        Evenement evenement = charger(id);
        evenement.setStatut(Statut.PUBLIE);
        return versDetail(evenements.save(evenement));
    }

    @PostMapping("/{id}/depublier")
    @Transactional
    public Map<String, Object> depublier(@PathVariable Long id) {
        Evenement evenement = charger(id);
        evenement.setStatut(Statut.BROUILLON);
        return versDetail(evenements.save(evenement));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void supprimer(@PathVariable Long id) {
        evenements.delete(charger(id));
    }

    private Map<String, Object> enregistrer(Evenement evenement, EvenementRequete requete) {
        evenement.setDate(requete.date());
        evenement.setImage(requete.image().trim());

        appliquer(evenement, Langues.SOURCE, requete.tag(), requete.titre(), requete.lieu(),
                requete.horaire(), requete.description());

        List<String> nonTraduites = new ArrayList<>();
        for (String lang : Langues.TOUTES) {
            if (Langues.SOURCE.equals(lang)) {
                continue;
            }
            ObjectNode source = mapper.createObjectNode();
            source.put("tag", requete.tag());
            source.put("titre", requete.titre());
            source.put("lieu", requete.lieu());
            source.put("horaire", requete.horaire());
            source.put("description", requete.description());
            JsonNode traduit = traduction.traduire(source, lang);
            if (traduit == null) {
                nonTraduites.add(lang);
                appliquer(evenement, lang, requete.tag(), requete.titre(), requete.lieu(),
                        requete.horaire(), requete.description());
            } else {
                appliquer(evenement, lang,
                        traduit.path("tag").asText(requete.tag()),
                        traduit.path("titre").asText(requete.titre()),
                        traduit.path("lieu").asText(requete.lieu()),
                        traduit.path("horaire").asText(requete.horaire()),
                        traduit.path("description").asText(requete.description()));
            }
        }

        Map<String, Object> reponse = new LinkedHashMap<>(versDetail(evenements.save(evenement)));
        if (!nonTraduites.isEmpty()) {
            reponse.put("avertissement", "Traduction indisponible pour " + String.join(", ", nonTraduites)
                    + " : le contenu français a été copié tel quel"
                    + (traduction.disponible() ? "." : " (clé OpenAI non configurée)."));
        }
        return reponse;
    }

    private void appliquer(Evenement evenement, String lang, String tag, String titre,
                           String lieu, String horaire, String description) {
        EvenementTraduction t = evenement.traduction(lang).orElseGet(() -> {
            EvenementTraduction neuve = new EvenementTraduction(evenement, lang);
            evenement.getTraductions().add(neuve);
            return neuve;
        });
        t.setTag(tag);
        t.setTitre(titre);
        t.setLieu(lieu);
        t.setHoraire(horaire);
        t.setDescription(description);
    }

    private Evenement charger(Long id) {
        return evenements.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private Map<String, Object> versDetail(Evenement e) {
        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("id", e.getId());
        detail.put("date", e.getDate());
        detail.put("image", e.getImage());
        detail.put("statut", e.getStatut().name());
        e.traduction(Langues.SOURCE).ifPresent(t -> {
            detail.put("tag", t.getTag());
            detail.put("titre", t.getTitre());
            detail.put("lieu", t.getLieu());
            detail.put("horaire", t.getHoraire());
            detail.put("description", t.getDescription());
        });
        return detail;
    }
}
