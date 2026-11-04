package fr.hitechacademy.convention;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Client minimal de l'API Yousign v3 (signature électronique).
 *
 * Environnements : sandbox par défaut (documents marqués « specimen », aucune
 * valeur légale) ; passer en production se fait par les variables d'environnement
 * YOUSIGN_BASE_URL=https://api.yousign.app/v3 et YOUSIGN_API_KEY=<clé prod>.
 *
 * Flux : création de la signature request → upload du PDF → ajout des deux
 * signataires avec leurs champs de signature (coordonnées calculées par le
 * générateur PDF du front, origine en haut à gauche, points 72 dpi) →
 * activation (Yousign envoie les invitations par email, OTP par email).
 */
@Component
public class YousignClient {

    private final String baseUrl;
    private final String apiKey;
    private final ObjectMapper mapper;
    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public YousignClient(
            @Value("${app.yousign.base-url}") String baseUrl,
            @Value("${app.yousign.api-key}") String apiKey,
            ObjectMapper mapper) {
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.apiKey = apiKey;
        this.mapper = mapper;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    private void requireConfigured() {
        if (!isConfigured()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Yousign n'est pas configuré : renseignez la variable d'environnement YOUSIGN_API_KEY");
        }
    }

    public record SignerField(int page, int x, int y, int width, int height) {}

    public record Signer(String firstName, String lastName, String email, List<SignerField> fields) {}

    /** Crée la demande, pousse le document et les signataires, puis l'active. Retourne l'id Yousign. */
    public String createAndActivate(String requestName, byte[] pdf, String pdfFileName, List<Signer> signers) {
        requireConfigured();

        JsonNode request = postJson("/signature_requests", Map.of(
                "name", requestName,
                "delivery_mode", "email",
                "timezone", "Europe/Paris"));
        String requestId = request.path("id").asText();

        JsonNode document = postMultipartPdf(
                "/signature_requests/" + requestId + "/documents", pdf, pdfFileName);
        String documentId = document.path("id").asText();

        for (Signer signer : signers) {
            List<Map<String, Object>> fields = new ArrayList<>();
            for (SignerField f : signer.fields()) {
                fields.add(Map.of(
                        "document_id", documentId,
                        "type", "signature",
                        "page", f.page(),
                        "x", f.x(),
                        "y", f.y(),
                        "width", f.width(),
                        "height", f.height()));
            }
            postJson("/signature_requests/" + requestId + "/signers", Map.of(
                    "info", Map.of(
                            "first_name", signer.firstName(),
                            "last_name", signer.lastName(),
                            "email", signer.email(),
                            "locale", "fr"),
                    "signature_level", "electronic_signature",
                    "signature_authentication_mode", "otp_email",
                    "fields", fields));
        }

        postJson("/signature_requests/" + requestId + "/activate", null);
        return requestId;
    }

    /** Statut courant de la demande : ongoing, done, declined, expired, canceled… */
    public String getStatus(String requestId) {
        requireConfigured();
        return getJson("/signature_requests/" + requestId).path("status").asText();
    }

    /** Document signé (PDF binaire, signatures et dossier de preuve Yousign inclus). */
    public byte[] downloadSignedDocuments(String requestId) {
        requireConfigured();
        HttpRequest req = builder("/signature_requests/" + requestId + "/documents/download").GET().build();
        HttpResponse<byte[]> response = send(req, HttpResponse.BodyHandlers.ofByteArray());
        checkOk(response.statusCode(), "téléchargement du document signé",
                new String(response.body(), StandardCharsets.UTF_8));
        return response.body();
    }

    /** Annule une demande active (les liens de signature deviennent invalides). */
    public void cancel(String requestId) {
        requireConfigured();
        postJson("/signature_requests/" + requestId + "/cancel",
                Map.of("reason", "other", "custom_note", "Annulée depuis l'administration Hi-Tech Academy"));
    }

    // --- Plomberie HTTP --------------------------------------------------

    private HttpRequest.Builder builder(String path) {
        return HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + path))
                .timeout(Duration.ofSeconds(30))
                .header("Authorization", "Bearer " + apiKey);
    }

    private JsonNode postJson(String path, Object body) {
        try {
            HttpRequest.BodyPublisher publisher = body == null
                    ? HttpRequest.BodyPublishers.ofString("")
                    : HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body));
            HttpRequest req = builder(path)
                    .header("Content-Type", "application/json")
                    .POST(publisher)
                    .build();
            HttpResponse<String> response = send(req, HttpResponse.BodyHandlers.ofString());
            checkOk(response.statusCode(), "appel " + path, response.body());
            return response.body().isBlank() ? mapper.nullNode() : mapper.readTree(response.body());
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Yousign : réponse illisible (" + path + ")", e);
        }
    }

    private JsonNode getJson(String path) {
        try {
            HttpRequest req = builder(path).GET().build();
            HttpResponse<String> response = send(req, HttpResponse.BodyHandlers.ofString());
            checkOk(response.statusCode(), "appel " + path, response.body());
            return mapper.readTree(response.body());
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Yousign : réponse illisible (" + path + ")", e);
        }
    }

    /** Upload multipart du PDF (champs `file` et `nature=signable_document`). */
    private JsonNode postMultipartPdf(String path, byte[] pdf, String fileName) {
        try {
            String boundary = "hta-" + UUID.randomUUID();
            var out = new java.io.ByteArrayOutputStream();
            String head = "--" + boundary + "\r\n"
                    + "Content-Disposition: form-data; name=\"file\"; filename=\"" + fileName + "\"\r\n"
                    + "Content-Type: application/pdf\r\n\r\n";
            String nature = "\r\n--" + boundary + "\r\n"
                    + "Content-Disposition: form-data; name=\"nature\"\r\n\r\n"
                    + "signable_document";
            String tail = "\r\n--" + boundary + "--\r\n";
            out.write(head.getBytes(StandardCharsets.UTF_8));
            out.write(pdf);
            out.write(nature.getBytes(StandardCharsets.UTF_8));
            out.write(tail.getBytes(StandardCharsets.UTF_8));

            HttpRequest req = builder(path)
                    .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(out.toByteArray()))
                    .build();
            HttpResponse<String> response = send(req, HttpResponse.BodyHandlers.ofString());
            checkOk(response.statusCode(), "upload du document", response.body());
            return mapper.readTree(response.body());
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Yousign : réponse illisible (upload)", e);
        }
    }

    private <T> HttpResponse<T> send(HttpRequest req, HttpResponse.BodyHandler<T> handler) {
        try {
            return http.send(req, handler);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Yousign injoignable : " + e.getMessage(), e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Yousign : appel interrompu", e);
        }
    }

    private void checkOk(int status, String action, String body) {
        if (status < 200 || status >= 300) {
            String detail = body == null ? "" : body.substring(0, Math.min(body.length(), 300));
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Yousign : échec de l'" + action + " (HTTP " + status + ") " + detail);
        }
    }
}
