---
title: "Spring Batch"
description: "Le framework de traitement par lots de Spring : architecture Job/Step/Chunk et exemple complet reader-processor-writer avec listener."
categorie: "spring"
ordre: 8
---

Spring Batch est le framework de Spring pour le traitement par lots : import de fichiers, migrations de données, traitements de masse planifiés.

## ⚙️ Architecture Spring Batch

| Concept | Rôle | Détail |
|---|---|---|
| Job | Unité de traitement complète | Contient un ou plusieurs Steps |
| Step | Étape de traitement | Reader, Processor, Writer |
| Chunk | Traitement par blocs | Optimisation des performances |

## 📝 Exemple de Job batch

### Configuration du Job

Le job enchaîne les steps ; chaque step lit, transforme et écrit les données par blocs (chunks).

```java
@Configuration
@EnableBatchProcessing
public class BatchConfig {

    @Autowired
    private JobBuilderFactory jobBuilderFactory;

    @Autowired
    private StepBuilderFactory stepBuilderFactory;

    @Bean
    public Job importUserJob() {
        return jobBuilderFactory.get("importUserJob")
            .incrementer(new RunIdIncrementer())
            .listener(jobExecutionListener())
            .start(step1())
            .next(step2())
            .build();
    }

    @Bean
    public Step step1() {
        return stepBuilderFactory.get("step1")
            .<UserCsv, User>chunk(10)
            .reader(reader())
            .processor(processor())
            .writer(writer())
            .build();
    }

    @Bean
    public FlatFileItemReader<UserCsv> reader() {
        return new FlatFileItemReaderBuilder<UserCsv>()
            .name("userItemReader")
            .resource(new ClassPathResource("users.csv"))
            .delimited()
            .names(new String[]{"firstName", "lastName", "email"})
            .fieldSetMapper(new BeanWrapperFieldSetMapper<UserCsv>() {{
                setTargetType(UserCsv.class);
            }})
            .build();
    }

    @Bean
    public UserItemProcessor processor() {
        return new UserItemProcessor();
    }

    @Bean
    public JdbcBatchItemWriter<User> writer() {
        return new JdbcBatchItemWriterBuilder<User>()
            .itemSqlParameterSourceProvider(new BeanPropertyItemSqlParameterSourceProvider<>())
            .sql("INSERT INTO users (first_name, last_name, email) VALUES (:firstName, :lastName, :email)")
            .dataSource(dataSource)
            .build();
    }
}
```

### Processor personnalisé

Le processor transforme chaque élément lu avant l'écriture.

```java
@Component
public class UserItemProcessor implements ItemProcessor<UserCsv, User> {

    private static final Logger log = LoggerFactory.getLogger(UserItemProcessor.class);

    @Override
    public User process(final UserCsv userCsv) throws Exception {
        final String firstName = userCsv.getFirstName().toUpperCase();
        final String lastName = userCsv.getLastName().toUpperCase();
        final String email = userCsv.getEmail().toLowerCase();

        final User transformedUser = new User(firstName, lastName, email);

        log.info("Converting (" + userCsv + ") into (" + transformedUser + ")");

        return transformedUser;
    }
}
```

### Listener pour surveiller l'exécution

Le listener est notifié aux étapes clés du cycle de vie du job (ici, à la fin).

```java
@Component
public class JobCompletionNotificationListener extends JobExecutionListenerSupport {

    private static final Logger log = LoggerFactory.getLogger(JobCompletionNotificationListener.class);

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void afterJob(JobExecution jobExecution) {
        if(jobExecution.getStatus() == BatchStatus.COMPLETED) {
            log.info("!!! JOB FINISHED! Time to verify the results");

            jdbcTemplate.query("SELECT first_name, last_name, email FROM users",
                (rs, row) -> new User(
                    rs.getString(1),
                    rs.getString(2),
                    rs.getString(3))
            ).forEach(user -> log.info("Found <" + user + "> in the database."));
        }
    }
}
```

> **Point clé :** avec `chunk(10)`, les éléments sont lus et transformés un par un, mais écrits par paquets de 10 dans une même transaction. C'est le compromis performance/reprise sur erreur au cœur de Spring Batch.
