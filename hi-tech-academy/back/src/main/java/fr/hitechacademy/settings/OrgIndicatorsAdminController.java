package fr.hitechacademy.settings;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.Instant;

/** Configuration des indicateurs de résultats globaux de l'organisme. */
@RestController
@RequestMapping("/admin/indicators")
public class OrgIndicatorsAdminController {

    public record IndicatorsPayload(
            @DecimalMin("0") @DecimalMax("100") BigDecimal satisfactionRate,
            @DecimalMin("0") @DecimalMax("100") BigDecimal recommendationRate,
            String basis) {}

    public record IndicatorsView(BigDecimal satisfactionRate, BigDecimal recommendationRate, String basis, Instant updatedAt) {
        static IndicatorsView of(OrgIndicators i) {
            return i == null
                    ? new IndicatorsView(null, null, null, null)
                    : new IndicatorsView(i.getSatisfactionRate(), i.getRecommendationRate(), i.getBasis(), i.getUpdatedAt());
        }
    }

    private final OrgIndicatorsRepository repository;

    public OrgIndicatorsAdminController(OrgIndicatorsRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public IndicatorsView get() {
        return IndicatorsView.of(repository.findFirstByOrderByUpdatedAtDesc().orElse(null));
    }

    @PostMapping
    @Transactional
    public IndicatorsView update(@Valid @RequestBody IndicatorsPayload body) {
        OrgIndicators i = repository.findFirstByOrderByUpdatedAtDesc().orElseGet(OrgIndicators::new);
        i.setSatisfactionRate(body.satisfactionRate());
        i.setRecommendationRate(body.recommendationRate());
        i.setBasis(body.basis() == null || body.basis().isBlank() ? null : body.basis().trim());
        i.setUpdatedAt(Instant.now());
        return IndicatorsView.of(repository.save(i));
    }
}
