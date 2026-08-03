package fr.naturaprep.progression;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

/**
 * Progression d'un membre : une ligne par élément suivi.
 * type = "fiche" (valeur 1 quand lue), "atelier" (1 quand lancé) ou
 * "quiz" (meilleur score en %) ; cle = identifiant de l'élément
 * (ex. "histoire-geographie-culture/la-revolution-francaise").
 */
@Entity
@Table(name = "progressions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"membreId", "type", "cle"}))
public class Progression {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long membreId;

    @Column(nullable = false, length = 20)
    private String type;

    @Column(nullable = false, length = 160)
    private String cle;

    @Column(nullable = false)
    private int valeur;

    @Column(nullable = false)
    private Instant majLe = Instant.now();

    public Long getId() {
        return id;
    }

    public Long getMembreId() {
        return membreId;
    }

    public void setMembreId(Long membreId) {
        this.membreId = membreId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCle() {
        return cle;
    }

    public void setCle(String cle) {
        this.cle = cle;
    }

    public int getValeur() {
        return valeur;
    }

    public void setValeur(int valeur) {
        this.valeur = valeur;
    }

    public void setMajLe(Instant majLe) {
        this.majLe = majLe;
    }
}
