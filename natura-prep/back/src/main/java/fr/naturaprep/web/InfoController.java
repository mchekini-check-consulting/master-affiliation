package fr.naturaprep.web;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Point d'entrée de démonstration : permet au front de vérifier que
 * l'API répond (le vrai domaine — questions, blog — arrivera ensuite).
 */
@RestController
@RequestMapping("/v1/info")
public class InfoController {

    @GetMapping
    public Map<String, String> info() {
        return Map.of(
                "application", "NaturaPrep",
                "description", "Préparation à l'entretien de naturalisation française",
                "statut", "squelette opérationnel"
        );
    }
}
