package fr.immoscrapper.annonce;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Annonces aux enchères : liste publique, et création (upsert par URL de
 * fiche) réservée à l'agent de scrapping via la clé d'API partagée.
 */
@RestController
@RequestMapping("/v1/annonces")
public class AnnonceController {

    private final AnnonceRepository annonces;
    private final fr.immoscrapper.estimation.EstimationMarcheService estimation;
    private final String cleApi;

    public AnnonceController(AnnonceRepository annonces,
                             fr.immoscrapper.estimation.EstimationMarcheService estimation,
                             @Value("${scrapper.cle-api}") String cleApi) {
        this.annonces = annonces;
        this.estimation = estimation;
        this.cleApi = cleApi;
    }

    @GetMapping
    public List<Annonce> lister() {
        return annonces.findAllByOrderByAudienceAsc();
    }

    public record CreationRequest(
            @NotBlank @Size(max = 80) String type,
            @NotBlank @Size(max = 300) String adresse,
            @NotBlank @Size(max = 150) String ville,
            @Min(0) int prix,
            @Min(0) double surfaceM2,
            @NotNull LocalDateTime audience,
            @NotBlank @Pattern(regexp = "Libre|Occupé|Loué|Inconnu") String statut,
            @NotBlank @Size(max = 500) String url,
            @Size(max = 5000) String descriptif,
            @Size(max = 500) String carteUrl,
            @Size(max = 3_000_000) String photoBase64) {
    }

    /**
     * Crée l'annonce, ou met à jour celle qui porte déjà cette URL de fiche
     * (les mises à prix et dates d'audience peuvent évoluer sur Licitor).
     */
    @PostMapping
    @Transactional
    public ResponseEntity<Annonce> creer(@RequestHeader(value = "X-API-KEY", required = false) String cle,
                                         @Valid @RequestBody CreationRequest requete) {
        if (cleApi == null || cleApi.isBlank() || !cleApi.equals(cle)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Clé d'API invalide.");
        }
        var existante = annonces.findByUrl(requete.url());
        Annonce annonce;
        HttpStatus statutHttp;
        if (existante.isPresent()) {
            annonce = existante.get();
            annonce.mettreAJour(requete.type(), requete.adresse(), requete.ville(), requete.prix(),
                    requete.surfaceM2(), requete.audience(), requete.statut(), requete.descriptif());
            statutHttp = HttpStatus.OK;
        } else {
            annonce = new Annonce(requete.type(), requete.adresse(), requete.ville(), requete.prix(),
                    requete.surfaceM2(), requete.audience(), requete.statut(), requete.url(), requete.descriptif());
            statutHttp = HttpStatus.CREATED;
        }
        if (requete.carteUrl() != null && !requete.carteUrl().isBlank()) {
            annonce.setCarteUrl(requete.carteUrl());
        }
        if (requete.photoBase64() != null && !requete.photoBase64().isBlank()) {
            try {
                annonce.setPhoto(java.util.Base64.getDecoder().decode(requete.photoBase64()));
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "photo_base64 invalide.");
            }
        }
        Annonce sauvee = annonces.save(annonce);
        // L'estimation DVF part après le commit (l'annonce doit être visible du thread de fond).
        Long id = sauvee.getId();
        org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                new org.springframework.transaction.support.TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        estimation.estimerEnTacheDeFond(id);
                    }
                });
        return ResponseEntity.status(statutHttp).body(sauvee);
    }

    /** Photo Street View de l'annonce (JPEG), si récupérée au scrapping. */
    @GetMapping(value = "/{id}/photo", produces = org.springframework.http.MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<byte[]> photo(@org.springframework.web.bind.annotation.PathVariable Long id) {
        Annonce annonce = annonces.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!annonce.isPhotoDisponible()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pas de photo pour cette annonce.");
        }
        return ResponseEntity.ok()
                .header("Cache-Control", "public, max-age=86400")
                .body(annonce.getPhoto());
    }
}
