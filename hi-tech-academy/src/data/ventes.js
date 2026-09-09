// Copy des pages de vente, par formation (modèle « bénéfice + curiosité » du
// skill page-vente) : accroche, promesse, programme réécrit en clusters,
// cible, CTA (2 variantes) et arguments marketing. Le contenu officiel
// (programme réglementaire, sections Qualiopi) reste dans formations.jsx.

export const ventes = {
  'kubernetes-fondamentaux': {
    accroche: 'Et si vous déployiez votre première application sur Kubernetes dès ce soir ?',
    promesse:
      "Aujourd'hui, Kubernetes vous semble réservé aux experts DevOps. Dans une journée, vous aurez déployé, exposé et configuré une application complète sur un vrai cluster Azure — et vous saurez expliquer chaque étape en entretien comme en réunion d'architecture.",
    clusters: [
      {
        emoji: '🚀',
        titre: 'Prenez le contrôle du standard qui fait tourner le cloud',
        items: [
          "L'orchestration décodée : pourquoi les entreprises s'arrachent ceux qui maîtrisent Kubernetes",
          "L'architecture d'un cluster expliquée simplement : les pièces qui font tout fonctionner",
          'kubectl : les commandes qui vous rendent opérationnel dès la première heure',
        ],
      },
      {
        emoji: '⚙️',
        titre: 'Déployez comme en production',
        items: [
          'Votre premier Pod sur un vrai cluster Azure — pas un simulateur',
          "Deployments : l'arme anti-panne qui relance vos applications toute seule",
          'Rolling update : mettez à jour sans couper le service, comme les géants du web',
        ],
      },
      {
        emoji: '🌐',
        titre: 'Exposez et configurez sans vous tromper',
        items: [
          'Services : rendez votre application joignable en trois lignes de YAML',
          'Ingress : le routage HTTP que tout DevOps doit savoir expliquer en entretien',
          "ConfigMaps et Secrets : l'erreur de configuration que vous ne commettrez JAMAIS",
        ],
      },
      {
        emoji: '🎯',
        titre: 'Repartez opérationnel, pas spectateur',
        items: [
          'TP fil rouge : une application complète déployée de bout en bout — par vous',
          'Évaluation finale corrigée en direct : sachez exactement où vous en êtes',
        ],
      },
    ],
    cible: {
      pour: [
        'Vous êtes développeur et « ça tourne sur Kubernetes » reste une boîte noire.',
        'Vous administrez des serveurs et les conteneurs arrivent dans votre périmètre.',
        'Vous préparez un entretien ou une certification et il vous faut du concret, vite.',
        'Votre équipe migre sur Kubernetes et vous refusez de subir la migration.',
      ],
      pasPour: [
        { texte: "Vous n'avez jamais touché ni Linux ni Docker — contactez-nous d'abord pour valider votre point de départ." },
        { texte: "Vous cherchez du très avancé (opérateurs, service mesh, multi-cluster) — parlons plutôt d'un programme sur mesure." },
      ],
    },
    ctaUrgence: 'Sessions dès 1 participant, accès en 24 h : la prochaine date peut être la vôtre.',
    ctaProjection: 'Demain à 17 h, votre application tournera sur un cluster Kubernetes réel.',
    argumentsMarketing: [
      'Travaux pratiques sur un cluster Azure (AKS) réel, avec un espace dédié par stagiaire',
      'Une seule journée : le format le plus efficace pour débloquer un sujet technique',
      'Support de cours, fiches de commandes, énoncés et corrigés fournis',
    ],
  },

  'facturation-electronique-pennylane': {
    accroche: 'Septembre 2026 : serez-vous prêt quand vos factures PDF seront refusées ?',
    promesse:
      "Aujourd'hui, la réforme de la facturation électronique est un brouillard d'acronymes et d'échéances. Dans deux jours, vous saurez exactement ce qu'elle impose à VOTRE entreprise, vous repartirez avec votre plan de mise en conformité — et Pennylane sera devenu votre allié du quotidien.",
    clusters: [
      {
        emoji: '⚡',
        titre: 'La réforme décodée — avant qu’elle ne vous coûte cher',
        items: [
          'Facture PDF vs facture électronique : la différence qui peut bloquer votre trésorerie',
          'E-invoicing, e-reporting, Plateforme Agréée : le jargon enfin traduit en langage humain',
          'Le schéma en Y : comprenez où passent vos factures (et vos données)',
          "Le calendrier 2026-2027 appliqué à votre entreprise — et ce qui arrive si vous attendez",
          'Sanctions : les amendes jusqu’à 15 000 €/an... et les vrais coûts cachés',
        ],
      },
      {
        emoji: '📋',
        titre: 'Votre plan de conformité — pas celui du voisin',
        items: [
          'Choisir sa Plateforme Agréée : les critères que les vendeurs ne mettent pas en avant',
          'La checklist de mise en conformité complète — repartez avec la vôtre',
          'Cas pratiques par profil : artisan, commerçant, prestataire, e-commerçant — lequel êtes-vous ?',
          'Atelier diagnostic : votre état des lieux personnalisé, corrigé en direct',
        ],
      },
      {
        emoji: '💶',
        titre: 'Pennylane : de zéro à autonome',
        items: [
          'Votre première facture conforme : devis → facture → envoi, en quelques clics',
          'Factures fournisseurs : la réception automatique qui vide votre boîte mail',
          'Rapprochement bancaire : la comptabilité qui se construit (presque) toute seule',
          'Trésorerie en temps réel et relances automatiques : retrouvez le sommeil',
          'Atelier fil rouge : un cycle complet de facturation, réalisé par VOUS',
        ],
      },
    ],
    cible: {
      pour: [
        'Vous dirigez une TPE/PME et vos factures partent encore en Word, Excel ou PDF.',
        'Vous êtes indépendant et la réforme vous semble être « un truc de comptables ».',
        "Vous gérez l'administratif d'une petite structure et voulez anticiper au lieu de subir.",
        'Votre cabinet vous propose Pennylane et vous voulez en tirer le maximum.',
      ],
      pasPour: [
        { texte: 'Vous pilotez la direction financière d’un grand groupe déjà outillé — cette formation vise les TPE/PME.' },
        { texte: "Vous cherchez surtout à exploiter l'IA dans votre quotidien professionnel", redirige: 'ia-pour-tous' },
      ],
    },
    ctaUrgence: "Septembre 2026 approche : chaque mois d'avance est un mois de sérénité gagné.",
    ctaProjection: 'Dans deux jours, votre plan de conformité sera prêt — et Pennylane n’aura plus de secrets.',
    argumentsMarketing: [
      'Formation non technique, pensée pour les dirigeants et leurs équipes — sans prérequis',
      'Un environnement de démonstration Pennylane par participant : vous manipulez, vous ne regardez pas',
      'Checklist de conformité et plan d’action 30 jours inclus, prêts à appliquer',
    ],
  },

  'ia-pour-tous': {
    accroche: "Ils gagnent 5 heures par semaine avec l'IA. Pourquoi pas vous ?",
    promesse:
      "Aujourd'hui, vous utilisez peut-être ChatGPT « de temps en temps », sans méthode. Après 80 heures 100 % pratiques, l'IA rédigera avec vous, analysera vos documents, créera vos visuels et automatisera vos tâches répétitives — et vous saurez exactement quand lui faire confiance, et quand vous méfier.",
    clusters: [
      {
        emoji: '🧠',
        titre: "Comprenez enfin ce que l'IA sait (et ne sait pas) faire",
        items: [
          'ChatGPT, Claude, Gemini, Mistral : lequel est fait pour VOUS ?',
          'Le secret des utilisateurs efficaces : pourquoi ils combinent plusieurs IA',
          "Hallucinations : repérez les erreurs de l'IA avant qu'elles vous coûtent du temps",
          'Vie privée : les données à ne jamais partager avec une IA',
        ],
      },
      {
        emoji: '✍️',
        titre: 'Des réponses dix fois meilleures, systématiquement',
        items: [
          'La méthode en 4 étapes qui transforme vos résultats dès le premier jour',
          'Les techniques des utilisateurs avancés, expliquées simplement',
          'Configurez une fois, gagnez du temps pour toujours : projets et assistants personnalisés',
          "Votre bibliothèque de prompts : l'actif qui prend de la valeur chaque semaine",
        ],
      },
      {
        emoji: '⏱️',
        titre: 'Gagnez des heures dès la première semaine',
        items: [
          'E-mails, courriers, CV : rédigez en 5 minutes ce qui prenait une heure',
          'Contrats et rapports : faites-les analyser avant de les lire en détail',
          "RAG : branchez l'IA sur VOS documents et obtenez des réponses fiables et sourcées",
          "Deep Research : un rapport documenté en 10 minutes au lieu d'une journée",
          'Langues, organisation, apprentissage : votre assistant personnel disponible 24 h/24',
        ],
      },
      {
        emoji: '🎨',
        titre: 'Créez ce que vous pensiez réservé aux professionnels',
        items: [
          'Images de qualité : les bons outils et les bons prompts',
          'Vidéos sans caméra, voix et musique : ce qui est réellement possible aujourd’hui',
          'Votre site web sans coder — publié pendant la formation',
          'Présentations professionnelles en quelques minutes',
        ],
      },
      {
        emoji: '🤖',
        titre: "Passez à la vitesse supérieure : l'IA qui AGIT",
        items: [
          "Vos premiers agents IA : quand l'IA arrête de répondre et commence à agir",
          'Connecteurs et MCP : reliez votre IA à Gmail, votre agenda, vos outils',
          'Automatisez vos tâches répétitives — sans écrire une ligne de code',
          "Deepfakes et arnaques : reconnaissez les contenus falsifiés avant d'en être victime",
          'Atelier final : repartez avec VOTRE boîte à outils IA personnalisée',
        ],
      },
    ],
    cible: {
      pour: [
        "Vous entendez parler d'IA partout et vous refusez de rester sur le quai.",
        'Vous utilisez déjà ChatGPT « un peu », sans méthode ni résultats constants.',
        'Vous êtes entrepreneur, salarié ou indépendant et vos journées sont trop courtes.',
        "Vous voulez aussi protéger votre famille des arnaques et deepfakes qui explosent.",
      ],
      pasPour: [
        { texte: 'Vous êtes développeur et voulez construire des applications IA', redirige: 'ia-for-tech' },
        { texte: 'Vous voulez lancer un business entier opéré par des agents IA', redirige: 'ia-for-business' },
      ],
    },
    ctaUrgence: "Chaque semaine sans méthode, ce sont 5 heures que vous ne récupérerez pas.",
    ctaProjection: 'Dans quelques semaines, vos proches vous demanderont comment vous faites tout ça.',
    argumentsMarketing: [
      'Aucun prérequis : pensée pour les non-techniciens, du premier clic aux agents IA',
      'Vous manipulez à chaque séance, sur VOS cas d’usage — pas des exemples théoriques',
      'Planning des séances défini avec vous : compatible avec une activité professionnelle',
    ],
  },

  'ia-for-business': {
    accroche: 'Et si des agents IA travaillaient pour votre business pendant que vous dormez ?',
    promesse:
      "Aujourd'hui, vous avez une idée (ou l'envie d'en trouver une) et pas d'équipe. En 100 heures, vous lancez un micro-business réel : idée validée par le marché, marque et site en ligne, premiers prospects contactés — et une équipe d'agents IA qui prospecte, publie, facture et répond à vos clients.",
    clusters: [
      {
        emoji: '🏗️',
        titre: "Les fondations d'un business AI-first",
        items: [
          "L'état d'esprit AI-first : penser processus avant outils — l'erreur que font 90 % des entrepreneurs",
          'Agent, chatbot, automatisation : investissez au bon endroit dès le départ',
          'Votre boîte à outils Claude + MCP + n8n : installée, configurée, opérationnelle',
        ],
      },
      {
        emoji: '🔍',
        titre: "Trouvez l'idée qui rapporte — avant d'investir un euro",
        items: [
          'Agents de recherche : détectez tendances, niches et douleurs de marché',
          'Validez votre idée en quelques jours, pas en six mois',
          'Analyse concurrentielle automatisée : la veille qui tourne sans vous',
          'Testez votre pricing face à des clients simulés — avant de vous lancer',
          'Business plan et prévisionnel co-construits : prêts pour un banquier',
        ],
      },
      {
        emoji: '🛠️',
        titre: 'Construisez sans développeur',
        items: [
          'Marque, logo, ton de voix : votre identité créée avec l’IA',
          'Votre site et votre landing page en ligne — pendant la formation',
          'Services productisés : l’offre qui se vend comme un produit',
          'Votre CRM opérationnel sans compétences techniques',
        ],
      },
      {
        emoji: '📈',
        titre: 'Vendez pendant que vous faites autre chose',
        items: [
          'Agents de prospection : des prospects qualifiés qui vous attendent chaque matin',
          'Cold outreach personnalisé à grande échelle — dans les règles du RGPD',
          'Votre machine à contenu : des posts qui se rédigent et se publient',
          'Un agent commercial sur votre site, disponible 24 h/24',
          'SEO et publicité assistés : amplifiez ce qui marche déjà',
        ],
      },
      {
        emoji: '⚙️',
        titre: 'Opérez en pilote automatique',
        items: [
          'Support client RAG : un SAV branché sur votre base de connaissances',
          "Devis, factures, relances : l'administratif qui se gère (presque) seul",
          'Tableaux de bord : vos KPIs collectés et analysés chaque semaine',
          "L'agent d'amélioration continue : votre funnel optimisé en boucle",
        ],
      },
      {
        emoji: '🎯',
        titre: 'Pilotez — et lancez pour de vrai',
        items: [
          'Orchestrez vos agents comme une équipe qui travaille ensemble',
          "RGPD et AI Act : restez serein pendant que d'autres improvisent",
          'Le ROI de chaque automatisation : quoi automatiser, quoi garder humain',
          'Projet fil rouge : repartez avec VOTRE micro-business lancé — pas une maquette',
        ],
      },
    ],
    cible: {
      pour: [
        "Vous avez une idée de business qui dort depuis des mois faute de temps ou d'équipe.",
        'Vous êtes indépendant ou dirigeant de TPE et vous voulez faire plus, sans embaucher.',
        "Vous voyez passer les success stories « IA + solo business » et voulez la méthode, pas le mythe.",
        'Vous êtes porteur de projet et refusez de brûler votre épargne avant d’avoir validé le marché.',
      ],
      pasPour: [
        { texte: "Vous voulez d'abord maîtriser l'IA dans votre quotidien avant de penser business", redirige: 'ia-pour-tous' },
        { texte: 'Vous êtes développeur et voulez construire vous-même des applications IA', redirige: 'ia-for-tech' },
      ],
    },
    ctaUrgence: 'Pendant que vous hésitez, vos concurrents outillent leurs agents.',
    ctaProjection: 'À la dernière séance, vous ferez la démonstration de VOTRE business — en ligne, opérationnel.',
    argumentsMarketing: [
      'Projet fil rouge : vous lancez un vrai micro-business, jalonné et évalué à chaque module',
      'Aucun prérequis technique : les fondamentaux IA sont couverts au module 1',
      'Gabarits inclus : prompts business, landing page, séquences de prospection, grilles ROI',
    ],
  },

  'ia-for-tech': {
    accroche: "RAG, agents, MCP, evals : les compétences que les recruteurs s'arrachent.",
    promesse:
      "Vous savez coder, et les tutoriels IA vous laissent au stade du prototype. En 100 heures, vous concevez, sécurisez et déployez une application agentique complète — RAG, MCP, evals, guardrails — au niveau d'exigence de la production. Elle rejoint votre portfolio ; les compétences, votre CV.",
    clusters: [
      {
        emoji: '🧬',
        titre: 'Les fondamentaux qui font la différence en entretien',
        items: [
          "L'architecture des LLM au juste niveau : ce qu'un tech lead doit savoir expliquer",
          'Tokens, contexte, inférence : les implications concrètes dans votre code',
          'Petit modèle ou frontier ? La grille de décision qui divise vos coûts',
          'Open-source en local avec Ollama : souveraineté et données sensibles',
          'Context engineering : la compétence qui a remplacé le prompt engineering',
        ],
      },
      {
        emoji: '🔌',
        titre: 'Intégrez comme en production, pas comme en démo',
        items: [
          'Les APIs Anthropic, OpenAI, Gemini : les différences qui comptent vraiment',
          'Retries, rate limits, coûts : le wrapper que tout code de production devrait avoir',
          'Tool use : donnez des capacités d’action au modèle — en gardant le contrôle',
          'Sorties structurées : du JSON validé Pydantic/Zod, jamais de parsing hasardeux',
          'Multimodal : vision, documents et audio via API, en pratique',
        ],
      },
      {
        emoji: '📚',
        titre: 'Le RAG que les tutoriels ne vous montrent pas',
        items: [
          'Votre premier pipeline complet — en moins de 100 lignes',
          'Hybrid search et reranking : les gains que la plupart des équipes laissent sur la table',
          "Agentic RAG : quand l'agent décide quoi chercher, où et quand",
          'RAG, fine-tuning ou long contexte ? Le framework de décision',
        ],
      },
      {
        emoji: '🤖',
        titre: 'Des agents qui tiennent en production',
        items: [
          'ReAct, planning, mémoire : les architectures agentiques décortiquées',
          'LangGraph : des workflows stateful avec validation humaine',
          'MCP : consommez des serveurs — puis construisez et publiez le VÔTRE',
          'Sandboxing : faites agir un agent sans mettre en danger votre système',
          'Multi-agents : orchestrateur et sous-agents qui coopèrent vraiment',
        ],
      },
      {
        emoji: '🛡️',
        titre: 'Livrez fiable, sûr et conforme',
        items: [
          'Evals et LLM-as-judge : la compétence la plus demandée du marché',
          'Prompt injection et OWASP LLM Top 10 : attaquez pour mieux défendre',
          'Caching, fallbacks, routing multi-modèles : des coûts divisés, des pannes invisibles',
          'RGPD et AI Act : ce que la réglementation change dans vos architectures',
        ],
      },
      {
        emoji: '🚀',
        titre: 'Le développeur orchestrateur',
        items: [
          'Claude Code en profondeur : spec-driven development, agents parallèles, CI/CD',
          "Workflows d'équipe : revues IA, CLAUDE.md, contexte partagé",
          'Projet final : votre application agentique déployée — dans votre portfolio',
        ],
      },
    ],
    cible: {
      pour: [
        'Vous êtes développeur et vos POC IA ne passent jamais le cap de la production.',
        'Vous êtes data engineer ou architecte et le sujet « agents » arrive dans votre roadmap.',
        'Vous êtes tech lead et votre équipe attend de vous une vision claire du paysage IA.',
        'Vous préparez votre prochain poste et voulez des preuves, pas des badges en ligne.',
      ],
      pasPour: [
        { texte: 'Vous ne programmez pas — commencez par l’IA au quotidien', redirige: 'ia-pour-tous' },
        { texte: 'Vous voulez lancer un business opéré par des agents, sans coder', redirige: 'ia-for-business' },
      ],
    },
    ctaUrgence: "Les postes « AI engineer » se multiplient : ceux qui savent déployer passent devant.",
    ctaProjection: 'À la fin, vous montrerez une application agentique en production — pas un notebook.',
    argumentsMarketing: [
      'Environnements pré-configurés : vous codez dès la première heure, clés API et infra fournies',
      'Un projet final réel dans votre portfolio, construit brique par brique',
      'Le paysage 2026 sans dogmatisme : SDKs, frameworks et arbitrages justifiés',
    ],
  },
};

export function getVenteById(id) {
  return ventes[id];
}
