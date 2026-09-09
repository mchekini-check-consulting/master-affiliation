package fr.hitechacademy.registration;

import java.util.List;

/**
 * QCM de l'évaluation finale « Facturation électronique &amp; Pennylane »
 * (document « Évaluation finale – V1.0 » du 09/09/2026, partie A — la partie B
 * « atelier fil rouge » est évaluée par le formateur pendant la session).
 * Chaque objectif opérationnel du programme est couvert par au moins une
 * question ; le corrigé vit uniquement côté serveur.
 */
public final class FinalEvaluationPennylaneCatalog {

    private FinalEvaluationPennylaneCatalog() {
    }

    public static final List<FinalEvaluationCatalog.QcmQuestion> QUESTIONS = List.of(
            new FinalEvaluationCatalog.QcmQuestion(1,
                    "Une facture PDF envoyée par e-mail est-elle conforme à la réforme de la facturation électronique ?",
                    List.of("Oui, c'est une facture électronique",
                            "Non : il faut un format structuré transmis via une plateforme",
                            "Oui, si elle est imprimée puis scannée", "Oui, si le client est d'accord"), 1),
            new FinalEvaluationCatalog.QcmQuestion(2,
                    "Quel format combine un PDF lisible et des données structurées ?",
                    List.of("UBL", "CII", "Factur-X", "XML brut"), 2),
            new FinalEvaluationCatalog.QcmQuestion(3,
                    "Le « schéma en Y » décrit...",
                    List.of("La circulation des factures entre plateformes et administration fiscale",
                            "L'organigramme de la DGFiP", "Le circuit de validation interne d'une facture",
                            "La structure d'un fichier Factur-X"), 0),
            new FinalEvaluationCatalog.QcmQuestion(4,
                    "L'annuaire central sert à...",
                    List.of("Publier les tarifs des plateformes",
                            "Identifier la plateforme de réception de chaque entreprise",
                            "Lister les entreprises en défaut de paiement",
                            "Stocker les factures de toutes les entreprises"), 1),
            new FinalEvaluationCatalog.QcmQuestion(5,
                    "En septembre 2026, l'obligation qui s'applique à toutes les entreprises est...",
                    List.of("Émettre toutes leurs factures en électronique",
                            "Pouvoir recevoir des factures électroniques",
                            "Changer d'expert-comptable", "Déposer leurs comptes chaque mois"), 1),
            new FinalEvaluationCatalog.QcmQuestion(6,
                    "L'e-reporting concerne...",
                    List.of("Les factures entre entreprises françaises uniquement",
                            "Les ventes B2C et à l'international", "Les fiches de paie",
                            "Les déclarations sociales"), 1),
            new FinalEvaluationCatalog.QcmQuestion(7,
                    "Une facture au statut « refusée » signifie que...",
                    List.of("L'administration l'a bloquée définitivement",
                            "La banque a rejeté le paiement",
                            "Le client l'a refusée : il faut la corriger et la réémettre",
                            "Elle est en attente de validation"), 2),
            new FinalEvaluationCatalog.QcmQuestion(8,
                    "Dans Pennylane, le circuit type pour facturer un client est...",
                    List.of("Facture Word envoyée par e-mail",
                            "Devis → facture → envoi via la plateforme, suivi des statuts",
                            "Saisie directe dans le logiciel du cabinet", "Export PDF puis courrier postal"), 1),
            new FinalEvaluationCatalog.QcmQuestion(9,
                    "Pennylane est immatriculée auprès de la DGFiP comme...",
                    List.of("Banque en ligne", "Plateforme Agréée", "Cabinet d'expertise comptable",
                            "Opérateur de paiement"), 1),
            new FinalEvaluationCatalog.QcmQuestion(10,
                    "Le rapprochement bancaire dans Pennylane consiste à...",
                    List.of("Négocier les frais bancaires",
                            "Associer les transactions bancaires aux factures et justificatifs",
                            "Virer la TVA à l'État", "Clôturer l'exercice comptable"), 1));
}
