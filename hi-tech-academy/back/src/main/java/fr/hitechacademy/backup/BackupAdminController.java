package fr.hitechacademy.backup;

import fr.hitechacademy.backup.BackupService.ImportReport;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.LocalDate;

/**
 * Sauvegardes de l'espace admin (protégé par basic auth) : export d'une
 * archive complète et restauration d'une archive précédemment exportée.
 */
@RestController
@RequestMapping("/admin/backup")
public class BackupAdminController {

    private final BackupService service;

    public BackupAdminController(BackupService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<byte[]> export() {
        String filename = "hi-tech-academy-backup-" + LocalDate.now() + ".zip";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(service.export());
    }

    @PostMapping("/import")
    public ImportReport importBackup(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Aucun fichier de sauvegarde fourni");
        }
        try {
            return service.importBackup(file.getBytes());
        } catch (IOException | UncheckedIOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fichier illisible : " + e.getMessage());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
}
