package fr.hitechacademy.convention;

/**
 * Sort de la convention en cas de prise en charge partielle de l'OPCO : un
 * choix ferme est exigé à la création pour éviter le litige classique du
 * reliquat non prévu.
 */
public enum OpcoPartialMode {
    /** Le client s'engage à régler le reliquat restant à sa charge. */
    CLIENT_PAYS_REMAINDER,
    /** La condition suspensive est réputée non réalisée : convention caduque. */
    VOID_IF_PARTIAL
}
