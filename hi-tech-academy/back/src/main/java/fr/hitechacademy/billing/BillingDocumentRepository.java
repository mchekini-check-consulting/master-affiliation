package fr.hitechacademy.billing;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BillingDocumentRepository extends JpaRepository<BillingDocument, UUID> {

    List<BillingDocument> findAllByOrderByCreatedAtDesc();

    /**
     * Dernier numéro émis pour un préfixe (ex. « FA-2026- ») : sert à attribuer
     * le numéro suivant. Verrou pessimiste pour garantir une numérotation
     * séquentielle sans doublon même en cas d'émissions simultanées.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from BillingDocument d where d.number like concat(:prefix, '%') "
            + "order by d.number desc limit 1")
    Optional<BillingDocument> findLastByNumberPrefix(@Param("prefix") String prefix);
}
