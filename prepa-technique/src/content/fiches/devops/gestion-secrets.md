---
preparations: ["fullstack"]
title: "Gestion des Secrets"
description: "Centralisation et sécurisation des secrets avec HashiCorp Vault : politiques, authentification et intégration Kubernetes."
categorie: "devops"
ordre: 4
---

Centralisation et sécurisation des secrets avec HashiCorp Vault : mots de passe, clés d'API et certificats sont stockés dans un coffre central plutôt que dispersés dans le code ou les variables d'environnement.

## Architecture Vault

Stockage sécurisé et distribution des secrets :

```text
                                    ┌─────────────────┐
                                    │   HashiCorp     │
                                    │     Vault       │
                                    │   (Secrets)     │
                                    └─────────┬───────┘
                                              │
                                              │ API Calls
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
                    ▼                         ▼                         ▼
            ┌───────────────┐         ┌───────────────┐         ┌───────────────┐
            │  Kubernetes   │         │   CI/CD       │         │  Applications │
            │   Secrets     │         │   Pipeline    │         │   (Runtime)   │
            └───────┬───────┘         └───────┬───────┘         └───────┬───────┘
                    │                         │                         │
                    ▼                         ▼                         ▼
            ┌───────────────┐         ┌───────────────┐         ┌───────────────┐
            │   Pod Env     │         │  Build Vars   │         │  Config Maps  │
            │  Variables    │         │               │         │               │
            └───────────────┘         └───────────────┘         └───────────────┘
```

### 🔐 Configuration Vault

```bash
# Activation du moteur KV
vault secrets enable -path=secret kv-v2

# Création d'une politique
vault policy write app-policy - <<EOF
path "secret/data/scpi-invest/*" {
  capabilities = ["read"]
}
path "secret/data/database/*" {
  capabilities = ["read"]
}
EOF

# Stockage des secrets
vault kv put secret/database \
  username="scpi_user" \
  password="super_secure_password" \
  host="postgres.company.com" \
  port="5432"

vault kv put secret/scpi-invest \
  api_key="sk-1234567890abcdef" \
  jwt_secret="my-jwt-secret-key" \
  kafka_brokers="kafka1:9092,kafka2:9092"
```

### 🔑 Authentification

- **Kubernetes Auth** : authentification via Service Account
- **AppRole** : pour les applications et la CI/CD
- **LDAP/OIDC** : pour les utilisateurs humains

## 🚀 Intégration Kubernetes

### Vault Agent Injector

Un sidecar injecté dans le pod récupère les secrets et les écrit dans un fichier consommé au démarrage :

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: scpi-invest-api
spec:
  template:
    metadata:
      annotations:
        vault.hashicorp.com/agent-inject: "true"
        vault.hashicorp.com/role: "scpi-invest"
        vault.hashicorp.com/agent-inject-secret-db: "secret/data/database"
        vault.hashicorp.com/agent-inject-template-db: |
          {{- with secret "secret/data/database" -}}
          export DATABASE_URL="postgresql://{{ .Data.data.username }}:{{ .Data.data.password }}@{{ .Data.data.host }}:{{ .Data.data.port }}/scpi"
          {{- end }}
    spec:
      containers:
      - name: api
        image: scpi-invest-api:latest
        command: ["/bin/sh"]
        args: ["-c", "source /vault/secrets/db && ./start-app"]
```

### External Secrets Operator

L'opérateur synchronise les secrets Vault vers des Secrets Kubernetes natifs :

```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: vault-backend
spec:
  provider:
    vault:
      server: "https://vault.company.com"
      path: "secret"
      version: "v2"
      auth:
        kubernetes:
          mountPath: "kubernetes"
          role: "scpi-invest"
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: database-secret
spec:
  refreshInterval: 15s
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: db-credentials
    creationPolicy: Owner
  data:
  - secretKey: username
    remoteRef:
      key: database
      property: username
  - secretKey: password
    remoteRef:
      key: database
      property: password
```
