package fr.naturaprep.simulation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

/**
 * Appels à l'API OpenAI : création de tokens éphémères Realtime (la clé API
 * ne quitte jamais ce backend) et évaluation du transcript avec sortie JSON
 * structurée par schéma.
 */
@Service
public class OpenAiClient {

    private final RestClient http;
    private final ObjectMapper json;
    private final String cle;

    public OpenAiClient(ObjectMapper json, @Value("${simulation.openai-cle:}") String cle) {
        this.json = json;
        this.cle = cle;
        this.http = RestClient.builder().baseUrl("https://api.openai.com/v1").build();
    }

    private void verifierCle() {
        if (cle == null || cle.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "La simulation n'est pas configurée (clé OpenAI absente).");
        }
    }

    /**
     * Crée un token éphémère pour une session Realtime en WebRTC.
     * Retourne la réponse OpenAI (value = token, expires_at, session).
     */
    public JsonNode creerTokenEphemere(String modele, String instructions) {
        verifierCle();
        Map<String, Object> corps = Map.of(
                "expires_after", Map.of("anchor", "created_at", "seconds", 600),
                "session", Map.of(
                        "type", "realtime",
                        "model", modele,
                        "instructions", instructions,
                        "audio", Map.of(
                                "input", Map.of(
                                        "transcription", Map.of(
                                                "model", "gpt-4o-mini-transcribe",
                                                "language", "fr")),
                                "output", Map.of("voice", "marin"))));
        try {
            return http.post()
                    .uri("/realtime/client_secrets")
                    .header("Authorization", "Bearer " + cle)
                    .header("Content-Type", "application/json")
                    .body(corps)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Impossible de créer la session vocale : " + resumeErreur(e));
        }
    }

    /** Résultat d'une évaluation : le rapport JSON + les tokens consommés. */
    public record Evaluation(JsonNode rapport, long tokensEntree, long tokensSortie) {
    }

    /**
     * Évalue le transcript avec un modèle texte et une sortie contrainte par
     * schéma JSON (grille stricte du rapport d'entretien).
     */
    public Evaluation evaluer(String modele, String promptSysteme, String transcript) {
        verifierCle();
        Map<String, Object> corps = new LinkedHashMap<>();
        corps.put("model", modele);
        // La famille gpt-5 n'accepte pas de température personnalisée
        if (!modele.startsWith("gpt-5") && !modele.startsWith("o")) {
            corps.put("temperature", 0.2);
        }
        corps.put("messages", List.of(
                Map.of("role", "system", "content", promptSysteme),
                Map.of("role", "user", "content", transcript)));
        corps.put("response_format", Map.of(
                "type", "json_schema",
                "json_schema", Map.of(
                        "name", "rapport_entretien",
                        "strict", true,
                        "schema", schemaRapport())));
        JsonNode reponse;
        try {
            reponse = http.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + cle)
                    .header("Content-Type", "application/json")
                    .body(corps)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "L'évaluation a échoué : " + resumeErreur(e));
        }
        try {
            String contenu = reponse.path("choices").path(0).path("message").path("content").asText();
            JsonNode rapport = json.readTree(contenu);
            JsonNode usage = reponse.path("usage");
            return new Evaluation(rapport,
                    usage.path("prompt_tokens").asLong(0),
                    usage.path("completion_tokens").asLong(0));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Réponse d'évaluation illisible.");
        }
    }

    private static String resumeErreur(Exception e) {
        String message = e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage();
        return message.length() > 300 ? message.substring(0, 300) : message;
    }

    /** Schéma strict du rapport (tous les champs requis, pas de champ libre). */
    private static Map<String, Object> schemaRapport() {
        Map<String, Object> chaine = Map.of("type", "string");
        Map<String, Object> niveau = objet(Map.of(
                "niveau", Map.of("type", "string", "enum", List.of("A2", "B1", "B2", "C1")),
                "justification", chaine));
        Map<String, Object> erreur = objet(Map.of(
                "question", chaine,
                "reponse_candidat", chaine,
                "reponse_correcte", chaine,
                "theme", chaine));
        Map<String, Object> exactitude = objet(Map.of(
                "score", Map.of("type", "integer", "minimum", 0, "maximum", 20),
                "erreurs", Map.of("type", "array", "items", erreur)));
        Map<String, Object> note10 = objet(Map.of(
                "score", Map.of("type", "integer", "minimum", 0, "maximum", 10),
                "commentaire", chaine));
        Map<String, Object> avis = objet(Map.of(
                "avis", Map.of("type", "string", "enum", List.of("favorable", "réservé", "défavorable")),
                "motivation", chaine));
        Map<String, Object> verbatim = objet(Map.of(
                "extrait", chaine,
                "probleme", chaine));
        return objet(Map.of(
                "niveau_cecrl_estime", niveau,
                "exactitude_civique", exactitude,
                "coherence_recit", note10,
                "interaction", note10,
                "avis_simule", avis,
                "plan_revision", Map.of("type", "array", "items", chaine),
                "verbatims", Map.of("type", "array", "items", verbatim)));
    }

    private static Map<String, Object> objet(Map<String, Object> proprietes) {
        return Map.of(
                "type", "object",
                "properties", proprietes,
                "required", List.copyOf(proprietes.keySet()),
                "additionalProperties", false);
    }
}
