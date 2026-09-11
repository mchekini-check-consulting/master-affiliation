package fr.hitechacademy.seo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SeoArticleRepository extends JpaRepository<SeoArticle, UUID> {

    List<SeoArticle> findAllByOrderByCreatedAtDesc();

    List<SeoArticle> findByStatusOrderByCreatedAtDesc(SeoArticleStatus status);

    List<SeoArticle> findByStatusAndPublishAtBeforeOrderByPublishAtAsc(
            SeoArticleStatus status, Instant publishBefore);

    List<SeoArticle> findByStatusOrderByPublishedAtDesc(SeoArticleStatus status);

    Optional<SeoArticle> findBySlugAndStatus(String slug, SeoArticleStatus status);
}
