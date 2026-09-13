package fr.hitechacademy.seo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SeoKeywordRepository extends JpaRepository<SeoKeyword, UUID> {

    List<SeoKeyword> findAllByOrderByCreatedAtDesc();

    boolean existsByKeywordIgnoreCaseAndLocationCodeAndLanguageCode(
            String keyword, int locationCode, String languageCode);

    boolean existsByStatus(SeoKeywordStatus status);
}
