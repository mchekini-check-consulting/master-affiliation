package fr.qualiopilote.security;

import fr.qualiopilote.organization.Organization;
import fr.qualiopilote.organization.OrganizationRepository;
import fr.qualiopilote.rbac.Action;
import fr.qualiopilote.rbac.Module;
import fr.qualiopilote.rbac.Permissions;
import fr.qualiopilote.user.UserAccount;
import fr.qualiopilote.user.UserAccountRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Authentification par session : connexion, déconnexion, profil courant. */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepositoryHolder contextRepo;
    private final UserAccountRepository users;
    private final OrganizationRepository organizations;
    private final TenantContext tenant;

    public AuthController(AuthenticationManager authenticationManager,
                          org.springframework.security.web.context.SecurityContextRepository securityContextRepository,
                          UserAccountRepository users,
                          OrganizationRepository organizations,
                          TenantContext tenant) {
        this.authenticationManager = authenticationManager;
        this.contextRepo = new SecurityContextRepositoryHolder(securityContextRepository);
        this.users = users;
        this.organizations = organizations;
        this.tenant = tenant;
    }

    public record LoginRequest(@NotBlank String email, @NotBlank String password) {
    }

    @PostMapping("/login")
    @Transactional
    public Map<String, Object> login(@Valid @RequestBody LoginRequest body,
                                     HttpServletRequest request, HttpServletResponse response) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(body.email().trim(), body.password()));
        } catch (BadCredentialsException | org.springframework.security.core.userdetails.UsernameNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiant ou mot de passe incorrect");
        }

        // Persiste le contexte dans la session (cookie)
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        contextRepo.save(context, request, response);

        // Trace la dernière connexion
        AppUserPrincipal p = (AppUserPrincipal) authentication.getPrincipal();
        users.findById(p.getUserId()).ifPresent(u -> {
            u.setLastLoginAt(Instant.now());
            users.save(u);
        });

        return me();
    }

    @PostMapping("/logout")
    public void logout() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null && attrs.getRequest().getSession(false) != null) {
            attrs.getRequest().getSession(false).invalidate();
        }
        SecurityContextHolder.clearContext();
    }

    /** Profil courant + permissions calculées (pour construire la sidebar RBAC). */
    @GetMapping("/me")
    @Transactional(readOnly = true)
    public Map<String, Object> me() {
        UserAccount u = users.findById(tenant.userId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Compte introuvable"));
        Organization org = organizations.findById(u.getOrganizationId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Organisme introuvable"));

        // permissions : { MODULE: [ACTIONS...] } pour les seuls modules accessibles
        Map<String, List<String>> permissions = new LinkedHashMap<>();
        for (Module m : Module.values()) {
            var actions = Permissions.actions(u.getRole(), m);
            if (!actions.isEmpty()) {
                permissions.put(m.name(), actions.stream().map(Action::name).sorted().toList());
            }
        }

        return Map.of(
                "user", Map.of(
                        "id", u.getId(),
                        "email", u.getEmail(),
                        "first_name", u.getFirstName() == null ? "" : u.getFirstName(),
                        "last_name", u.getLastName() == null ? "" : u.getLastName(),
                        "role", u.getRole().name()),
                "organization", Map.of(
                        "id", org.getId(),
                        "nom", org.getNom(),
                        "slug", org.getSlug()),
                "permissions", permissions);
    }

    /** Petit wrapper pour éviter d'exposer directement le repository dans le champ. */
    private record SecurityContextRepositoryHolder(
            org.springframework.security.web.context.SecurityContextRepository repo) {
        void save(SecurityContext ctx, HttpServletRequest req, HttpServletResponse res) {
            repo.saveContext(ctx, req, res);
        }
    }
}
