---
title: "Principes SOLID"
description: "Les 5 principes fondamentaux de la programmation orientée objet : SRP, OCP, LSP, ISP et DIP, avec exemples Java."
categorie: "craftmanship"
ordre: 4
---

Les 5 principes fondamentaux de la programmation orientée objet.

## S — Single Responsibility Principle

Une classe ne doit avoir qu'une seule raison de changer.

<div class="exemple exemple--mauvais">

```java
// Plusieurs responsabilités
class User {
  private String name;
  private String email;

  // Responsabilité 1: Gestion des données utilisateur
  public void setName(String name) { this.name = name; }
  public String getName() { return name; }

  // Responsabilité 2: Validation
  public boolean isValidEmail() {
    return email.matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");
  }

  // Responsabilité 3: Persistance
  public void saveToDatabase() {
    // Code de sauvegarde en base
  }

  // Responsabilité 4: Notification
  public void sendWelcomeEmail() {
    // Code d'envoi d'email
  }
}
```

</div>

<div class="exemple exemple--bon">

```java
// Une seule responsabilité par classe
class User {
  private String name;
  private String email;

  // Uniquement la gestion des données
  public void setName(String name) { this.name = name; }
  public String getName() { return name; }
  public String getEmail() { return email; }
}

class EmailValidator {
  public boolean isValid(String email) {
    return email.matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");
  }
}

class UserRepository {
  public void save(User user) { /* logique de sauvegarde */ }
}

class NotificationService {
  public void sendWelcomeEmail(User user) { /* envoi email */ }
}
```

</div>

### Conseils d'application

- Chaque classe doit avoir une seule responsabilité
- Si vous avez du mal à décrire ce que fait une classe sans utiliser « et » ou « ou », elle fait probablement trop de choses
- Signes d'alerte : classe trop grande, méthodes sans rapport entre elles
- Avantages : code plus facile à tester, à maintenir et à comprendre

### Avantages

Facilite la maintenance, améliore la testabilité et permet la réutilisation du code.

## O — Open/Closed Principle

Ouvert à l'extension, fermé à la modification.

<div class="exemple exemple--mauvais">

```java
// Modification nécessaire pour chaque nouveau type
class DiscountCalculator {
  public double calculateDiscount(String customerType, double amount) {
    if (customerType.equals("REGULAR")) {
      return amount * 0.05;
    } else if (customerType.equals("PREMIUM")) {
      return amount * 0.10;
    } else if (customerType.equals("VIP")) {
      return amount * 0.15;
    }
    // Pour ajouter GOLD, il faut modifier cette méthode
    return 0;
  }
}
```

</div>

<div class="exemple exemple--bon">

```java
// Extensible sans modification
interface DiscountStrategy {
  double calculateDiscount(double amount);
}

class RegularCustomerDiscount implements DiscountStrategy {
  public double calculateDiscount(double amount) {
    return amount * 0.05;
  }
}

class PremiumCustomerDiscount implements DiscountStrategy {
  public double calculateDiscount(double amount) {
    return amount * 0.10;
  }
}

// Nouvelle stratégie sans modifier le code existant
class GoldCustomerDiscount implements DiscountStrategy {
  public double calculateDiscount(double amount) {
    return amount * 0.20;
  }
}
```

</div>

### Conseils d'application

- Utilisez l'abstraction et le polymorphisme pour permettre l'extension
- Les patterns Strategy, Template Method et Factory sont utiles
- Évitez les longues chaînes de if/else ou switch/case
- Pensez à l'avenir : comment ajouter des fonctionnalités sans modifier le code existant ?

### Avantages

Réduit les risques de régression, facilite l'ajout de fonctionnalités et améliore la modularité.

## L — Liskov Substitution Principle

Les objets dérivés doivent pouvoir remplacer leurs objets de base.

<div class="exemple exemple--mauvais">

```java
// La sous-classe viole le contrat
class Bird {
  public void fly() {
    System.out.println("Flying...");
  }
}

class Penguin extends Bird {
  @Override
  public void fly() {
    // Viole le principe : un pingouin ne peut pas voler
    throw new UnsupportedOperationException("Penguins cannot fly!");
  }
}

// Utilisation problématique
public void makeBirdFly(Bird bird) {
  bird.fly(); // Peut lever une exception si c'est un Penguin
}
```

</div>

<div class="exemple exemple--bon">

```java
// Hiérarchie respectant le contrat
abstract class Bird {
  public abstract void move();
}

class FlyingBird extends Bird {
  public void move() {
    fly();
  }

  public void fly() {
    System.out.println("Flying...");
  }
}

class SwimmingBird extends Bird {
  public void move() {
    swim();
  }

  public void swim() {
    System.out.println("Swimming...");
  }
}

class Eagle extends FlyingBird { /* respecte le contrat */ }
class Penguin extends SwimmingBird { /* respecte le contrat */ }
```

</div>

### Conseils d'application

- Les sous-classes ne doivent pas affaiblir les préconditions
- Les sous-classes ne doivent pas renforcer les postconditions
- Les invariants de la classe de base doivent être préservés
- Évitez de lever des exceptions dans les méthodes surchargées
- Utilisez le principe « Tell, Don't Ask » pour éviter les vérifications de type

### Avantages

Garantit le comportement cohérent des sous-classes, évite les surprises lors du polymorphisme.

## I — Interface Segregation Principle

Plusieurs interfaces spécifiques valent mieux qu'une interface générale.

<div class="exemple exemple--mauvais">

```java
// Interface trop large
interface Worker {
  void work();
  void eat();
  void sleep();
  void code();
  void design();
  void test();
}

// Les classes sont forcées d'implémenter des méthodes inutiles
class Developer implements Worker {
  public void work() { /* implémentation */ }
  public void eat() { /* implémentation */ }
  public void sleep() { /* implémentation */ }
  public void code() { /* implémentation */ }
  public void design() { /* implémentation */ }
  public void test() { /* implémentation */ }
}

class Designer implements Worker {
  public void work() { /* implémentation */ }
  public void eat() { /* implémentation */ }
  public void sleep() { /* implémentation */ }
  public void code() { throw new UnsupportedOperationException(); }
  public void design() { /* implémentation */ }
  public void test() { throw new UnsupportedOperationException(); }
}
```

</div>

<div class="exemple exemple--bon">

```java
// Interfaces spécifiques
interface Workable {
  void work();
}

interface Eatable {
  void eat();
}

interface Sleepable {
  void sleep();
}

interface Codable {
  void code();
}

interface Designable {
  void design();
}

// Chaque classe implémente seulement ce dont elle a besoin
class Developer implements Workable, Eatable, Sleepable, Codable {
  public void work() { /* implémentation */ }
  public void eat() { /* implémentation */ }
  public void sleep() { /* implémentation */ }
  public void code() { /* implémentation */ }
}

class Designer implements Workable, Eatable, Sleepable, Designable {
  public void work() { /* implémentation */ }
  public void eat() { /* implémentation */ }
  public void sleep() { /* implémentation */ }
  public void design() { /* implémentation */ }
}
```

</div>

### Conseils d'application

- Créez des interfaces fines et spécifiques à un client
- Préférez la composition d'interfaces à l'héritage multiple
- Signes d'alerte : méthodes non implémentées ou levant des exceptions
- Suivez le principe de ségrégation des commandes et des requêtes (CQRS)

### Avantages

Réduit le couplage, évite les dépendances inutiles et améliore la cohésion des interfaces.

## D — Dependency Inversion Principle

Dépendre d'abstractions, pas de concrétions.

<div class="exemple exemple--mauvais">

```java
// Dépendance vers des classes concrètes
class EmailService {
  public void sendEmail(String message) {
    System.out.println("Sending email: " + message);
  }
}

class SMSService {
  public void sendSMS(String message) {
    System.out.println("Sending SMS: " + message);
  }
}

class NotificationManager {
  // Dépendances directes vers des classes concrètes
  private EmailService emailService = new EmailService();
  private SMSService smsService = new SMSService();

  public void sendNotification(String message, String type) {
    if (type.equals("email")) {
      emailService.sendEmail(message);
    } else if (type.equals("sms")) {
      smsService.sendSMS(message);
    }
    // Difficile d'ajouter de nouveaux types sans modifier cette classe
  }
}
```

</div>

<div class="exemple exemple--bon">

```java
// Dépendance vers une abstraction
interface NotificationService {
  void send(String message);
}

class EmailService implements NotificationService {
  public void send(String message) {
    System.out.println("Sending email: " + message);
  }
}

class SMSService implements NotificationService {
  public void send(String message) {
    System.out.println("Sending SMS: " + message);
  }
}

class NotificationManager {
  private final Map<String, NotificationService> services;

  // Injection de dépendance via le constructeur
  public NotificationManager(Map<String, NotificationService> services) {
    this.services = services;
  }

  public void sendNotification(String message, String type) {
    NotificationService service = services.get(type);
    if (service != null) {
      service.send(message);
    }
  }
}
```

</div>

### Conseils d'application

- Utilisez l'injection de dépendances (constructeur, setter, méthode)
- Créez des abstractions stables qui ne changent pas souvent
- Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau
- Utilisez des frameworks d'inversion de contrôle (Spring, Guice)
- Facilite les tests unitaires avec des mocks

### Avantages

Facilite les tests, permet le changement d'implémentation et améliore la flexibilité du code.

> **Piège d'entretien :** ne confondez pas injection de dépendances (technique) et inversion de dépendances (principe) : la DI est un des moyens d'appliquer le DIP.
