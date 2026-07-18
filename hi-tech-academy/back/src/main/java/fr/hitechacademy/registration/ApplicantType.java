package fr.hitechacademy.registration;

/**
 * Profil du demandeur, comme sur le formulaire Qualiobee :
 * - COMPANY      : « Je suis une entreprise » (la formation est pour ses salariés)
 * - INDEPENDENT  : « Je suis un indépendant » (entreprise dont le président/gérant est l'apprenant)
 * - INDIVIDUAL   : « Je suis un particulier »
 */
public enum ApplicantType {
    COMPANY,
    INDEPENDENT,
    INDIVIDUAL
}
