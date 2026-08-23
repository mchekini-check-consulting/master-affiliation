package fr.hitechacademy.billing;

import fr.hitechacademy.archive.ArchivedPdfKind;
import fr.hitechacademy.archive.ArchivedPdfService;
import fr.hitechacademy.billing.BillingDtos.CreateDocumentRequest;
import fr.hitechacademy.billing.BillingDtos.DocumentView;
import fr.hitechacademy.billing.BillingDtos.SendRequest;
import fr.hitechacademy.billing.BillingDtos.StatusUpdateRequest;
import fr.hitechacademy.mail.MailService;
import jakarta.validation.Valid;
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
import java.util.List;
import java.util.UUID;

/**
 * Espace admin (basic auth) : émission des devis et factures, envoi par
 * email au client (PDF généré côté front, archivé tel qu'émis) et suivi
 * des statuts (envoyé, accepté, payé…).
 */
@RestController
@RequestMapping("/admin/billing")
public class BillingAdminController {

    private final BillingService billingService;
    private final BillingDocumentRepository repository;
    private final MailService mailService;
    private final ArchivedPdfService archivedPdfService;

    public BillingAdminController(BillingService billingService, BillingDocumentRepository repository,
                                  MailService mailService, ArchivedPdfService archivedPdfService) {
        this.billingService = billingService;
        this.repository = repository;
        this.mailService = mailService;
        this.archivedPdfService = archivedPdfService;
    }

    @GetMapping("/documents")
    public List<DocumentView> list() {
        return billingService.list().stream().map(DocumentView::from).toList();
    }

    @GetMapping("/documents/{id}")
    public DocumentView get(@PathVariable UUID id) {
        return DocumentView.from(billingService.get(id));
    }

    @PostMapping("/documents")
    public DocumentView create(@Valid @RequestBody CreateDocumentRequest body) {
        return DocumentView.from(billingService.create(body));
    }

    @PostMapping("/documents/{id}/status")
    public DocumentView updateStatus(@PathVariable UUID id, @Valid @RequestBody StatusUpdateRequest body) {
        return DocumentView.from(billingService.updateStatus(id, body.status()));
    }

    /** Convertit un devis en facture (nouveau numéro FA, devis marqué accepté). */
    @PostMapping("/documents/{id}/invoice")
    public DocumentView convertToInvoice(@PathVariable UUID id) {
        return DocumentView.from(billingService.convertQuoteToInvoice(id));
    }

    // Archivage du PDF sans envoi (visualisation / téléchargement dans
    // l'admin). N'écrase jamais une copie existante : le PDF archivé lors
    // d'un envoi reste la référence « telle qu'émise ».
    @PostMapping("/documents/{id}/archive")
    public void archive(@PathVariable UUID id, @Valid @RequestBody SendRequest body) {
        BillingDocument d = billingService.get(id);
        archivedPdfService.archiveIfAbsent(kindOf(d), d.getId(), decodePdf(body.pdfBase64()));
    }

    // Envoi du document (PDF généré côté front) au client par email.
    // Le PDF est archivé tel qu'émis (traçabilité + inclus dans les sauvegardes).
    @PostMapping("/documents/{id}/send")
    @Transactional
    public DocumentView send(@PathVariable UUID id, @Valid @RequestBody SendRequest body) {
        BillingDocument d = billingService.get(id);
        String recipient = body.recipientEmail() != null && !body.recipientEmail().isBlank()
                ? body.recipientEmail().trim()
                : d.getClientEmail();
        if (recipient == null || recipient.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Aucune adresse email : renseignez l'email du client ou un destinataire");
        }
        byte[] pdf = decodePdf(body.pdfBase64());
        archivedPdfService.archive(kindOf(d), d.getId(), pdf);
        mailService.sendBillingDocument(recipient, d, pdf, fileName(d));

        d.setLastSentTo(recipient);
        d.setSentAt(Instant.now());
        if (d.getStatus() == BillingDocumentStatus.ISSUED) {
            d.setStatus(BillingDocumentStatus.SENT);
        }
        return DocumentView.from(repository.save(d));
    }

    private static ArchivedPdfKind kindOf(BillingDocument d) {
        return d.getType() == BillingDocumentType.INVOICE ? ArchivedPdfKind.INVOICE : ArchivedPdfKind.QUOTE;
    }

    private static String fileName(BillingDocument d) {
        String label = d.getType() == BillingDocumentType.INVOICE ? "Facture" : "Devis";
        return label + "_" + d.getNumber() + "_Hi-Tech_Academy.pdf";
    }

    /** Décode le PDF base64 du front en validant l'en-tête et la taille (max 5 Mo). */
    private static byte[] decodePdf(String base64) {
        byte[] pdf;
        try {
            pdf = java.util.Base64.getDecoder().decode(base64);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PDF invalide (base64)");
        }
        if (pdf.length < 5 || pdf[0] != '%' || pdf[1] != 'P' || pdf[2] != 'D' || pdf[3] != 'F') {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le fichier joint n'est pas un PDF");
        }
        if (pdf.length > 5 * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PDF trop volumineux (max 5 Mo)");
        }
        return pdf;
    }
}
