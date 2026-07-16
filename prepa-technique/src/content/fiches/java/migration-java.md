---
title: "Migration Java"
description: "Stratégies, outils et bonnes pratiques pour migrer une application entre versions de Java."
categorie: "java"
ordre: 2
---

Stratégies et bonnes pratiques pour migrer entre versions de Java.

## 🎯 Stratégie de migration

Une migration réussie se déroule en trois phases :

1. **Analyse** — audit du code existant : dépendances, APIs dépréciées.
2. **Planification** — roadmap de migration : étapes, timeline, risques.
3. **Exécution** — migration progressive : tests, validation, déploiement.

## 🔧 Outils de migration

### Outils d'analyse

- **jdeps** — analyse des dépendances
- **jdeprscan** — APIs dépréciées
- **Eclipse Migration Toolkit**
- **OpenRewrite** — refactoring automatisé

### Commandes utiles

```bash
# Analyser les dépendances
jdeps --list-deps myapp.jar

# Détecter les APIs dépréciées
jdeprscan --for-removal myapp.jar

# Vérifier la compatibilité modules
jdeps --check-modules myapp.jar
```

## ⚠️ Problèmes courants et solutions

### Modules Java EE supprimés (Java 11+)

`javax.xml.bind`, `javax.activation`, etc. ne font plus partie du JDK.

```xml
<!-- Solution : Ajouter les dépendances explicitement -->
<dependency>
    <groupId>javax.xml.bind</groupId>
    <artifactId>jaxb-api</artifactId>
    <version>2.3.1</version>
</dependency>
<dependency>
    <groupId>org.glassfish.jaxb</groupId>
    <artifactId>jaxb-runtime</artifactId>
    <version>2.3.1</version>
</dependency>
```

### Reflection et modules

L'accès aux classes internes du JDK est restreint par le système de modules.

```bash
# Solution : Utiliser --add-opens
java --add-opens java.base/java.lang=ALL-UNNAMED MyApp
```

Ou dans `module-info.java` :

```java
opens com.mypackage to com.framework;
```

### Changements de GC

G1GC est le garbage collector par défaut depuis Java 9.

```bash
# Revenir à l'ancien GC si nécessaire
java -XX:+UseParallelGC MyApp

# Ou utiliser les nouveaux GC
java -XX:+UseZGC MyApp  # Java 11+
java -XX:+UseShenandoahGC MyApp  # OpenJDK
```

## ✅ Checklist de migration

### Avant la migration

- Audit complet du code
- Tests de régression complets
- Backup de l'environnement
- Plan de rollback

### Après la migration

- Tests de performance
- Monitoring renforcé
- Documentation mise à jour
- Formation des équipes
