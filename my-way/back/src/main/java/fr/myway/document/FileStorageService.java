package fr.myway.document;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Stockage des fichiers sur disque (volume Docker en production). Les fichiers
 * sont enregistrés sous un UUID (RG4 : jamais le nom fourni — pas de collision
 * ni de path traversal) et servis uniquement via les endpoints authentifiés
 * (RG5). L'implémentation est isolée ici pour permettre une migration vers un
 * stockage objet (S3/Azure) sans toucher aux contrôleurs.
 */
@Service
public class FileStorageService {

    private final Path root;

    public FileStorageService(@Value("${app.documents.dir:./data/documents}") String dir) {
        this.root = Path.of(dir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new UncheckedIOException("Impossible de créer le répertoire de stockage " + root, e);
        }
    }

    /** Enregistre le fichier et retourne son identifiant technique. */
    public String store(MultipartFile file) throws IOException {
        String storageId = UUID.randomUUID().toString();
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, root.resolve(storageId), StandardCopyOption.REPLACE_EXISTING);
        }
        return storageId;
    }

    public InputStream read(String storageId) throws IOException {
        return Files.newInputStream(resolve(storageId));
    }

    public void delete(String storageId) {
        try {
            Files.deleteIfExists(resolve(storageId));
        } catch (IOException ignored) {
            // Fichier déjà absent : la purge ne doit pas échouer pour autant
        }
    }

    private Path resolve(String storageId) {
        // L'identifiant vient toujours de la base (UUID) ; on neutralise malgré
        // tout toute tentative de traversal par prudence.
        Path path = root.resolve(storageId).normalize();
        if (!path.startsWith(root)) {
            throw new IllegalArgumentException("Identifiant de stockage invalide");
        }
        return path;
    }
}
