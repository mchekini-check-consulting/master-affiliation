package fr.myway.user;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class UserAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String fullName;

    private String city;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_specialties", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "specialty")
    private List<String> specialties = new ArrayList<>();

    private String currentStatus;
    private Integer desiredTjm;
    private Integer daysPerMonth;
    private Double familyShares;
    private Integer householdIncome;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_goals", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "goal")
    private List<String> goals = new ArrayList<>();

    @Column(nullable = false)
    private boolean onboardingCompleted = false;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdDate;

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public List<String> getSpecialties() { return specialties; }
    public void setSpecialties(List<String> specialties) { this.specialties = specialties; }
    public String getCurrentStatus() { return currentStatus; }
    public void setCurrentStatus(String currentStatus) { this.currentStatus = currentStatus; }
    public Integer getDesiredTjm() { return desiredTjm; }
    public void setDesiredTjm(Integer desiredTjm) { this.desiredTjm = desiredTjm; }
    public Integer getDaysPerMonth() { return daysPerMonth; }
    public void setDaysPerMonth(Integer daysPerMonth) { this.daysPerMonth = daysPerMonth; }
    public Double getFamilyShares() { return familyShares; }
    public void setFamilyShares(Double familyShares) { this.familyShares = familyShares; }
    public Integer getHouseholdIncome() { return householdIncome; }
    public void setHouseholdIncome(Integer householdIncome) { this.householdIncome = householdIncome; }
    public List<String> getGoals() { return goals; }
    public void setGoals(List<String> goals) { this.goals = goals; }
    public boolean isOnboardingCompleted() { return onboardingCompleted; }
    public void setOnboardingCompleted(boolean onboardingCompleted) { this.onboardingCompleted = onboardingCompleted; }
    public Instant getCreatedDate() { return createdDate; }
}
