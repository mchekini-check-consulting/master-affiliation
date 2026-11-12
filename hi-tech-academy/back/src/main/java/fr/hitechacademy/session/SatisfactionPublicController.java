package fr.hitechacademy.session;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Réponse publique aux questionnaires de satisfaction : le lien emailé porte
 * l'UUID de l'invitation (satisfaction_responses), qui sert de jeton d'accès
 * comme pour les autres questionnaires du parcours d'inscription.
 */
@RestController
@RequestMapping("/satisfaction")
public class SatisfactionPublicController {

    public record ContextView(String kind, String recipientName, String formationTitle, boolean submitted) {}

    public record SubmitRequest(@NotNull Map<String, Object> answers) {}

    private final SatisfactionResponseRepository responses;
    private final ObjectMapper mapper;

    public SatisfactionPublicController(SatisfactionResponseRepository responses, ObjectMapper mapper) {
        this.responses = responses;
        this.mapper = mapper;
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ContextView context(@PathVariable UUID id) {
        SatisfactionResponse r = find(id);
        return new ContextView(r.getKind(), r.getRecipientName(),
                r.getRegistration().getFormationTitle(), r.getSubmittedAt() != null);
    }

    @PostMapping("/{id}")
    @Transactional
    public void submit(@PathVariable UUID id, @RequestBody SubmitRequest body) {
        SatisfactionResponse r = find(id);
        if (r.getSubmittedAt() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ce questionnaire a déjà été renseigné, merci !");
        }
        if (body.answers() == null || body.answers().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Réponses manquantes");
        }
        try {
            r.setAnswers(mapper.writeValueAsString(body.answers()));
        } catch (com.fasterxml.jackson.core.JacksonException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Réponses illisibles");
        }
        r.setSubmittedAt(Instant.now());
    }

    private SatisfactionResponse find(UUID id) {
        return responses.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Questionnaire introuvable"));
    }
}
