package fr.hitechacademy.seo;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Statut d'une exécution du pipeline : requested est créé par le bouton
 * « Lancer l'agent » de l'admin et réclamé par l'orchestrateur, qui fait
 * ensuite vivre running → done / error / skipped. Contrat JSON en minuscules.
 */
public enum SeoRunStatus {
    REQUESTED, RUNNING, DONE, ERROR, SKIPPED;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static SeoRunStatus fromJson(String value) {
        return valueOf(value.trim().toUpperCase());
    }
}
