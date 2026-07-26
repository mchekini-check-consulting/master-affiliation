package fr.echecs360;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Échecs360 — apprenez les échecs en jouant.
 * Site public SEO (landing + blog SSR), comptes utilisateurs et application
 * d'échecs (jeu à deux, bot à Elo réglable, analyse de parties chess.com).
 */
@SpringBootApplication
public class Echecs360Application {

    public static void main(String[] args) {
        SpringApplication.run(Echecs360Application.class, args);
    }
}
