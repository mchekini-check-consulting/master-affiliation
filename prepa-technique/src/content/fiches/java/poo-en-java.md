---
title: "POO en Java"
description: "Programmation Orientée Objet en Java : les 4 piliers, classes et objets, concepts avancés."
categorie: "java"
ordre: 3
---

Programmation Orientée Objet : concepts fondamentaux et avancés.

## 🏛️ Les 4 piliers de la POO

### 1. Encapsulation

Masquer les détails d'implémentation.

```java
public class BankAccount {
    private double balance; // Privé

    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
        }
    }

    public double getBalance() {
        return balance; // Accès contrôlé
    }
}
```

### 2. Héritage

Réutiliser et étendre le code existant.

```java
public class Animal {
    protected String name;
    public void eat() { /* ... */ }
}

public class Dog extends Animal {
    public void bark() {
        System.out.println(name + " barks!");
    }
}
```

### 3. Polymorphisme

Une interface, plusieurs implémentations.

```java
public abstract class Shape {
    public abstract double area();
}

public class Circle extends Shape {
    private double radius;
    public double area() {
        return Math.PI * radius * radius;
    }
}

Shape shape = new Circle(5);
double area = shape.area(); // Polymorphisme
```

### 4. Abstraction

Simplifier la complexité.

```java
public interface Drawable {
    void draw(); // Méthode abstraite
}

public interface Resizable {
    void resize(double factor);
}

public class Rectangle implements Drawable, Resizable {
    public void draw() { /* implémentation */ }
    public void resize(double factor) { /* implémentation */ }
}
```

## 🏗️ Classes et objets

### Définition d'une classe

```java
public class Car {
    // Attributs (état)
    private String brand;
    private String model;
    private int year;

    // Constructeur
    public Car(String brand, String model, int year) {
        this.brand = brand;
        this.model = model;
        this.year = year;
    }

    // Méthodes (comportement)
    public void start() {
        System.out.println("Car is starting...");
    }

    public String getInfo() {
        return year + " " + brand + " " + model;
    }

    // Getters et Setters
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
}
```

### Utilisation

```java
public class Main {
    public static void main(String[] args) {
        // Création d'objets
        Car car1 = new Car("Toyota", "Camry", 2023);
        Car car2 = new Car("Honda", "Civic", 2022);

        // Utilisation des méthodes
        car1.start();
        System.out.println(car1.getInfo());

        // Modification via setter
        car2.setBrand("Nissan");

        // Comparaison d'objets
        System.out.println(car1.equals(car2)); // false
    }
}
```

## 🚀 Concepts avancés

### Classes abstraites vs interfaces

```java
// Classe abstraite (peut avoir du code)
public abstract class Vehicle {
    protected String brand;

    public Vehicle(String brand) {
        this.brand = brand;
    }

    // Méthode concrète
    public void honk() {
        System.out.println("Beep!");
    }

    // Méthode abstraite
    public abstract void start();
}

// Interface (contrat pur)
public interface Electric {
    void charge();
    default void showBatteryLevel() {
        System.out.println("Battery: 80%");
    }
}
```

### Composition vs héritage

```java
// Composition (préférée)
public class Car {
    private Engine engine;  // "Has-a" relationship
    private Wheels wheels;

    public Car() {
        this.engine = new Engine();
        this.wheels = new Wheels();
    }

    public void start() {
        engine.start(); // Délégation
    }
}

// Héritage (à utiliser avec parcimonie)
public class SportsCar extends Car {
    private boolean turboMode;

    @Override
    public void start() {
        super.start();
        if (turboMode) {
            System.out.println("Turbo activated!");
        }
    }
}
```

> **Bonnes pratiques :** favorisez la composition à l'héritage, utilisez des interfaces pour définir des contrats, et respectez le principe de responsabilité unique.
