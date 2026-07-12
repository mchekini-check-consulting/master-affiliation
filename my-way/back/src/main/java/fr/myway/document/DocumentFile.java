package fr.myway.document;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Document de l'espace documentaire. Le fichier est stocké sur disque sous un
 * identifiant technique (RG4) ; seul ce back sait le résoudre (RG5). La
 * suppression est un soft delete de 30 jours (RG7), le remplacement de fichier
 * conserve l'identifiant du document (RG8).
 */
@Entity
@Table(name = "documents")
public class DocumentFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "theme_id", nullable = false)
    private Theme theme;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "document_tags", joinColumns = @JoinColumn(name = "document_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    /** Nom d'origine, conservé pour le téléchargement (RG4). */
    @Column(nullable = false)
    private String originalFilename;

    /** Identifiant technique du fichier sur le stockage (UUID, RG4). */
    @Column(nullable = false, unique = true)
    private String storageId;

    @Column(nullable = false)
    private String mimeType;

    /** Famille de fichier : PDF, WORD, EXCEL ou IMAGE. */
    @Column(nullable = false)
    private String fileType;

    @Column(nullable = false)
    private long sizeBytes;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant publishedDate;

    /** Non nul = dans la corbeille (soft delete RG7, purge après 30 jours). */
    private Instant deletedDate;

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Theme getTheme() { return theme; }
    public void setTheme(Theme theme) { this.theme = theme; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }
    public String getStorageId() { return storageId; }
    public void setStorageId(String storageId) { this.storageId = storageId; }
    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public long getSizeBytes() { return sizeBytes; }
    public void setSizeBytes(long sizeBytes) { this.sizeBytes = sizeBytes; }
    public Instant getPublishedDate() { return publishedDate; }
    public Instant getDeletedDate() { return deletedDate; }
    public void setDeletedDate(Instant deletedDate) { this.deletedDate = deletedDate; }
}
