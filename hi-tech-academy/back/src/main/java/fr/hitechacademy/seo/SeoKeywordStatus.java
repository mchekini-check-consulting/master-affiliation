package fr.hitechacademy.seo;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Cycle de vie d'un mot-clé du pipeline SEO (contrat JSON en minuscules). */
public enum SeoKeywordStatus {
    TO_PROCESS, PROCESSING, DONE, ERROR;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static SeoKeywordStatus fromJson(String value) {
        return valueOf(value.trim().toUpperCase());
    }
}
