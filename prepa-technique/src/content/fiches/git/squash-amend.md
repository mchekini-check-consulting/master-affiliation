---
preparations: ["fullstack"]
title: "Squash & Amend"
description: "Nettoyer et modifier l'historique des commits : fusionner plusieurs commits en un seul et retoucher le dernier commit."
categorie: "git"
ordre: 4
---

Deux outils pour nettoyer et modifier l'historique des commits : le squash fusionne plusieurs commits en un seul, l'amend retouche le dernier commit.

## Git Squash

Le squash fusionne plusieurs commits en un seul.

```text
Avant squash :
A---B---C---D---E---F (feature)

Après squash :
A---B---C---X (feature)

X contient tous les changements de D, E et F
```

### Méthodes de squash

**Interactive rebase**

```bash
git rebase -i HEAD~3
# Dans l'éditeur :
pick d1f2e3a Premier commit
squash a4b5c6d Deuxième commit
squash e7f8g9h Troisième commit
```

**Merge squash**

```bash
git checkout main
git merge --squash feature-branch
git commit -m "Feature: nouvelle fonctionnalité"
```

**Reset + commit**

```bash
git reset --soft HEAD~3
git commit -m "Feature complète"
```

> **⚠️ Attention :** ne jamais squasher des commits déjà poussés sur une branche partagée.

## Git Amend

L'amend modifie le dernier commit.

### Cas d'usage

- Corriger le message du dernier commit
- Ajouter des fichiers oubliés
- Modifier le contenu du dernier commit
- Changer l'auteur du commit

### Commandes principales

**Modifier le message :**

```bash
git commit --amend -m "Nouveau message"
```

**Ajouter des fichiers :**

```bash
git add fichier-oublie.txt
git commit --amend --no-edit
```

**Modifier l'auteur :**

```bash
git commit --amend --author="Nom <email@example.com>"
```

**Modifier la date :**

```bash
git commit --amend --date="2024-01-15 10:30:00"
```

> **💡 Astuce :** utilisez `--no-edit` pour garder le message existant.

## 🎯 Bonnes Pratiques

**✅ À faire**

- Squash avant de merger vers main
- Amend uniquement sur des commits locaux
- Créer des commits logiques et cohérents
- Utiliser des messages de commit descriptifs
- Tester après chaque squash/amend

**❌ À éviter**

- Squash/amend sur des branches partagées
- Modifier l'historique public
- Squash trop de commits d'un coup
- Perdre des informations importantes
- Oublier de communiquer les changements

> **Piège d'entretien :** `git commit --amend` ne « modifie » pas vraiment le commit : il le remplace par un nouveau commit avec un nouveau SHA. C'est donc une réécriture d'historique, avec les mêmes précautions que le rebase.
