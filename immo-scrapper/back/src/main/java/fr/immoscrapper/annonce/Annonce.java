package fr.immoscrapper.annonce;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/**
 * Annonce de vente aux enchères immobilières (scrappée depuis Licitor —
 * pour l'instant alimentée par un jeu de données de démonstration).
 */
@Entity
@Table(name = "annonces")
public class Annonce {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Appartement, Maison, Local commercial, Parking… */
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

    @Column(nullable = false)
    private double surfaceM2;

    /** Date et heure de l'audience d'adjudication. */
    @Column(nullable = false)
    private LocalDateTime audience;

    /** Libre, Occupé ou Loué. */
    @Column(nullable = false)
    private String statut;

    @Column(nullable = false)
    private String url;

    public Annonce() {
    }

    public Annonce(String type, String adresse, String ville, int prix, double surfaceM2,
                   LocalDateTime audience, String statut, String url) {
        this.type = type;
        this.adresse = adresse;
        this.ville = ville;
        this.prix = prix;
        this.surfaceM2 = surfaceM2;
        this.prixM2 = surfaceM2 > 0 ? (int) Math.round(prix / surfaceM2) : prix;
        this.audience = audience;
        this.statut = statut;
        this.url = url;
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
}
