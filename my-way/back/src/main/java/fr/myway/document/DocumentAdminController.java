package fr.myway.document;

import fr.myway.document.DocumentDtos.DocumentDto;
import fr.myway.document.DocumentDtos.ThemeDto;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

/**
 * Administration de l'espace documentaire. Chaque endpoint vérifie le rôle
 * admin en base (RG1) : un utilisateur standard reçoit un 403 même en
 * appelant l'API directement.
 */
@RestController
@RequestMapping("/admin")
public class DocumentAdminController {

    private final DocumentFileRepository documents;
    private final ThemeRepository themes;
    private final FileStorageService storage;
    private final FileTypeValidator validator;
    private final AdminGuard adminGuard;

    public DocumentAdminController(DocumentFileRepository documents, ThemeRepository themes,
                                   FileStorageService storage, FileTypeValidator validator, AdminGuard adminGuard) {
        this.documents = documents;
        this.themes = themes;
        this.storage = storage;
        this.validator = validator;
        this.adminGuard = adminGuard;
    }

    // ------------------------------------------------------------------
    // Thématiques
    // ------------------------------------------------------------------

    public record ThemeRequest(@NotBlank String name) {}

    @PostMapping("/themes")
    @ResponseStatus(HttpStatus.CREATED)
    public ThemeDto createTheme(@RequestBody ThemeRequest request, Authentication auth) {
        adminGuard.requireAdmin(auth);
        String name = request.name().trim();
        if (name.isEmpty() || themes.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette thématique existe déjà");
        }
        Theme theme = new Theme();
        theme.setName(name);
        themes.save(theme);
        return new ThemeDto(theme.getId(), theme.getName(), 0);
    }

    @PatchMapping("/themes/{id}")
    public ThemeDto renameTheme(@PathVariable Long id, @RequestBody ThemeRequest request, Authentication auth) {
        adminGuard.requireAdmin(auth);
        Theme theme = themes.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        theme.setName(request.name().trim());
        themes.save(theme);
        return new ThemeDto(theme.getId(), theme.getName(), 0);
    }

    /**
     * Suppression d'une thématique : uniquement si elle est vide, ou après
     * réaffectation de ses documents via reassignTo.
     */
    @DeleteMapping("/themes/{id}")
    public void deleteTheme(@PathVariable Long id,
                            @RequestParam(required = false) Long reassignTo,
                            Authentication auth) {
        adminGuard.requireAdmin(auth);
        Theme theme = themes.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        List<DocumentFile> docs = documents.findByThemeId(id);
        if (!docs.isEmpty()) {
            if (reassignTo == null) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "La thématique contient des documents : réaffectez-les d'abord");
            }
            Theme cible = themes.findById(reassignTo)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Thématique cible inconnue"));
            docs.forEach(d -> d.setTheme(cible));
            documents.saveAll(docs);
        }
        themes.delete(theme);
    }

    // ------------------------------------------------------------------
    // Documents
    // ------------------------------------------------------------------

    @PostMapping("/documents")
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentDto upload(@RequestParam("file") MultipartFile file,
                              @RequestParam String title,
                              @RequestParam Long themeId,
                              @RequestParam(required = false) String description,
                              @RequestParam(required = false) String tags,
                              Authentication auth) throws IOException {
        adminGuard.requireAdmin(auth);
        Theme theme = themes.findById(themeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thématique obligatoire"));
        FileTypeValidator.FileType type = validator.validate(file);

        DocumentFile doc = new DocumentFile();
        doc.setTitle(title.isBlank() ? file.getOriginalFilename() : title.trim());
        doc.setDescription(description);
        doc.setTheme(theme);
        doc.setTags(parseTags(tags));
        doc.setOriginalFilename(file.getOriginalFilename());
        doc.setStorageId(storage.store(file));
        doc.setMimeType(type.canonicalMime());
        doc.setFileType(type.family());
        doc.setSizeBytes(file.getSize());
        documents.save(doc);
        return DocumentDto.from(doc);
    }

    public record UpdateRequest(String title, String description, String tags, Long themeId) {}

    @PatchMapping("/documents/{id}")
    public DocumentDto update(@PathVariable Long id, @RequestBody UpdateRequest request, Authentication auth) {
        adminGuard.requireAdmin(auth);
        DocumentFile doc = documents.findByIdAndDeletedDateIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (request.title() != null && !request.title().isBlank()) doc.setTitle(request.title().trim());
        if (request.description() != null) doc.setDescription(request.description());
        if (request.tags() != null) doc.setTags(parseTags(request.tags()));
        if (request.themeId() != null) {
            Theme theme = themes.findById(request.themeId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thématique inconnue"));
            doc.setTheme(theme);
        }
        documents.save(doc);
        return DocumentDto.from(doc);
    }

    /** RG8 : nouvelle version du fichier, même identifiant de document. */
    @PutMapping("/documents/{id}/file")
    public DocumentDto replaceFile(@PathVariable Long id, @RequestParam("file") MultipartFile file,
                                   Authentication auth) throws IOException {
        adminGuard.requireAdmin(auth);
        DocumentFile doc = documents.findByIdAndDeletedDateIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        FileTypeValidator.FileType type = validator.validate(file);
        String ancienStorageId = doc.getStorageId();
        doc.setStorageId(storage.store(file));
        doc.setOriginalFilename(file.getOriginalFilename());
        doc.setMimeType(type.canonicalMime());
        doc.setFileType(type.family());
        doc.setSizeBytes(file.getSize());
        documents.save(doc);
        storage.delete(ancienStorageId);
        return DocumentDto.from(doc);
    }

    /** RG7 : soft delete — le document disparaît côté utilisateurs, corbeille 30 jours. */
    @DeleteMapping("/documents/{id}")
    public void softDelete(@PathVariable Long id, Authentication auth) {
        adminGuard.requireAdmin(auth);
        DocumentFile doc = documents.findByIdAndDeletedDateIsNull(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        doc.setDeletedDate(Instant.now());
        documents.save(doc);
    }

    @GetMapping("/documents/trash")
    public List<DocumentDto> trash(Authentication auth) {
        adminGuard.requireAdmin(auth);
        return documents.findByDeletedDateIsNotNullOrderByDeletedDateDesc()
                .stream().map(DocumentDto::from).toList();
    }

    @PostMapping("/documents/{id}/restore")
    public DocumentDto restore(@PathVariable Long id, Authentication auth) {
        adminGuard.requireAdmin(auth);
        DocumentFile doc = documents.findById(id)
                .filter(d -> d.getDeletedDate() != null)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        doc.setDeletedDate(null);
        documents.save(doc);
        return DocumentDto.from(doc);
    }

    private List<String> parseTags(String tags) {
        if (tags == null || tags.isBlank()) return List.of();
        return java.util.Arrays.stream(tags.split(","))
                .map(String::trim).filter(s -> !s.isEmpty()).distinct().toList();
    }
}
