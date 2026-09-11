package fr.hitechacademy.seo;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Cycle de vie d'un article généré : créé à to_validate par l'agent 4, statué
 * par l'admin (validated / rejected / pending), publié par l'orchestrateur.
 * Contrat JSON en minuscules.
 */
public enum SeoArticleStatus {
    TO_VALIDATE, VALIDATED, REJECTED, PENDING, PUBLISHED;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static SeoArticleStatus fromJson(String value) {
        return valueOf(value.trim().toUpperCase());
    }
}
