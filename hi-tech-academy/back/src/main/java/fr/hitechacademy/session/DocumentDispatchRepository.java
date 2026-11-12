package fr.hitechacademy.session;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DocumentDispatchRepository extends JpaRepository<DocumentDispatch, UUID> {
    List<DocumentDispatch> findByRegistrationId(UUID registrationId);
}
