package fr.hitechacademy.seo;

import java.time.Instant;
import java.util.UUID;

/** Vues JSON partagées par les contrôleurs admin et agent du pipeline SEO. */
public final class SeoDtos {

    private SeoDtos() {
    }

    public record KeywordView(UUID id, String keyword, int locationCode, String languageCode,
                              SeoKeywordStatus status, String errorMessage, UUID articleId,
                              Instant createdAt, Instant lastRunAt) {
        public static KeywordView from(SeoKeyword k) {
            return new KeywordView(k.getId(), k.getKeyword(), k.getLocationCode(), k.getLanguageCode(),
                    k.getStatus(), k.getErrorMessage(), k.getArticleId(), k.getCreatedAt(), k.getLastRunAt());
        }
    }

    /** Vue de liste : sans le corps ni les champs JSON volumineux. */
    public record ArticleView(UUID id, UUID keywordId, String keyword, String title,
                              String metaDescription, String slug, SeoArticleStatus status,
                              Integer auditScore, Instant publishAt, String cmsUrl,
                              Instant createdAt, Instant publishedAt) {
        public static ArticleView from(SeoArticle a) {
            return new ArticleView(a.getId(), a.getKeywordId(), a.getKeyword(), a.getTitle(),
                    a.getMetaDescription(), a.getSlug(), a.getStatus(), a.getAuditScore(),
                    a.getPublishAt(), a.getCmsUrl(), a.getCreatedAt(), a.getPublishedAt());
        }
    }

    /** Vue détaillée : ajoute le Markdown et les champs structurés (JSON bruts). */
    public record ArticleDetailView(UUID id, UUID keywordId, String keyword, String title,
                                    String metaDescription, String slug, SeoArticleStatus status,
                                    Integer auditScore, Instant publishAt, String cmsUrl,
                                    Instant createdAt, Instant publishedAt, String bodyMd,
                                    String hnOutline, String internalLinks, String faq,
                                    String schemaOrg, String auditIssues) {
        public static ArticleDetailView from(SeoArticle a) {
            return new ArticleDetailView(a.getId(), a.getKeywordId(), a.getKeyword(), a.getTitle(),
                    a.getMetaDescription(), a.getSlug(), a.getStatus(), a.getAuditScore(),
                    a.getPublishAt(), a.getCmsUrl(), a.getCreatedAt(), a.getPublishedAt(), a.getBodyMd(),
                    a.getHnOutline(), a.getInternalLinks(), a.getFaq(), a.getSchemaOrg(), a.getAuditIssues());
        }
    }

    public record SuggestionView(UUID id, UUID keywordId, String kw, int volume, double cpc,
                                 double competition, int kd, String intent,
                                 @com.fasterxml.jackson.annotation.JsonProperty("trend_12m") String trend12m,
                                 double gapScore, String source, Double score, SeoSuggestionStatus status,
                                 UUID articleId, String errorMessage, Instant createdAt) {
        public static SuggestionView from(SeoKeywordSuggestion s) {
            return new SuggestionView(s.getId(), s.getKeywordId(), s.getKw(), s.getVolume(), s.getCpc(),
                    s.getCompetition(), s.getKd(), s.getIntent(), s.getTrend12m(), s.getGapScore(),
                    s.getSource(), s.getScore(), s.getStatus(), s.getArticleId(), s.getErrorMessage(),
                    s.getCreatedAt());
        }
    }

    public record RunView(UUID id, SeoRunTrigger trigger, SeoRunStatus status, boolean skipped,
                          String currentStep, String currentKeyword, int keywordsProcessed,
                          int articlesPublished, Double costUsd, String error,
                          Instant createdAt, Instant startedAt, Instant finishedAt) {
        public static RunView from(SeoRun r) {
            return new RunView(r.getId(), r.getTrigger(), r.getStatus(), r.isSkipped(),
                    r.getCurrentStep(), r.getCurrentKeyword(), r.getKeywordsProcessed(),
                    r.getArticlesPublished(), r.getCostUsd(), r.getError(),
                    r.getCreatedAt(), r.getStartedAt(), r.getFinishedAt());
        }
    }
}
