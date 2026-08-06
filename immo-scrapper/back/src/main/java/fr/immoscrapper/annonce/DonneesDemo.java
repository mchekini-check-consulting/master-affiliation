package fr.immoscrapper.annonce;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Jeu de données de démonstration : inséré uniquement si la table est vide,
 * en attendant le vrai scrapper Licitor. Les audiences sont datées dans les
 * semaines à venir pour rester réalistes quel que soit le jour de démarrage.
 */
@Component
public class DonneesDemo implements CommandLineRunner {

    private final AnnonceRepository annonces;

    public DonneesDemo(AnnonceRepository annonces) {
        this.annonces = annonces;
    }

    @Override
    public void run(String... args) {
        if (annonces.count() > 0) {
            return;
        }
        LocalDate base = LocalDate.now();
        annonces.saveAll(List.of(
                annonce("Appartement", "4, rue Georges Lardennois", "75019 Paris", 15_000, 39.25, base.plusDays(6), "10:30", "Libre"),
                annonce("Parking", "80/88, rue de la Roquette", "75011 Paris", 8_000, 12.5, base.plusDays(6), "14:00", "Libre"),
                annonce("Local commercial", "141, rue Raymond Losserand", "75014 Paris", 500_000, 218.04, base.plusDays(12), "14:00", "Occupé"),
                annonce("Local commercial", "32, rue de Paradis", "75010 Paris", 500_000, 111.03, base.plusDays(6), "11:00", "Loué"),
                annonce("Appartement", "27, avenue Simon Bolivar", "75019 Paris", 120_000, 31.0, base.plusDays(13), "10:30", "Occupé"),
                annonce("Maison", "14, rue des Bateliers", "93400 Saint-Ouen", 260_000, 94.6, base.plusDays(15), "14:00", "Libre"),
                annonce("Appartement", "9, boulevard de Magenta", "75010 Paris", 185_000, 52.8, base.plusDays(8), "09:30", "Libre"),
                annonce("Maison", "22, allée des Tilleuls", "94300 Vincennes", 410_000, 128.0, base.plusDays(9), "14:30", "Occupé"),
                annonce("Appartement", "5, rue de la Mare", "75020 Paris", 98_000, 27.4, base.plusDays(14), "11:00", "Loué"),
                annonce("Parking", "3, rue Érard", "75012 Paris", 12_000, 11.0, base.plusDays(16), "10:00", "Libre"),
                annonce("Local commercial", "18, rue du Faubourg-Montmartre", "75009 Paris", 320_000, 86.5, base.plusDays(20), "14:00", "Libre"),
                annonce("Maison", "41, rue Parmentier", "93100 Montreuil", 195_000, 72.3, base.plusDays(21), "09:30", "Occupé")
        ));
    }

    private static Annonce annonce(String type, String adresse, String ville, int prix,
                                   double surface, LocalDate jour, String heure, String statut) {
        return new Annonce(type, adresse, ville, prix, surface,
                LocalDateTime.of(jour, LocalTime.parse(heure)), statut, "https://www.licitor.com");
    }
}
