# Immo Scrapper

Application de veille immobilière — `immo-scrapper.check-consulting.net`.

## Stack

- **Front** : Angular (SPA) servi par nginx, qui proxifie `/api` vers le backend.
- **Back** : Java 21 / Spring Boot (API sous le context-path `/api`).
- **Base de données** : PostgreSQL 16 (non exposée sur l'hôte).

## Services Docker (compose global à la racine)

| Service              | Rôle                    | Réseau(x)                       |
| -------------------- | ----------------------- | ------------------------------- |
| `immo-scrapper-front`| nginx + build Angular   | `proxy`, `immo-scrapper-net`    |
| `immo-scrapper-back` | API Spring Boot (:8080) | `immo-scrapper-net`             |
| `immo-scrapper-db`   | PostgreSQL 16 (:5432)   | `immo-scrapper-net`             |

Routage : `reverse-proxy` → `immo-scrapper-front:80` → (`/api`) `immo-scrapper-back:8080` → `immo-scrapper-db:5432`.

## Commandes utiles

```bash
# Depuis la racine du monorepo
docker compose up -d --build immo-scrapper-db immo-scrapper-back immo-scrapper-front

# Logs
docker compose logs -f immo-scrapper-back

# Front en dev (une fois le projet Angular scaffoldé)
cd immo-scrapper/front && npm start

# Back en dev (une fois le projet Spring scaffoldé)
cd immo-scrapper/back && ./mvnw spring-boot:run
```

## À savoir

- Chaque annonce est estimée en tâche de fond à partir des ventes réelles DVF
  (fichiers geo-dvf d'Etalab, géocodage BAN) : médiane du prix au m² des ventes
  du même type de bien dans un rayon de 500 m, sinon à l'échelle de la commune.
  La valeur marché (médiane × surface) s'affiche sur chaque annonce.

- Le mot de passe PostgreSQL vient de la variable `IMMO_SCRAPPER_DB_PASSWORD`
  (fichier `.env` sur le serveur, jamais commité).
- Le code applicatif (projet Angular dans `front/`, projet Spring Boot dans
  `back/`) est à scaffolder avec les CLI officiels (`ng new`, Spring Initializr) ;
  les Dockerfiles attendent la structure standard de chacun.

> Pipeline relancée le 7 août 2026 après l'incident GitHub Actions (la prod avait été déployée manuellement).
