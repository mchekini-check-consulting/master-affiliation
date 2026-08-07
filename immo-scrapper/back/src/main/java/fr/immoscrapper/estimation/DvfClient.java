package fr.immoscrapper.estimation;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Ventes réelles issues de DVF (Demandes de Valeurs Foncières, DGFiP/Etalab) :
 * télécharge les fichiers « geo-dvf » par commune sur files.data.gouv.fr et en
 * extrait les ventes simples exploitables pour un calcul de prix au m².
 */
@Component
public class DvfClient {

    /** Vente d'un local unique ; les coordonnées valent NaN si non géolocalisée. */
    public record Vente(double latitude, double longitude, String typeLocal, double prixM2) {
    }

    private static final Logger log = LoggerFactory.getLogger(DvfClient.class);

    private static final String BASE = "https://files.data.gouv.fr/geo-dvf/latest/csv";

    /** Millésimes à agréger : les 3 dernières années publiées. */
    private static final int MILLESIMES = 3;

    /** Garde-fous contre les mutations atypiques ou mal renseignées. */
    private static final double VALEUR_MIN = 10_000;
    private static final double SURFACE_MIN = 8;
    private static final double PRIX_M2_MIN = 250;
    private static final double PRIX_M2_MAX = 25_000;

    private static final int MAX_COMMUNES_EN_CACHE = 200;

    private final HttpClient http = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NORMAL)
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /** Ventes par code INSEE, gardées en mémoire le temps d'un passage de scrapping. */
    private final Map<String, List<Vente>> cache = new ConcurrentHashMap<>();

    /** Toutes les ventes exploitables de la commune sur les derniers millésimes publiés. */
    public List<Vente> ventes(String codeInsee) {
        if (cache.size() > MAX_COMMUNES_EN_CACHE) {
            cache.clear();
        }
        return cache.computeIfAbsent(codeInsee, this::telecharger);
    }

    private List<Vente> telecharger(String codeInsee) {
        List<Vente> ventes = new ArrayList<>();
        int annee = LocalDate.now().getYear();
        int millesimesTrouves = 0;
        // Le millésime de l'année en cours n'existe pas toujours encore : on
        // descend jusqu'à trouver les derniers publiés (mises à jour semestrielles).
        for (int essais = 0; essais < MILLESIMES + 3 && millesimesTrouves < MILLESIMES; essais++, annee--) {
            String url = "%s/%d/communes/%s/%s.csv".formatted(BASE, annee, departement(codeInsee), codeInsee);
            try {
                HttpResponse<java.io.InputStream> reponse = http.send(
                        HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(60)).build(),
                        HttpResponse.BodyHandlers.ofInputStream());
                if (reponse.statusCode() != 200) {
                    reponse.body().close();
                    continue;
                }
                try (BufferedReader lecteur = new BufferedReader(
                        new InputStreamReader(reponse.body(), StandardCharsets.UTF_8))) {
                    ventes.addAll(parser(lecteur));
                }
                millesimesTrouves++;
            } catch (Exception e) {
                log.warn("DVF indisponible pour {} ({}) : {}", codeInsee, annee, e.toString());
            }
        }
        log.info("DVF {} : {} vente(s) exploitable(s) sur {} millésime(s)",
                codeInsee, ventes.size(), millesimesTrouves);
        return List.copyOf(ventes);
    }

    /** "75101" → "75", "2A004" → "2A", "97411" → "974". */
    static String departement(String codeInsee) {
        return codeInsee.startsWith("97") ? codeInsee.substring(0, 3) : codeInsee.substring(0, 2);
    }

    /**
     * Extrait les ventes simples : mutations de nature « Vente » portant sur un
     * seul local (hors dépendances). Les ventes multi-lots sont écartées car leur
     * valeur foncière globale fausserait le prix au m².
     */
    private List<Vente> parser(BufferedReader lecteur) throws java.io.IOException {
        String enTete = lecteur.readLine();
        if (enTete == null) {
            return List.of();
        }
        List<String> colonnes = champs(enTete);
        int iMutation = colonnes.indexOf("id_mutation");
        int iNature = colonnes.indexOf("nature_mutation");
        int iValeur = colonnes.indexOf("valeur_fonciere");
        int iType = colonnes.indexOf("type_local");
        int iSurface = colonnes.indexOf("surface_reelle_bati");
        int iLongitude = colonnes.indexOf("longitude");
        int iLatitude = colonnes.indexOf("latitude");
        if (iMutation < 0 || iNature < 0 || iValeur < 0 || iType < 0 || iSurface < 0) {
            return List.of();
        }

        // Une mutation s'étale sur plusieurs lignes (une par local × parcelle) :
        // on regroupe ses locaux, dédoublonnés, avant de décider si elle est simple.
        record Local(String type, double surface, double lat, double lon) {
        }
        Map<String, Double> valeurParMutation = new HashMap<>();
        Map<String, LinkedHashSet<Local>> locauxParMutation = new HashMap<>();
        String ligne;
        while ((ligne = lecteur.readLine()) != null) {
            List<String> v = champs(ligne);
            if (v.size() < colonnes.size() || !"Vente".equals(v.get(iNature))) {
                continue;
            }
            String type = v.get(iType);
            if (type.isBlank() || "Dépendance".equals(type)) {
                continue;
            }
            double valeur = nombre(v.get(iValeur));
            double surface = nombre(v.get(iSurface));
            if (valeur <= 0 || surface <= 0) {
                continue;
            }
            String mutation = v.get(iMutation);
            valeurParMutation.put(mutation, valeur);
            locauxParMutation.computeIfAbsent(mutation, m -> new LinkedHashSet<>()).add(new Local(
                    type, surface,
                    iLatitude >= 0 ? nombre(v.get(iLatitude)) : Double.NaN,
                    iLongitude >= 0 ? nombre(v.get(iLongitude)) : Double.NaN));
        }

        List<Vente> ventes = new ArrayList<>();
        for (var entree : locauxParMutation.entrySet()) {
            if (entree.getValue().size() != 1) {
                continue;
            }
            Local local = entree.getValue().iterator().next();
            double valeur = valeurParMutation.get(entree.getKey());
            double prixM2 = valeur / local.surface();
            if (valeur >= VALEUR_MIN && local.surface() >= SURFACE_MIN
                    && prixM2 >= PRIX_M2_MIN && prixM2 <= PRIX_M2_MAX) {
                ventes.add(new Vente(local.lat(), local.lon(), local.type(), prixM2));
            }
        }
        return ventes;
    }

    /** 0 si le champ est vide ou n'est pas un nombre (colonnes DVF facultatives). */
    private static double nombre(String champ) {
        if (champ == null || champ.isBlank()) {
            return 0;
        }
        try {
            return Double.parseDouble(champ);
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    /** Découpe une ligne CSV en gérant les champs entre guillemets (adresses avec virgules). */
    static List<String> champs(String ligne) {
        List<String> resultat = new ArrayList<>();
        StringBuilder champ = new StringBuilder();
        boolean entreGuillemets = false;
        for (int i = 0; i < ligne.length(); i++) {
            char c = ligne.charAt(i);
            if (c == '"') {
                if (entreGuillemets && i + 1 < ligne.length() && ligne.charAt(i + 1) == '"') {
                    champ.append('"');
                    i++;
                } else {
                    entreGuillemets = !entreGuillemets;
                }
            } else if (c == ',' && !entreGuillemets) {
                resultat.add(champ.toString());
                champ.setLength(0);
            } else {
                champ.append(c);
            }
        }
        resultat.add(champ.toString());
        return resultat;
    }
}
