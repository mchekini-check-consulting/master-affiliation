package fr.qualiopilote.referentiel;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Charge une fois pour toutes les référentiels (listes de valeurs figées :
 * civilités, formes juridiques, pays, typologies BPF, niveaux Cerfa, NSF, TVA)
 * depuis les fichiers JSON de {@code classpath:referentiels/}. La clé exposée
 * est le nom du fichier sans extension (ex. {@code formes-juridiques}).
 */
@Service
public class ReferentielService {

    private final ObjectMapper mapper;
    private final Map<String, List<Map<String, Object>>> referentiels = new LinkedHashMap<>();

    public ReferentielService(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    @PostConstruct
    void charger() throws IOException {
        var resolver = new PathMatchingResourcePatternResolver();
        Resource[] fichiers = resolver.getResources("classpath:referentiels/*.json");
        var type = new TypeReference<List<Map<String, Object>>>() {};
        // Ordre stable pour un rendu déterministe côté front.
        var ordonnes = new java.util.TreeMap<String, List<Map<String, Object>>>();
        for (Resource fichier : fichiers) {
            String nom = fichier.getFilename();
            if (nom == null) {
                continue;
            }
            String cle = nom.substring(0, nom.length() - ".json".length());
            try (InputStream in = fichier.getInputStream()) {
                ordonnes.put(cle, mapper.readValue(in, type));
            }
        }
        referentiels.putAll(ordonnes);
    }

    /** Tous les référentiels, indexés par clé. */
    public Map<String, List<Map<String, Object>>> tous() {
        return referentiels;
    }

    /** Un référentiel précis, ou {@code null} s'il n'existe pas. */
    public List<Map<String, Object>> parCle(String cle) {
        return referentiels.get(cle);
    }
}
