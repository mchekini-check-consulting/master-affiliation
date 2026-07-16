---
title: "Refactoring"
description: "Améliorer la structure du code sans changer son comportement observable : quand refactoriser, le rôle des tests et les techniques essentielles."
categorie: "craftmanship"
ordre: 9
---

Refactoriser, c'est améliorer la structure du code sans changer son comportement externe.

## Qu'est-ce que le Refactoring ?

> **Définition (Martin Fowler) :** « Améliorer la conception d'un code existant sans changer son comportement observable. »

### Pourquoi refactoriser ?

- **📈 Améliorer la maintenabilité** : code plus facile à comprendre, modifier et étendre
- **🚀 Augmenter la productivité** : développement plus rapide grâce à un code propre
- **🐛 Réduire les bugs** : code plus simple = moins d'erreurs potentielles
- **💰 Réduire la dette technique** : éviter l'accumulation de code difficile à maintenir

### Quand refactoriser ?

> **Règle des 3 :** la première fois, on fait. La deuxième fois, on grimace. La troisième fois, on refactorise.

- Avant d'ajouter une nouvelle fonctionnalité
- Quand on corrige un bug
- Lors des code reviews
- Quand le code devient difficile à comprendre
- Détection de code smells
- Duplication de code importante

## Les Tests : garants du Refactoring

Sans tests, le refactoring devient dangereux.

> **Règle d'or :** ne jamais refactoriser sans tests automatisés ! Les tests sont votre filet de sécurité qui garantit que le comportement externe reste inchangé.

### 🛡️ Pourquoi les tests sont essentiels

- **Détection immédiate des régressions** : les tests échouent si le comportement change
- **Confiance pour refactoriser** : permet d'être audacieux dans les changements
- **Documentation vivante** : les tests décrivent le comportement attendu

### 🔄 Cycle de refactoring avec tests

```text
┌─────────────────────────────────────┐
│  1. Exécuter tous les tests         │
│     ✅ Tous verts ? Continuer       │
│     ❌ Rouge ? Corriger d'abord     │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│  2. Refactoriser une petite partie  │
│     - Extract Method                │
│     - Rename Variable               │
│     - Move Class                    │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│  3. Relancer les tests              │
│     ✅ Verts ? Continuer            │
│     ❌ Rouge ? Annuler changements  │
└─────────────┬───────────────────────┘
              │
              ▼
         Répéter le cycle
```

### 💡 Types de tests pour le refactoring

- **Tests unitaires** : testent les méthodes individuelles
- **Tests d'intégration** : testent les interactions entre composants
- **Tests end-to-end** : testent les scénarios utilisateur complets

## Défis et obstacles du Refactoring

### 🚧 Défis techniques

- **Code legacy sans tests** : difficile de refactoriser sans filet de sécurité.
  *Solution : ajouter des tests de caractérisation d'abord.*
- **Couplage fort** : classes trop interdépendantes.
  *Solution : refactoring progressif avec injection de dépendances.*
- **Code complexe** : méthodes trop longues et complexes.
  *Solution : Extract Method, décomposition en petites étapes.*

### 👥 Défis organisationnels

- **Pression du temps** : « pas le temps de refactoriser ».
  *Solution : intégrer le refactoring dans les estimations.*
- **Résistance au changement** : équipe réticente à modifier le code.
  *Solution : formation et démonstration des bénéfices.*
- **Manque de visibilité** : le management ne voit pas la valeur.
  *Solution : mesurer et communiquer les gains (vélocité, bugs).*

## 🔧 Techniques de Refactoring courantes

### Extract Method

Extraire une partie de méthode dans une nouvelle méthode.

<div class="exemple exemple--mauvais">

Avant : une méthode qui fait tout (validation, calcul, sauvegarde).

```java
public void processOrder(Order order) {
    // Validation
    if (order.getItems().isEmpty()) {
        throw new IllegalArgumentException("Order is empty");
    }
    if (order.getCustomer() == null) {
        throw new IllegalArgumentException("No customer");
    }

    // Calcul du total
    double total = 0;
    for (OrderItem item : order.getItems()) {
        total += item.getPrice() * item.getQuantity();
    }
    order.setTotal(total);

    // Sauvegarde
    orderRepository.save(order);
    emailService.sendConfirmation(order);
}
```

</div>

<div class="exemple exemple--bon">

Après : chaque responsabilité est extraite dans une méthode nommée.

```java
public void processOrder(Order order) {
    validateOrder(order);
    calculateTotal(order);
    saveAndNotify(order);
}

private void validateOrder(Order order) {
    if (order.getItems().isEmpty()) {
        throw new IllegalArgumentException("Order is empty");
    }
    if (order.getCustomer() == null) {
        throw new IllegalArgumentException("No customer");
    }
}

private void calculateTotal(Order order) {
    double total = order.getItems().stream()
        .mapToDouble(item -> item.getPrice() * item.getQuantity())
        .sum();
    order.setTotal(total);
}

private void saveAndNotify(Order order) {
    orderRepository.save(order);
    emailService.sendConfirmation(order);
}
```

</div>

### Replace Conditional with Polymorphism

Remplacer les conditions par du polymorphisme.

<div class="exemple exemple--mauvais">

Avant : une cascade de `if/else` sur le type du client.

```java
public double calculateDiscount(Customer customer) {
    if (customer.getType().equals("PREMIUM")) {
        return customer.getTotalPurchases() * 0.15;
    } else if (customer.getType().equals("GOLD")) {
        return customer.getTotalPurchases() * 0.10;
    } else if (customer.getType().equals("SILVER")) {
        return customer.getTotalPurchases() * 0.05;
    } else {
        return 0;
    }
}
```

</div>

<div class="exemple exemple--bon">

Après : chaque type de client porte sa propre règle de remise.

```java
// Interface
public interface CustomerType {
    double calculateDiscount(double totalPurchases);
}

// Implémentations
public class PremiumCustomer implements CustomerType {
    public double calculateDiscount(double total) {
        return total * 0.15;
    }
}

public class GoldCustomer implements CustomerType {
    public double calculateDiscount(double total) {
        return total * 0.10;
    }
}

// Usage
public double calculateDiscount(Customer customer) {
    return customer.getType().calculateDiscount(
        customer.getTotalPurchases()
    );
}
```

</div>

### Extract Class

Extraire une partie d'une classe dans une nouvelle classe.

<div class="exemple exemple--mauvais">

Avant : la classe `Customer` gère aussi les responsabilités d'adresse.

```java
public class Customer {
    private String name;
    private String email;

    // Adresse
    private String street;
    private String city;
    private String zipCode;
    private String country;

    // Méthodes d'adresse
    public String getFullAddress() {
        return street + ", " + city + " " + zipCode + ", " + country;
    }

    public boolean isInSameCity(Customer other) {
        return this.city.equals(other.city);
    }
}
```

</div>

<div class="exemple exemple--bon">

Après : l'adresse devient une classe à part entière, `Customer` délègue.

```java
public class Customer {
    private String name;
    private String email;
    private Address address;

    // Délégation
    public String getFullAddress() {
        return address.getFullAddress();
    }

    public boolean isInSameCity(Customer other) {
        return address.isInSameCity(other.address);
    }
}

public class Address {
    private String street;
    private String city;
    private String zipCode;
    private String country;

    public String getFullAddress() {
        return street + ", " + city + " " + zipCode + ", " + country;
    }

    public boolean isInSameCity(Address other) {
        return this.city.equals(other.city);
    }
}
```

</div>

### Introduce Parameter Object

Regrouper plusieurs paramètres dans un objet.

<div class="exemple exemple--mauvais">

Avant : trop de paramètres !

```java
public void createUser(String firstName, String lastName,
                       String email, String phone,
                       String street, String city,
                       String zipCode, String country) {
    // Trop de paramètres !
    User user = new User();
    user.setFirstName(firstName);
    user.setLastName(lastName);
    user.setEmail(email);
    user.setPhone(phone);
    // ...
}
```

</div>

<div class="exemple exemple--bon">

Après : un objet de requête regroupe les paramètres, plus lisible et extensible.

```java
public class UserCreationRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Address address;

    // constructors, getters, setters
}

public void createUser(UserCreationRequest request) {
    User user = new User();
    user.setFirstName(request.getFirstName());
    user.setLastName(request.getLastName());
    user.setEmail(request.getEmail());
    user.setPhone(request.getPhone());
    user.setAddress(request.getAddress());
    // Plus lisible et extensible
}
```

</div>

## ✅ Bonnes pratiques du Refactoring

### 🎯 Stratégies efficaces

- **Petits pas** : refactoriser par petites étapes, tester à chaque fois
- **Une chose à la fois** : ne pas mélanger refactoring et nouvelles fonctionnalités
- **Commits fréquents** : pouvoir revenir en arrière facilement
- **Pair programming** : deux cerveaux valent mieux qu'un

### ⚠️ Pièges à éviter

- **Refactoring sans tests** : risque de casser le comportement
- **Changements trop importants** : difficile de localiser les problèmes
- **Refactoring prématuré** : attendre d'avoir assez de contexte
- **Perfectionnisme** : savoir s'arrêter au « assez bien »

### 💡 Citation de Martin Fowler

> « Le refactoring est une technique disciplinée pour restructurer un corps de code existant, en modifiant sa structure interne sans changer son comportement externe. Son cœur est une série de petites transformations qui préservent le comportement. Chaque transformation fait peu de choses, mais une séquence de transformations peut produire une restructuration significative. »
