package fr.hitechacademy.seo;

import fr.hitechacademy.seo.SeoDtos.ArticleDetailView;
import fr.hitechacademy.seo.SeoDtos.ArticleView;
import fr.hitechacademy.seo.SeoDtos.KeywordView;
import fr.hitechacademy.seo.SeoDtos.RunView;
import fr.hitechacademy.seo.SeoDtos.SuggestionView;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Onglet « SEO / GEO » de l'espace admin (basic auth) : toggle de l'agent,
 * gestion des mots-clés piliers, validation et planification des articles,
 * lancement manuel du pipeline et suivi des runs.
 */
@RestController
@RequestMapping("/admin/seo")
public class SeoAdminController {

    public record ConfigView(boolean agentEnabled) {
    }

    public record UpdateConfigRequest(Boolean agentEnabled) {
    }

    public record CreateKeywordRequest(@NotBlank String keyword, Integer locationCode, String languageCode) {
    }

    public record UpdateArticleRequest(SeoArticleStatus status, Instant publishAt) {
    }

    /** Statuts qu'un admin peut poser sur un article (la publication revient à l'orchestrateur). */
    private static final Set<SeoArticleStatus> ADMIN_ARTICLE_STATUSES =
            Set.of(SeoArticleStatus.VALIDATED, SeoArticleStatus.REJECTED, SeoArticleStatus.PENDING);

    private final SeoConfigRepository configs;
    private final SeoKeywordRepository keywords;
    private final SeoArticleRepository articles;
    private final SeoRunRepository runs;
    private final SeoKeywordSuggestionRepository suggestions;
    private final String baseUrl;

    public SeoAdminController(SeoConfigRepository configs, SeoKeywordRepository keywords,
                              SeoArticleRepository articles, SeoRunRepository runs,
                              SeoKeywordSuggestionRepository suggestions,
                              @org.springframework.beans.factory.annotation.Value("${app.base-url}") String baseUrl) {
        this.configs = configs;
        this.keywords = keywords;
        this.articles = articles;
        this.runs = runs;
        this.suggestions = suggestions;
        this.baseUrl = baseUrl.replaceAll("/+$", "");
    }

    // --- Configuration ------------------------------------------------

    @GetMapping("/config")
    @Transactional
    public ConfigView getConfig() {
        return new ConfigView(config().isAgentEnabled());
    }

    @PatchMapping("/config")
    @Transactional
    public ConfigView updateConfig(@RequestBody UpdateConfigRequest body) {
        SeoConfig config = config();
        if (body.agentEnabled() != null) {
            config.setAgentEnabled(body.agentEnabled());
        }
        return new ConfigView(configs.save(config).isAgentEnabled());
    }

    // --- Mots-clés -----------------------------------------------------

    @GetMapping("/keywords")
    @Transactional(readOnly = true)
    public List<KeywordView> listKeywords() {
        return keywords.findAllByOrderByCreatedAtDesc().stream().map(KeywordView::from).toList();
    }

    @PostMapping("/keywords")
    @Transactional
    public KeywordView createKeyword(@Valid @RequestBody CreateKeywordRequest body) {
        String keyword = body.keyword().trim();
        int locationCode = body.locationCode() != null ? body.locationCode() : 2250;
        String languageCode = body.languageCode() != null && !body.languageCode().isBlank()
                ? body.languageCode().trim() : "fr";
        if (keywords.existsByKeywordIgnoreCaseAndLocationCodeAndLanguageCode(keyword, locationCode, languageCode)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce mot-clé est déjà dans la liste.");
        }
        SeoKeyword entity = new SeoKeyword();
        entity.setKeyword(keyword);
        entity.setLocationCode(locationCode);
        entity.setLanguageCode(languageCode);
        return KeywordView.from(keywords.save(entity));
    }

    @DeleteMapping("/keywords/{id}")
    @Transactional
    public void deleteKeyword(@PathVariable UUID id) {
        SeoKeyword keyword = findKeyword(id);
        suggestions.deleteByKeywordId(keyword.getId());
        keywords.delete(keyword);
    }

    // --- Suggestions : la sélection manuelle des mots-clés à rédiger ----

    /** Propositions de la phase de recherche pour un pilier (tri par volume). */
    @GetMapping("/keywords/{id}/suggestions")
    @Transactional(readOnly = true)
    public List<SuggestionView> listSuggestions(@PathVariable UUID id) {
        return suggestions.findByKeywordIdOrderByVolumeDesc(findKeyword(id).getId()).stream()
                .map(SuggestionView::from)
                .toList();
    }

    public record UpdateSuggestionRequest(SeoSuggestionStatus status) {
    }

    /**
     * Sélection / désélection d'un mot-clé proposé. L'admin ne pose que
     * suggested ou selected (writing/written appartiennent à l'orchestrateur) ;
     * re-sélectionner une proposition en erreur relance sa rédaction.
     */
    @PatchMapping("/suggestions/{id}")
    @Transactional
    public SuggestionView updateSuggestion(@PathVariable UUID id,
                                           @RequestBody UpdateSuggestionRequest body) {
        SeoKeywordSuggestion suggestion = suggestions.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Suggestion introuvable"));
        if (body.status() == null
                || !(body.status() == SeoSuggestionStatus.SUGGESTED || body.status() == SeoSuggestionStatus.SELECTED)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Statut invalide : seuls suggested et selected sont autorisés.");
        }
        if (suggestion.getStatus() == SeoSuggestionStatus.WRITING
                || suggestion.getStatus() == SeoSuggestionStatus.WRITTEN) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cette proposition est en cours de rédaction ou déjà rédigée.");
        }
        suggestion.setStatus(body.status());
        if (body.status() == SeoSuggestionStatus.SELECTED) suggestion.setErrorMessage(null);
        return SuggestionView.from(suggestions.save(suggestion));
    }

    /** Relance : repasse le mot-clé à to_process pour le prochain run. */
    @PostMapping("/keywords/{id}/retry")
    @Transactional
    public KeywordView retryKeyword(@PathVariable UUID id) {
        SeoKeyword keyword = findKeyword(id);
        keyword.setStatus(SeoKeywordStatus.TO_PROCESS);
        keyword.setErrorMessage(null);
        return KeywordView.from(keywords.save(keyword));
    }

    // --- Articles / planning de publication ----------------------------

    @GetMapping("/articles")
    @Transactional(readOnly = true)
    public List<ArticleView> listArticles() {
        return articles.findAllByOrderByCreatedAtDesc().stream().map(ArticleView::from).toList();
    }

    /** Détail complet pour la prévisualisation (rendu Markdown). */
    @GetMapping("/articles/{id}")
    @Transactional(readOnly = true)
    public ArticleDetailView getArticle(@PathVariable UUID id) {
        return ArticleDetailView.from(findArticle(id));
    }

    @PatchMapping("/articles/{id}")
    @Transactional
    public ArticleView updateArticle(@PathVariable UUID id, @RequestBody UpdateArticleRequest body) {
        SeoArticle article = findArticle(id);
        if (article.getStatus() == SeoArticleStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet article est déjà publié.");
        }
        if (body.status() != null) {
            if (!ADMIN_ARTICLE_STATUSES.contains(body.status())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Statut invalide : seuls validated, rejected et pending sont autorisés.");
            }
            article.setStatus(body.status());
        }
        if (body.publishAt() != null) {
            article.setPublishAt(body.publishAt());
        }
        return ArticleView.from(articles.save(article));
    }

    /**
     * Publication immédiate depuis l'admin, sans attendre le run planifié :
     * l'article passe à published tout de suite et est servi par l'API
     * publique du blog au rafraîchissement suivant.
     */
    @PostMapping("/articles/{id}/publish")
    @Transactional
    public ArticleView publishArticleNow(@PathVariable UUID id) {
        SeoArticle article = findArticle(id);
        if (article.getStatus() == SeoArticleStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet article est déjà publié.");
        }
        if (article.getSlug() == null || article.getSlug().isBlank()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Article sans slug : publication impossible.");
        }
        Instant now = Instant.now();
        article.setStatus(SeoArticleStatus.PUBLISHED);
        if (article.getPublishAt() == null) {
            article.setPublishAt(now);
        }
        article.setPublishedAt(now);
        article.setCmsUrl(baseUrl + "/blog/" + article.getSlug());
        return ArticleView.from(articles.save(article));
    }

    // --- Runs : lancement manuel et suivi -------------------------------

    @GetMapping("/runs")
    @Transactional(readOnly = true)
    public List<RunView> listRuns() {
        return runs.findTop20ByOrderByCreatedAtDesc().stream().map(RunView::from).toList();
    }

    /**
     * Bouton « Lancer l'agent » : dépose une demande de run que
     * l'orchestrateur réclame puis exécute (workflow complet sur les
     * mots-clés to_process).
     */
    @PostMapping("/runs/launch")
    @Transactional
    public RunView launchRun() {
        if (!config().isAgentEnabled()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "L'agent est désactivé : activez « Recherche agent activée » avant de lancer un run.");
        }
        if (runs.existsByStatusIn(Set.of(SeoRunStatus.REQUESTED, SeoRunStatus.RUNNING))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Un run est déjà en cours ou en attente.");
        }
        SeoRun run = new SeoRun();
        run.setTrigger(SeoRunTrigger.MANUAL);
        run.setStatus(SeoRunStatus.REQUESTED);
        run.setCurrentStep("En attente de prise en charge par l'orchestrateur");
        return RunView.from(runs.save(run));
    }

    // --- Helpers --------------------------------------------------------

    private SeoConfig config() {
        return configs.findById(SeoConfig.SINGLETON_ID).orElseGet(() -> configs.save(new SeoConfig()));
    }

    private SeoKeyword findKeyword(UUID id) {
        return keywords.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mot-clé introuvable"));
    }

    private SeoArticle findArticle(UUID id) {
        return articles.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Article introuvable"));
    }
}
