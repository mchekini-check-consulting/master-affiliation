package fr.hitechacademy.billing;

/** Nature du document de facturation. */
public enum BillingDocumentType {
    /** Devis (proposition commerciale, numérotation DE-AAAA-NNNN). */
    QUOTE,
    /** Facture (numérotation FA-AAAA-NNNN, séquentielle et sans trou). */
    INVOICE
}
