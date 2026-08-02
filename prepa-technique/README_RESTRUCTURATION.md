# Restructuration Prépa Technique - Vue d'ensemble

Date : Août 2026

## Quoi de neuf ?

L'application Prépa Technique a été restructurée pour supporter :

1. **Multiples préparations** : Dev Full Stack (✅), Business Analyst, QA, DevOps
2. **Multiples modes d'entraînement** : Fiches & Quiz (✅), Simulation (✅), Quiz libre (✅), Codingame
3. **Navigation améliorée** : Hub de sélection, pages de préparation, modes par préparation

## Routes importantes

### Accueil
- **`/`** - Sélection de préparation + vue des 4 modes

### Préparation Fullstack
- **`/fullstack/`** - Toutes les 62 fiches de Fullstack
- **`/fullstack/modes/`** - Hub de sélection des 4 modes (guide de révision)
- **`/fullstack/simulation/`** - Mode simulation d'entretien (2 scénarios)
- **`/fullstack/quiz/`** - Mode quiz personnalisé (61 thèmes)

### Préparations à venir
- **`/business-analyst/`** - Stub (Programme en cours)
- **`/qa/`** - Stub (Programme en cours)
- **`/devops/`** - Stub (Programme en cours)

### Fiches individuelles
- **`/{categorie}/{slug}/`** - Fiche + quiz + navigation

**Exemple :** `/java/poo-en-java/`, `/spring/spring-boot/`, etc.

## Structure du code

```
src/
├── components/
│   ├── Sidebar.astro ........................ Navigation avec filtrage
│   ├── Quiz.astro .......................... QCM fin de fiche (existant)
│   ├── InterviewSimulation.astro ........... Simulation d'entretien (NEW)
│   └── QuizSession.astro ................... Mode quiz libre (NEW)
├── data/
│   ├── categories.ts ....................... 7 catégories de fiches
│   ├── preparations.ts ..................... 4 préparations (NEW)
│   ├── modes.ts ............................ 4 modes d'entraînement (NEW)
│   ├── quiz/ ............................... 61 fichiers JSON de quiz
│   └── interview-scenarios/fullstack.json .. 2 scénarios (NEW)
├── content/fiches/
│   ├── {categorie}/*.md .................... 62 fiches (enrichies)
│   └── Chaque fiche a : preparations: ["fullstack"]
├── pages/
│   ├── index.astro ......................... Accueil restructuré
│   ├── fullstack/ .......................... Pages fullstack
│   ├── business-analyst/ ................... Stub BA (NEW)
│   ├── qa/ ................................ Stub QA (NEW)
│   ├── devops/ ............................ Stub DevOps (NEW)
│   └── [categorie]/[slug].astro ........... Fiches individuelles
└── styles/global.css ....................... Design system (inchangé)
```

## Nouveaux composants

### InterviewSimulation.astro
Simulation d'entretien technique avec :
- Sélecteur de scénarios
- Questions ouvertes (pas de QCM)
- Guidance points (points clés à couvrir)
- Réponses modèles visibles après réponse
- Débrief final

**Route :** `/fullstack/simulation/`

### QuizSession.astro
Mode Quiz libre avec :
- Sélecteur de thèmes (checkboxes)
- QCM en rafale
- Scoring et résultats
- Feedback personnalisé

**Route :** `/fullstack/quiz/`

## Comment ajouter du contenu

👉 **Lire : `ADDING_NEW_PREPARATION.md`**

Résumé rapide :

### 1. Créer des fiches markdown
```
src/content/fiches/ba-requirements/recueil-besoin.md
```

Frontmatter requis :
```yaml
---
title: "Recueil du besoin"
description: "..."
categorie: "ba-requirements"
ordre: 1
preparations: ["business-analyst"]  # NEW!
---
```

### 2. Créer des quiz
```
src/data/quiz/recueil-besoin.json
```

Le slug **doit matcher** le slug de la fiche.

### 3. Ajouter des scénarios (optional)
```
src/data/interview-scenarios/business-analyst.json
```

### 4. Build & test
```bash
npm run build
npm run dev
```

## Commits de cette restructuration

```
b42e063  Refactor: Restructure app around preparations & modes
eea73cc  Add: Quiz mode (standalone QCM with theme selection)
c80255d  Add: Mode selection page and improve navigation
02199c4  docs: Add comprehensive implementation summary
4412c40  docs: Add guide for adding new preparations
```

## Commandes rapides

```bash
# Développement
npm run dev

# Build production
npm run build

# Preview
npm run preview

# Docker
docker compose up prepa-technique
```

## Statut actuel

✅ **Complétée Phase 1-3:**
- Infrastructure multi-préparations
- 2 modes fonctionnels (Simulation + Quiz)
- Pages stub pour 3 préparations
- 57 pages générées
- 0 erreur de build

🔄 **À faire (moyen terme):**
- Contenu BA/QA/DevOps (~50 fiches + quiz chacun)
- Scénarios d'entretien enrichis
- Mode Codingame (backend)
- Tracking progression

## Documentation complète

- **`IMPLEMENTATION_SUMMARY.md`** (335 lignes) - Tout ce qui a été fait
- **`ADDING_NEW_PREPARATION.md`** (410 lignes) - Guide pas à pas

## Contact / Questions

Consultez les guides ci-dessus ou explorez le code : tout est commenté et typé.
