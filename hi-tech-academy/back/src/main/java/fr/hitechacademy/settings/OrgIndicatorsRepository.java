package fr.hitechacademy.settings;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OrgIndicatorsRepository extends JpaRepository<OrgIndicators, UUID> {
    Optional<OrgIndicators> findFirstByOrderByUpdatedAtDesc();
}
