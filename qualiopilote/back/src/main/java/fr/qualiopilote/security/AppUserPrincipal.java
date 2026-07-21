package fr.qualiopilote.security;

import fr.qualiopilote.rbac.Role;
import fr.qualiopilote.user.UserAccount;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Principal authentifié : porte l'identité du compte, son organisme (tenant)
 * et son rôle RBAC, exploités par TenantContext et le contrôle des permissions.
 */
public class AppUserPrincipal implements UserDetails {

    private final UUID userId;
    private final UUID organizationId;
    private final String email;
    private final String passwordHash;
    private final Role role;
    private final boolean active;

    public AppUserPrincipal(UserAccount u) {
        this.userId = u.getId();
        this.organizationId = u.getOrganizationId();
        this.email = u.getEmail();
        this.passwordHash = u.getPasswordHash();
        this.role = u.getRole();
        this.active = u.isActive();
    }

    public UUID getUserId() { return userId; }
    public UUID getOrganizationId() { return organizationId; }
    public Role getRole() { return role; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override public String getPassword() { return passwordHash; }
    @Override public String getUsername() { return email; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return active; }
}
