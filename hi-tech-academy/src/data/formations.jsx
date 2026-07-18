import React from 'react';
import { Clock, Monitor, Euro, Users, CalendarClock, Award } from 'lucide-react';

// Catalogue des formations. Pour ajouter une formation : ajouter une entrée
// ici (carte + infos réglementaires Qualiopi + PDF du programme dans
// public/documents/), rien d'autre à modifier. La demande d'inscription se
// fait sur /inscription/<id> (formulaire interne, stocké en base).
export const formations = [
  {
    id: 'kubernetes-fondamentaux',
    tag: 'Infrastructure & Cloud',
    title: 'Kubernetes – Fondamentaux',
    description:
      "Maîtrisez le déploiement d'applications conteneurisées avec Kubernetes en une journée : architecture d'un cluster, Pods et Deployments, Services (survol d'Ingress), ConfigMaps et Secrets — avec travaux pratiques sur un cluster Azure (AKS) réel.",
    image: '/images/0002848c7_istock-2177184303.jpg',
    version: 'Programme V1.0 du 21/06/2026',
    pdf: '/documents/Programme_Kubernetes_Fondamentaux_V1.0.pdf',
    keyFacts: [
      { icon: Clock, label: 'Durée', value: '7 h — 1 journée (9 h–12 h 30 / 13 h 30–17 h)' },
      { icon: Monitor, label: 'Modalité', value: '100 % à distance (classe virtuelle Google Meet)' },
      { icon: Euro, label: 'Tarif', value: '1 000 € HT (1 200 € TTC) / stagiaire — forfait 7 h' },
      { icon: CalendarClock, label: "Délai d'accès", value: '1 jour minimum entre la demande et le début' },
      { icon: Users, label: 'Effectif', value: 'À partir de 1 participant' },
      { icon: Award, label: 'Sanction', value: 'Attestation de fin de formation' },
    ],
    qualiopiSections: [
      {
        id: 'public-prerequis',
        title: 'Public visé et prérequis',
        content: (
          <>
            <p className="mb-2">
              <strong>Public concerné :</strong> développeurs, administrateurs systèmes et réseaux, ingénieurs
              DevOps / Cloud, techniciens et architectes IT souhaitant déployer des applications
              conteneurisées avec Kubernetes.
            </p>
            <p className="mb-1"><strong>Prérequis :</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Maîtrise des bases de la ligne de commande Linux (navigation, édition de fichiers, droits).</li>
              <li>Connaissance des fondamentaux des conteneurs et de Docker (images, conteneurs, registre).</li>
            </ul>
            <p className="mt-2">Les prérequis sont vérifiés à l'entrée via un test de positionnement.</p>
          </>
        ),
      },
      {
        id: 'objectifs',
        title: 'Objectifs opérationnels et évaluables',
        content: (
          <>
            <p className="mb-2">À l'issue de la formation, le participant sera capable de :</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Expliquer le rôle de Kubernetes dans le cycle de vie d'une application conteneurisée et décrire l'architecture d'un cluster (control plane, nœuds).</li>
              <li>Déployer une application conteneurisée avec des Pods et des Deployments, via manifestes YAML et kubectl.</li>
              <li>Exposer une application avec un Service et identifier les cas d'usage du routage HTTP avec Ingress.</li>
              <li>Externaliser la configuration et les données sensibles d'une application via ConfigMap et Secrets.</li>
            </ol>
          </>
        ),
      },
      {
        id: 'methodes',
        title: 'Méthodes et moyens mobilisés',
        content: (
          <ul className="list-disc pl-5 space-y-1">
            <li>Alternance d'apports théoriques et de mises en pratique ; démonstrations en direct et travaux pratiques guidés sur cluster réel.</li>
            <li>Classe virtuelle synchrone Google Meet (caméra, partage d'écran, suivi de connexion).</li>
            <li>Cluster Kubernetes managé Microsoft Azure (AKS), avec un espace de noms dédié par stagiaire ; kubectl et manifestes YAML de travaux pratiques.</li>
            <li>Support de cours, fiches de commandes, énoncés et corrigés des TP téléchargeables sur l'espace de la formation.</li>
          </ul>
        ),
      },
      {
        id: 'evaluation',
        title: "Modalités d'évaluation et de suivi",
        content: (
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Avant :</strong> questionnaire d'analyse du besoin et des attentes ; test de positionnement (prérequis).</li>
            <li><strong>Pendant :</strong> travaux pratiques corrigés, émargement par demi-journée et rapport de connexion Google Meet.</li>
            <li><strong>En fin de formation :</strong> évaluation finale des acquis (QCM + mise en pratique) en fin de journée, questionnaires de satisfaction à chaud puis à froid, attestation de fin de formation.</li>
          </ul>
        ),
      },
      {
        id: 'acces',
        title: "Modalités et délais d'accès",
        content: (
          <ul className="list-disc pl-5 space-y-1">
            <li>Inscription par e-mail (<a href="mailto:contact@hi-techacademy.fr" className="underline">contact@hi-techacademy.fr</a>), téléphone (<a href="tel:+33751474135" className="underline">07 51 47 41 35</a>) ou via le formulaire de contact du site.</li>
            <li>Délai d'accès : 1 jour minimum entre la demande et le début de la formation (hors prise en charge financeur).</li>
            <li>Ouverture de la session à partir de 1 participant.</li>
          </ul>
        ),
      },
      {
        id: 'handicap',
        title: 'Accessibilité aux personnes en situation de handicap',
        content: (
          <>
            <p className="mb-2">
              Nos formations à distance peuvent être adaptées aux personnes en situation de handicap. Lors de
              l'inscription, le référent handicap étudie avec le candidat les aménagements nécessaires et mobilise
              si besoin son réseau de partenaires.
            </p>
            <p>
              <strong>Référent handicap :</strong> Mahdi CHEKINI — <a href="mailto:contact@hi-techacademy.fr" className="underline">contact@hi-techacademy.fr</a> — <a href="tel:+33751474135" className="underline">07 51 47 41 35</a>
            </p>
          </>
        ),
      },
      {
        id: 'indicateurs',
        title: 'Indicateurs de résultats',
        content: (
          <p>
            Hi-Tech Academy est nouvel entrant pour cette action de formation. Les indicateurs de résultats
            (taux de satisfaction, atteinte des objectifs, assiduité) sont mis en place dès la première session
            et publiés sur cette page.
          </p>
        ),
      },
    ],
  },
];

export function getFormationById(id) {
  return formations.find((f) => f.id === id);
}
