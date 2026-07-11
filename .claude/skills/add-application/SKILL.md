Automatise l'ajout d'une nouvelle application dans le monorepo. Utiliser cette skill dès que l'utilisateur demande d'ajouter, créer, initialiser ou scaffolder une nouvelle application, un nouveau projet, un nouveau service ou un nouveau site dans le repo — même s'il ne mentionne pas explicitement le mot "application". Elle pose les questions nécessaires (nom, domaine, type), crée le répertoire projet et ses Dockerfiles, met à jour le docker-compose global, ajoute la conf du reverse-proxy dans conf.d et crée le workflow GitHub Actions de build/déploiement.Add App — Ajout d'une nouvelle application dans le monorepo
Étape 1 — Questions à poser à l'utilisateur
Poser ces questions AVANT toute création de fichier. Si l'utilisateur a déjà donné certaines réponses dans sa demande, ne pas les redemander.

Nom de l'application — servira de nom de dossier, de nom de services Docker et de préfixe d'images. Normaliser en kebab-case minuscule (ex: mon-appli). Vérifier qu'aucun dossier du repo ne porte déjà ce nom.
Nom de domaine — ex: app.example.com. Utilisé dans la conf du reverse-proxy.
Type d'application — « front + back (avec base de données) » ou « front seul orienté SEO » ?
Choix de stack :

Si front + back + base de données : demander confirmation explicite → « Je pars sur la stack Java Spring Boot + Angular + PostgreSQL, c'est bien ça ? ». Attendre la confirmation avant de continuer.
Si SEO : annoncer que la stack retenue est Astro (plus optimisé pour le SEO : HTML statique, hydratation partielle, excellentes performances) et confirmer.



Étape 2 — Lire l'existant avant d'écrire
Ne jamais générer à l'aveugle. Avant toute création :

Lister la racine du repo : repérer le docker-compose.yml global, le dossier reverse-proxy/conf.d/, le dossier .github/workflows/ et les applications existantes.
Ouvrir une application existante du même type et s'en servir de modèle : structure des dossiers, style des Dockerfiles, conventions de nommage.
Lire le docker-compose.yml global en entier : identifier le réseau Docker commun (celui du reverse-proxy), les ports déjà utilisés (aucune collision autorisée), le registry des images, le style d'écriture (variables d'env, volumes, healthchecks).
Lire une conf existante de reverse-proxy/conf.d/ : reproduire exactement le même pattern (SSL/certbot ou HTTP simple, headers, upstreams).
Lire un workflow existant de .github/workflows/ : reproduire le même registry, la même méthode de déploiement et les mêmes secrets (secrets.XXX).

Règle d'or : les conventions observées dans le repo priment toujours sur les indications génériques de cette skill.
Étape 3 — Créer le répertoire projet
Créer /<app-name>/ à la racine du repo, sur le modèle des applications existantes :

Fullstack : sous-dossiers back/ (Spring Boot) et front/ (Angular), chacun avec son Dockerfile :

back/Dockerfile : multi-stage Maven (build, cache des dépendances via pom.xml copié d'abord) → JRE 21 alpine, utilisateur non-root, EXPOSE 8080, healthcheck sur /actuator/health.
front/Dockerfile : multi-stage Node (npm ci + build production) → nginx alpine servant le dist/, avec fallback SPA (try_files $uri $uri/ /index.html), EXPOSE 80.


SEO : Dockerfile Astro à la racine du dossier : multi-stage Node (npm ci + npm run build) → nginx alpine servant dist/, cache long (immutable) sur /_astro/, EXPOSE 80. (Si le projet passe en SSR, stage final node sur le port 4321 à la place.)
Ajouter un README.md dans le dossier : nom, domaine, services, commandes utiles.

Ne pas générer le code applicatif complet (projet Angular/Spring/Astro) sauf demande explicite — le scaffolding applicatif se fait avec les CLI officiels (ng new, Spring Initializr, npm create astro).
Étape 4 — Mettre à jour le docker-compose global
Ajouter les services dans la section services: du compose global, en respectant l'indentation et le style existants :

Fullstack : 3 services :

<app-name>-back : image du registry du repo + build: ./<app-name>/back, variables SPRING_DATASOURCE_* pointant sur le service db, depends_on avec condition: service_healthy, restart: unless-stopped.
<app-name>-front : image + build: ./<app-name>/front, restart: unless-stopped.
<app-name>-db : postgres:16-alpine, volume nommé <app-name>-db-data (à déclarer aussi dans volumes:), healthcheck pg_isready. Nom de base/utilisateur en snake_case (postgres n'accepte pas bien les tirets).


SEO : 1 service <app-name> : image + build: ./<app-name>, restart: unless-stopped.

Règles :

Rattacher tous les services au réseau commun du reverse-proxy.
Ne pas exposer de ports sur l'hôte si le reverse-proxy joint les conteneurs via le réseau Docker (vérifier comment font les autres applis).
Aucun secret en dur : mot de passe BDD via variable d'environnement ${<APP_NAME_MAJUSCULE>_DB_PASSWORD}, à ajouter dans .env.example s'il existe.
La BDD n'est jamais exposée sur l'hôte.

Étape 5 — Configuration reverse-proxy
Créer reverse-proxy/conf.d/<app-name>.conf sur le modèle des confs existantes :

Fullstack : server_name <domaine> ; location / → proxy_pass http://<app-name>-front:80 ; location /api/ → proxy_pass http://<app-name>-back:8080/ ; headers proxy standards (Host, X-Real-IP, X-Forwarded-For, X-Forwarded-Proto) ; client_max_body_size cohérent avec les autres confs.
SEO : server_name <domaine> ; location / → proxy_pass http://<app-name>:80 ; mêmes headers.

Reproduire le pattern SSL des confs existantes (certbot/Let's Encrypt, redirection 80→443, chemins des certificats). S'il n'y a pas de SSL dans le repo, rester en HTTP simple.
Étape 6 — Workflow GitHub Actions
Créer .github/workflows/<app-name>.yml sur le modèle des workflows existants :

Déclenchement : push sur main avec filtre paths: ['<app-name>/**', '.github/workflows/<app-name>.yml'] + workflow_dispatch (monorepo : ne builder que si l'appli change).
Job build : checkout, buildx, login au registry du repo, build & push des images taguées latest + ${{ github.sha }} (2 images en fullstack : back et front ; 1 en SEO), cache buildx activé.
Job deploy (needs: build) : même méthode que les workflows existants (typiquement SSH vers le serveur puis docker compose pull <services> et docker compose up -d <services>, suivi d'un docker image prune -f). Réutiliser les secrets déjà présents dans le repo ; si de nouveaux secrets sont nécessaires, les lister à l'utilisateur.

Étape 7 — Vérifications et récapitulatif

Valider le YAML du compose modifié (docker compose config si disponible, sinon relecture attentive de l'indentation).
Vérifier par grep qu'aucun placeholder ou nom générique ne subsiste dans les fichiers créés.
Vérifier qu'aucun port n'entre en collision et que tous les services sont sur le bon réseau.
Mettre à jour l'inventaire des applications (README racine) s'il existe.
Présenter un récapitulatif : fichiers créés, fichiers modifiés, secrets GitHub à créer, entrée DNS à pointer, variable(s) à ajouter au .env du serveur, commandes du premier déploiement.

Checklist anti-erreurs

Nom en kebab-case, aucun dossier existant écrasé
Confirmation de stack obtenue avant génération
Aucune collision de ports dans le compose
Services sur le réseau du reverse-proxy, BDD non exposée
Aucun secret en clair
Workflow avec filtre paths et secrets existants
Conventions du repo respectées (elles priment sur cette skill)