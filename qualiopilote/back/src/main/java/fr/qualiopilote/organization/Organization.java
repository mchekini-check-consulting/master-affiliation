package fr.qualiopilote.organization;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * Organisme de formation (tenant). Toutes les données métier porteront son
 * identifiant (organizationId) pour l'isolation multi-tenant.
 */
@Entity
@Table(name = "organizations")
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nom;

    /** Identifiant lisible pour le sous-domaine public ({slug}.qualiopilote.fr). */
    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
