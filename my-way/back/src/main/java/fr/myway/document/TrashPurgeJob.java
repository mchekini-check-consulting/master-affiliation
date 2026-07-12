package fr.myway.document;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/** RG7 : purge définitive des documents en corbeille depuis plus de 30 jours. */
@Component
public class TrashPurgeJob {

    private static final Logger log = LoggerFactory.getLogger(TrashPurgeJob.class);

    private final DocumentFileRepository documents;
    private final FileStorageService storage;

    public TrashPurgeJob(DocumentFileRepository documents, FileStorageService storage) {
        this.documents = documents;
        this.storage = storage;
    }

    @Scheduled(cron = "0 30 3 * * *")
    public void purge() {
        List<DocumentFile> perimes = documents.findByDeletedDateBefore(Instant.now().minus(30, ChronoUnit.DAYS));
        for (DocumentFile doc : perimes) {
            storage.delete(doc.getStorageId());
            documents.delete(doc);
        }
        if (!perimes.isEmpty()) {
            log.info("Corbeille documentaire : {} document(s) purgé(s)", perimes.size());
        }
    }
}
