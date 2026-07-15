import React from 'react';

// Articles du blog. Pour ajouter un article : ajouter une entrée ici
// (slug unique + contenu JSX), la carte sur l'accueil, la page /blog et
// la page article sont générées automatiquement.
export const blogPosts = [
  {
    slug: 'competences-tech-les-plus-demandees',
    title: 'Les 10 compétences tech les plus demandées en 2026',
    excerpt: 'Découvrez les compétences essentielles pour réussir dans le secteur technologique cette année.',
    date: '15 juin 2026',
    dateISO: '2026-06-15',
    readTime: '5 min',
    image: '/images/c3290df03_feature-2.webp',
    category: 'Carrière',
    content: (
      <>
        <p>
          Le marché de l'emploi tech évolue vite : l'essor de l'IA générative, la généralisation du cloud
          et la pression sur la sécurité redessinent les profils recherchés. Voici les dix compétences qui
          reviennent le plus dans les offres d'emploi en 2026 — et comment les acquérir.
        </p>

        <h2>1. Intelligence artificielle et LLM</h2>
        <p>
          Savoir intégrer des modèles de langage (RAG, agents, fine-tuning léger) dans un produit est devenu
          un différenciateur majeur. Les entreprises ne cherchent pas seulement des data scientists : elles
          veulent des développeurs capables de brancher l'IA sur leurs applications existantes, avec les bons
          garde-fous.
        </p>

        <h2>2. Cloud public (AWS, Azure, GCP)</h2>
        <p>
          La majorité des nouvelles applications naissent dans le cloud. Comprendre les services managés,
          le modèle de facturation et les bases de l'architecture cloud (réseau, IAM, stockage) est un
          prérequis quasi systématique, quel que soit le poste.
        </p>

        <h2>3. Kubernetes et conteneurisation</h2>
        <p>
          Docker et Kubernetes sont devenus le standard de fait pour déployer et opérer des applications.
          Savoir écrire un manifeste, déboguer un Pod, exposer un Service ou gérer la configuration avec des
          ConfigMaps et des Secrets figure explicitement dans un grand nombre d'offres DevOps, cloud et
          backend.
        </p>

        <h2>4. Cybersécurité</h2>
        <p>
          Avec la multiplication des attaques par la chaîne d'approvisionnement et le durcissement
          réglementaire (NIS2, DORA), la sécurité n'est plus un métier à part : chaque développeur et chaque
          ops doit maîtriser les fondamentaux — gestion des secrets, moindre privilège, mises à jour,
          durcissement des images.
        </p>

        <h2>5. Ingénierie de la donnée</h2>
        <p>
          Les pipelines de données alimentent l'IA et la décision. SQL avancé, modélisation, orchestration
          et qualité de données restent des compétences très recherchées, souvent mieux rémunérées que le
          développement web classique.
        </p>

        <h2>6. DevOps, CI/CD et GitOps</h2>
        <p>
          Automatiser le chemin entre le commit et la production : pipelines CI/CD, infrastructure as code
          (Terraform), GitOps (Argo CD, Flux). Les équipes qui livrent vite et bien s'arrachent ces profils.
        </p>

        <h2>7. Développement full-stack moderne</h2>
        <p>
          TypeScript, React côté front, Node ou Java côté back : le socle full-stack reste une valeur sûre,
          à condition d'y ajouter les pratiques d'ingénierie (tests, revues, observabilité) qui font la
          différence en entreprise.
        </p>

        <h2>8. Platform engineering</h2>
        <p>
          Construire des plateformes internes qui rendent les équipes produit autonomes (golden paths,
          self-service, templates) est la suite logique du DevOps — et l'un des intitulés de poste qui a le
          plus progressé ces deux dernières années.
        </p>

        <h2>9. Observabilité et SRE</h2>
        <p>
          Métriques, logs, traces, SLO : opérer un système distribué sans visibilité est impossible. Les
          pratiques SRE se diffusent bien au-delà des grands groupes tech.
        </p>

        <h2>10. Les compétences humaines</h2>
        <p>
          Communication écrite, vulgarisation technique, travail en équipe distribuée : à niveau technique
          égal, ce sont elles qui font la différence en entretien comme en poste.
        </p>

        <h2>Par où commencer ?</h2>
        <p>
          Inutile de tout apprendre de front. Choisissez un socle (développement ou infrastructure), puis
          ajoutez les briques transverses : conteneurs, cloud, sécurité. Si votre objectif est
          l'infrastructure moderne, la maîtrise de Kubernetes est aujourd'hui le meilleur point d'entrée —
          c'est précisément l'objet de notre formation <strong>Kubernetes – Fondamentaux et introduction au GitOps</strong> : 21 heures,
          100 % à distance, avec travaux pratiques sur un cluster réel.
        </p>
      </>
    ),
  },
  {
    slug: 'devenir-developpeur-full-stack-en-6-mois',
    title: 'Comment devenir développeur full-stack en 6 mois',
    excerpt: 'Un guide complet pour maîtriser le développement web moderne et lancer votre carrière.',
    date: '10 juin 2026',
    dateISO: '2026-06-10',
    readTime: '8 min',
    image: '/images/df0155452_istock-2177184303.jpg',
    category: 'Formation',
    content: (
      <>
        <p>
          Devenir développeur full-stack en six mois est ambitieux mais réaliste — à condition d'avoir un
          plan structuré, de pratiquer tous les jours et de construire un portfolio qui prouve vos
          compétences. Voici une feuille de route mois par mois.
        </p>

        <h2>Mois 1 — Les fondations du web</h2>
        <p>
          HTML sémantique, CSS moderne (flexbox, grid), et surtout JavaScript : variables, fonctions,
          tableaux, objets, asynchrone. Ne brûlez pas cette étape — tout le reste repose dessus. Objectif de
          fin de mois : reconstruire de mémoire une page web interactive sans framework.
        </p>

        <h2>Mois 2 — JavaScript avancé et Git</h2>
        <p>
          Approfondissez le langage (closures, promesses, modules) et adoptez TypeScript progressivement.
          Apprenez Git sérieusement : branches, pull requests, résolution de conflits. C'est le quotidien de
          tout développeur en entreprise.
        </p>

        <h2>Mois 3 — Le front avec React</h2>
        <p>
          Composants, état, hooks, routage, appels d'API. Construisez deux ou trois petites applications
          complètes (liste de tâches connectée à une API, tableau de bord météo…). Soignez le déploiement :
          une application en ligne vaut dix projets sur votre disque dur.
        </p>

        <h2>Mois 4 — Le back-end</h2>
        <p>
          Choisissez un écosystème (Node/Express ou Java/Spring Boot) et apprenez à créer une API REST :
          routes, validation, authentification, accès à une base de données relationnelle (PostgreSQL).
          Comprenez ce qu'est une migration, une transaction, un index.
        </p>

        <h2>Mois 5 — Le projet fil rouge</h2>
        <p>
          Construisez une application complète de bout en bout : front React, API, base de données,
          authentification, tests. Choisissez un sujet qui vous ressemble — c'est ce projet que vous
          présenterez en entretien. Ajoutez Docker pour la conteneuriser : c'est un différenciateur réel
          sur un CV junior.
        </p>

        <h2>Mois 6 — Déploiement, finitions et recherche</h2>
        <p>
          Déployez votre projet sur un vrai serveur (VPS, PaaS ou cluster managé), mettez en place un
          pipeline CI/CD minimal, écrivez un README impeccable. En parallèle : CV, profil LinkedIn,
          entraînement aux entretiens techniques (algorithmique de base, questions sur vos projets).
        </p>

        <h2>Les trois erreurs qui font échouer</h2>
        <p>
          <strong>Le tutoriel infini</strong> : regarder des vidéos sans coder soi-même ne crée aucune
          compétence. <strong>La dispersion</strong> : changer de stack toutes les trois semaines remet le
          compteur à zéro. <strong>L'isolement</strong> : sans retours (mentor, communauté, revue de code),
          on répète ses erreurs sans le savoir.
        </p>

        <h2>Et après ?</h2>
        <p>
          Une fois en poste, la progression continue : tests avancés, architecture, cloud, conteneurs.
          C'est souvent à ce moment-là que Kubernetes entre en scène — pour comprendre comment vos
          applications sont réellement déployées et opérées. Notre formation
          <strong> Kubernetes – Fondamentaux et introduction au GitOps</strong> est pensée exactement pour cette étape.
        </p>
      </>
    ),
  },
  {
    slug: 'intelligence-artificielle-dans-l-education',
    title: "L'intelligence artificielle dans l'éducation",
    excerpt: "Comment l'IA transforme l'apprentissage et la formation professionnelle.",
    date: '5 juin 2026',
    dateISO: '2026-06-05',
    readTime: '6 min',
    image: '/images/cbdcfde73_generated_f57bba76.png',
    category: 'Innovation',
    content: (
      <>
        <p>
          L'intelligence artificielle a fait irruption dans tous les domaines, et la formation n'y échappe
          pas. Tuteurs virtuels, parcours adaptatifs, correction automatique : que change réellement l'IA
          pour celles et ceux qui apprennent un métier technique — et où sont ses limites ?
        </p>

        <h2>Un tuteur disponible 24 h/24</h2>
        <p>
          Les assistants basés sur les grands modèles de langage répondent instantanément aux questions,
          reformulent un concept obscur, génèrent des exercices supplémentaires. Pour un apprenant bloqué un
          dimanche soir sur une erreur de configuration, c'est un progrès considérable : le délai entre la
          question et la réponse tombe à quelques secondes.
        </p>

        <h2>Des parcours qui s'adaptent</h2>
        <p>
          L'apprentissage adaptatif ajuste la difficulté et le rythme selon les réponses de l'apprenant :
          celui qui maîtrise avance, celui qui bute reçoit des explications complémentaires. Bien utilisé,
          ce mécanisme réduit deux fléaux de la formation : l'ennui des uns et le décrochage des autres.
        </p>

        <h2>Le formateur augmenté, pas remplacé</h2>
        <p>
          Pour autant, l'IA ne remplace pas ce qui fait la valeur d'une vraie formation : la démonstration
          en direct, le regard expert sur votre code, la correction personnalisée, l'exigence bienveillante
          d'un professionnel qui a rencontré vos problèmes en production. L'IA excelle à répondre à une
          question précise ; le formateur excelle à détecter celle que vous ne posez pas.
        </p>
        <p>
          C'est le parti pris de Hi-Tech Academy : des classes virtuelles synchrones, animées en direct par
          un formateur expert, où l'IA est un outil de plus dans la boîte — pas un substitut à la pédagogie.
        </p>

        <h2>Les limites à garder en tête</h2>
        <p>
          Les modèles de langage peuvent produire des réponses fausses avec aplomb — problématique quand on
          n'a pas encore le recul pour les détecter. La dépendance est l'autre risque : générer une solution
          n'est pas la comprendre. En formation technique, l'objectif reste de savoir faire soi-même,
          l'assistance venant en second.
        </p>

        <h2>Ce que cela change pour votre montée en compétences</h2>
        <p>
          Utilisez l'IA pour accélérer — explorer une notion, déboguer, varier les exercices — mais ancrez
          votre apprentissage dans la pratique réelle : de vrais projets, de vrais environnements, de vrais
          retours humains. C'est ce que nous appliquons dans notre formation
          <strong> Kubernetes – Fondamentaux et introduction au GitOps</strong> : 21 heures en direct avec un formateur, sur un
          cluster réel, où chaque manipulation est faite — et comprise — par le stagiaire.
        </p>
      </>
    ),
  },
];

export function getPostBySlug(slug) {
  return blogPosts.find((p) => p.slug === slug);
}
