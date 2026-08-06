package fr.immoscrapper.annonce;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnnonceRepository extends JpaRepository<Annonce, Long> {

    List<Annonce> findAllByOrderByAudienceAsc();

    Optional<Annonce> findByUrl(String url);
}
