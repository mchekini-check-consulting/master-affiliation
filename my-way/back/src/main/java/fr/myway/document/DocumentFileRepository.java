package fr.myway.document;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface DocumentFileRepository extends JpaRepository<DocumentFile, Long> {

    Optional<DocumentFile> findByIdAndDeletedDateIsNull(Long id);

    List<DocumentFile> findByDeletedDateIsNotNullOrderByDeletedDateDesc();

    List<DocumentFile> findByDeletedDateBefore(Instant limit);

    boolean existsByThemeIdAndDeletedDateIsNull(Long themeId);

    List<DocumentFile> findByThemeId(Long themeId);

    /**
     * Recherche multicritère (logique ET) : texte libre sur titre/description/tags,
     * thématiques, types de fichier et période de publication. Tri RG6 :
     * date de publication décroissante.
     */
    @Query("""
            select distinct d from DocumentFile d left join d.tags tag
            where d.deletedDate is null
              and (:q = '' or lower(d.title) like concat('%', :q, '%')
                   or lower(coalesce(d.description, '')) like concat('%', :q, '%')
                   or lower(tag) like concat('%', :q, '%'))
              and (:allThemes = true or d.theme.id in :themeIds)
              and (:allTypes = true or d.fileType in :types)
              and d.publishedDate >= :from
              and d.publishedDate <= :to
            order by d.publishedDate desc
            """)
    List<DocumentFile> search(@Param("q") String q,
                              @Param("allThemes") boolean allThemes,
                              @Param("themeIds") List<Long> themeIds,
                              @Param("allTypes") boolean allTypes,
                              @Param("types") List<String> types,
                              @Param("from") Instant from,
                              @Param("to") Instant to);
}
