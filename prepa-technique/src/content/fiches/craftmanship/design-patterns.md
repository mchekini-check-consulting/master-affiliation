---
preparations: ["fullstack"]
title: "Design Patterns"
description: "Les 3 types de design patterns — création, structurel, comportemental — avec exemples pratiques en Java."
categorie: "craftmanship"
ordre: 5
---

Les 3 types de patterns avec exemples pratiques.

## 📚 Les 3 Types de Design Patterns

| Type | Rôle | Exemples |
|------|------|----------|
| 🏗️ Création | Gèrent la création d'objets | Builder, Singleton, Factory |
| 🔧 Structurel | Organisent les classes et objets | Adapter, Decorator |
| ⚡ Comportemental | Gèrent les interactions entre objets | Chain of Responsibility |

## 🏗️ Patterns de Création

Ces patterns contrôlent la façon dont les objets sont créés.

### Builder Pattern

Construire un objet complexe étape par étape.

**But :** construction d'une Pizza avec différents ingrédients.

```java
class Pizza {
    private String ingredients;

    public Pizza(String ingredients) {
        this.ingredients = ingredients;
    }

    public String toString() {
        return "Pizza with: " + ingredients;
    }
}

class PizzaBuilder {
    private StringBuilder ingredients = new StringBuilder();

    public PizzaBuilder addCheese() {
        ingredients.append("cheese ");
        return this;
    }

    public PizzaBuilder addTomato() {
        ingredients.append("tomato ");
        return this;
    }

    public PizzaBuilder addPepperoni() {
        ingredients.append("pepperoni ");
        return this;
    }

    public Pizza build() {
        return new Pizza(ingredients.toString());
    }
}

public class Main {
    public static void main(String[] args) {
        Pizza pizza = new PizzaBuilder()
                        .addCheese()
                        .addTomato()
                        .addPepperoni()
                        .build();
        System.out.println(pizza);
    }
}
```

### Singleton Pattern

Assurer qu'il y ait une seule instance.

**But :** base de données avec une seule instance.

```java
class Database {
    private static Database instance;

    private Database() {
        System.out.println("Creating Database instance");
    }

    public static Database getInstance() {
        if (instance == null) {
            instance = new Database();
        }
        return instance;
    }
}

public class Main {
    public static void main(String[] args) {
        Database db1 = Database.getInstance();
        Database db2 = Database.getInstance();

        System.out.println(db1 == db2);  // True : même instance
    }
}
```

> **Piège d'entretien :** cette implémentation « lazy » n'est pas thread-safe — deux threads peuvent créer deux instances. En entretien, mentionnez les variantes synchronisées, le double-checked locking ou l'enum singleton.

### Factory Pattern

Créer des objets sans exposer la logique de création.

**But :** créer différents types de formes.

```java
interface Shape {
    void draw();
}

class Circle implements Shape {
    public void draw() {
        System.out.println("Drawing a Circle");
    }
}

class Square implements Shape {
    public void draw() {
        System.out.println("Drawing a Square");
    }
}

// Factory
class ShapeFactory {
    public Shape getShape(String shapeType) {
        if (shapeType == null) {
            return null;
        }
        if (shapeType.equalsIgnoreCase("CIRCLE")) {
            return new Circle();
        } else if (shapeType.equalsIgnoreCase("SQUARE")) {
            return new Square();
        }
        return null;
    }
}

public class Main {
    public static void main(String[] args) {
        ShapeFactory factory = new ShapeFactory();

        Shape circle = factory.getShape("CIRCLE");
        circle.draw();

        Shape square = factory.getShape("SQUARE");
        square.draw();
    }
}
```

## 🔧 Patterns Structurels

Ces patterns organisent les classes et objets pour former des structures plus larges.

### Adapter Pattern

Faire en sorte que des interfaces incompatibles travaillent ensemble.

**But :** adaptation d'une ancienne imprimante.

```java
class OldPrinter {
    public void printText(String text) {
        System.out.println("Old Printer: " + text);
    }
}

// Nouvelle interface cible
interface NewPrinter {
    void print(String message);
}

// Adaptateur
class PrinterAdapter implements NewPrinter {
    private OldPrinter oldPrinter;

    public PrinterAdapter(OldPrinter oldPrinter) {
        this.oldPrinter = oldPrinter;
    }

    public void print(String message) {
        oldPrinter.printText(message);
    }
}

public class Main {
    public static void main(String[] args) {
        OldPrinter oldPrinter = new OldPrinter();
        NewPrinter adapter = new PrinterAdapter(oldPrinter);
        adapter.print("Hello via adapter!");
    }
}
```

### Decorator Pattern

Ajouter dynamiquement des fonctionnalités.

**But :** ajouter un comportement à l'envoi de messages.

```java
interface Message {
    String send();
}

class SimpleMessage implements Message {
    public String send() {
        return "Message sent";
    }
}

class EncryptedMessage implements Message {
    private Message message;

    public EncryptedMessage(Message message) {
        this.message = message;
    }

    public String send() {
        return "Encrypted(" + message.send() + ")";
    }
}

class LoggedMessage implements Message {
    private Message message;

    public LoggedMessage(Message message) {
        this.message = message;
    }

    public String send() {
        System.out.println("Logging: sending a message...");
        return message.send();
    }
}

public class Main {
    public static void main(String[] args) {
        Message message = new SimpleMessage();
        Message encrypted = new EncryptedMessage(message);
        Message logged = new LoggedMessage(encrypted);

        System.out.println(logged.send());
    }
}
```

## ⚡ Patterns Comportementaux

Ces patterns gèrent les algorithmes et les responsabilités entre objets.

### Chain of Responsibility Pattern

Permettre à plusieurs objets de gérer une requête.

**But :** validation d'une requête avec plusieurs niveaux de handlers.

```java
abstract class Handler {
    protected Handler next;

    public void setNext(Handler nextHandler) {
        this.next = nextHandler;
    }

    public abstract void handleRequest(String request);
}

class AuthHandler extends Handler {
    public void handleRequest(String request) {
        if (request.equals("AUTH")) {
            System.out.println("Handled by AuthHandler");
        } else if (next != null) {
            next.handleRequest(request);
        }
    }
}

class LogHandler extends Handler {
    public void handleRequest(String request) {
        if (request.equals("LOG")) {
            System.out.println("Handled by LogHandler");
        } else if (next != null) {
            next.handleRequest(request);
        }
    }
}

class ErrorHandler extends Handler {
    public void handleRequest(String request) {
        if (request.equals("ERROR")) {
            System.out.println("Handled by ErrorHandler");
        } else if (next != null) {
            next.handleRequest(request);
        } else {
            System.out.println("Request not handled: " + request);
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Handler authHandler = new AuthHandler();
        Handler logHandler = new LogHandler();
        Handler errorHandler = new ErrorHandler();

        // Chaîne : Auth -> Log -> Error
        authHandler.setNext(logHandler);
        logHandler.setNext(errorHandler);

        authHandler.handleRequest("LOG");     // Handled by LogHandler
        authHandler.handleRequest("ERROR");   // Handled by ErrorHandler
        authHandler.handleRequest("UNKNOWN"); // Request not handled
    }
}
```
