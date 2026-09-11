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
 * Journal des exécutions du pipeline. Une ligne requested est créée par le
 * bouton « Lancer l'agent » de l'admin ; l'orchestrateur la réclame puis met
 * à jour l'étape courante (affichée en direct dans l'admin) et les compteurs.
 */
@Entity
@Table(name = "seo_runs")
public class SeoRun {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "trigger_type", nullable = false)
    private SeoRunTrigger trigger = SeoRunTrigger.CRON;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeoRunStatus status = SeoRunStatus.REQUESTED;

    /** Run court-circuité car l'agent était désactivé. */
    @Column(nullable = false)
    private boolean skipped = false;

    /** Étape en cours, affichée dans l'admin (ex. « Agent 2 — analyse volumes »). */
    @Column(length = 300)
    private String currentStep;

    /** Mot-clé en cours de traitement. */
    @Column(length = 200)
    private String currentKeyword;

    @Column(nullable = false)
    private int keywordsProcessed = 0;

    @Column(nullable = false)
    private int articlesPublished = 0;

    /** Coût DataForSEO cumulé du run (somme des champs cost des réponses). */
    private Double costUsd;

    @Column(length = 2000)
    private String error;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    private Instant startedAt;

    private Instant finishedAt;

    public UUID getId() { return id; }

    public SeoRunTrigger getTrigger() { return trigger; }
    public void setTrigger(SeoRunTrigger trigger) { this.trigger = trigger; }

    public SeoRunStatus getStatus() { return status; }
    public void setStatus(SeoRunStatus status) { this.status = status; }

    public boolean isSkipped() { return skipped; }
    public void setSkipped(boolean skipped) { this.skipped = skipped; }

    public String getCurrentStep() { return currentStep; }
    public void setCurrentStep(String currentStep) { this.currentStep = currentStep; }

    public String getCurrentKeyword() { return currentKeyword; }
    public void setCurrentKeyword(String currentKeyword) { this.currentKeyword = currentKeyword; }

    public int getKeywordsProcessed() { return keywordsProcessed; }
    public void setKeywordsProcessed(int keywordsProcessed) { this.keywordsProcessed = keywordsProcessed; }

    public int getArticlesPublished() { return articlesPublished; }
    public void setArticlesPublished(int articlesPublished) { this.articlesPublished = articlesPublished; }

    public Double getCostUsd() { return costUsd; }
    public void setCostUsd(Double costUsd) { this.costUsd = costUsd; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public Instant getCreatedAt() { return createdAt; }

    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }

    public Instant getFinishedAt() { return finishedAt; }
    public void setFinishedAt(Instant finishedAt) { this.finishedAt = finishedAt; }
}
