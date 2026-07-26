# Échecs360

Application web d'apprentissage des échecs, en français — https://echecs360.fr

- **Site public SEO** : landing page + blog (articles Markdown rendus côté
  serveur avec Thymeleaf, sitemap.xml dynamique, robots.txt, JSON-LD).
- **Comptes utilisateurs** : inscription / connexion (Spring Security,
  sessions serveur, BCrypt, remember-me).
- **Application d'échecs** (`/app`, connectés uniquement, JS vanilla sans
  build npm) : jeu à deux, bot à Elo réglable 400–2200 (Web Worker, negamax
  alpha-bêta + quiescence), import des 100 dernières parties chess.com,
  relecture et analyse (gaffes/erreurs/imprécisions + graphique d'évaluation).

## Stack

Spring Boot 3 (Java 21, port **8095**) · Thymeleaf SSR · Spring Data JPA +
H2 en fichier (`DATA_DIR`, prêt à migrer vers PostgreSQL) · moteur d'échecs
maison en JavaScript pur (`engine.js`), validé par perft.

## Commandes utiles

```bash
mvn spring-boot:run                 # lance sur http://localhost:8095
mvn test                            # tests JUnit (auth, SSR, validation)
node tests/perft.test.js            # perft 1-4 : 20 / 400 / 8 902 / 197 281
node tests/pgn.test.js              # rejeu d'un PGN chess.com réel
docker build -t echecs360 .         # image de production
```

## Déploiement

Service `echecs360` du docker-compose racine, derrière le reverse-proxy
(`reverse-proxy/conf.d/echecs360.conf`). Volume `echecs360-data` pour la
base H2. Workflow GitHub Actions : `.github/workflows/echecs360.yml`.
