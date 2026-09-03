package fr.astonfly.evenement;

import fr.astonfly.commun.Langues;
import fr.astonfly.commun.Statut;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Événements publiés, au format exact des `events` codés en dur de la SPA :
 * {day, month, tag, title, place, time, desc, img}.
 */
@RestController
@RequestMapping("/v1/public/events")
public class EvenementPublicController {

    private final EvenementRepository evenements;

    public EvenementPublicController(EvenementRepository evenements) {
        this.evenements = evenements;
    }

    @GetMapping
    public List<Map<String, Object>> lister(@RequestParam(defaultValue = "fr") String lang) {
        String langue = Langues.valide(lang) ? lang : "fr";
        return evenements.findByStatutOrderByDateAsc(Statut.PUBLIE).stream()
                .map(e -> versCarte(e, langue))
                .flatMap(Optional::stream)
                .toList();
    }

    private Optional<Map<String, Object>> versCarte(Evenement e, String langue) {
        return e.traduction(langue).map(t -> {
            Map<String, Object> carte = new LinkedHashMap<>();
            carte.put("day", Langues.jour(e.getDate()));
            carte.put("month", Langues.moisCourt(e.getDate(), langue));
            carte.put("tag", t.getTag());
            carte.put("title", t.getTitre());
            carte.put("place", t.getLieu());
            carte.put("time", t.getHoraire());
            carte.put("desc", t.getDescription());
            carte.put("img", e.getImage());
            return carte;
        });
    }
}
