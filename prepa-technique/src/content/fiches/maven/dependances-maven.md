---
preparations: ["fullstack"]
title: "Structure des Dépendances"
description: "Les coordonnées Maven (GAV) et la structure complète d'une dépendance dans le POM : scope, type, classifier, exclusions."
categorie: "maven"
ordre: 2
---

Organisation et gestion des dépendances dans Maven.

## 📋 Coordonnées Maven (GAV)

Chaque artefact Maven est identifié de façon unique par trois coordonnées :

| Coordonnée | Rôle | Exemples |
|------------|------|----------|
| **GroupId** | Identifiant du groupe/organisation | `com.example`, `org.springframework` |
| **ArtifactId** | Nom du projet/module | `spring-boot-starter-web` |
| **Version** | Version du projet | `2.7.0`, `1.0-SNAPSHOT` |

> **Piège d'entretien :** une version se terminant par `-SNAPSHOT` désigne une version en cours de développement : Maven peut la re-télécharger à chaque build, contrairement à une version release qui est immuable.

## 🏗️ Structure d'une Dépendance

Une dépendance peut être minimale (GAV seul) ou détailler scope, type, classifier, caractère optionnel et exclusions :

```xml
<dependencies>
    <!-- Dépendance complète -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <version>3.2.0</version>
        <scope>compile</scope>
        <type>jar</type>
        <classifier>sources</classifier>
        <optional>false</optional>
        <exclusions>
            <exclusion>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-logging</artifactId>
            </exclusion>
        </exclusions>
    </dependency>

    <!-- Dépendance minimale -->
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.13.2</version>
        <scope>test</scope>
    </dependency>

    <!-- Dépendance avec propriété -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-core</artifactId>
        <version>${jackson.version}</version>
    </dependency>
</dependencies>
```
