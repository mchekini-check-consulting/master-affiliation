---
title: "Collections Java"
description: "Le framework des collections Java : List, Set, Map, leurs implémentations et leurs performances."
categorie: "java"
ordre: 4
---

Framework des collections : List, Set, Map et leurs implémentations.

## 🌳 Hiérarchie des collections

```text
Collection (Interface)
├── List (Interface)
│   ├── ArrayList (Implémentation)
│   ├── LinkedList (Implémentation)
│   └── Vector (Legacy)
├── Set (Interface)
│   ├── HashSet (Implémentation)
│   ├── LinkedHashSet (Implémentation)
│   └── TreeSet (Implémentation)
└── Queue (Interface)
    ├── PriorityQueue (Implémentation)
    └── Deque (Interface)
        └── ArrayDeque (Implémentation)

Map (Interface séparée)
├── HashMap (Implémentation)
├── LinkedHashMap (Implémentation)
├── TreeMap (Implémentation)
└── Hashtable (Legacy)
```

## 📋 List — collections ordonnées

Permet les doublons, accès par index.

### ArrayList

Tableau dynamique, accès rapide par index.

```java
List<String> list = new ArrayList<>();
list.add("Java");
list.add("Python");
list.add(1, "C++"); // Insert à l'index 1

// Accès O(1)
String lang = list.get(0);

// Recherche O(n)
boolean found = list.contains("Java");
```

### LinkedList

Liste chaînée, insertion/suppression rapide.

```java
List<String> list = new LinkedList<>();
list.add("First");
list.add("Last");

// Insertion rapide O(1) au début/fin
((LinkedList<String>) list).addFirst("New First");
((LinkedList<String>) list).addLast("New Last");

// Accès O(n)
String item = list.get(2);
```

### Comparaison

**ArrayList :**

- Accès : O(1)
- Insertion : O(n)
- Mémoire : moins

**LinkedList :**

- Accès : O(n)
- Insertion : O(1)
- Mémoire : plus

## 🎯 Set — collections uniques

Pas de doublons, différentes stratégies d'organisation.

### HashSet

Basé sur une table de hachage, pas d'ordre.

```java
Set<String> set = new HashSet<>();
set.add("Java");
set.add("Python");
set.add("Java"); // Ignoré (doublon)

// Recherche O(1) en moyenne
boolean exists = set.contains("Java");

// Pas d'ordre garanti
for (String lang : set) {
    System.out.println(lang);
}
```

### LinkedHashSet

Maintient l'ordre d'insertion.

```java
Set<String> set = new LinkedHashSet<>();
set.add("Java");
set.add("Python");
set.add("C++");

// Ordre d'insertion préservé
for (String lang : set) {
    System.out.println(lang); // Java, Python, C++
}
```

### TreeSet

Ordre naturel ou via un Comparator.

```java
Set<String> set = new TreeSet<>();
set.add("Python");
set.add("Java");
set.add("C++");

// Ordre alphabétique automatique
for (String lang : set) {
    System.out.println(lang); // C++, Java, Python
}

// Recherche O(log n)
```

## 🗺️ Map — associations clé-valeur

Stockage par paires clé-valeur.

### HashMap — le plus utilisé

```java
Map<String, Integer> ages = new HashMap<>();
ages.put("Alice", 25);
ages.put("Bob", 30);
ages.put("Charlie", 35);

// Accès O(1) en moyenne
Integer age = ages.get("Alice");

// Vérification d'existence
if (ages.containsKey("Bob")) {
    System.out.println("Bob's age: " + ages.get("Bob"));
}

// Itération
for (Map.Entry<String, Integer> entry : ages.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}

// Méthodes utiles Java 8+
ages.putIfAbsent("David", 28);
ages.computeIfAbsent("Eve", k -> k.length() * 10);
ages.merge("Alice", 1, Integer::sum); // Alice: 26
```

### TreeMap — ordre des clés

```java
Map<String, Integer> sortedAges = new TreeMap<>();
sortedAges.put("Charlie", 35);
sortedAges.put("Alice", 25);
sortedAges.put("Bob", 30);

// Ordre alphabétique des clés
for (String name : sortedAges.keySet()) {
    System.out.println(name); // Alice, Bob, Charlie
}

// Méthodes spécifiques TreeMap
TreeMap<String, Integer> treeMap = (TreeMap<String, Integer>) sortedAges;
String firstKey = treeMap.firstKey(); // "Alice"
String lastKey = treeMap.lastKey();   // "Charlie"

// Sous-maps
Map<String, Integer> subMap = treeMap.subMap("Alice", "Charlie");
```

## ⚡ Comparaison des performances

| Collection | Accès | Recherche | Insertion | Suppression | Ordre |
| --- | --- | --- | --- | --- | --- |
| ArrayList | O(1) | O(n) | O(n) | O(n) | Insertion |
| LinkedList | O(n) | O(n) | O(1) | O(1) | Insertion |
| HashSet | - | O(1) | O(1) | O(1) | Aucun |
| TreeSet | - | O(log n) | O(log n) | O(log n) | Naturel |
| HashMap | O(1) | O(1) | O(1) | O(1) | Aucun |
| TreeMap | O(log n) | O(log n) | O(log n) | O(log n) | Clés triées |
