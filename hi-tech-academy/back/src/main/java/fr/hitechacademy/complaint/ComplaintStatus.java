package fr.hitechacademy.complaint;

public enum ComplaintStatus {
    /** Réclamation reçue, accusé de réception envoyé, non encore traitée. */
    RECEIVED,
    /** Analyse et traitement en cours. */
    IN_PROGRESS,
    /** Réponse apportée et réclamation clôturée. */
    CLOSED
}
