package fr.hitechacademy.registration;

public enum RegistrationStatus {
    /**
     * Formulaire envoyé mais questionnaire obligatoire (analyse du besoin ou
     * questionnaire commanditaire) non renseigné : la demande n'est pas encore
     * transmise à l'admin.
     */
    INCOMPLETE,
    PENDING,
    VALIDATED,
    REFUSED
}
