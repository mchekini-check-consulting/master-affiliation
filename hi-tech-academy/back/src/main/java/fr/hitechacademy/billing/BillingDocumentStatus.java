package fr.hitechacademy.billing;

/**
 * Cycle de vie d'un document. Un devis passe par ISSUED → SENT → ACCEPTED /
 * REFUSED ; une facture par ISSUED → SENT → PAID. Une facture émise ne se
 * supprime jamais (obligation de numérotation continue) : en cas d'erreur,
 * on émet un avoir ou une facture rectificative.
 */
public enum BillingDocumentStatus {
    ISSUED,
    SENT,
    ACCEPTED,
    REFUSED,
    PAID
}
