package fr.hitechacademy.registration;

import java.util.List;

/**
 * QCM de l'évaluation finale Kubernetes (document « Évaluation finale –
 * V1.0 » du 21/06/2026, partie A — la partie B « mise en pratique » est
 * évaluée par le formateur pendant la session). Ordre des questions et des
 * options identique au document officiel ; le corrigé (1-a, 2-b, 3-b, 4-b,
 * 5-b, 6-a, 7-b, 8-a, 9-b, 10-a) vit uniquement côté serveur.
 */
public final class FinalEvaluationCatalog {

    private FinalEvaluationCatalog() {
    }

    public record QcmQuestion(int id, String text, List<String> options, int correctIndex) {
    }

    public static final List<QcmQuestion> QUESTIONS = List.of(
            new QcmQuestion(1, "Kubernetes permet avant tout :",
                    List.of("D'orchestrer des conteneurs", "De compiler des images",
                            "De gérer un seul serveur", "De remplacer Linux"), 0),
            new QcmQuestion(2, "Le composant qui stocke l'état du cluster est :",
                    List.of("kubelet", "etcd", "Ingress", "Service"), 1),
            new QcmQuestion(3, "Sur chaque nœud, le composant qui fait tourner les conteneurs est :",
                    List.of("etcd", "kubelet", "scheduler", "API server"), 1),
            new QcmQuestion(4, "La plus petite unité déployable dans Kubernetes est :",
                    List.of("Le conteneur", "Le Pod", "Le Deployment", "Le Node"), 1),
            new QcmQuestion(5, "La ressource qui assure réplication et rolling update est :",
                    List.of("Pod", "Deployment", "Secret", "ConfigMap"), 1),
            new QcmQuestion(6, "Pour rendre une application joignable à l'intérieur du cluster, on utilise par défaut :",
                    List.of("Un Service ClusterIP", "Un Ingress", "Un Secret", "Un Volume"), 0),
            new QcmQuestion(7, "Pour exposer une application en HTTP avec routage par chemin :",
                    List.of("ClusterIP", "Ingress", "DaemonSet", "Node"), 1),
            new QcmQuestion(8, "Pour externaliser une configuration non sensible :",
                    List.of("ConfigMap", "Secret", "Service", "Ingress"), 0),
            new QcmQuestion(9, "Les données sensibles (mots de passe, clés) se stockent dans :",
                    List.of("ConfigMap", "Secret", "Ingress", "Pod"), 1),
            new QcmQuestion(10, "Pour lister les pods d'un namespace :",
                    List.of("kubectl get pods", "kubectl run list", "docker ps", "kubectl nodes"), 0));
}
