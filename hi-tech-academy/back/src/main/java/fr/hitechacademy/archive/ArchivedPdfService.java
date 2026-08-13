package fr.hitechacademy.archive;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class ArchivedPdfService {

    private final ArchivedPdfRepository repository;

    public ArchivedPdfService(ArchivedPdfRepository repository) {
        this.repository = repository;
    }

    /** Archive le PDF envoyé (un renvoi remplace la copie précédente). */
    @Transactional
    public void archive(ArchivedPdfKind kind, UUID ownerId, byte[] content) {
        ArchivedPdf pdf = repository.findByKindAndOwnerId(kind, ownerId).orElseGet(ArchivedPdf::new);
        pdf.setKind(kind);
        pdf.setOwnerId(ownerId);
        pdf.setContent(content);
        pdf.setArchivedAt(Instant.now());
        repository.save(pdf);
    }
}
