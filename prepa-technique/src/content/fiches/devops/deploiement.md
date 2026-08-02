---
preparations: ["fullstack"]
title: "Déploiement"
description: "Déploiement GitOps avec ArgoCD sur Kubernetes : workflow, configuration et avantages de l'approche déclarative."
categorie: "devops"
ordre: 3
---

GitOps avec ArgoCD sur Kubernetes : le dépôt Git devient la source de vérité de l'état désiré du cluster, et un contrôleur se charge de faire converger la réalité vers cet état.

## ArgoCD — workflow GitOps

Déploiement automatisé basé sur Git :

```text
    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │   Developer     │    │   Git Repo      │    │    ArgoCD       │    │   Kubernetes    │
    │                 │    │  (Manifests)    │    │   Controller    │    │    Cluster      │
    └─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
              │                      │                      │                      │
              │ 1. Push Config       │                      │                      │
              ├─────────────────────▶│                      │                      │
              │                      │                      │                      │
              │                      │ 2. Poll Changes      │                      │
              │                      │◄─────────────────────┤                      │
              │                      │                      │                      │
              │                      │ 3. Detect Drift      │                      │
              │                      │─────────────────────▶│                      │
              │                      │                      │                      │
              │                      │                      │ 4. Apply Changes     │
              │                      │                      ├─────────────────────▶│
              │                      │                      │                      │
              │                      │                      │ 5. Sync Status       │
              │                      │◄─────────────────────┤                      │
              │                      │                      │                      │
```

### 🔄 Configuration ArgoCD

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: scpi-invest-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/company/k8s-manifests
    targetRevision: HEAD
    path: apps/scpi-invest
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
  revisionHistoryLimit: 10
```

### ⚙️ Manifests Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: scpi-invest-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: scpi-invest-api
  template:
    metadata:
      labels:
        app: scpi-invest-api
    spec:
      containers:
      - name: api
        image: registry.company.com/scpi-invest-api:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## 🎯 Avantages du GitOps

### ✅ Avantages

- **Traçabilité complète** : tout changement est versionné dans Git
- **Rollback facile** : retour à un état précédent via Git
- **Sécurité** : pas d'accès direct au cluster depuis l'extérieur
- **Déclaratif** : état désiré défini dans les manifests
- **Auto-healing** : correction automatique des dérives

### 🔧 Fonctionnalités

- **Sync automatique** : déploiement continu
- **Health checks** : monitoring de l'état des applications
- **Multi-cluster** : gestion de plusieurs environnements
- **RBAC** : contrôle d'accès granulaire
- **Webhooks** : notifications sur les événements

> **Piège d'entretien :** avec GitOps, c'est ArgoCD qui *tire* (pull) les changements depuis Git vers le cluster — le pipeline CI ne pousse plus de `kubectl apply` : il se contente de mettre à jour les manifests dans le dépôt.
