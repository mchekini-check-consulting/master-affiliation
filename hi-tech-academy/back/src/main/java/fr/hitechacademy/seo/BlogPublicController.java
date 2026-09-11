package fr.hitechacademy.seo;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

/**
 * API publique du blog : sert les articles SEO au statut published à la SPA
 * (page /blog et pages /blog/<slug>). Le « CMS » du pipeline est le site
 * lui-même — publier un article = le faire passer à published, il apparaît
 * ici au rafraîchissement suivant.
 */
@RestController
@RequestMapping("/blog")
public class BlogPublicController {

    /** Carte d'article pour la liste (sans le corps). */
    public record PublishedArticleView(String slug, String title, String metaDescription,
                                       String keyword, Instant publishedAt, int readingMinutes) {
    }

    /** Article complet : Markdown + FAQ + données structurées (JSON-LD). */
    public record PublishedArticleDetailView(String slug, String title, String metaDescription,
                                             String keyword, Instant publishedAt, int readingMinutes,
                                             String bodyMd, JsonNode faq, JsonNode schemaOrg) {
    }

    private final SeoArticleRepository articles;
    private final ObjectMapper objectMapper;

    public BlogPublicController(SeoArticleRepository articles, ObjectMapper objectMapper) {
        this.articles = articles;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/articles")
    @Transactional(readOnly = true)
    public List<PublishedArticleView> list() {
        return articles.findByStatusOrderByPublishedAtDesc(SeoArticleStatus.PUBLISHED).stream()
                .map(a -> new PublishedArticleView(a.getSlug(), a.getTitle(), a.getMetaDescription(),
                        a.getKeyword(), a.getPublishedAt(), readingMinutes(a.getBodyMd())))
                .toList();
    }

    @GetMapping("/articles/{slug}")
    @Transactional(readOnly = true)
    public PublishedArticleDetailView get(@PathVariable String slug) {
        SeoArticle a = articles.findBySlugAndStatus(slug, SeoArticleStatus.PUBLISHED)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Article introuvable"));
        return new PublishedArticleDetailView(a.getSlug(), a.getTitle(), a.getMetaDescription(),
                a.getKeyword(), a.getPublishedAt(), readingMinutes(a.getBodyMd()),
                a.getBodyMd(), parseJson(a.getFaq()), parseJson(a.getSchemaOrg()));
    }

    /** ~200 mots/minute, minimum 1 minute. */
    private static int readingMinutes(String bodyMd) {
        if (bodyMd == null || bodyMd.isBlank()) return 1;
        int words = bodyMd.trim().split("\\s+").length;
        return Math.max(1, Math.round(words / 200f));
    }

    private JsonNode parseJson(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readTree(json);
        } catch (Exception e) {
            return null; // champ structuré illisible : l'article reste servable
        }
    }
}
