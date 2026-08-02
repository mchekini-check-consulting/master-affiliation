---
preparations: ["fullstack"]
title: "Mots-clés Java"
description: "Guide des mots-clés essentiels de Java : modificateurs d'accès, static, final, abstract, interface, synchronized et volatile."
categorie: "java"
ordre: 5
---

Guide complet des mots-clés essentiels et de leurs utilisations.

## 🔒 Modificateurs d'accès

### Niveaux de visibilité

| Modificateur | Visibilité |
| --- | --- |
| `private` | Accessible uniquement dans la même classe |
| package-private (défaut) | Accessible dans le même package |
| `protected` | Accessible dans le package et les sous-classes |
| `public` | Accessible partout |

### Exemple pratique

```java
public class AccessExample {
    private String secret = "Hidden";
    String packageVar = "Package level";
    protected String inherited = "For subclasses";
    public String open = "Everyone can see";

    private void privateMethod() {
        // Seule cette classe peut appeler
    }

    protected void protectedMethod() {
        // Sous-classes peuvent appeler
    }

    public void publicMethod() {
        // Tout le monde peut appeler
        privateMethod(); // OK dans la même classe
    }
}
```

## 🏗️ Modificateurs de classe et de méthode

### static

```java
public class Counter {
    private static int count = 0; // Variable de classe
    private int instanceId;

    public Counter() {
        instanceId = ++count; // Chaque instance a un ID unique
    }

    public static int getCount() { // Méthode de classe
        return count;
        // return instanceId; // ERREUR : pas d'accès aux variables d'instance
    }

    public int getInstanceId() {
        return instanceId;
    }
}

// Utilisation
Counter c1 = new Counter();
Counter c2 = new Counter();
System.out.println(Counter.getCount()); // 2 (sans créer d'instance)
```

### final

```java
// Classe finale (ne peut pas être héritée)
public final class ImmutableClass {
    private final String value; // Variable finale

    public ImmutableClass(String value) {
        this.value = value; // Assignation unique
    }

    // Méthode finale (ne peut pas être redéfinie)
    public final String getValue() {
        return value;
    }
}

// Variables finales
final int CONSTANT = 42;
final List<String> list = new ArrayList<>();
list.add("item"); // OK : le contenu peut changer
// list = new ArrayList<>(); // ERREUR : référence finale
```

> **Piège d'entretien :** `final` sur une référence fige la référence, pas l'objet — une `final List` reste modifiable via `add()` ou `remove()`.

## 🎭 abstract et interface

### abstract

```java
public abstract class Animal {
    protected String name;

    public Animal(String name) {
        this.name = name;
    }

    // Méthode concrète
    public void sleep() {
        System.out.println(name + " is sleeping");
    }

    // Méthode abstraite (doit être implémentée)
    public abstract void makeSound();
}

public class Dog extends Animal {
    public Dog(String name) {
        super(name);
    }

    @Override
    public void makeSound() {
        System.out.println(name + " barks: Woof!");
    }
}
```

### interface

```java
public interface Flyable {
    // Constante (public static final implicite)
    int MAX_ALTITUDE = 10000;

    // Méthode abstraite (public abstract implicite)
    void fly();

    // Méthode par défaut (Java 8+)
    default void land() {
        System.out.println("Landing safely");
    }

    // Méthode statique (Java 8+)
    static void checkWeather() {
        System.out.println("Weather is good for flying");
    }
}

public class Bird implements Flyable {
    @Override
    public void fly() {
        System.out.println("Bird is flying");
    }
}
```

## 🔄 Mots-clés de concurrence

### synchronized

```java
public class ThreadSafeCounter {
    private int count = 0;

    // Méthode synchronisée
    public synchronized void increment() {
        count++; // Thread-safe
    }

    public void incrementBlock() {
        // Bloc synchronisé
        synchronized(this) {
            count++;
        }
    }

    public synchronized int getCount() {
        return count;
    }
}
```

### volatile

```java
public class VolatileExample {
    private volatile boolean running = true;

    public void start() {
        new Thread(() -> {
            while (running) {
                // Travail...
                System.out.println("Working...");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    break;
                }
            }
        }).start();
    }

    public void stop() {
        running = false; // Visible immédiatement par tous les threads
    }
}
```

## 📋 Récapitulatif des mots-clés

### Accès

- `private` — classe uniquement
- `protected` — package + héritage
- `public` — partout

### Modificateurs

- `static` — appartient à la classe
- `final` — non modifiable
- `abstract` — incomplet
- `synchronized` — thread-safe
- `volatile` — visible par tous les threads

### Contrôle

- `if`/`else` — conditions
- `switch` — sélection multiple
- `for`/`while` — boucles
- `break`/`continue` — contrôle des boucles
- `return` — sortie de méthode
