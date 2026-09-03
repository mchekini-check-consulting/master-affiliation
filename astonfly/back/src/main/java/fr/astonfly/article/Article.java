package fr.astonfly.article;

import fr.astonfly.categorie.Categorie;
import fr.astonfly.commun.Statut;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Entity
@Table(name = "articles")
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 200)
    private String slug;

    @ManyToOne(optional = false)
    @JoinColumn(name = "categorie_id")
    private Categorie categorie;

    @Column(nullable = false)
    private LocalDate datePublication;

    @Column(nullable = false)
    private int minutesLecture;

    /** Chemin ou URL de l'image d'illustration (ex. /images/x.jpg ou /api/v1/public/media/x.jpg). */
    @Column(nullable = false, length = 500)
    private String image;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Statut statut = Statut.BROUILLON;

    @Column(nullable = false)
    private Instant creeLe = Instant.now();

    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<ArticleTraduction> traductions = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public Categorie getCategorie() {
        return categorie;
    }

    public void setCategorie(Categorie categorie) {
        this.categorie = categorie;
    }

    public LocalDate getDatePublication() {
        return datePublication;
    }

    public void setDatePublication(LocalDate datePublication) {
        this.datePublication = datePublication;
    }

    public int getMinutesLecture() {
        return minutesLecture;
    }

    public void setMinutesLecture(int minutesLecture) {
        this.minutesLecture = minutesLecture;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public Statut getStatut() {
        return statut;
    }

    public void setStatut(Statut statut) {
        this.statut = statut;
    }

    public Instant getCreeLe() {
        return creeLe;
    }

    public List<ArticleTraduction> getTraductions() {
        return traductions;
    }

    public Optional<ArticleTraduction> traduction(String lang) {
        return traductions.stream().filter(t -> t.getLangue().equals(lang)).findFirst();
    }
}
