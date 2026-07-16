---
title: "Workflows Git"
description: "GitFlow vs Trunk-based Development : deux organisations des branches, de la structure stricte au flux continu."
categorie: "git"
ordre: 5
---

GitFlow vs Trunk-based Development : deux façons d'organiser les branches d'une équipe, de la structure la plus stricte au flux le plus continu.

## GitFlow

GitFlow est un workflow avec des branches dédiées par type.

```text
main           ────────●────────●────────●
develop        ──●──●──●──●──●──●──●──●
feature/login  ──●──●──●──●
release/v1.2   ────────●──●──●
hotfix/bug-123 ──────────●──●
```

### Branches principales

- **main** : production stable
- **develop** : intégration continue

### Branches de support

- **feature/*** : nouvelles fonctionnalités
- **release/*** : préparation release
- **hotfix/*** : corrections urgentes

### Flux de travail

```bash
# Nouvelle feature
git checkout develop
git checkout -b feature/nouvelle-fonctionnalite
# ... développement ...
git checkout develop
git merge --no-ff feature/nouvelle-fonctionnalite

# Release
git checkout develop
git checkout -b release/v1.2.0
# ... tests et corrections ...
git checkout main
git merge --no-ff release/v1.2.0
git tag v1.2.0

# Hotfix
git checkout main
git checkout -b hotfix/correction-critique
# ... correction ...
git checkout main
git merge --no-ff hotfix/correction-critique
git checkout develop
git merge --no-ff hotfix/correction-critique
```

**✅ Avantages**

- Structure claire et prévisible
- Séparation des environnements
- Gestion des releases structurée
- Hotfixes isolés
- Historique lisible

**❌ Inconvénients**

- Complexité élevée
- Nombreuses branches à maintenir
- Intégration tardive
- Overhead pour petites équipes
- Conflits de merge fréquents

## Trunk-based Development

Le trunk-based development privilégie le développement sur une branche principale.

```text
main      ●──●──●──●──●──●──●──●──●──●
feature-1 ●──●
feature-2 ──●──●
feature-3 ────●──●

Branches courtes (max 2-3 jours) mergées fréquemment
```

### Principes clés

- Une seule branche principale (main/trunk)
- Branches de feature très courtes (< 3 jours)
- Intégration continue obligatoire
- Feature flags pour les fonctionnalités incomplètes
- Tests automatisés robustes
- Déploiement continu

### Flux de travail

```bash
# Développement quotidien
git checkout main
git pull origin main
git checkout -b feature/small-change
# ... développement (max 1-2 jours) ...
git checkout main
git pull origin main
git merge feature/small-change
git push origin main
```

Les fonctionnalités incomplètes sont masquées par des feature flags :

```js
// Avec feature flags
if (featureFlag.isEnabled('NEW_FEATURE')) {
  // Nouvelle fonctionnalité
} else {
  // Ancienne fonctionnalité
}
```

**✅ Avantages**

- Simplicité maximale
- Intégration continue réelle
- Feedback rapide
- Moins de conflits
- Déploiement fréquent
- Collaboration améliorée

**❌ Inconvénients**

- Nécessite une forte discipline
- Tests automatisés obligatoires
- Feature flags complexes
- Difficile pour grandes features
- Risque de casser main

## 🎯 Comparaison et Recommandations

**Utiliser GitFlow quand :**

- Équipe nombreuse (> 10 développeurs)
- Releases planifiées et espacées
- Besoin de stabilité maximale
- Environnements multiples complexes
- Réglementation stricte

**Utiliser Trunk-based quand :**

- Équipe agile (2-10 développeurs)
- Déploiement continu souhaité
- Culture DevOps mature
- Tests automatisés robustes
- Feedback rapide prioritaire

> **Piège d'entretien :** dans GitFlow, un hotfix part de `main` et doit être mergé dans `main` ET dans `develop` — l'oubli du second merge fait réapparaître le bug à la release suivante.
