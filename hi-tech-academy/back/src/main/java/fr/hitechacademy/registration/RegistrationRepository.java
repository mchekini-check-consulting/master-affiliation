package fr.hitechacademy.registration;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RegistrationRepository extends JpaRepository<RegistrationRequest, UUID> {

    List<RegistrationRequest> findAllByOrderByCreatedAtDesc();

    // Demandes transmises à l'admin (questionnaire obligatoire renseigné)
    List<RegistrationRequest> findAllByStatusNotOrderByCreatedAtDesc(RegistrationStatus status);
}
