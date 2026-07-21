package fr.qualiopilote.security;

import fr.qualiopilote.rbac.Action;
import fr.qualiopilote.rbac.Module;
import fr.qualiopilote.rbac.Permissions;
import fr.qualiopilote.rbac.Role;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

/**
 * Point d'accès unique au tenant courant (organisme + utilisateur + rôle),
 * résolu depuis le contexte de sécurité. Toute la couche service passe par ici
 * pour scoper les données par organisme et pour vérifier les permissions —
 * aucun accès aux données ne doit se faire sans ce filtre.
 */
@Component
public class TenantContext {

    public AppUserPrincipal principal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AppUserPrincipal p)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non authentifié");
        }
        return p;
    }

    /** Identifiant de l'organisme courant — à passer à toutes les requêtes métier. */
    public UUID organizationId() {
        return principal().getOrganizationId();
    }

    public UUID userId() {
        return principal().getUserId();
    }

    public Role role() {
        return principal().getRole();
    }

    /** L'utilisateur courant a-t-il ce droit ? */
    public boolean peut(Module module, Action action) {
        return Permissions.autorise(role(), module, action);
    }

    /** Exige une permission, sinon 403 — à appeler en tête des actions sensibles. */
    public void requirePermission(Module module, Action action) {
        if (!peut(module, action)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Action non autorisée pour votre rôle (" + module + " / " + action + ")");
        }
    }
}
