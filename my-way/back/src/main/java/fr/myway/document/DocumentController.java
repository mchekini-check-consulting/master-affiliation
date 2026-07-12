package fr.myway.document;

import fr.myway.document.DocumentDtos.DocumentDto;
import fr.myway.document.DocumentDtos.ThemeDto;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ContentDisposition;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

/**
 * Espace documentaire, côté consultation (tout utilisateur connecté) :
 * liste avec recherche multicritère, visualisation inline et téléchargement.
 */
@RestController
public class DocumentController {

    private final DocumentFileRepository documents;
    private final ThemeRepository themes;
    private final FileStorageService storage;

    public DocumentController(DocumentFileRepository documents, ThemeRepository themes, FileStorageService storage) {
        this.documents = documents;
        this.themes = themes;
        this.storage = storage;
    }

    /** Thématiques avec compteur de documents publiés (filtres + groupement). */
    @GetMapping("/themes")
    public List<ThemeDto> themes() {
        return themes.findAllByOrderByNameAsc().stream()
                .map(t -> new ThemeDto(t.getId(), t.getName(),
                        documents.findByThemeId(t.getId()).stream().filter(d -> d.getDeletedDate() == null).count()))
                .toList();
    }

    /**
     * Recherche multicritère cumulative (ET) : texte libre (titre, description,
     * tags), thématiques, types de fichier, période de publication.
     */
    @GetMapping("/documents")
    public List<DocumentDto> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) List<Long> themeIds,
            @RequestParam(required = false) List<String> types,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        boolean allThemes = themeIds == null || themeIds.isEmpty();
        boolean allTypes = types == null || types.isEmpty();
        Instant fromInstant = from == null || from.isBlank()
                ? Instant.EPOCH
                : LocalDate.parse(from).atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant toInstant = to == null || to.isBlank()
                ? Instant.now().plusSeconds(86400)
                : LocalDate.parse(to).plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        return documents.search(
                        q == null ? "" : q.trim().toLowerCase(),
                        allThemes, allThemes ? List.of(-1L) : themeIds,
                        allTypes, allTypes ? List.of("AUCUN") : types,
                        fromInstant, toInstant)
                .stream().map(DocumentDto::from).toList();
    }

    /** « Voir » : contenu servi inline (visionneuse intégrée PDF / images). */
    @GetMapping("/documents/{id}/file")
    public ResponseEntity<InputStreamResource> file(@PathVariable Long id) {
        return serve(id, false);
    }

    /** « Télécharger » : fichier original avec son nom d'origine (RG4). */
    @GetMapping("/documents/{id}/download")
    public ResponseEntity<InputStreamResource> download(@PathVariable Long id) {
        return serve(id, true);
    }

    private ResponseEntity<InputStreamResource> serve(Long id, boolean attachment) {
        DocumentFile doc = documents.findByIdAndDeletedDateIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        try {
            ContentDisposition disposition = (attachment
                    ? ContentDisposition.attachment()
                    : ContentDisposition.inline())
                    .filename(doc.getOriginalFilename(), java.nio.charset.StandardCharsets.UTF_8)
                    .build();
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(doc.getMimeType()))
                    .contentLength(doc.getSizeBytes())
                    .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                    .body(new InputStreamResource(storage.read(doc.getStorageId())));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Fichier indisponible");
        }
    }
}
