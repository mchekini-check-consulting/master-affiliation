package fr.hitechacademy.registration;

import java.util.List;

/**
 * Contenu du test de positionnement « Facturation électronique &amp; Pennylane »
 * (document « Test de positionnement – V1.0 » du 09/09/2026). La formation est
 * sans prérequis : le test sert d'état des lieux (niveau d'entrée) pour adapter
 * la session, pas de filtre. Les bonnes réponses vivent uniquement ici, côté
 * serveur ; l'ordre des options est mélangé.
 */
public final class PositioningTestPennylaneCatalog {

    private PositioningTestPennylaneCatalog() {
    }

    public static final List<String> SELF_LEVELS = List.of(
            "Débutant (je découvre la réforme)",
            "Notions (j'en ai entendu parler / commencé à me renseigner)",
            "Intermédiaire (mise en conformité entamée ou usage ponctuel de Pennylane)");

    public static final List<String> KNOWN_TERMS = List.of(
            "E-invoicing",
            "E-reporting",
            "Factur-X",
            "Plateforme Agréée (ex-PDP)",
            "Annuaire central");

    public static final List<PositioningTestCatalog.QcmQuestion> QUESTIONS = List.of(
            new PositioningTestCatalog.QcmQuestion(1, "Votre facturation aujourd'hui",
                    "Parmi ces éléments, lequel est obligatoire sur toute facture ?",
                    List.of("Le logo de l'entreprise", "Un numéro unique et séquentiel",
                            "L'IBAN du client", "La signature manuscrite"), 1),
            new PositioningTestCatalog.QcmQuestion(2, "Votre facturation aujourd'hui",
                    "La TVA que vous facturez à vos clients est...",
                    List.of("De la TVA déductible", "Un revenu de l'entreprise",
                            "De la TVA collectée, à reverser à l'État", "Une taxe facultative"), 2),
            new PositioningTestCatalog.QcmQuestion(3, "Votre facturation aujourd'hui",
                    "Combien de temps une facture doit-elle être conservée ?",
                    List.of("1 an", "3 ans", "Jusqu'au paiement", "10 ans"), 3),
            new PositioningTestCatalog.QcmQuestion(4, "La réforme : premières notions",
                    "À partir de septembre 2026, toutes les entreprises devront pouvoir...",
                    List.of("Émettre uniquement des factures papier", "Recevoir des factures électroniques",
                            "Payer leurs factures en ligne", "Tenir leur comptabilité sans expert-comptable"), 1),
            new PositioningTestCatalog.QcmQuestion(5, "La réforme : premières notions",
                    "Une facture PDF envoyée par e-mail est-elle une « facture électronique » au sens de la réforme ?",
                    List.of("Oui, toujours", "Oui, si elle est signée électroniquement",
                            "Non : il faut un format structuré transitant par une plateforme",
                            "Oui, si le client l'accepte"), 2),
            new PositioningTestCatalog.QcmQuestion(6, "La réforme : premières notions",
                    "L'e-reporting consiste à...",
                    List.of("Envoyer ses factures par e-mail",
                            "Déclarer ses ventes B2C et internationales à l'administration",
                            "Publier ses comptes annuels", "Archiver ses factures en ligne"), 1));
}
