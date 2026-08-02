# NaturaPrep — Préparation Naturalisation & Blog

Plateforme web complète pour les articles, ressources et contenus relatifs à la naturalisation française.

- **Frontend** : Application React/Angular avec blog optimisé SEO (nginx)
- **Backend** : API REST Spring Boot (8080)
- **Database** : PostgreSQL 16

## Architecture

```
reverse-proxy (port 80/443)
     ↓
naturalisation.check-consulting.net
     ↓
natura-prep (nginx interne, port 80)
     ↓
      ├─ /           → Pages React/Angular (SSR/SSG pour SEO)
      ├─ /blog       → Contenu blog
      └─ /api        → Proxy vers natura-prep-back:8080
            ↓
      natura-prep-back (Spring Boot)
            ↓
      natura-prep-db (PostgreSQL)
```

## Services Docker

### Local Development

```bash
docker compose pull natura-prep-db natura-prep-back natura-prep
docker compose up -d natura-prep-db natura-prep-back natura-prep
```

### Services

| Service | Image | Port Interne | Description |
|---------|-------|--------------|-------------|
| `natura-prep-db` | postgres:16-alpine | 5432 | Base de données |
| `natura-prep-back` | ghcr.io/mchekini-check-consulting/master-affiliation/natura-prep-back | 8080 | API Spring Boot |
| `natura-prep` | ghcr.io/mchekini-check-consulting/master-affiliation/natura-prep | 80 | Frontend React + proxy /api |

## Variables d'Environnement

| Variable | Défaut | Description |
|----------|--------|-------------|
| `NATURA_PREP_DB_PASSWORD` | changeme | Mot de passe PostgreSQL |

## Domaine & DNS

Pointer `naturalisation.check-consulting.net` vers le serveur.

Le reverse proxy sert la conf `reverse-proxy/conf.d/natura-prep.conf`.

## Déploiement

Pipeline GitHub Actions : `.github/workflows/natura-prep.yml`

Déclenché automatiquement si `natura-prep/**` change sur `main`.

## Stack

- **Frontend** : React 19 (ou Angular) + Vite + Node 24
- **Backend** : Spring Boot 3.4 + Java 21
- **Database** : PostgreSQL 16
- **Reverse Proxy** : nginx 1.27 + Let's Encrypt
- **Registry** : GitHub Container Registry (GHCR)
