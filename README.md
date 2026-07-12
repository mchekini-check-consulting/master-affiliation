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
│   ├── site-a.yml            # Pipeline site-a (déclenchée si site-a/** change)
│   ├── site-b.yml            # Pipeline site-b (déclenchée si site-b/** change)
│   ├── hi-tech-academy.yml   # Pipeline hi-tech-academy (déclenchée si hi-tech-academy/** change)
│   └── my-way.yml            # Pipeline my-way (fullstack : images back + front)
├── site-a/                   # Projet temporaire A (port 3001)
│   ├── Dockerfile            # Build Astro → nginx
│   └── src/                  # Code du site
├── site-b/                   # Projet temporaire B (port 3002)
├── hi-tech-academy/          # Hi-Tech Academy (hi-tech-academy.fr) — React/Vite + Base44, servi en SPA
└── my-way/                   # My Way (my-way.fr) — Angular + Spring Boot + PostgreSQL
    ├── back/                 # API Spring Boot (Dockerfile multi-stage Maven → JRE 21)
    └── front/                # Front Angular (Dockerfile multi-stage Node → nginx, proxifie /api)
```

## Développement local

```bash
cd site-a
npm install
npm run dev        # http://localhost:4321
npm run build      # génère dist/
```

Tout lancer avec Docker :

```bash
docker compose up -d --build
# site-a → http://localhost:3001
# site-b → http://localhost:3002
```

## CI/CD

- Branche de déploiement : `main`.
- Chaque projet a sa pipeline, filtrée sur son répertoire (`paths: site-a/**`).
  Un push qui ne touche que `site-a/` ne rebuild et ne redéploie **que** site-a.
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

1. Copier un projet existant : `cp -r site-a mon-site` puis adapter
   `package.json` (name), `astro.config.mjs` (site) et `robots.txt`.
2. Ajouter un service dans le `docker-compose.yml` racine (copier le bloc
   `site-a`) et déclarer son port dans le `.env` racine.
3. Copier `.github/workflows/site-a.yml` → `mon-site.yml` et remplacer
   `site-a` par `mon-site`.

## Remplacer un projet temporaire par une vraie niche

Les projets `site-a` / `site-b` sont des coquilles de test : il suffit de
remplacer le contenu de `src/` et de mettre à jour le domaine dans
`astro.config.mjs` et `public/robots.txt`. L'infra (Docker, pipeline, compose)
ne change pas.
