package fr.hitechacademy.archive;

/** Nature du document archivé. */
public enum ArchivedPdfKind {
    /** Certificat de réalisation envoyé à l'apprenant. */
    CERTIFICATE,
    /** Corrigé du QCM d'évaluation finale envoyé à l'apprenant. */
    FINAL_EVALUATION_CORRECTION,
    /** Devis envoyé au client. */
    QUOTE,
    /** Facture envoyée au client. */
    INVOICE
}
