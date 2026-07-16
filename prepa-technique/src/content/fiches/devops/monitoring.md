---
title: "Monitoring"
description: "Surveillance des applications et de l'infrastructure avec Prometheus, visualisation Grafana et Alert Manager."
categorie: "devops"
ordre: 5
---

Surveillance avec Prometheus et visualisation Grafana : les métriques sont collectées, stockées en base de séries temporelles, visualisées dans des dashboards et évaluées par des règles d'alerte.

## Architecture de monitoring

Collecte, stockage et visualisation des métriques :

```text
    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │   Applications  │    │   Prometheus    │    │    Grafana      │    │  Alert Manager  │
    │   (Metrics)     │    │   (Storage)     │    │  (Dashboard)    │    │   (Alerting)    │
    └─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
              │                      │                      │                      │
              │ /metrics (10s)       │                      │                      │
              ├─────────────────────▶│                      │                      │
              │                      │                      │                      │
              │                      │ Query API            │                      │
              │                      │◄─────────────────────┤                      │
              │                      │                      │                      │
              │                      │ Alerting Rules       │                      │
              │                      ├─────────────────────────────────────────────▶│
              │                      │                      │                      │
              │                      │                      │                      │
              ▼                      ▼                      ▼                      ▼
    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │  Node Exporter  │    │   TSDB Storage  │    │   Dashboards    │    │ Email/SMS/Teams │
    │  (System)       │    │   (Time Series) │    │   (Graphs)      │    │ Notifications   │
    └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 📊 Configuration Prometheus

```yaml
global:
  scrape_interval: 10s
  evaluation_interval: 10s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'scpi-invest-api'
    static_configs:
      - targets: ['scpi-api:8080']
    metrics_path: '/actuator/prometheus'
    scrape_interval: 10s

  - job_name: 'notification-service'
    static_configs:
      - targets: ['notification:8081']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'partner-service'
    static_configs:
      - targets: ['partner:8082']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'batch-service'
    static_configs:
      - targets: ['batch:8083']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'kubernetes-nodes'
    kubernetes_sd_configs:
      - role: node
    relabel_configs:
      - source_labels: [__address__]
        regex: '(.*):10250'
        target_label: __address__
        replacement: '${1}:9100'
```

### 📈 Métriques collectées

- **Métriques application** : latence, throughput, erreurs HTTP
- **Métriques système** : CPU, mémoire, disque, réseau
- **Métriques base de données** : connexions, requêtes, performances
- **Métriques business** : transactions, utilisateurs actifs

## 📊 Dashboards Grafana

### Dashboard application

```json
{
  "dashboard": {
    "title": "SCPI Invest API Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m]) * 100"
          }
        ]
      }
    ]
  }
}
```

### Dashboard infrastructure

```json
{
  "dashboard": {
    "title": "Infrastructure Monitoring",
    "panels": [
      {
        "title": "CPU Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "100 - (avg by (instance) (rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "{{instance}}"
          }
        ]
      },
      {
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100",
            "legendFormat": "{{instance}}"
          }
        ]
      },
      {
        "title": "Disk I/O",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(node_disk_io_time_seconds_total[5m])",
            "legendFormat": "{{device}}"
          }
        ]
      }
    ]
  }
}
```

> **Point clé :** Prometheus fonctionne en mode *pull* — c'est lui qui vient scraper l'endpoint `/metrics` (ou `/actuator/prometheus` pour Spring Boot) de chaque service à intervalle régulier, et non les applications qui poussent leurs métriques.
