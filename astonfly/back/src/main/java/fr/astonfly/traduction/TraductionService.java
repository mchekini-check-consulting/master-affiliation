package fr.astonfly.traduction;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;
import fr.astonfly.commun.Langues;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Traduction automatique des contenus (articles, catégories, événements) via
 * l'API OpenAI — même approche que natura-prep (RestClient, clé côté serveur).
 * Sans clé configurée, {@link #disponible()} est faux et l'appelant copie le
 * contenu source tel quel avec un avertissement.
 */
@Service
public class TraductionService {

    private static final Logger log = LoggerFactory.getLogger(TraductionService.class);

    private static final Map<String, String> NOMS_LANGUES = Map.of(
            "en", "anglais britannique",
            "pt", "portugais européen (ton marketing impersonnel)",
            "es", "espagnol d'Espagne (tutoiement)",
            "it", "italien (tutoiement)",
            "de", "allemand (vouvoiement, Sie)");

    private final RestClient rest;
    private final ObjectMapper mapper;
    private final String cle;
    private final String modele;

    public TraductionService(@Value("${traduction.openai-api-key}") String cle,
                             @Value("${traduction.modele}") String modele,
                             ObjectMapper mapper) {
        this.cle = cle == null ? "" : cle.trim();
        this.modele = modele;
        this.mapper = mapper;
        this.rest = RestClient.builder().baseUrl("https://api.openai.com/v1").build();
    }

    public boolean disponible() {
        return !cle.isBlank();
    }

    /**
     * Traduit un objet JSON (structure conservée à l'identique, seules les
     * valeurs textuelles sont traduites) du français vers la langue cible.
     * Renvoie null si la traduction est indisponible ou échoue.
     */
    public JsonNode traduire(JsonNode source, String langueCible) {
        if (!disponible() || Langues.SOURCE.equals(langueCible)) {
            return null;
        }
        try {
            String consigne = """
                    Tu traduis le contenu du site d'Astonfly, école française de pilotes de ligne, \
                    du français vers %s. Réponds UNIQUEMENT avec un objet JSON de structure strictement \
                    identique à l'entrée (mêmes clés, mêmes tableaux, même imbrication) où seules les \
                    valeurs textuelles sont traduites. Ton marketing professionnel. Les termes \
                    réglementaires et noms propres restent inchangés : ATPL, EASA, CPL, IR/ME, APS MCC, \
                    KSA, UPRT, FNPT II, type rating, Qualiopi, noms d'avions et de compagnies. \
                    Les montants, dates, URLs et chemins d'images restent inchangés.""" //
                    .formatted(NOMS_LANGUES.getOrDefault(langueCible, langueCible));

            ObjectNode corps = mapper.createObjectNode();
            corps.put("model", modele);
            corps.putObject("response_format").put("type", "json_object");
            var messages = corps.putArray("messages");
            messages.addObject().put("role", "system").put("content", consigne);
            messages.addObject().put("role", "user").put("content", mapper.writeValueAsString(source));

            JsonNode reponse = rest.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + cle)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(mapper.writeValueAsString(corps))
                    .retrieve()
                    .body(JsonNode.class);

            String contenu = reponse.path("choices").path(0).path("message").path("content").asText();
            return mapper.readTree(contenu);
        } catch (Exception e) {
            log.warn("Traduction vers {} échouée : {}", langueCible, e.getMessage());
            return null;
        }
    }
}
