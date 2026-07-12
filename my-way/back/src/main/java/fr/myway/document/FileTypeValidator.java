package fr.myway.document;

import org.apache.tika.Tika;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Validation des fichiers uploadés : extension ET type MIME réel (magic bytes,
 * détection Apache Tika) — un exécutable renommé en .pdf est rejeté.
 * Formats acceptés : PDF, Word, Excel et images.
 */
@Service
public class FileTypeValidator {

    public record FileType(String family, String canonicalMime) {}

    public static final String FORMATS_ACCEPTES =
            "Formats acceptés : PDF (.pdf), Word (.doc, .docx), Excel (.xls, .xlsx), "
            + "images (.jpeg, .jpg, .png, .gif, .webp, .heic)";

    /** Extension → famille + MIME canonique enregistré en base. */
    private static final Map<String, FileType> EXTENSIONS = Map.ofEntries(
            Map.entry("pdf", new FileType("PDF", "application/pdf")),
            Map.entry("doc", new FileType("WORD", "application/msword")),
            Map.entry("docx", new FileType("WORD", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")),
            Map.entry("xls", new FileType("EXCEL", "application/vnd.ms-excel")),
            Map.entry("xlsx", new FileType("EXCEL", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")),
            Map.entry("jpeg", new FileType("IMAGE", "image/jpeg")),
            Map.entry("jpg", new FileType("IMAGE", "image/jpeg")),
            Map.entry("png", new FileType("IMAGE", "image/png")),
            Map.entry("gif", new FileType("IMAGE", "image/gif")),
            Map.entry("webp", new FileType("IMAGE", "image/webp")),
            Map.entry("heic", new FileType("IMAGE", "image/heic"))
    );

    /**
     * Types détectés admissibles par extension. Avec tika-core (détection par
     * magic bytes, sans les parsers), les formats Office sont vus comme leurs
     * conteneurs : OLE2 pour .doc/.xls, zip/OOXML pour .docx/.xlsx.
     */
    private static final Map<String, Set<String>> MIME_ADMIS = Map.ofEntries(
            Map.entry("pdf", Set.of("application/pdf")),
            Map.entry("doc", Set.of("application/msword", "application/x-tika-msoffice")),
            Map.entry("docx", Set.of("application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/x-tika-ooxml", "application/zip")),
            Map.entry("xls", Set.of("application/vnd.ms-excel", "application/x-tika-msoffice")),
            Map.entry("xlsx", Set.of("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "application/x-tika-ooxml", "application/zip")),
            Map.entry("jpeg", Set.of("image/jpeg")),
            Map.entry("jpg", Set.of("image/jpeg")),
            Map.entry("png", Set.of("image/png")),
            Map.entry("gif", Set.of("image/gif")),
            Map.entry("webp", Set.of("image/webp")),
            Map.entry("heic", Set.of("image/heic", "image/heif"))
    );

    private final Tika tika = new Tika();

    /** Valide extension + contenu réel et retourne famille et MIME canonique. */
    public FileType validate(MultipartFile file) {
        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String extension = extension(filename);
        FileType type = EXTENSIONS.get(extension);
        if (type == null) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Format refusé pour « " + filename + " ». " + FORMATS_ACCEPTES);
        }

        // Détection sur le contenu seul (magic bytes), sans indice de nom de
        // fichier : l'extension ne peut pas influencer le type détecté.
        String detected;
        try {
            detected = tika.detect(file.getInputStream());
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fichier illisible");
        }
        if (!MIME_ADMIS.get(extension).contains(detected)) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Le contenu réel de « " + filename + " » (" + detected
                    + ") ne correspond pas à son extension. " + FORMATS_ACCEPTES);
        }
        return type;
    }

    private String extension(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot < 0 ? "" : filename.substring(dot + 1).toLowerCase(Locale.ROOT);
    }
}
