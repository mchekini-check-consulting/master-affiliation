package fr.immoscrapper.annonce;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnnonceRepository extends JpaRepository<Annonce, Long> {

    List<Annonce> findAllByOrderByAudienceAsc();

    Optional<Annonce> findByUrl(String url);

    /** Annonces sans estimation de marché, ou dont l'estimation est périmée. */
    List<Annonce> findByMarcheCalculeLeIsNullOrMarcheCalculeLeBefore(LocalDateTime limite);
}
