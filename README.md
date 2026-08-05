# master-affiliation

Monorepo de sites d'affiliation optimisés SEO. Chaque site est un projet
indépendant dans son propre répertoire, construit avec [Astro](https://astro.build)
(génération statique → HTML pur, excellent pour le SEO), packagé en image
Docker (nginx) et déployé sur une VM via GitHub Actions.

## Structure

```
master-affiliation/
├── docker-compose.yml        # Compose global (tous les services)
├── .env                      # Configuration : port et tag d'image de chaque site
├── .github/workflows/
│   ├── _deploy-project.yml   # Workflow réutilisable (build → GHCR → deploy VM)
│   ├── hi-tech-academy.yml   # Pipeline hi-tech-academy (fullstack : images front + back)
│   ├── parents-malins.yml    # Pipeline parents-malins (déclenchée si parents-malins/** change)
│   ├── prepa-technique.yml   # Pipeline prepa-technique (déclenchée si prepa-technique/** change)
│   ├── my-way.yml            # Pipeline my-way (fullstack : images back + front)
│   ├── qualiopilote.yml      # Pipeline qualiopilote (fullstack : images back + front)
│   ├── natura-prep.yml       # Pipeline natura-prep (fullstack : images front + back)
│   ├── immo-scrapper.yml     # Pipeline immo-scrapper (fullstack : images back + front)
│   └── echecs360.yml         # Pipeline echecs360 (monolithe : une image)
├── hi-tech-academy/          # Hi-Tech Academy (hi-tech-academy.fr) — React/Vite (SPA) + Spring Boot + PostgreSQL
│   └── back/                 # API Spring Boot : demandes d'inscription, analyse du besoin, espace admin
├── parents-malins/           # Parents Malins (parents-malins.fr) — Astro statique → nginx
├── prepa-technique/          # Prépa Technique (preparation.check-consulting.net) — Astro statique → nginx
├── my-way/                   # My Way (freelance-now.fr) — Angular + Spring Boot + PostgreSQL
│   ├── back/                 # API Spring Boot (Dockerfile multi-stage Maven → JRE 21)
│   └── front/                # Front Angular (Dockerfile multi-stage Node → nginx, proxifie /api)
├── qualiopilote/             # Qualiopilote (qualiopilote.fr) — Angular (prérendu SEO) + Spring Boot + PostgreSQL
│   ├── back/                 # API Spring Boot (Dockerfile multi-stage Maven → JRE 21)
│   └── front/                # Front Angular SSG (Dockerfile multi-stage Node → nginx, proxifie /api)
├── natura-prep/              # NaturaPrep (naturalisation.check-consulting.net) — Vite JS + Spring Boot + PostgreSQL
├── immo-scrapper/            # Immo Scrapper (immo-scrapper.check-consulting.net) — Angular + Spring Boot + PostgreSQL
│   ├── back/                 # API Spring Boot (Dockerfile multi-stage Maven → JRE 21)
│   └── front/                # Front Angular (Dockerfile multi-stage Node → nginx, proxifie /api)
└── echecs360/                # Échecs360 (echecs360.fr) — Spring Boot monolithe : SSR Thymeleaf (SEO) + app d'échecs JS + H2
```

## Développement local

```bash
cd parents-malins
npm install
npm run dev        # http://localhost:4321
npm run build      # génère dist/
```

Tout lancer avec Docker :

```bash
docker compose up -d --build
```

## CI/CD

- Branche de déploiement : `main`.
- Chaque projet a sa pipeline, filtrée sur son répertoire (`paths: parents-malins/**`).
  Un push qui ne touche que `parents-malins/` ne rebuild et ne redéploie **que** parents-malins.
- La pipeline : build de l'image → push sur GHCR
  (`ghcr.io/mchekini-check-consulting/master-affiliation/<projet>`, tags
  `latest` + SHA du commit) → SSH sur la VM → `docker compose pull <projet> &&
  docker compose up -d --no-deps <projet>` (seul le service du projet est
  redémarré, les autres ne bougent pas).

### Secrets GitHub Actions à configurer

| Secret       | Description                  |
|--------------|------------------------------|
| `VM_HOST`    | IP ou hostname de la VM      |
| `VM_USER`    | Utilisateur SSH              |
| `VM_SSH_KEY` | Clé privée SSH               |

### Prérequis sur la VM

- Docker + le plugin Docker Compose (v2).
- Le repo cloné dans `/opt/master-affiliation` :
  ```bash
  sudo git clone https://github.com/mchekini-check-consulting/master-affiliation.git /opt/master-affiliation
  ```
- Premier déploiement complet : `cd /opt/master-affiliation && docker compose up -d`.

## Ajouter un nouveau projet

1. Copier un projet existant : `cp -r parents-malins mon-site` puis adapter
   `package.json` (name), `astro.config.mjs` (site) et `robots.txt`.
2. Ajouter un service dans le `docker-compose.yml` racine (copier le bloc
   `parents-malins`) et déclarer son tag d'image dans le `.env` racine.
3. Copier `.github/workflows/parents-malins.yml` → `mon-site.yml` et remplacer
   `parents-malins` par `mon-site`.
