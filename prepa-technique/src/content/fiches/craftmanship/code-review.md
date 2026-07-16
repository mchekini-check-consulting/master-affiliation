---
title: "Code Review"
description: "Que regarder lors d'une Pull Request : checklist de revue et exemples de feedback constructif."
categorie: "craftmanship"
ordre: 3
---

Que regarder lors d'une Pull Request ?

## Checklist Code Review

- ✅ Le code respecte-t-il les conventions de nommage ?
- ✅ Les fonctions sont-elles courtes et font-elles une seule chose ?
- ✅ Y a-t-il des tests unitaires pour le nouveau code ?
- ✅ Le code est-il documenté si nécessaire ?
- ✅ Pas de code mort ou commenté ?
- ✅ Gestion d'erreurs appropriée ?
- ✅ Performance : pas de boucles inutiles ?
- ✅ Sécurité : validation des entrées utilisateur ?
- ✅ Le code suit-il les principes SOLID ?
- ✅ Pas de duplication de code (DRY) ?

## Exemple de Feedback Constructif

Un bon commentaire de review suggère, questionne ou valorise — il n'ordonne pas et ne juge pas la personne :

- 💡 **Suggestion :** « Cette fonction fait plusieurs choses. Pourrait-on la diviser en fonctions plus petites pour améliorer la lisibilité ? »
- 🔍 **Question :** « Avez-vous considéré le cas où l'utilisateur n'a pas de permissions ? Un test unitaire pour ce cas serait utile. »
- 👍 **Positif :** « Excellente utilisation du pattern Strategy ici ! Cela rend le code très extensible. »

> **Piège d'entretien :** une code review ne sert pas qu'à trouver des bugs — c'est aussi un outil de partage de connaissances et d'homogénéisation des pratiques dans l'équipe.
