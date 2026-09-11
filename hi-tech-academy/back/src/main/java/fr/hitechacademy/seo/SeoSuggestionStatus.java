package fr.hitechacademy.seo;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Cycle de vie d'un mot-clé proposé par la phase de recherche : proposé par
 * l'agent → sélectionné à la main par l'admin → rédigé par les agents 3-4.
 * Contrat JSON en minuscules.
 */
public enum SeoSuggestionStatus {
    SUGGESTED, SELECTED, WRITING, WRITTEN, ERROR;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static SeoSuggestionStatus fromJson(String value) {
        return valueOf(value.trim().toUpperCase());
    }
}
