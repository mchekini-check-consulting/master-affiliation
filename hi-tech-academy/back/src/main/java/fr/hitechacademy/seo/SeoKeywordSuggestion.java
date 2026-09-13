package fr.hitechacademy.seo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * Mot-clé proposé par la phase de recherche (agents 1+2) autour d'un mot-clé
 * pilier, avec ses métriques. L'admin en sélectionne 5 à 10 ; la phase de
 * rédaction (agents 3-4) produit ensuite un article par sélection.
 */
@Entity
@Table(name = "seo_keyword_suggestions")
public class SeoKeywordSuggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** Mot-clé pilier (seo_keywords) dont cette proposition est issue. */
    @Column(nullable = false)
    private UUID keywordId;

    @Column(nullable = false, length = 200)
    private String kw;

    @Column(nullable = false)
    private int volume = 0;

    @Column(nullable = false)
    private double cpc = 0;

    /** Compétition annonceurs 0-1. */
    @Column(nullable = false)
    private double competition = 0;

    /** Difficulté SEO 0-100. */
    @Column(nullable = false)
    private int kd = 0;

    @Column(nullable = false, length = 20)
    private String intent = "unknown";

    /** Tendance 12 mois (tableau JSON de volumes mensuels). */
    @Column(columnDefinition = "text")
    private String trend12m;

    @Column(nullable = false)
    private double gapScore = 0;

    /**
     * Score d'opportunité 0-100 calculé par l'agent : volume élevé,
     * concurrence et difficulté faibles. Nullable : colonne ajoutée après
     * les premières lignes (ddl-auto=update).
     */
    private Double score;

    /** Origine : seed | ideas | related | gap. */
    @Column(nullable = false, length = 10)
    private String source = "ideas";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeoSuggestionStatus status = SeoSuggestionStatus.SUGGESTED;

    /** Article rédigé pour cette proposition (statut written). */
    private UUID articleId;

    @Column(length = 1000)
    private String errorMessage;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }

    public UUID getKeywordId() { return keywordId; }
    public void setKeywordId(UUID keywordId) { this.keywordId = keywordId; }

    public String getKw() { return kw; }
    public void setKw(String kw) { this.kw = kw; }

    public int getVolume() { return volume; }
    public void setVolume(int volume) { this.volume = volume; }

    public double getCpc() { return cpc; }
    public void setCpc(double cpc) { this.cpc = cpc; }

    public double getCompetition() { return competition; }
    public void setCompetition(double competition) { this.competition = competition; }

    public int getKd() { return kd; }
    public void setKd(int kd) { this.kd = kd; }

    public String getIntent() { return intent; }
    public void setIntent(String intent) { this.intent = intent; }

    public String getTrend12m() { return trend12m; }
    public void setTrend12m(String trend12m) { this.trend12m = trend12m; }

    public double getGapScore() { return gapScore; }
    public void setGapScore(double gapScore) { this.gapScore = gapScore; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public SeoSuggestionStatus getStatus() { return status; }
    public void setStatus(SeoSuggestionStatus status) { this.status = status; }

    public UUID getArticleId() { return articleId; }
    public void setArticleId(UUID articleId) { this.articleId = articleId; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public Instant getCreatedAt() { return createdAt; }
}
