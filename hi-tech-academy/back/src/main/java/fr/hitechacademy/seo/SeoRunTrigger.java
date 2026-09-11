package fr.hitechacademy.seo;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Origine d'une exécution : cron planifié ou bouton de l'admin. */
public enum SeoRunTrigger {
    CRON, MANUAL;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static SeoRunTrigger fromJson(String value) {
        return valueOf(value.trim().toUpperCase());
    }
}
