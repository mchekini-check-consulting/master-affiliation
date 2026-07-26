package fr.echecs360.blog;

import java.time.LocalDate;
import java.util.List;

/** Article de blog rendu depuis un fichier Markdown (front-matter + HTML). */
public record Article(
        String slug,
        String title,
        String description,
        LocalDate date,
        List<String> tags,
        String html,
        List<TocEntry> toc,
        int readingMinutes) {

    /** Entrée du sommaire (titres h2 de l'article). */
    public record TocEntry(String id, String label) {
    }
}
