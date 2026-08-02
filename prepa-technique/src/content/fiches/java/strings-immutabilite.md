---
preparations: ["fullstack"]
title: "Strings & Immutabilité"
description: "Immutabilité des String en Java, String Pool, StringBuilder vs StringBuffer et méthodes essentielles de manipulation de chaînes."
categorie: "java"
ordre: 6
---

Gestion des chaînes de caractères et concept d'immutabilité en Java.

## 🔒 Immutabilité des Strings

### Qu'est-ce que l'immutabilité ?

Une fois créée, une String ne peut pas être modifiée. Toute « modification » crée une nouvelle String.

```java
String str = "Hello";
System.out.println(str.hashCode()); // Ex: 69609650

str = str + " World";
System.out.println(str.hashCode()); // Ex: 1794106052 (différent !)

// La String originale "Hello" existe toujours en mémoire
// Une nouvelle String "Hello World" a été créée
```

### Pourquoi l'immutabilité ?

- Sécurité : pas de modification accidentelle
- Thread-safety : partage sûr entre threads
- Hashcode stable : utilisation dans HashMap
- String Pool : optimisation mémoire
- Sécurité : mots de passe, URLs, etc.

> **Attention :** concaténer des Strings en boucle crée beaucoup d'objets temporaires !

## 🏊 String Pool (Intern Pool)

### Mécanisme du String Pool

```java
// Littéraux String vont dans le pool
String s1 = "Hello";
String s2 = "Hello";
System.out.println(s1 == s2); // true (même référence)

// new String() crée un nouvel objet
String s3 = new String("Hello");
System.out.println(s1 == s3); // false (références différentes)
System.out.println(s1.equals(s3)); // true (même contenu)

// intern() force l'ajout au pool
String s4 = s3.intern();
System.out.println(s1 == s4); // true (même référence du pool)
```

### Optimisation mémoire

Avantages du Pool :

- Économie de mémoire
- Comparaison rapide avec `==`
- Réutilisation automatique

Attention :

- Pool en mémoire permanente
- `intern()` peut causer des fuites
- Utiliser avec parcimonie

## 🔧 StringBuilder vs StringBuffer

Alternatives mutables pour la manipulation de chaînes.

### StringBuilder (recommandé)

```java
// StringBuilder - Non thread-safe mais plus rapide
StringBuilder sb = new StringBuilder();
sb.append("Hello");
sb.append(" ");
sb.append("World");
sb.insert(5, " Beautiful");
sb.delete(5, 15); // Supprime " Beautiful"

String result = sb.toString(); // "Hello World"

// Exemple avec boucle
StringBuilder builder = new StringBuilder();
for (int i = 0; i < 1000; i++) {
    builder.append("Item ").append(i).append(", ");
}
String list = builder.toString();
```

### StringBuffer (legacy)

```java
// StringBuffer - Thread-safe mais plus lent
StringBuffer buffer = new StringBuffer();
buffer.append("Thread-safe");
buffer.append(" concatenation");

// Méthodes synchronisées
public synchronized StringBuffer append(String str) {
    // Implémentation thread-safe
}

// Utilisation en environnement multi-thread
public class ThreadSafeStringBuilder {
    private StringBuffer buffer = new StringBuffer();

    public void addMessage(String msg) {
        buffer.append(msg).append("\n");
    }

    public String getMessages() {
        return buffer.toString();
    }
}
```

### Comparaison des performances

| Opération | String | StringBuilder | StringBuffer |
| --- | --- | --- | --- |
| Concaténation simple | ❌ Lent (O(n²)) | ✅ Rapide (O(n)) | ⚠️ Moyen (O(n)) |
| Thread-safety | ✅ Immutable | ❌ Non thread-safe | ✅ Thread-safe |
| Mémoire | ❌ Beaucoup d'objets | ✅ Buffer réutilisé | ✅ Buffer réutilisé |

## 🛠️ Méthodes String essentielles

### Manipulation de base

```java
String text = "  Hello World  ";

// Longueur et vérifications
text.length();                    // 15
text.isEmpty();                   // false
text.isBlank();                   // false (Java 11+)

// Nettoyage
text.trim();                      // "Hello World"
text.strip();                     // "Hello World" (Java 11+, Unicode)
text.stripLeading();              // "Hello World  "
text.stripTrailing();             // "  Hello World"

// Casse
text.toUpperCase();               // "  HELLO WORLD  "
text.toLowerCase();               // "  hello world  "

// Recherche
text.contains("World");           // true
text.startsWith("  Hello");       // true
text.endsWith("World  ");         // true
text.indexOf("World");            // 8
text.lastIndexOf("l");            // 11
```

### Extraction et division

```java
String data = "Java,Python,JavaScript";

// Extraction
data.substring(5);                // "Python,JavaScript"
data.substring(5, 11);            // "Python"
data.charAt(0);                   // 'J'

// Division
String[] languages = data.split(",");
// ["Java", "Python", "JavaScript"]

// Remplacement
data.replace(",", " | ");         // "Java | Python | JavaScript"
data.replaceAll("\\w+", "Lang");  // "Lang,Lang,Lang" (regex)
data.replaceFirst("Java", "Kotlin"); // "Kotlin,Python,JavaScript"

// Répétition (Java 11+)
"Ha".repeat(3);                   // "HaHaHa"

// Jointure (Java 8+)
String joined = String.join(", ", languages);
// "Java, Python, JavaScript"
```

## ✅ Bonnes pratiques

### À faire

<div class="exemple exemple--bon">

Utiliser StringBuilder pour les concaténations multiples :

```java
StringBuilder sb = new StringBuilder();
for (String item : items) {
    sb.append(item).append(", ");
}
return sb.toString();
```

</div>

<div class="exemple exemple--bon">

Utiliser `equals()` pour comparer le contenu :

```java
if ("expected".equals(userInput)) {
    // Évite NullPointerException
}
```

</div>

### À éviter

<div class="exemple exemple--mauvais">

Concaténation en boucle avec `+` :

```java
String result = "";
for (String item : items) {
    result += item + ", "; // Crée beaucoup d'objets !
}
```

</div>

<div class="exemple exemple--mauvais">

Comparaison avec `==` :

```java
if (str1 == str2) {
    // Dangereux ! Compare les références
}
```

</div>

> **Piège d'entretien :** `==` compare les références, pas le contenu. Deux littéraux identiques peuvent renvoyer `true` à cause du String Pool, mais un `new String("...")` renverra `false` — utilisez toujours `equals()`.
