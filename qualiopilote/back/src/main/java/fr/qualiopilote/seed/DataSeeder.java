package fr.qualiopilote.seed;

import fr.qualiopilote.organization.Organization;
import fr.qualiopilote.organization.OrganizationRepository;
import fr.qualiopilote.rbac.Role;
import fr.qualiopilote.user.UserAccount;
import fr.qualiopilote.user.UserAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Amorce les données minimales au démarrage : un organisme de démonstration et
 * son compte propriétaire (OWNER). Idempotent — ne recrée rien si le slug ou
 * l'e-mail existent déjà. Désactivable via {@code app.seed.enabled=false}.
 */
@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final OrganizationRepository organizations;
    private final UserAccountRepository users;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.org-nom}")
    private String orgNom;
    @Value("${app.seed.org-slug}")
    private String orgSlug;
    @Value("${app.seed.owner-email}")
    private String ownerEmail;
    @Value("${app.seed.owner-password}")
    private String ownerPassword;

    public DataSeeder(OrganizationRepository organizations, UserAccountRepository users,
                      PasswordEncoder passwordEncoder) {
        this.organizations = organizations;
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(org.springframework.boot.ApplicationArguments args) {
        Organization org = organizations.findBySlug(orgSlug).orElseGet(() -> {
            Organization o = new Organization();
            o.setNom(orgNom);
            o.setSlug(orgSlug);
            Organization saved = organizations.save(o);
            log.info("Seed : organisme « {} » (slug={}) créé", orgNom, orgSlug);
            return saved;
        });

        if (!users.existsByEmailIgnoreCase(ownerEmail)) {
            UserAccount owner = new UserAccount();
            owner.setOrganizationId(org.getId());
            owner.setEmail(ownerEmail);
            owner.setPasswordHash(passwordEncoder.encode(ownerPassword));
            owner.setFirstName("Compte");
            owner.setLastName("Démonstration");
            owner.setRole(Role.OWNER);
            owner.setActive(true);
            users.save(owner);
            log.info("Seed : compte OWNER {} créé pour l'organisme {}", ownerEmail, orgSlug);
        }
    }
}
