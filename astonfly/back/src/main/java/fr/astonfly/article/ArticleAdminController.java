package fr.astonfly.article;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;
import fr.astonfly.categorie.Categorie;
import fr.astonfly.categorie.CategorieRepository;
import fr.astonfly.commun.Langues;
import fr.astonfly.commun.Statut;
import fr.astonfly.traduction.TraductionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
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
@RequestMapping("/v1/admin/articles")
public class ArticleAdminController {

    /** Contenu source (français) saisi dans l'admin. */
    public record ContenuSource(@NotBlank String titre, @NotBlank String chapo,
                                @NotBlank String altImage, @NotNull JsonNode corps) {
    }

    public record ArticleRequete(@NotBlank String slug, @NotNull Long categorieId,
                                 @NotNull LocalDate datePublication, @Min(1) int minutesLecture,
                                 @NotBlank String image, @NotNull ContenuSource source,
                                 List<String> langues) {
    }

    public record Resume(Long id, String slug, String titre, Long categorieId, String categorie,
                         LocalDate datePublication, int minutesLecture, String image,
                         String statut, List<String> langues) {
    }

    private final ArticleRepository articles;
    private final CategorieRepository categories;
    private final TraductionService traduction;
    private final ObjectMapper mapper;

    public ArticleAdminController(ArticleRepository articles, CategorieRepository categories,
                                  TraductionService traduction, ObjectMapper mapper) {
        this.articles = articles;
        this.categories = categories;
        this.traduction = traduction;
        this.mapper = mapper;
    }

    @GetMapping("/ping")
    public Map<String, Object> ping() {
        return Map.of("ok", true, "traductionDisponible", traduction.disponible());
    }

    @GetMapping
    public List<Resume> lister() {
        return articles.findAll().stream()
                .sorted((a, b) -> b.getDatePublication().compareTo(a.getDatePublication()))
                .map(this::resume)
                .toList();
    }

    @GetMapping("/{id}")
    public Map<String, Object> detail(@PathVariable Long id) {
        Article article = charger(id);
        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("id", article.getId());
        detail.put("slug", article.getSlug());
        detail.put("categorieId", article.getCategorie().getId());
        detail.put("datePublication", article.getDatePublication());
        detail.put("minutesLecture", article.getMinutesLecture());
        detail.put("image", article.getImage());
        detail.put("statut", article.getStatut().name());
        Map<String, Object> traductions = new LinkedHashMap<>();
        for (ArticleTraduction t : article.getTraductions()) {
            traductions.put(t.getLangue(), Map.of(
                    "titre", t.getTitre(),
                    "chapo", t.getChapo(),
                    "altImage", t.getAltImage(),
                    "corps", lireCorps(t.getCorpsJson())));
        }
        detail.put("traductions", traductions);
        return detail;
    }

    @PostMapping
    @Transactional
    public Map<String, Object> creer(@Valid @RequestBody ArticleRequete requete) {
        if (articles.existsBySlug(requete.slug())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce slug existe déjà");
        }
        return enregistrer(new Article(), requete);
    }

    @PutMapping("/{id}")
    @Transactional
    public Map<String, Object> modifier(@PathVariable Long id, @Valid @RequestBody ArticleRequete requete) {
        if (articles.existsBySlugAndIdNot(requete.slug(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce slug existe déjà");
        }
        return enregistrer(charger(id), requete);
    }

    @PostMapping("/{id}/publier")
    @Transactional
    public Resume publier(@PathVariable Long id) {
        Article article = charger(id);
        article.setStatut(Statut.PUBLIE);
        return resume(articles.save(article));
    }

    @PostMapping("/{id}/depublier")
    @Transactional
    public Resume depublier(@PathVariable Long id) {
        Article article = charger(id);
        article.setStatut(Statut.BROUILLON);
        return resume(articles.save(article));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void supprimer(@PathVariable Long id) {
        articles.delete(charger(id));
    }

    /**
     * Enregistre le contenu source en français puis traduit vers les langues
     * sélectionnées. Sans clé OpenAI, la traduction copie le français et un
     * avertissement est renvoyé à l'admin.
     */
    private Map<String, Object> enregistrer(Article article, ArticleRequete requete) {
        Categorie categorie = categories.findById(requete.categorieId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Catégorie inconnue"));
        article.setSlug(requete.slug().trim());
        article.setCategorie(categorie);
        article.setDatePublication(requete.datePublication());
        article.setMinutesLecture(requete.minutesLecture());
        article.setImage(requete.image().trim());
        if (article.getStatut() == null) {
            article.setStatut(Statut.BROUILLON);
        }

        List<String> cibles = requete.langues() == null ? List.of()
                : requete.langues().stream().filter(Langues::valide)
                        .filter(l -> !Langues.SOURCE.equals(l)).distinct().toList();

        // Les traductions des langues désélectionnées sont retirées
        article.getTraductions().removeIf(t -> !Langues.SOURCE.equals(t.getLangue())
                && !cibles.contains(t.getLangue()));

        appliquerContenu(article, Langues.SOURCE, requete.source().titre(), requete.source().chapo(),
                requete.source().altImage(), requete.source().corps());

        List<String> nonTraduites = new ArrayList<>();
        for (String lang : cibles) {
            ObjectNode source = mapper.createObjectNode();
            source.put("titre", requete.source().titre());
            source.put("chapo", requete.source().chapo());
            source.put("altImage", requete.source().altImage());
            source.set("corps", requete.source().corps());
            JsonNode traduit = traduction.traduire(source, lang);
            if (traduit == null) {
                nonTraduites.add(lang);
                appliquerContenu(article, lang, requete.source().titre(), requete.source().chapo(),
                        requete.source().altImage(), requete.source().corps());
            } else {
                appliquerContenu(article, lang,
                        traduit.path("titre").asText(requete.source().titre()),
                        traduit.path("chapo").asText(requete.source().chapo()),
                        traduit.path("altImage").asText(requete.source().altImage()),
                        traduit.hasNonNull("corps") ? traduit.get("corps") : requete.source().corps());
            }
        }

        Article enregistre = articles.save(article);
        Map<String, Object> reponse = new LinkedHashMap<>();
        reponse.put("article", resume(enregistre));
        if (!nonTraduites.isEmpty()) {
            reponse.put("avertissement", "Traduction indisponible pour " + String.join(", ", nonTraduites)
                    + " : le contenu français a été copié tel quel"
                    + (traduction.disponible() ? "." : " (clé OpenAI non configurée)."));
        }
        return reponse;
    }

    private void appliquerContenu(Article article, String lang, String titre, String chapo,
                                  String altImage, JsonNode corps) {
        ArticleTraduction t = article.traduction(lang).orElseGet(() -> {
            ArticleTraduction neuve = new ArticleTraduction(article, lang);
            article.getTraductions().add(neuve);
            return neuve;
        });
        t.setTitre(titre);
        t.setChapo(chapo);
        t.setAltImage(altImage);
        try {
            t.setCorpsJson(mapper.writeValueAsString(corps));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corps d'article invalide");
        }
    }

    private Article charger(Long id) {
        return articles.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private Resume resume(Article article) {
        return new Resume(article.getId(), article.getSlug(),
                article.traduction(Langues.SOURCE).map(ArticleTraduction::getTitre).orElse(""),
                article.getCategorie().getId(), article.getCategorie().nom(Langues.SOURCE),
                article.getDatePublication(), article.getMinutesLecture(), article.getImage(),
                article.getStatut().name(),
                article.getTraductions().stream().map(ArticleTraduction::getLangue).sorted().toList());
    }

    private JsonNode lireCorps(String corpsJson) {
        try {
            return mapper.readTree(corpsJson);
        } catch (Exception e) {
            return mapper.createArrayNode();
        }
    }
}
