package fr.naturaprep.simulation;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RapportRepository extends JpaRepository<Rapport, Long> {

    List<Rapport> findByMembreIdOrderByCreeLeDesc(Long membreId);

    Optional<Rapport> findByIdAndMembreId(Long id, Long membreId);
}
