---
title: "Spring Boot"
description: "Framework pour créer des applications Spring rapidement grâce à l'auto-configuration, aux starters et au serveur embarqué."
categorie: "spring"
ordre: 2
---

Spring Boot est un framework qui permet de créer des applications Spring rapidement, en éliminant l'essentiel de la configuration manuelle.

## 🚀 Avantages de Spring Boot

### Configuration automatique

Spring Boot configure automatiquement l'application en fonction des dépendances présentes, sans XML ni configuration manuelle exhaustive.

- Auto-configuration basée sur le classpath : si une dépendance est détectée (ex. un driver JDBC), Spring Boot configure les beans correspondants
- Starters pour simplifier les dépendances : un seul artefact regroupe toutes les bibliothèques cohérentes d'un besoin donné
- Configuration par défaut intelligente, que l'on peut surcharger au besoin (ex. via `application.properties`)

### Serveur embarqué

Le serveur web fait partie de l'application elle-même, ce qui simplifie radicalement le déploiement.

- Tomcat, Jetty ou Undertow intégrés directement dans l'application
- Déploiement simplifié : un simple JAR exécutable (`java -jar app.jar`)
- Pas besoin d'installer ni de configurer un serveur externe

> **Piège d'entretien :** l'auto-configuration n'est pas magique — elle repose sur des conditions (`@ConditionalOnClass`, `@ConditionalOnMissingBean`…) : Spring Boot ne configure un bean que si la classe est sur le classpath et qu'aucun bean équivalent n'a déjà été défini par le développeur.

## 📦 Starters principaux

**`spring-boot-starter-web`** — Applications web avec Spring MVC (inclut Tomcat embarqué et Jackson).

**`spring-boot-starter-data-jpa`** — JPA avec Hibernate pour l'accès aux bases relationnelles.

**`spring-boot-starter-security`** — Sécurité avec Spring Security (authentification et autorisation).

**`spring-boot-starter-test`** — Tests avec JUnit, Mockito et les utilitaires de test Spring.

**`spring-boot-starter-actuator`** — Monitoring et métriques : endpoints de santé, métriques et informations d'exécution.

**`spring-boot-starter-validation`** — Validation avec Bean Validation (annotations `@Valid`, `@NotNull`, etc.).
