---
preparations: ["fullstack"]
title: "Gestion des Environnements"
description: "Stratégies de branches et de déploiement par environnement : branches dédiées, tags de release ou feature flags."
categorie: "git"
ordre: 6
---

Stratégies de branches et de déploiement par environnement : comment faire voyager le code du poste du développeur jusqu'à la production.

## 🏗️ Environnements Types

**Development**

- Développement actif
- Tests unitaires
- Intégration continue
- Données de test

**Staging**

- Tests d'intégration
- Validation métier
- Données similaires prod
- Tests de performance

**Pre-production**

- Tests finaux
- Validation client
- Configuration prod
- Tests de charge

**Production**

- Utilisateurs finaux
- Données réelles
- Haute disponibilité
- Monitoring complet

## 🌿 Stratégie : Branches par Environnement

Une branche dédiée par environnement.

```text
main (production) ────●────────●────────●
staging           ──────●──●──●──●──●──●──●──●
develop           ──●──●──●──●──●──●──●──●──●──●
feature/A         ──●──●──●
feature/B         ────●──●──●
```

### Flux de promotion

```bash
# 1. Développement
git checkout develop
git merge feature/nouvelle-fonctionnalite

# 2. Promotion vers staging
git checkout staging
git merge develop

# 3. Tests en staging réussis
git checkout main
git merge staging
git tag v1.2.0

# 4. Déploiement automatique
# develop → DEV
# staging → STAGING
# main → PRODUCTION
```

**✅ Avantages**

- Correspondance claire branche/environnement
- Contrôle précis des déploiements
- Rollback facile par environnement
- Isolation des environnements

**❌ Inconvénients**

- Maintenance de multiples branches
- Conflits lors des promotions
- Complexité de synchronisation
- Hotfixes compliqués

## 🏷️ Stratégie : Tags et Déploiement

Une branche principale avec des tags pour les environnements.

```text
main ●──●──●──●──●──●──●──●──●──●
     │        │        │       │
     │        │        │       └─ v1.3.0 (prod)
     │        │        └─ v1.3.0-rc.2 (staging)
     │        └─ v1.3.0-rc.1 (staging)
     └─ v1.2.1 (prod)
```

### Stratégie de tags

**Development**

- Branche main directement
- Déploiement automatique
- Chaque commit = déploiement

**Staging**

- Tags release candidates
- Format : `v1.2.0-rc.1`
- Tests d'intégration

**Production**

- Tags de release
- Format : `v1.2.0`
- Déploiement manuel/approuvé

```bash
# Création d'un release candidate
git tag v1.3.0-rc.1
git push origin v1.3.0-rc.1
# → Déploiement automatique en staging

# Après validation, release en production
git tag v1.3.0
git push origin v1.3.0
# → Déploiement en production

# Hotfix
git checkout v1.3.0
git checkout -b hotfix/critical-bug
# ... correction ...
git tag v1.3.1
git push origin v1.3.1
```

## 🔄 Stratégie : Feature Flags + Environnements

Déploiement continu avec activation conditionnelle.

### Configuration par environnement

| Flag | Development | Staging | Production |
|---|---|---|---|
| `NEW_FEATURE` | ✅ true | ✅ true | ❌ false |
| `BETA_UI` | ✅ true | ❌ false | ❌ false |
| `DEBUG_MODE` | ✅ true | ❌ false | ❌ false |

```js
// Code avec feature flags
class FeatureService {
  isEnabled(feature, environment) {
    const config = {
      development: { NEW_FEATURE: true, BETA_UI: true },
      staging: { NEW_FEATURE: true, BETA_UI: false },
      production: { NEW_FEATURE: false, BETA_UI: false }
    };
    return config[environment][feature] || false;
  }
}

// Utilisation
if (featureService.isEnabled('NEW_FEATURE', process.env.NODE_ENV)) {
  return newImplementation();
} else {
  return legacyImplementation();
}
```

### Avantages de cette approche

- Déploiement continu sans risque
- Tests en production avec utilisateurs limités
- Rollback instantané (toggle de flag)
- A/B testing facilité
- Réduction des branches de feature

## 🎯 Recommandations par Contexte

**Équipe junior**

- Branches par environnement
- Processus de promotion strict
- Validation manuelle
- Documentation détaillée

**Équipe expérimentée**

- Tags + déploiement continu
- Feature flags
- Automatisation poussée
- Monitoring avancé

**Contexte réglementé**

- Branches par environnement
- Approbations multiples
- Traçabilité complète
- Tests exhaustifs

> **Piège d'entretien :** avec la stratégie « branches par environnement », un hotfix appliqué directement sur main doit être redescendu (mergé) vers staging et develop, sinon les environnements divergent silencieusement.
