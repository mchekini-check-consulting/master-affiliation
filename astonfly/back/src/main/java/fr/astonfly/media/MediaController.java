package fr.astonfly.media;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Images uploadées depuis l'admin, stockées sur le volume media et servies
 * publiquement (les cartes articles/événements du site les référencent).
 */
@RestController
public class MediaController {

    private static final Set<String> EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif", "svg");

    private final Path dossier;

    public MediaController(@Value("${app.media.dir}") String dir) {
        this.dossier = Path.of(dir);
    }

    @PostConstruct
    void init() throws IOException {
        Files.createDirectories(dossier);
    }

    @PostMapping("/v1/admin/media")
    public Map<String, String> televerser(@RequestParam("fichier") MultipartFile fichier) throws IOException {
        String nomOrigine = fichier.getOriginalFilename() == null ? "image" : fichier.getOriginalFilename();
        String extension = nomOrigine.contains(".")
                ? nomOrigine.substring(nomOrigine.lastIndexOf('.') + 1).toLowerCase()
                : "";
        if (!EXTENSIONS.contains(extension)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Format non supporté (jpg, jpeg, png, webp, gif, svg)");
        }
        String nom = UUID.randomUUID() + "." + extension;
        fichier.transferTo(dossier.resolve(nom));
        return Map.of("url", "/api/v1/public/media/" + nom);
    }

    @GetMapping("/v1/public/media/{nom}")
    public ResponseEntity<byte[]> servir(@PathVariable String nom) throws IOException {
        if (nom.contains("..") || nom.contains("/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
        Path fichier = dossier.resolve(nom);
        if (!Files.isRegularFile(fichier)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        String type = Files.probeContentType(fichier);
        return ResponseEntity.ok()
                .contentType(type != null ? MediaType.parseMediaType(type) : MediaType.APPLICATION_OCTET_STREAM)
                .header("Cache-Control", "public, max-age=604800")
                .body(Files.readAllBytes(fichier));
    }
}
