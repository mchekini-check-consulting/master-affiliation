---
preparations: ["fullstack"]
title: "Spring Boot Actuator"
description: "Monitoring et gestion des applications Spring Boot : endpoints health, metrics, info, et intégration avec Prometheus, Grafana et la stack ELK."
categorie: "spring"
ordre: 9
---

Spring Boot Actuator apporte le monitoring et la gestion des applications Spring Boot en production, via des endpoints HTTP ou JMX prêts à l'emploi.

## 📊 Qu'est-ce que Spring Boot Actuator ?

### Fonctionnalités principales

- Monitoring de l'état de l'application
- Métriques de performance en temps réel
- Endpoints de gestion HTTP/JMX
- Informations sur l'environnement
- Audit et traçabilité

### Cas d'usage

- Surveillance en production
- Debugging et diagnostic
- Intégration avec des outils de monitoring
- Alerting automatique
- Analyse des performances

## 🔗 Endpoints principaux

| Endpoint | Rôle |
|---|---|
| `/actuator/health` | État de santé de l'application et de ses dépendances |
| `/actuator/metrics` | Métriques de performance (CPU, mémoire, requêtes) |
| `/actuator/info` | Informations sur l'application (version, build) |
| `/actuator/env` | Variables d'environnement et propriétés |
| `/actuator/beans` | Liste de tous les beans Spring |
| `/actuator/loggers` | Configuration des loggers (lecture/écriture) |

## 📋 Endpoints avancés

| Endpoint | Rôle |
|---|---|
| `/actuator/httptrace` | Traces des requêtes HTTP |
| `/actuator/threaddump` | Dump des threads JVM |
| `/actuator/heapdump` | Dump de la heap JVM |
| `/actuator/configprops` | Propriétés de configuration |
| `/actuator/mappings` | Mappings des endpoints |
| `/actuator/shutdown` | Arrêt gracieux (POST) |

## 🚀 Intégration avec des outils de monitoring

### Prometheus + Grafana

La dépendance Micrometer expose les métriques au format Prometheus :

```xml
<!-- Dépendance Maven -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

```yaml
# Configuration
management:
  endpoints:
    web:
      exposure:
        include: prometheus
  metrics:
    export:
      prometheus:
        enabled: true
```

### ELK Stack

Un encoder Logstash formate les logs en JSON pour l'ingestion par la stack ELK :

```xml
<!-- Logback configuration -->
<appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <encoder class="net.logstash.logback.encoder.LoggingEventCompositeJsonEncoder">
        <providers>
            <timestamp/>
            <logLevel/>
            <loggerName/>
            <message/>
            <mdc/>
        </providers>
    </encoder>
</appender>
```

> **Piège d'entretien :** exposer tous les endpoints Actuator en production est un risque de sécurité : `/actuator/env` peut révéler des secrets et `/actuator/shutdown` permet d'arrêter l'application. On n'expose que le strict nécessaire (`management.endpoints.web.exposure.include`) et on protège le reste.
