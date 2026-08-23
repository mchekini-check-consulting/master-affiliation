package fr.hitechacademy.billing;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.math.BigDecimal;

/** Ligne de prestation d'un devis ou d'une facture (montants unitaires HT). */
@Embeddable
public class BillingLine {

    @Column(nullable = false, length = 500)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPriceHt;

    /** Taux de TVA en pourcentage (20.00 par défaut pour l'organisme). */
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal vatRate;

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    public BigDecimal getUnitPriceHt() { return unitPriceHt; }
    public void setUnitPriceHt(BigDecimal unitPriceHt) { this.unitPriceHt = unitPriceHt; }

    public BigDecimal getVatRate() { return vatRate; }
    public void setVatRate(BigDecimal vatRate) { this.vatRate = vatRate; }
}
