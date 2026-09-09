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
            <li>
              Avant l'entrée en formation, chaque apprenant reçoit le{' '}
              <a href="/documents/qualiopi/Livret_accueil_V1.0.pdf" target="_blank" rel="noopener noreferrer" className="underline">
                livret d'accueil (PDF)
              </a>{' '}
              et le{' '}
              <a href="/documents/qualiopi/Reglement_interieur_V1.0.pdf" target="_blank" rel="noopener noreferrer" className="underline">
                règlement intérieur (PDF)
              </a>.
            </li>
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
            <p className="mb-2">
              <strong>Référent handicap :</strong> Mahdi CHEKINI — <a href="mailto:contact@hi-techacademy.fr" className="underline">contact@hi-techacademy.fr</a> — <a href="tel:+33751474135" className="underline">07 51 47 41 35</a>
            </p>
            <p>
              <a href="/documents/qualiopi/Accessibilite_handicap_V1.0.pdf" target="_blank" rel="noopener noreferrer" className="underline">
                Consulter notre politique d'accessibilité (PDF)
              </a>
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
  {
    id: 'facturation-electronique-pennylane',
    tag: 'Gestion & Comptabilité',
    description:
      "Comprenez la réforme de la facturation électronique (e-invoicing, e-reporting, calendrier 2026-2027), mettez votre entreprise en conformité et maîtrisez Pennylane au quotidien — factures conformes, fournisseurs, banque, trésorerie, collaboration avec votre cabinet — avec ateliers pratiques en environnement de démonstration.",
    title: 'Facturation électronique & Pennylane',
    image: '/images/facturation-electronique-pennylane.jpg',
    version: 'Programme V1.0 du 09/09/2026',
    pdf: '/documents/Programme_Facturation_Electronique_Pennylane_V1.0.pdf',
    keyFacts: [
      { icon: Clock, label: 'Durée', value: '14 h — 2 jours (9 h–12 h 30 / 13 h 30–17 h)' },
      { icon: Monitor, label: 'Modalité', value: '100 % à distance (classe virtuelle Google Meet)' },
      { icon: Euro, label: 'Tarif', value: '2 200 € HT (2 640 € TTC) / stagiaire — forfait 14 h' },
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
              <strong>Public concerné :</strong> dirigeants de TPE/PME, indépendants et micro-entrepreneurs,
              assistants de gestion — notamment clients de cabinets d'expertise comptable — souhaitant
              se préparer à la réforme de la facturation électronique et utiliser Pennylane au quotidien.
            </p>
            <p className="mb-1"><strong>Prérequis :</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Aucun — formation non technique.</li>
              <li>Usage basique d'un ordinateur et d'un navigateur web.</li>
            </ul>
            <p className="mt-2">
              Un test de positionnement est réalisé à l'entrée : il sert d'état des lieux pour adapter
              la session au niveau des participants (il n'est pas éliminatoire).
            </p>
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
              <li>Expliquer les principes de la réforme de la facturation électronique : e-invoicing / e-reporting, formats structurés (Factur-X, UBL, CII), schéma en Y, annuaire central, statuts de facture et calendrier 2026-2027.</li>
              <li>Identifier les obligations applicables à sa propre entreprise (périmètre, e-reporting, sanctions) et établir son plan de mise en conformité : choix de la Plateforme Agréée, checklist, adaptation des processus internes.</li>
              <li>Émettre, recevoir et traiter des factures conformes dans Pennylane : paramétrage du compte, devis → facture, suivi des statuts, factures fournisseurs.</li>
              <li>Piloter sa gestion quotidienne dans Pennylane : rapprochement bancaire, justificatifs, trésorerie et relances, collaboration avec son cabinet, cas particuliers et e-reporting.</li>
            </ol>
          </>
        ),
      },
      {
        id: 'methodes',
        title: 'Méthodes et moyens mobilisés',
        content: (
          <ul className="list-disc pl-5 space-y-1">
            <li>Alternance d'apports pratiques et d'ateliers ; démonstrations en direct et cas pratiques par profil (artisan, commerçant, prestataire de services, e-commerçant).</li>
            <li>Classe virtuelle synchrone Google Meet (caméra, partage d'écran, suivi de connexion).</li>
            <li>Environnement de démonstration Pennylane par participant : atelier fil rouge d'un cycle complet de facturation (émission, réception, traitement).</li>
            <li>Support de cours, checklist de mise en conformité, plan d'action 30 jours et glossaire de la réforme téléchargeables sur l'espace de la formation.</li>
          </ul>
        ),
      },
      {
        id: 'evaluation',
        title: "Modalités d'évaluation et de suivi",
        content: (
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Avant :</strong> questionnaire d'analyse du besoin et des attentes ; test de positionnement (état des lieux, non éliminatoire).</li>
            <li><strong>Pendant :</strong> ateliers corrigés (diagnostic de conformité, fil rouge Pennylane), émargement par demi-journée et rapport de connexion Google Meet.</li>
            <li><strong>En fin de formation :</strong> évaluation finale des acquis (QCM + atelier fil rouge) en fin de deuxième journée, questionnaires de satisfaction à chaud puis à froid, attestation de fin de formation.</li>
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
            <li>
              Avant l'entrée en formation, chaque apprenant reçoit le{' '}
              <a href="/documents/qualiopi/Livret_accueil_V1.0.pdf" target="_blank" rel="noopener noreferrer" className="underline">
                livret d'accueil (PDF)
              </a>{' '}
              et le{' '}
              <a href="/documents/qualiopi/Reglement_interieur_V1.0.pdf" target="_blank" rel="noopener noreferrer" className="underline">
                règlement intérieur (PDF)
              </a>.
            </li>
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
            <p className="mb-2">
              <strong>Référent handicap :</strong> Mahdi CHEKINI — <a href="mailto:contact@hi-techacademy.fr" className="underline">contact@hi-techacademy.fr</a> — <a href="tel:+33751474135" className="underline">07 51 47 41 35</a>
            </p>
            <p>
              <a href="/documents/qualiopi/Accessibilite_handicap_V1.0.pdf" target="_blank" rel="noopener noreferrer" className="underline">
                Consulter notre politique d'accessibilité (PDF)
              </a>
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
  {
    id: 'ia-pour-tous',
    tag: 'Intelligence Artificielle',
    title: 'IA pour tous',
    description:
      "Utilisez l'IA efficacement au quotidien, même en partant de zéro : comprendre les modèles (ChatGPT, Claude, Gemini…), maîtriser le prompting, gagner du temps sur vos e-mails, documents et recherches, créer images, vidéos, sites et présentations, et automatiser vos tâches avec les agents — 80 heures 100 % pratiques, sans prérequis.",
    image: '/images/ia-pour-tous.jpg',
    version: 'Programme V1.0 du 09/09/2026',
    pdf: '/documents/Programme_IA_Pour_Tous_V1.0.pdf',
    keyFacts: [
      { icon: Clock, label: 'Durée', value: '80 h — séances à distance (planning défini à l’inscription)' },
      { icon: Monitor, label: 'Modalité', value: '100 % à distance (classe virtuelle Google Meet)' },
      { icon: Euro, label: 'Tarif', value: '2 500 € HT (3 000 € TTC) / stagiaire — forfait 80 h' },
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
              <strong>Public concerné :</strong> grand public — entrepreneurs, indépendants, salariés,
              particuliers — souhaitant utiliser l'IA efficacement au quotidien, même en partant de zéro.
            </p>
            <p className="mb-1"><strong>Prérequis :</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Aucun — formation non technique.</li>
              <li>Usage basique d'un ordinateur et d'un navigateur web.</li>
            </ul>
            <p className="mt-2">
              Un test de positionnement est réalisé à l'entrée : il sert d'état des lieux pour adapter
              la session au niveau des participants (il n'est pas éliminatoire).
            </p>
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
              <li>Expliquer simplement le fonctionnement et les limites des IA génératives (LLM, tokens, contexte, mémoire, hallucinations, vie privée) et choisir l'outil adapté à chaque usage.</li>
              <li>Rédiger des prompts efficaces et se constituer un environnement personnalisé : méthode en 4 étapes, projets et instructions, bibliothèque de prompts réutilisables.</li>
              <li>Appliquer l'IA à ses tâches quotidiennes : rédaction, analyse de documents, RAG, Deep Research, apprentissage, organisation, mode vocal.</li>
              <li>Créer des contenus avec l'IA : images, vidéos, voix et musique, sites web sans code, présentations, écriture créative.</li>
              <li>Automatiser ses tâches avec agents, connecteurs et MCP, et adopter des usages sûrs et critiques (deepfakes, esprit critique, bonnes habitudes).</li>
            </ol>
          </>
        ),
      },
      {
        id: 'methodes',
        title: 'Méthodes et moyens mobilisés',
        content: (
          <ul className="list-disc pl-5 space-y-1">
            <li>Approche 100 % pratique ancrée dans les usages du quotidien : démonstrations en direct, ateliers guidés, réalisations individuelles.</li>
            <li>Classe virtuelle synchrone Google Meet (caméra, partage d'écran, suivi de connexion).</li>
            <li>Chaque participant manipule les outils d'IA sur son propre poste, avec accompagnement individualisé.</li>
            <li>Support de cours, bibliothèque de prompts, fiches outils et plan d'action personnel téléchargeables sur l'espace de la formation.</li>
          </ul>
        ),
      },
      {
        id: 'evaluation',
        title: "Modalités d'évaluation et de suivi",
        content: (
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Avant :</strong> questionnaire d'analyse du besoin et des attentes ; test de positionnement (état des lieux, non éliminatoire).</li>
            <li><strong>Pendant :</strong> ateliers corrigés à chaque module, émargement par demi-journée et rapport de connexion Google Meet.</li>
            <li><strong>En fin de formation :</strong> évaluation finale des acquis (QCM + atelier « boîte à outils IA ») lors de la dernière séance, questionnaires de satisfaction à chaud puis à froid, attestation de fin de formation.</li>
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
            <li>Ouverture de la session à partir de 1 participant ; le planning des séances (80 h) est défini avec les participants à l'inscription.</li>
            <li>
              Avant l'entrée en formation, chaque apprenant reçoit le{' '}
              <a href="/documents/qualiopi/Livret_accueil_V1.0.pdf" target="_blank" rel="noopener noreferrer" className="underline">
                livret d'accueil (PDF)
              </a>{' '}
              et le{' '}
              <a href="/documents/qualiopi/Reglement_interieur_V1.0.pdf" target="_blank" rel="noopener noreferrer" className="underline">
                règlement intérieur (PDF)
              </a>.
            </li>
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
            <p className="mb-2">
              <strong>Référent handicap :</strong> Mahdi CHEKINI — <a href="mailto:contact@hi-techacademy.fr" className="underline">contact@hi-techacademy.fr</a> — <a href="tel:+33751474135" className="underline">07 51 47 41 35</a>
            </p>
            <p>
              <a href="/documents/qualiopi/Accessibilite_handicap_V1.0.pdf" target="_blank" rel="noopener noreferrer" className="underline">
                Consulter notre politique d'accessibilité (PDF)
              </a>
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
  {
    id: 'ia-for-business',
    tag: 'Intelligence Artificielle',
    title: 'IA for Business',
    description:
      "Construisez un business opéré par des Agents IA, de l'idée aux premiers clients : trouver et valider une idée, créer marque, site, offre et CRM sans développeur, vendre avec des agents de prospection et de contenu, automatiser support et administratif, piloter le tout dans le respect du RGPD et de l'AI Act — 100 heures avec un projet fil rouge : un micro-business réel lancé pendant la formation.",
    image: '/images/ia-for-business.jpg',
    version: 'Programme V1.0 du 09/09/2026',
    pdf: '/documents/Programme_IA_For_Business_V1.0.pdf',
    keyFacts: [
      { icon: Clock, label: 'Durée', value: '100 h — séances à distance (planning défini à l’inscription)' },
      { icon: Monitor, label: 'Modalité', value: '100 % à distance (classe virtuelle Google Meet)' },
      { icon: Euro, label: 'Tarif', value: '3 500 € HT (4 200 € TTC) / stagiaire — forfait 100 h' },
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
              <strong>Public concerné :</strong> entrepreneurs, indépendants, dirigeants de TPE et porteurs
              de projet souhaitant construire un business opéré par des Agents IA, de l'idée aux premiers clients.
            </p>
            <p className="mb-1"><strong>Prérequis :</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Aucun — les fondamentaux IA sont couverts au module 1.</li>
              <li>Usage basique d'un ordinateur et d'un navigateur web.</li>
            </ul>
            <p className="mt-2">
              Un test de positionnement est réalisé à l'entrée : il sert d'état des lieux pour adapter
              la session au niveau des participants (il n'est pas éliminatoire).
            </p>
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
              <li>Maîtriser les fondamentaux IA orientés business : LLM, prompting business, limites, état d'esprit AI-first, boîte à outils (Claude, MCP, n8n) et connecteurs.</li>
              <li>Trouver et valider une idée de business avec des agents : recherche d'idées, étude de marché express, analyse concurrentielle, ICP et personas, business plan, test de pricing.</li>
              <li>Construire sa marque, son site, son offre et son CRM avec l'IA, sans développeur.</li>
              <li>Vendre et acquérir avec des agents : prospection, cold outreach dans le cadre légal, machine à contenu, SEO, publicité, agent commercial 24h/24.</li>
              <li>Opérer, analyser et piloter son business : support client RAG, administratif automatisé, tableaux de bord, boucles de feedback, orchestration des agents, conformité RGPD / AI Act, arbitrages ROI.</li>
            </ol>
          </>
        ),
      },
      {
        id: 'methodes',
        title: 'Méthodes et moyens mobilisés',
        content: (
          <ul className="list-disc pl-5 space-y-1">
            <li>Projet fil rouge : chaque participant lance un micro-business réel pendant la formation — chaque module fait avancer son projet.</li>
            <li>Classe virtuelle synchrone Google Meet (caméra, partage d'écran, suivi de connexion).</li>
            <li>Chaque participant manipule les outils (Claude, MCP, n8n, outils de création et CRM) sur son propre poste, avec accompagnement individualisé.</li>
            <li>Support de cours, gabarits (prompts business, landing page, séquences de prospection), fiches outils et plan d'action téléchargeables.</li>
          </ul>
        ),
      },
      {
        id: 'evaluation',
        title: "Modalités d'évaluation et de suivi",
        content: (
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Avant :</strong> questionnaire d'analyse du besoin et des attentes ; test de positionnement (état des lieux, non éliminatoire).</li>
            <li><strong>Pendant :</strong> jalons du projet fil rouge validés à chaque module, ateliers corrigés, émargement par demi-journée et rapport de connexion Google Meet.</li>
            <li><strong>En fin de formation :</strong> évaluation finale des acquis (QCM + projet fil rouge : micro-business lancé) lors de la dernière séance, questionnaires de satisfaction à chaud puis à froid, attestation de fin de formation.</li>
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
            <li>Ouverture de la session à partir de 1 participant ; le planning des séances (100 h) est défini avec les participants à l'inscription.</li>
            <li>
              Avant l'entrée en formation, chaque apprenant reçoit le{' '}
              <a href="/documents/qualiopi/Livret_accueil_V1.0.pdf" target="_blank" rel="noopener noreferrer" className="underline">
                livret d'accueil (PDF)
              </a>{' '}
              et le{' '}
              <a href="/documents/qualiopi/Reglement_interieur_V1.0.pdf" target="_blank" rel="noopener noreferrer" className="underline">
                règlement intérieur (PDF)
              </a>.
            </li>
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
            <p className="mb-2">
              <strong>Référent handicap :</strong> Mahdi CHEKINI — <a href="mailto:contact@hi-techacademy.fr" className="underline">contact@hi-techacademy.fr</a> — <a href="tel:+33751474135" className="underline">07 51 47 41 35</a>
            </p>
            <p>
              <a href="/documents/qualiopi/Accessibilite_handicap_V1.0.pdf" target="_blank" rel="noopener noreferrer" className="underline">
                Consulter notre politique d'accessibilité (PDF)
              </a>
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
  {
    id: 'ia-for-tech',
    tag: 'Intelligence Artificielle',
    title: 'IA for Tech',
    description:
      "Concevez, construisez et déployez des applications IA de niveau production : fondamentaux LLM côté ingénierie, intégration d'APIs et SDKs, RAG du premier pipeline au RAG agentique, agents et MCP (consommer et construire), evals, sécurité et observabilité, travail en équipe augmentée (Claude Code, spec-driven development, CI/CD) — 100 heures en environnements pré-configurés, avec un projet final déployé et évalué (RAG + MCP + evals).",
    image: '/images/ee46959d2_course-04.webp',
    version: 'Programme V1.0 du 09/09/2026',
    pdf: '/documents/Programme_IA_For_Tech_V1.0.pdf',
    keyFacts: [
      { icon: Clock, label: 'Durée', value: '100 h — séances à distance (planning défini à l’inscription)' },
      { icon: Monitor, label: 'Modalité', value: '100 % à distance (classe virtuelle Google Meet)' },
      { icon: Euro, label: 'Tarif', value: '6 500 € HT (7 800 € TTC) / stagiaire — forfait 100 h' },
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
              <strong>Public concerné :</strong> développeurs, data engineers, architectes et tech leads
              souhaitant concevoir, construire et déployer des applications IA de niveau production.
            </p>
            <p className="mb-1"><strong>Prérequis :</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Pratique courante d'un langage de programmation (Python, JavaScript/TypeScript, Java…).</li>
              <li>Notions de base des APIs et de Git.</li>
            </ul>
            <p className="mt-2">Les prérequis sont vérifiés à l'entrée via un test de positionnement (non éliminatoire, il sert aussi à adapter la session).</p>
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
              <li>Maîtriser les fondamentaux LLM côté ingénierie : architecture, tokens, embeddings, fenêtres de contexte, paramètres d'inférence, modèles open-source et déploiement local, context engineering.</li>
              <li>Intégrer les LLM proprement en production : APIs (Anthropic, OpenAI, Gemini), gestion d'erreurs, retries, rate limits et coûts, tool use, multimodal, sorties structurées validées.</li>
              <li>Concevoir des pipelines RAG du premier prototype au RAG agentique, et arbitrer RAG vs fine-tuning vs long contexte.</li>
              <li>Construire des agents et systèmes multi-agents de production : LangGraph, Agent SDKs, MCP (consommer et publier un serveur), sandboxing.</li>
              <li>Livrer des systèmes fiables, sûrs et conformes, et travailler en équipe augmentée : evals, observabilité, sécurité LLM et guardrails, RGPD / AI Act, architecture de production, Claude Code, spec-driven development et CI/CD.</li>
            </ol>
          </>
        ),
      },
      {
        id: 'methodes',
        title: 'Méthodes et moyens mobilisés',
        content: (
          <ul className="list-disc pl-5 space-y-1">
            <li>Environnements de développement pré-configurés : chaque participant code sur son poste, TP à chaque notion.</li>
            <li>Projet final construit tout au long de la formation : une application agentique complète (RAG + MCP + evals), déployée et évaluée.</li>
            <li>Classe virtuelle synchrone Google Meet (caméra, partage d'écran, suivi de connexion).</li>
            <li>Support de cours avec extraits de code, dépôts d'exemples, énoncés et corrigés des TP.</li>
          </ul>
        ),
      },
      {
        id: 'evaluation',
        title: "Modalités d'évaluation et de suivi",
        content: (
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Avant :</strong> questionnaire d'analyse du besoin et des attentes ; test de positionnement (prérequis programmation + notions IA).</li>
            <li><strong>Pendant :</strong> travaux pratiques corrigés à chaque module, avancement du projet final, émargement par demi-journée et rapport de connexion Google Meet.</li>
            <li><strong>En fin de formation :</strong> évaluation finale des acquis (QCM + projet final : application agentique déployée) lors de la dernière séance, questionnaires de satisfaction à chaud puis à froid, attestation de fin de formation.</li>
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
            <li>Ouverture de la session à partir de 1 participant ; le planning des séances (100 h) est défini avec les participants à l'inscription.</li>
            <li>
              Avant l'entrée en formation, chaque apprenant reçoit le{' '}
              <a href="/documents/qualiopi/Livret_accueil_V1.0.pdf" target="_blank" rel="noopener noreferrer" className="underline">
                livret d'accueil (PDF)
              </a>{' '}
              et le{' '}
              <a href="/documents/qualiopi/Reglement_interieur_V1.0.pdf" target="_blank" rel="noopener noreferrer" className="underline">
                règlement intérieur (PDF)
              </a>.
            </li>
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
            <p className="mb-2">
              <strong>Référent handicap :</strong> Mahdi CHEKINI — <a href="mailto:contact@hi-techacademy.fr" className="underline">contact@hi-techacademy.fr</a> — <a href="tel:+33751474135" className="underline">07 51 47 41 35</a>
            </p>
            <p>
              <a href="/documents/qualiopi/Accessibilite_handicap_V1.0.pdf" target="_blank" rel="noopener noreferrer" className="underline">
                Consulter notre politique d'accessibilité (PDF)
              </a>
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

// --- Configuration par formation des parcours d'évaluation ---------------
// Les trois domaines d'auto-évaluation de l'analyse du besoin sont stockés
// dans les colonnes historiques level_linux / level_docker / level_kubernetes
// du backend (mêmes colonnes pour toutes les formations, libellés adaptés
// côté interface). Les options doivent rester parmi celles reconnues par la
// note de positionnement du backend (Débutant/Intermédiaire/Confirmé ou
// Aucune notion/Notions/Déjà utilisé).

const defaultNeedsLevels = [
  { key: 'levelLinux', field: 'level_linux', label: 'Linux (ligne de commande)', options: ['Débutant', 'Intermédiaire', 'Confirmé'] },
  { key: 'levelDocker', field: 'level_docker', label: 'Docker / conteneurs', options: ['Débutant', 'Intermédiaire', 'Confirmé'] },
  { key: 'levelKubernetes', field: 'level_kubernetes', label: 'Kubernetes', options: ['Aucune notion', 'Notions', 'Déjà utilisé'] },
];

const pennylaneNeedsLevels = [
  { key: 'levelLinux', field: 'level_linux', label: 'Facturation & devis', options: ['Débutant', 'Intermédiaire', 'Confirmé'] },
  { key: 'levelDocker', field: 'level_docker', label: 'Comptabilité & TVA', options: ['Débutant', 'Intermédiaire', 'Confirmé'] },
  { key: 'levelKubernetes', field: 'level_kubernetes', label: 'Outils numériques de gestion', options: ['Aucune notion', 'Notions', 'Déjà utilisé'] },
];

const iaNeedsLevels = [
  { key: 'levelLinux', field: 'level_linux', label: 'Outils numériques du quotidien (e-mail, navigateur, bureautique)', options: ['Débutant', 'Intermédiaire', 'Confirmé'] },
  { key: 'levelDocker', field: 'level_docker', label: 'Usage des IA (ChatGPT, Claude, Gemini…)', options: ['Débutant', 'Intermédiaire', 'Confirmé'] },
  { key: 'levelKubernetes', field: 'level_kubernetes', label: 'Automatisation & outils avancés (agents, connecteurs)', options: ['Aucune notion', 'Notions', 'Déjà utilisé'] },
];

const iaBusinessNeedsLevels = [
  { key: 'levelLinux', field: 'level_linux', label: 'Outils numériques & IA (usage quotidien)', options: ['Débutant', 'Intermédiaire', 'Confirmé'] },
  { key: 'levelDocker', field: 'level_docker', label: 'Marketing & vente en ligne', options: ['Débutant', 'Intermédiaire', 'Confirmé'] },
  { key: 'levelKubernetes', field: 'level_kubernetes', label: 'Automatisation & agents (n8n, MCP, connecteurs)', options: ['Aucune notion', 'Notions', 'Déjà utilisé'] },
];

const iaTechNeedsLevels = [
  { key: 'levelLinux', field: 'level_linux', label: 'Développement logiciel (langage, Git, APIs)', options: ['Débutant', 'Intermédiaire', 'Confirmé'] },
  { key: 'levelDocker', field: 'level_docker', label: 'Intégration de LLM (APIs, RAG)', options: ['Débutant', 'Intermédiaire', 'Confirmé'] },
  { key: 'levelKubernetes', field: 'level_kubernetes', label: 'Agents & MCP', options: ['Aucune notion', 'Notions', 'Déjà utilisé'] },
];

const needsLevelsByFormation = {
  'facturation-electronique-pennylane': pennylaneNeedsLevels,
  'ia-pour-tous': iaNeedsLevels,
  'ia-for-business': iaBusinessNeedsLevels,
  'ia-for-tech': iaTechNeedsLevels,
};

export function getNeedsLevels(formationId) {
  return needsLevelsByFormation[formationId] ?? defaultNeedsLevels;
}

// Textes du test de positionnement et de l'évaluation finale propres à
// chaque formation (les questions elles-mêmes viennent du backend).
const defaultQuizTexts = {
  intro: "Ce test vérifie vos prérequis (Linux, Docker), situe votre niveau de départ et permet d'adapter l'animation à vos besoins.",
  selfLevelQuestion: 'Comment évaluez-vous votre maîtrise actuelle de Kubernetes ?',
  selfLevelMissing: 'Auto-évaluation Kubernetes',
  selfLevelPdfLabel: 'Maîtrise actuelle de Kubernetes (déclarée)',
  knowledgeSection: 'Connaissances Kubernetes (facultatif)',
  purposeQuestion: 'Selon vous, à quoi sert Kubernetes ?',
  finalPracticalNote: "Partie B (mise en pratique sur AKS) évaluée par le formateur pendant la session ; le total "
    + "/20 est reporté sur l'attestation de fin de formation (seuil indicatif : 60 %).",
};

const pennylaneQuizTexts = {
  intro: "Ce test fait un état des lieux de vos pratiques de facturation et de vos connaissances de la réforme, pour adapter l'animation à vos besoins.",
  selfLevelQuestion: 'Où en êtes-vous de la réforme de la facturation électronique ?',
  selfLevelMissing: 'Auto-évaluation facturation électronique',
  selfLevelPdfLabel: 'Avancement déclaré sur la réforme de la facturation électronique',
  knowledgeSection: 'Connaissances de la réforme (facultatif)',
  purposeQuestion: "Selon vous, qu'est-ce que la réforme de la facturation électronique va changer pour votre entreprise ?",
  finalPracticalNote: "Partie B (atelier fil rouge Pennylane) évaluée par le formateur pendant la session ; le total "
    + "/20 est reporté sur l'attestation de fin de formation (seuil indicatif : 60 %).",
};

const iaQuizTexts = {
  intro: "Ce test fait un état des lieux de vos usages numériques et de vos premières notions d'IA, pour adapter l'animation à vos besoins.",
  selfLevelQuestion: "Où en êtes-vous dans votre usage de l'IA ?",
  selfLevelMissing: 'Auto-évaluation IA',
  selfLevelPdfLabel: "Usage déclaré de l'IA",
  knowledgeSection: 'Connaissances IA (facultatif)',
  purposeQuestion: "Selon vous, que pourrait vous apporter l'IA au quotidien ?",
  finalPracticalNote: "Partie B (atelier « boîte à outils IA ») évaluée par le formateur pendant la session ; le total "
    + "/20 est reporté sur l'attestation de fin de formation (seuil indicatif : 60 %).",
};

const iaBusinessQuizTexts = {
  intro: "Ce test fait un état des lieux de vos usages de l'IA et de vos notions business, pour adapter l'animation à vos besoins.",
  selfLevelQuestion: "Où en êtes-vous de votre projet et de votre usage de l'IA ?",
  selfLevelMissing: 'Auto-évaluation projet & IA',
  selfLevelPdfLabel: "Avancement déclaré (projet et usage de l'IA)",
  knowledgeSection: 'Votre projet (facultatif)',
  purposeQuestion: 'Décrivez en quelques mots votre projet ou idée de business (même embryonnaire).',
  finalPracticalNote: "Partie B (projet fil rouge : micro-business lancé pendant la formation) évaluée par le formateur ; le total "
    + "/20 est reporté sur l'attestation de fin de formation (seuil indicatif : 60 %).",
};

const iaTechQuizTexts = {
  intro: "Ce test vérifie vos prérequis (programmation) et situe vos notions IA, pour adapter l'animation à vos besoins.",
  selfLevelQuestion: "Où en êtes-vous de l'intégration de LLM dans vos projets ?",
  selfLevelMissing: 'Auto-évaluation intégration LLM',
  selfLevelPdfLabel: 'Niveau déclaré en intégration de LLM',
  knowledgeSection: 'Votre stack (facultatif)',
  purposeQuestion: "Décrivez votre stack habituelle et un cas d'usage IA que vous aimeriez construire.",
  finalPracticalNote: "Partie B (projet final : application agentique déployée — RAG + MCP + evals) évaluée par le formateur ; le total "
    + "/20 est reporté sur l'attestation de fin de formation (seuil indicatif : 60 %).",
};

const quizTextsByFormation = {
  'facturation-electronique-pennylane': pennylaneQuizTexts,
  'ia-pour-tous': iaQuizTexts,
  'ia-for-business': iaBusinessQuizTexts,
  'ia-for-tech': iaTechQuizTexts,
};

export function getQuizTexts(formationId) {
  return quizTextsByFormation[formationId] ?? defaultQuizTexts;
}
