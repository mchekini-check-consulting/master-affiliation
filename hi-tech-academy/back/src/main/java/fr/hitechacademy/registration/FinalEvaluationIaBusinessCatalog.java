package fr.hitechacademy.registration;

import java.util.List;

/**
 * QCM de l'évaluation finale « IA for Business » (document « Évaluation
 * finale – V1.0 » du 09/09/2026, partie A — la partie B « projet fil rouge :
 * micro-business lancé pendant la formation » est évaluée par le formateur).
 * Chaque objectif opérationnel du programme est couvert par deux questions ;
 * le corrigé vit uniquement côté serveur.
 */
public final class FinalEvaluationIaBusinessCatalog {

    private FinalEvaluationIaBusinessCatalog() {
    }

    public static final List<FinalEvaluationCatalog.QcmQuestion> QUESTIONS = List.of(
            new FinalEvaluationCatalog.QcmQuestion(1,
                    "L'état d'esprit « AI-first » consiste à...",
                    List.of("Acheter tous les nouveaux outils IA",
                            "Penser processus avant outils",
                            "Remplacer toute son équipe par des IA",
                            "Coder ses propres modèles"), 1),
            new FinalEvaluationCatalog.QcmQuestion(2,
                    "Agent, chatbot, automatisation : l'agent se distingue car...",
                    List.of("Il répond plus vite",
                            "Il poursuit un objectif en enchaînant des actions, avec validation humaine",
                            "Il ne fait que suivre un scénario fixe",
                            "Il est réservé aux grandes entreprises"), 1),
            new FinalEvaluationCatalog.QcmQuestion(3,
                    "Pour valider une idée de business en quelques jours, on privilégie...",
                    List.of("Développer le produit complet d'abord",
                            "Attendre d'avoir un business plan de 50 pages",
                            "Une landing page de test et une étude de marché express avant d'investir",
                            "Demander uniquement l'avis de ses proches"), 2),
            new FinalEvaluationCatalog.QcmQuestion(4,
                    "Un ICP (Ideal Customer Profile) est...",
                    List.of("Le profil du client idéal",
                            "Un indicateur comptable", "Un format de facture électronique",
                            "Un type de contrat de travail"), 0),
            new FinalEvaluationCatalog.QcmQuestion(5,
                    "Créer son site web sans développeur...",
                    List.of("Est impossible pour un usage professionnel",
                            "N'existe qu'en anglais",
                            "Nécessite d'apprendre à coder",
                            "Est possible avec les outils de génération IA"), 3),
            new FinalEvaluationCatalog.QcmQuestion(6,
                    "Un « service productisé » est...",
                    List.of("Un produit physique en boutique",
                            "Un service standardisé vendu comme un produit (périmètre et prix fixes)",
                            "Un abonnement logiciel", "Un service gratuit"), 1),
            new FinalEvaluationCatalog.QcmQuestion(7,
                    "Le cold outreach (prospection à froid) à grande échelle...",
                    List.of("Est interdit dans tous les cas",
                            "Peut se faire sans aucune contrainte",
                            "Doit respecter le RGPD (base légale, opt-out) sous peine de sanctions",
                            "Ne concerne que les grandes entreprises"), 2),
            new FinalEvaluationCatalog.QcmQuestion(8,
                    "Un agent commercial installé sur son site sert à...",
                    List.of("Remplacer définitivement tout contact humain",
                            "Afficher de la publicité",
                            "Répondre et qualifier les visiteurs 24h/24, avec escalade vers l'humain",
                            "Bloquer les concurrents"), 2),
            new FinalEvaluationCatalog.QcmQuestion(9,
                    "Un agent SAV « branché en RAG »...",
                    List.of("Répond à partir de votre base de connaissances, avec sources",
                            "Invente les réponses les plus plausibles",
                            "Transfère systématiquement tous les tickets",
                            "Ne fonctionne que par téléphone"), 0),
            new FinalEvaluationCatalog.QcmQuestion(10,
                    "Le ROI d'une automatisation se juge en...",
                    List.of("Comptant le nombre d'outils utilisés",
                            "Automatisant tout ce qui est possible",
                            "Suivant la mode des outils du moment",
                            "Comparant le temps et le coût économisés au coût de mise en place"), 3));
}
