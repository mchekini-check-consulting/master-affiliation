---
title: "DDD + Architecture Hexagonale + Clean Architecture"
description: "Trois approches complémentaires — DDD, architecture hexagonale et Clean Architecture — pour isoler le domaine métier et construire des applications maintenables."
categorie: "craftmanship"
ordre: 8
---

Trois concepts architecturaux complémentaires pour des applications maintenables et évolutives : le DDD modélise le domaine, l'architecture hexagonale l'isole des détails techniques, la Clean Architecture organise le tout en couches.

## Domain Driven Design (DDD)

Le DDD est une conception pilotée par le domaine métier.

### 🎯 Concepts clés

- **Ubiquitous Language** : langage commun entre développeurs et experts métier
- **Bounded Context** : frontières explicites où un modèle s'applique
- **Domain Model** : représentation du domaine métier en code

### 🏗️ Building blocks

```text
┌─────────────────────────────────────┐
│           DOMAIN LAYER              │
├─────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐ │
│  │   Entity     │  │ Value Object │ │
│  │              │  │              │ │
│  │ - id         │  │ - immutable  │ │
│  │ - behavior   │  │ - equality   │ │
│  └──────────────┘  └──────────────┘ │
│                                     │
│  ┌──────────────┐  ┌──────────────┐ │
│  │ Aggregate    │  │ Domain       │ │
│  │ Root         │  │ Service      │ │
│  │              │  │              │ │
│  │ - consistency│  │ - stateless  │ │
│  │ - invariants │  │ - operations │ │
│  └──────────────┘  └──────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐│
│  │        Repository               ││
│  │        (Interface)              ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

### 💡 Exemple : e-commerce

**Entity — Order**

```java
public class Order {
    private OrderId id;
    private CustomerId customerId;
    private List<OrderLine> orderLines;
    private OrderStatus status;
    private Money totalAmount;

    // Comportements métier
    public void addOrderLine(Product product, int quantity) {
        if (status != OrderStatus.DRAFT) {
            throw new IllegalStateException("Cannot modify confirmed order");
        }
        orderLines.add(new OrderLine(product, quantity));
        recalculateTotal();
    }

    public void confirm() {
        if (orderLines.isEmpty()) {
            throw new IllegalStateException("Cannot confirm empty order");
        }
        this.status = OrderStatus.CONFIRMED;
    }

    private void recalculateTotal() {
        this.totalAmount = orderLines.stream()
            .map(OrderLine::getSubtotal)
            .reduce(Money.ZERO, Money::add);
    }
}
```

**Value Object — Money**

```java
public class Money {
    private final BigDecimal amount;
    private final Currency currency;

    public Money(BigDecimal amount, Currency currency) {
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Amount cannot be negative");
        }
        this.amount = amount;
        this.currency = currency;
    }

    public Money add(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException("Cannot add different currencies");
        }
        return new Money(this.amount.add(other.amount), this.currency);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Money)) return false;
        Money money = (Money) obj;
        return amount.equals(money.amount) && currency.equals(money.currency);
    }

    public static final Money ZERO = new Money(BigDecimal.ZERO, Currency.EUR);
}
```

> **Piège d'entretien :** une Entity est définie par son **identité** (elle reste « la même » quand ses attributs changent) ; un Value Object est **immuable** et défini par ses valeurs — deux `Money` de même montant et devise sont égaux.

## Architecture Hexagonale (Ports & Adapters)

Objectif : isoler le domaine métier des détails techniques.

### 🎯 Principe

L'architecture hexagonale isole la logique métier (domaine) des détails techniques (base de données, API, UI) grâce aux ports et adapters :

- **Ports** : interfaces définies par le domaine
- **Adapters** : implémentations techniques

### 🏗️ Schéma hexagonal

```text
                    ┌─────────────┐
                    │   Web API   │
                    │  (Adapter)  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    Port     │
                    │ (Interface) │
                    └──────┬──────┘
                           │
    ┌─────────────┐        │        ┌─────────────┐
    │  Database   │◄───────┼───────►│   Domain    │
    │  (Adapter)  │        │        │   (Core)    │
    └─────────────┘        │        └─────────────┘
                           │
                    ┌──────▼──────┐
                    │    Port     │
                    │ (Interface) │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Email     │
                    │  (Adapter)  │
                    └─────────────┘
```

### 💡 Exemple d'implémentation

**Port (domaine)**

```java
// Port défini par le domaine
public interface OrderRepository {
    void save(Order order);
    Optional<Order> findById(OrderId id);
    List<Order> findByCustomerId(CustomerId customerId);
}

// Service du domaine
@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final PaymentService paymentService;

    public OrderService(OrderRepository orderRepository,
                        PaymentService paymentService) {
        this.orderRepository = orderRepository;
        this.paymentService = paymentService;
    }

    public void processOrder(OrderId orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));

        order.confirm();
        paymentService.processPayment(order.getTotalAmount());
        orderRepository.save(order);
    }
}
```

**Adapter (infrastructure)**

```java
// Adapter JPA
@Repository
public class JpaOrderRepository implements OrderRepository {
    private final OrderJpaRepository jpaRepository;
    private final OrderMapper mapper;

    @Override
    public void save(Order order) {
        OrderEntity entity = mapper.toEntity(order);
        jpaRepository.save(entity);
    }

    @Override
    public Optional<Order> findById(OrderId id) {
        return jpaRepository.findById(id.getValue())
            .map(mapper::toDomain);
    }

    @Override
    public List<Order> findByCustomerId(CustomerId customerId) {
        return jpaRepository.findByCustomerId(customerId.getValue())
            .stream()
            .map(mapper::toDomain)
            .collect(Collectors.toList());
    }
}
```

**Adapter (web)**

```java
// Contrôleur REST
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    @PostMapping("/{orderId}/process")
    public ResponseEntity<Void> processOrder(
            @PathVariable String orderId) {
        try {
            orderService.processOrder(new OrderId(orderId));
            return ResponseEntity.ok().build();
        } catch (OrderNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDto> getOrder(
            @PathVariable String orderId) {
        // Implémentation...
    }
}
```

## Clean Architecture

Une architecture en couches avec dépendances inversées.

### 🎯 Règles de dépendance

- **Règle de dépendance** : les dépendances pointent toujours vers l'intérieur (vers le domaine)
- **Inversion de contrôle** : les couches externes implémentent les interfaces définies par les couches internes

### 🏗️ Schéma Clean Architecture

```text
┌─────────────────────────────────────────────┐
│           FRAMEWORKS & DRIVERS              │
│  ┌─────────┐ ┌─────────┐ ┌─────────────┐    │
│  │   Web   │ │Database │ │  External   │    │
│  │   UI    │ │         │ │  Services   │    │
│  └─────────┘ └─────────┘ └─────────────┘    │
├─────────────────────────────────────────────┤
│           INTERFACE ADAPTERS                │
│  ┌─────────────┐ ┌─────────────────────┐    │
│  │Controllers  │ │    Gateways         │    │
│  │Presenters   │ │    Repositories     │    │
│  └─────────────┘ └─────────────────────┘    │
├─────────────────────────────────────────────┤
│              USE CASES                      │
│  ┌─────────────────────────────────────┐    │
│  │        Application Logic            │    │
│  │        (Business Rules)             │    │
│  └─────────────────────────────────────┘    │
├─────────────────────────────────────────────┤
│               ENTITIES                      │
│  ┌─────────────────────────────────────┐    │
│  │         Domain Models               │    │
│  │      (Enterprise Rules)             │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
           ▲         ▲         ▲
           │         │         │
      Dependencies point inward
```

### 📁 Structure de projet

**Structure des packages**

```text
src/
├── main/java/com/example/
│   ├── domain/                    # Entities
│   │   ├── model/
│   │   │   ├── Order.java
│   │   │   ├── Customer.java
│   │   │   └── Product.java
│   │   └── repository/            # Interfaces
│   │       └── OrderRepository.java
│   │
│   ├── usecase/                   # Use Cases
│   │   ├── CreateOrderUseCase.java
│   │   ├── ProcessOrderUseCase.java
│   │   └── dto/
│   │       ├── CreateOrderRequest.java
│   │       └── OrderResponse.java
│   │
│   ├── adapter/                   # Interface Adapters
│   │   ├── web/
│   │   │   └── OrderController.java
│   │   ├── persistence/
│   │   │   ├── JpaOrderRepository.java
│   │   │   └── entity/
│   │   │       └── OrderEntity.java
│   │   └── external/
│   │       └── PaymentServiceAdapter.java
│   │
│   └── config/                    # Configuration
│       └── DependencyConfig.java
```

**Exemple de use case**

```java
@Component
public class CreateOrderUseCase {
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public CreateOrderUseCase(OrderRepository orderRepository,
                              CustomerRepository customerRepository,
                              ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    public OrderResponse execute(CreateOrderRequest request) {
        // 1. Validation
        Customer customer = customerRepository
            .findById(request.getCustomerId())
            .orElseThrow(() -> new CustomerNotFoundException());

        // 2. Business Logic
        Order order = new Order(customer);

        for (OrderLineRequest lineRequest : request.getOrderLines()) {
            Product product = productRepository
                .findById(lineRequest.getProductId())
                .orElseThrow(() -> new ProductNotFoundException());

            order.addOrderLine(product, lineRequest.getQuantity());
        }

        // 3. Persistence
        Order savedOrder = orderRepository.save(order);

        // 4. Response
        return OrderResponse.from(savedOrder);
    }
}
```

## 🔄 Comparaison et bonnes pratiques

### DDD

**Focus :** modélisation du domaine métier

**Avantages :**

- Langage commun équipe/métier
- Modèle riche et expressif
- Frontières claires (Bounded Context)

**Quand l'utiliser :**

- Domaine métier complexe
- Collaboration étroite avec experts métier
- Évolution fréquente des règles

### Architecture Hexagonale

**Focus :** isolation du domaine

**Avantages :**

- Testabilité maximale
- Indépendance technologique
- Flexibilité d'implémentation

**Quand l'utiliser :**

- Logique métier importante
- Multiples interfaces (API, UI, CLI)
- Tests automatisés critiques

### Clean Architecture

**Focus :** organisation en couches

**Avantages :**

- Structure claire et prévisible
- Séparation des responsabilités
- Évolutivité et maintenabilité

**Quand l'utiliser :**

- Applications de taille moyenne/grande
- Équipes multiples
- Cycle de vie long

### 💡 Conseils d'implémentation

- **Commencez simple** : n'appliquez ces patterns que si la complexité le justifie
- **Tests d'abord** : l'architecture doit faciliter les tests, pas les compliquer
- **Évolution progressive** : refactorisez vers ces architectures au fur et à mesure
- **Documentation** : documentez les décisions architecturales (ADR)
- **Cohérence** : une fois choisi, appliquez le pattern de manière cohérente
