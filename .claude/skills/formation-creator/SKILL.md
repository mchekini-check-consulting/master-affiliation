---
name: formation-creator
description: Crée une nouvelle formation éligible Qualiopi sur Hi-Tech Academy à partir d'un programme (PDF, texte ou simple idée). Utiliser dès que l'utilisateur veut ajouter une formation, un programme de formation, des quizz ou des documents Qualiopi à hi-tech-academy. Pose des questions par lots et fait valider chaque contenu (faits clés, sections Qualiopi, quizz, documents), puis génère les documents Qualiopi (programme, déroulé pédagogique, tableau croisé, quizz PDF, plaquette, support PPTX), met à jour le site vitrine (formations.jsx), le backend (catalogues de quizz Java) et l'admin. Prépare tout mais ne commit/push qu'après validation explicite.
---

# Formation Creator — Ajout d'une formation Qualiopi sur Hi-Tech Academy

Répertoire de travail : `hi-tech-academy/` (monorepo master-affiliation). Tout le flux est
**itératif** : ne jamais générer un livrable sans avoir fait valider son contenu à l'utilisateur.
Méthode : **proposer d'abord, faire valider ensuite** — rédiger des brouillons complets et les
soumettre via `AskUserQuestion` (par lots de 2 à 4 questions) plutôt que poser des questions
ouvertes. Si l'utilisateur a déjà fourni une information, ne pas la redemander.

## Architecture à respecter (décisions actées)

- Le catalogue de formations reste **codé en dur** dans `hi-tech-academy/src/data/formations.jsx`
  (pas de migration BDD). Le site vitrine (`Home.jsx`, `/inscription/:formationId`) et l'admin
  (`src/pages/admin/FormationsView.jsx`) lisent ce fichier — les mettre à jour revient à éditer ce
  seul catalogue.
- Les quizz backend sont **dupliqués par formation** : une classe catalogue Java par formation,
  sur le modèle des classes Kubernetes existantes (pas de refonte générique).
- Le skill **prépare tout** (code, PDF, PPTX, build de vérification) et **s'arrête avant le
  commit**. Commit + push sur `main` uniquement après validation explicite — le pipeline
  `.github/workflows/hi-tech-academy.yml` build les deux images et redéploie la VM.

## Étape 0 — Lire l'existant avant tout

Ne jamais générer à l'aveugle. Ouvrir et utiliser comme modèles :

| Rôle | Fichier |
|---|---|
| Catalogue formations (modèle complet : keyFacts, qualiopiSections) | `src/data/formations.jsx` |
| Test de positionnement (modèle Java) | `back/src/main/java/fr/hitechacademy/registration/PositioningTestCatalog.java` |
| Évaluation finale (modèle Java) | `back/src/main/java/fr/hitechacademy/registration/FinalEvaluationCatalog.java` |
| Câblage des catalogues (GET catalogue + correction à la soumission) | `back/.../registration/RegistrationController.java` |
| Analyse du besoin (niveaux prérequis codés en dur) | `back/.../registration/NeedsAnalysis.java`, `src/pages/AnalyseBesoin.jsx`, `src/pages/ApprenantQuestionnaire.jsx` |
| Constantes ORG (SIRET, NDA, IBAN, contact) | `src/lib/billingPdf.js` (objet `ORG`, lignes ~8-21) |
| Générateurs PDF existants (style de référence) | `src/lib/certificatePdf.js`, `src/lib/surveyPdf.js` |
| Documents Qualiopi publiés | `public/documents/` et `public/documents/qualiopi/` |
| Masters PDF | `documents_finaux/` (les sources éditables n'existent pas : ce skill crée les siennes, voir Étape 5) |
| Vues admin à vérifier (listes de documents potentiellement codées en dur) | `src/pages/admin/DocumentsView.jsx`, `AuditQualiopiView.jsx`, `FormationsView.jsx` |

Ouvrir aussi 2 PDF de référence pour caler le style visuel des documents générés :
`public/documents/Programme_Kubernetes_Fondamentaux_V1.0.pdf` et
`public/documents/qualiopi/Deroule_pedagogique_V1.0.pdf` (outil Read, ce sont des PDF).

## Étape 1 — Entrée : le programme de formation

L'utilisateur fournit un programme sous une forme quelconque : PDF, texte collé, ou simple
sujet (« une formation Terraform »). Le lire/parser et en extraire un maximum de pré-remplissage.
Ce qui manque sera couvert par les questions — ne poser que les questions dont la réponse
n'est pas déductible du programme fourni.

## Étape 2 — Questions : identité et faits clés

Proposer des valeurs par défaut inspirées de la formation Kubernetes et faire valider par lots
(`AskUserQuestion`) :

1. **Titre** (ex. « Terraform – Fondamentaux ») et **tag** (ex. « Infrastructure & Cloud »).
2. **Identifiant** : kebab-case dérivé du titre (ex. `terraform-fondamentaux`) — sert de route
   `/inscription/:formationId`, vérifier l'unicité dans `formations.jsx`.
3. **keyFacts** (6 entrées, icônes lucide-react comme l'existant) : Durée (+ horaires), Modalité,
   Tarif (HT/TTC — TVA 20 %), Délai d'accès, Effectif, Sanction.
4. **Image** : proposer de réutiliser une image de `public/images/`, d'en télécharger une
   (libre de droits) ou que l'utilisateur en fournisse une. La déposer dans `public/images/`.
5. **Version** : `Programme V1.0 du <date du jour au format JJ/MM/AAAA>`.

## Étape 3 — Questions : contenu Qualiopi (qualiopiSections)

Rédiger un brouillon complet de chaque section, le montrer, faire valider/amender section par
section (regrouper les validations par lots). Sections attendues (mêmes `id` que l'existant) :

- `public-prerequis` — public visé + prérequis techniques (liens vers Livret d'accueil et
  Règlement intérieur comme dans l'existant).
- `objectifs` — objectifs opérationnels **numérotés** (ils alimentent le tableau croisé et le
  déroulé : chaque objectif doit être couvert par une séquence et une évaluation).
- `methodes` — méthodes mobilisées, moyens pédagogiques et techniques.
- `evaluation` — modalités d'évaluation : test de positionnement en amont, évaluations pendant,
  évaluation finale QCM /10 + pratique /10 (seuil 12/20), satisfaction à chaud/froid.
- `acces` — délai et modalités d'accès.
- `handicap` — accessibilité PSH (reprendre le texte standard + lien
  `/documents/qualiopi/Accessibilite_handicap_V1.0.pdf`).
- `indicateurs` — indicateurs de résultats (première session : « indicateurs disponibles à
  l'issue de la première session » si aucune donnée).

Faire aussi valider le **programme détaillé** : séquences par demi-journée avec horaires,
durées, contenus et objectif(s) couvert(s) — c'est la matière du Programme PDF, du déroulé
pédagogique et du tableau croisé.

## Étape 4 — Questions : quizz et analyse du besoin

Proposer des brouillons complets, faire valider question par question (ou par lot) :

1. **Test de positionnement** — sur le modèle Kubernetes : 6 QCM sur les **prérequis** (pas sur
   le sujet lui-même), regroupés en 2 sections, + `SELF_LEVELS` (3 niveaux d'auto-évaluation
   adaptés au sujet) + `KNOWN_TERMS` (5 termes du domaine). Les bonnes réponses ne vivent que
   côté serveur ; **mélanger l'ordre des options** (la bonne réponse ne doit pas toujours être
   au même index).
2. **Évaluation finale** — 10 QCM couvrant le sujet de la formation, chaque objectif numéroté
   couvert par au moins une question. Barème /10, + partie pratique /10 notée par le formateur.
3. **Analyse du besoin** — les niveaux `level_linux` / `level_docker` / `level_kubernetes` sont
   codés en dur (entité `NeedsAnalysis`, formulaires `AnalyseBesoin.jsx` /
   `ApprenantQuestionnaire.jsx`, export `surveyPdf.js`). Demander les **3 domaines de prérequis**
   de la nouvelle formation, puis adapter les **libellés côté frontend par formationId** (map
   locale dans les formulaires et dans `surveyPdf.js`) en réutilisant les 3 mêmes colonnes
   backend — ne pas ajouter de colonnes. Vérifier au moment de l'exécution comment ces champs
   sont affichés dans `RequestsView.jsx` et adapter de la même façon.

## Étape 5 — Génération des documents

Générer **tous** les documents propres à la formation. Convention de nommage :
`<Type>_<Sujet>_V1.0.pdf` (ex. `Programme_Terraform_Fondamentaux_V1.0.pdf`).

### Méthode PDF

Les PDF existants n'ont pas de sources : en créer. Écrire des sources **HTML autonomes**
(CSS inline, format A4, en-tête HI-TECH ACADEMY avec les infos de l'objet `ORG` de
`billingPdf.js`, pied de page avec SIRET/NDA) dans `hi-tech-academy/documents_source/<formation-id>/`,
puis convertir :

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu \
  --no-pdf-header-footer --print-to-pdf="<sortie>.pdf" "<source>.html"
```

Caler la mise en page sur les PDF Kubernetes existants (typo sobre, tableaux, encadrés).
Vérifier visuellement chaque PDF généré (Read) avant de le publier.

### Documents à produire

| Document | Contenu | Destination |
|---|---|---|
| **Programme** | identité de la formation, public/prérequis, objectifs, programme séquencé, méthodes, évaluation, accessibilité, tarif, contacts, version/date | `public/documents/` (référencé par le champ `pdf` de formations.jsx) + `documents_finaux/` |
| **Déroulé pédagogique** | tableau chronologique des séquences : horaires, durée, contenus, méthode, supports, évaluation | `public/documents/qualiopi/` + `documents_finaux/` |
| **Tableau croisé objectifs / contenus / évaluations** | 1 ligne par objectif numéroté → séquences qui le couvrent → question(s) du QCM final + critère pratique | `public/documents/qualiopi/` + `documents_finaux/` |
| **Test de positionnement (PDF)** | version imprimable du quizz validé (avec grille de correction en dernière page) | `public/documents/qualiopi/` + `documents_finaux/` |
| **Évaluation finale QCM (PDF)** | idem pour l'évaluation finale | `public/documents/qualiopi/` + `documents_finaux/` |
| **Plaquette commerciale** | 1-2 pages : accroche, bénéfices, faits clés, programme résumé, CTA inscription | `public/documents/qualiopi/` + `documents_finaux/` |
| **Support de cours (PPTX)** | voir ci-dessous | `documents_finaux/` (+ PDF dans `public/documents/qualiopi/`) |

### Support de cours PPTX

1. Faire valider le **plan** (1 section par séquence du déroulé, ~5-10 slides par heure de
   formation : titre, objectifs, contenu, schémas, TP/démo, récap).
2. Générer avec un script Node + `pptxgenjs` exécuté dans le scratchpad
   (`npm i pptxgenjs` dans un dossier temporaire, ne rien installer dans le repo).
   Charte : couleurs et polices du site (voir `tailwind.config.js` et `index.html`).
3. Sortie : `Support_de_cours_<Sujet>_V1.0.pptx` dans `documents_finaux/`.
4. Pour la version publiée : si `soffice` (LibreOffice) est disponible, convertir
   (`soffice --headless --convert-to pdf`) ; sinon générer en parallèle une version HTML→PDF
   du support (même contenu) pour `public/documents/qualiopi/`.

## Étape 6 — Modifications du code

### Frontend — site vitrine et admin

1. `src/data/formations.jsx` : ajouter l'objet formation complet (id, tag, title, description,
   image, version, pdf, keyFacts, qualiopiSections) en copiant la structure Kubernetes à
   l'identique. Home, page d'inscription et `FormationsView` (admin) suivent automatiquement.
2. `src/pages/admin/DocumentsView.jsx` (et `AuditQualiopiView.jsx` si concerné) : si la liste
   des documents est codée en dur, y ajouter les nouveaux documents.
3. Libellés des niveaux d'analyse du besoin par formationId (cf. Étape 4.3).
4. `src/api/backend.js` + `TestPositionnement.jsx` / `EvaluationFinale.jsx` : passer le
   `formation_id` de la demande (`registration.formation_id`, déjà chargé) aux endpoints
   catalogue (cf. ci-dessous).

### Backend — quizz par duplication

1. Créer `PositioningTest<Sujet>Catalog.java` et `FinalEvaluation<Sujet>Catalog.java` dans
   `back/src/main/java/fr/hitechacademy/registration/`, copies conformes des classes Kubernetes
   (records `QcmQuestion`, `SELF_LEVELS`, `KNOWN_TERMS`, `QUESTIONS`) avec les questions validées.
2. Créer un petit répartiteur `QuizCatalogs.java` : `positioningQuestions(formationId)`,
   `selfLevels(formationId)`, `knownTerms(formationId)`, `finalQuestions(formationId)` —
   un `switch` sur le formationId avec **Kubernetes en défaut** (rétrocompatibilité).
3. `RegistrationController.java` :
   - `GET /registrations/positioning-test` et `GET /registrations/final-evaluation` : accepter
     un paramètre optionnel `formation_id` (défaut : kubernetes) et servir le bon catalogue,
     toujours **sans** l'index de la bonne réponse.
   - Aux soumissions (`POST .../positioning-test`, `.../final-evaluation`, variantes trainees) :
     corriger avec le catalogue correspondant au `formationId` de la demande d'inscription
     (déjà en base sur `RegistrationRequest`).
4. Ne pas toucher aux entités ni au schéma (les réponses sont stockées en JSON, indépendant du
   catalogue). Attention au piège connu : les contraintes CHECK d'enums en base ne se mettent
   pas à jour toutes seules (`ddl-auto=update`) — ne pas ajouter de valeurs d'enum sans le
   signaler.

## Étape 7 — Vérification, récapitulatif, mise en ligne

1. **Builds** : `npm run build` (racine hi-tech-academy) et `./mvnw -q compile` (dans `back/`,
   ou `mvn` si pas de wrapper). Corriger jusqu'au vert.
2. Si possible, lancer l'app en local et vérifier : la formation sur la home, la page
   `/inscription/<id>`, le test de positionnement et l'évaluation finale avec le bon catalogue,
   les liens PDF.
3. **Récapitulatif final** : liste complète des fichiers créés/modifiés, documents générés,
   points d'attention. **S'arrêter là — ne pas commit.**
4. Après validation explicite de l'utilisateur : commit (message en français, préfixé
   `hi-tech-academy : `, style des commits existants) et push sur `main` → le pipeline
   GitHub Actions build les images frontend + backend et redéploie la VM. Rappeler que les
   quizz nécessitent le rebuild du backend (déclenché par le même pipeline).

## Garde-fous

- Jamais de contenu Qualiopi inventé sur les mentions légales/organisme : toutes les infos
  organisme viennent de l'objet `ORG` de `billingPdf.js`.
- Chaque objectif numéroté doit être traçable : programme → déroulé → tableau croisé →
  question d'évaluation. C'est le fil conducteur qu'un auditeur Qualiopi suit.
- Dates réelles uniquement (date du jour pour V1.0), pas de dates fictives.
- Si un document transverse existant (règlement intérieur, livret d'accueil…) semble devoir
  changer, le signaler à l'utilisateur au lieu de le régénérer.
