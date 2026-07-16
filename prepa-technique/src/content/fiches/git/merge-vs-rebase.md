---
title: "Merge vs Rebase"
description: "Deux approches pour intégrer les changements d'une branche : merge qui préserve l'historique, rebase qui le linéarise."
categorie: "git"
ordre: 1
---

Deux approches existent pour intégrer les changements d'une branche dans une autre. Elles produisent le même code final, mais pas le même historique.

## Git Merge

Le merge préserve l'historique complet : un commit de fusion relie les deux branches.

```text
main:     A---B---C-------F
                   \     /
feature:            D---E

Après merge : le commit F contient les changements de D et E
```

**✅ Avantages**

- Historique complet préservé
- Traçabilité des branches
- Sécurisé (non destructif)

**❌ Inconvénients**

- Historique plus complexe
- Commits de merge supplémentaires

```bash
git checkout main
git merge feature-branch
```

## Git Rebase

Le rebase réécrit l'historique pour obtenir un historique linéaire : les commits de la branche sont « rejoués » au-dessus de la branche cible.

```text
Avant :
main:     A---B---C
                   \
feature:            D---E

Après rebase :
main:     A---B---C---D'---E'

D' et E' sont les commits D et E « rejoués » sur C
```

**✅ Avantages**

- Historique linéaire et propre
- Pas de commits de merge
- Plus facile à lire

**❌ Inconvénients**

- Réécrit l'historique (dangereux sur une branche partagée)
- Perte du contexte temporel
- Conflits potentiels à résoudre commit par commit

```bash
git checkout feature-branch
git rebase main
```

## 🎯 Quand utiliser quoi ?

**Utiliser MERGE quand :**

- Travail en équipe sur des branches partagées
- Besoin de traçabilité complète
- Branches de release importantes
- Collaboration avec des développeurs moins expérimentés

**Utiliser REBASE quand :**

- Branches de feature personnelles
- Besoin d'un historique propre
- Avant de merger vers main
- Équipe expérimentée avec Git

> **Piège d'entretien :** la règle d'or du rebase — ne jamais rebaser une branche déjà poussée et partagée avec d'autres : la réécriture d'historique force tous les collaborateurs à réconcilier leurs copies.
