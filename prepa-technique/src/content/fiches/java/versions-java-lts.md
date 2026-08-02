---
preparations: ["fullstack"]
title: "Versions Java LTS"
description: "Guide des versions Long Term Support de Java (8, 11, 17, 21) et de leurs nouveautés majeures."
categorie: "java"
ordre: 1
---

Guide des versions Long Term Support (LTS) et de leurs nouveautés.

## 📅 Timeline des versions LTS

| Version | Sortie | Fin de support |
| --- | --- | --- |
| Java 8 LTS | Mars 2014 | 2030 |
| Java 11 LTS | Septembre 2018 | 2026 |
| Java 17 LTS | Septembre 2021 | 2029 |
| Java 21 LTS | Septembre 2023 | 2031 |

## 🚀 Principales nouveautés

### Java 8 LTS (2014)

La révolution des expressions lambda.

**🔥 Nouveautés majeures :**

- Expressions Lambda
- Stream API
- Interfaces fonctionnelles
- Méthodes par défaut dans les interfaces
- Optional
- Nouvelle API Date/Time

Exemple Lambda :

```java
// Avant Java 8
List<String> names = Arrays.asList("Alice", "Bob");
Collections.sort(names, new Comparator<String>() {
    public int compare(String a, String b) {
        return a.compareTo(b);
    }
});

// Avec Java 8
names.sort((a, b) -> a.compareTo(b));
names.sort(String::compareTo);
```

### Java 11 LTS (2018)

Modularité et performance.

**🔥 Nouveautés majeures :**

- HTTP Client API
- `var` pour les variables locales
- Nouvelles méthodes String
- Flight Recorder
- Epsilon GC
- Suppression des modules Java EE

Exemple `var` et String :

```java
// Inférence de type avec var
var list = List.of("Java", "11", "LTS");
var map = Map.of("version", 11);

// Nouvelles méthodes String
String text = "  Hello World  ";
text.isBlank();        // false
text.strip();          // "Hello World"
text.repeat(3);        // répète 3 fois
"A\nB\nC".lines();     // Stream<String>
```

### Java 17 LTS (2021)

Pattern Matching et Records.

**🔥 Nouveautés majeures :**

- Records (classes de données)
- Pattern Matching pour `instanceof`
- Sealed Classes
- Text Blocks
- Switch Expressions
- Suppression du moteur JavaScript Nashorn

Exemple Records :

```java
// Record (remplace beaucoup de boilerplate)
public record Person(String name, int age) {}

// Utilisation
var person = new Person("Alice", 30);
System.out.println(person.name()); // Alice
System.out.println(person.age());  // 30

// Pattern Matching
if (obj instanceof String s) {
    System.out.println(s.toUpperCase());
}
```

### Java 21 LTS (2023)

Virtual Threads et Pattern Matching avancé.

**🔥 Nouveautés majeures :**

- Virtual Threads (Project Loom)
- Pattern Matching pour `switch`
- Record Patterns
- String Templates (Preview)
- Sequenced Collections
- Generational ZGC

Exemple Virtual Threads :

```java
// Virtual Threads
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10_000).forEach(i -> {
        executor.submit(() -> {
            Thread.sleep(Duration.ofSeconds(1));
            return i;
        });
    });
} // Fermeture automatique

// Pattern Matching pour switch
String result = switch (obj) {
    case Integer i -> "Integer: " + i;
    case String s -> "String: " + s;
    case null -> "null value";
    default -> "Unknown type";
};
```

> **Recommandation :** pour les nouveaux projets, utilisez Java 21 LTS. Pour les projets existants, planifiez une migration vers Java 17 minimum.
