package fr.myway.simulation;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SimulationRepository extends JpaRepository<Simulation, Long> {
    List<Simulation> findByUserIdOrderByCreatedDateDesc(Long userId, Pageable pageable);
    List<Simulation> findByUserIdOrderByCreatedDateDesc(Long userId);
    Optional<Simulation> findByIdAndUserId(Long id, Long userId);
}
