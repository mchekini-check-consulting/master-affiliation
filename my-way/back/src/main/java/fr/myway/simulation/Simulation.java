package fr.myway.simulation;

import fr.myway.user.UserAccount;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "simulations")
public class Simulation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;

    private String name;

    @Column(nullable = false)
    private Integer tjm;

    @Column(nullable = false)
    private Integer daysPerMonth;

    private Integer monthlyExpenses;
    private Double familyShares;
    private Integer householdIncome;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "simulation_statuses", joinColumns = @JoinColumn(name = "simulation_id"))
    @Column(name = "status")
    private List<String> statusesCompared = new ArrayList<>();

    private Boolean acre;
    private Boolean arce;
    private Boolean are;

    // Résultats bruts de la simulation (JSON produit par le front)
    @Column(columnDefinition = "text")
    private String resultsJson;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdDate;

    public Long getId() { return id; }
    public UserAccount getUser() { return user; }
    public void setUser(UserAccount user) { this.user = user; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getTjm() { return tjm; }
    public void setTjm(Integer tjm) { this.tjm = tjm; }
    public Integer getDaysPerMonth() { return daysPerMonth; }
    public void setDaysPerMonth(Integer daysPerMonth) { this.daysPerMonth = daysPerMonth; }
    public Integer getMonthlyExpenses() { return monthlyExpenses; }
    public void setMonthlyExpenses(Integer monthlyExpenses) { this.monthlyExpenses = monthlyExpenses; }
    public Double getFamilyShares() { return familyShares; }
    public void setFamilyShares(Double familyShares) { this.familyShares = familyShares; }
    public Integer getHouseholdIncome() { return householdIncome; }
    public void setHouseholdIncome(Integer householdIncome) { this.householdIncome = householdIncome; }
    public List<String> getStatusesCompared() { return statusesCompared; }
    public void setStatusesCompared(List<String> statusesCompared) { this.statusesCompared = statusesCompared; }
    public Boolean getAcre() { return acre; }
    public void setAcre(Boolean acre) { this.acre = acre; }
    public Boolean getArce() { return arce; }
    public void setArce(Boolean arce) { this.arce = arce; }
    public Boolean getAre() { return are; }
    public void setAre(Boolean are) { this.are = are; }
    public String getResultsJson() { return resultsJson; }
    public void setResultsJson(String resultsJson) { this.resultsJson = resultsJson; }
    public Instant getCreatedDate() { return createdDate; }
}
