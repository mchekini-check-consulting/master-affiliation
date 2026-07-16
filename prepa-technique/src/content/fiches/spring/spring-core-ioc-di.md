---
title: "Spring Core (IoC/DI)"
description: "Inversion de contrôle et injection de dépendances : les deux mécanismes fondateurs du conteneur Spring."
categorie: "spring"
ordre: 1
---

Inversion de Contrôle et Injection de Dépendances : les deux concepts au cœur du framework Spring.

## 🎯 Concepts fondamentaux

### Inversion de Contrôle (IoC)

Le framework prend le contrôle de la création et de la gestion des objets : au lieu d'instancier ses dépendances avec `new`, une classe les reçoit du conteneur Spring.

- Le conteneur Spring gère le cycle de vie des beans (création, initialisation, destruction)
- Réduction du couplage entre les classes
- Configuration centralisée

### Injection de Dépendances (DI)

Les dépendances sont injectées automatiquement par Spring dans les objets qui en ont besoin. Trois modes d'injection existent :

- **Constructor Injection** (recommandée) : les dépendances sont passées au constructeur, ce qui garantit un objet complet et immuable
- **Setter Injection** : les dépendances sont injectées via des setters, utile pour les dépendances optionnelles
- **Field Injection** : injection directe sur le champ via `@Autowired`, plus concise mais plus difficile à tester

> **Piège d'entretien :** l'injection par constructeur est recommandée car elle rend les dépendances obligatoires explicites, permet de déclarer les champs `final` et facilite les tests unitaires (on peut instancier la classe sans conteneur Spring).

## 📝 Annotations principales

**`@Component`** — Marque une classe comme bean Spring : elle sera détectée par le scan de composants et gérée par le conteneur.

**`@Service`** — Spécialisation de `@Component` pour la couche service (logique métier).

**`@Repository`** — Spécialisation de `@Component` pour la couche d'accès aux données ; ajoute la traduction des exceptions de persistance.

**`@Controller`** — Spécialisation de `@Component` pour la couche présentation (gestion des requêtes web).

**`@Autowired`** — Injection automatique de dépendances : Spring recherche un bean du type demandé et l'injecte.

**`@Qualifier`** — Spécifie quel bean injecter lorsque plusieurs candidats du même type existent dans le conteneur.
