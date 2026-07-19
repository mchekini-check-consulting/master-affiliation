package fr.hitechacademy.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Authentification basique : un seul compte admin, défini par configuration
    @Bean
    public UserDetailsService userDetailsService(
            @Value("${app.admin.email}") String adminEmail,
            @Value("${app.admin.password}") String adminPassword,
            PasswordEncoder passwordEncoder) {
        return new InMemoryUserDetailsManager(
                User.withUsername(adminEmail)
                        .password(passwordEncoder.encode(adminPassword))
                        .roles("ADMIN")
                        .build());
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Parcours public : dépôt d'une demande puis questionnaire d'analyse du besoin
                        .requestMatchers(HttpMethod.POST, "/registrations").permitAll()
                        .requestMatchers(HttpMethod.GET, "/registrations/*/public").permitAll()
                        .requestMatchers(HttpMethod.POST, "/registrations/*/needs-analysis").permitAll()
                        .requestMatchers(HttpMethod.POST, "/registrations/*/sponsor-survey").permitAll()
                        .requestMatchers("/actuator/health/**", "/actuator/health").permitAll()
                        // Dispatch d'erreur Spring (sinon les 400/404/409 publics ressortent en 401)
                        .requestMatchers("/error").permitAll()
                        // Espace admin (basic auth)
                        .anyRequest().authenticated()
                )
                // API : 401 JSON, jamais de redirection vers une page de login
                .exceptionHandling(ex -> ex.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .formLogin(form -> form.disable())
                .httpBasic(basic -> {});

        return http.build();
    }
}
