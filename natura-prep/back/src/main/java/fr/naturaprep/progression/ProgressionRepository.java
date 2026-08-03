package fr.naturaprep.progression;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgressionRepository extends JpaRepository<Progression, Long> {

    List<Progression> findByMembreId(Long membreId);

    Optional<Progression> findByMembreIdAndTypeAndCle(Long membreId, String type, String cle);
}
