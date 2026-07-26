package fr.echecs360.web;

import fr.echecs360.blog.Article;
import fr.echecs360.blog.ArticleService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

import static org.springframework.http.HttpStatus.NOT_FOUND;

/** Pages publiques rendues côté serveur : landing, blog, sitemap, robots. */
@Controller
public class PublicController {

    /** Taille de page de la liste du blog. */
    private static final int PAGE_SIZE = 6;
    private static final DateTimeFormatter DATE_FR =
            DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.FRENCH);

    private final ArticleService articles;
    private final String baseUrl;

    public PublicController(ArticleService articles, @Value("${app.base-url}") String baseUrl) {
        this.articles = articles;
        this.baseUrl = baseUrl.replaceAll("/$", "");
    }

    @GetMapping("/")
    public String landing(Model model) {
        model.addAttribute("latestArticles", articles.all().stream().limit(3).toList());
        model.addAttribute("baseUrl", baseUrl);
        model.addAttribute("canonical", baseUrl + "/");
        model.addAttribute("dateFr", DATE_FR);
        model.addAttribute("metaTitle", "Échecs360 — Apprenez les échecs en jouant");
        model.addAttribute("metaDescription",
                "Jouez aux échecs à deux, affrontez un bot à Elo réglable de 400 à 2200 et analysez "
                + "vos parties chess.com : gaffes, erreurs et graphique d'évaluation. Gratuit, en français.");
        return "index";
    }

    @GetMapping("/blog")
    public String blog(@RequestParam(defaultValue = "1") int page, Model model) {
        List<Article> all = articles.all();
        int pageCount = Math.max(1, (int) Math.ceil(all.size() / (double) PAGE_SIZE));
        int current = Math.min(Math.max(1, page), pageCount);
        List<Article> pageArticles = all.stream()
                .skip((long) (current - 1) * PAGE_SIZE)
                .limit(PAGE_SIZE)
                .toList();
        model.addAttribute("articles", pageArticles);
        model.addAttribute("page", current);
        model.addAttribute("pageCount", pageCount);
        model.addAttribute("baseUrl", baseUrl);
        model.addAttribute("canonical", baseUrl + "/blog" + (current > 1 ? "?page=" + current : ""));
        model.addAttribute("dateFr", DATE_FR);
        model.addAttribute("metaTitle", current > 1
                ? "Blog — page " + current + " — Échecs360"
                : "Blog échecs : conseils pour débuter et progresser — Échecs360");
        model.addAttribute("metaDescription",
                "Règles, ouvertures, analyse de parties : le blog d'Échecs360 publie des conseils "
                + "concrets en français pour apprendre les échecs et progresser.");
        return "blog";
    }

    @GetMapping("/blog/{slug}")
    public String article(@PathVariable String slug, Model model) {
        Article article = articles.bySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Article introuvable"));
        model.addAttribute("article", article);
        model.addAttribute("related", articles.related(article, 3));
        model.addAttribute("baseUrl", baseUrl);
        model.addAttribute("canonical", baseUrl + "/blog/" + article.slug());
        model.addAttribute("dateFr", DATE_FR);
        model.addAttribute("metaTitle", article.title() + " — Échecs360");
        model.addAttribute("metaDescription", article.description());
        return "article";
    }

    /** Sitemap dynamique : landing, blog et chaque article. */
    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> sitemap() {
        StringBuilder xml = new StringBuilder("""
                <?xml version="1.0" encoding="UTF-8"?>
                <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                """);
        xml.append(url(baseUrl + "/", null));
        xml.append(url(baseUrl + "/blog", null));
        for (Article article : articles.all()) {
            xml.append(url(baseUrl + "/blog/" + article.slug(), article.date().toString()));
        }
        xml.append("</urlset>\n");
        return ResponseEntity.ok(xml.toString());
    }

    @GetMapping(value = "/robots.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> robots() {
        return ResponseEntity.ok("""
                User-agent: *
                Allow: /
                Disallow: /app

                Sitemap: %s/sitemap.xml
                """.formatted(baseUrl));
    }

    private static String url(String loc, String lastmod) {
        return "  <url><loc>" + loc + "</loc>"
                + (lastmod != null ? "<lastmod>" + lastmod + "</lastmod>" : "")
                + "</url>\n";
    }
}
