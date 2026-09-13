package fr.hitechacademy.crm;

/** Type d'une entrée de l'historique d'un contact CRM. */
public enum CrmActivityType {
    NOTE,           // note libre
    CALL,           // appel téléphonique
    EMAIL,          // échange email
    SMS,            // SMS / WhatsApp
    MEETING,        // rendez-vous / visio
    STAGE_CHANGE    // déplacement de colonne (tracé automatiquement)
}
