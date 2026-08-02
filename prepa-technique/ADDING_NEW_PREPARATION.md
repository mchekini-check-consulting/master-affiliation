# Guide : Ajouter une nouvelle préparation

Ce guide explique comment ajouter du contenu pour une nouvelle préparation (Business Analyst, QA, DevOps, etc.).

## Architecture actuelle

```
Préparations disponibles:
├── fullstack         ✅ En ligne (62 fiches)
├── business-analyst  🔄 En préparation (stub)
├── qa                🔄 En préparation (stub)
└── devops            🔄 En préparation (stub)

Modes d'entraînement:
├── Fiches & Quiz     ✅ En ligne
├── Simulation        ✅ En ligne (2 scénarios fullstack)
├── Quiz              ✅ En ligne
└── Codingame         🔄 À venir
```

---

## Étape 1 : Rédiger les fiches

### 1.1 Créer les fichiers markdown

**Localisation:** `src/content/fiches/{categorie}/{slug}.md`

Exemple pour Business Analyst:

```
src/content/fiches/ba-requirements/        # Nouvelle catégorie
├── recueil-besoin.md
├── user-stories.md
├── mockups-wireframes.md
└── specifications.md

src/content/fiches/ba-modeling/
├── uml-basics.md
├── diagrammes-cas-usage.md
└── diagrammes-sequences.md
```

### 1.2 Template d'une fiche

```markdown
---
title: "Recueil du besoin"
description: "Techniques et bonnes pratiques pour collecter les exigences"
categorie: "ba-requirements"
ordre: 1
preparations: ["business-analyst"]
---

Votre contenu markdown ici...

## Section 1
...

### Exemples

#### ✓ Correction
```
Code ou texte correct
```

#### ✗ À corriger
```
Code ou texte à éviter
```

---

## Étape 2 : Créer les quiz

### 2.1 Fichier quiz

**Localisation:** `src/data/quiz/{slug}.json`

**Template:**
```json
{
  "questions": [
    {
      "question": "Quelle est la différence entre user story et use case ?",
      "code": null,
      "lang": null,
      "options": [
        "Une user story est narrative, un use case est structuré",
        "Il n'y a pas de différence",
        "Une user story est pour les devs, un use case pour les métier",
        "Use case est plus court"
      ],
      "reponse": 0,
      "explication": "Une user story (en contexte Agile) raconte une fonctionnalité du point de vue utilisateur, tandis qu'un use case (plus classique) détaille les interactions entre acteurs et système de manière structurée."
    },
    {
      "question": "...",
      "code": null,
      "lang": null,
      "options": [...],
      "reponse": 0,
      "explication": "..."
    }
  ]
}
```

**Guidelines:**
- 3-5 questions par fiche
- Explication courte mais précise (1-2 phrases)
- Options claires et plausibles
- Code optionnel (JSON: `code: null`)

### 2.2 Matching slug

Slug du quiz **doit correspondre exactement** au slug de la fiche:

```
Fiche: src/content/fiches/ba-requirements/recueil-besoin.md
Quiz:  src/data/quiz/recueil-besoin.json
       ↑ slug identique
```

---

## Étape 3 : Ajouter des scénarios d'entretien

### 3.1 Créer le fichier de scénarios

**Localisation:** `src/data/interview-scenarios/{preparation}.json`

Exemple: `src/data/interview-scenarios/business-analyst.json`

```json
{
  "scenarios": [
    {
      "id": "ba-requirements-01",
      "title": "Entretien : Recueil du besoin pour une plateforme e-learning",
      "description": "Imaginez une plateforme d'apprentissage en ligne. Comment collecteriez-vous les besoins ?",
      "duration_min": 45,
      "questions": [
        {
          "id": "q1",
          "question": "Décrivez votre approche pour collecter les besoins. Qui interrogeriez-vous en priorité ?",
          "type": "discussion",
          "guidance": [
            "Identifier les stakeholders (apprenants, instructeurs, admins, sponsors)",
            "Techniques d'entretien (questions ouvertes vs fermées)",
            "Documentation des besoins",
            "Priorisation et gestion des conflits"
          ],
          "model_answer": "Approche multi-stakeholders : 1) Apprenants (utilisateurs finaux) pour comprendre leur expérience d'apprentissage. 2) Instructeurs pour les besoins pédagogiques. 3) Admins pour les contraintes système. 4) Sponsors pour les objectifs business. Technique: entretiens 1:1 (30 min chacun), brainstorming groupe, questionnaires. Documentation: user journeys, cas d'usage, stories. Priorisation: MoSCoW (Must/Should/Could/Won't).",
          "estimated_time_min": 15
        }
      ]
    }
  ]
}
```

### 3.2 Structure des questions

```typescript
interface InterviewQuestion {
  id: string;                  // Unique per scenario (q1, q2, ...)
  question: string;            // La question posée
  type: 'open' | 'code' | 'discussion'; // Type de question
  guidance?: string[];         // Points clés à couvrir (optionnel)
  model_answer?: string;       // Réponse modèle complète (optionnel)
  estimated_time_min?: number; // Durée estimée (optionnel)
}
```

---

## Étape 4 : Mettre à jour les catégories

### 4.1 Créer une nouvelle catégorie (si nécessaire)

**Fichier:** `src/data/categories.ts`

Actuellement limité aux 7 catégories existantes. Pour ajouter une catégorie BA:

```typescript
export const categories: Categorie[] = [
  // ... existants ...
  {
    slug: 'ba-requirements',      // Nouveau slug unique
    label: 'Recueil du besoin',   // Affichage
    description: 'Techniques et bonnes pratiques...',
  },
  {
    slug: 'ba-modeling',
    label: 'Modélisation',
    description: 'UML, cas d\'usage, diagrammes...',
  },
];
```

**⚠️ Important:** Mettez à jour aussi `content.config.ts`:

```typescript
categorie: z.enum([
  'craftmanship',
  'git',
  'devops',
  'java',
  'spring',
  'agilite',
  'maven',
  'ba-requirements',   // NOUVEAU
  'ba-modeling',       // NOUVEAU
  // ...
]),
```

---

## Étape 5 : Vérifier et tester

### 5.1 Build local

```bash
npm run build
```

Vérifiez qu'aucune erreur n'apparaît.

### 5.2 Dev server

```bash
npm run dev
# Ouvrez http://localhost:4321
```

Testez:
- [ ] Page de préparation: `/business-analyst/` → voit les fiches
- [ ] Fiche individuelle: `/ba-requirements/recueil-besoin/` → quiz s'affiche
- [ ] Mode Quiz: `/fullstack/quiz/` → nouveau thème visible
- [ ] Simulation: `/fullstack/simulation/` → nouveau scénario visible

### 5.3 Sidebar

Vérifiez que le sidebar filtre correctement:

```typescript
// Dans une fiche BA, le sidebar doit montrer:
// ✅ Toutes les fiches BA
// ✅ Pas de fiches Fullstack
// ✅ "Fiches à venir" pour catégories vides
```

---

## Bonnes pratiques

### Content

1. **Cohérence de format**
   - Respectez le style des fiches existantes
   - Utilisez le même système d'exemples (✓/✗)
   - Headings: h2 pour sections, h3 pour sous-sections

2. **Quiz**
   - Une question par concept clé
   - Explications éducatives, pas juste "c'est la bonne réponse"
   - Options plausibles (pas de piège débile)

3. **Scénarios d'entretien**
   - Réalistes et basés sur expérience vraie
   - Guidance points pour guider l'interviewer
   - Réponses modèles exhaustives mais concises

### Données

1. **Noms de fichiers**
   - Kebab-case: `recueil-besoin.md`, pas `recueil_besoin` ou `RecueilBesoin`
   - Slugs uniques (pas de collision entre préparations)

2. **Frontmatter**
   - `ordre`: numéro séquentiel dans la catégorie (1, 2, 3, ...)
   - `preparations`: array exact (ex: `["business-analyst"]`)
   - `description`: court (1 phrase, ~80 caractères)

3. **JSON (quiz, scénarios)**
   - Formattage: 2 spaces d'indentation
   - Pas de trailing commas
   - Valide JSON (testez avec `jsonlint`)

---

## Workflow recommandé

```
1. Rédiger fiches markdown (src/content/fiches/)
2. Créer quizzes associés (src/data/quiz/)
3. Ajouter scénarios d'entretien (src/data/interview-scenarios/)
4. Mettre à jour categories.ts et content.config.ts
5. npm run build → vérifier zéro erreur
6. npm run dev → tester pages et navigation
7. Commit et push
```

---

## Exemple complet : Business Analyst

### Structure finale

```
src/
├── content/fiches/
│   ├── ba-requirements/
│   │   ├── recueil-besoin.md
│   │   ├── user-stories.md
│   │   └── mockups-wireframes.md
│   └── ba-modeling/
│       ├── uml-basics.md
│       └── diagrammes-cas-usage.md
├── data/
│   ├── quiz/
│   │   ├── recueil-besoin.json
│   │   ├── user-stories.json
│   │   ├── mockups-wireframes.json
│   │   ├── uml-basics.json
│   │   └── diagrammes-cas-usage.json
│   └── interview-scenarios/
│       └── business-analyst.json
└── pages/
    └── business-analyst/
        ├── index.astro (👈 page de prep, replace le stub)
        └── modes/index.astro (optional: hub modes)
```

### Généré automatiquement

```
Routes créées:
- /business-analyst/                 (page fullstack → liste fiches)
- /ba-requirements/recueil-besoin/   (fiche + quiz)
- /ba-requirements/user-stories/     (fiche + quiz)
- /business-analyst/simulation/      (simulation mode)
- /business-analyst/quiz/            (quiz personnalisé)

Pages:
- 5 fiches = 5 pages
- 1 page simulation
- 1 page quiz
= 7 pages nouvelles
```

---

## Checklist avant commit

- [ ] Tous les fichiers markdown ont le frontmatter complet
- [ ] `preparations: ["business-analyst"]` sur chaque fiche
- [ ] Slugs quiz match slugs fiches
- [ ] `npm run build` passe sans erreur
- [ ] Zéro console warnings
- [ ] Pages visibles en dev server
- [ ] Sidebar affiche contenu correctement
- [ ] Quiz et scénarios chargent données sans erreur
- [ ] Format JSON valide (testez avec jsonlint)
- [ ] Liens de navigation cohérents

---

## FAQ

**Q: Puis-je avoir des fiches partagées entre préparations ?**
R: Oui ! Mettez `preparations: ["fullstack", "business-analyst"]` dans le frontmatter. La fiche s'affichera dans les deux préparations.

**Q: Comment ajouter une nouvelle catégorie ?**
R: 1) Créer dossier `src/content/fiches/ma-categorie/`. 2) Ajouter slug dans `content.config.ts`. 3) Ajouter dans `categories.ts` si vous voulez qu'elle s'affiche.

**Q: Les anciens slugs fullstack restent valides ?**
R: Oui. Routes `/craftmanship/code-de-qualite/` etc continuent de fonctionner même après restructuration.

**Q: Comment générer PDF des fiches ?**
R: Future feature. Pour l'instant, les utilisateurs peuvent faire Ctrl+P → PDF depuis le navigateur.

---

## Support & Troubleshooting

**Build échoue avec erreur "preparations must be":**
→ Vérifiez que `preparations` est un array: `["ba"]`, pas `"ba"`.

**Fiche n'apparaît pas dans sidebar:**
→ 1) Vérifiez `preparations: ["business-analyst"]`. 2) Vérifiez `categorie` correspond à dossier. 3) `npm run build` et redémarrez dev server.

**Quiz ne charge pas:**
→ Vérifiez slug JSON exact match slug fiche (ex: `recueil-besoin.json` pour `recueil-besoin.md`).

**Simulation scénario ne se charge pas:**
→ Vérifiez JSON valide avec un linter en ligne. Vérifiez `interview-scenarios/{preparation}.json` existe.

---

## Prochaines évolutions

- [ ] UI pour ajouter des fiches sans redémarrer dev server
- [ ] Validation automatique des frontmatter
- [ ] Script d'import depuis Google Docs / Notion
- [ ] Éditeur visuel pour quiz (drag & drop)
- [ ] Admin panel pour gestion de contenu

