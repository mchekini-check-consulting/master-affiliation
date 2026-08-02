---
preparations: ["fullstack"]
title: "Spring Testing"
description: "Le framework de test intégré de Spring : tests unitaires avec Mockito, tests d'intégration avec @SpringBootTest et slice tests avec @WebMvcTest et @DataJpaTest."
categorie: "spring"
ordre: 7
---

Spring embarque un framework de test complet qui permet de tester chaque couche de l'application, du composant isolé au contexte complet.

## 🧪 Types de tests

| Type | Principe | Annotations clés |
|---|---|---|
| Unit Tests | Tests isolés des composants | `@Mock`, `@MockBean` |
| Integration Tests | Tests avec contexte Spring | `@SpringBootTest` |
| Slice Tests | Tests de couches spécifiques | `@WebMvcTest`, `@DataJpaTest` |

## 🔬 Exemples de tests

### Test unitaire avec Mockito

Pas de contexte Spring : les dépendances sont mockées et injectées dans le composant testé.

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private UserService userService;

    @Test
    void shouldCreateUser() {
        // Given
        User user = new User("john@example.com", "John Doe");
        when(userRepository.existsByEmail(user.getEmail())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(user);

        // When
        User result = userService.createUser(user);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("john@example.com");
        verify(emailService).sendWelcomeEmail(user.getEmail());
    }
}
```

### Test d'intégration complet

Le contexte Spring complet est démarré sur un port aléatoire ; on teste l'application de bout en bout via de vraies requêtes HTTP.

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(locations = "classpath:application-test.properties")
class UserControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void shouldCreateAndRetrieveUser() {
        // Given
        CreateUserRequest request = new CreateUserRequest("jane@example.com", "Jane Doe");

        // When - Create user
        ResponseEntity<User> createResponse = restTemplate.postForEntity(
            "/api/users", request, User.class);

        // Then
        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        User createdUser = createResponse.getBody();
        assertThat(createdUser.getId()).isNotNull();

        // When - Retrieve user
        ResponseEntity<User> getResponse = restTemplate.getForEntity(
            "/api/users/" + createdUser.getId(), User.class);

        // Then
        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(getResponse.getBody().getEmail()).isEqualTo("jane@example.com");
    }
}
```

### Test de la couche web uniquement

`@WebMvcTest` ne charge que la couche MVC : les services doivent être mockés avec `@MockBean`, et les requêtes sont simulées avec `MockMvc`.

```java
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Test
    void shouldReturnUser() throws Exception {
        // Given
        User user = new User(1L, "john@example.com", "John Doe");
        when(userService.findById(1L)).thenReturn(user);

        // When & Then
        mockMvc.perform(get("/api/users/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.email").value("john@example.com"))
            .andExpect(jsonPath("$.name").value("John Doe"));
    }

    @Test
    void shouldCreateUser() throws Exception {
        // Given
        User user = new User(1L, "john@example.com", "John Doe");
        when(userService.createUser(any(User.class))).thenReturn(user);

        // When & Then
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "email": "john@example.com",
                        "name": "John Doe"
                    }
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.email").value("john@example.com"));
    }
}
```

### Test de la couche de données

`@DataJpaTest` ne charge que la couche JPA (repositories, entités) avec une base embarquée.

```java
@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldFindByEmail() {
        // Given
        User user = new User("john@example.com", "John Doe");
        entityManager.persistAndFlush(user);

        // When
        Optional<User> found = userRepository.findByEmail("john@example.com");

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("John Doe");
    }

    @Test
    void shouldReturnEmptyWhenEmailNotFound() {
        // When
        Optional<User> found = userRepository.findByEmail("nonexistent@example.com");

        // Then
        assertThat(found).isEmpty();
    }
}
```

> **Piège d'entretien :** `@Mock` (Mockito pur) crée un mock hors contexte Spring, tandis que `@MockBean` remplace un bean DANS le contexte Spring. Utiliser `@MockBean` dans un test unitaire sans contexte ne sert à rien — et charger un contexte juste pour mocker ralentit inutilement les tests.
