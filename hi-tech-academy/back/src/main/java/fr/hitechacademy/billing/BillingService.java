package fr.hitechacademy.billing;

import fr.hitechacademy.billing.BillingDtos.CreateDocumentRequest;
import fr.hitechacademy.billing.BillingDtos.LinePayload;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Émission des devis et factures : numérotation séquentielle annuelle sans
 * trou (obligation légale pour les factures), calcul des totaux HT / TVA /
 * TTC et conversion d'un devis accepté en facture.
 */
@Service
public class BillingService {

    /** Taux de TVA de l'organisme (assujetti au taux normal). */
    public static final BigDecimal DEFAULT_VAT_RATE = new BigDecimal("20.00");

    /** Délai de paiement des factures et durée de validité des devis (jours). */
    public static final int PAYMENT_AND_VALIDITY_DAYS = 30;

    private final BillingDocumentRepository repository;

    public BillingService(BillingDocumentRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<BillingDocument> list() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public BillingDocument get(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document introuvable"));
    }

    @Transactional
    public BillingDocument create(CreateDocumentRequest body) {
        if (body.serviceStartDate() != null && body.serviceEndDate() != null
                && body.serviceEndDate().isBefore(body.serviceStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La fin de la prestation doit être postérieure ou égale à son début");
        }

        BillingDocument d = new BillingDocument();
        d.setType(body.type());
        d.setRegistrationId(body.registrationId());
        d.setClientName(body.clientName().trim());
        d.setClientContactName(trimToNull(body.clientContactName()));
        d.setClientAddressLine(body.clientAddressLine().trim());
        d.setClientPostalCode(body.clientPostalCode().trim());
        d.setClientCity(body.clientCity().trim());
        d.setClientCountry(body.clientCountry() == null || body.clientCountry().isBlank()
                ? "France" : body.clientCountry().trim());
        d.setClientSiret(trimToNull(body.clientSiret()));
        d.setClientVatNumber(trimToNull(body.clientVatNumber()));
        d.setClientEmail(trimToNull(body.clientEmail()));
        d.setServiceStartDate(body.serviceStartDate());
        d.setServiceEndDate(body.serviceEndDate());
        d.setNotes(trimToNull(body.notes()));
        applyLines(d, body.lines());
        stamp(d, LocalDate.now());
        return repository.save(d);
    }

    /**
     * Convertit un devis en facture : mêmes client, lignes et prestation, mais
     * nouveau numéro de facture et nouvelles échéances. Le devis d'origine est
     * marqué accepté (la conversion vaut acceptation).
     */
    @Transactional
    public BillingDocument convertQuoteToInvoice(UUID quoteId) {
        BillingDocument quote = get(quoteId);
        if (quote.getType() != BillingDocumentType.QUOTE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seul un devis peut être converti en facture");
        }

        BillingDocument invoice = new BillingDocument();
        invoice.setType(BillingDocumentType.INVOICE);
        invoice.setRegistrationId(quote.getRegistrationId());
        invoice.setClientName(quote.getClientName());
        invoice.setClientContactName(quote.getClientContactName());
        invoice.setClientAddressLine(quote.getClientAddressLine());
        invoice.setClientPostalCode(quote.getClientPostalCode());
        invoice.setClientCity(quote.getClientCity());
        invoice.setClientCountry(quote.getClientCountry());
        invoice.setClientSiret(quote.getClientSiret());
        invoice.setClientVatNumber(quote.getClientVatNumber());
        invoice.setClientEmail(quote.getClientEmail());
        invoice.setServiceStartDate(quote.getServiceStartDate());
        invoice.setServiceEndDate(quote.getServiceEndDate());
        invoice.setNotes(quote.getNotes());
        invoice.setSourceQuoteNumber(quote.getNumber());
        for (BillingLine l : quote.getLines()) {
            BillingLine copy = new BillingLine();
            copy.setDescription(l.getDescription());
            copy.setQuantity(l.getQuantity());
            copy.setUnitPriceHt(l.getUnitPriceHt());
            copy.setVatRate(l.getVatRate());
            invoice.getLines().add(copy);
        }
        invoice.setTotalHt(quote.getTotalHt());
        invoice.setTotalVat(quote.getTotalVat());
        invoice.setTotalTtc(quote.getTotalTtc());
        stamp(invoice, LocalDate.now());

        quote.setStatus(BillingDocumentStatus.ACCEPTED);
        repository.save(quote);
        return repository.save(invoice);
    }

    /**
     * Change librement le statut (y compris en arrière : une facture marquée
     * payée par erreur peut revenir à émise / envoyée, la date de paiement
     * est alors effacée pour que le PDF ne porte plus la mention acquittée).
     */
    @Transactional
    public BillingDocument updateStatus(UUID id, BillingDocumentStatus status) {
        BillingDocument d = get(id);
        boolean quoteOnly = status == BillingDocumentStatus.ACCEPTED || status == BillingDocumentStatus.REFUSED;
        if (quoteOnly && d.getType() != BillingDocumentType.QUOTE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Statut réservé aux devis");
        }
        if (status == BillingDocumentStatus.PAID) {
            if (d.getType() != BillingDocumentType.INVOICE) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seule une facture peut être marquée payée");
            }
            d.setPaidAt(LocalDate.now());
        } else {
            d.setPaidAt(null);
        }
        d.setStatus(status);
        return repository.save(d);
    }

    /** Attribue numéro et dates d'émission / d'échéance ou de validité. */
    private void stamp(BillingDocument d, LocalDate issueDate) {
        d.setIssueDate(issueDate);
        if (d.getType() == BillingDocumentType.INVOICE) {
            d.setDueDate(issueDate.plusDays(PAYMENT_AND_VALIDITY_DAYS));
        } else {
            d.setValidUntil(issueDate.plusDays(PAYMENT_AND_VALIDITY_DAYS));
        }
        d.setNumber(nextNumber(d.getType(), issueDate));
    }

    /** Numéro suivant du préfixe annuel : FA-2026-0001, FA-2026-0002… */
    private String nextNumber(BillingDocumentType type, LocalDate issueDate) {
        String prefix = (type == BillingDocumentType.INVOICE ? "FA-" : "DE-") + issueDate.getYear() + "-";
        int next = repository.findLastByNumberPrefix(prefix)
                .map(last -> Integer.parseInt(last.getNumber().substring(prefix.length())) + 1)
                .orElse(1);
        return prefix + "%04d".formatted(next);
    }

    private void applyLines(BillingDocument d, List<LinePayload> lines) {
        BigDecimal totalHt = BigDecimal.ZERO;
        BigDecimal totalVat = BigDecimal.ZERO;
        for (LinePayload p : lines) {
            BillingLine line = new BillingLine();
            line.setDescription(p.description().trim());
            line.setQuantity(p.quantity());
            line.setUnitPriceHt(p.unitPriceHt());
            line.setVatRate(p.vatRate() != null ? p.vatRate() : DEFAULT_VAT_RATE);
            d.getLines().add(line);

            BigDecimal lineHt = p.unitPriceHt().multiply(p.quantity()).setScale(2, RoundingMode.HALF_UP);
            totalHt = totalHt.add(lineHt);
            totalVat = totalVat.add(lineHt.multiply(line.getVatRate())
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP));
        }
        d.setTotalHt(totalHt.setScale(2, RoundingMode.HALF_UP));
        d.setTotalVat(totalVat.setScale(2, RoundingMode.HALF_UP));
        d.setTotalTtc(totalHt.add(totalVat).setScale(2, RoundingMode.HALF_UP));
    }

    private static String trimToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
