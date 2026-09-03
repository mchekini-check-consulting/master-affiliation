package fr.astonfly.article;

import tools.jackson.databind.ObjectMapper;
import fr.astonfly.commun.Langues;
import fr.astonfly.commun.Statut;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Articles publiés, au format exact des `posts` codés en dur de la SPA :
 * {slug, cat, date, read, title, img, alt, dek, body}.
 */
@RestController
@RequestMapping("/v1/public/articles")
public class ArticlePublicController {

    private final ArticleRepository articles;
    private final ObjectMapper mapper;

    public ArticlePublicController(ArticleRepository articles, ObjectMapper mapper) {
        this.articles = articles;
        this.mapper = mapper;
    }

    @GetMapping
    public List<Map<String, Object>> lister(@RequestParam(defaultValue = "fr") String lang) {
        String langue = Langues.valide(lang) ? lang : "fr";
        return articles.findByStatutOrderByDatePublicationDesc(Statut.PUBLIE).stream()
                .map(article -> versPost(article, langue))
                .flatMap(Optional::stream)
                .toList();
    }

    private Optional<Map<String, Object>> versPost(Article article, String langue) {
        return article.traduction(langue).map(t -> {
            Map<String, Object> post = new LinkedHashMap<>();
            post.put("slug", article.getSlug());
            post.put("cat", article.getCategorie().nom(langue));
            post.put("date", Langues.dateLongue(article.getDatePublication(), langue));
            post.put("read", Langues.tempsLecture(article.getMinutesLecture(), langue));
            post.put("title", t.getTitre());
            post.put("img", article.getImage());
            post.put("alt", t.getAltImage());
            post.put("dek", t.getChapo());
            try {
                post.put("body", mapper.readTree(t.getCorpsJson()));
            } catch (Exception e) {
                post.put("body", List.of());
            }
            return post;
        });
    }
}
