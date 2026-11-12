package fr.hitechacademy.session;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SatisfactionResponseRepository extends JpaRepository<SatisfactionResponse, UUID> {
    List<SatisfactionResponse> findByRegistrationId(UUID registrationId);
    List<SatisfactionResponse> findBySessionId(UUID sessionId);
}
