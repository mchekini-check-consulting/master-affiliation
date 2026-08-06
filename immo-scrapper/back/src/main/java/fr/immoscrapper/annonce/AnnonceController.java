package fr.immoscrapper.annonce;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Annonces aux enchères : liste triée par date d'audience. */
@RestController
@RequestMapping("/v1/annonces")
public class AnnonceController {

    private final AnnonceRepository annonces;

    public AnnonceController(AnnonceRepository annonces) {
        this.annonces = annonces;
    }

    @GetMapping
    public List<Annonce> lister() {
        return annonces.findAllByOrderByAudienceAsc();
    }
}
