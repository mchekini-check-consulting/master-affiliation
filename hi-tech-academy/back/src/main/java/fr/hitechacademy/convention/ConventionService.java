package fr.hitechacademy.convention;

import fr.hitechacademy.convention.ConventionDtos.CreateConventionRequest;
import fr.hitechacademy.convention.ConventionDtos.SignatureFieldPayload;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ConventionService {

    /** Signataire côté organisme (gérant) : destinataire Yousign de la partie Hi-Tech Academy. */
    private static final String ORG_SIGNER_FIRST_NAME = "Mahdi";
    private static final String ORG_SIGNER_LAST_NAME = "CHEKINI";
    private static final String ORG_SIGNER_EMAIL = "contact@hi-techacademy.fr";

    private final ConventionRepository repository;
    private final YousignClient yousign;
    private final fr.hitechacademy.settings.OrgIndicatorsRepository indicatorsRepository;

    public ConventionService(ConventionRepository repository, YousignClient yousign,
            fr.hitechacademy.settings.OrgIndicatorsRepository indicatorsRepository) {
        this.repository = repository;
        this.yousign = yousign;
        this.indicatorsRepository = indicatorsRepository;
    }

    @Transactional(readOnly = true)
    public List<Convention> list() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Convention get(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Convention introuvable"));
    }

    @Transactional
    public Convention create(CreateConventionRequest body) {
        if (body.sessionEndDate().isBefore(body.sessionStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La fin de session doit être postérieure ou égale au début");
        }
        if (body.opcoFunded()) {
            // La clause suspensive exige les trois éléments : OPCO nommé, date
            // butoir, et sort de la prise en charge partielle (pas de flou).
            if (body.opcoName() == null || body.opcoName().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nom de l'OPCO requis (clause suspensive)");
            }
            if (body.opcoDeadline() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Date butoir de l'accord OPCO requise (clause suspensive)");
            }
            if (!body.opcoDeadline().isBefore(body.sessionStartDate())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "La date butoir OPCO doit précéder le début de la formation");
            }
            if (body.opcoPartialMode() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Choix requis en cas de prise en charge partielle : reliquat au client ou caducité");
            }
        }

        Convention c = new Convention();
        c.setIssueDate(LocalDate.now());
        c.setNumber(nextNumber(c.getIssueDate()));
        c.setFormationId(body.formationId());
        c.setFormationTitle(body.formationTitle());
        c.setClientName(body.clientName());
        c.setClientRepresentativeName(body.clientRepresentativeName());
        c.setClientAddressLine(body.clientAddressLine());
        c.setClientPostalCode(body.clientPostalCode());
        c.setClientCity(body.clientCity());
        c.setClientSiret(body.clientSiret());
        c.setSignerFirstName(body.signerFirstName());
        c.setSignerLastName(body.signerLastName());
        c.setSignerEmail(body.signerEmail());
        c.setSessionStartDate(body.sessionStartDate());
        c.setSessionEndDate(body.sessionEndDate());
        c.setScheduleText(body.scheduleText());
        c.setParticipants(body.participants() == null ? new ArrayList<>()
                : body.participants().stream().filter(p -> p != null && !p.isBlank()).toList());
        c.setPriceHt(body.priceHt());
        c.setPriceTtc(body.priceTtc());
        c.setOpcoFunded(body.opcoFunded());
        c.setOpcoName(body.opcoFunded() ? body.opcoName() : null);
        c.setOpcoDeadline(body.opcoFunded() ? body.opcoDeadline() : null);
        c.setOpcoPartialMode(body.opcoFunded() ? body.opcoPartialMode() : null);
        c.setRegistrationId(body.registrationId());
        // Indicateurs globaux de l'organisme figés à la création : le document
        // émis reste identique quand la configuration évolue ensuite.
        indicatorsRepository.findFirstByOrderByUpdatedAtDesc().ifPresent(i -> {
            c.setSatisfactionRate(i.getSatisfactionRate());
            c.setRecommendationRate(i.getRecommendationRate());
            c.setIndicatorsBasis(i.getBasis());
        });
        return repository.save(c);
    }

    /** Envoie la convention en signature : Yousign notifie les deux signataires par email. */
    @Transactional
    public Convention sendForSignature(UUID id, byte[] pdf, List<SignatureFieldPayload> fields) {
        Convention c = get(id);
        if (c.getStatus() != ConventionStatus.DRAFT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cette convention est déjà partie en signature (statut " + c.getStatus() + ")");
        }

        List<YousignClient.SignerField> orgFields = fieldsOf(fields, "ORGANIZATION");
        List<YousignClient.SignerField> clientFields = fieldsOf(fields, "CLIENT");
        if (orgFields.isEmpty() || clientFields.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Champs de signature manquants pour l'une des deux parties");
        }

        String requestId = yousign.createAndActivate(
                "Convention " + c.getNumber() + " — " + c.getFormationTitle(),
                pdf,
                "Convention_" + c.getNumber() + ".pdf",
                List.of(
                        new YousignClient.Signer(
                                ORG_SIGNER_FIRST_NAME, ORG_SIGNER_LAST_NAME, ORG_SIGNER_EMAIL, orgFields),
                        new YousignClient.Signer(
                                c.getSignerFirstName(), c.getSignerLastName(), c.getSignerEmail(), clientFields)));

        c.setYousignRequestId(requestId);
        c.setYousignStatus("ongoing");
        c.setStatus(ConventionStatus.SENT);
        c.setSentAt(Instant.now());
        return c;
    }

    /** Resynchronise le statut depuis Yousign ; stocke le PDF signé quand le circuit est terminé. */
    @Transactional
    public Convention refresh(UUID id) {
        Convention c = get(id);
        if (c.getYousignRequestId() == null || c.getStatus() == ConventionStatus.SIGNED) {
            return c;
        }
        String status = yousign.getStatus(c.getYousignRequestId());
        c.setYousignStatus(status);
        switch (status) {
            case "done" -> {
                if (c.getSignedPdf() == null) {
                    c.setSignedPdf(yousign.downloadSignedDocuments(c.getYousignRequestId()));
                }
                c.setStatus(ConventionStatus.SIGNED);
                c.setSignedAt(Instant.now());
            }
            case "declined", "rejected" -> c.setStatus(ConventionStatus.DECLINED);
            case "expired" -> c.setStatus(ConventionStatus.EXPIRED);
            case "canceled" -> c.setStatus(ConventionStatus.CANCELED);
            default -> c.setStatus(ConventionStatus.SENT); // draft, ongoing, approval…
        }
        return c;
    }

    /**
     * Changement de statut manuel depuis l'admin : tant que le circuit de
     * signature électronique n'est pas systématique (conventions signées sur
     * papier ou hors Yousign), l'admin reste maître du statut. Aucun appel
     * Yousign ici ; « Actualiser » reste la voie de synchronisation pour les
     * conventions réellement parties chez Yousign.
     */
    @Transactional
    public Convention updateStatus(UUID id, ConventionStatus status) {
        Convention c = get(id);
        c.setStatus(status);
        if (status == ConventionStatus.SENT && c.getSentAt() == null) {
            c.setSentAt(Instant.now());
        }
        if (status == ConventionStatus.SIGNED && c.getSignedAt() == null) {
            c.setSignedAt(Instant.now());
        }
        return c;
    }

    @Transactional
    public Convention cancel(UUID id) {
        Convention c = get(id);
        if (c.getStatus() == ConventionStatus.SIGNED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Une convention signée ne s'annule pas");
        }
        if (c.getStatus() == ConventionStatus.SENT && c.getYousignRequestId() != null) {
            yousign.cancel(c.getYousignRequestId());
        }
        c.setStatus(ConventionStatus.CANCELED);
        return c;
    }

    private List<YousignClient.SignerField> fieldsOf(List<SignatureFieldPayload> fields, String signer) {
        return fields.stream()
                .filter(f -> signer.equalsIgnoreCase(f.signer()))
                .map(f -> new YousignClient.SignerField(f.page(), f.x(), f.y(), f.width(), f.height()))
                .toList();
    }

    private String nextNumber(LocalDate issueDate) {
        String prefix = "CV-" + issueDate.getYear() + "-";
        int next = repository.findLastByNumberPrefix(prefix)
                .map(c -> Integer.parseInt(c.getNumber().substring(prefix.length())) + 1)
                .orElse(1);
        return prefix + String.format("%04d", next);
    }
}
