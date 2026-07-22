package fr.hitechacademy.veille;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Entrée du tableau de suivi de la veille (une carte du kanban de l'espace
 * admin), rattachée à un axe du plan de veille.
 */
@Entity
@Table(name = "veille_items")
public class VeilleItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VeilleAxis axis;

    /** Date de l'information de veille (affichée sur la carte). */
    @Column(nullable = false)
    private LocalDate entryDate;

    /** Source et information consignée. */
    @Column(nullable = false, length = 2000)
    private String content;

    /** Ordre d'affichage dans la colonne. */
    @Column(nullable = false)
    private int position;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }

    public VeilleAxis getAxis() { return axis; }
    public void setAxis(VeilleAxis axis) { this.axis = axis; }

    public LocalDate getEntryDate() { return entryDate; }
    public void setEntryDate(LocalDate entryDate) { this.entryDate = entryDate; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }

    public Instant getCreatedAt() { return createdAt; }
}
