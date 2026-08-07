package fr.immoscrapper.estimation;

import fr.immoscrapper.annonce.Annonce;
import fr.immoscrapper.annonce.AnnonceRepository;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * Estimation de la valeur de marché d'une annonce à partir des ventes réelles
 * DVF autour de son adresse : géocodage via la Base Adresse Nationale, puis
 * médiane du prix au m² des ventes du même type de bien, d'abord dans un rayon
 * de 500 m, sinon à l'échelle de la commune.
 */
@Service
public class EstimationMarcheService {

    private static final Logger log = LoggerFactory.getLogger(EstimationMarcheService.class);

    private static final String BAN = "https://api-adresse.data.gouv.fr";

    /** Coordonnées du lien Maps fourni par Licitor : "…q=48.85,2.35…". */
    private static final Pattern COORDONNEES = Pattern.compile("q=(-?\\d+\\.\\d+),(-?\\d+\\.\\d+)");

    private static final double RAYON_QUARTIER_M = 500;
    private static final int MIN_VENTES_QUARTIER = 5;
    private static final int MIN_VENTES_COMMUNE = 3;

    /** L'estimation est recalculée passé ce délai (DVF est mis à jour semestriellement). */
    private static final int VALIDITE_JOURS = 30;

    private final AnnonceRepository annonces;
    private final DvfClient dvf;
    private final ObjectMapper json = new ObjectMapper();
    private final HttpClient http = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NORMAL)
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public EstimationMarcheService(AnnonceRepository annonces, DvfClient dvf) {
        this.annonces = annonces;
        this.dvf = dvf;
    }

    /** Calcule l'estimation en tâche de fond pour ne pas ralentir l'agent de scrapping. */
    @Async("estimationExecutor")
    public void estimerEnTacheDeFond(Long annonceId) {
        annonces.findById(annonceId).ifPresent(this::estimer);
    }

    /** Rattrapage : annonces jamais estimées (ou estimation périmée), au démarrage puis 4×/jour. */
    @Scheduled(initialDelayString = "PT30S", fixedDelayString = "PT6H")
    public void rattraper() {
        List<Annonce> aTraiter = annonces.findByMarcheCalculeLeIsNullOrMarcheCalculeLeBefore(
                LocalDateTime.now().minusDays(VALIDITE_JOURS));
        if (!aTraiter.isEmpty()) {
            log.info("Estimation DVF : {} annonce(s) à traiter", aTraiter.size());
        }
        aTraiter.forEach(this::estimer);
    }

    private void estimer(Annonce annonce) {
        try {
            String typeLocal = typeLocalDvf(annonce.getType());
            Localisation lieu = typeLocal == null ? null : localiser(annonce);
            if (lieu == null) {
                annonce.appliquerEstimationMarche(null, null, null);
            } else {
                calculer(annonce, lieu, typeLocal);
            }
        } catch (Exception e) {
            log.warn("Estimation impossible pour l'annonce {} ({}) : {}",
                    annonce.getId(), annonce.getVille(), e.toString());
            annonce.appliquerEstimationMarche(null, null, null);
        }
        annonces.save(annonce);
    }

    private void calculer(Annonce annonce, Localisation lieu, String typeLocal) {
        List<DvfClient.Vente> ventesCommune = dvf.ventes(lieu.codeInsee()).stream()
                .filter(v -> typeLocal.equals(v.typeLocal()))
                .toList();
        List<DvfClient.Vente> ventesQuartier = ventesCommune.stream()
                .filter(v -> !Double.isNaN(v.latitude())
                        && distanceM(lieu.latitude(), lieu.longitude(), v.latitude(), v.longitude())
                                <= RAYON_QUARTIER_M)
                .toList();

        if (ventesQuartier.size() >= MIN_VENTES_QUARTIER) {
            annonce.appliquerEstimationMarche(mediane(ventesQuartier), ventesQuartier.size(), "rayon 500 m");
        } else if (ventesCommune.size() >= MIN_VENTES_COMMUNE) {
            annonce.appliquerEstimationMarche(mediane(ventesCommune), ventesCommune.size(), "commune");
        } else {
            annonce.appliquerEstimationMarche(null, null, null);
        }
    }

    private static Integer mediane(List<DvfClient.Vente> ventes) {
        double[] prix = ventes.stream().mapToDouble(DvfClient.Vente::prixM2).sorted().toArray();
        double m = prix.length % 2 == 1
                ? prix[prix.length / 2]
                : (prix[prix.length / 2 - 1] + prix[prix.length / 2]) / 2;
        return (int) Math.round(m);
    }

    /** Types Licitor → nomenclature type_local de DVF ; null si inestimables (parkings, « Autre »). */
    private static String typeLocalDvf(String type) {
        return switch (type) {
            case "Appartement" -> "Appartement";
            case "Maison" -> "Maison";
            case "Local commercial" -> "Local industriel. commercial ou assimilé";
            default -> null;
        };
    }

    record Localisation(double latitude, double longitude, String codeInsee) {
    }

    /**
     * Localise l'annonce : coordonnées exactes de la fiche Licitor complétées du
     * code INSEE par géocodage inverse BAN, sinon géocodage de l'adresse.
     */
    private Localisation localiser(Annonce annonce) throws Exception {
        Matcher coords = COORDONNEES.matcher(annonce.getCarteUrl() == null ? "" : annonce.getCarteUrl());
        if (coords.find()) {
            double lat = Double.parseDouble(coords.group(1));
            double lon = Double.parseDouble(coords.group(2));
            JsonNode feature = premierResultat("%s/reverse/?lat=%s&lon=%s".formatted(BAN, lat, lon));
            if (feature != null) {
                return new Localisation(lat, lon, feature.path("properties").path("citycode").asText());
            }
        }
        String requete = URLEncoder.encode(annonce.getAdresse() + " " + annonce.getVille(),
                StandardCharsets.UTF_8);
        JsonNode feature = premierResultat("%s/search/?q=%s&limit=1".formatted(BAN, requete));
        if (feature == null) {
            return null;
        }
        JsonNode point = feature.path("geometry").path("coordinates");
        return new Localisation(point.get(1).asDouble(), point.get(0).asDouble(),
                feature.path("properties").path("citycode").asText());
    }

    private JsonNode premierResultat(String url) throws Exception {
        HttpResponse<String> reponse = http.send(
                HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(20)).build(),
                HttpResponse.BodyHandlers.ofString());
        if (reponse.statusCode() != 200) {
            return null;
        }
        JsonNode features = json.readTree(reponse.body()).path("features");
        return features.isEmpty() ? null : features.get(0);
    }

    /** Distance en mètres entre deux points (formule de haversine). */
    static double distanceM(double lat1, double lon1, double lat2, double lon2) {
        double rayonTerre = 6_371_000;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return 2 * rayonTerre * Math.asin(Math.sqrt(a));
    }
}
