package fr.hitechacademy.seo;

import com.fasterxml.jackson.databind.JsonNode;
import fr.hitechacademy.seo.SeoDtos.ArticleDetailView;
import fr.hitechacademy.seo.SeoDtos.ArticleView;
import fr.hitechacademy.seo.SeoDtos.KeywordView;
import fr.hitechacademy.seo.SeoDtos.RunView;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * API consommée par l'orchestrateur du pipeline SEO (token de service
 * Bearer SEO_AGENT_TOKEN — voir SeoAgentTokenFilter). Contrat JSON strict,
 * statuts en minuscules.
 */
@RestController
@RequestMapping("/seo")
public class SeoAgentController {

    public record ConfigView(boolean agentEnabled, List<KeywordView> keywords) {
    }

    public record UpdateKeywordRequest(SeoKeywordStatus status, Instant lastRunAt, String errorMessage) {
    }

    /** Sortie de l'agent 4 : les champs structurés arrivent en JSON natif. */
    public record CreateArticleRequest(@NotNull UUID keywordId, @NotBlank String title,
                                       String metaDescription, String slug, JsonNode hnOutline,
                                       @NotBlank String bodyMd, JsonNode internalLinks, JsonNode faq,
                                       JsonNode schemaOrg, Integer auditScore, JsonNode auditIssues,
                                       Instant publishAt) {
    }

    public record UpdateArticleRequest(SeoArticleStatus status, String cmsUrl, Instant publishedAt) {
    }

    public record CreateRunRequest(SeoRunTrigger trigger) {
    }

    public record UpdateRunRequest(SeoRunStatus status, Boolean skipped, String currentStep,
                                   String currentKeyword, Integer keywordsProcessed,
                                   Integer articlesPublished, Double costUsd, String error,
                                   Instant startedAt, Instant finishedAt) {
    }

    private final SeoConfigRepository configs;
    private final SeoKeywordRepository keywords;
    private final SeoArticleRepository articles;
    private final SeoRunRepository runs;

    public SeoAgentController(SeoConfigRepository configs, SeoKeywordRepository keywords,
                              SeoArticleRepository articles, SeoRunRepository runs) {
        this.configs = configs;
        this.keywords = keywords;
        this.articles = articles;
        this.runs = runs;
    }

    // --- Config + mots-clés (lecture au début de chaque run) -----------

    @GetMapping("/config")
    @Transactional
    public ConfigView getConfig() {
        boolean enabled = configs.findById(SeoConfig.SINGLETON_ID)
                .map(SeoConfig::isAgentEnabled)
                .orElse(false);
        List<KeywordView> list = keywords.findAllByOrderByCreatedAtDesc().stream()
                .map(KeywordView::from)
                .toList();
        return new ConfigView(enabled, list);
    }

    @PatchMapping("/keywords/{id}")
    @Transactional
    public KeywordView updateKeyword(@PathVariable UUID id, @RequestBody UpdateKeywordRequest body) {
        SeoKeyword keyword = keywords.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mot-clé introuvable"));
        if (body.status() != null) keyword.setStatus(body.status());
        if (body.lastRunAt() != null) keyword.setLastRunAt(body.lastRunAt());
        if (body.errorMessage() != null) keyword.setErrorMessage(body.errorMessage());
        return KeywordView.from(keywords.save(keyword));
    }

    // --- Articles -------------------------------------------------------

    /** Dépôt d'un article rédigé par l'agent 4, au statut to_validate. */
    @PostMapping("/articles")
    @Transactional
    public ArticleDetailView createArticle(@Valid @RequestBody CreateArticleRequest body) {
        SeoKeyword keyword = keywords.findById(body.keywordId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mot-clé introuvable"));

        SeoArticle article = new SeoArticle();
        article.setKeywordId(keyword.getId());
        article.setKeyword(keyword.getKeyword());
        article.setTitle(body.title().trim());
        article.setMetaDescription(body.metaDescription());
        article.setSlug(body.slug());
        article.setHnOutline(toJsonText(body.hnOutline()));
        article.setBodyMd(body.bodyMd());
        article.setInternalLinks(toJsonText(body.internalLinks()));
        article.setFaq(toJsonText(body.faq()));
        article.setSchemaOrg(toJsonText(body.schemaOrg()));
        article.setAuditScore(body.auditScore());
        article.setAuditIssues(toJsonText(body.auditIssues()));
        article.setPublishAt(body.publishAt());
        article = articles.save(article);

        keyword.setArticleId(article.getId());
        keywords.save(keyword);
        return ArticleDetailView.from(article);
    }

    /** Articles à publier : GET /seo/articles?status=validated&publish_before=<iso>. */
    @GetMapping("/articles")
    @Transactional(readOnly = true)
    public List<ArticleView> listArticles(
            @RequestParam(name = "status", required = false) String statusParam,
            @RequestParam(name = "publish_before", required = false) Instant publishBefore) {
        SeoArticleStatus status = parseStatus(statusParam, SeoArticleStatus::fromJson);
        List<SeoArticle> found;
        if (status != null && publishBefore != null) {
            found = articles.findByStatusAndPublishAtBeforeOrderByPublishAtAsc(status, publishBefore);
        } else if (status != null) {
            found = articles.findByStatusOrderByCreatedAtDesc(status);
        } else {
            found = articles.findAllByOrderByCreatedAtDesc();
        }
        return found.stream().map(ArticleView::from).toList();
    }

    /** Passage à published après le push CMS (cms_url, published_at). */
    @PatchMapping("/articles/{id}")
    @Transactional
    public ArticleView updateArticle(@PathVariable UUID id, @RequestBody UpdateArticleRequest body) {
        SeoArticle article = articles.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Article introuvable"));
        if (body.status() == SeoArticleStatus.PUBLISHED) {
            // Idempotence : ne publier qu'un article encore validated
            if (article.getStatus() != SeoArticleStatus.VALIDATED) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Seul un article validated peut passer à published (statut actuel : "
                                + article.getStatus().toJson() + ").");
            }
            article.setStatus(SeoArticleStatus.PUBLISHED);
        } else if (body.status() != null) {
            article.setStatus(body.status());
        }
        if (body.cmsUrl() != null) article.setCmsUrl(body.cmsUrl());
        if (body.publishedAt() != null) article.setPublishedAt(body.publishedAt());
        return ArticleView.from(articles.save(article));
    }

    // --- Runs : journal et progression ----------------------------------

    /** Runs en attente de prise en charge : GET /seo/runs?status=requested. */
    @GetMapping("/runs")
    @Transactional(readOnly = true)
    public List<RunView> listRuns(@RequestParam(name = "status", required = false) String statusParam) {
        SeoRunStatus status = parseStatus(statusParam, SeoRunStatus::fromJson);
        List<SeoRun> found = status != null
                ? runs.findByStatusOrderByCreatedAtAsc(status)
                : runs.findTop20ByOrderByCreatedAtDesc();
        return found.stream().map(RunView::from).toList();
    }

    /** Ouverture d'un run par l'orchestrateur (exécutions cron). */
    @PostMapping("/runs")
    @Transactional
    public RunView createRun(@RequestBody(required = false) CreateRunRequest body) {
        SeoRun run = new SeoRun();
        run.setTrigger(body != null && body.trigger() != null ? body.trigger() : SeoRunTrigger.CRON);
        run.setStatus(SeoRunStatus.RUNNING);
        run.setStartedAt(Instant.now());
        return RunView.from(runs.save(run));
    }

    /** Progression (current_step affiché en direct dans l'admin) et clôture. */
    @PatchMapping("/runs/{id}")
    @Transactional
    public RunView updateRun(@PathVariable UUID id, @RequestBody UpdateRunRequest body) {
        SeoRun run = runs.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Run introuvable"));
        if (body.status() != null) {
            run.setStatus(body.status());
            if (body.status() == SeoRunStatus.RUNNING && run.getStartedAt() == null) {
                run.setStartedAt(Instant.now());
            }
        }
        if (body.skipped() != null) run.setSkipped(body.skipped());
        if (body.currentStep() != null) run.setCurrentStep(body.currentStep());
        if (body.currentKeyword() != null) run.setCurrentKeyword(body.currentKeyword());
        if (body.keywordsProcessed() != null) run.setKeywordsProcessed(body.keywordsProcessed());
        if (body.articlesPublished() != null) run.setArticlesPublished(body.articlesPublished());
        if (body.costUsd() != null) run.setCostUsd(body.costUsd());
        if (body.error() != null) run.setError(body.error());
        if (body.startedAt() != null) run.setStartedAt(body.startedAt());
        if (body.finishedAt() != null) run.setFinishedAt(body.finishedAt());
        return RunView.from(runs.save(run));
    }

    private static String toJsonText(JsonNode node) {
        return node == null || node.isNull() ? null : node.toString();
    }

    /** Statut en minuscules dans l'URL (ex. ?status=validated), 400 si inconnu. */
    private static <E> E parseStatus(String value, java.util.function.Function<String, E> parser) {
        if (value == null || value.isBlank()) return null;
        try {
            return parser.apply(value);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Statut inconnu : " + value);
        }
    }
}
