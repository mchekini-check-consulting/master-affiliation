package fr.astonfly.commun;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** Langues du site et formats localisés (mêmes rendus que les données codées en dur de la SPA). */
public final class Langues {

    public static final String SOURCE = "fr";
    public static final List<String> TOUTES = List.of("fr", "en", "pt", "es", "it", "de");

    private static final Map<String, Locale> LOCALES = Map.of(
            "fr", Locale.FRENCH,
            "en", Locale.UK,
            "pt", Locale.of("pt", "PT"),
            "es", Locale.of("es", "ES"),
            "it", Locale.ITALIAN,
            "de", Locale.GERMAN);

    private static final Map<String, String> FORMATS_DATE = Map.of(
            "fr", "d MMMM yyyy",
            "en", "d MMMM yyyy",
            "pt", "d 'de' MMMM 'de' yyyy",
            "es", "d 'de' MMMM 'de' yyyy",
            "it", "d MMMM yyyy",
            "de", "d. MMMM yyyy");

    private Langues() {
    }

    public static boolean valide(String lang) {
        return TOUTES.contains(lang);
    }

    public static Locale locale(String lang) {
        return LOCALES.getOrDefault(lang, Locale.FRENCH);
    }

    /** Ex. fr « 30 juillet 2026 », de « 30. Juli 2026 ». */
    public static String dateLongue(LocalDate date, String lang) {
        return DateTimeFormatter.ofPattern(FORMATS_DATE.getOrDefault(lang, "d MMMM yyyy"), locale(lang))
                .format(date);
    }

    /** Ex. « 6 min » (« 6 Min. » en allemand), comme les articles existants. */
    public static String tempsLecture(int minutes, String lang) {
        return "de".equals(lang) ? minutes + " Min." : minutes + " min";
    }

    /** Mois abrégé capitalisé sans point, comme les cartes événement (« Sept », « Oct »). */
    public static String moisCourt(LocalDate date, String lang) {
        String m = date.getMonth().getDisplayName(TextStyle.SHORT, locale(lang)).replace(".", "");
        return m.substring(0, 1).toUpperCase(locale(lang)) + m.substring(1);
    }

    /** Jour sur deux chiffres (« 09 »). */
    public static String jour(LocalDate date) {
        return String.format("%02d", date.getDayOfMonth());
    }
}
