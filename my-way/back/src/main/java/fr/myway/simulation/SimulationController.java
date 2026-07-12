package fr.myway.simulation;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.myway.user.UserAccount;
import fr.myway.user.UserAccountRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/simulations")
public class SimulationController {

    private final SimulationRepository simulations;
    private final UserAccountRepository users;
    private final ObjectMapper objectMapper;

    public SimulationController(SimulationRepository simulations, UserAccountRepository users, ObjectMapper objectMapper) {
        this.simulations = simulations;
        this.users = users;
        this.objectMapper = objectMapper;
    }

    public record SimulationRequest(
            String name,
            @NotNull Integer tjm,
            @NotNull Integer daysPerMonth,
            Integer monthlyExpenses,
            Double familyShares,
            Integer householdIncome,
            List<String> statusesCompared,
            Boolean acre,
            Boolean arce,
            Boolean are,
            JsonNode results) {}

    public record SimulationDto(
            Long id,
            String name,
            Integer tjm,
            Integer daysPerMonth,
            Integer monthlyExpenses,
            Double familyShares,
            Integer householdIncome,
            List<String> statusesCompared,
            Boolean acre,
            Boolean arce,
            Boolean are,
            JsonNode results,
            Instant createdDate) {}

    @GetMapping
    public List<SimulationDto> list(@RequestParam(required = false) Integer limit, Authentication authentication) {
        Long userId = userId(authentication);
        var sims = (limit != null && limit > 0)
                ? simulations.findByUserIdOrderByCreatedDateDesc(userId, PageRequest.of(0, limit))
                : simulations.findByUserIdOrderByCreatedDateDesc(userId);
        return sims.stream().map(this::toDto).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SimulationDto create(@Valid @RequestBody SimulationRequest request, Authentication authentication) {
        UserAccount user = users.findById(userId(authentication))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        Simulation sim = new Simulation();
        sim.setUser(user);
        sim.setName(request.name());
        sim.setTjm(request.tjm());
        sim.setDaysPerMonth(request.daysPerMonth());
        sim.setMonthlyExpenses(request.monthlyExpenses());
        sim.setFamilyShares(request.familyShares());
        sim.setHouseholdIncome(request.householdIncome());
        if (request.statusesCompared() != null) sim.setStatusesCompared(request.statusesCompared());
        sim.setAcre(request.acre());
        sim.setArce(request.arce());
        sim.setAre(request.are());
        if (request.results() != null && !request.results().isNull()) {
            sim.setResultsJson(request.results().toString());
        }
        simulations.save(sim);
        return toDto(sim);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        Simulation sim = simulations.findByIdAndUserId(id, userId(authentication))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        simulations.delete(sim);
        return ResponseEntity.noContent().build();
    }

    private Long userId(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return (Long) authentication.getPrincipal();
    }

    private SimulationDto toDto(Simulation sim) {
        JsonNode results = null;
        if (sim.getResultsJson() != null) {
            try {
                results = objectMapper.readTree(sim.getResultsJson());
            } catch (JsonProcessingException ignored) {
                // JSON illisible : on renvoie null plutôt que d'échouer la requête
            }
        }
        return new SimulationDto(
                sim.getId(), sim.getName(), sim.getTjm(), sim.getDaysPerMonth(),
                sim.getMonthlyExpenses(), sim.getFamilyShares(), sim.getHouseholdIncome(),
                sim.getStatusesCompared(), sim.getAcre(), sim.getArce(), sim.getAre(),
                results, sim.getCreatedDate()
        );
    }
}
