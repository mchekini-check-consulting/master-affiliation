---
title: "Spring Cloud"
description: "Les outils Spring Cloud pour construire des systèmes distribués : service discovery, load balancing, circuit breaker, API gateway, configuration centralisée et tracing."
categorie: "spring"
ordre: 6
---

Spring Cloud regroupe un ensemble d'outils pour construire des systèmes distribués : découverte de services, répartition de charge, tolérance aux pannes, configuration centralisée…

## ☁️ Composants Spring Cloud

| Besoin | Outils |
|---|---|
| Service Discovery | Eureka, Consul, Zookeeper |
| Load Balancing | Ribbon, Spring Cloud LoadBalancer |
| Circuit Breaker | Hystrix, Resilience4j |
| API Gateway | Spring Cloud Gateway, Zuul |
| Configuration | Config Server, Vault |
| Tracing | Sleuth, Zipkin |

## 🔧 Exemple d'architecture microservices

Le serveur de registre (Eureka Server) centralise l'annuaire des services :

```java
// Service Registry (Eureka Server)
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}
```

Sa configuration (`application.yml`) : le serveur ne s'enregistre pas lui-même comme client.

```yaml
# application.yml pour Eureka Server
server:
  port: 8761

eureka:
  instance:
    hostname: localhost
  client:
    register-with-eureka: false
    fetch-registry: false
    service-url:
      defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka/
```

Chaque microservice s'enregistre ensuite comme client Eureka :

```java
// Microservice Client
@SpringBootApplication
@EnableEurekaClient
@EnableFeignClients
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
```

```yaml
# Configuration du client Eureka
spring:
  application:
    name: user-service

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    prefer-ip-address: true
```

Les appels inter-services se font de façon déclarative avec un client Feign :

```java
// Client Feign pour appels inter-services
@FeignClient(name = "order-service")
public interface OrderServiceClient {

    @GetMapping("/api/orders/user/{userId}")
    List<Order> getOrdersByUserId(@PathVariable Long userId);

    @PostMapping("/api/orders")
    Order createOrder(@RequestBody CreateOrderRequest request);
}
```

```java
// Utilisation du client Feign
@Service
public class UserService {

    private final OrderServiceClient orderServiceClient;

    public UserWithOrders getUserWithOrders(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));

        List<Order> orders = orderServiceClient.getOrdersByUserId(userId);

        return new UserWithOrders(user, orders);
    }
}
```

> **Piège d'entretien :** Feign résout le nom logique `order-service` via le registre Eureka — pas via DNS. Si le service n'est pas enregistré (ou que le registre est injoignable), l'appel échoue même si l'instance tourne.
