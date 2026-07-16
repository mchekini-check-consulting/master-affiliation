---
title: "Spring Data"
description: "Simplification de l'accès aux données : modules Spring Data, entités JPA et repositories avec requêtes dérivées."
categorie: "spring"
ordre: 4
---

Spring Data simplifie l'accès aux données : les repositories génèrent automatiquement les requêtes courantes, quel que soit le type de base sous-jacente.

## 🗄️ Modules Spring Data

**Spring Data JPA** — Bases de données relationnelles.

**Spring Data MongoDB** — Base de données NoSQL MongoDB.

**Spring Data Redis** — Cache et stockage clé-valeur.

**Spring Data Elasticsearch** — Moteur de recherche.

## 📚 JPA Repository

L'exemple ci-dessous montre la chaîne complète : une entité JPA, son repository avec méthodes héritées et requêtes dérivées, et son utilisation dans un service transactionnel.

```java
// Entité JPA
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    private UserStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Constructeurs, getters, setters
}

// Repository interface
public interface UserRepository extends JpaRepository<User, Long> {

    // Méthodes héritées automatiquement :
    // save(User user)
    // findById(Long id)
    // findAll()
    // deleteById(Long id)
    // count()
    // existsById(Long id)

    // Requêtes dérivées du nom de méthode
    Optional<User> findByEmail(String email);
    List<User> findByNameContainingIgnoreCase(String name);
    List<User> findByStatus(UserStatus status);
    List<User> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    // Requêtes avec tri et pagination
    Page<User> findByStatus(UserStatus status, Pageable pageable);
    List<User> findTop10ByOrderByCreatedAtDesc();

    // Vérification d'existence
    boolean existsByEmail(String email);

    // Comptage
    long countByStatus(UserStatus status);

    // Suppression
    void deleteByStatus(UserStatus status);
}

// Utilisation dans un service
@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        return userRepository.save(user);
    }

    public Page<User> getActiveUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return userRepository.findByStatus(UserStatus.ACTIVE, pageable);
    }
}
```

> **Piège d'entretien :** les requêtes dérivées sont générées à partir du NOM de la méthode (`findByEmail`, `findByNameContainingIgnoreCase`…) : on n'écrit aucune implémentation, Spring Data la fournit au démarrage. Une faute dans le nom (propriété inexistante) fait échouer le démarrage de l'application, pas l'exécution de la requête.
