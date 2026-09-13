package fr.hitechacademy.crm;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CrmContactRepository extends JpaRepository<CrmContact, UUID> {

    List<CrmContact> findAllByOrderByStageAscPositionAsc();

    int countByStage(CrmStage stage);

    Optional<CrmContact> findFirstByEmailIgnoreCase(String email);

    Optional<CrmContact> findFirstByPhone(String phone);
}
