package fr.astonfly.article;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Contenu d'un article dans une langue : titre, chapô (dek), alt de l'image et
 * corps sous forme de blocs JSON — même format que les articles codés en dur
 * de la SPA ({h?, p:[...]}, {ctaLabel, ctaNav, ctaAnchor}).
 */
@Entity
@Table(name = "article_traductions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"article_id", "langue"}))
public class ArticleTraduction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "article_id")
    private Article article;

    @Column(nullable = false, length = 5)
    private String langue;

    @Column(nullable = false, length = 300)
    private String titre;

    @Column(nullable = false, columnDefinition = "text")
    private String chapo;

    @Column(nullable = false, length = 500)
    private String altImage;

    @Column(nullable = false, columnDefinition = "text")
    private String corpsJson;

    public ArticleTraduction() {
    }

    public ArticleTraduction(Article article, String langue) {
        this.article = article;
        this.langue = langue;
    }

    public Long getId() {
        return id;
    }

    public Article getArticle() {
        return article;
    }

    public String getLangue() {
        return langue;
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public String getChapo() {
        return chapo;
    }

    public void setChapo(String chapo) {
        this.chapo = chapo;
    }

    public String getAltImage() {
        return altImage;
    }

    public void setAltImage(String altImage) {
        this.altImage = altImage;
    }

    public String getCorpsJson() {
        return corpsJson;
    }

    public void setCorpsJson(String corpsJson) {
        this.corpsJson = corpsJson;
    }
}
