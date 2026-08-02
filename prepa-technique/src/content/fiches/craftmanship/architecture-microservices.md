---
preparations: ["fullstack"]
title: "Architecture Microservices"
description: "Décomposer une application en services autonomes : stratégies de découpage, patterns de communication et patterns essentiels (API Gateway, Circuit Breaker, Saga)."
categorie: "craftmanship"
ordre: 11
---

L'architecture microservices décompose une application en services autonomes et indépendants.

## Qu'est-ce qu'une architecture microservices ?

C'est une approche architecturale qui structure une application comme un ensemble de services faiblement couplés.

### 🏗️ Définition

**Principe fondamental** : décomposer une application monolithique en plusieurs services indépendants, chacun responsable d'une fonctionnalité métier spécifique.

**Caractéristiques clés :**

- Services autonomes et déployables indépendamment
- Communication via APIs (HTTP/REST, gRPC, messaging)
- Chaque service a sa propre base de données
- Équipes organisées autour des services
- Décentralisation des données et de la gouvernance

### 📊 Comparaison monolithe vs microservices

```text
MONOLITHE                     MICROSERVICES
┌─────────────────────────┐   ┌─────┐ ┌─────┐ ┌─────┐
│                         │   │User │ │Order│ │Pay  │
│    Application          │   │Mgmt │ │Mgmt │ │Mgmt │
│                         │   └──┬──┘ └──┬──┘ └──┬──┘
│  ┌─────┐ ┌─────┐ ┌───┐  │      │       │       │
│  │User │ │Order│ │Pay│  │   ┌──▼──┐ ┌──▼──┐ ┌──▼──┐
│  │Mgmt │ │Mgmt │ │Mgt│  │   │ DB  │ │ DB  │ │ DB  │
│  └─────┘ └─────┘ └───┘  │   │User │ │Order│ │Pay  │
│                         │   └─────┘ └─────┘ └─────┘
│      ┌─────────────┐    │
│      │  Database   │    │   ✅ Indépendance technologique
│      │             │    │   ✅ Scalabilité granulaire
│      └─────────────┘    │   ✅ Déploiement indépendant
└─────────────────────────┘   ✅ Résilience isolée
```

## Comment faire la séparation des services ?

Plusieurs stratégies existent pour décomposer un monolithe en microservices.

### Séparation fonctionnelle (recommandée)

**🎯 Par domaine métier (DDD)** : chaque service correspond à un Bounded Context.

Exemple e-commerce :

- Service Catalogue (produits, catégories)
- Service Commandes (panier, checkout)
- Service Utilisateurs (profils, authentification)
- Service Paiements (transactions, facturation)

**👥 Par capacité métier** : organisé autour des capacités de l'organisation.

Exemple banque :

- Service Comptes (gestion des comptes)
- Service Crédits (prêts, hypothèques)
- Service Investissements (portefeuilles)

**📊 Par flux de données** : suivre le flux des données métier.
*Principe : minimiser les communications inter-services.*

### Séparation technique (à éviter)

**❌ Par couche technique** : séparation UI, Business Logic, Data Access.

Problèmes :

- Couplage fort entre services
- Les changements métier impactent plusieurs services
- Difficile à maintenir et faire évoluer

**⚠️ Par technologie** : service Java, service Node.js, service Python.
*Problème : ne respecte pas les frontières métier.*

### 💡 Critères de bonne séparation

- **Cohésion forte** : fonctionnalités liées dans le même service
- **Couplage faible** : minimum d'interactions entre services
- **Autonomie** : l'équipe peut développer/déployer indépendamment
- **Responsabilité unique** : un service = un domaine métier
- **Données privées** : chaque service possède ses données
- **Évolutivité** : peut évoluer sans impacter les autres

## Avantages des microservices

### 🚀 Agilité et développement

- **Déploiement indépendant** : chaque service peut être déployé séparément
- **Équipes autonomes** : équipes spécialisées par domaine métier
- **Cycles de release rapides** : livraisons fréquentes et indépendantes
- **Innovation technologique** : choix de stack technique par service

### ⚡ Performance et scalabilité

- **Scalabilité granulaire** : scaler uniquement les services nécessaires
- **Résilience** : isolation des pannes, fault tolerance
- **Optimisation ciblée** : performance adaptée par service
- **Distribution géographique** : services déployés près des utilisateurs

### 🔧 Maintenance et évolution

- **Codebase plus petite** : plus facile à comprendre et maintenir
- **Refactoring localisé** : changements isolés dans un service
- **Remplacement progressif** : migration service par service

### 👥 Organisation

- **Ownership claire** : responsabilité définie par équipe
- **Spécialisation** : expertise métier par équipe
- **Parallélisation** : développement simultané de plusieurs services

## Défis et complexités des microservices

### 🌐 Complexité opérationnelle

- **🔧 Gestion d'infrastructure** : multiplication des services à déployer et monitorer.
  *Impact : besoin d'automatisation (Docker, Kubernetes, CI/CD).*
- **📊 Monitoring distribué** : traçabilité des requêtes à travers plusieurs services.
  *Solution : distributed tracing, logging centralisé.*
- **🔄 Gestion des versions** : compatibilité entre versions de services.
  *Approche : versioning d'APIs, backward compatibility.*

### 🔗 Complexité de communication

- **🌐 Latence réseau** : communications inter-services plus lentes.
  *Mitigation : caching, async messaging, optimisation réseau.*
- **🔄 Transactions distribuées** : pas de transactions ACID globales.
  *Pattern : Saga Pattern, eventual consistency.*
- **🔍 Service discovery** : comment les services se trouvent-ils ?
  *Outils : Consul, Eureka, Kubernetes DNS.*

### 💾 Gestion des données

- **🗄️ Consistance des données** : données distribuées, pas de cohérence immédiate.
  *Approche : eventual consistency, CQRS.*
- **🔄 Synchronisation** : maintenir la cohérence entre services.
  *Pattern : event sourcing, domain events.*

### 👥 Défis organisationnels

- **🎯 Coordination d'équipes** : communication entre équipes autonomes.
  *Solution : API contracts, documentation, governance.*
- **📈 Courbe d'apprentissage** : compétences DevOps, distributed systems.
  *Besoin : formation, expertise technique avancée.*

## Patterns de communication

Comment les microservices communiquent-ils entre eux ?

### 🔄 Communication synchrone

**🌐 HTTP/REST** : communication via APIs REST.

```text
GET /api/users/123
POST /api/orders
{
  "userId": 123,
  "items": [{"productId": 456, "quantity": 2}]
}
```

*Avantages : simple, standard, debugging facile.*

**⚡ gRPC** : communication haute performance avec Protocol Buffers.

```text
service UserService {
  rpc GetUser(UserRequest) returns (UserResponse);
  rpc CreateUser(CreateUserRequest) returns (UserResponse);
}
```

*Avantages : performance, type safety, streaming.*

### 📨 Communication asynchrone

**📬 Message queues** : communication via files de messages.

```js
// Producer
await queue.send('order.created', {
  orderId: '123',
  userId: '456',
  amount: 99.99
});

// Consumer
queue.subscribe('order.created', (message) => {
  // Process order
});
```

*Outils : RabbitMQ, Apache Kafka, AWS SQS.*

**🎯 Event-driven** : communication via événements métier.

```text
// Event
{
  "eventType": "UserRegistered",
  "userId": "123",
  "email": "user@example.com",
  "timestamp": "2024-01-01T10:00:00Z"
}

// Multiple services can react to this event
```

*Avantages : découplage, scalabilité, résilience.*

### 🎯 Quand utiliser quoi ?

**Communication synchrone :**

- Requêtes en temps réel
- Validation immédiate
- Opérations critiques
- Interactions utilisateur

**Communication asynchrone :**

- Traitement en arrière-plan
- Notifications
- Intégrations externes
- Événements métier

## Patterns architecturaux essentiels

### API Gateway

Point d'entrée unique pour toutes les requêtes clients vers les microservices.

**Responsabilités :**

- Routage des requêtes
- Authentification/autorisation
- Rate limiting
- Monitoring et logging
- Transformation de données

```text
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
┌──────▼──────┐
│ API Gateway │ ◄─── Single Entry Point
└──────┬──────┘
       │
   ┌───▼───┐┌───────┐┌───────┐
   │Service││Service││Service│
   │   A   ││   B   ││   C   │
   └───────┘└───────┘└───────┘

Outils : Kong, Zuul, AWS API Gateway
```

### Service Discovery

Mécanisme permettant aux services de se localiser dynamiquement.

**Approches :**

- **Client-side** : le client interroge le registry
- **Server-side** : load balancer + registry
- **Service mesh** : l'infrastructure gère la découverte

```text
┌─────────────┐
│   Service   │
│ Discovery   │ ◄─── Registry
│   (Consul)  │
└──────┬──────┘
       │
   ┌───▼───┐┌───────┐┌───────┐
   │Service││Service││Service│
   │   A   ││   B   ││   C   │
   └───┬───┘└───┬───┘└───┬───┘
       │        │        │
       └────────┼────────┘
                │
         Register/Discover

Outils : Consul, Eureka, etcd
```

### Circuit Breaker

Prévient les cascades de pannes en isolant les services défaillants.

**États :**

- **Closed** : les requêtes passent normalement
- **Open** : requêtes bloquées, retour immédiat
- **Half-Open** : test de récupération

```java
// Exemple avec Hystrix/Resilience4j
@CircuitBreaker(name = "userService")
public User getUser(String userId) {
    return userServiceClient.getUser(userId);
}
```

```yaml
# Configuration
circuitbreaker:
  instances:
    userService:
      failure-rate-threshold: 50
      wait-duration-in-open-state: 30s
      sliding-window-size: 10
```

> **À retenir :** le cycle des états est CLOSED → OPEN → HALF_OPEN → CLOSED.

### Saga Pattern

Gère les transactions distribuées via une séquence de transactions locales.

**Types :**

- **Choreography** : les services se coordonnent via des événements
- **Orchestration** : un orchestrateur central pilote la saga

**Compensation** : annulation en cas d'échec.

```text
// Saga Orchestration - Commande E-commerce
1. Reserve Inventory    ✅
2. Process Payment      ✅
3. Create Shipment      ❌ FAIL

// Compensation (rollback)
3. Cancel Shipment      ✅
2. Refund Payment       ✅
1. Release Inventory    ✅

// Choreography - Event-driven
OrderCreated → ReserveInventory
InventoryReserved → ProcessPayment
PaymentProcessed → CreateShipment
```

### Distributed Tracing avec X-Correlation-ID

Mécanisme permettant de suivre une requête à travers tous les microservices impliqués.

**Principe :**

- Propager un identifiant unique (X-Correlation-ID) à travers tous les services
- Chaque service ajoute cet ID dans ses logs
- Permet de reconstituer le parcours complet d'une requête
- Essentiel pour le debugging et l'analyse de performance

```java
// 1. Service Gateway - Génération de l'ID
@Component
public class CorrelationIdFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                         FilterChain chain) throws IOException, ServletException {
        String correlationId = UUID.randomUUID().toString();
        MDC.put("X-Correlation-ID", correlationId);
        ((HttpServletResponse) response).addHeader("X-Correlation-ID", correlationId);

        // Propagation vers le service suivant
        chain.doFilter(request, response);
    }
}

// 2. Service B - Propagation
@Component
public class TracingInterceptor implements ClientHttpRequestInterceptor {
    @Override
    public ClientHttpResponse intercept(HttpRequest request, byte[] body,
                                        ClientHttpRequestExecution execution) throws IOException {
        String correlationId = MDC.get("X-Correlation-ID");
        request.getHeaders().set("X-Correlation-ID", correlationId);

        // Log avec l'ID de corrélation
        log.info("Processing request {}", correlationId);

        return execution.execute(request, body);
    }
}
```

### 💡 Patterns complémentaires

- **CQRS** : séparation Command/Query
- **Event Sourcing** : stockage des événements
- **Bulkhead** : isolation des ressources
- **Retry Pattern** : tentatives automatiques
- **Timeout** : limitation du temps d'attente
- **Health Check** : monitoring de santé

## ✅ Recommandations pour réussir

Conseils pratiques pour une migration réussie vers les microservices.

### 🎯 Stratégie de migration

- **Commencer par un monolithe** : comprendre le domaine avant de découper
- **Migration progressive** : Strangler Fig Pattern, service par service
- **Automatisation first** : CI/CD, monitoring, infrastructure as code

### ⚠️ Pièges à éviter

- **Distributed monolith** : services trop couplés, déploiement synchrone
- **Microservices trop petits** : overhead de communication trop important
- **Ignorer la culture DevOps** : équipes pas prêtes pour l'autonomie

> **Piège d'entretien :** le « distributed monolith » — des services qui doivent être déployés ensemble et s'appellent en cascade — cumule les inconvénients des deux mondes : la complexité des microservices sans leur indépendance.
