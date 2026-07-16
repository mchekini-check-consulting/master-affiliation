---
title: "Fetch vs Pull"
description: "Comprendre la différence entre récupérer les changements du dépôt distant (fetch) et les intégrer automatiquement (pull)."
categorie: "git"
ordre: 2
---

Comprendre la différence entre récupérer et intégrer : les deux commandes contactent le dépôt distant, mais seule l'une d'elles modifie votre branche locale.

## Git Fetch

Le fetch télécharge sans intégrer.

```text
Remote Repository
        │
        ▼ fetch
Local Repository

Working Directory : reste inchangé
```

**Ce que fait fetch :**

- Télécharge les nouveaux commits du remote
- Met à jour les références remote (`origin/main`)
- N'affecte PAS votre branche locale
- Permet de voir les changements avant de les intégrer

```bash
git fetch origin
git log main..origin/main   # Voir les différences
git merge origin/main       # Intégrer si souhaité
```

## Git Pull

Le pull télécharge ET intègre automatiquement.

```text
Remote Repository
        │
        ▼ fetch + merge
Local Repository
        │
        ▼ automatique
Working Directory
```

**Ce que fait pull :**

- Fait un fetch automatiquement
- Puis fait un merge (ou rebase) automatiquement
- Met à jour votre working directory
- Plus rapide mais moins de contrôle

```bash
git pull origin main
# Équivalent à :
git fetch origin
git merge origin/main
```

## 🎯 Recommandations

**Utiliser FETCH quand :**

- Vous voulez voir les changements avant de les intégrer
- Vous travaillez sur une feature importante
- Vous voulez éviter les conflits inattendus
- Vous préférez un contrôle total

**Utiliser PULL quand :**

- Vous êtes sûr qu'il n'y aura pas de conflits
- Vous voulez rapidement synchroniser
- Vous travaillez seul sur la branche
- Mise à jour rapide de main/develop

> **Piège d'entretien :** `git pull` n'est pas une commande « atomique » mystérieuse — c'est exactement `git fetch` suivi de `git merge` (ou `git rebase` avec `git pull --rebase`). Savoir le décomposer montre que vous comprenez le modèle distant/local de Git.
