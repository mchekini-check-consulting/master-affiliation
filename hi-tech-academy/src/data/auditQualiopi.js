// Dossier d'audit Qualiopi — référentiel national qualité (RNQ).
// Périmètre de certification : ACTIONS DE FORMATION (art. L.6313-1 du Code
// du travail). Les indicateurs propres aux autres catégories (bilans de
// compétences, VAE, CFA / apprentissage) sont affichés grisés.
//
// Les documents de preuve proviennent du dossier de préparation d'audit
// (drive PRE-AUDIT-HI-TECH-ACADEMY), publiés sous /documents/audit/.

const DOC_BASE = '/documents/audit';

// Bibliothèque des documents (label affiché → fichier)
const D = {
  plaquette: { label: 'Plaquette et page web', file: 'Plaquette_et_page_web_V1_0.pdf' },
  reglement: { label: 'Règlement intérieur', file: 'Reglement_interieur_1.pdf' },
  accessibilite: { label: "Politique d'accessibilité PSH", file: 'Accessibilite_handicap_V1_0.pdf' },
  livret: { label: "Livret d'accueil", file: 'Livret_accueil_V1_0.pdf' },
  programme: { label: 'Programme Kubernetes Fondamentaux', file: 'Programme_Kubernetes_Fondamentaux_V1_0.pdf' },
  convention: { label: 'Convention de formation', file: 'Convention_de_formation.pdf' },
  processAccueil: { label: 'Processus d\'accueil des apprenants', file: 'Processus_accueil_apprenants_V1_0.pdf' },
  cgv: { label: 'Conditions générales de vente', file: 'Conditions_Generales_de_Vente.pdf' },
  satisfactionChaud: { label: 'Évaluation satisfaction à chaud — complétée', file: 'Evaluation_de_la_satisfaction_du_client_suite_a_la_formation.pdf' },
  satisfactionFroid: { label: 'Évaluation satisfaction à froid — complétée', file: 'Evaluation_de_la_satisfaction_a_froid_de_l_apprenant.pdf' },
  questionnaireCommanditaire: { label: 'Questionnaire analyse du besoin — commanditaire', file: 'Questionnaire_analyse_du_besoin_commanditaire_V1_0.pdf' },
  analyseBesoinComplete: { label: 'Analyse du besoin complétée (H. Goumeziane)', file: 'Analyse_du_besoin_Hocine_GOUMEZIANE.pdf' },
  compteRendu: { label: "Compte rendu d'entretien formalisé (L. Baleh)", file: 'Compte_rendu_formalise_Lakhdar.pdf' },
  deroule: { label: 'Déroulé pédagogique', file: 'Deroule_pedagogique_V1_0.pdf' },
  tableauCroise: { label: 'Tableau croisé objectifs / contenus / évaluations', file: 'Tableau_croise_objectifs_contenus_evaluations_V1_0.pdf' },
  support: { label: 'Support de cours Kubernetes', file: 'Support_de_cours_Kubernetes_V1_0.pdf' },
  testPositionnement: { label: 'Test de positionnement complété (H. Goumeziane)', file: 'Test_de_positionnement_Hocine_GOUMEZIANE.pdf' },
  processEvaluation: { label: "Processus d'évaluation des apprenants", file: 'Processus_evaluation_apprenants_V1_0.pdf' },
  convocation: { label: 'Convocation', file: 'Convocation_3.pdf' },
  organigramme: { label: 'Organigramme', file: 'Organigramme_V1_0.pdf' },
  procedurePsh: { label: "Procédure d'orientation des PSH", file: 'Procedure_orientation_PSH_V1_0.pdf' },
  evaluationFinale: { label: 'Évaluation finale complétée (L. Baleh)', file: 'Evaluation_finale_Lakhdar_BALEH.pdf' },
  certificat: { label: 'Certificat de réalisation (L. Baleh)', file: 'Certificat_realisation_BALEH_Lakhdar.pdf' },
  processAbsences: { label: 'Processus gestion des absences et abandons', file: 'Processus_gestion_absences_abandons_V1_0.pdf' },
  emargement: { label: "Feuille d'émargement signée (21/07/2026)", file: 'feuille_emargement_signee_2026_07_21.pdf' },
  participationMatin: { label: 'Rapport de participation classe virtuelle — matin (xlsx)', file: 'Formation_Kubernetes_Jour_1_2026_07_21_08_57_CEST_Participation.xlsx' },
  participationAprem: { label: 'Rapport de participation classe virtuelle — après-midi (xlsx)', file: 'Formation_Kubernetes_Jour_1_Apres_midi_2026_07_21_13_29_CEST_Participation.xlsx' },
  cv: { label: 'CV du formateur — Mahdi Chekini', file: 'CV_Mahdi_CHEKINI.pdf' },
  diplome: { label: 'Diplôme du formateur', file: 'Diplome_Mahdi_CHEKINI.pdf' },
  certifs: { label: 'Certifications Kubernetes du formateur', file: 'Exam_History_Certifs_kubernetes.pdf' },
  fpFormateur: { label: 'Fiche de poste — Formateur / Pédagogie', file: 'Fiche_de_poste_Formateur_Pedagogie.pdf' },
  fpDirection: { label: 'Fiche de poste — Direction et développement commercial', file: 'Fiche_de_poste_Direction_et_developpement_commercial.pdf' },
  fpAdmin: { label: 'Fiche de poste — Assistant administratif formation', file: 'Fiche_de_poste_Assistant_administratif_formation.pdf' },
  fpHandicap: { label: 'Fiche de poste — Référent handicap', file: 'Fiche_de_poste_Referent_Handicap.pdf' },
  fpQualite: { label: 'Fiche de poste — Référent qualité Qualiopi', file: 'Fiche_de_poste_Referent_Qualite_Qualiopi.pdf' },
  processRecrutement: { label: 'Processus de recrutement des collaborateurs', file: 'Processus_recrutement_collaborateur.pdf' },
  charte: { label: 'Charte d\'engagement qualité formateur', file: 'Charte_engagement_qualite_formateur.pdf' },
  veille: { label: 'Plan de veille', file: 'Plan_de_veille_V1_1.pdf' },
  mailPartenaires: { label: 'Prise de contact partenaires handicap (email)', file: 'Messagerie_Hi_Tech_academy_Identification_d_un_contact_referent_accueil_des_publics_en_situation_de_handicap.pdf' },
  questionnaireFinanceur: { label: 'Questionnaire de satisfaction financeur', file: 'Questionnaire_satisfaction_financeur_V1_0.pdf' },
  processReclamations: { label: 'Processus de suivi des réclamations', file: 'Processus_suivi_reclamations_V1_0.pdf' },
  processAmelioration: { label: "Processus d'amélioration continue", file: 'Processus_amelioration_continue_V1_0.pdf' },
};

export function auditDocUrl(doc) {
  return `${DOC_BASE}/${doc.file}`;
}

export function isViewable(doc) {
  return doc.file.toLowerCase().endsWith('.pdf');
}

// Lien interne du site présenté comme preuve (ouvre dans un nouvel onglet)
const SITE_RESULTATS = { label: 'Indicateurs de résultats publiés sur le site', href: '/#resultats' };
const SITE_HOME = { label: 'Site internet hi-tech-academy.fr', href: '/' };

export const AUDIT_CRITERIA = [
  {
    number: 1,
    title: 'Information du public',
    description:
      "Conditions d'information du public sur les prestations proposées, les délais pour y accéder et les résultats obtenus.",
    indicators: [
      {
        number: 1,
        applicable: true,
        title:
          "Diffuser une information accessible, exhaustive et vérifiable : prérequis, objectifs, durée, modalités et délais d'accès, tarifs, contacts, méthodes mobilisées, modalités d'évaluation, accessibilité aux personnes en situation de handicap",
        documents: [SITE_HOME, D.plaquette, D.programme, D.reglement, D.livret, D.accessibilite, D.convention, D.cgv, D.processAccueil],
      },
      {
        number: 2,
        applicable: true,
        title:
          'Diffuser des indicateurs de résultats adaptés à la nature des prestations mises en œuvre et des publics accueillis',
        documents: [SITE_RESULTATS, D.satisfactionChaud, D.satisfactionFroid],
      },
      {
        number: 3,
        applicable: false,
        reason: 'Prestations certifiantes uniquement',
        title:
          "Diffuser les taux d'obtention des certifications préparées et les possibilités de valider des blocs de compétences",
      },
    ],
  },
  {
    number: 2,
    title: 'Ingénierie de la formation',
    description:
      'Identification précise des objectifs des prestations proposées et adaptation de ces prestations aux publics bénéficiaires.',
    indicators: [
      {
        number: 4,
        applicable: true,
        title:
          "Analyser le besoin du bénéficiaire en lien avec l'entreprise et/ou le financeur concerné",
        documents: [D.questionnaireCommanditaire, D.analyseBesoinComplete, D.compteRendu],
      },
      {
        number: 5,
        applicable: true,
        title: 'Définir les objectifs opérationnels et évaluables de la prestation',
        documents: [D.convention, D.programme, D.deroule, D.tableauCroise],
      },
      {
        number: 6,
        applicable: true,
        title:
          "Établir les contenus et les modalités de mise en œuvre de la prestation, adaptés aux objectifs définis et aux publics bénéficiaires",
        documents: [D.programme, D.deroule, D.tableauCroise, D.support],
      },
      {
        number: 7,
        applicable: false,
        reason: 'Prestations certifiantes uniquement',
        title:
          "S'assurer de l'adéquation des contenus de la prestation aux exigences de la certification visée",
      },
      {
        number: 8,
        applicable: true,
        title:
          "Déterminer les procédures de positionnement et d'évaluation des acquis à l'entrée de la prestation",
        documents: [D.testPositionnement, D.analyseBesoinComplete, D.processEvaluation],
      },
    ],
  },
  {
    number: 3,
    title: 'Adaptation aux publics',
    description:
      "Adaptation aux publics bénéficiaires des prestations et des modalités d'accueil, d'accompagnement, de suivi et d'évaluation.",
    indicators: [
      {
        number: 9,
        applicable: true,
        title:
          'Informer les publics bénéficiaires des conditions de déroulement de la prestation',
        documents: [D.convocation, D.convention, D.programme, D.reglement, D.livret, D.cgv, D.organigramme],
      },
      {
        number: 10,
        applicable: true,
        title:
          "Mettre en œuvre et adapter la prestation, l'accompagnement et le suivi aux publics bénéficiaires",
        documents: [D.support, D.deroule, D.procedurePsh],
      },
      {
        number: 11,
        applicable: true,
        title:
          "Évaluer l'atteinte par les publics bénéficiaires des objectifs de la prestation",
        documents: [D.evaluationFinale, D.certificat, D.processEvaluation, D.tableauCroise],
      },
      {
        number: 12,
        applicable: true,
        title:
          "Décrire et mettre en œuvre les mesures pour favoriser l'engagement des bénéficiaires et prévenir les ruptures de parcours",
        documents: [D.processAbsences, D.emargement, D.participationMatin, D.participationAprem],
      },
      {
        number: 13,
        applicable: false,
        reason: 'Apprentissage / alternance uniquement',
        title:
          "Pour les formations en alternance : coordination des apprentissages avec l'entreprise",
      },
      {
        number: 14,
        applicable: false,
        reason: 'CFA uniquement',
        title: "Pour les CFA : exercice de la citoyenneté des apprentis",
      },
      {
        number: 15,
        applicable: false,
        reason: 'CFA uniquement',
        title: 'Pour les CFA : information des apprentis sur leurs droits et devoirs',
      },
      {
        number: 16,
        applicable: false,
        reason: 'Prestations certifiantes uniquement',
        title:
          'Décrire et mettre en œuvre les modalités de présentation des bénéficiaires à la certification',
      },
    ],
  },
  {
    number: 4,
    title: 'Moyens mis en œuvre',
    description:
      "Adéquation des moyens pédagogiques, techniques et d'encadrement aux prestations mises en œuvre.",
    indicators: [
      {
        number: 17,
        applicable: true,
        title:
          'Mettre à disposition des moyens humains et techniques adaptés aux prestations',
        documents: [D.organigramme, D.cv, D.diplome, D.certifs],
      },
      {
        number: 18,
        applicable: true,
        title:
          'Mobiliser et coordonner les différents intervenants internes et/ou externes',
        documents: [D.organigramme, D.fpFormateur, D.fpDirection, D.fpAdmin, D.fpHandicap, D.fpQualite],
      },
      {
        number: 19,
        applicable: true,
        title:
          'Mettre à disposition des bénéficiaires des ressources pédagogiques et permettre leur appropriation',
        documents: [D.support, D.convocation],
      },
      {
        number: 20,
        applicable: false,
        reason: 'CFA uniquement',
        title:
          "Pour les CFA : personnels dédiés à l'appui à la mobilité, référent handicap et conseil de perfectionnement",
      },
    ],
  },
  {
    number: 5,
    title: 'Compétences du personnel',
    description:
      'Qualification et développement des connaissances et compétences des personnels chargés de mettre en œuvre les prestations.',
    indicators: [
      {
        number: 21,
        applicable: true,
        title:
          'Déterminer, mobiliser et évaluer les compétences des différents intervenants internes et/ou externes, adaptées aux prestations',
        documents: [D.processRecrutement, D.charte, D.cv, D.diplome, D.fpFormateur],
      },
      {
        number: 22,
        applicable: true,
        title:
          'Entretenir et développer les compétences de ses salariés, adaptées aux prestations',
        documents: [D.certifs, D.cv, D.veille],
      },
    ],
  },
  {
    number: 6,
    title: 'Veilles et environnement professionnel',
    description:
      "Inscription et investissement du prestataire dans son environnement professionnel.",
    indicators: [
      {
        number: 23,
        applicable: true,
        title:
          'Réaliser une veille légale et réglementaire sur le champ de la formation professionnelle',
        documents: [D.veille],
      },
      {
        number: 24,
        applicable: true,
        title:
          'Réaliser une veille sur les évolutions des compétences, des métiers et des emplois',
        documents: [D.veille],
      },
      {
        number: 25,
        applicable: true,
        title:
          'Réaliser une veille sur les innovations pédagogiques et technologiques',
        documents: [D.veille],
      },
      {
        number: 26,
        applicable: true,
        title:
          'Mobiliser les expertises, outils et réseaux nécessaires pour accueillir, accompagner, former ou orienter les publics en situation de handicap',
        documents: [D.accessibilite, D.procedurePsh, D.mailPartenaires, D.fpHandicap],
      },
      {
        number: 27,
        applicable: true,
        title:
          'Faire respecter le référentiel par les sous-traitants et prestataires de portage salarial',
        documents: [D.charte],
      },
      {
        number: 28,
        applicable: false,
        reason: 'Formation en situation de travail uniquement',
        title:
          "Pour les formations en situation de travail : mobiliser le réseau de partenaires socio-économiques",
      },
    ],
  },
  {
    number: 7,
    title: 'Satisfaction et réclamations',
    description:
      'Recueil et prise en compte des appréciations et des réclamations formulées par les parties prenantes.',
    indicators: [
      {
        number: 29,
        applicable: false,
        reason: 'CFA uniquement',
        title:
          "Pour les CFA : taux d'insertion professionnelle et de poursuite d'études",
      },
      {
        number: 30,
        applicable: true,
        title:
          'Recueillir les appréciations des parties prenantes : bénéficiaires, financeurs, équipes pédagogiques et entreprises',
        documents: [D.satisfactionChaud, D.satisfactionFroid, D.questionnaireFinanceur, D.questionnaireCommanditaire],
      },
      {
        number: 31,
        applicable: true,
        title:
          'Mettre en œuvre des modalités de traitement des difficultés rencontrées et des réclamations exprimées par les parties prenantes',
        documents: [D.processReclamations],
      },
      {
        number: 32,
        applicable: true,
        title:
          "Mettre en œuvre des mesures d'amélioration à partir de l'analyse des appréciations et des réclamations",
        documents: [D.processAmelioration],
      },
    ],
  },
];

export const AUDIT_STATS = (() => {
  const all = AUDIT_CRITERIA.flatMap((c) => c.indicators);
  const applicable = all.filter((i) => i.applicable);
  const docs = new Set(applicable.flatMap((i) => (i.documents ?? []).filter((d) => d.file).map((d) => d.file)));
  return { indicators: all.length, applicable: applicable.length, documents: docs.size };
})();
