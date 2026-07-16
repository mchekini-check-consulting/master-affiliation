---
title: "Estimation & Vélocité"
description: "Story points, échelle de Fibonacci, Planning Poker, calcul de la vélocité et autres techniques d'estimation agile."
categorie: "agilite"
ordre: 5
---

Techniques d'estimation agile et mesure de la performance d'équipe.

## 🎯 Story Points

Les story points sont une estimation **relative** de la complexité, pas une mesure de temps.

### 🧮 Échelle de Fibonacci

```text
1   2   3   5   8   13   21   ∞
```

L'écart croissant entre les valeurs reflète l'incertitude grandissante : plus une story est grosse, moins l'estimation est précise.

### 📏 Critères d'estimation

- **Complexité :** difficulté technique
- **Effort :** temps de développement
- **Incertitude :** risques et inconnues
- **Dépendances :** interactions avec d'autres composants

### 💡 Exemple de référence

| Points | Exemple |
|--------|---------|
| 1 | Correction de typo |
| 2 | Ajout d'un champ simple |
| 3 | Nouvelle page basique |
| 5 | Fonctionnalité avec logique métier |
| 8 | Intégration API complexe |
| 13 | Refactoring majeur |
| 21+ | À découper en plus petites stories |

### ⚠️ Bonnes pratiques

- Estimation relative, pas absolue
- Toute l'équipe participe
- Pas de conversion en heures
- Réévaluer si nécessaire

## 🃏 Planning Poker

Technique collaborative d'estimation.

### 🎮 Déroulement

1. Le PO présente la User Story
2. L'équipe pose des questions
3. Chacun choisit sa carte en secret
4. Révélation simultanée des cartes
5. Discussion des écarts
6. Nouveau vote si nécessaire

**✅ Avantages :**

- Évite l'effet d'ancrage
- Encourage la discussion
- Implique toute l'équipe
- Révèle les incompréhensions

### 🎯 Exemple de session

```text
Story : "Ajouter un système de notation produit"

Alice : 5    Bob : 8    Carol : 3    Dave : 5
```

Discussion : Bob pense à l'intégration avec les avis clients, Carol se concentre sur l'UI simple. Après clarification → consensus sur 5.

### 🛠️ Outils

- Cartes physiques
- Planning Poker Online
- Applications Scrum Poker
- Jira Planning Poker

## 📊 Vélocité d'Équipe

Mesure et utilisation de la capacité d'équipe.

### 📈 Calcul de la vélocité

```text
Sprint 1 : 23 points terminés
Sprint 2 : 27 points terminés
Sprint 3 : 25 points terminés

Vélocité moyenne : 25 points/sprint
```

### 🎯 Utilisation

- Planification des sprints futurs
- Prévisions de livraison
- Engagement d'équipe réaliste
- Détection des anomalies

### ⚠️ Attention aux pièges

- Ne pas comparer les équipes entre elles
- Éviter la pression sur la vélocité
- Stabilisation sur 3-5 sprints
- Prendre en compte les variations

> **Piège d'entretien :** la vélocité est un outil de planification interne à l'équipe, pas un indicateur de performance. Comparer la vélocité de deux équipes n'a aucun sens : les points sont relatifs à chaque équipe.

### 📊 Facteurs d'influence

- Composition de l'équipe
- Complexité du domaine
- Qualité du backlog
- Obstacles externes
- Apprentissage et formation

## 🛠️ Autres Techniques d'Estimation

### T-Shirt Sizing

Estimation par tailles, idéale pour l'estimation rapide d'epics :

- **XS** — Très simple
- **S** — Simple
- **M** — Moyen
- **L** — Complexe
- **XL** — Très complexe

### Dot Voting

Vote par points :

- Chacun a 3-5 points à distribuer
- Vote sur les priorités
- Rapide et visuel
- Bon pour les workshops

### Affinity Estimation

Estimation par affinité :

- Regroupement par similarité
- Estimation relative rapide
- Bon pour de gros backlogs
- Travail en silence puis discussion
