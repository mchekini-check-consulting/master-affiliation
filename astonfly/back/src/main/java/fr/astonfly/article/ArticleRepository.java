package fr.astonfly.article;

import fr.astonfly.commun.Statut;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ArticleRepository extends JpaRepository<Article, Long> {

    List<Article> findByStatutOrderByDatePublicationDesc(Statut statut);

    boolean existsByCategorieId(Long categorieId);

    boolean existsBySlugAndIdNot(String slug, Long id);

    boolean existsBySlug(String slug);
}
