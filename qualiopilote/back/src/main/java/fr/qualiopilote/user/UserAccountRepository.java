package fr.qualiopilote.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {

    Optional<UserAccount> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    /** Scopé par organisme : ne retourne jamais les comptes d'un autre tenant. */
    List<UserAccount> findByOrganizationIdOrderByCreatedAtAsc(UUID organizationId);
}
