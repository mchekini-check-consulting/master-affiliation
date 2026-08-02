---
preparations: ["fullstack"]
title: "Spring AOP"
description: "La programmation orientée aspect avec Spring : aspects, pointcuts, types d'advice et exemple complet d'aspect de logging."
categorie: "spring"
ordre: 10
---

La programmation orientée aspect (AOP) permet d'isoler les préoccupations transversales (logging, sécurité, transactions…) du code métier.

## 🎯 Concepts AOP

### Terminologie

- **Aspect** — Préoccupation transversale
- **Join Point** — Point d'exécution
- **Pointcut** — Expression de sélection
- **Advice** — Code à exécuter

### Types d'Advice

- **@Before** — Avant l'exécution
- **@After** — Après l'exécution
- **@Around** — Autour de l'exécution
- **@AfterReturning** — Après retour
- **@AfterThrowing** — Après exception

## ⚙️ Configuration Spring AOP

```java
// Configuration avec annotations
@Configuration
@EnableAspectJAutoProxy
public class AopConfig {
}
```

Un aspect de logging complet, avec un pointcut ciblant la couche service :

```java
@Aspect
@Component
public class LoggingAspect {

    private static final Logger logger = LoggerFactory.getLogger(LoggingAspect.class);

    // Pointcut pour tous les services
    @Pointcut("execution(* com.example.service.*.*(..))")
    public void serviceLayer() {}

    // Advice Before
    @Before("serviceLayer()")
    public void logBefore(JoinPoint joinPoint) {
        logger.info("Calling method: {}", joinPoint.getSignature().getName());
    }

    // Advice After
    @After("serviceLayer()")
    public void logAfter(JoinPoint joinPoint) {
        logger.info("Method completed: {}", joinPoint.getSignature().getName());
    }

    // Advice Around
    @Around("serviceLayer()")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();

        logger.info("Method {} started", joinPoint.getSignature().getName());

        try {
            Object result = joinPoint.proceed();
            long endTime = System.currentTimeMillis();
            logger.info("Method {} completed in {} ms",
                       joinPoint.getSignature().getName(),
                       endTime - startTime);
            return result;
        } catch (Exception e) {
            logger.error("Method {} failed: {}",
                        joinPoint.getSignature().getName(),
                        e.getMessage());
            throw e;
        }
    }
}
```

> **Piège d'entretien :** dans un advice `@Around`, si vous oubliez d'appeler `joinPoint.proceed()`, la méthode cible n'est JAMAIS exécutée — l'aspect court-circuite silencieusement l'appel. C'est aussi ce mécanisme de proxy qui explique pourquoi `@Transactional` ne fonctionne pas sur un appel interne (`this.methode()`).
