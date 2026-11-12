package fr.hitechacademy.convention;

import fr.hitechacademy.convention.ConventionDtos.ConventionView;
import fr.hitechacademy.convention.ConventionDtos.CreateConventionRequest;
import fr.hitechacademy.convention.ConventionDtos.SignRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

/** Conventions de formation : génération côté front, signature des deux parties via Yousign. */
@RestController
@RequestMapping("/admin/conventions")
public class ConventionAdminController {

    private final ConventionService service;

    public ConventionAdminController(ConventionService service) {
        this.service = service;
    }

    @GetMapping
    public List<ConventionView> list() {
        return service.list().stream().map(ConventionView::of).toList();
    }

    @GetMapping("/{id}")
    public ConventionView get(@PathVariable UUID id) {
        return ConventionView.of(service.get(id));
    }

    @PostMapping
    public ConventionView create(@Valid @RequestBody CreateConventionRequest body) {
        return ConventionView.of(service.create(body));
    }

    /** Reçoit le PDF généré par l'admin + les champs de signature, et lance le circuit Yousign. */
    @PostMapping("/{id}/sign")
    public ConventionView sendForSignature(@PathVariable UUID id, @Valid @RequestBody SignRequest body) {
        return ConventionView.of(service.sendForSignature(id, decodePdf(body.pdfBase64()), body.signatureFields()));
    }

    /** Changement de statut manuel (conventions signées hors circuit Yousign). */
    @PostMapping("/{id}/status")
    public ConventionView updateStatus(@PathVariable UUID id,
            @Valid @RequestBody ConventionDtos.StatusUpdateRequest body) {
        return ConventionView.of(service.updateStatus(id, body.status()));
    }

    /** Resynchronise le statut de signature depuis Yousign (bouton « Actualiser »). */
    @PostMapping("/{id}/refresh")
    public ConventionView refresh(@PathVariable UUID id) {
        return ConventionView.of(service.refresh(id));
    }

    @PostMapping("/{id}/cancel")
    public ConventionView cancel(@PathVariable UUID id) {
        return ConventionView.of(service.cancel(id));
    }

    /** Suppression définitive, document signé archivé compris. */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    /** Dépôt manuel du document signé (scan papier ou signature hors Yousign). */
    @PostMapping("/{id}/signed-pdf")
    public ConventionView uploadSignedPdf(@PathVariable UUID id,
            @Valid @RequestBody ConventionDtos.UploadSignedPdfRequest body) {
        return ConventionView.of(service.attachSignedPdf(id, decodePdf(body.pdfBase64())));
    }

    /** PDF signé (signatures des deux parties et dossier de preuve Yousign). */
    @GetMapping("/{id}/signed-pdf")
    public ResponseEntity<byte[]> signedPdf(@PathVariable UUID id) {
        Convention c = service.get(id);
        if (c.getSignedPdf() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pas encore de document signé");
        }
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header("Content-Disposition",
                        "attachment; filename=\"Convention_" + c.getNumber() + "_signee.pdf\"")
                .body(c.getSignedPdf());
    }

    private static byte[] decodePdf(String base64) {
        final byte[] pdf;
        try {
            pdf = java.util.Base64.getDecoder().decode(base64);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PDF invalide (base64)");
        }
        if (pdf.length < 5 || pdf[0] != '%' || pdf[1] != 'P' || pdf[2] != 'D' || pdf[3] != 'F') {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le fichier joint n'est pas un PDF");
        }
        if (pdf.length > 10 * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PDF trop volumineux (max 10 Mo)");
        }
        return pdf;
    }
}
