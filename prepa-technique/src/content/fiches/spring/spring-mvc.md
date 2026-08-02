---
preparations: ["fullstack"]
title: "Spring MVC"
description: "Framework web basé sur le pattern Model-View-Controller : architecture, @Controller et @RestController."
categorie: "spring"
ordre: 3
---

Spring MVC est le framework web de Spring, basé sur le pattern Model-View-Controller.

## 🏗️ Architecture MVC

**Model** — Données et logique métier : Entities, DTOs, Services.

**View** — Interface utilisateur : Templates, JSON, XML.

**Controller** — Gestion des requêtes : `@Controller`, `@RestController`.

## 🎮 Types de Controllers

Deux styles de contrôleurs coexistent : le contrôleur traditionnel qui retourne le nom d'une vue à rendre, et le REST controller qui sérialise directement les données (JSON/XML) dans la réponse.

```java
// Controller traditionnel (retourne des vues)
@Controller
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public String listUsers(Model model) {
        model.addAttribute("users", userService.findAll());
        return "users/list"; // Nom de la vue
    }

    @GetMapping("/{id}")
    public String showUser(@PathVariable Long id, Model model) {
        model.addAttribute("user", userService.findById(id));
        return "users/detail";
    }
}

// REST Controller (retourne des données JSON/XML)
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserRestController {

    private final UserService userService;

    public UserRestController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return userService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<User> createUser(@Valid @RequestBody User user) {
        User savedUser = userService.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }
}
```

> **Piège d'entretien :** `@RestController` = `@Controller` + `@ResponseBody`. La valeur de retour d'un `@RestController` est écrite directement dans le corps de la réponse HTTP (JSON par défaut), alors qu'un `@Controller` retourne le nom d'une vue à résoudre.
