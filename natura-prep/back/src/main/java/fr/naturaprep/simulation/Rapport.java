package fr.naturaprep.simulation;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * Rapport d'évaluation d'une simulation d'entretien. Le contenu détaillé
 * (scores, erreurs, plan de révision…) est stocké en JSON ; quelques champs
 * clés sont dupliqués en colonnes pour lister les rapports sans le parser.
 */
@Entity
@Table(name = "rapports")
public class Rapport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long membreId;

    @Column(nullable = false)
    private Instant creeLe = Instant.now();

    @Column(nullable = false)
    private String modeleConversation;

    @Column(nullable = false)
    private String modeleEvaluation;

    @Column(nullable = false)
    private int dureeSecondes;

    private double coutConversationUsd;

    private double coutEvaluationUsd;

    private String niveauCecrl;

    private String avis;

    private Integer scoreCivique;

    @Column(columnDefinition = "text", nullable = false)
    private String contenu;

    @Column(columnDefinition = "text")
    private String transcript;

    public Long getId() {
        return id;
    }

    public Long getMembreId() {
        return membreId;
    }

    public void setMembreId(Long membreId) {
        this.membreId = membreId;
    }

    public Instant getCreeLe() {
        return creeLe;
    }

    public String getModeleConversation() {
        return modeleConversation;
    }

    public void setModeleConversation(String modeleConversation) {
        this.modeleConversation = modeleConversation;
    }

    public String getModeleEvaluation() {
        return modeleEvaluation;
    }

    public void setModeleEvaluation(String modeleEvaluation) {
        this.modeleEvaluation = modeleEvaluation;
    }

    public int getDureeSecondes() {
        return dureeSecondes;
    }

    public void setDureeSecondes(int dureeSecondes) {
        this.dureeSecondes = dureeSecondes;
    }

    public double getCoutConversationUsd() {
        return coutConversationUsd;
    }

    public void setCoutConversationUsd(double coutConversationUsd) {
        this.coutConversationUsd = coutConversationUsd;
    }

    public double getCoutEvaluationUsd() {
        return coutEvaluationUsd;
    }

    public void setCoutEvaluationUsd(double coutEvaluationUsd) {
        this.coutEvaluationUsd = coutEvaluationUsd;
    }

    public String getNiveauCecrl() {
        return niveauCecrl;
    }

    public void setNiveauCecrl(String niveauCecrl) {
        this.niveauCecrl = niveauCecrl;
    }

    public String getAvis() {
        return avis;
    }

    public void setAvis(String avis) {
        this.avis = avis;
    }

    public Integer getScoreCivique() {
        return scoreCivique;
    }

    public void setScoreCivique(Integer scoreCivique) {
        this.scoreCivique = scoreCivique;
    }

    public String getContenu() {
        return contenu;
    }

    public void setContenu(String contenu) {
        this.contenu = contenu;
    }

    public String getTranscript() {
        return transcript;
    }

    public void setTranscript(String transcript) {
        this.transcript = transcript;
    }
}
