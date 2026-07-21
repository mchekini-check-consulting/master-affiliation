# qualiopilote

Plateforme SaaS multi-tenant pour organismes de formation **Qualiopilote**
(Java Spring Boot + Angular + PostgreSQL), sur le modèle de `my-way`. Le front
Angular est **prérendu (SSG, `outputMode: static`) pour le SEO** : les pages
publiques sont générées en HTML statique au build et servies par nginx
(indexables directement), avec repli client-side rendering pour l'espace connecté.

Le produit complet et sa feuille de route par phases sont décrits dans
[`PLAN.md`](./PLAN.md). **État actuel** : coquille (landing, connexion de
démonstration, shell back-office) — voir « Front » ci-dessous.

## Front (état actuel)

Routes (`front/src/app/app.routes.ts`) :

- `/` — landing publique (prérendue, SEO) : `pages/landing/`
- `/connexion` — connexion de démonstration, identifiants **test / test**
  (auth factice, `core/auth.service.ts` ; à remplacer par la vraie auth
  multi-tenant en phase 0) : `pages/login/`
- `/app` — back-office protégé par `core/auth.guard.ts` :
  `layout/back-office-layout.component` (sidebar + rubriques du cahier des
  charges, source unique `core/navigation.ts`), tableau de bord
  `pages/dashboard/`, et une page « Bientôt disponible »
  (`shared/placeholder/`) par module.

Stratégie de rendu : `front/src/app/app.routes.server.ts` (landing + connexion
prérendues ; `/app/**` en CSR).

- **Domaine** : https://qualiopilote.fr
- **Services Docker** (compose racine) : `qualiopilote-front` (nginx, port interne 80,
  proxifie `/api`), `qualiopilote-back` (Spring Boot, port interne 8080),
  `qualiopilote-db` (PostgreSQL, réseau interne `qualiopilote-net`, jamais exposée)
- **Images** : `ghcr.io/mchekini-check-consulting/master-affiliation/qualiopilote-front`
  et `.../qualiopilote-back`
- **Pipeline** : `.github/workflows/qualiopilote.yml` (déclenchée si `qualiopilote/**`
  change sur `main` ; build des 2 images puis redémarrage des services du projet)
- **Variable serveur** (`.env` racine) : `QUALIOPILOTE_DB_PASSWORD`

## Initialiser le code applicatif

Le scaffold d'infra est en place (Dockerfiles, nginx, compose, reverse-proxy,
workflow). Il reste à générer le code applicatif avec les CLI officiels :

```bash
# --- Backend : Spring Boot (Java 21, Maven) ---
# Générer via https://start.spring.io dans qualiopilote/back/
#   dépendances : Spring Web, Spring Data JPA, PostgreSQL Driver, Actuator, Validation
# application.properties : API sous /api, datasource par variables d'environnement
#   server.servlet.context-path=/api
#   spring.datasource.url=jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:qualiopilote}
#   spring.datasource.username=${DB_USERNAME:qualiopilote}
#   spring.datasource.password=${DB_PASSWORD:changeme}
#   management.endpoints.web.exposure.include=health

# --- Frontend : Angular avec SSR/prérendu (SEO) ---
cd qualiopilote
ng new qualiopilote --ssr --style=scss --directory=front
# Vérifier dans front/angular.json que outputMode vaut "static" (prérendu SSG)
# et prévoir les routes publiques à prérendre (prerender: true).
```

## Commandes utiles

```bash
# via Docker, depuis la racine du repo
docker compose up -d --build qualiopilote-db qualiopilote-back qualiopilote-front
```
