package fr.myway.document;

import fr.myway.user.UserAccount;
import fr.myway.user.UserAccountRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * RG1 : le contrôle du rôle admin est appliqué côté API, à chaque requête et
 * depuis la base (une promotion/révocation prend effet sans re-login).
 */
@Service
public class AdminGuard {

    private final UserAccountRepository users;

    public AdminGuard(UserAccountRepository users) {
        this.users = users;
    }

    public UserAccount requireAdmin(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        Long userId = (Long) authentication.getPrincipal();
        UserAccount user = users.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        if (!user.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Réservé aux administrateurs");
        }
        return user;
    }
}
