package fr.hitechacademy.backup;

import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import fr.hitechacademy.archive.ArchivedPdf;
import fr.hitechacademy.archive.ArchivedPdfKind;
import fr.hitechacademy.archive.ArchivedPdfRepository;
import fr.hitechacademy.billing.BillingDocument;
import fr.hitechacademy.billing.BillingDocumentRepository;
import fr.hitechacademy.complaint.Complaint;
import fr.hitechacademy.complaint.ComplaintRepository;
import fr.hitechacademy.registration.Certificate;
import fr.hitechacademy.registration.FinalEvaluation;
import fr.hitechacademy.registration.NeedsAnalysis;
import fr.hitechacademy.registration.PositioningTest;
import fr.hitechacademy.registration.RegistrationRepository;
import fr.hitechacademy.registration.RegistrationRequest;
import fr.hitechacademy.registration.SponsorSurvey;
import fr.hitechacademy.registration.Trainee;
import fr.hitechacademy.veille.VeilleItem;
import fr.hitechacademy.veille.VeilleRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.hibernate.ReplicationMode;
import org.hibernate.Session;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.text.Normalizer;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

/**
 * Sauvegarde et restauration complètes des données de l'organisme.
 *
 * Format : une archive ZIP contenant backup.json (toutes les entités avec
 * leurs relations imbriquées et leurs UUID d'origine) et les PDF archivés
 * tels qu'ils ont été envoyés (pdfs/&lt;type&gt;/&lt;owner_id&gt;.pdf).
 *
 * Les entités sont (dé)sérialisées par accès direct aux champs — le format
 * suit donc automatiquement les évolutions du modèle — et les références
 * inverses (enfant → parent) sont ignorées puis recâblées à l'import.
 *
 * L'import remplace tout l'état de la base dans une seule transaction :
 * en cas d'échec, rien n'est modifié.
 */
@Service
public class BackupService {

    static final int FORMAT_VERSION = 1;

    private final RegistrationRepository registrations;
    private final ComplaintRepository complaints;
    private final VeilleRepository veille;
    private final ArchivedPdfRepository archivedPdfs;
    private final BillingDocumentRepository billingDocuments;
    private final ObjectMapper mapper = createMapper();

    @PersistenceContext
    private EntityManager entityManager;

    public BackupService(RegistrationRepository registrations, ComplaintRepository complaints,
                         VeilleRepository veille, ArchivedPdfRepository archivedPdfs,
                         BillingDocumentRepository billingDocuments) {
        this.registrations = registrations;
        this.complaints = complaints;
        this.veille = veille;
        this.archivedPdfs = archivedPdfs;
        this.billingDocuments = billingDocuments;
    }

    // --- Format du fichier backup.json --------------------------------

    record Manifest(int formatVersion, Instant exportedAt,
                    List<RegistrationRequest> registrations,
                    List<Complaint> complaints,
                    List<VeilleItem> veilleItems,
                    List<BillingDocument> billingDocuments,
                    List<PdfEntry> pdfs) {
    }

    record PdfEntry(ArchivedPdfKind kind, UUID ownerId, Instant archivedAt, String file) {
    }

    public record ImportReport(int registrations, int trainees, int certificates,
                               int complaints, int veilleItems, int billingDocuments, int pdfs) {
    }

    /** Ignore les références enfant → parent (recâblées à l'import). */
    abstract static class IgnoreParentRefsMixin {
        @JsonIgnore RegistrationRequest registration;
        @JsonIgnore Trainee trainee;
    }

    private static ObjectMapper createMapper() {
        ObjectMapper m = new ObjectMapper();
        m.registerModule(new JavaTimeModule());
        m.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        m.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
        // Champs uniquement : permet de renseigner les ids (pas de setter) et
        // écarte les getters dérivés (isSubmitted, requiredSurveyCompleted…)
        m.setVisibility(PropertyAccessor.FIELD, Visibility.ANY);
        m.setVisibility(PropertyAccessor.GETTER, Visibility.NONE);
        m.setVisibility(PropertyAccessor.IS_GETTER, Visibility.NONE);
        m.setVisibility(PropertyAccessor.SETTER, Visibility.NONE);
        for (Class<?> child : List.of(NeedsAnalysis.class, SponsorSurvey.class, Certificate.class,
                PositioningTest.class, FinalEvaluation.class, Trainee.class)) {
            m.addMixIn(child, IgnoreParentRefsMixin.class);
        }
        return m;
    }

    // --- Export --------------------------------------------------------

    @Transactional(readOnly = true)
    public byte[] export() {
        List<RegistrationRequest> regs = registrations.findAll();

        // Rangement humain des PDF archivés : un dossier par formation, puis
        // par type de document (le front complète l'archive avec les PDF des
        // questionnaires selon la même arborescence).
        Map<UUID, String> certificatePaths = new HashMap<>();
        Map<UUID, String> correctionPaths = new HashMap<>();
        for (RegistrationRequest r : regs) {
            String dir = folderName(r.getFormationTitle());
            if (r.getCertificate() != null) {
                UUID id = r.getCertificate().getId();
                certificatePaths.put(id, dir + "/Certificats/"
                        + personName(r.getFirstName(), r.getLastName()) + "_" + shortId(id) + ".pdf");
            }
            if (r.getFinalEvaluation() != null) {
                UUID id = r.getFinalEvaluation().getId();
                correctionPaths.put(id, dir + "/Evaluation finale/Corrige_"
                        + personName(r.getFirstName(), r.getLastName()) + "_" + shortId(id) + ".pdf");
            }
            for (Trainee t : r.getTrainees()) {
                if (t.getFinalEvaluation() != null) {
                    UUID id = t.getFinalEvaluation().getId();
                    correctionPaths.put(id, dir + "/Evaluation finale/Corrige_"
                            + personName(t.getFirstName(), t.getLastName()) + "_" + shortId(id) + ".pdf");
                }
            }
        }

        // Devis / factures : rangés par numéro dans un dossier Facturation
        List<BillingDocument> billingDocs = billingDocuments.findAll();
        Map<UUID, String> billingPaths = new HashMap<>();
        for (BillingDocument d : billingDocs) {
            String subDir = d.getNumber().startsWith("FA-") ? "Factures" : "Devis";
            billingPaths.put(d.getId(), "Facturation/" + subDir + "/"
                    + sanitize(d.getNumber() + " " + d.getClientName(), "_") + ".pdf");
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (ZipOutputStream zip = new ZipOutputStream(out)) {
            List<PdfEntry> pdfEntries = new ArrayList<>();
            for (ArchivedPdf pdf : archivedPdfs.findAll()) {
                String file = switch (pdf.getKind()) {
                    case CERTIFICATE -> certificatePaths.get(pdf.getOwnerId());
                    case FINAL_EVALUATION_CORRECTION -> correctionPaths.get(pdf.getOwnerId());
                    case QUOTE, INVOICE -> billingPaths.get(pdf.getOwnerId());
                };
                if (file == null) {
                    // Objet métier disparu : chemin technique de repli
                    file = "pdfs/" + pdf.getKind().name().toLowerCase() + "/" + pdf.getOwnerId() + ".pdf";
                }
                zip.putNextEntry(new ZipEntry(file));
                zip.write(pdf.getContent());
                zip.closeEntry();
                pdfEntries.add(new PdfEntry(pdf.getKind(), pdf.getOwnerId(), pdf.getArchivedAt(), file));
            }
            Manifest manifest = new Manifest(FORMAT_VERSION, Instant.now(),
                    regs, complaints.findAll(), veille.findAll(), billingDocs, pdfEntries);
            zip.putNextEntry(new ZipEntry("backup.json"));
            zip.write(mapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(manifest));
            zip.closeEntry();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        return out.toByteArray();
    }

    // --- Noms de dossiers / fichiers lisibles et sûrs -------------------
    // Mêmes règles côté front (BackupView) pour que les PDF générés par le
    // navigateur rejoignent les mêmes dossiers.

    static String folderName(String s) {
        return sanitize(s, " ");
    }

    static String personName(String firstName, String lastName) {
        return sanitize((firstName == null ? "" : firstName) + " " + (lastName == null ? "" : lastName), "_");
    }

    static String shortId(UUID id) {
        return id == null ? "x" : id.toString().substring(0, 8);
    }

    /** Retire les accents et tout caractère risqué dans un chemin de ZIP. */
    private static String sanitize(String s, String spaceReplacement) {
        String noAccents = Normalizer.normalize(s == null ? "" : s, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        String cleaned = noAccents.replaceAll("[^A-Za-z0-9 _.-]", " ")
                .trim().replaceAll("\\s+", spaceReplacement);
        return cleaned.isEmpty() ? "Sans nom" : cleaned;
    }

    // --- Import --------------------------------------------------------

    /**
     * Remplace toutes les données par le contenu de la sauvegarde.
     *
     * @throws IllegalArgumentException si l'archive est invalide ou d'une
     *                                  version de format inconnue (l'appelant la traduit en 400)
     */
    @Transactional
    public ImportReport importBackup(byte[] zipBytes) {
        Map<String, byte[]> files = readZip(zipBytes);
        byte[] json = files.get("backup.json");
        if (json == null) {
            throw new IllegalArgumentException("Archive invalide : backup.json introuvable");
        }
        Manifest manifest;
        try {
            manifest = mapper.readValue(json, Manifest.class);
        } catch (IOException e) {
            throw new IllegalArgumentException("Sauvegarde illisible : " + e.getMessage(), e);
        }
        if (manifest.formatVersion() != FORMAT_VERSION) {
            throw new IllegalArgumentException("Version de sauvegarde non prise en charge : "
                    + manifest.formatVersion() + " (attendu : " + FORMAT_VERSION + ")");
        }

        // Remise à zéro (les enfants suivent par cascade), puis détache tout :
        // les mêmes ids vont être réinsérés dans cette transaction.
        archivedPdfs.deleteAll();
        registrations.deleteAll();
        complaints.deleteAll();
        veille.deleteAll();
        billingDocuments.deleteAll();
        entityManager.flush();
        entityManager.clear();

        // Réinsertion en conservant les UUID d'origine : persist() refuse un
        // id déjà renseigné quand il est @GeneratedValue (« detached entity »),
        // replicate() est l'API Hibernate prévue pour recréer des entités avec
        // leurs identifiants (dépréciée sans remplacement, toujours présente
        // en Hibernate 6.6 — à revoir lors d'un passage à Hibernate 7).
        Session session = entityManager.unwrap(Session.class);
        int trainees = 0;
        int certificates = 0;
        List<UUID> originalIds = new ArrayList<>();
        for (RegistrationRequest r : orEmpty(manifest.registrations())) {
            relink(r);
            originalIds.add(r.getId());
            trainees += r.getTrainees().size();
            if (r.getCertificate() != null) certificates++;
            session.replicate(r, ReplicationMode.EXCEPTION);
        }
        for (Complaint c : orEmpty(manifest.complaints())) {
            session.replicate(c, ReplicationMode.EXCEPTION);
        }
        for (VeilleItem v : orEmpty(manifest.veilleItems())) {
            session.replicate(v, ReplicationMode.EXCEPTION);
        }
        for (BillingDocument d : orEmpty(manifest.billingDocuments())) {
            session.replicate(d, ReplicationMode.EXCEPTION);
        }
        int pdfs = 0;
        for (PdfEntry entry : orEmpty(manifest.pdfs())) {
            byte[] content = files.get(entry.file());
            if (content == null) {
                throw new IllegalArgumentException("Archive invalide : fichier manquant " + entry.file());
            }
            ArchivedPdf pdf = new ArchivedPdf();
            pdf.setKind(entry.kind());
            pdf.setOwnerId(entry.ownerId());
            pdf.setArchivedAt(entry.archivedAt());
            pdf.setContent(content);
            entityManager.persist(pdf);
            pdfs++;
        }
        entityManager.flush();

        // Garde-fou : les UUID d'origine doivent survivre à l'import (les
        // liens des emails déjà envoyés pointent vers ces ids). Toute
        // divergence annule la transaction.
        List<RegistrationRequest> persisted = orEmpty(manifest.registrations());
        for (int i = 0; i < persisted.size(); i++) {
            UUID original = originalIds.get(i);
            if (original != null && !original.equals(persisted.get(i).getId())) {
                throw new IllegalStateException("Les identifiants d'origine n'ont pas été conservés à l'import");
            }
        }

        return new ImportReport(persisted.size(), trainees, certificates,
                orEmpty(manifest.complaints()).size(), orEmpty(manifest.veilleItems()).size(),
                orEmpty(manifest.billingDocuments()).size(), pdfs);
    }

    /** Recâble les références enfant → parent ignorées à la sérialisation. */
    private static void relink(RegistrationRequest r) {
        if (r.getNeedsAnalysis() != null) r.getNeedsAnalysis().setRegistration(r);
        if (r.getSponsorSurvey() != null) r.getSponsorSurvey().setRegistration(r);
        if (r.getCertificate() != null) r.getCertificate().setRegistration(r);
        if (r.getPositioningTest() != null) r.getPositioningTest().setRegistration(r);
        if (r.getFinalEvaluation() != null) r.getFinalEvaluation().setRegistration(r);
        for (Trainee t : r.getTrainees()) {
            t.setRegistration(r);
            if (t.getPositioningTest() != null) t.getPositioningTest().setTrainee(t);
            if (t.getFinalEvaluation() != null) t.getFinalEvaluation().setTrainee(t);
        }
    }

    private static <T> List<T> orEmpty(List<T> list) {
        return list != null ? list : List.of();
    }

    private static Map<String, byte[]> readZip(byte[] zipBytes) {
        Map<String, byte[]> files = new HashMap<>();
        try (ZipInputStream zip = new ZipInputStream(new ByteArrayInputStream(zipBytes))) {
            ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) {
                if (!entry.isDirectory()) {
                    files.put(entry.getName(), zip.readAllBytes());
                }
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Archive ZIP illisible : " + e.getMessage(), e);
        }
        if (files.isEmpty()) {
            throw new IllegalArgumentException("Archive ZIP vide ou invalide");
        }
        return files;
    }
}
