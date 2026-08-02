---
preparations: ["fullstack"]
title: "Behavior Driven Development (BDD)"
description: "Le BDD transforme les exigences métier en spécifications exécutables en langage naturel (Gherkin), compréhensibles par les devs, la QA et le métier."
categorie: "craftmanship"
ordre: 7
---

Le BDD (Behavior Driven Development) consiste à écrire des **spécifications exécutables en langage naturel**, centrées sur le comportement attendu de l'application du point de vue de l'utilisateur.

## 🎯 À quoi sert BDD ?

### Objectifs principaux

- Communication entre équipes (Dev, QA, Business)
- Spécifications vivantes et exécutables
- Focus sur le comportement utilisateur
- Documentation automatique
- Réduction des malentendus

### Avantages

- Langage commun (Gherkin)
- Tests compréhensibles par tous
- Validation des exigences métier
- Détection précoce des problèmes
- Meilleure collaboration

> **Piège d'entretien :** le BDD n'est pas d'abord un outil de test, mais une pratique de collaboration. Les scénarios Gherkin servent avant tout de langage commun avec le métier ; leur exécution automatisée n'en est que la conséquence.

## 📝 Exemple en Gherkin : connexion utilisateur

```text
Feature: Connexion utilisateur
  En tant qu'utilisateur enregistré
  Je veux me connecter à mon compte
  Afin d'accéder à mes données personnelles

  Background:
    Given un utilisateur existe avec l'email "john@example.com" et le mot de passe "password123"

  Scenario: Connexion réussie avec des identifiants valides
    Given je suis sur la page de connexion
    When je saisis "john@example.com" dans le champ email
    And je saisis "password123" dans le champ mot de passe
    And je clique sur le bouton "Se connecter"
    Then je suis redirigé vers le tableau de bord
    And je vois le message "Bienvenue John"

  Scenario: Échec de connexion avec un mot de passe incorrect
    Given je suis sur la page de connexion
    When je saisis "john@example.com" dans le champ email
    And je saisis "wrongpassword" dans le champ mot de passe
    And je clique sur le bouton "Se connecter"
    Then je reste sur la page de connexion
    And je vois le message d'erreur "Identifiants incorrects"

  Scenario Outline: Validation des champs obligatoires
    Given je suis sur la page de connexion
    When je saisis "<email>" dans le champ email
    And je saisis "<password>" dans le champ mot de passe
    And je clique sur le bouton "Se connecter"
    Then je vois le message d'erreur "<error_message>"

    Examples:
      | email              | password    | error_message                    |
      |                    | password123 | L'email est obligatoire          |
      | john@example.com   |             | Le mot de passe est obligatoire  |
      | invalid-email      | password123 | Format d'email invalide          |
```

Les trois mots-clés structurent chaque scénario :

- **Given** : contexte initial, état du système
- **When** : action de l'utilisateur
- **Then** : résultat attendu

## 🔧 Implémentation des steps

Chaque phrase Gherkin est reliée à du code par une *step definition*. Exemple en JavaScript avec Cucumber.js :

```js
// JavaScript avec Cucumber.js
const { Given, When, Then } = require('@cucumber/cucumber');

Given('je suis sur la page de connexion', async function () {
  await this.page.goto('/login');
});

When('je saisis {string} dans le champ email', async function (email) {
  await this.page.fill('[data-testid="email-input"]', email);
});

When('je saisis {string} dans le champ mot de passe', async function (password) {
  await this.page.fill('[data-testid="password-input"]', password);
});

When('je clique sur le bouton {string}', async function (buttonText) {
  await this.page.click(`button:has-text("${buttonText}")`);
});

Then('je suis redirigé vers le tableau de bord', async function () {
  await this.page.waitForURL('/dashboard');
  expect(this.page.url()).toContain('/dashboard');
});

Then('je vois le message {string}', async function (message) {
  const element = await this.page.locator(`text=${message}`);
  await expect(element).toBeVisible();
});
```
