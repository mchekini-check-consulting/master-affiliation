package fr.astonfly.evenement;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/** Champs traduits d'un événement — mêmes champs que les cartes de la landing. */
@Entity
@Table(name = "evenement_traductions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"evenement_id", "langue"}))
public class EvenementTraduction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "evenement_id")
    private Evenement evenement;

    @Column(nullable = false, length = 5)
    private String langue;

    /** Ex. « Portes ouvertes », « Webinaire », « Salon ». */
    @Column(nullable = false, length = 100)
    private String tag;

    @Column(nullable = false, length = 300)
    private String titre;

    @Column(nullable = false, length = 300)
    private String lieu;

    /** Ex. « 10h – 17h », « Journée ». */
    @Column(nullable = false, length = 100)
    private String horaire;

    @Column(nullable = false, columnDefinition = "text")
    private String description;

    public EvenementTraduction() {
    }

    public EvenementTraduction(Evenement evenement, String langue) {
        this.evenement = evenement;
        this.langue = langue;
    }

    public Long getId() {
        return id;
    }

    public Evenement getEvenement() {
        return evenement;
    }

    public String getLangue() {
        return langue;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public String getLieu() {
        return lieu;
    }

    public void setLieu(String lieu) {
        this.lieu = lieu;
    }

    public String getHoraire() {
        return horaire;
    }

    public void setHoraire(String horaire) {
        this.horaire = horaire;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
