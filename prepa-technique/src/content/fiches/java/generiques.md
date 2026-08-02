---
preparations: ["fullstack"]
title: "Génériques (Generics)"
description: "Type safety et réutilisabilité du code avec les génériques Java : classes et méthodes génériques, wildcards, règle PECS et type erasure."
categorie: "java"
ordre: 7
---

Type safety et réutilisabilité du code avec les génériques Java.

## 🎯 Pourquoi les génériques ?

### Avant Java 5 (sans génériques)

```java
List list = new ArrayList();
list.add("Hello");
list.add(42);           // Pas d'erreur à la compilation !
list.add(new Date());

// Erreur à l'exécution !
String str = (String) list.get(1); // ClassCastException !

// Pas de vérification de type
for (Object obj : list) {
    String s = (String) obj; // Dangereux !
}
```

### Avec les génériques (Java 5+)

```java
List<String> list = new ArrayList<>();
list.add("Hello");
// list.add(42);        // Erreur de compilation !
// list.add(new Date()); // Erreur de compilation !

// Pas de cast nécessaire
String str = list.get(0); // Type sûr !

// Itération type-safe
for (String s : list) {
    System.out.println(s.toUpperCase()); // Sûr !
}
```

### Avantages des génériques

- Type Safety : erreurs détectées à la compilation
- Élimination des casts : plus de `(String) obj`
- Code plus lisible : intention claire du développeur
- Performance : pas de boxing/unboxing inutile

## 🏗️ Classes génériques

### Classe générique simple

```java
public class Box<T> {
    private T content;

    public Box(T content) {
        this.content = content;
    }

    public T getContent() {
        return content;
    }

    public void setContent(T content) {
        this.content = content;
    }

    public boolean isEmpty() {
        return content == null;
    }
}

// Utilisation
Box<String> stringBox = new Box<>("Hello");
Box<Integer> intBox = new Box<>(42);
Box<List<String>> listBox = new Box<>(Arrays.asList("a", "b"));

String str = stringBox.getContent(); // Pas de cast !
Integer num = intBox.getContent();   // Type sûr !
```

### Plusieurs paramètres de type

```java
public class Pair<T, U> {
    private T first;
    private U second;

    public Pair(T first, U second) {
        this.first = first;
        this.second = second;
    }

    public T getFirst() { return first; }
    public U getSecond() { return second; }

    @Override
    public String toString() {
        return "(" + first + ", " + second + ")";
    }
}

// Utilisation
Pair<String, Integer> nameAge = new Pair<>("Alice", 25);
Pair<Integer, String> idName = new Pair<>(1, "Bob");

System.out.println(nameAge.getFirst());  // "Alice"
System.out.println(nameAge.getSecond()); // 25
```

## ⚙️ Méthodes génériques

### Méthodes génériques statiques

```java
public class Utility {
    // Méthode générique pour échanger deux éléments
    public static <T> void swap(T[] array, int i, int j) {
        T temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    // Méthode générique avec contrainte
    public static <T extends Comparable<T>> T max(T a, T b) {
        return a.compareTo(b) > 0 ? a : b;
    }

    // Méthode avec plusieurs types
    public static <T, U> Pair<T, U> makePair(T first, U second) {
        return new Pair<>(first, second);
    }
}

// Utilisation
String[] names = {"Alice", "Bob", "Charlie"};
Utility.swap(names, 0, 2); // ["Charlie", "Bob", "Alice"]

String maxStr = Utility.max("apple", "banana"); // "banana"
Integer maxInt = Utility.max(10, 20);           // 20

Pair<String, Integer> pair = Utility.makePair("Age", 25);
```

### Inférence de type

```java
// Java 7+ : Diamond operator
List<String> list = new ArrayList<>(); // Type inféré

// Java 10+ : var
var stringList = new ArrayList<String>();
var map = new HashMap<String, Integer>();

// Inférence dans les méthodes
public static <T> List<T> createList(T... elements) {
    return Arrays.asList(elements);
}

// Appel sans spécifier le type
List<String> strings = createList("a", "b", "c");
List<Integer> numbers = createList(1, 2, 3);

// Le compilateur infère automatiquement le type !
```

## 🃏 Wildcards (? extends, ? super)

### Upper Bounded (? extends)

```java
// Hiérarchie : Number -> Integer, Double
public static double sum(List<? extends Number> numbers) {
    double total = 0;
    for (Number num : numbers) {
        total += num.doubleValue(); // Lecture OK
    }
    // numbers.add(new Integer(5)); // ERREUR ! Écriture interdite
    return total;
}

// Utilisation
List<Integer> integers = Arrays.asList(1, 2, 3);
List<Double> doubles = Arrays.asList(1.1, 2.2, 3.3);

double sum1 = sum(integers); // OK
double sum2 = sum(doubles);  // OK

// Principe PECS : Producer Extends
// Utilise extends quand tu CONSOMMES (lis) depuis la collection
```

### Lower Bounded (? super)

```java
public static void addNumbers(List<? super Integer> list) {
    list.add(1);           // Écriture OK
    list.add(2);           // Écriture OK
    // Object obj = list.get(0); // Lecture limitée à Object
}

// Utilisation
List<Number> numbers = new ArrayList<>();
List<Object> objects = new ArrayList<>();

addNumbers(numbers); // OK : Number est super de Integer
addNumbers(objects); // OK : Object est super de Integer

// Principe PECS : Consumer Super
// Utilise super quand tu PRODUIS (écris) dans la collection
```

### Règle PECS (Producer Extends, Consumer Super)

- `? extends T` : utilise quand tu lis depuis la collection (Producer)
- `? super T` : utilise quand tu écris dans la collection (Consumer)
- `?` : utilise quand tu ne fais ni lecture ni écriture spécifique

> **Piège d'entretien :** on ne peut rien ajouter (sauf `null`) dans une `List<? extends Number>` — le compilateur ne sait pas si c'est une liste d'Integer, de Double… L'écriture est donc interdite.

## 🔄 Type Erasure

### Qu'est-ce que le Type Erasure ?

Les informations de type générique sont supprimées à l'exécution pour maintenir la compatibilité avec le code pré-Java 5.

```java
// Code source
List<String> stringList = new ArrayList<String>();
List<Integer> intList = new ArrayList<Integer>();

// Après compilation (bytecode)
List stringList = new ArrayList();
List intList = new ArrayList();

// À l'exécution
System.out.println(stringList.getClass() == intList.getClass()); // true !

// Impossible à l'exécution
// if (list instanceof List<String>) { } // Erreur de compilation
```

### Conséquences du Type Erasure

Limitations :

- Pas de `new T()` dans une classe générique
- Pas de `T.class`
- Pas d'`instanceof` avec génériques
- Pas de tableaux génériques

Solutions :

```java
// Passer la classe en paramètre
public class Factory<T> {
    private Class<T> type;

    public Factory(Class<T> type) {
        this.type = type;
    }

    public T create() throws Exception {
        return type.newInstance();
    }
}
```
