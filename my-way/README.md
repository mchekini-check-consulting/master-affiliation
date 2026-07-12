# my-way — IndepBoost

Plateforme pour freelances IT (« IndepBoost ») : front **Angular 19** (Tailwind,
rendu repris de la maquette boost-your-freelance), back **Java Spring Boot**
(Java 21), base **PostgreSQL**.

- **Domaine** : https://freelance-now.fr
- **Services Docker** (compose racine) : `my-way-front` (port interne 80),
  `my-way-back` (port interne 8080), `my-way-db` (PostgreSQL 16, jamais exposée)
- **Images** : `ghcr.io/mchekini-check-consulting/master-affiliation/my-way-front` et `…/my-way-back`
- **Pipeline** : `.github/workflows/my-way.yml` (déclenchée si `my-way/**` change sur `main`)

## Architecture

```
reverse-proxy (TLS) ──► my-way-front:80 ──/api──► my-way-back:8080 ──► my-way-db:5432
```

Le nginx du front proxifie `/api` vers le backend (même origine, pas de CORS).
Le backend sert son API sous le context-path `/api` et lit la configuration BDD
via les variables d'environnement `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`,
`DB_PASSWORD` (compose racine, mot de passe via `MY_WAY_DB_PASSWORD`).

## Fonctionnel

- **Pages publiques** : simulateur AE vs SASU (page d'accueil), landing (`/Home`), contact.
- **Authentification basique** : email + mot de passe (session cookie, BCrypt).
  Le bouton « Se connecter avec Google » est présent mais pas encore actif.
- **Espace connecté** (après onboarding en 3 étapes) : dashboard, simulateur
  avancé (AE/SASU/EURL/portage), simulations sauvegardées, communauté,
  missions, bons plans, espace documentaire.
- **Espace documentaire** : documents (PDF, Word, Excel, images) organisés par
  thématique, visionneuse intégrée (PDF/images), téléchargement, recherche
  multicritère. L'administration (upload, thématiques, corbeille 30 j) est
  réservée au rôle `ADMIN` — contrôle appliqué côté API. Fichiers stockés sur
  le volume `my-way-documents` sous identifiant technique, MIME réel vérifié
  (Apache Tika), 20 Mo max (`MAX_UPLOAD_SIZE`). Promotion d'un admin :
  `UPDATE users SET role = 'ADMIN' WHERE email = '...';`

## API (context-path /api, JSON en snake_case)

| Méthode | Endpoint | Accès |
|---|---|---|
| POST | `/auth/register` `/auth/login` `/auth/logout` | public |
| GET / PATCH | `/auth/me` | connecté |
| GET / POST | `/simulations` (`?limit=`) | connecté (scopé utilisateur) |
| DELETE | `/simulations/{id}` | connecté (scopé utilisateur) |
| POST | `/contact-messages` | public |
| GET | `/actuator/health` | public |

## Commandes utiles

```bash
# Front (my-way/front)
npm install && npx ng serve      # http://localhost:4200 (prévoir un proxy /api → :8080)
npx ng build                     # dist/my-way/browser

# Back (my-way/back) — nécessite un PostgreSQL local ou les variables DB_*
./mvnw spring-boot:run           # http://localhost:8080/api

# Tout lancer via Docker, depuis la racine du repo
docker compose up -d --build my-way-db my-way-back my-way-front
```
