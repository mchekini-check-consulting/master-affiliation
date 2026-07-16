---
title: "Bonnes Pratiques"
description: "Règles fondamentales pour un code propre : nommage, KISS, DRY, exceptions, formatage et chasse aux magic numbers."
categorie: "craftmanship"
ordre: 2
---

Règles fondamentales pour un code propre.

## Conventions de Nommage & Noms Significatifs

<div class="exemple exemple--mauvais">

```java
// Noms courts et peu descriptifs
public class Usr {
    private int id;
    private String n;
    private String e;
    private boolean a;

    public boolean chk() {
        return a && e != null;
    }

    public void proc() {
        // Traitement
    }
}
```

</div>

<div class="exemple exemple--bon">

```java
// Conventions Java respectées, noms explicites
public class User {
    private int userId;
    private String name;
    private String email;
    private boolean active;

    // Méthodes avec verbes
    public boolean isValid() {
        return active && email != null;
    }

    // CamelCase pour les méthodes
    public void processUserRegistration() {
        // Traitement
    }
}
```

</div>

Conventions Java :

- Classes : PascalCase (`UserService`)
- Méthodes/variables : camelCase (`getUserById`)
- Constantes : SNAKE_CASE_MAJUSCULE (`MAX_RETRY_COUNT`)
- Packages : minuscules (`com.example.project`)

## Principes KISS & DRY

### KISS (Keep It Simple, Stupid)

Privilégier la simplicité. Si une solution simple existe, l'utiliser.

<div class="exemple exemple--mauvais">

Trop complexe : une suroptimisation prématurée qui sacrifie la lisibilité.

```java
// Suroptimisation prématurée
public boolean isWeekend(Date date) {
    Calendar calendar = Calendar.getInstance();
    calendar.setTime(date);
    int dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK);

    // Utilisation de bitwise operations pour "optimiser"
    int weekendBits = (1 << Calendar.SATURDAY) |
                      (1 << Calendar.SUNDAY);

    return ((1 << dayOfWeek) & weekendBits) != 0;
}
```

</div>

<div class="exemple exemple--bon">

Simple et clair : la même logique, immédiatement compréhensible.

```java
// Solution simple et lisible
public boolean isWeekend(Date date) {
    Calendar calendar = Calendar.getInstance();
    calendar.setTime(date);
    int dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK);

    return dayOfWeek == Calendar.SATURDAY ||
           dayOfWeek == Calendar.SUNDAY;
}
```

</div>

### DRY (Don't Repeat Yourself)

Éviter la duplication de code. Extraire les parties communes.

<div class="exemple exemple--mauvais">

```java
// Duplication de la logique de validation
public class UserService {
    public void createUser(User user) {
        // Validation email
        if (user.getEmail() == null ||
            !user.getEmail().matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")) {
            throw new IllegalArgumentException("Email invalide");
        }
        // Sauvegarde...
    }

    public void updateUser(User user) {
        // Même validation dupliquée
        if (user.getEmail() == null ||
            !user.getEmail().matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")) {
            throw new IllegalArgumentException("Email invalide");
        }
        // Mise à jour...
    }
}
```

</div>

<div class="exemple exemple--bon">

```java
// Extraction de la logique commune
public class UserService {
    public void createUser(User user) {
        validateEmail(user.getEmail());
        // Sauvegarde...
    }

    public void updateUser(User user) {
        validateEmail(user.getEmail());
        // Mise à jour...
    }

    // Méthode réutilisable
    private void validateEmail(String email) {
        if (email == null ||
            !email.matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")) {
            throw new IllegalArgumentException("Email invalide");
        }
    }
}
```

</div>

## Traitement des Exceptions

<div class="exemple exemple--mauvais">

```java
// Mauvais traitement des exceptions
public void processFile(String path) {
    try {
        // Ouvre un fichier
        FileInputStream file = new FileInputStream(path);
        // Traitement...

        // Exceptions génériques
    } catch (Exception e) {
        // Masque l'erreur réelle
        e.printStackTrace();

        // Ou pire, ignore l'exception
    } finally {
        // Oubli de fermer les ressources
    }
}
```

</div>

<div class="exemple exemple--bon">

```java
// Traitement correct des exceptions
public void processFile(String path) {
    // try-with-resources pour fermeture automatique
    try (FileInputStream file = new FileInputStream(path)) {
        // Traitement...

    // Exceptions spécifiques d'abord
    } catch (FileNotFoundException e) {
        // Journalisation structurée
        logger.error("Fichier non trouvé: {}", path, e);
        throw new ServiceException("Impossible de traiter le fichier", e);

    } catch (IOException e) {
        logger.error("Erreur lors de la lecture du fichier: {}", path, e);
        throw new ServiceException("Erreur de lecture", e);
    }
}
```

</div>

Bonnes pratiques pour les exceptions :

- Utiliser try-with-resources pour les ressources à fermer
- Attraper les exceptions spécifiques avant les génériques
- Journaliser avec contexte (paramètres, état)
- Encapsuler les exceptions techniques en exceptions métier
- Ne jamais ignorer une exception (catch vide)

> **Piège d'entretien :** un `catch (Exception e) {}` vide « avale » l'erreur : le programme continue dans un état incohérent et le bug devient introuvable en production.

## Formatage Cohérent du Code

<div class="exemple exemple--mauvais">

```java
// Style incohérent
public class UserService{
  private UserRepository userRepo;
public UserService(UserRepository repo) {
    this.userRepo=repo;}

    public User findById(Long id){
        if(id==null)
        return null;

        return userRepo.findById(id).orElse(null);
    }

  public List<User> findAll()
  { return userRepo.findAll(); }
}
```

</div>

<div class="exemple exemple--bon">

```java
// Style cohérent
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User findById(Long id) {
        if (id == null) {
            return null;
        }

        return userRepository.findById(id).orElse(null);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }
}
```

</div>

Conseils pour un formatage cohérent :

- Utiliser un outil de formatage automatique (ex. : Google Java Format)
- Configurer des hooks pre-commit pour vérifier le formatage
- Définir un style d'équipe dans un fichier `.editorconfig`
- Appliquer les mêmes règles d'indentation partout
- Limiter la longueur des lignes (généralement 80-120 caractères)

## Éviter la Duplication de Code

<div class="exemple exemple--mauvais">

```java
// Duplication entre classes
public class CustomerValidator {
    public boolean isValidEmail(String email) {
        return email != null &&
               email.matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");
    }
}

public class EmployeeValidator {
    // Même logique dupliquée
    public boolean isValidEmail(String email) {
        return email != null &&
               email.matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");
    }
}

public class SupplierValidator {
    // Encore la même logique
    public boolean validateEmail(String email) {
        if (email == null) return false;
        return email.matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");
    }
}
```

</div>

<div class="exemple exemple--bon">

```java
// Extraction dans une classe utilitaire
public class ValidationUtils {
    // Méthode statique réutilisable
    public static boolean isValidEmail(String email) {
        return email != null &&
               email.matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");
    }
}

// Utilisation dans les différentes classes
public class CustomerValidator {
    public boolean validateCustomer(Customer customer) {
        return ValidationUtils.isValidEmail(customer.getEmail());
    }
}

public class EmployeeValidator {
    public boolean validateEmployee(Employee employee) {
        return ValidationUtils.isValidEmail(employee.getEmail());
    }
}
```

</div>

Techniques pour éviter la duplication :

- Extraire le code commun dans des méthodes utilitaires
- Utiliser l'héritage pour partager des comportements
- Appliquer des design patterns comme Template Method ou Strategy
- Créer des bibliothèques internes pour les fonctionnalités communes
- Utiliser des outils d'analyse comme SonarQube pour détecter la duplication

## Éviter les Magic Numbers

Un magic number est une valeur constante utilisée dans le code sans explication claire de sa signification.

<div class="exemple exemple--mauvais">

```java
// Valeurs mystérieuses sans contexte
public class UserService {
    public boolean canAccess(User user) {
        // Pourquoi 18 ? Pourquoi 65 ?
        return user.getAge() > 18 && user.getAge() < 65;
    }

    public void processPayment(BigDecimal amount) {
        // Que représente 0.20 ?
        BigDecimal tax = amount.multiply(BigDecimal.valueOf(0.20));

        // Et 100 ?
        if (amount.compareTo(BigDecimal.valueOf(100)) > 0) {
            // Logique de réduction
        }
    }

    public void scheduleTask() {
        // 86400000 millisecondes = ?
        timer.schedule(task, 86400000);
    }
}
```

</div>

<div class="exemple exemple--bon">

```java
// Constantes explicites et documentées
public class UserService {
    private static final int MINIMUM_AGE = 18;
    private static final int MAXIMUM_AGE = 65;
    private static final BigDecimal TAX_RATE = BigDecimal.valueOf(0.20);
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = BigDecimal.valueOf(100);
    private static final long ONE_DAY_IN_MILLIS = 24 * 60 * 60 * 1000;

    public boolean canAccess(User user) {
        return user.getAge() > MINIMUM_AGE &&
               user.getAge() < MAXIMUM_AGE;
    }

    public void processPayment(BigDecimal amount) {
        BigDecimal tax = amount.multiply(TAX_RATE);

        if (amount.compareTo(FREE_SHIPPING_THRESHOLD) > 0) {
            // Livraison gratuite
        }
    }

    public void scheduleTask() {
        timer.schedule(task, ONE_DAY_IN_MILLIS);
    }
}
```

</div>

Avantages des constantes nommées :

- Code auto-documenté : la signification est claire
- Maintenance facilitée : changement en un seul endroit
- Réduction des erreurs : pas de recopie de valeurs
- Meilleure lisibilité et compréhension du code
- Possibilité d'ajouter des commentaires explicatifs
