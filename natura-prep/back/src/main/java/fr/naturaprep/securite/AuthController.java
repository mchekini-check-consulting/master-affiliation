package fr.naturaprep.securite;

import fr.naturaprep.membre.Membre;
import fr.naturaprep.membre.MembreRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Authentification par session : inscription, connexion, déconnexion, profil. */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final MembreRepository membres;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager,
                          SecurityContextRepository securityContextRepository,
                          MembreRepository membres,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
        this.membres = membres;
        this.passwordEncoder = passwordEncoder;
    }

    public record RegisterRequest(
            @NotBlank @Email String email,
            @NotBlank @Size(max = 80) String nom,
            @NotBlank @Size(min = 8, max = 128) String motDePasse) {
    }

    public record LoginRequest(@NotBlank String email, @NotBlank String motDePasse) {
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Map<String, Object> register(@Valid @RequestBody RegisterRequest body,
                                        HttpServletRequest request, HttpServletResponse response) {
        String email = body.email().trim().toLowerCase();
        if (membres.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Un compte existe déjà avec cet email");
        }
        Membre membre = new Membre();
        membre.setEmail(email);
        membre.setNom(body.nom().trim());
        membre.setPasswordHash(passwordEncoder.encode(body.motDePasse()));
        membres.save(membre);

        // Connecte directement le nouveau membre (session)
        ouvrirSession(email, body.motDePasse(), request, response);
        return profil(membre);
    }

    @PostMapping("/login")
    @Transactional(readOnly = true)
    public Map<String, Object> login(@Valid @RequestBody LoginRequest body,
                                     HttpServletRequest request, HttpServletResponse response) {
        String email = body.email().trim();
        try {
            ouvrirSession(email, body.motDePasse(), request, response);
        } catch (AuthenticationException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect");
        }
        return me();
    }

    @PostMapping("/logout")
    public void logout(HttpServletRequest request) {
        if (request.getSession(false) != null) {
            request.getSession(false).invalidate();
        }
        SecurityContextHolder.clearContext();
    }

    /** Profil du membre connecté (garde d'accès de l'espace membre). */
    @GetMapping("/me")
    @Transactional(readOnly = true)
    public Map<String, Object> me() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Membre membre = membres.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Compte introuvable"));
        return profil(membre);
    }

    private void ouvrirSession(String email, String motDePasse,
                               HttpServletRequest request, HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, motDePasse));
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);
    }

    private Map<String, Object> profil(Membre membre) {
        return Map.of("membre", Map.of(
                "id", membre.getId(),
                "email", membre.getEmail(),
                "nom", membre.getNom()));
    }
}
