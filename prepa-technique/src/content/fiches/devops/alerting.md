---
title: "Alerting"
description: "Concevoir de bonnes alertes : symptômes plutôt que causes, golden signals, sévérités, seuils avec durée et lutte contre la fatigue d'alerte."
categorie: "devops"
ordre: 6
---

Le monitoring collecte et visualise les métriques ; l'alerting décide quand un humain doit être prévenu. Un dashboard Grafana se consulte, une alerte interrompt quelqu'un — parfois en pleine nuit. Toute la discipline de l'alerting consiste donc à ne réveiller les équipes que quand c'est nécessaire, avec les informations pour agir.

## Monitoring vs alerting

| | Monitoring | Alerting |
|---|---|---|
| **Objectif** | Observer et comprendre le système | Notifier quand une intervention est requise |
| **Mode** | Passif : on consulte quand on en a besoin | Actif : le système interpelle un humain |
| **Support** | Dashboards, métriques, graphiques | Notifications (page, email, Slack/Teams, ticket) |
| **Question posée** | « Comment se comporte le système ? » | « Faut-il que quelqu'un intervienne maintenant ? » |

Dans la stack Prometheus, la frontière est nette : Prometheus évalue les **règles d'alerte** (fichiers `rule_files`) sur les métriques qu'il stocke, puis transmet les alertes déclenchées à **Alertmanager**, qui se charge du regroupement, des silences et du routage vers les bons canaux.

## Alerter sur les symptômes, pas sur les causes

Une alerte doit se déclencher sur ce que **l'utilisateur subit** (symptôme), pas sur ce qui pourrait un jour poser problème (cause possible).

- **Symptômes** : taux d'erreurs 5xx élevé, latence p95 au-dessus du SLO, page inaccessible.
- **Causes** : CPU à 90 %, un pod redémarré, un disque à 70 %.

Un CPU à 90 % n'est pas un incident si la latence et le taux d'erreur restent bons — c'est peut-être juste une machine bien utilisée. À l'inverse, si les utilisateurs reçoivent des erreurs, peu importe que la cause soit le CPU, la base ou le réseau : il faut intervenir. Les métriques de causes restent précieuses, mais leur place est dans les dashboards de diagnostic, pas dans les pages de nuit.

> **Piège d'entretien :** « faut-il alerter quand le CPU dépasse 80 % ? » La bonne réponse est généralement non : on alerte sur la dégradation visible par l'utilisateur (erreurs, latence), et on garde le CPU comme piste d'investigation.

## Les golden signals

Les quatre signaux d'or (popularisés par le SRE book de Google) sont les symptômes à surveiller en priorité pour tout service :

- **Latence** : le temps de réponse des requêtes (en distinguant requêtes réussies et échouées, et en suivant les percentiles p95/p99 plutôt que la moyenne).
- **Trafic** : la demande sur le système (requêtes/s, messages consommés…).
- **Erreurs** : le taux de requêtes qui échouent (5xx, timeouts, mauvaises réponses).
- **Saturation** : à quel point la ressource la plus contrainte est proche de sa limite (mémoire, connexions, file d'attente).

Un service couvert par des alertes sur ces quatre signaux détecte la grande majorité des incidents visibles par les utilisateurs.

## Seuils et durées

Une alerte se définit par une **condition**, un **seuil** et une **durée de persistance** :

- Le seuil sépare le normal de l'anormal : il se choisit à partir des données historiques et des objectifs de service (SLO), pas au doigt mouillé.
- La durée (clause `for` dans Prometheus) exige que la condition reste vraie pendant un certain temps avant de déclencher. Elle filtre les pics transitoires : un p95 qui dépasse le seuil pendant 30 secondes lors d'un déploiement n'a pas à réveiller qui que ce soit.

Le compromis est classique : une durée trop courte génère des faux positifs, une durée trop longue retarde la détection des vrais incidents. Pour un symptôme critique, quelques minutes (2 à 5) sont un bon point de départ.

## Sévérités : page vs ticket

Toutes les alertes ne se valent pas. On distingue au minimum deux niveaux :

- **Page (critique)** : un humain doit intervenir **immédiatement**, y compris la nuit — l'astreinte est notifiée (PagerDuty, Opsgenie, SMS). Réservé aux symptômes qui dégradent le service maintenant ou de façon imminente.
- **Ticket / warning** : le problème doit être traité, mais peut attendre les heures ouvrées — création d'un ticket ou message dans un canal d'équipe. Exemple : un disque qui sera plein dans quatre jours au rythme actuel.

La règle : si personne ne doit se lever à 3 h du matin pour cette alerte, elle ne doit pas pager. C'est Alertmanager qui applique ce routage, en fonction d'un label `severity` posé sur la règle.

## Fatigue d'alerte et bonnes pratiques

La **fatigue d'alerte** survient quand l'équipe reçoit trop d'alertes non pertinentes : elle finit par les ignorer ou les acquitter machinalement — et rate le jour où l'alerte est réelle. C'est le syndrome du garçon qui criait au loup, et c'est le principal mode d'échec d'un système d'alerting.

Bonnes pratiques pour l'éviter :

- **Chaque alerte doit être actionnable** : si la réponse habituelle est « on ne fait rien, ça repasse tout seul », l'alerte doit être supprimée ou rétrogradée.
- **Un runbook par alerte** : l'annotation de l'alerte pointe vers une procédure (que vérifier, quelles commandes, qui escalader). L'astreinte à 3 h du matin ne doit pas partir de zéro.
- **Regrouper et dédupliquer** : Alertmanager regroupe les alertes liées (`group_by`) pour éviter 200 notifications quand un nœud tombe, et les **inhibitions** masquent les alertes secondaires quand une alerte plus globale est déjà active.
- **Utiliser les silences** pendant les maintenances planifiées.
- **Réviser régulièrement** : une alerte qui n'a jamais déclenché d'action en six mois est candidate à la suppression.

## Exemple : règle Prometheus + routage Alertmanager

```yaml
# alert_rules.yml — règle évaluée par Prometheus
groups:
  - name: scpi-invest-api
    rules:
      - alert: HighErrorRate
        expr: |
          rate(http_requests_total{status=~"5.."}[5m])
            / rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Taux d'erreurs 5xx > 5% sur {{ $labels.job }}"
          runbook_url: "https://wiki.company.com/runbooks/high-error-rate"

# alertmanager.yml — routage selon la sévérité
route:
  group_by: ['alertname', 'job']
  receiver: team-tickets
  routes:
    - match:
        severity: critical
      receiver: oncall-pager
receivers:
  - name: oncall-pager
    pagerduty_configs:
      - service_key: <clé PagerDuty>
  - name: team-tickets
    slack_configs:
      - channel: '#alerts'
```

L'alerte ne se déclenche que si le taux d'erreur dépasse 5 % **pendant 5 minutes** (`for: 5m`) ; le label `severity: critical` la route vers l'astreinte, tandis que les autres alertes finissent dans le canal Slack de l'équipe ; l'annotation `runbook_url` donne à l'astreinte la procédure à suivre.
