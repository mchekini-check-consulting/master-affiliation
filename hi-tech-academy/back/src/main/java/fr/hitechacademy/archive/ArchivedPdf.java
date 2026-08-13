package fr.hitechacademy.archive;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;
import java.util.UUID;

/**
 * Copie d'un PDF tel qu'il a été envoyé à l'apprenant (certificat de
 * réalisation, corrigé d'évaluation finale). Les PDF sont générés côté
 * front : sans cette archive, un document régénéré plus tard refléterait le
 * template du moment et non le document effectivement émis (traçabilité
 * Qualiopi). Table à part pour ne pas alourdir les listes des entités
 * métier avec le contenu binaire.
 */
@Entity
@Table(name = "archived_pdfs",
        uniqueConstraints = @UniqueConstraint(columnNames = {"kind", "owner_id"}))
public class ArchivedPdf {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ArchivedPdfKind kind;

    /** Id de l'objet métier concerné : certificat ou évaluation finale. */
    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    /** Date du dernier envoi (un renvoi remplace la copie archivée). */
    @Column(nullable = false)
    private Instant archivedAt = Instant.now();

    @Column(nullable = false)
    private byte[] content;

    public UUID getId() { return id; }

    public ArchivedPdfKind getKind() { return kind; }
    public void setKind(ArchivedPdfKind kind) { this.kind = kind; }

    public UUID getOwnerId() { return ownerId; }
    public void setOwnerId(UUID ownerId) { this.ownerId = ownerId; }

    public Instant getArchivedAt() { return archivedAt; }
    public void setArchivedAt(Instant archivedAt) { this.archivedAt = archivedAt; }

    public byte[] getContent() { return content; }
    public void setContent(byte[] content) { this.content = content; }
}
