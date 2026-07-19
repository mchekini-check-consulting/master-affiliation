package fr.hitechacademy.registration;

import java.util.List;

/**
 * Contenu du test de positionnement Kubernetes (document « Test de
 * positionnement – V1.0 » du 21/06/2026). Les bonnes réponses vivent
 * uniquement ici, côté serveur : l'endpoint public expose les questions
 * sans l'index de la bonne réponse, la correction se fait à la soumission.
 * L'ordre des options a été mélangé par rapport au PDF (où la bonne
 * réponse était toujours en premier).
 */
public final class PositioningTestCatalog {

    private PositioningTestCatalog() {
    }

    public record QcmQuestion(int id, String section, String text, List<String> options, int correctIndex) {
    }

    public static final List<String> SELF_LEVELS = List.of(
            "Débutant (je n'ai jamais utilisé Kubernetes)",
            "Notions (j'en ai entendu parler / quelques essais)",
            "Intermédiaire (je l'ai déjà utilisé ponctuellement)");

    public static final List<String> KNOWN_TERMS = List.of(
            "Pod",
            "Deployment",
            "Service / Ingress",
            "ConfigMap / Secret",
            "DaemonSet / StatefulSet");

    public static final List<QcmQuestion> QUESTIONS = List.of(
            new QcmQuestion(1, "Prérequis — Linux",
                    "Quelle commande liste le contenu d'un répertoire ?",
                    List.of("cd", "ls", "rm", "grep"), 1),
            new QcmQuestion(2, "Prérequis — Linux",
                    "Quelle commande affiche le contenu d'un fichier texte ?",
                    List.of("mkdir", "chmod", "cat", "ping"), 2),
            new QcmQuestion(3, "Prérequis — Linux",
                    "À quoi sert la commande chmod ?",
                    List.of("Changer de répertoire", "Modifier les droits d'un fichier",
                            "Supprimer un fichier", "Afficher les processus"), 1),
            new QcmQuestion(4, "Prérequis — Docker / conteneurs",
                    "Qu'est-ce qu'une image Docker ?",
                    List.of("Un serveur physique", "Un fichier de log",
                            "Un modèle servant à créer des conteneurs", "Un réseau virtuel"), 2),
            new QcmQuestion(5, "Prérequis — Docker / conteneurs",
                    "Quelle commande lance un conteneur ?",
                    List.of("docker build", "docker run", "docker rm", "docker pull"), 1),
            new QcmQuestion(6, "Prérequis — Docker / conteneurs",
                    "Un conteneur partage le noyau de l'hôte. Vrai ou faux ?",
                    List.of("Vrai", "Faux"), 0));
}
