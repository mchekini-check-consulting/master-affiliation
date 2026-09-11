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
 * Mot-clé pilier choisi par l'admin. L'orchestrateur traite les mots-clés
 * to_process (veille → analyse → sélection → rédaction) et consigne le
 * résultat : done + article généré, ou error + message.
 */
@Entity
@Table(name = "seo_keywords")
public class SeoKeyword {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String keyword;

    /** Code localisation DataForSEO (2250 = France). */
    @Column(nullable = false)
    private int locationCode = 2250;

    @Column(nullable = false, length = 10)
    private String languageCode = "fr";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeoKeywordStatus status = SeoKeywordStatus.TO_PROCESS;

    /** Dernier message d'erreur remonté par l'orchestrateur. */
    @Column(length = 2000)
    private String errorMessage;

    /** Article généré pour ce mot-clé (renseigné par l'agent 4). */
    private UUID articleId;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    private Instant lastRunAt;

    public UUID getId() { return id; }

    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }

    public int getLocationCode() { return locationCode; }
    public void setLocationCode(int locationCode) { this.locationCode = locationCode; }

    public String getLanguageCode() { return languageCode; }
    public void setLanguageCode(String languageCode) { this.languageCode = languageCode; }

    public SeoKeywordStatus getStatus() { return status; }
    public void setStatus(SeoKeywordStatus status) { this.status = status; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public UUID getArticleId() { return articleId; }
    public void setArticleId(UUID articleId) { this.articleId = articleId; }

    public Instant getCreatedAt() { return createdAt; }

    public Instant getLastRunAt() { return lastRunAt; }
    public void setLastRunAt(Instant lastRunAt) { this.lastRunAt = lastRunAt; }
}
