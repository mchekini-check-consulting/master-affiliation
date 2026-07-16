---
title: "User Stories"
description: "Le format « En tant que… je veux… afin de… », les critères INVEST et la hiérarchie Thème > Epic > User Story."
categorie: "agilite"
ordre: 3
---

Rédaction et gestion des exigences utilisateur.

## 📝 Format Standard d'une User Story

Le template de base :

```text
En tant que [type d'utilisateur],
Je veux [fonctionnalité],
Afin de [bénéfice/valeur].
```

<div class="exemple exemple--bon">

Exemple bien rédigé, avec des critères d'acceptation clairs :

```text
En tant que client e-commerce,
Je veux pouvoir filtrer les produits par prix,
Afin de trouver rapidement des articles dans mon budget.
```

**Critères d'acceptation :**

- Le filtre affiche une fourchette de prix
- Les résultats se mettent à jour en temps réel
- Le nombre de produits trouvés est affiché
- Le filtre peut être réinitialisé

</div>

<div class="exemple exemple--mauvais">

Exemple mal rédigé :

```text
En tant que développeur,
Je veux créer une API REST,
Afin d'avoir une architecture propre.
```

**Problèmes :**

- Perspective technique, pas utilisateur
- Pas de valeur métier claire
- Trop vague et générique
- Pas de critères mesurables

</div>

## 🎯 Critères INVEST

Une bonne User Story doit respecter ces six critères :

- **I — Independent (Indépendante)** : peut être développée dans n'importe quel ordre, sans dépendances fortes.
- **N — Negotiable (Négociable)** : les détails peuvent être discutés et affinés avec l'équipe.
- **V — Valuable (Apporte de la valeur)** : délivre une valeur métier claire pour l'utilisateur final.
- **E — Estimable** : l'équipe peut estimer l'effort nécessaire pour la réaliser.
- **S — Small (Petite)** : peut être terminée dans un sprint (généralement 1-8 story points).
- **T — Testable** : possède des critères d'acceptation clairs et vérifiables.

## 🏗️ Hiérarchie des Exigences

Les exigences s'organisent du plus large au plus précis :

- **🎯 Thème** — vision globale. Ex : « Améliorer l'expérience d'achat »
- **📚 Epic** — grande fonctionnalité. Ex : « Système de recommandations »
- **📝 User Story** — fonctionnalité spécifique. Ex : « Recommander des produits similaires »

### Exemple de décomposition

```text
Thème : Plateforme e-commerce moderne
└── Epic : Gestion du panier d'achat
    ├── Ajouter un produit au panier
    ├── Modifier la quantité d'un produit
    ├── Supprimer un produit du panier
    ├── Sauvegarder le panier pour plus tard
    └── Calculer les frais de livraison
```
