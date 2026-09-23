package fr.hitechacademy.registration;

import java.util.List;

/**
 * QCM de l'évaluation finale « Gérer et transformer les processus de travail
 * des équipes avec l'IA » (document « Évaluation finale – V1.0 » du
 * 23/09/2026, partie A — la partie B « atelier fil rouge » est évaluée par le
 * formateur pendant la séquence S9). Chaque objectif opérationnel (1 à 5) est
 * couvert par deux questions ; le corrigé (1-b, 2-c, 3-a, 4-d, 5-b, 6-d, 7-a,
 * 8-b, 9-c, 10-b) vit uniquement côté serveur.
 */
public final class FinalEvaluationManagementIaCatalog {

    private FinalEvaluationManagementIaCatalog() {
    }

    public static final List<FinalEvaluationCatalog.QcmQuestion> QUESTIONS = List.of(
            new FinalEvaluationCatalog.QcmQuestion(1,
                    "Quelle est la première étape d'une stratégie d'intégration responsable de l'IA dans une équipe ?",
                    List.of("Acheter des licences IA pour toute l'équipe",
                            "Cartographier les processus existants et analyser risques et opportunités",
                            "Interdire les outils grand public", "Recruter un data scientist"), 1),
            new FinalEvaluationCatalog.QcmQuestion(2,
                    "Un collaborateur souhaite coller la liste nominative de clients dans un chatbot IA public. La réaction conforme au RGPD est de…",
                    List.of("L'autoriser si cela fait gagner du temps",
                            "Retirer uniquement les noms de famille avant l'envoi",
                            "Interdire l'envoi de données personnelles vers un outil non validé et proposer un cadre conforme",
                            "L'autoriser en dehors des heures ouvrées"), 2),
            new FinalEvaluationCatalog.QcmQuestion(3,
                    "Pour reconfigurer un processus avec l'IA, la bonne répartition consiste à…",
                    List.of("Confier à l'IA les tâches répétitives à faible enjeu et garder la validation humaine sur les décisions",
                            "Automatiser l'intégralité du processus sans contrôle",
                            "Ne rien changer tant que l'équipe n'est pas experte",
                            "Confier à l'IA les décisions RH sensibles"), 0),
            new FinalEvaluationCatalog.QcmQuestion(4,
                    "Quel réflexe de conduite du changement pour déployer l'IA dans une équipe ?",
                    List.of("Imposer les nouveaux outils sans annonce", "Réserver les outils au manager",
                            "Attendre que tous soient experts avant de commencer",
                            "Impliquer l'équipe tôt, former et recueillir les retours"), 3),
            new FinalEvaluationCatalog.QcmQuestion(5,
                    "Un bon prompt professionnel contient…",
                    List.of("Une seule question courte sans contexte",
                            "Un rôle, un contexte, une tâche précise et un format de sortie attendu",
                            "Uniquement des mots-clés", "Le maximum de jargon technique"), 1),
            new FinalEvaluationCatalog.QcmQuestion(6,
                    "Le RAG (génération augmentée par récupération) sert à…",
                    List.of("Accélérer la connexion internet", "Générer des images plus réalistes",
                            "Chiffrer les données de l'entreprise",
                            "Appuyer les réponses de l'IA sur vos documents internes pour les fiabiliser"), 3),
            new FinalEvaluationCatalog.QcmQuestion(7,
                    "Avant de diffuser un compte rendu généré par l'IA, il faut…",
                    List.of("Le relire, vérifier les faits et l'adapter au destinataire",
                            "L'envoyer tel quel pour gagner du temps",
                            "Supprimer la mention des sources", "Le faire regénérer trois fois"), 0),
            new FinalEvaluationCatalog.QcmQuestion(8,
                    "Pour produire un tableau de bord d'équipe fiable avec l'IA…",
                    List.of("Laisser l'IA estimer les données manquantes",
                            "Partir de données vérifiées et faire valider les indicateurs par l'équipe",
                            "Multiplier les indicateurs pour être exhaustif",
                            "Masquer les sources pour simplifier"), 1),
            new FinalEvaluationCatalog.QcmQuestion(9,
                    "Comment suivre l'apport réel de l'IA sur un processus ?",
                    List.of("Se fier au ressenti général", "Compter le nombre de prompts envoyés",
                            "Définir des indicateurs avant/après (temps passé, qualité, satisfaction) et les mesurer dans la durée",
                            "Comparer avec une autre entreprise"), 2),
            new FinalEvaluationCatalog.QcmQuestion(10,
                    "En quoi consiste la veille IA d'un manager ?",
                    List.of("Tester chaque nouvel outil directement en production",
                            "Suivre les évolutions réglementaires et technologiques et ajuster les usages de l'équipe",
                            "Attendre les obligations légales", "Déléguer entièrement le sujet à la DSI"), 1));
}
