package fr.hitechacademy.convention;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConventionRepository extends JpaRepository<Convention, UUID> {

    List<Convention> findAllByOrderByCreatedAtDesc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Convention c where c.number like concat(:prefix, '%') order by c.number desc limit 1")
    Optional<Convention> findLastByNumberPrefix(@Param("prefix") String prefix);
}
