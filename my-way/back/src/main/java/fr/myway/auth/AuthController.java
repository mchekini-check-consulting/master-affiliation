package fr.myway.auth;

import fr.myway.user.UserAccount;
import fr.myway.user.UserAccountRepository;
import fr.myway.user.UserDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserAccountRepository users;
    private final PasswordEncoder passwordEncoder;
    private final SecurityContextRepository securityContextRepository;

    public AuthController(UserAccountRepository users, PasswordEncoder passwordEncoder,
                          SecurityContextRepository securityContextRepository) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.securityContextRepository = securityContextRepository;
    }

    public record RegisterRequest(
            @NotBlank String fullName,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8, max = 128) String password) {}

    public record LoginRequest(@NotBlank String email, @NotBlank String password) {}

    public record UpdateMeRequest(
            String city,
            List<String> specialties,
            String currentStatus,
            Integer desiredTjm,
            Integer daysPerMonth,
            Double familyShares,
            Integer householdIncome,
            List<String> goals,
            Boolean onboardingCompleted) {}

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto register(@Valid @RequestBody RegisterRequest request,
                            HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        if (users.existsByEmailIgnoreCase(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email déjà utilisé");
        }
        UserAccount user = new UserAccount();
        user.setEmail(request.email().trim().toLowerCase());
        user.setFullName(request.fullName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        users.save(user);

        openSession(user, httpRequest, httpResponse);
        return UserDto.from(user);
    }

    @PostMapping("/login")
    public UserDto login(@Valid @RequestBody LoginRequest request,
                         HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        UserAccount user = users.findByEmailIgnoreCase(request.email().trim())
                .filter(u -> passwordEncoder.matches(request.password(), u.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides"));

        openSession(user, httpRequest, httpResponse);
        return UserDto.from(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        var session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public UserDto me(Authentication authentication) {
        return UserDto.from(currentUser(authentication));
    }

    @PatchMapping("/me")
    public UserDto updateMe(@RequestBody UpdateMeRequest request, Authentication authentication) {
        UserAccount user = currentUser(authentication);
        if (request.city() != null) user.setCity(request.city());
        if (request.specialties() != null) user.setSpecialties(request.specialties());
        if (request.currentStatus() != null) user.setCurrentStatus(request.currentStatus());
        if (request.desiredTjm() != null) user.setDesiredTjm(request.desiredTjm());
        if (request.daysPerMonth() != null) user.setDaysPerMonth(request.daysPerMonth());
        if (request.familyShares() != null) user.setFamilyShares(request.familyShares());
        if (request.householdIncome() != null) user.setHouseholdIncome(request.householdIncome());
        if (request.goals() != null) user.setGoals(request.goals());
        if (request.onboardingCompleted() != null) user.setOnboardingCompleted(request.onboardingCompleted());
        users.save(user);
        return UserDto.from(user);
    }

    private UserAccount currentUser(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        Long userId = (Long) authentication.getPrincipal();
        return users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    private void openSession(UserAccount user, HttpServletRequest request, HttpServletResponse response) {
        // Le principal est l'id utilisateur ; session HTTP classique (cookie JSESSIONID)
        var authentication = UsernamePasswordAuthenticationToken.authenticated(
                user.getId(), null, List.of());
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);
    }
}
