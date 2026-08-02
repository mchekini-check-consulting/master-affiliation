---
preparations: ["fullstack"]
title: "Architecture DevOps"
description: "Architecture microservices avec API Gateway, IDP, communication REST/Kafka et services distribués."
categorie: "devops"
ordre: 2
---

Architecture microservices avec API Gateway et services distribués : chaque service a une responsabilité précise, et les échanges passent par des canaux synchrones (REST) ou asynchrones (Kafka).

## Vue d'ensemble de l'architecture

```text
                                    ┌─────────────────┐
                                    │   Frontend      │
                                    │   (React/Vue)   │
                                    └─────────┬───────┘
                                              │ HTTPS
                                              ▼
                                    ┌─────────────────┐
                                    │  API Gateway    │◄──────┐
                                    │  (Kong/Zuul)    │       │
                                    └─────────┬───────┘       │
                                              │               │
                                              ▼               │
                                    ┌─────────────────┐       │
                                    │      IDP        │       │ Auth
                                    │  (Keycloak/     │───────┘
                                    │   Auth0)        │
                                    └─────────────────┘
                                              │
                                              ▼
        ┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
        │                 │                 │                 │                 │
        ▼                 ▼                 ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ Notification  │ │ SCPI Invest   │ │ Partner       │ │ Batch         │ │ Other         │
│ Service       │ │ PLUS API      │ │ Service       │ │ Service       │ │ Services      │
└───────┬───────┘ └───────┬───────┘ └───────┬───────┘ └───────┬───────┘ └───────────────┘
        │                 │                 │                 │
        │                 │◄────────────────┤                 │
        │                 │     Kafka       │                 │
        │                 │                 │                 ▼
        │                 │                 │         ┌───────────────┐
        │                 │                 │         │   S3 Bucket   │
        │                 │                 │         │   (Files)     │
        │                 │                 │         └───────┬───────┘
        │                 │                 │                 │
        │                 │                 │                 ▼
        │                 │                 │         ┌───────────────┐
        │                 │                 │         │  PostgreSQL   │
        │                 │                 │         │   Database    │
        │                 │                 │         └───────────────┘
        │                 │                 │                 │
        │                 │                 │                 ▼
        │                 │                 │         ┌───────────────┐
        │                 │                 │         │   MongoDB     │
        │                 │                 │         │   Database    │
        │                 │                 │         └───────────────┘
        │                 │                 │                 │
        │                 │                 │                 ▼
        │                 │                 │         ┌───────────────┐
        │                 │                 │         │ Elasticsearch │
        │                 │                 │         │    Search     │
        │                 │                 │         └───────────────┘
        │                 │                 │
        └─────────────────┴─────────────────┴─────────────────────────────────────────────┐
                                                                                            │
                                                    ┌───────────────────────────────────────┘
                                                    │
                                                    ▼
                                            ┌───────────────┐
                                            │  Monitoring   │
                                            │ (Prometheus/  │
                                            │  Grafana)     │
                                            └───────────────┘
```

### 🌐 Frontend & API Gateway

- **Frontend** : application React/Vue qui transmet les requêtes en HTTPS.
- **API Gateway** : point d'entrée unique (Kong/Zuul) qui centralise l'authentification.
- **IDP (Identity Provider)** : Keycloak/Auth0 pour la gestion des identités et des tokens.

### 🔧 Microservices

- **Notification Service** : gestion des notifications push, email, SMS.
- **SCPI Invest PLUS API** : API métier principale, communique avec le Partner Service via Kafka.
- **Partner Service** : gestion des partenaires et des intégrations externes.
- **Batch Service** : traitement de fichiers S3 vers PostgreSQL, MongoDB et Elasticsearch.

## 📊 Communication entre services

### Communication synchrone

```text
// API Gateway vers microservices
Frontend → API Gateway → IDP (Auth)
API Gateway → Notification Service (REST)
API Gateway → SCPI Invest API (REST)
API Gateway → Partner Service (REST)
```

### Communication asynchrone

```text
// Kafka pour les événements
SCPI Invest API → Kafka → Partner Service

// Batch Service : ingestion de fichiers
Batch Service → S3 → PostgreSQL
Batch Service → S3 → MongoDB
Batch Service → S3 → Elasticsearch
```
