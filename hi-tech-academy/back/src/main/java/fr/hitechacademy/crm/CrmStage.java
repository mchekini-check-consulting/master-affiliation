package fr.hitechacademy.crm;

/**
 * Colonnes du kanban CRM : parcours d'un prospect, du premier contact au
 * sort de son dossier de financement.
 */
public enum CrmStage {
    TO_CONTACT,      // à contacter
    CONTACTED,       // contacté
    VALIDATED,       // validé (prospect qualifié)
    REJECTED,        // rejeté (pas de suite)
    FILE_SUBMITTED,  // dossier déposé (OPCO / financeur)
    FILE_VALIDATED,  // dossier validé
    FILE_REFUSED     // dossier refusé
}
