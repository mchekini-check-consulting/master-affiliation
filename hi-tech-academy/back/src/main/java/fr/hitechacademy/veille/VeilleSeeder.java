package fr.hitechacademy.veille;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import static fr.hitechacademy.veille.VeilleAxis.HANDICAP;
import static fr.hitechacademy.veille.VeilleAxis.INNOVATIONS;
import static fr.hitechacademy.veille.VeilleAxis.LEGALE;
import static fr.hitechacademy.veille.VeilleAxis.METIERS;

/**
 * Amorce le kanban de veille avec le tableau de suivi du document
 * « Plan de veille – V1.1 » (uniquement si la table est vide).
 */
@Component
public class VeilleSeeder implements ApplicationRunner {

    private final VeilleRepository repository;

    public VeilleSeeder(VeilleRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) {
            return;
        }
        record Seed(VeilleAxis axis, String date, String content) {
        }
        Seed[] seeds = {
                new Seed(LEGALE, "2026-01-12", "France Compétences – actualités : publication des orientations 2026 sur le CPF et annonce d'un plafonnement de mobilisation des droits pour certaines formations (loi de finances 2026)."),
                new Seed(INNOVATIONS, "2026-02-10", "Linux Foundation / CNCF – rappel du curriculum CKA en vigueur : Gateway API, Helm, Kustomize, CRD et operators intégrés au programme d'examen."),
                new Seed(LEGALE, "2026-02-25", "Légifrance – décret n° 2026-127 du 24/02/2026 : plafonnement de la mobilisation des droits CPF pour certaines formations et obligation de cofinancement pour les salariés (réforme CPF du 20/02/2026)."),
                new Seed(METIERS, "2026-03-09", "Analyse mensuelle d'offres d'emploi DevOps/Cloud (LinkedIn, WTTJ, Free-Work) : forte progression des demandes Platform Engineering, GitOps (ArgoCD) et exploitation de workloads IA sur Kubernetes (GPU)."),
                new Seed(INNOVATIONS, "2026-03-26", "KubeCon + CloudNativeCon Europe 2026 – suivi à distance des keynotes et publications : dominante IA (inférence sur Kubernetes, Dynamic Resource Allocation pour GPU, outillage d'IA d'assistance à l'exploitation type k8sgpt)."),
                new Seed(LEGALE, "2026-04-03", "Décret du 30/03/2026 : participation forfaitaire obligatoire CPF portée à 150 € au 02/04/2026 ; exonération en cas de dotation volontaire de l'employeur."),
                new Seed(HANDICAP, "2026-04-14", "Agefiph – actualisation 2026 des aides à la formation des personnes en situation de handicap ; ressources de la Ressource Handicap Formation (RHF) Île-de-France."),
                new Seed(METIERS, "2026-05-12", "CNCF / Linux Foundation – conditions de recertification CKA (validité 2 ans) et évolutions de l'examen (PSI, environnement d'examen)."),
                new Seed(LEGALE, "2026-05-26", "Ministère du Travail / DREETS – rappel de l'échéance de dépôt du Bilan Pédagogique et Financier (BPF)."),
                new Seed(INNOVATIONS, "2026-06-09", "Notes de version Kubernetes (dernière release stable) : sidecar containers, Dynamic Resource Allocation (DRA) et évolutions de l'API Gateway."),
                new Seed(HANDICAP, "2026-06-16", "Veille accessibilité numérique : recommandations RGAA appliquées aux supports de formation ; sous-titrage automatique (IA) des classes virtuelles Google Meet."),
                new Seed(LEGALE, "2026-06-30", "Veille facturation électronique (réforme au 01/09/2026 pour les grandes entreprises) : impacts pour les OF travaillant avec de grands comptes et les OPCO."),
                new Seed(METIERS, "2026-07-07", "Documentation Kubernetes + blogs DevOps (CNCF blog, Learnk8s) : montée en puissance des compétences « exploitation de LLM sur Kubernetes » (serving, GPU scheduling, observabilité des workloads IA)."),
        };
        Map<VeilleAxis, Integer> positions = new HashMap<>();
        for (Seed s : seeds) {
            VeilleItem item = new VeilleItem();
            item.setAxis(s.axis());
            item.setEntryDate(LocalDate.parse(s.date()));
            item.setContent(s.content());
            item.setPosition(positions.merge(s.axis(), 1, Integer::sum) - 1);
            repository.save(item);
        }
    }
}
