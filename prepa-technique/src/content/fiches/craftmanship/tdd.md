---
title: "Test Driven Development (TDD)"
description: "Développement piloté par les tests : le cycle Red, Green, Refactor illustré avec une calculatrice JavaScript et Jest."
categorie: "craftmanship"
ordre: 6
---

Développement piloté par les tests : Red, Green, Refactor.

## Le Cycle TDD

1. **Rouge** : écrire un test qui échoue. Cela force à réfléchir aux exigences avant d'écrire le code.
2. **Vert** : écrire le minimum de code pour que le test passe. L'objectif est de valider rapidement que le test est correct.
3. **Refactor** : améliorer le code sans changer son comportement. Cela inclut la suppression de la duplication, l'amélioration de la lisibilité, etc.

## 💡 Exemple Concret : Calculatrice

Une calculatrice en JavaScript, testée avec Jest.

### Étape 1 : Rouge

Écrire le test en premier :

```js
test('should add two numbers', () => {
  const calculator = new Calculator();
  const result = calculator.add(2, 3);
  expect(result).toBe(5);
});
```

❌ Test échoue : `Calculator` n'existe pas.

### Étape 2 : Vert

Écrire le minimum de code :

```js
class Calculator {
  add(a, b) {
    return a + b;
  }
}
```

✅ Test passe !

### Étape 3 : Refactor

Améliorer si nécessaire :

```js
class Calculator {
  add(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('Arguments must be numbers');
    }
    return a + b;
  }
}
```

🔄 Code amélioré, tests toujours verts.

> **Piège d'entretien :** ne sautez jamais la phase rouge — voir le test échouer d'abord prouve qu'il teste vraiment quelque chose. Un test qui n'a jamais été rouge peut passer pour de mauvaises raisons.
