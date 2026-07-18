# hi-tech-academy

Application fullstack de Hi-Tech Academy :

- **Front** : React (Vite + Tailwind + shadcn/ui), généré à l'origine avec
  [Base44](https://base44.com), servi par nginx en SPA. Le nginx du front
  proxifie `/api` vers le backend.
- **Back** (`back/`) : API Spring Boot (Java 21) + PostgreSQL — demandes
  d'inscription aux formations (formulaire répliqué du parcours Qualiobee,
  profils entreprise / indépendant / particulier), questionnaire d'analyse
  du besoin (réponses + note de positionnement) et espace admin.

- **Domaine** : https://hi-tech-academy.fr
- **Services Docker** (compose racine) : `hi-tech-academy` (front, port interne 80),
  `hi-tech-academy-back` (API, port interne 8080), `hi-tech-academy-db` (PostgreSQL,
  réseau interne `hi-tech-academy-net`, jamais exposée)
- **Images** : `ghcr.io/mchekini-check-consulting/master-affiliation/hi-tech-academy`
  et `.../hi-tech-academy-back`
- **Pipeline** : `.github/workflows/hi-tech-academy.yml` (déclenchée si `hi-tech-academy/**`
  change sur `main` ; build des 2 images puis redémarrage des services du projet)
- **Variables serveur** (`.env` racine) : `HI_TECH_ACADEMY_DB_PASSWORD`,
  `HI_TECH_ACADEMY_ADMIN_EMAIL` / `HI_TECH_ACADEMY_ADMIN_PASSWORD` (accès `/admin`)

## Commandes utiles

```bash
# Front
npm install
npm run dev        # http://localhost:5173 — /api proxifié vers localhost:8080
                   # (cible modifiable : API_PROXY_TARGET=http://localhost:18080 npm run dev)
npm run build      # génère dist/
npm run lint

# Back (nécessite un PostgreSQL local, cf. variables DB_* de application.properties)
cd back && mvn spring-boot:run

# via Docker, depuis la racine du repo
docker compose up -d --build hi-tech-academy-db hi-tech-academy-back hi-tech-academy
```

## Pages

- `/` — accueil (sections hero, formations, timeline, FAQ, blog…)
- `/inscription/:formationId` — demande d'inscription (3 profils : entreprise,
  indépendant, particulier), enregistrée en base via `POST /api/registrations`
- `/inscription/demande/:id/questionnaire` — questionnaire d'analyse du besoin
  (proposé après l'envoi de la demande ; note calculée sur l'auto-évaluation)
- `/admin` — espace admin (basic auth) : liste des demandes, détail d'un
  apprenant avec réponses au questionnaire et note, validation / refus
- `/mentions-legales`, `/politique-confidentialite`, `/conditions-vente`

## API (`back/`, contexte `/api`, JSON snake_case)

| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/registrations` | public | Dépôt d'une demande d'inscription |
| GET | `/registrations/{id}/public` | public | Suivi minimal (page questionnaire) |
| POST | `/registrations/{id}/needs-analysis` | public | Réponses à l'analyse du besoin |
| GET | `/admin/me` | basic auth | Vérification des identifiants |
| GET | `/admin/registrations` | basic auth | Liste des demandes |
| GET | `/admin/registrations/{id}` | basic auth | Détail + questionnaire + note |
| POST | `/admin/registrations/{id}/status` | basic auth | Valider (`VALIDATED`) / refuser (`REFUSED`) |
