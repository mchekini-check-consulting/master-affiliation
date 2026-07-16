---
title: "Exceptions"
description: "Gestion des erreurs en Java : hiérarchie des exceptions, checked vs unchecked, try-catch-finally, try-with-resources et exceptions personnalisées."
categorie: "java"
ordre: 8
---

Gestion des erreurs et exceptions en Java.

## 🌳 Hiérarchie des exceptions

```text
Throwable
├── Error (Erreurs système, non récupérables)
│   ├── OutOfMemoryError
│   ├── StackOverflowError
│   └── VirtualMachineError
└── Exception
    ├── RuntimeException (Unchecked Exceptions)
    │   ├── NullPointerException
    │   ├── IllegalArgumentException
    │   ├── IndexOutOfBoundsException
    │   └── ClassCastException
    └── Checked Exceptions (doivent être gérées)
        ├── IOException
        ├── SQLException
        ├── ClassNotFoundException
        └── ParseException
```

## 🎯 Types d'exceptions

### Checked Exceptions

Elles doivent être gérées ou déclarées.

```java
// Doit être dans try-catch ou throws
public void readFile(String filename) throws IOException {
    FileReader file = new FileReader(filename); // IOException possible
    // ...
}

// Ou gestion avec try-catch
public void safeReadFile(String filename) {
    try {
        FileReader file = new FileReader(filename);
        // ...
    } catch (IOException e) {
        System.err.println("Erreur lecture: " + e.getMessage());
    }
}
```

### Unchecked Exceptions

Optionnelles à gérer (RuntimeException).

```java
// Pas obligé de gérer, mais recommandé
public void divide(int a, int b) {
    if (b == 0) {
        throw new IllegalArgumentException("Division par zéro");
    }
    int result = a / b; // ArithmeticException possible
}

// Gestion optionnelle
public void safeDivide(int a, int b) {
    try {
        int result = a / b;
        System.out.println("Résultat: " + result);
    } catch (ArithmeticException e) {
        System.err.println("Erreur: " + e.getMessage());
    }
}
```

## 🛡️ Try-Catch-Finally

### Structure complète

```java
public void complexOperation() {
    FileInputStream fis = null;
    try {
        fis = new FileInputStream("data.txt");
        // Opérations risquées
        int data = fis.read();

    } catch (FileNotFoundException e) {
        System.err.println("Fichier non trouvé: " + e.getMessage());

    } catch (IOException e) {
        System.err.println("Erreur I/O: " + e.getMessage());

    } catch (Exception e) {
        // Catch générique (à éviter généralement)
        System.err.println("Erreur inattendue: " + e.getMessage());

    } finally {
        // TOUJOURS exécuté
        if (fis != null) {
            try {
                fis.close();
            } catch (IOException e) {
                System.err.println("Erreur fermeture: " + e.getMessage());
            }
        }
        System.out.println("Nettoyage terminé");
    }
}
```

> **Point clé :** les blocs `catch` s'évaluent dans l'ordre : toujours placer les exceptions les plus spécifiques avant les plus générales, sinon le code ne compile pas (« exception already caught »).

### Multi-catch (Java 7+)

```java
public void multiCatchExample() {
    try {
        // Opérations diverses
        String str = null;
        int length = str.length(); // NullPointerException

        int[] array = new int[5];
        int value = array[10];     // ArrayIndexOutOfBoundsException

    } catch (NullPointerException | ArrayIndexOutOfBoundsException e) {
        // Gestion commune pour plusieurs exceptions
        System.err.println("Erreur de programmation: " + e.getMessage());

    } catch (RuntimeException e) {
        // Autres RuntimeExceptions
        System.err.println("Autre erreur runtime: " + e.getMessage());
    }
}

// Récupération de l'exception originale
public void rethrowExample() throws Exception {
    try {
        riskyOperation();
    } catch (Exception e) {
        // Log et relance
        System.err.println("Erreur capturée: " + e.getMessage());
        throw e; // Relance la même exception
    }
}
```

## 🔄 Try-with-Resources (Java 7+)

### Gestion automatique des ressources

```java
// Avant Java 7 (verbeux)
public void oldWay() {
    FileInputStream fis = null;
    BufferedReader br = null;
    try {
        fis = new FileInputStream("file.txt");
        br = new BufferedReader(new InputStreamReader(fis));
        String line = br.readLine();
        // ...
    } catch (IOException e) {
        e.printStackTrace();
    } finally {
        if (br != null) {
            try { br.close(); } catch (IOException e) { }
        }
        if (fis != null) {
            try { fis.close(); } catch (IOException e) { }
        }
    }
}

// Java 7+ (automatique)
public void newWay() {
    try (FileInputStream fis = new FileInputStream("file.txt");
         BufferedReader br = new BufferedReader(new InputStreamReader(fis))) {

        String line = br.readLine();
        // ...

    } catch (IOException e) {
        e.printStackTrace();
    }
    // Fermeture automatique de br et fis !
}
```

### Ressources personnalisées

```java
// Implémenter AutoCloseable
public class DatabaseConnection implements AutoCloseable {
    private Connection connection;

    public DatabaseConnection(String url) throws SQLException {
        this.connection = DriverManager.getConnection(url);
        System.out.println("Connexion ouverte");
    }

    public void executeQuery(String sql) throws SQLException {
        // Exécution de la requête
    }

    @Override
    public void close() throws SQLException {
        if (connection != null && !connection.isClosed()) {
            connection.close();
            System.out.println("Connexion fermée");
        }
    }
}

// Utilisation
public void useDatabase() {
    try (DatabaseConnection db = new DatabaseConnection("jdbc:...")) {
        db.executeQuery("SELECT * FROM users");
        // ...
    } catch (SQLException e) {
        e.printStackTrace();
    }
    // close() appelé automatiquement
}
```

## 🎨 Exceptions personnalisées

### Checked Exception personnalisée

```java
public class InsufficientFundsException extends Exception {
    private double amount;
    private double balance;

    public InsufficientFundsException(double amount, double balance) {
        super("Fonds insuffisants: tentative de retrait de " + amount +
              " avec un solde de " + balance);
        this.amount = amount;
        this.balance = balance;
    }

    public double getAmount() { return amount; }
    public double getBalance() { return balance; }
    public double getShortfall() { return amount - balance; }
}

public class BankAccount {
    private double balance;

    public void withdraw(double amount) throws InsufficientFundsException {
        if (amount > balance) {
            throw new InsufficientFundsException(amount, balance);
        }
        balance -= amount;
    }
}
```

### Unchecked Exception personnalisée

```java
public class InvalidEmailException extends RuntimeException {
    private String email;

    public InvalidEmailException(String email) {
        super("Email invalide: " + email);
        this.email = email;
    }

    public InvalidEmailException(String email, Throwable cause) {
        super("Email invalide: " + email, cause);
        this.email = email;
    }

    public String getEmail() { return email; }
}

public class UserService {
    public void createUser(String email) {
        if (!isValidEmail(email)) {
            throw new InvalidEmailException(email);
        }
        // Création de l'utilisateur
    }

    private boolean isValidEmail(String email) {
        return email != null && email.contains("@");
    }
}
```

## ✅ Bonnes pratiques

### À faire

<div class="exemple exemple--bon">

Être spécifique dans les catch :

```java
try {
    // ...
} catch (FileNotFoundException e) {
    // Gestion spécifique
} catch (IOException e) {
    // Gestion plus générale
}
```

</div>

<div class="exemple exemple--bon">

Utiliser try-with-resources :

```java
try (Resource r = new Resource()) {
    // Utilisation
} // Fermeture automatique
```

</div>

### À éviter

<div class="exemple exemple--mauvais">

Catch vide ou trop générique :

```java
try {
    // ...
} catch (Exception e) {
    // Ne rien faire - MAUVAIS !
}
```

</div>

<div class="exemple exemple--mauvais">

Utiliser les exceptions pour le contrôle de flux :

```java
// MAUVAIS : exception pour logique normale
try {
    return array[index];
} catch (ArrayIndexOutOfBoundsException e) {
    return null;
}
```

</div>
