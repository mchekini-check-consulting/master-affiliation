package fr.hitechacademy.seo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SeoKeywordSuggestionRepository extends JpaRepository<SeoKeywordSuggestion, UUID> {

    List<SeoKeywordSuggestion> findByKeywordIdOrderByVolumeDesc(UUID keywordId);

    List<SeoKeywordSuggestion> findByStatusOrderByCreatedAtAsc(SeoSuggestionStatus status);

    void deleteByKeywordId(UUID keywordId);

    long countByKeywordId(UUID keywordId);

    boolean existsByStatus(SeoSuggestionStatus status);
}
