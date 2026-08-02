---
preparations: ["fullstack"]
title: "Pipeline CI/CD"
description: "Les étapes essentielles d'un pipeline CI/CD automatisé, du checkout du code au déploiement Kubernetes, avec un exemple GitLab CI complet."
categorie: "devops"
ordre: 1
---

Automatisation du déploiement avec les étapes essentielles : un pipeline CI/CD enchaîne de façon automatisée toutes les étapes qui mènent du code source au déploiement.

## Stages du pipeline

Processus automatisé de la source au déploiement :

```text
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Checkout  │───▶│Tests Unit.  │───▶│Tests Integ. │───▶│Build Docker │───▶│Push Registry│───▶│ Déploiement │
│             │    │             │    │             │    │   Image     │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                  │                  │                  │                  │                  │
      ▼                  ▼                  ▼                  ▼                  ▼                  ▼
  Git Clone         JUnit/Jest         API Tests         Dockerfile        Docker Hub        Kubernetes
  Source Code       Coverage           Postman           Multi-stage       Harbor/ECR        ArgoCD
```

### 1. Checkout

Récupération du code source (Git Clone) :

```yaml
steps:
  - name: Checkout code
    uses: actions/checkout@v4
    with:
      fetch-depth: 0
```

### 2. Tests unitaires

Validation du code isolé, avec un objectif de couverture > 80 % :

```yaml
- name: Run Unit Tests
  run: |
    npm test -- --coverage
    mvn test jacoco:report
```

### 3. Tests d'intégration

Tests des APIs et des services :

```yaml
- name: Integration Tests
  run: |
    docker-compose up -d
    npm run test:integration
    newman run postman_collection.json
```

### 4. Build de l'image Docker

Construction de l'image (Dockerfile multi-stage) :

```yaml
- name: Build Docker Image
  run: |
    docker build -t app:${{ github.sha }} .
    docker tag app:${{ github.sha }} app:latest
```

### 5. Push vers le registry

Publication de l'image (Docker Hub, Harbor, ECR…) :

```yaml
- name: Push to Registry
  run: |
    docker push registry.company.com/app:${{ github.sha }}
    docker push registry.company.com/app:latest
```

### 6. Déploiement

Mise en production sur Kubernetes (kubectl, ArgoCD) :

```yaml
- name: Deploy
  run: |
    kubectl set image deployment/app app=registry.company.com/app:${{ github.sha }}
    kubectl rollout status deployment/app
```

## 🔧 Configuration pipeline GitLab CI

```yaml
stages:
  - checkout
  - test
  - integration
  - build
  - push
  - deploy

variables:
  DOCKER_REGISTRY: "registry.company.com"
  APP_NAME: "scpi-invest-api"

checkout:
  stage: checkout
  script:
    - git clone $CI_REPOSITORY_URL
    - cd $CI_PROJECT_NAME

unit-tests:
  stage: test
  script:
    - npm install
    - npm run test:unit -- --coverage
    - mvn test jacoco:report
  coverage: '/Coverage: \d+\.\d+%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

integration-tests:
  stage: integration
  services:
    - postgres:13
    - redis:6
  script:
    - docker-compose -f docker-compose.test.yml up -d
    - npm run test:integration
    - newman run tests/postman_collection.json

build-image:
  stage: build
  script:
    - docker build -t $APP_NAME:$CI_COMMIT_SHA .
    - docker tag $APP_NAME:$CI_COMMIT_SHA $APP_NAME:latest

push-registry:
  stage: push
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $DOCKER_REGISTRY
    - docker push $DOCKER_REGISTRY/$APP_NAME:$CI_COMMIT_SHA
    - docker push $DOCKER_REGISTRY/$APP_NAME:latest

deploy-staging:
  stage: deploy
  script:
    - kubectl config use-context staging
    - kubectl set image deployment/$APP_NAME $APP_NAME=$DOCKER_REGISTRY/$APP_NAME:$CI_COMMIT_SHA
    - kubectl rollout status deployment/$APP_NAME
  environment:
    name: staging
    url: https://staging.company.com
  only:
    - develop

deploy-production:
  stage: deploy
  script:
    - kubectl config use-context production
    - kubectl set image deployment/$APP_NAME $APP_NAME=$DOCKER_REGISTRY/$APP_NAME:$CI_COMMIT_SHA
    - kubectl rollout status deployment/$APP_NAME
  environment:
    name: production
    url: https://app.company.com
  only:
    - main
  when: manual
```

> **Point clé :** dans cet exemple, le déploiement en staging est automatique sur la branche `develop`, mais la production exige `when: manual` sur `main` — un déclenchement humain qui sert de garde-fou.
