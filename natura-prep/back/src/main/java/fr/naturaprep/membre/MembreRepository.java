package fr.naturaprep.membre;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MembreRepository extends JpaRepository<Membre, Long> {

    Optional<Membre> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
