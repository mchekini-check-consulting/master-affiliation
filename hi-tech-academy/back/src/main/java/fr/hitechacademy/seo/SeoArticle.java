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
 * Article rédigé par l'agent 4, en attente de validation par l'admin.
 * Les champs structurés (plan Hn, FAQ, schema.org, liens internes, audit)
 * sont stockés tels quels en JSON : le contrat vit côté agents, la base
 * n'a pas besoin de les interpréter.
 */
@Entity
@Table(name = "seo_articles")
public class SeoArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID keywordId;

    /** Copie du mot-clé pilier (affichage même si le mot-clé est supprimé). */
    @Column(nullable = false, length = 200)
    private String keyword;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(length = 500)
    private String metaDescription;

    @Column(length = 300)
    private String slug;

    /** Plan Hn cible (JSON). */
    @Column(columnDefinition = "text")
    private String hnOutline;

    /** Corps de l'article en Markdown. */
    @Column(columnDefinition = "text")
    private String bodyMd;

    /** Liens internes proposés (JSON). */
    @Column(columnDefinition = "text")
    private String internalLinks;

    /** FAQ de fin d'article (JSON). */
    @Column(columnDefinition = "text")
    private String faq;

    /** Données structurées Article + FAQPage (JSON-LD). */
    @Column(columnDefinition = "text")
    private String schemaOrg;

    /** Score de l'auto-audit de l'agent 4 (0-100). */
    private Integer auditScore;

    /** Problèmes relevés par l'auto-audit (JSON). */
    @Column(columnDefinition = "text")
    private String auditIssues;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeoArticleStatus status = SeoArticleStatus.TO_VALIDATE;

    /** Date de publication planifiée, modifiable par l'admin. */
    private Instant publishAt;

    /** URL de l'article une fois publié sur le site. */
    @Column(length = 500)
    private String cmsUrl;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    private Instant publishedAt;

    public UUID getId() { return id; }

    public UUID getKeywordId() { return keywordId; }
    public void setKeywordId(UUID keywordId) { this.keywordId = keywordId; }

    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMetaDescription() { return metaDescription; }
    public void setMetaDescription(String metaDescription) { this.metaDescription = metaDescription; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getHnOutline() { return hnOutline; }
    public void setHnOutline(String hnOutline) { this.hnOutline = hnOutline; }

    public String getBodyMd() { return bodyMd; }
    public void setBodyMd(String bodyMd) { this.bodyMd = bodyMd; }

    public String getInternalLinks() { return internalLinks; }
    public void setInternalLinks(String internalLinks) { this.internalLinks = internalLinks; }

    public String getFaq() { return faq; }
    public void setFaq(String faq) { this.faq = faq; }

    public String getSchemaOrg() { return schemaOrg; }
    public void setSchemaOrg(String schemaOrg) { this.schemaOrg = schemaOrg; }

    public Integer getAuditScore() { return auditScore; }
    public void setAuditScore(Integer auditScore) { this.auditScore = auditScore; }

    public String getAuditIssues() { return auditIssues; }
    public void setAuditIssues(String auditIssues) { this.auditIssues = auditIssues; }

    public SeoArticleStatus getStatus() { return status; }
    public void setStatus(SeoArticleStatus status) { this.status = status; }

    public Instant getPublishAt() { return publishAt; }
    public void setPublishAt(Instant publishAt) { this.publishAt = publishAt; }

    public String getCmsUrl() { return cmsUrl; }
    public void setCmsUrl(String cmsUrl) { this.cmsUrl = cmsUrl; }

    public Instant getCreatedAt() { return createdAt; }

    public Instant getPublishedAt() { return publishedAt; }
    public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }
}
