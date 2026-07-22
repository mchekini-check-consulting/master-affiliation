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
  satisfactionChaud: { label: "Questionnaire satisfaction à chaud de l'apprenant", file: 'Evaluation_satisfaction_chaud_apprenant.pdf' },
  satisfactionCommanditaire: { label: 'Questionnaire satisfaction commanditaire — complété', file: 'Evaluation_de_la_satisfaction_du_client_suite_a_la_formation.pdf' },
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
  processAdministratif: { label: "Processus de gestion administrative d'un parcours de formation", file: 'Processus_gestion_administrative_parcours_V1_0.pdf' },
  planDev: { label: 'Plan de développement des compétences 2026-2028', file: 'Plan_developpement_competences_V1_0.pdf' },
  certifUrbilog: { label: "Certificat de réalisation — formation « Intégrer l'accessibilité pour les développeurs web » (Urbilog)", file: 'Certificat_realisation_Mahdi_CHEKINI.pdf' },
  factureUrbilog: { label: 'Facture de la formation accessibilité (FACT-2025-1467)', file: 'FACT_2025_1467.pdf' },
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

// Preuves consultables dans l'interface d'administration du site (pastille dédiée)
const QB_VEILLE = { label: 'Onglet « Veille » (kanban par axe)', adminTool: true };
const QB_AMELIORATION = { label: 'Registre des réclamations et suivi', adminTool: true };

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
        proofs:
          "Site internet hi-tech-academy.fr ; règlement intérieur, convention, programme, livret d'accueil et politique d'accessibilité PSH publiés sur le site ; processus formalisé d'accueil des nouveaux apprenants.",
        documents: [SITE_HOME, D.plaquette, D.programme, D.reglement, D.livret, D.accessibilite, D.convention, D.cgv, D.processAccueil],
      },
      {
        number: 2,
        applicable: true,
        title:
          'Diffuser des indicateurs de résultats adaptés à la nature des prestations mises en œuvre et des publics accueillis',
        proofs:
          "Indicateurs de résultats publiés sur le site, le programme et la convention (taux issus des questionnaires de satisfaction à chaud des bénéficiaires) ; questionnaires complétés sur la formation témoin.",
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
        proofs:
          "Questionnaire des attentes / positionnement du bénéficiaire et du commanditaire (avec question sur les besoins d'aménagement handicap) ; compte rendu d'entretien formalisé avec le client.",
        documents: [D.questionnaireCommanditaire, D.analyseBesoinComplete, D.compteRendu],
      },
      {
        number: 5,
        applicable: true,
        title: 'Définir les objectifs opérationnels et évaluables de la prestation',
        proofs:
          "Convention et programme ; déroulé pédagogique (leçons / évaluations) et grilles permettant de vérifier l'atteinte des objectifs pédagogiques.",
        documents: [D.convention, D.programme, D.deroule, D.tableauCroise],
      },
      {
        number: 6,
        applicable: true,
        title:
          "Établir les contenus et les modalités de mise en œuvre de la prestation, adaptés aux objectifs définis et aux publics bénéficiaires",
        proofs:
          "Convention et programme — accessibilité et adaptations PSH notées sur le programme ; déroulé pédagogique et tableau croisé objectifs / contenus / évaluations.",
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
        proofs:
          "Auto-positionnement dans le questionnaire des attentes ; test de positionnement / niveau complété sur la formation témoin.",
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
        proofs:
          "Règlement intérieur, convention, programme, convocation (envoyée par email), CGV ; organigramme accessible aux apprenants via le livret d'accueil.",
        documents: [D.convocation, D.convention, D.programme, D.reglement, D.livret, D.cgv, D.organigramme],
      },
      {
        number: 10,
        applicable: true,
        title:
          "Mettre en œuvre et adapter la prestation, l'accompagnement et le suivi aux publics bénéficiaires",
        proofs:
          "Adaptations de parcours selon le niveau, les attentes ou le handicap de l'apprenant ; support de formation ; liste des structures partenaires PSH et procédure d'orientation.",
        documents: [D.support, D.deroule, D.procedurePsh],
      },
      {
        number: 11,
        applicable: true,
        title:
          "Évaluer l'atteinte par les publics bénéficiaires des objectifs de la prestation",
        proofs:
          "Certificat de réalisation (avec atteinte des objectifs) ; évaluation finale QCM complétée par l'apprenant, avec version corrigée ; processus d'évaluation des apprenants.",
        documents: [D.evaluationFinale, D.certificat, D.processEvaluation, D.tableauCroise],
      },
      {
        number: 12,
        applicable: true,
        title:
          "Décrire et mettre en œuvre les mesures pour favoriser l'engagement des bénéficiaires et prévenir les ruptures de parcours",
        proofs:
          "Formations en visio favorisant la motivation et les échanges ; formations / rendez-vous individuels possibles ; adaptations PSH selon le handicap ; émargement et rapports de participation ; processus de gestion des absences et abandons.",
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
        proofs:
          "CVthèque (CV des formateurs et collaborateurs de l'organigramme) ; factures Google Meet (dispositif de classe virtuelle) ; plan de développement des compétences du formateur.",
        documents: [D.organigramme, D.cv, D.diplome, D.certifs, D.planDev],
      },
      {
        number: 18,
        applicable: true,
        title:
          'Mobiliser et coordonner les différents intervenants internes et/ou externes',
        proofs: 'Organigramme de l\'organisme et fiches de poste de chaque fonction.',
        documents: [D.organigramme, D.fpFormateur, D.fpDirection, D.fpAdmin, D.fpHandicap, D.fpQualite],
      },
      {
        number: 19,
        applicable: true,
        title:
          'Mettre à disposition des bénéficiaires des ressources pédagogiques et permettre leur appropriation',
        proofs:
          "Support de formation (versionné et daté) ; aide à la connexion aux outils logiciels indiquée sur la convocation.",
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
        proofs:
          "CV formateur ; questionnaire de satisfaction à chaud bénéficiaire (qualité du formateur) ; auto-évaluation formateur ; processus de recrutement, charte d'engagement qualité et fiches de poste.",
        documents: [D.processRecrutement, D.charte, D.cv, D.diplome, D.fpFormateur],
      },
      {
        number: 22,
        applicable: true,
        title:
          'Entretenir et développer les compétences de ses salariés, adaptées aux prestations',
        proofs:
          "Plan de développement des compétences 2026-2028 (mise à jour Kubernetes en cours sur Dyma, IA, DevOps / cloud, pédagogie et accessibilité handicap) ; preuves des formations suivies : certifications Kubernetes, formation « Intégrer l'accessibilité pour les développeurs web » (Urbilog, 2025) avec certificat et facture ; participation à des communautés de pairs.",
        documents: [D.planDev, D.certifUrbilog, D.factureUrbilog, D.certifs, D.cv],
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
        proofs: "Plan de veille ; espace « Veille » alimenté dans l'interface d'administration du site (kanban par axe).",
        documents: [D.veille, QB_VEILLE],
      },
      {
        number: 24,
        applicable: true,
        title:
          'Réaliser une veille sur les évolutions des compétences, des métiers et des emplois',
        proofs:
          "Plan de veille ; espace « Veille » alimenté dans l'interface d'administration du site ; emails de veille conservés et transmis aux collaborateurs.",
        documents: [D.veille, QB_VEILLE],
      },
      {
        number: 25,
        applicable: true,
        title:
          'Réaliser une veille sur les innovations pédagogiques et technologiques',
        proofs: "Plan de veille ; espace « Veille » alimenté dans l'interface d'administration du site (kanban par axe).",
        documents: [D.veille, QB_VEILLE],
      },
      {
        number: 26,
        applicable: true,
        title:
          'Mobiliser les expertises, outils et réseaux nécessaires pour accueillir, accompagner, former ou orienter les publics en situation de handicap',
        proofs:
          "Politique d'accessibilité ; procédure d'orientation avec liste des structures partenaires PSH ; preuve de prise de contact avec les partenaires (email) ; espace « Veille » de l'interface d'administration du site.",
        documents: [D.accessibilite, D.procedurePsh, D.mailPartenaires, D.fpHandicap, QB_VEILLE],
      },
      {
        number: 27,
        applicable: true,
        title:
          'Faire respecter le référentiel par les sous-traitants et prestataires de portage salarial',
        proofs:
          "Charte d'engagement qualité signée par le formateur, avec mention du respect du référentiel.",
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
        proofs:
          'Auto-évaluation formateur ; questionnaires à chaud et à froid apprenant ; questionnaire de satisfaction commanditaire (complété sur la formation témoin) ; questionnaire financeur.',
        documents: [D.satisfactionChaud, D.satisfactionFroid, D.satisfactionCommanditaire, D.questionnaireFinanceur],
      },
      {
        number: 31,
        applicable: true,
        title:
          'Mettre en œuvre des modalités de traitement des difficultés rencontrées et des réclamations exprimées par les parties prenantes',
        proofs:
          "Processus de suivi des réclamations ; formulaire de réclamation public sur le site ; registre et suivi des réclamations dans l'interface d'administration.",
        documents: [D.processReclamations, QB_AMELIORATION],
      },
      {
        number: 32,
        applicable: true,
        title:
          "Mettre en œuvre des mesures d'amélioration à partir de l'analyse des appréciations et des réclamations",
        proofs:
          "Processus formalisé de gestion de l'amélioration continue ; suivi dans l'interface d'administration du site.",
        documents: [D.processAmelioration, QB_AMELIORATION],
      },
    ],
  },
];

// Documents transverses, non rattachés à un critère spécifique
export const OTHER_DOCUMENTS = {
  title: 'Autres documents',
  description:
    "Documents transverses de l'organisme, non rattachés à un critère spécifique du référentiel.",
  documents: [D.processAdministratif],
};

export const AUDIT_STATS = (() => {
  const all = AUDIT_CRITERIA.flatMap((c) => c.indicators);
  const applicable = all.filter((i) => i.applicable);
  const docs = new Set([
    ...applicable.flatMap((i) => (i.documents ?? []).filter((d) => d.file).map((d) => d.file)),
    ...OTHER_DOCUMENTS.documents.map((d) => d.file),
  ]);
  return { indicators: all.length, applicable: applicable.length, documents: docs.size };
})();
