package fr.immoscrapper.annonce;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnnonceRepository extends JpaRepository<Annonce, Long> {

    List<Annonce> findAllByOrderByAudienceAsc();
}
