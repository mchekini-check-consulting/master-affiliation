---
preparations: ["fullstack"]
title: "Plugins Maven"
description: "Le fonctionnement des plugins Maven (goals, phases), les plugins core essentiels et leur configuration dans le POM."
categorie: "maven"
ordre: 3
---

Extensibilité et automatisation avec les plugins Maven.

## 🔌 Qu'est-ce qu'un Plugin Maven ?

**Définition :**

- Extensions qui ajoutent des fonctionnalités à Maven
- Exécutent des tâches spécifiques (**goals**)
- Liés aux phases du cycle de vie
- Configurables via le POM

**Types de plugins :**

- **Build plugins** — exécutés pendant le build
- **Reporting plugins** — génèrent des rapports
- **Core plugins** — fournis par Maven
- **Third-party plugins** — développés par la communauté

> **Point clé :** en réalité, tout le travail de Maven est fait par des plugins — chaque phase du cycle de vie ne fait qu'exécuter les goals des plugins qui y sont liés.

## 🏗️ Plugins Core Maven

| Plugin | Rôle | Goals principaux |
|--------|------|------------------|
| `maven-compiler-plugin` | Compilation du code Java | compile, testCompile |
| `maven-surefire-plugin` | Exécution des tests unitaires | test |
| `maven-jar-plugin` | Création des archives JAR | jar |
| `maven-install-plugin` | Installation dans le repo local | install |
| `maven-deploy-plugin` | Déploiement vers le repo distant | deploy |
| `maven-clean-plugin` | Nettoyage du projet | clean |

### Configuration des plugins core

```xml
<!-- Configuration des plugins core -->
<build>
    <plugins>
        <!-- Compiler Plugin -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.11.0</version>
            <configuration>
                <source>17</source>
                <target>17</target>
                <encoding>UTF-8</encoding>
            </configuration>
        </plugin>

        <!-- Surefire Plugin (Tests) -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
            <version>3.1.2</version>
            <configuration>
                <includes>
                    <include>**/*Test.java</include>
                    <include>**/*Tests.java</include>
                </includes>
            </configuration>
        </plugin>

        <!-- JAR Plugin -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-jar-plugin</artifactId>
            <version>3.3.0</version>
            <configuration>
                <archive>
                    <manifest>
                        <mainClass>com.example.Main</mainClass>
                    </manifest>
                </archive>
            </configuration>
        </plugin>
    </plugins>
</build>
```
