package fr.echecs360.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Sécurité : les pages publiques (landing, blog, sitemap, robots, css/js)
 * restent accessibles ; toute l'application d'échecs vit sous /app et exige
 * l'authentification. CSRF actif, en-têtes par défaut conservés.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final String rememberMeKey;

    public SecurityConfig(@Value("${app.remember-me-key}") String rememberMeKey) {
        this.rememberMeKey = rememberMeKey;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(auth -> auth
                        // Application d'échecs et API associée : connectés uniquement
                        .requestMatchers("/app/**", "/api/**").authenticated()
                        // Tout le reste (landing, blog, auth, assets, SEO) est public
                        .anyRequest().permitAll())
                .formLogin(form -> form
                        .loginPage("/login")
                        .defaultSuccessUrl("/app", false)
                        .failureUrl("/login?error")
                        .permitAll())
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/")
                        .permitAll())
                // Session persistante « rester connecté » (14 jours)
                .rememberMe(remember -> remember
                        .key(rememberMeKey)
                        .rememberMeParameter("remember-me")
                        .tokenValiditySeconds(14 * 24 * 3600));
        return http.build();
    }
}
