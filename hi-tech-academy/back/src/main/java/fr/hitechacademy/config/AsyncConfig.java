package fr.hitechacademy.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Exécution asynchrone : les envois d'emails ne bloquent pas les réponses HTTP.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
}
