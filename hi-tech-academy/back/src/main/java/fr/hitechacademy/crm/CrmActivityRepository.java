package fr.hitechacademy.crm;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CrmActivityRepository extends JpaRepository<CrmActivity, UUID> {

    List<CrmActivity> findByContactIdOrderByCreatedAtDesc(UUID contactId);

    void deleteByContactId(UUID contactId);
}
