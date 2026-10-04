---
name: formation-creator
description: Crée une nouvelle formation éligible Qualiopi sur Hi-Tech Academy à partir d'un programme (PDF, texte ou simple idée). Utiliser dès que l'utilisateur veut ajouter une formation, un programme de formation, des quizz ou des documents Qualiopi à hi-tech-academy. Flux ordonné - commence par le nom de la formation, puis description globale et programme, propose les modules et le nombre d'heures et les fait valider, puis construit l'analyse du besoin et le test de positionnement liés à la formation (questions proposées après interview de l'utilisateur, validées ensemble avant tout le reste). Génère ensuite les documents Qualiopi (programme, déroulé pédagogique, tableau croisé, quizz PDF, plaquette, support PPTX), met à jour le site vitrine (formations.jsx, dont le formulaire d'analyse du besoin), le backend (catalogues de quizz Java) et l'admin. Prépare tout mais ne commit/push qu'après validation explicite.
---

# Formation Creator — Ajout d'une formation Qualiopi sur Hi-Tech Academy

Répertoire de travail : `hi-tech-academy/` (monorepo master-affiliation). Tout le flux est
**itératif** : ne jamais générer un livrable sans avoir fait valider son contenu à l'utilisateur.
Méthode : **proposer d'abord, faire valider ensuite** — rédiger des brouillons complets et les
soumettre via `AskUserQuestion` (par lots de 2 à 4 questions) plutôt que poser des questions
ouvertes. Si l'utilisateur a déjà fourni une information, ne pas la redemander.

**Ordre imposé du flux** (ne pas le réordonner) :

1. Nom de la formation — toujours commencer par ça.
2. Description globale + programme fournis par l'utilisateur.
3. Proposition des **modules** puis du **nombre d'heures**, validés avec l'utilisateur.
4. **Analyse du besoin** et **test de positionnement** liés à la formation : interviewer
   l'utilisateur, proposer les questions, et **les valider ensemble avant de procéder au reste**.
5. Seulement ensuite : identité/faits clés, sections Qualiopi, évaluation finale, documents, code.

## Architecture à respecter (décisions actées)

- Le catalogue de formations reste **codé en dur** dans `hi-tech-academy/src/data/formations.jsx`
  (pas de migration BDD). Le site vitrine (`Home.jsx`, `/inscription/:formationId`) et l'admin
  (`src/pages/admin/FormationsView.jsx`) lisent ce fichier — les mettre à jour revient à éditer ce
  seul catalogue.
- L'**analyse du besoin et le test de positionnement sont liés à la formation** :
  - côté front, `formations.jsx` expose `getNeedsLevels(formationId)` (map
    `needsLevelsByFormation` : les 3 domaines d'auto-évaluation de l'analyse du besoin) et
    `getQuizTexts(formationId)` (textes du test de positionnement et de l'évaluation finale) ;
    les formulaires `AnalyseBesoin.jsx` / `ApprenantQuestionnaire.jsx`, l'admin
    (`RequestsView.jsx`) et l'export `surveyPdf.js` les consomment déjà ;
  - côté back, `QuizCatalogs.java` route vers un catalogue Java par formation (switch sur le
    formationId, **Kubernetes en défaut**).
- Les quizz backend sont **dupliqués par formation** : une classe catalogue Java par formation,
  sur le modèle des classes existantes (pas de refonte générique).
- Le skill **prépare tout** (code, PDF, PPTX, build de vérification) et **s'arrête avant le
  commit**. Commit + push sur `main` uniquement après validation explicite — le pipeline
  `.github/workflows/hi-tech-academy.yml` build les deux images et redéploie la VM.

## Étape 0 — Lire l'existant avant tout

Ne jamais générer à l'aveugle. Ouvrir et utiliser comme modèles :

| Rôle | Fichier |
|---|---|
| Catalogue formations (modèle complet : keyFacts, qualiopiSections) + maps `needsLevelsByFormation` / `quizTextsByFormation` en fin de fichier | `src/data/formations.jsx` |
| Tests de positionnement (modèles Java ; prendre aussi un exemple récent, ex. Pennylane ou IA) | `back/src/main/java/fr/hitechacademy/registration/PositioningTestCatalog.java` et `PositioningTest*Catalog.java` |
| Évaluations finales (modèles Java) | `back/.../registration/FinalEvaluationCatalog.java` et `FinalEvaluation*Catalog.java` |
| Répartiteur de catalogues par formation | `back/.../registration/QuizCatalogs.java` |
| Câblage des catalogues (GET catalogue + correction à la soumission) | `back/.../registration/RegistrationController.java` |
| Analyse du besoin (entité + formulaires + export PDF) | `back/.../registration/NeedsAnalysis.java`, `src/pages/AnalyseBesoin.jsx`, `src/pages/ApprenantQuestionnaire.jsx`, `src/lib/surveyPdf.js`, `src/pages/admin/RequestsView.jsx` |
| Constantes ORG (SIRET, NDA, IBAN, contact) | `src/lib/billingPdf.js` (objet `ORG`, lignes ~8-21) |
| Générateurs PDF existants (style de référence) | `src/lib/certificatePdf.js`, `src/lib/surveyPdf.js` |
| Documents Qualiopi publiés | `public/documents/` et `public/documents/qualiopi/` |
| Masters PDF | `documents_finaux/` (les sources éditables n'existent pas : ce skill crée les siennes, voir Étape 6) |
| Vues admin à vérifier (listes de documents potentiellement codées en dur) | `src/pages/admin/DocumentsView.jsx`, `AuditQualiopiView.jsx`, `FormationsView.jsx` |

Ouvrir aussi 2 PDF de référence pour caler le style visuel des documents générés :
`public/documents/Programme_Kubernetes_Fondamentaux_V1.0.pdf` et
`public/documents/qualiopi/Deroule_pedagogique_V1.0.pdf` (outil Read, ce sont des PDF).

## Étape 1 — Nom, description globale, programme

**Commencer par le nom de la formation.** Puis recueillir la matière première, dans cet ordre :

1. **Nom de la formation** : si l'utilisateur ne l'a pas donné, proposer 2-3 intitulés
   (ex. « Terraform – Fondamentaux ») et faire valider. Rien d'autre ne démarre tant que le
   nom n'est pas validé.
2. **Description globale** : demander une description en quelques phrases (sujet, public,
   finalité). En dériver la description du catalogue, la proposer et la faire valider.
3. **Programme** : l'utilisateur le fournit sous une forme quelconque — PDF, texte collé, ou
   simple sujet. Le lire/parser et en extraire un maximum de pré-remplissage. Ce qui manque
   sera couvert par les questions — ne poser que les questions dont la réponse n'est pas
   déductible de ce qui a été fourni.

## Étape 2 — Modules et nombre d'heures (proposés, puis validés)

À partir du nom, de la description et du programme saisis à l'Étape 1 :

1. **Proposer un découpage en modules** : liste numérotée de modules avec, pour chacun, titre,
   contenus couverts et objectif(s) visé(s). Le soumettre à l'utilisateur et l'amender jusqu'à
   validation — ne pas figer le reste (durée, documents) avant.
2. **Proposer le nombre d'heures** : durée totale et répartition par module en séquences par
   demi-journée avec horaires. Faire valider de la même façon. La durée validée alimente les
   keyFacts, le déroulé pédagogique et le programme PDF.

Les modules validés deviennent le **programme détaillé** : séquences par demi-journée avec
horaires, durées, contenus et objectif(s) couvert(s) — c'est la matière du Programme PDF, du
déroulé pédagogique et du tableau croisé.

## Étape 3 — Analyse du besoin et test de positionnement (liés à la formation)

Ces deux questionnaires sont **propres à la formation** et doivent être construits **lors de la
création**, avant tout le reste. Déroulé en trois temps :

### 3.1 Interviewer l'utilisateur

Poser les questions pertinentes (par lots `AskUserQuestion`) pour déterminer la matière des
questionnaires, conformément à Qualiopi (indicateur 4 : analyse du besoin du bénéficiaire ;
indicateur 8 : positionnement à l'entrée) :

- **Public visé** : métiers, profils types, niveau d'étude ou d'expérience attendu.
- **Prérequis réels** : quels savoirs/outils faut-il déjà maîtriser pour suivre la formation ?
- **Les 3 domaines de compétences amont** à auto-évaluer dans l'analyse du besoin (ex. pour
  Kubernetes : Linux, Docker, Kubernetes ; pour Pennylane : facturation, comptabilité, outils
  numériques).
- **Contextes d'usage typiques** : dans quelles situations professionnelles le sujet sera-t-il
  mobilisé (alimente les questions de contexte et de cas d'usage) ?
- **Financements habituels** du public (OPCO, AGEFICE, fonds propres…).

### 3.2 Proposer les questions

Sur la base des réponses, rédiger et soumettre des brouillons complets :

1. **Analyse du besoin** — la trame du formulaire est commune à toutes les formations
   (identité, contexte et besoin, niveau de départ, attentes, contraintes/accessibilité,
   entité `NeedsAnalysis`). La partie propre à la formation : les **3 domaines
   d'auto-évaluation** (libellé de chaque domaine + ses 3 options). Contraintes techniques :
   on réutilise les 3 colonnes backend historiques `level_linux` / `level_docker` /
   `level_kubernetes` (ne pas ajouter de colonnes) et les options doivent rester parmi celles
   reconnues par la note backend (`Débutant`/`Intermédiaire`/`Confirmé` ou
   `Aucune notion`/`Notions`/`Déjà utilisé`). Proposer des **exemples de questions/libellés**
   conformes Qualiopi et les faire choisir/amender.
2. **Test de positionnement** — sur le modèle des catalogues existants : 6 QCM sur les
   **prérequis** (pas sur le sujet lui-même), regroupés en 2 sections, + `SELF_LEVELS`
   (3 niveaux d'auto-évaluation adaptés au sujet) + `KNOWN_TERMS` (5 termes du domaine)
   + les textes d'habillage de `getQuizTexts` (intro, question d'auto-évaluation, question
   ouverte « à quoi sert… », libellés PDF). Les bonnes réponses ne vivent que côté serveur ;
   **mélanger l'ordre des options** (la bonne réponse ne doit pas toujours être au même index).

### 3.3 Valider ensemble avant de continuer

**Point de passage bloquant** : faire valider chaque question (par lot) avec l'utilisateur.
Tant que l'analyse du besoin et le test de positionnement ne sont pas validés, ne pas passer
aux étapes suivantes (identité, documents, code).

## Étape 4 — Identité et faits clés

Proposer des valeurs par défaut inspirées des formations existantes et faire valider par lots
(`AskUserQuestion`) :

1. **Tag** (ex. « Infrastructure & Cloud ») — le titre a déjà été validé à l'Étape 1.
2. **Identifiant** : kebab-case dérivé du titre (ex. `terraform-fondamentaux`) — sert de route
   `/inscription/:formationId`, vérifier l'unicité dans `formations.jsx`.
3. **keyFacts** (6 entrées, icônes lucide-react comme l'existant) : Durée (+ horaires — reprendre
   la durée validée à l'Étape 2), Modalité, Tarif (HT/TTC — TVA 20 %), Délai d'accès, Effectif,
   Sanction.
4. **Image** : proposer de réutiliser une image de `public/images/`, d'en télécharger une
   (libre de droits) ou que l'utilisateur en fournisse une. La déposer dans `public/images/`.
5. **Version** : `Programme V1.0 du <date du jour au format JJ/MM/AAAA>`.

## Étape 5 — Contenu Qualiopi (qualiopiSections) et évaluation finale

Rédiger un brouillon complet de chaque section, le montrer, faire valider/amender section par
section (regrouper les validations par lots). Sections attendues (mêmes `id` que l'existant) :

- `public-prerequis` — public visé + prérequis techniques (issus de l'Étape 3.1 ; liens vers
  Livret d'accueil et Règlement intérieur comme dans l'existant).
- `objectifs` — objectifs opérationnels **numérotés** (ils alimentent le tableau croisé et le
  déroulé : chaque objectif doit être couvert par une séquence et une évaluation).
- `methodes` — méthodes mobilisées, moyens pédagogiques et techniques.
- `evaluation` — modalités d'évaluation : analyse du besoin et test de positionnement en amont,
  évaluations pendant, évaluation finale QCM /10 + pratique /10 (seuil 12/20), satisfaction à
  chaud/froid.
- `acces` — délai et modalités d'accès.
- `handicap` — accessibilité PSH (reprendre le texte standard + lien
  `/documents/qualiopi/Accessibilite_handicap_V1.0.pdf`).
- `indicateurs` — indicateurs de résultats (première session : « indicateurs disponibles à
  l'issue de la première session » si aucune donnée).

**Évaluation finale** — proposer et faire valider : 10 QCM couvrant le sujet de la formation,
chaque objectif numéroté couvert par au moins une question. Barème /10, + partie pratique /10
notée par le formateur (texte `finalPracticalNote` de `getQuizTexts` à adapter).

## Étape 6 — Génération des documents

Générer **tous** les documents propres à la formation, conformes aux modèles des formations
existantes du projet (mêmes gabarits, même nommage). Convention de nommage :
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
| **Test de positionnement (PDF)** | version imprimable du quizz validé à l'Étape 3 (avec grille de correction en dernière page) | `public/documents/qualiopi/` + `documents_finaux/` |
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

## Étape 7 — Modifications du code

### Frontend — site vitrine, formulaires et admin

1. `src/data/formations.jsx` : ajouter l'objet formation complet (id, tag, title, description,
   image, version, pdf, keyFacts, qualiopiSections) en copiant la structure existante à
   l'identique. Home, page d'inscription et `FormationsView` (admin) suivent automatiquement.
2. **Formulaire d'analyse du besoin à jour** : dans le même fichier, ajouter l'entrée de la
   formation dans `needsLevelsByFormation` avec les 3 domaines **validés à l'Étape 3**
   (`{ key, field, label, options }`, colonnes backend réutilisées). `AnalyseBesoin.jsx`,
   `ApprenantQuestionnaire.jsx`, `RequestsView.jsx` (admin) et `surveyPdf.js` suivent
   automatiquement via `getNeedsLevels` — vérifier quand même le rendu dans ces quatre
   consommateurs.
3. Ajouter l'entrée dans `quizTextsByFormation` (textes validés à l'Étape 3.2 et
   `finalPracticalNote` de l'Étape 5) — consommée via `getQuizTexts` par
   `TestPositionnement.jsx`, `EvaluationFinale.jsx` et `surveyPdf.js`.
4. `src/pages/admin/DocumentsView.jsx` (et `AuditQualiopiView.jsx` si concerné) : si la liste
   des documents est codée en dur, y ajouter les nouveaux documents.

### Backend — quizz par duplication

1. Créer `PositioningTest<Sujet>Catalog.java` et `FinalEvaluation<Sujet>Catalog.java` dans
   `back/src/main/java/fr/hitechacademy/registration/`, copies conformes des classes existantes
   (records `QcmQuestion`, `SELF_LEVELS`, `KNOWN_TERMS`, `QUESTIONS`) avec les questions
   **validées aux Étapes 3 et 5**.
2. `QuizCatalogs.java` : ajouter la constante `<SUJET>_ID` et le `case` correspondant dans les
   quatre méthodes (`positioningQuestions`, `selfLevels`, `knownTerms`, `finalQuestions`).
   Kubernetes reste le défaut (rétrocompatibilité).
3. `RegistrationController.java` est déjà câblé sur `QuizCatalogs` (GET catalogue avec
   `formation_id`, correction à la soumission via le formationId de la demande) : vérifier
   qu'aucun câblage supplémentaire n'est nécessaire, ne rien dupliquer.
4. Ne pas toucher aux entités ni au schéma (les réponses sont stockées en JSON, indépendant du
   catalogue). Attention au piège connu : les contraintes CHECK d'enums en base ne se mettent
   pas à jour toutes seules (`ddl-auto=update`) — ne pas ajouter de valeurs d'enum sans le
   signaler.

## Étape 8 — Vérification, récapitulatif, mise en ligne

1. **Builds** : `npm run build` (racine hi-tech-academy) et `./mvnw -q compile` (dans `back/`,
   ou `mvn` si pas de wrapper). Corriger jusqu'au vert.
2. Si possible, lancer l'app en local et vérifier : la formation sur la home, la page
   `/inscription/<id>`, **le formulaire d'analyse du besoin avec les bons domaines**, le test
   de positionnement et l'évaluation finale avec le bon catalogue, les liens PDF.
3. **Récapitulatif final** : liste complète des fichiers créés/modifiés, documents générés,
   points d'attention. **S'arrêter là — ne pas commit.**
4. Après validation explicite de l'utilisateur : commit (message en français, préfixé
   `hi-tech-academy : `, style des commits existants) et push sur `main` → le pipeline
   GitHub Actions build les images frontend + backend et redéploie la VM. Rappeler que les
   quizz nécessitent le rebuild du backend (déclenché par le même pipeline).

## Garde-fous

- Jamais de contenu Qualiopi inventé sur les mentions légales/organisme : toutes les infos
  organisme viennent de l'objet `ORG` de `billingPdf.js`.
- L'analyse du besoin et le test de positionnement d'une formation ne sont jamais recopiés
  d'une autre formation sans passer par l'Étape 3 : les questions sont proposées à partir des
  réponses de l'utilisateur et validées avec lui.
- Chaque objectif numéroté doit être traçable : programme → déroulé → tableau croisé →
  question d'évaluation. C'est le fil conducteur qu'un auditeur Qualiopi suit.
- Dates réelles uniquement (date du jour pour V1.0), pas de dates fictives.
- Si un document transverse existant (règlement intérieur, livret d'accueil…) semble devoir
  changer, le signaler à l'utilisateur au lieu de le régénérer.