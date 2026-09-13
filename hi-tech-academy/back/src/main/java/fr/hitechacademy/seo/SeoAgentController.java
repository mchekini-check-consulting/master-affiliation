package fr.hitechacademy.seo;

import com.fasterxml.jackson.databind.JsonNode;
import fr.hitechacademy.seo.SeoDtos.ArticleDetailView;
import fr.hitechacademy.seo.SeoDtos.ArticleView;
import fr.hitechacademy.seo.SeoDtos.KeywordView;
import fr.hitechacademy.seo.SeoDtos.RunView;
import fr.hitechacademy.seo.SeoDtos.SuggestionView;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

    /**
     * Sortie de l'agent 4 : les champs structurés arrivent en JSON natif.
     * `keyword` (optionnel) : mot-clé affiché — pour les articles issus d'une
     * suggestion, c'est la suggestion et non le pilier.
     */
    public record CreateArticleRequest(@NotNull UUID keywordId, String keyword, @NotBlank String title,
                                       String metaDescription, String slug, JsonNode hnOutline,
                                       @NotBlank String bodyMd, JsonNode internalLinks, JsonNode faq,
                                       JsonNode schemaOrg, Integer auditScore, JsonNode auditIssues,
                                       Instant publishAt) {
    }

    /** Mot-clé proposé par la phase de recherche (contrat de l'agent 2 + score d'opportunité). */
    public record SuggestionEntry(@NotBlank String kw, Integer volume, Double cpc, Double competition,
                                  Integer kd, String intent,
                                  @com.fasterxml.jackson.annotation.JsonProperty("trend_12m") JsonNode trend12m,
                                  Double gapScore, String source, Double score) {
    }

    public record UpdateSuggestionRequest(SeoSuggestionStatus status, UUID articleId, String errorMessage) {
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
    private final SeoKeywordSuggestionRepository suggestions;

    public SeoAgentController(SeoConfigRepository configs, SeoKeywordRepository keywords,
                              SeoArticleRepository articles, SeoRunRepository runs,
                              SeoKeywordSuggestionRepository suggestions) {
        this.configs = configs;
        this.keywords = keywords;
        this.articles = articles;
        this.runs = runs;
        this.suggestions = suggestions;
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
        article.setKeyword(body.keyword() != null && !body.keyword().isBlank()
                ? body.keyword().trim() : keyword.getKeyword());
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

        // Plusieurs articles peuvent naître d'un même pilier (suggestions) :
        // le pilier garde le lien vers son premier article
        if (keyword.getArticleId() == null) {
            keyword.setArticleId(article.getId());
            keywords.save(keyword);
        }
        return ArticleDetailView.from(article);
    }

    // --- Suggestions de mots-clés (phase recherche → sélection admin) ---

    /** Dépôt des propositions d'un pilier : remplace les non-rédigées. */
    @PutMapping("/keywords/{id}/suggestions")
    @Transactional
    public List<SuggestionView> replaceSuggestions(@PathVariable UUID id,
                                                   @Valid @RequestBody List<SuggestionEntry> entries) {
        SeoKeyword keyword = keywords.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mot-clé introuvable"));

        // Ne pas écraser le travail en cours : sélections et articles restent
        List<SeoKeywordSuggestion> existing = suggestions.findByKeywordIdOrderByVolumeDesc(keyword.getId());
        var kept = existing.stream()
                .filter(s -> s.getStatus() != SeoSuggestionStatus.SUGGESTED)
                .toList();
        var keptKws = kept.stream().map(s -> s.getKw().toLowerCase()).collect(java.util.stream.Collectors.toSet());
        suggestions.deleteAll(existing.stream()
                .filter(s -> s.getStatus() == SeoSuggestionStatus.SUGGESTED)
                .toList());

        for (SuggestionEntry entry : entries) {
            if (keptKws.contains(entry.kw().trim().toLowerCase())) continue;
            SeoKeywordSuggestion s = new SeoKeywordSuggestion();
            s.setKeywordId(keyword.getId());
            s.setKw(entry.kw().trim());
            s.setVolume(entry.volume() != null ? entry.volume() : 0);
            s.setCpc(entry.cpc() != null ? entry.cpc() : 0);
            s.setCompetition(entry.competition() != null ? entry.competition() : 0);
            s.setKd(entry.kd() != null ? entry.kd() : 0);
            s.setIntent(entry.intent() != null ? entry.intent() : "unknown");
            s.setTrend12m(toJsonText(entry.trend12m()));
            s.setGapScore(entry.gapScore() != null ? entry.gapScore() : 0);
            s.setSource(entry.source() != null ? entry.source() : "ideas");
            s.setScore(entry.score());
            suggestions.save(s);
        }
        return suggestions.findByKeywordIdOrderByVolumeDesc(keyword.getId()).stream()
                .map(SuggestionView::from)
                .toList();
    }

    /** Suggestions par statut — la rédaction consomme ?status=selected. */
    @GetMapping("/suggestions")
    @Transactional(readOnly = true)
    public List<SuggestionView> listSuggestions(
            @RequestParam(name = "status", required = false) String statusParam) {
        SeoSuggestionStatus status = parseStatus(statusParam, SeoSuggestionStatus::fromJson);
        List<SeoKeywordSuggestion> found = status != null
                ? suggestions.findByStatusOrderByCreatedAtAsc(status)
                : suggestions.findAll();
        return found.stream().map(SuggestionView::from).toList();
    }

    /** Progression de la rédaction : writing → written (+ article) / error. */
    @PatchMapping("/suggestions/{id}")
    @Transactional
    public SuggestionView updateSuggestion(@PathVariable UUID id,
                                           @RequestBody UpdateSuggestionRequest body) {
        SeoKeywordSuggestion suggestion = suggestions.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Suggestion introuvable"));
        if (body.status() != null) suggestion.setStatus(body.status());
        if (body.articleId() != null) suggestion.setArticleId(body.articleId());
        if (body.errorMessage() != null) suggestion.setErrorMessage(body.errorMessage());
        return SuggestionView.from(suggestions.save(suggestion));
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
