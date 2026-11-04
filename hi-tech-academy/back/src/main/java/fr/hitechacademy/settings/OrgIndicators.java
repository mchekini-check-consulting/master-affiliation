package fr.hitechacademy.settings;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Indicateurs de résultats globaux de l'organisme (Qualiopi, indicateur 2) :
 * taux de satisfaction et de recommandation toutes formations confondues,
 * avec leur base de mesure (période, nombre de répondants). Table à une seule
 * ligne ; les conventions copient ces valeurs à leur création pour que les
 * documents émis restent figés quand les taux évoluent.
 */
@Entity
@Table(name = "org_indicators")
public class OrgIndicators {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(precision = 5, scale = 2)
    private BigDecimal satisfactionRate;

    @Column(precision = 5, scale = 2)
    private BigDecimal recommendationRate;

    /** Base de mesure, ex. « toutes formations confondues, sessions 2026, 14 répondants ». */
    @Column(length = 300)
    private String basis;

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    public UUID getId() { return id; }
    public BigDecimal getSatisfactionRate() { return satisfactionRate; }
    public void setSatisfactionRate(BigDecimal satisfactionRate) { this.satisfactionRate = satisfactionRate; }
    public BigDecimal getRecommendationRate() { return recommendationRate; }
    public void setRecommendationRate(BigDecimal recommendationRate) { this.recommendationRate = recommendationRate; }
    public String getBasis() { return basis; }
    public void setBasis(String basis) { this.basis = basis; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
