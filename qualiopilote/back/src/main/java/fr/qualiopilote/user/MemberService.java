package fr.qualiopilote.user;

import fr.qualiopilote.rbac.Action;
import fr.qualiopilote.rbac.Module;
import fr.qualiopilote.security.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Couche service scopée par organisme (DAL) : toute lecture/écriture passe par
 * le TenantContext, qui fournit l'organizationId courant et vérifie les
 * permissions. Aucun contrôleur n'accède directement au repository.
 */
@Service
public class MemberService {

    private final UserAccountRepository users;
    private final TenantContext tenant;

    public MemberService(UserAccountRepository users, TenantContext tenant) {
        this.users = users;
        this.tenant = tenant;
    }

    /** Membres de l'organisme courant uniquement (jamais ceux d'un autre tenant). */
    @Transactional(readOnly = true)
    public List<UserAccount> listeDeMonOrganisme() {
        tenant.requirePermission(Module.PARAMETRES, Action.VOIR);
        return users.findByOrganizationIdOrderByCreatedAtAsc(tenant.organizationId());
    }
}
