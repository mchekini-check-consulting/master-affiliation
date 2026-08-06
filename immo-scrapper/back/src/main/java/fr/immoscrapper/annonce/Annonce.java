package fr.immoscrapper.annonce;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/**
 * Annonce de vente aux enchères immobilières, alimentée par l'agent de
 * scrapping Licitor via POST /v1/annonces (dédoublonnée par URL de fiche).
 */
@Entity
@Table(name = "annonces")
public class Annonce {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Appartement, Maison, Local commercial, Parking, Autre… */
    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String adresse;

    @Column(nullable = false)
    private String ville;

    /** Mise à prix en euros. */
    @Column(nullable = false)
    private int prix;

    /** Prix au m² en euros (calculé à partir de la mise à prix). */
    @Column(nullable = false)
    private int prixM2;

    private double surfaceM2;

    /** Date et heure de l'audience d'adjudication. */
    @Column(nullable = false)
    private LocalDateTime audience;

    /** Libre, Occupé, Loué ou Inconnu. */
    @Column(nullable = false)
    private String statut;

    /** URL de la fiche Licitor (clé de dédoublonnage). */
    @Column(nullable = false, unique = true, length = 500)
    private String url;

    /** Descriptif du bien tel que publié sur la fiche. */
    @Column(columnDefinition = "text")
    private String descriptif;

    public Annonce() {
    }

    public Annonce(String type, String adresse, String ville, int prix, double surfaceM2,
                   LocalDateTime audience, String statut, String url, String descriptif) {
        this.type = type;
        this.adresse = adresse;
        this.ville = ville;
        this.audience = audience;
        this.statut = statut;
        this.url = url;
        this.descriptif = descriptif;
        changerPrix(prix, surfaceM2);
    }

    /** Met à jour mise à prix et surface en gardant le prix/m² cohérent. */
    public void changerPrix(int prix, double surfaceM2) {
        this.prix = prix;
        this.surfaceM2 = surfaceM2;
        this.prixM2 = surfaceM2 > 0 ? (int) Math.round(prix / surfaceM2) : 0;
    }

    public void mettreAJour(String type, String adresse, String ville, int prix, double surfaceM2,
                            LocalDateTime audience, String statut, String descriptif) {
        this.type = type;
        this.adresse = adresse;
        this.ville = ville;
        this.audience = audience;
        this.statut = statut;
        this.descriptif = descriptif;
        changerPrix(prix, surfaceM2);
    }

    public Long getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public String getAdresse() {
        return adresse;
    }

    public String getVille() {
        return ville;
    }

    public int getPrix() {
        return prix;
    }

    public int getPrixM2() {
        return prixM2;
    }

    public double getSurfaceM2() {
        return surfaceM2;
    }

    public LocalDateTime getAudience() {
        return audience;
    }

    public String getStatut() {
        return statut;
    }

    public String getUrl() {
        return url;
    }

    public String getDescriptif() {
        return descriptif;
    }
}
