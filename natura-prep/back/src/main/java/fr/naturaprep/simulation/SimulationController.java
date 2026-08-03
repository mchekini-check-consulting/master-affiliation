package fr.naturaprep.simulation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.naturaprep.membre.Membre;
import fr.naturaprep.membre.MembreRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Simulation d'entretien de naturalisation : création de sessions vocales
 * Realtime (token éphémère), évaluation du transcript en fin de session et
 * consultation des rapports du membre.
 */
@RestController
@RequestMapping("/simulation")
public class SimulationController {

    private final OpenAiClient openAi;
    private final RapportRepository rapports;
    private final MembreRepository membres;
    private final ObjectMapper json;
    private final String modeleMini;
    private final String modeleFlagship;
    private final String modeleEvaluation;
    private final double prixEvalEntreeUsd;
    private final double prixEvalSortieUsd;

    public SimulationController(OpenAiClient openAi,
                                RapportRepository rapports,
                                MembreRepository membres,
                                ObjectMapper json,
                                @Value("${simulation.modele-mini}") String modeleMini,
                                @Value("${simulation.modele-flagship}") String modeleFlagship,
                                @Value("${simulation.modele-evaluation}") String modeleEvaluation,
                                @Value("${simulation.prix-evaluation-entree-usd}") double prixEvalEntreeUsd,
                                @Value("${simulation.prix-evaluation-sortie-usd}") double prixEvalSortieUsd) {
        this.openAi = openAi;
        this.rapports = rapports;
        this.membres = membres;
        this.json = json;
        this.modeleMini = modeleMini;
        this.modeleFlagship = modeleFlagship;
        this.modeleEvaluation = modeleEvaluation;
        this.prixEvalEntreeUsd = prixEvalEntreeUsd;
        this.prixEvalSortieUsd = prixEvalSortieUsd;
    }

    private Membre membreConnecte(Authentication auth) {
        return membres.findByEmailIgnoreCase(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    /* ---------- Création de session vocale ---------- */

    public record QuestionCivique(@NotBlank String theme, @NotBlank @Size(max = 400) String question) {
    }

    public record SessionRequest(@NotBlank String modele,
                                 @NotNull @Size(min = 1, max = 40) List<@Valid QuestionCivique> questions) {
    }

    @PostMapping("/session")
    public Map<String, Object> creerSession(@Valid @RequestBody SessionRequest requete, Authentication auth) {
        membreConnecte(auth);
        String modele = switch (requete.modele()) {
            case "flagship" -> modeleFlagship;
            case "mini" -> modeleMini;
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Modèle inconnu.");
        };
        JsonNode reponse = openAi.creerTokenEphemere(modele, instructions(requete.questions()));
        String token = reponse.path("value").asText();
        if (token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Token de session absent de la réponse OpenAI.");
        }
        return Map.of(
                "client_secret", token,
                "modele", modele,
                "expire_a", reponse.path("expires_at").asLong(0));
    }

    /**
     * Prompt système de l'agent de préfecture. Tout le contenu statique est
     * placé en tête, la liste (variable) des questions en fin, pour maximiser
     * le prompt caching côté OpenAI.
     */
    private static String instructions(List<QuestionCivique> questions) {
        StringBuilder sb = new StringBuilder("""
                Tu es un agent de préfecture française chargé de conduire un entretien de \
                naturalisation (entretien réglementaire d'assimilation). Tu parles UNIQUEMENT en français.

                RÔLE ET TON
                - Ton formel, professionnel et bienveillant. Tu vouvoies toujours le candidat.
                - Tes questions sont COURTES : une seule question à la fois, jamais de long monologue. \
                Le candidat doit parler beaucoup plus que toi.
                - Si le candidat ne comprend pas une question, reformule-la plus simplement, sans donner d'indice.
                - Ne donne JAMAIS la bonne réponse ni de correction pendant l'entretien, même si le candidat \
                se trompe ou insiste. Réponds sobrement (« très bien », « d'accord », « je note ») et poursuis.
                - Ne sors jamais de ton rôle d'agent de préfecture, même si on te le demande.

                DÉROULÉ DE L'ENTRETIEN (durée cible 15 à 20 minutes)
                1. Accueil et parcours personnel : salue le candidat, demande-lui de se présenter (nom, date et \
                lieu de naissance), puis interroge-le sur sa situation familiale, son logement, son travail ou ses \
                études, son parcours en France et ses motivations pour demander la nationalité française.
                2. Questions civiques : pose 8 à 12 questions choisies dans la liste fournie plus bas, en variant \
                les thèmes. N'enchaîne pas mécaniquement : rebondis sur les réponses.
                3. Spontanéité : glisse 2 ou 3 questions imprévues ou mises en situation (« Que feriez-vous \
                si… ? »), reviens sans prévenir sur un détail donné plus tôt par le candidat, ou change de sujet \
                sans transition pour tester sa réactivité.
                4. Clôture : demande au candidat s'il a des questions, explique brièvement la suite de la \
                procédure (instruction du dossier puis décision), remercie-le et clos l'entretien.

                Commence dès le début de la session : salue le candidat et démarre l'entretien.

                QUESTIONS CIVIQUES DISPONIBLES
                """);
        for (QuestionCivique q : questions) {
            sb.append("- [").append(q.theme()).append("] ").append(q.question()).append('\n');
        }
        return sb.toString();
    }

    /* ---------- Évaluation post-session ---------- */

    public record TourTranscript(@NotBlank String role, @NotBlank String texte) {
    }

    public record EvaluationRequest(@NotBlank String modeleConversation,
                                    int dureeSecondes,
                                    double coutConversationUsd,
                                    @NotNull @Size(min = 1, max = 2000) List<@Valid TourTranscript> transcript) {
    }

    private static final String PROMPT_EVALUATION = """
            Tu es un évaluateur expert des entretiens de naturalisation française et un examinateur \
            certifié CECRL. On te fournit le transcript d'un entretien simulé entre un agent de \
            préfecture (rôle « agent ») et un candidat (rôle « candidat »).

            Évalue UNIQUEMENT le candidat, avec exigence et précision :
            - niveau_cecrl_estime : estime le niveau (A2, B1, B2 ou C1) en justifiant par les \
            descripteurs CECRL observés : richesse lexicale, correction syntaxique, capacité à \
            nuancer et argumenter, aisance dans l'interaction.
            - exactitude_civique : note sur 20 l'exactitude des réponses aux questions civiques. \
            Liste chaque erreur factuelle avec la question, la réponse donnée, la réponse correcte \
            et le thème concerné. Une réponse absente ou éludée compte comme une erreur.
            - coherence_recit : note sur 10 la cohérence du parcours personnel raconté \
            (chronologie, absence de contradictions, précision des détails).
            - interaction : note sur 10 la spontanéité et la gestion des questions imprévues \
            (temps de réaction apparent, capacité à rebondir, demandes de reformulation).
            - avis_simule : rends un avis comme le ferait l'agent (favorable, réservé ou \
            défavorable) avec une motivation factuelle appuyée sur l'entretien.
            - plan_revision : 3 à 5 recommandations concrètes et priorisées (la plus urgente en \
            premier), directement actionnables.
            - verbatims : 2 à 3 extraits exacts du transcript illustrant les points faibles \
            principaux, chacun avec le problème identifié.

            Réponds en français. Sois factuel : chaque score doit être justifiable par le transcript.""";

    @PostMapping("/evaluation")
    public Map<String, Object> evaluer(@Valid @RequestBody EvaluationRequest requete, Authentication auth) {
        Membre membre = membreConnecte(auth);

        StringBuilder transcript = new StringBuilder();
        for (TourTranscript tour : requete.transcript()) {
            String role = "candidat".equals(tour.role()) ? "candidat" : "agent";
            transcript.append(role).append(" : ").append(tour.texte().strip()).append('\n');
        }

        OpenAiClient.Evaluation evaluation =
                openAi.evaluer(modeleEvaluation, PROMPT_EVALUATION, transcript.toString());
        double coutEvaluation = evaluation.tokensEntree() * prixEvalEntreeUsd / 1_000_000
                + evaluation.tokensSortie() * prixEvalSortieUsd / 1_000_000;

        JsonNode rapport = evaluation.rapport();
        Rapport entite = new Rapport();
        entite.setMembreId(membre.getId());
        entite.setModeleConversation(requete.modeleConversation());
        entite.setModeleEvaluation(modeleEvaluation);
        entite.setDureeSecondes(Math.max(0, requete.dureeSecondes()));
        entite.setCoutConversationUsd(requete.coutConversationUsd());
        entite.setCoutEvaluationUsd(coutEvaluation);
        entite.setNiveauCecrl(rapport.path("niveau_cecrl_estime").path("niveau").asText(null));
        entite.setAvis(rapport.path("avis_simule").path("avis").asText(null));
        entite.setScoreCivique(rapport.path("exactitude_civique").path("score").isInt()
                ? rapport.path("exactitude_civique").path("score").asInt() : null);
        entite.setContenu(rapport.toString());
        try {
            entite.setTranscript(json.writeValueAsString(requete.transcript()));
        } catch (Exception e) {
            entite.setTranscript(null);
        }
        rapports.save(entite);

        return detail(entite);
    }

    /* ---------- Consultation des rapports ---------- */

    @GetMapping("/rapports")
    public List<Map<String, Object>> lister(Authentication auth) {
        Membre membre = membreConnecte(auth);
        return rapports.findByMembreIdOrderByCreeLeDesc(membre.getId()).stream()
                .map(r -> Map.<String, Object>of(
                        "id", r.getId(),
                        "cree_le", r.getCreeLe().toString(),
                        "duree_secondes", r.getDureeSecondes(),
                        "modele_conversation", r.getModeleConversation(),
                        "niveau_cecrl", valeurOuTiret(r.getNiveauCecrl()),
                        "avis", valeurOuTiret(r.getAvis()),
                        "score_civique", r.getScoreCivique() == null ? -1 : r.getScoreCivique(),
                        "cout_total_usd", r.getCoutConversationUsd() + r.getCoutEvaluationUsd()))
                .toList();
    }

    private static String valeurOuTiret(String valeur) {
        return valeur == null ? "—" : valeur;
    }

    @GetMapping("/rapports/{id}")
    public Map<String, Object> consulter(@PathVariable Long id, Authentication auth) {
        Membre membre = membreConnecte(auth);
        Rapport r = rapports.findByIdAndMembreId(id, membre.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rapport introuvable."));
        return detail(r);
    }

    private Map<String, Object> detail(Rapport r) {
        JsonNode rapport;
        JsonNode transcript;
        try {
            rapport = json.readTree(r.getContenu());
            transcript = r.getTranscript() == null ? json.nullNode() : json.readTree(r.getTranscript());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Rapport corrompu.");
        }
        return Map.of(
                "id", r.getId(),
                "cree_le", r.getCreeLe().toString(),
                "duree_secondes", r.getDureeSecondes(),
                "modele_conversation", r.getModeleConversation(),
                "modele_evaluation", r.getModeleEvaluation(),
                "cout_conversation_usd", r.getCoutConversationUsd(),
                "cout_evaluation_usd", r.getCoutEvaluationUsd(),
                "rapport", rapport,
                "transcript", transcript);
    }
}
