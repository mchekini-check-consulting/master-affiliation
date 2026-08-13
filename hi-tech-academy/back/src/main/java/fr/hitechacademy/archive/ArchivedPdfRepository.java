package fr.hitechacademy.archive;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ArchivedPdfRepository extends JpaRepository<ArchivedPdf, UUID> {

    Optional<ArchivedPdf> findByKindAndOwnerId(ArchivedPdfKind kind, UUID ownerId);
}
