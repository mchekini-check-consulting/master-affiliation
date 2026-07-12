package fr.myway.document;

import java.time.Instant;
import java.util.List;

// Sérialisé en snake_case (spring.jackson.property-naming-strategy)
public final class DocumentDtos {

    private DocumentDtos() {}

    public record ThemeDto(Long id, String name, long documentCount) {}

    public record DocumentDto(
            Long id,
            String title,
            String description,
            List<String> tags,
            Long themeId,
            String themeName,
            String fileType,
            String mimeType,
            String originalFilename,
            long sizeBytes,
            Instant publishedDate,
            Instant deletedDate) {

        public static DocumentDto from(DocumentFile d) {
            return new DocumentDto(
                    d.getId(), d.getTitle(), d.getDescription(), d.getTags(),
                    d.getTheme().getId(), d.getTheme().getName(),
                    d.getFileType(), d.getMimeType(), d.getOriginalFilename(),
                    d.getSizeBytes(), d.getPublishedDate(), d.getDeletedDate());
        }
    }
}
