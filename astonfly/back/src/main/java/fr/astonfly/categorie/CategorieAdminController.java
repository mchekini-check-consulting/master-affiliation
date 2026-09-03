package fr.astonfly.categorie;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;
import fr.astonfly.article.ArticleRepository;
import fr.astonfly.commun.Langues;
import fr.astonfly.traduction.TraductionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/admin/categories")
public class CategorieAdminController {

    public record CategorieRequete(@NotBlank String nomFr, Map<String, String> noms) {
    }

    private final CategorieRepository categories;
    private final ArticleRepository articles;
    private final TraductionService traduction;
    private final ObjectMapper mapper;

    public CategorieAdminController(CategorieRepository categories, ArticleRepository articles,
                                    TraductionService traduction, ObjectMapper mapper) {
        this.categories = categories;
        this.articles = articles;
        this.traduction = traduction;
        this.mapper = mapper;
    }

    @GetMapping
    public List<Categorie> lister() {
        return categories.findAll();
    }

    @PostMapping
    public Categorie creer(@Valid @RequestBody CategorieRequete requete) {
        Categorie categorie = new Categorie();
        appliquer(categorie, requete);
        return categories.save(categorie);
    }

    @PutMapping("/{id}")
    public Categorie modifier(@PathVariable Long id, @Valid @RequestBody CategorieRequete requete) {
        Categorie categorie = categories.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        appliquer(categorie, requete);
        return categories.save(categorie);
    }

    @DeleteMapping("/{id}")
    public void supprimer(@PathVariable Long id) {
        if (articles.existsByCategorieId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Des articles utilisent cette catégorie");
        }
        categories.deleteById(id);
    }

    /**
     * Le nom français fait foi ; les noms manquants dans les autres langues
     * sont traduits automatiquement (ou copiés du français sans clé OpenAI).
     */
    private void appliquer(Categorie categorie, CategorieRequete requete) {
        Map<String, String> noms = new HashMap<>();
        noms.put("fr", requete.nomFr().trim());
        if (requete.noms() != null) {
            requete.noms().forEach((lang, nom) -> {
                if (Langues.valide(lang) && nom != null && !nom.isBlank()) {
                    noms.put(lang, nom.trim());
                }
            });
        }
        for (String lang : Langues.TOUTES) {
            if (!noms.containsKey(lang)) {
                noms.put(lang, traduireNom(requete.nomFr(), lang));
            }
        }
        categorie.setNoms(noms);
    }

    private String traduireNom(String nomFr, String lang) {
        ObjectNode source = mapper.createObjectNode().put("nom", nomFr);
        JsonNode traduit = traduction.traduire(source, lang);
        return traduit != null && traduit.hasNonNull("nom") ? traduit.get("nom").asText() : nomFr;
    }
}
