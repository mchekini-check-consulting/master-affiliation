---
title: "Reset, Revert, Cherry Pick & Stash"
description: "Commandes avancées pour gérer l'historique : annuler des commits, en copier un précis ou mettre son travail de côté."
categorie: "git"
ordre: 3
---

Quatre commandes avancées pour gérer l'historique : annuler des commits (reset, revert), copier un commit précis (cherry-pick) ou mettre son travail de côté (stash).

## Git Reset

Le reset annule des commits en déplaçant HEAD. Trois modes existent selon ce qu'on veut conserver.

### --soft

Garde les changements dans l'index (staging area).

```bash
git reset --soft HEAD~1
```

Annule le dernier commit mais garde les fichiers « staged ».

### --mixed

Garde les changements dans le working directory.

```bash
git reset --mixed HEAD~1
```

Annule le commit et « unstage » les fichiers (mode par défaut).

### --hard

⚠️ Supprime TOUT (dangereux).

```bash
git reset --hard HEAD~1
```

Annule le commit ET supprime tous les changements.

## Git Revert

Le revert annule un commit en créant un nouveau commit.

```text
A---B---C---D (main)
        ↓ git revert C
A---B---C---D---C' (main)

C' annule les changements de C sans modifier l'historique
```

```bash
git revert <commit-hash>
```

- ✅ Sécurisé pour les branches partagées
- ✅ Préserve l'historique
- ✅ Traçable

## Cherry Pick

Le cherry-pick applique un commit spécifique sur la branche actuelle.

```text
main:    A---B---C
feature: D---E---F
        ↓ cherry-pick E
main:    A---B---C---E'

Copie uniquement le commit E sur main
```

```bash
git cherry-pick <commit-hash>
```

- ✅ Utile pour les hotfixes
- ✅ Sélection précise
- ⚠️ Peut créer des doublons

## Git Stash

Le stash offre une sauvegarde temporaire des changements non commités.

### Commandes principales

```bash
git stash
```

Sauvegarde les changements.

```bash
git stash pop
```

Restaure et supprime du stash.

```bash
git stash list
```

Liste tous les stash.

```bash
git stash apply stash@{0}
```

Applique un stash spécifique.

### Cas d'usage

- Changement de branche urgent
- Pull avec des changements locaux
- Test rapide d'une autre branche
- Sauvegarde temporaire avant rebase

> **💡 Astuce :** utilisez `git stash -u` pour inclure les fichiers non trackés.

> **Piège d'entretien :** pour annuler un commit déjà poussé sur une branche partagée, c'est `revert` qu'il faut utiliser, jamais `reset` — reset réécrit l'historique, revert le préserve en ajoutant un commit inverse.
