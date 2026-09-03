package fr.astonfly.categorie;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.Table;

import java.util.HashMap;
import java.util.Map;

/** Catégorie d'articles, nom traduit par langue (clé fr/en/pt/es/it/de). */
@Entity
@Table(name = "categories")
public class Categorie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "categorie_noms", joinColumns = @JoinColumn(name = "categorie_id"))
    @MapKeyColumn(name = "langue", length = 5)
    @Column(name = "nom", nullable = false)
    private Map<String, String> noms = new HashMap<>();

    public Long getId() {
        return id;
    }

    public Map<String, String> getNoms() {
        return noms;
    }

    public void setNoms(Map<String, String> noms) {
        this.noms = noms;
    }

    public String nom(String lang) {
        return noms.getOrDefault(lang, noms.getOrDefault("fr", ""));
    }
}
