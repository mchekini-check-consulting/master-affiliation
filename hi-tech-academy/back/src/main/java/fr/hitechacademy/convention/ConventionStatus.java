package fr.hitechacademy.convention;

/** Cycle de vie d'une convention de formation. */
public enum ConventionStatus {
    /** Créée dans l'admin, pas encore partie en signature. */
    DRAFT,
    /** Demande de signature Yousign active, en attente des signataires. */
    SENT,
    /** Signée par les deux parties ; le document signé est archivé. */
    SIGNED,
    /** Refusée par un signataire. */
    DECLINED,
    /** Demande de signature expirée chez Yousign. */
    EXPIRED,
    /** Annulée depuis l'admin. */
    CANCELED
}
