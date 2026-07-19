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
  `HI_TECH_ACADEMY_ADMIN_EMAIL` / `HI_TECH_ACADEMY_ADMIN_PASSWORD` (accès `/admin`),
  et, dans `/opt/master-affiliation/.env.secrets` (fichier non versionné du
  serveur, survit au `git reset --hard` des déploiements) : `MAIL_PASSWORD`
  (mot de passe d'application Google de `contact@hi-techacademy.fr` — sans
  lui, les emails sont désactivés)
- **Emails** (SMTP Google Workspace) : notification à `contact@hi-techacademy.fr`
  quand une demande est transmise (questionnaire complété), email au demandeur
  lors de la validation ou du refus de sa demande

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
  indépendant, particulier), enregistrée en base via `POST /api/registrations`.
  La demande reste `INCOMPLETE` (non transmise à l'admin) tant que le
  questionnaire obligatoire n'est pas renseigné.
- `/inscription/demande/:id/questionnaire` — questionnaire d'analyse du besoin
  (étape 1/2 pour particulier / indépendant ; note calculée sur l'auto-évaluation)
- `/inscription/demande/:id/test-positionnement` — test de positionnement (étape
  2/2, QCM corrigé côté serveur, note /6, non éliminatoire ; `?trainee=<id>` pour
  un salarié). La demande n'est transmise qu'après les deux étapes.
- `/inscription/demande/:id/evaluation-finale` — QCM d'évaluation finale (10
  questions, une seule tentative, note /10 ; `?trainee=<id>` pour un salarié).
  Accessible via le lien envoyé par email depuis l'admin (demande validée).
- `/inscription/demande/:id/questionnaire-commanditaire` — analyse du besoin du
  représentant de l'entreprise (obligatoire pour une entreprise qui inscrit ses
  salariés) ; fournit ensuite le lien apprenant à partager aux salariés
- `/inscription/demande/:id/apprenant` — analyse du besoin individuelle de chaque
  salarié inscrit (identité + auto-évaluation, note /9 ; demandes entreprise uniquement)
- `/admin` — espace admin (basic auth) : liste des demandes, détail d'un
  apprenant avec réponses au questionnaire et note, validation / refus
- `/mentions-legales`, `/politique-confidentialite`, `/conditions-vente`

## Base de données — piège `ddl-auto=update`

Hibernate crée des contraintes SQL `CHECK` sur les colonnes enum
(`@Enumerated(STRING)`) mais **ne les met jamais à jour** : ajouter une valeur
à un enum (ex. `RegistrationStatus.INCOMPLETE` le 19/07/2026) exige un
correctif manuel sur la base de production :

```sql
ALTER TABLE registration_requests DROP CONSTRAINT registration_requests_status_check;
ALTER TABLE registration_requests ADD CONSTRAINT registration_requests_status_check
  CHECK (status IN ('INCOMPLETE','PENDING','VALIDATED','REFUSED'));
```

## API (`back/`, contexte `/api`, JSON snake_case)

| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/registrations` | public | Dépôt d'une demande d'inscription |
| GET | `/registrations/{id}/public` | public | Suivi minimal (page questionnaire) |
| POST | `/registrations/{id}/needs-analysis` | public | Réponses à l'analyse du besoin (INCOMPLETE → PENDING) |
| POST | `/registrations/{id}/sponsor-survey` | public | Analyse du besoin du représentant, entreprises uniquement (INCOMPLETE → PENDING) |
| POST | `/registrations/{id}/trainees` | public | Analyse du besoin d'un apprenant salarié (entreprises uniquement, un par email) |
| GET | `/registrations/positioning-test` | public | Contenu du test de positionnement (sans les bonnes réponses) |
| POST | `/registrations/{id}/positioning-test` | public | Test du demandeur, corrigé serveur (particulier/indépendant ; INCOMPLETE → PENDING) |
| POST | `/registrations/{id}/trainees/{tid}/positioning-test` | public | Test d'un apprenant salarié, corrigé serveur |
| GET | `/registrations/final-evaluation` | public | QCM d'évaluation finale (sans corrigé) |
| POST | `/registrations/{id}/final-evaluation` | public | Soumission de l'évaluation (invitation requise, une tentative) |
| POST | `/registrations/{id}/trainees/{tid}/final-evaluation` | public | Idem pour un apprenant salarié |
| POST | `/admin/registrations/{id}/final-evaluation/send` | basic auth | Envoi (ou renvoi) du QCM par email au demandeur (demande validée) |
| POST | `/admin/registrations/{id}/trainees/{tid}/final-evaluation/send` | basic auth | Idem pour un salarié |
| GET | `/admin/me` | basic auth | Vérification des identifiants |
| GET | `/admin/registrations` | basic auth | Liste des demandes |
| GET | `/admin/registrations/{id}` | basic auth | Détail + questionnaire + note |
| POST | `/admin/registrations/{id}/status` | basic auth | Valider (`VALIDATED`) / refuser (`REFUSED`) |
| POST | `/admin/registrations/{id}/certificate` | basic auth | Émettre le certificat de réalisation : dates de session, durée, note QCM (reprise automatiquement de l'évaluation finale si passée), mise en pratique /10 → total /20 et objectifs atteints/non atteints (seuil 60 %) reportés sur le PDF |
| GET | `/admin/certificates` | basic auth | Liste des certificats émis |
