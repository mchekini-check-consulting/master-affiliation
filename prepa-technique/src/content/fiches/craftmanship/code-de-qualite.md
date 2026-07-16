---
title: "Code de Qualité"
description: "Les 4 piliers d'un code de qualité — maintenable, testable, lisible et extensible — illustrés par des exemples Java."
categorie: "craftmanship"
ordre: 1
---

Un code de qualité repose sur 4 piliers : il est **maintenable**, **testable**, **lisible** et **extensible**.

## Maintenable

Facile à modifier et à faire évoluer sans casser l'existant.

<div class="exemple exemple--mauvais">

```java
// Classe qui fait tout, difficile à maintenir
public class OrderManager {
    public void processOrder(Order order) {
        // Validation
        if (order.getItems().isEmpty()) throw new Exception("Empty order");

        // Calcul prix
        double total = 0;
        for (Item item : order.getItems()) {
            total += item.getPrice() * item.getQuantity();
            if (item.getCategory().equals("FOOD")) total *= 0.9;
        }

        // Envoi email
        EmailService.send(order.getCustomer().getEmail(),
                         "Order confirmed: " + total);

        // Sauvegarde base
        Database.save(order);
    }
}
```

</div>

<div class="exemple exemple--bon">

```java
// Responsabilités séparées, facile à maintenir
public class OrderService {
    private final OrderValidator validator;
    private final PriceCalculator calculator;
    private final NotificationService notificationService;
    private final OrderRepository repository;

    public void processOrder(Order order) {
        validator.validate(order);
        BigDecimal total = calculator.calculateTotal(order);
        notificationService.sendConfirmation(order, total);
        repository.save(order);
    }
}
```

</div>

## Testable

Peut être testé facilement et de manière isolée.

<div class="exemple exemple--mauvais">

```java
// Dépendances hardcodées, impossible à tester
public class UserService {
    public boolean authenticateUser(String username, String password) {
        // Connexion directe à la base
        Connection conn = DriverManager.getConnection(
            "jdbc:mysql://prod-db:3306/users", "root", "password123");

        // Appel API externe
        HttpClient client = HttpClient.newHttpClient();
        String response = client.send(request).body();

        // Date système
        if (LocalDateTime.now().getHour() > 22) {
            return false; // Pas de connexion après 22h
        }

        return checkCredentials(username, password);
    }
}
```

</div>

<div class="exemple exemple--bon">

```java
// Dépendances injectées, facilement testable
public class UserService {
    private final UserRepository userRepository;
    private final ExternalAuthService authService;
    private final TimeProvider timeProvider;

    public UserService(UserRepository userRepository,
                      ExternalAuthService authService,
                      TimeProvider timeProvider) {
        this.userRepository = userRepository;
        this.authService = authService;
        this.timeProvider = timeProvider;
    }

    public boolean authenticateUser(String username, String password) {
        if (timeProvider.getCurrentHour() > 22) {
            return false;
        }

        User user = userRepository.findByUsername(username);
        return authService.validateCredentials(user, password);
    }
}
```

</div>

> **Point clé :** toute dépendance vers le monde extérieur (base de données, API, horloge système) doit être injectée pour pouvoir être remplacée par un mock dans les tests.

## Lisible

Compréhensible par n'importe quel développeur.

<div class="exemple exemple--mauvais">

```java
// Noms cryptiques, logique obscure
public class Calc {
    public double calc(List<Item> items, User u) {
        double t = 0;
        for (Item i : items) {
            double p = i.getP();
            if (u.getT() == 1 && i.getC().equals("FOOD")) {
                p *= 0.9;
            }
            if (u.getYears() > 5) p *= 0.95;
            t += p * i.getQ();
        }
        return t > 100 ? t * 0.98 : t;
    }
}
```

</div>

<div class="exemple exemple--bon">

```java
// Noms explicites, intention claire
public class ShoppingCartCalculator {
    private static final double FOOD_DISCOUNT = 0.10;
    private static final double LOYALTY_DISCOUNT = 0.05;
    private static final double BULK_DISCOUNT = 0.02;
    private static final double BULK_THRESHOLD = 100.0;

    public BigDecimal calculateTotalPrice(List<CartItem> items, Customer customer) {
        BigDecimal subtotal = calculateSubtotal(items, customer);

        if (qualifiesForBulkDiscount(subtotal)) {
            subtotal = applyBulkDiscount(subtotal);
        }

        return subtotal;
    }

    private boolean qualifiesForBulkDiscount(BigDecimal amount) {
        return amount.compareTo(BigDecimal.valueOf(BULK_THRESHOLD)) > 0;
    }
}
```

</div>

## Extensible

Peut être étendu sans modifier le code existant.

<div class="exemple exemple--mauvais">

```java
// Modification nécessaire pour chaque nouveau type
public class PaymentProcessor {
    public void processPayment(String type, double amount) {
        if (type.equals("CREDIT_CARD")) {
            // Logique carte de crédit
            System.out.println("Processing credit card: " + amount);
        } else if (type.equals("PAYPAL")) {
            // Logique PayPal
            System.out.println("Processing PayPal: " + amount);
        } else if (type.equals("BITCOIN")) {
            // Nouvelle logique ajoutée ici
            System.out.println("Processing Bitcoin: " + amount);
        }
        // Pour ajouter Apple Pay, il faut modifier cette classe
    }
}
```

</div>

<div class="exemple exemple--bon">

```java
// Extensible sans modification (Open/Closed Principle)
public interface PaymentMethod {
    PaymentResult process(BigDecimal amount);
}

public class PaymentProcessor {
    private final Map<String, PaymentMethod> paymentMethods;

    public PaymentProcessor(Map<String, PaymentMethod> methods) {
        this.paymentMethods = methods;
    }

    public PaymentResult processPayment(String type, BigDecimal amount) {
        PaymentMethod method = paymentMethods.get(type);
        if (method == null) {
            throw new UnsupportedPaymentMethodException(type);
        }
        return method.process(amount);
    }
}

// Nouvelles implémentations sans modifier le code existant
public class ApplePayMethod implements PaymentMethod {
    public PaymentResult process(BigDecimal amount) {
        // Logique Apple Pay
        return new PaymentResult(true, "Apple Pay processed");
    }
}
```

</div>

> **Piège d'entretien :** une longue chaîne de `if/else` sur un type est le signe classique d'une violation du principe Open/Closed — la bonne réponse attendue est le polymorphisme (interface + implémentations).
