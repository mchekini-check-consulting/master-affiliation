package fr.qualiopilote.referentiel;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Référentiels (listes de valeurs). Accessibles à tout utilisateur authentifié :
 * ce sont des données partagées, non liées à un organisme.
 */
@RestController
@RequestMapping("/referentiels")
public class ReferentielController {

    private final ReferentielService service;

    public ReferentielController(ReferentielService service) {
        this.service = service;
    }

    @GetMapping
    public Map<String, List<Map<String, Object>>> tous() {
        return service.tous();
    }

    @GetMapping("/{cle}")
    public ResponseEntity<List<Map<String, Object>>> parCle(@PathVariable String cle) {
        List<Map<String, Object>> valeurs = service.parCle(cle);
        return valeurs == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(valeurs);
    }
}
