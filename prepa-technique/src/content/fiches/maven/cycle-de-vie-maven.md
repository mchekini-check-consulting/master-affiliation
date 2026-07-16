---
title: "Cycles de Vie Maven"
description: "Les trois cycles de vie de Maven (default, clean, site) et les phases principales du cycle default, de validate à deploy."
categorie: "maven"
ordre: 1
---

Maven organise le build autour de trois cycles de vie principaux, chacun composé de phases exécutées dans un ordre fixe.

## 🔄 Les 3 Cycles de Vie

| Cycle | Rôle | Phases clés |
|-------|------|-------------|
| **Default** | Construction du projet | compile, test, package, install, deploy |
| **Clean** | Nettoyage du projet | pre-clean, clean, post-clean |
| **Site** | Documentation du projet | pre-site, site, post-site, site-deploy |

## 🏗️ Default Lifecycle — Phases Principales

| Phase | Description |
|-------|-------------|
| `validate` | Valide que le projet est correct |
| `compile` | Compile le code source |
| `test` | Exécute les tests unitaires |
| `package` | Crée le JAR/WAR |
| `verify` | Vérifie la qualité du package |
| `install` | Installe l'artefact dans le repository local |
| `deploy` | Déploie l'artefact vers le repository distant |

> **Piège d'entretien :** exécuter une phase exécute aussi **toutes les phases précédentes** du cycle. `mvn package` déclenche donc validate, compile et test avant de créer le JAR.

### Ordre d'exécution complet

```text
validate → initialize → generate-sources → process-sources
→ generate-resources → process-resources → compile → process-classes
→ generate-test-sources → process-test-sources → generate-test-resources
→ process-test-resources → test-compile → process-test-classes → test
→ prepare-package → package → pre-integration-test → integration-test
→ post-integration-test → verify → install → deploy
```
