package fr.echecs360.blog;

import org.commonmark.ext.front.matter.YamlFrontMatterExtension;
import org.commonmark.ext.front.matter.YamlFrontMatterVisitor;
import org.commonmark.node.Node;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.html.HtmlRenderer;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Charge les articles Markdown de src/main/resources/articles/ au démarrage :
 * front-matter YAML (title, slug, description, date, tags) + rendu HTML via
 * commonmark. Les titres h2 reçoivent un id pour le sommaire.
 */
@Service
public class ArticleService {

    private static final Pattern H2 = Pattern.compile("<h2>(.+?)</h2>");

    private final List<Article> articles;

    public ArticleService() {
        this.articles = loadAll();
    }

    /** Tous les articles, du plus récent au plus ancien. */
    public List<Article> all() {
        return articles;
    }

    public Optional<Article> bySlug(String slug) {
        return articles.stream().filter(a -> a.slug().equals(slug)).findFirst();
    }

    /** Articles liés : partage de tags d'abord, puis les plus récents. */
    public List<Article> related(Article article, int max) {
        List<Article> result = new ArrayList<>(articles.stream()
                .filter(a -> !a.slug().equals(article.slug()))
                .sorted(Comparator
                        .comparingLong((Article a) -> a.tags().stream().filter(article.tags()::contains).count())
                        .reversed()
                        .thenComparing(Article::date, Comparator.reverseOrder()))
                .limit(max)
                .toList());
        return result;
    }

    private List<Article> loadAll() {
        Parser parser = Parser.builder().extensions(List.of(YamlFrontMatterExtension.create())).build();
        HtmlRenderer renderer = HtmlRenderer.builder().build();
        List<Article> loaded = new ArrayList<>();
        try {
            Resource[] resources = new PathMatchingResourcePatternResolver()
                    .getResources("classpath:articles/*.md");
            for (Resource resource : resources) {
                String markdown = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
                Node document = parser.parse(markdown);
                YamlFrontMatterVisitor frontMatter = new YamlFrontMatterVisitor();
                document.accept(frontMatter);
                Map<String, List<String>> meta = frontMatter.getData();

                String html = renderer.render(document);
                List<Article.TocEntry> toc = new ArrayList<>();
                html = injectHeadingIds(html, toc);

                int words = markdown.split("\\s+").length;
                loaded.add(new Article(
                        first(meta, "slug"),
                        first(meta, "title"),
                        first(meta, "description"),
                        LocalDate.parse(first(meta, "date")),
                        parseTags(meta.getOrDefault("tags", List.of())),
                        html,
                        toc,
                        Math.max(1, Math.round(words / 200f))));
            }
        } catch (IOException e) {
            throw new UncheckedIOException("Impossible de charger les articles du blog", e);
        }
        loaded.sort(Comparator.comparing(Article::date).reversed());
        return List.copyOf(loaded);
    }

    /** Ajoute un id slugifié à chaque h2 et alimente le sommaire. */
    private static String injectHeadingIds(String html, List<Article.TocEntry> toc) {
        Matcher matcher = H2.matcher(html);
        StringBuilder out = new StringBuilder();
        while (matcher.find()) {
            String label = matcher.group(1).replaceAll("<[^>]+>", "");
            String id = slugify(label);
            toc.add(new Article.TocEntry(id, label));
            matcher.appendReplacement(out,
                    Matcher.quoteReplacement("<h2 id=\"" + id + "\">" + matcher.group(1) + "</h2>"));
        }
        matcher.appendTail(out);
        return out.toString();
    }

    private static String slugify(String text) {
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.FRENCH)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return normalized.isBlank() ? "section" : normalized;
    }

    /** Tolère les deux syntaxes YAML : liste à puces ou tableau inline [a, b]. */
    private static List<String> parseTags(List<String> raw) {
        List<String> tags = new ArrayList<>();
        for (String value : raw) {
            String cleaned = value.trim();
            if (cleaned.startsWith("[")) {
                for (String part : cleaned.replaceAll("[\\[\\]]", "").split(",")) {
                    String tag = part.trim().replaceAll("^\"|\"$", "");
                    if (!tag.isBlank()) tags.add(tag);
                }
            } else {
                tags.add(cleaned.replaceAll("^\"|\"$", ""));
            }
        }
        return List.copyOf(tags);
    }

    private static String first(Map<String, List<String>> meta, String key) {
        List<String> values = meta.get(key);
        if (values == null || values.isEmpty()) {
            throw new IllegalStateException("Front-matter incomplet : champ « " + key + " » manquant");
        }
        return values.get(0);
    }
}
