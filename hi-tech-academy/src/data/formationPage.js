// Contenus complémentaires du gabarit de page formation (maquette « page de
// vente » : objectifs, personas, prérequis, FAQ). Les témoignages vivent
// dans ventes.js (`preuves`), propres à chaque formation. Le programme
// réglementaire reste dans formations.jsx et la copy marketing dans ventes.js.
//
// Chaque formation peut surcharger ce qu'elle veut : tout ce qui manque tombe
// sur les valeurs communes définies plus bas (approche, financements,
// FAQ génériques). Ajouter une formation ne demande donc rien
// d'obligatoire ici.

import {
  Boxes, Rocket, Share2, Settings, Server, BarChart3, Brain, PenLine, Timer,
  Palette, Bot, ShieldCheck, FileCheck2, Wallet, Building2, UserCog, Code2,
  Users, Briefcase, GraduationCap, Sparkles, ClipboardList, MonitorPlay,
  Wrench, MessagesSquare, Landmark, HeartHandshake, BookOpen, PhoneCall,
  Scale, Terminal, CalendarCheck, FileText, Banknote,
} from 'lucide-react';

// ---------------------------------------------------------------- communs --

/** Les 4 temps d'une session, identiques pour toutes nos formations. */
export const approcheParDefaut = [
  { icon: ClipboardList, titre: 'Apports théoriques ciblés', texte: 'Pour comprendre les concepts essentiels' },
  { icon: MonitorPlay, titre: 'Démonstrations en direct', texte: 'Par le formateur' },
  { icon: Wrench, titre: 'Travaux pratiques guidés', texte: 'Sur un environnement réel' },
  { icon: MessagesSquare, titre: 'Échanges et sessions Q&A', texte: 'Pour répondre à vos questions' },
];

/** Dispositifs de financement mobilisables, communs au catalogue. */
export const financementsParDefaut = [
  { icon: Landmark, titre: 'OPCO', texte: 'Financement possible selon votre branche' },
  { icon: Building2, titre: 'Plan de développement des compétences', texte: 'Pour les entreprises' },
  { icon: HeartHandshake, titre: 'Financement personnel', texte: 'Un accompagnement sur mesure' },
];

/** Ce qui est fourni au stagiaire, commun aux formations à distance. */
export const inclusParDefaut = [
  { icon: MonitorPlay, titre: 'Classe virtuelle', texte: '100 % à distance (Google Meet)' },
  { icon: FileCheck2, titre: 'Support de cours', texte: 'En version PDF' },
  { icon: Server, titre: 'Environnement de travail', texte: 'Pour les travaux pratiques' },
  { icon: GraduationCap, titre: 'Attestation', texte: 'De fin de formation' },
];

// ------------------------------------------------- « vous repartez avec » --
// Livrables de la section Bonus (compris dans le tarif, rien d'inventé).
// Les formations IA partagent la même liste ; les autres ont la leur ;
// une formation inconnue retombe sur la liste générique.

/** Commune aux formations de la catégorie Intelligence Artificielle. */
const bonusIa = [
  {
    icon: PenLine,
    titre: 'Une bibliothèque de prompts prêts à l\'emploi',
    texte: 'Classés par métier et par cas d\'usage : vous copiez, vous adaptez, vous vous en servez dès le lendemain de la session.',
  },
  {
    icon: BookOpen,
    titre: 'Les supports de formation complets, avec mises à jour',
    texte: 'Conservés après la session et mis à jour : vous suivez les évolutions des outils sans refaire la formation.',
  },
  {
    icon: Bot,
    titre: 'Des templates d\'agents et d\'automatisations',
    texte: 'Des modèles prêts à brancher pour vos premiers agents et automatisations, à personnaliser sur vos propres cas d\'usage.',
  },
  {
    icon: Scale,
    titre: 'Le guide comparatif des outils IA',
    texte: 'Quel outil choisir pour quel usage : un comparatif mis à jour régulièrement, pour décider sans y passer des heures.',
  },
];

const bonusParFormation = {
  'kubernetes-fondamentaux': [
    {
      icon: Terminal,
      titre: 'Le pack de fiches de commandes kubectl',
      texte: 'Les commandes et manifestes vus en session, prêts à copier dans votre terminal. Vous les gardez à vie.',
    },
    {
      icon: BookOpen,
      titre: 'Les supports de formation complets',
      texte: 'Support de cours en PDF, énoncés et corrigés des travaux pratiques, conservés après la session.',
    },
    {
      icon: Boxes,
      titre: 'Les manifestes du TP fil rouge',
      texte: 'Le déploiement complet réalisé en session (Pods, Deployments, Services, ConfigMaps) à rejouer sur vos propres projets.',
    },
    {
      icon: PhoneCall,
      titre: 'Un suivi individuel de 30 minutes',
      texte: 'Quelques semaines après la session, un point en tête à tête avec votre formateur : ce que vous avez mis en place, ce qui bloque, et comment avancer.',
    },
  ],
  'facturation-electronique-pennylane': [
    {
      icon: ClipboardList,
      titre: 'Votre checklist de mise en conformité',
      texte: 'La feuille de route complète de la réforme, appliquée à votre entreprise pendant la formation. Vous repartez avec la vôtre.',
    },
    {
      icon: CalendarCheck,
      titre: 'Le plan d\'action 30 jours',
      texte: 'Priorisé selon votre profil (artisan, commerçant, prestataire, e-commerçant), prêt à dérouler dès le lendemain.',
    },
    {
      icon: BookOpen,
      titre: 'Les supports de formation complets',
      texte: 'Support de cours et pas-à-pas Pennylane en PDF, conservés après la session.',
    },
    {
      icon: PhoneCall,
      titre: 'Un suivi individuel de 30 minutes',
      texte: 'Quelques semaines après la session, un point en tête à tête avec votre formateur : ce que vous avez mis en place, ce qui bloque, et comment avancer.',
    },
  ],
};

/** Liste générique : formation hors IA sans liste dédiée. */
const bonusParDefaut = [
  {
    icon: FileText,
    titre: 'Le pack fiches réflexes',
    texte: 'Des fiches PDF prêtes à l\'emploi, à réutiliser au quotidien. Vous les gardez à vie et vous en servez dès le lendemain.',
  },
  {
    icon: PhoneCall,
    titre: 'Un suivi individuel de 30 minutes',
    texte: 'Quelques semaines après la session, un point en tête à tête avec votre formateur : ce que vous avez mis en place, ce qui bloque, et comment avancer.',
  },
  {
    icon: Banknote,
    titre: 'Le montage du dossier de financement',
    texte: 'Devis, programme et convention au format attendu par votre OPCO ou votre fonds : nous préparons chaque pièce avec vous.',
  },
  {
    icon: MonitorPlay,
    titre: 'Le support de cours et l\'environnement de travaux pratiques',
    texte: 'Le support complet en PDF, conservé après la session, et un environnement de travaux pratiques prêt à l\'emploi.',
  },
];

/** Les livrables « vous repartez avec » d'une formation (objet du catalogue). */
export function getBonusFormation(formation) {
  return bonusParFormation[formation.id]
    ?? (formation.tag === 'Intelligence Artificielle' ? bonusIa : bonusParDefaut);
}

const faqParDefaut = [
  // Les trois premières lèvent les objections qui bloquent le plus souvent :
  // « qui paie ? », « que se passe-t-il pendant l'appel ? » et « suis-je au niveau ? ».
  {
    q: 'Puis-je faire financer cette formation ?',
    r: "Oui, jusqu'à 100 % selon votre situation. Salarié : via le plan de développement des compétences de votre entreprise et votre OPCO. Indépendant : via votre fonds d'assurance formation (AGEFICE, FIF PL…). Nous montons le dossier avec vous : devis, programme et convention au format attendu par le financeur, et nous restons disponibles jusqu'à l'accord. L'appel gratuit de 30 minutes sert d'abord à vérifier votre prise en charge.",
  },
  {
    q: "Comment se passe l'appel gratuit de 30 minutes ?",
    r: "C'est un point stratégique en visio, gratuit et sans engagement. Nous clarifions votre besoin, votre niveau de départ et votre financement. Vous repartez avec une réponse claire sur votre prise en charge et, si la formation vous convient, une proposition de dates.",
  },
  {
    q: 'Quels sont les prérequis techniques ?',
    r: "Un ordinateur, une connexion internet stable, une webcam et un micro. Les prérequis pédagogiques sont vérifiés en amont par un test de positionnement, non éliminatoire.",
  },
  {
    q: 'Quel est le format de la formation ?',
    r: "La formation se déroule 100 % à distance, en classe virtuelle synchrone (Google Meet), animée en direct par le formateur, jamais en vidéos préenregistrées.",
  },
  {
    q: 'Comment se déroulent les travaux pratiques ?',
    r: "Chaque participant dispose de son propre environnement de travail. Les travaux pratiques sont guidés par le formateur, puis corrigés en direct.",
  },
  {
    q: 'Vais-je recevoir une attestation ?',
    r: "Oui. Une attestation de fin de formation (art. L.6353-1 du Code du travail) vous est délivrée, mentionnant les objectifs, la nature, la durée et les résultats de l'évaluation des acquis.",
  },
  {
    q: "Puis-je suivre la formation depuis l'étranger ?",
    r: "Oui, la formation est accessible partout, sous réserve de pouvoir suivre les horaires de la session (heure de Paris).",
  },
  {
    q: "Que se passe-t-il après ma demande d'inscription ?",
    r: "Nous vous rappelons sous 24 h ouvrées pour valider votre projet, votre niveau de départ et votre financement, puis nous vous adressons devis et convention. Sans engagement.",
  },
];

// ------------------------------------------------------------ par formation --

const pages = {
  'kubernetes-fondamentaux': {
    objectifs: [
      { icon: Boxes, titre: "Comprendre l'architecture de Kubernetes", texte: 'Maîtrisez les composants et leur rôle.' },
      { icon: Rocket, titre: 'Déployer des applications', texte: 'Créez et gérez des Pods et Deployments.' },
      { icon: Share2, titre: 'Exposer vos applications', texte: 'Utilisez les Services et découvrez Ingress.' },
      { icon: Settings, titre: 'Gérer la configuration', texte: 'Manipulez ConfigMaps et Secrets.' },
      { icon: Server, titre: 'Travailler sur un cluster réel', texte: 'Mettez en pratique sur un environnement Azure AKS.' },
      { icon: BarChart3, titre: 'Adopter les bonnes pratiques', texte: 'Comprenez les fondamentaux pour aller plus loin.' },
    ],
    personas: [
      { icon: UserCog, titre: 'Administrateurs systèmes', texte: 'Souhaitant se spécialiser sur Kubernetes.' },
      { icon: Code2, titre: 'Développeurs', texte: 'Qui veulent déployer et gérer leurs applications.' },
      { icon: Users, titre: 'Professionnels IT', texte: 'Souhaitant comprendre et utiliser Kubernetes dans un contexte réel.' },
    ],
    prerequis: [
      'Connaissances de base en Linux (recommandé)',
      'Notions de conteneurs (Docker) (recommandé)',
      'Une appétence pour la ligne de commande',
    ],
    misePratique: {
      badge: 'Mise en pratique',
      titre: 'Des cas concrets sur un cluster réel',
      texte: "Tout au long de la formation, vous travaillez directement sur un environnement Azure AKS pour appliquer vos connaissances dans des conditions réelles.",
      points: ['Cluster Azure AKS fourni', 'Scénarios guidés', 'Autonomie et bonnes pratiques'],
      image: '', // visuel de la carte sombre — à fournir
    },
    parcours: [
      {
        icon: Sparkles,
        horaire: '09h00 – 12h30',
        titre: 'Matinée',
        items: ['Accueil et introduction', 'Concepts fondamentaux', "Architecture d'un cluster", 'Pods et Deployments'],
      },
      {
        icon: HeartHandshake,
        horaire: '12h30 – 13h30',
        titre: 'Pause déjeuner',
        texte: "Un temps d'échange pour poser vos questions en toute simplicité.",
      },
      {
        icon: Settings,
        horaire: '13h30 – 17h00',
        titre: 'Après-midi',
        items: ['Services et Ingress', 'ConfigMaps et Secrets', 'Travaux pratiques sur AKS', 'Synthèse et bonnes pratiques'],
      },
    ],
    modules: [
      'Introduction à Kubernetes',
      'Architecture de Kubernetes',
      'Pods et Deployments',
      'Services et Ingress',
      'ConfigMaps et Secrets',
      'Travaux pratiques sur Azure AKS',
      'Bonnes pratiques et prochaines étapes',
    ],
    promesseFinale: 'À la fin de cette formation, vous serez capable de déployer et gérer vos propres applications sur Kubernetes.',
  },

  'facturation-electronique-pennylane': {
    objectifs: [
      { icon: FileCheck2, titre: 'Décoder la réforme', texte: 'E-invoicing, e-reporting et calendrier officiel.' },
      { icon: ShieldCheck, titre: 'Situer votre entreprise', texte: 'Identifiez vos obligations réelles et vos échéances.' },
      { icon: ClipboardList, titre: 'Bâtir votre plan de conformité', texte: 'Une feuille de route applicable en 30 jours.' },
      { icon: Wallet, titre: 'Piloter Pennylane', texte: 'Émettez, recevez et suivez vos factures.' },
      { icon: Settings, titre: 'Fiabiliser vos données', texte: 'Référentiels clients, mentions et formats attendus.' },
      { icon: BarChart3, titre: 'Sécuriser votre trésorerie', texte: 'Évitez les rejets de factures et les retards de paiement.' },
    ],
    personas: [
      { icon: Briefcase, titre: 'Dirigeants de TPE / PME', texte: 'Qui doivent préparer leur entreprise à la réforme.' },
      { icon: ClipboardList, titre: 'Comptables et gestionnaires', texte: 'En charge de la facturation au quotidien.' },
      { icon: Users, titre: 'Équipes administratives', texte: 'Qui émettent et traitent des factures.' },
    ],
    prerequis: [
      'Aucun prérequis technique',
      'Pratiquer la facturation de votre entreprise',
      'Un ordinateur et une connexion internet',
    ],
  },

  'ia-pour-tous': {
    objectifs: [
      { icon: Brain, titre: "Comprendre ce que l'IA sait faire", texte: 'Capacités réelles, limites et angles morts.' },
      { icon: PenLine, titre: 'Rédiger de meilleurs prompts', texte: 'Une méthode reproductible, pas des astuces.' },
      { icon: Timer, titre: 'Gagner des heures chaque semaine', texte: 'Sur vos tâches répétitives du quotidien.' },
      { icon: Palette, titre: 'Créer vos visuels et contenus', texte: 'Texte, image et présentation.' },
      { icon: Bot, titre: 'Automatiser vos tâches', texte: "Faites passer l'IA de l'assistance à l'action." },
      { icon: ShieldCheck, titre: 'Travailler en confiance', texte: 'Vérification des sources et données sensibles.' },
    ],
    personas: [
      { icon: Users, titre: 'Tous profils, tous métiers', texte: "Sans aucun prérequis technique." },
      { icon: Briefcase, titre: 'Indépendants et entrepreneurs', texte: 'Qui veulent produire plus, seuls.' },
      { icon: GraduationCap, titre: 'Salariés en évolution', texte: "Souhaitant intégrer l'IA à leur poste." },
    ],
    prerequis: [
      'Aucun prérequis technique',
      'Savoir utiliser un ordinateur et un navigateur',
      "L'envie de tester et d'expérimenter",
    ],
  },

  'essentiel-ia': {
    objectifs: [
      { icon: Brain, titre: "Comprendre ce que l'IA sait faire", texte: 'Capacités réelles, limites et données sensibles.' },
      { icon: PenLine, titre: 'Maîtriser le prompting', texte: 'Une méthode en 4 étapes, reproductible.' },
      { icon: Timer, titre: 'Gagner des heures chaque semaine', texte: 'E-mails, documents, recherches sourcées.' },
      { icon: Palette, titre: 'Créer vos contenus professionnels', texte: 'Images, présentations, page web sans code.' },
      { icon: Briefcase, titre: "Appliquer l'IA à votre métier", texte: '2 à 3 workflows construits pour votre poste.' },
      { icon: Bot, titre: 'Automatiser en confiance', texte: 'Agents, connecteurs et esprit critique.' },
    ],
    personas: [
      { icon: Users, titre: 'Tous profils, tous métiers', texte: 'Une pratique numérique régulière suffit.' },
      { icon: Briefcase, titre: 'Salariés et indépendants pressés', texte: "L'essentiel en 21 heures seulement." },
      { icon: GraduationCap, titre: 'Équipes à acculturer', texte: 'Un socle commun IA pour toute l’équipe.' },
    ],
    prerequis: [
      'Aucune compétence informatique avancée',
      'Une pratique numérique régulière (navigateur, messagerie, bureautique)',
      "L'envie de tester sur vos propres cas",
    ],
  },

  'ia-for-business': {
    objectifs: [
      { icon: Sparkles, titre: 'Identifier les cas d’usage rentables', texte: 'Là où l’IA crée réellement de la valeur.' },
      { icon: Bot, titre: 'Concevoir des agents utiles', texte: 'Sans écrire une ligne de code.' },
      { icon: Settings, titre: 'Automatiser vos processus', texte: 'De la prospection au service client.' },
      { icon: BarChart3, titre: 'Mesurer le retour sur investissement', texte: 'Indicateurs et coûts maîtrisés.' },
      { icon: ShieldCheck, titre: 'Encadrer les risques', texte: 'Données, conformité et supervision humaine.' },
      { icon: Rocket, titre: 'Déployer dans votre entreprise', texte: 'Un plan de mise en œuvre concret.' },
    ],
    personas: [
      { icon: Briefcase, titre: 'Dirigeants et fondateurs', texte: 'Qui veulent industrialiser avec l’IA.' },
      { icon: Users, titre: 'Responsables métier', texte: 'Marketing, vente, opérations, support.' },
      { icon: ClipboardList, titre: 'Consultants et indépendants', texte: 'Qui veulent élargir leur offre.' },
    ],
    prerequis: [
      'Aucun prérequis technique',
      'Une activité ou un projet à outiller',
      'Une pratique courante des outils bureautiques',
    ],
  },

  'ia-for-tech': {
    objectifs: [
      { icon: Code2, titre: 'Intégrer un modèle dans une application', texte: 'Appels, streaming et gestion des erreurs.' },
      { icon: Bot, titre: 'Construire des agents outillés', texte: 'Tool use, orchestration et boucles de contrôle.' },
      { icon: Boxes, titre: 'Mettre en place du RAG', texte: 'Indexation, recherche et citations.' },
      { icon: BarChart3, titre: 'Évaluer vos systèmes', texte: 'Jeux de tests, LLM-judge et métriques.' },
      { icon: ShieldCheck, titre: 'Sécuriser et maîtriser les coûts', texte: 'Garde-fous, cache et quotas.' },
      { icon: Rocket, titre: 'Passer en production', texte: 'Déploiement, observabilité et itérations.' },
    ],
    personas: [
      { icon: Code2, titre: 'Développeurs', texte: 'Qui veulent bâtir des applications IA.' },
      { icon: Server, titre: 'Ingénieurs data / DevOps', texte: 'En charge de l’industrialisation.' },
      { icon: UserCog, titre: 'Tech leads et architectes', texte: 'Qui doivent arbitrer les choix techniques.' },
    ],
    prerequis: [
      "Pratique d'un langage de programmation",
      'Notions d’API REST et de JSON',
      'Usage courant de la ligne de commande',
    ],
  },

  'management-processus-ia': {
    objectifs: [
      { icon: ShieldCheck, titre: 'Bâtir une stratégie IA responsable', texte: 'Risques analysés, AI Act et RGPD respectés.' },
      { icon: Settings, titre: 'Reconfigurer vos processus', texte: 'Répartition humain/IA et conduite du changement.' },
      { icon: PenLine, titre: 'Maîtriser prompts et assistants', texte: 'RCTF, assistants personnalisés, RAG sur vos documents.' },
      { icon: Palette, titre: 'Produire des contenus fiables', texte: 'Comptes rendus, tableaux de bord, visuels vérifiés.' },
      { icon: BarChart3, titre: "Mesurer l'apport réel de l'IA", texte: 'Indicateurs avant/après et suivi dans la durée.' },
      { icon: Sparkles, titre: "Installer l'amélioration continue", texte: 'Veille, ajustement des usages, plan d’action.' },
    ],
    personas: [
      { icon: Users, titre: 'Managers de proximité', texte: 'Qui veulent transformer les processus de leur équipe.' },
      { icon: Briefcase, titre: 'Dirigeants de petites structures', texte: 'En quête de gains concrets et conformes.' },
      { icon: UserCog, titre: "Responsables d'équipe et entrepreneurs", texte: 'Qui doivent cadrer des usages IA déjà présents.' },
    ],
    prerequis: [
      "Un an d'expérience en management d'équipe ou en direction de structure",
      'Utilisation courante des outils informatiques',
      'Appétence pour les nouvelles technologies numériques',
    ],
  },
};

/**
 * Contenus du gabarit pour une formation, complétés par les valeurs communes.
 * Toujours défini, même pour une formation absente de `pages`.
 */
export function getFormationPage(id) {
  const page = pages[id] ?? {};
  return {
    objectifs: page.objectifs ?? [],
    personas: page.personas ?? [],
    prerequis: page.prerequis ?? ['Aucun prérequis : formation ouverte à tous'],
    approche: page.approche ?? approcheParDefaut,
    inclus: page.inclus ?? inclusParDefaut,
    financements: page.financements ?? financementsParDefaut,
    faq: page.faq ?? faqParDefaut,
    // Sections optionnelles : masquées tant qu'elles ne sont pas renseignées.
    misePratique: page.misePratique ?? null,
    parcours: page.parcours ?? null,
    modules: page.modules ?? null,
    promesseFinale: page.promesseFinale ?? null,
    // Emplacements de visuels — laissés vides tant que les images ne sont pas
    // fournies ; la page affiche alors un aplat dégradé à la place.
    programmeImage: page.programmeImage ?? '',
    ctaImage: page.ctaImage ?? '',
  };
}
