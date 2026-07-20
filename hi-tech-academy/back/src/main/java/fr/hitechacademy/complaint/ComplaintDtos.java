package fr.hitechacademy.complaint;

import fr.hitechacademy.registration.ApplicantType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

/** Contrat JSON (snake_case par configuration Jackson). */
public final class ComplaintDtos {

    private ComplaintDtos() {
    }

    // --- Dépôt d'une réclamation (public) --------------------------------
    public record CreateComplaintRequest(
            @NotBlank String formationId,
            @NotBlank String formationTitle,
            @NotNull ApplicantType complainantType,
            String companyName,
            @NotBlank String firstName,
            @NotBlank String lastName,
            @NotBlank @Email String email,
            @NotBlank String message) {
    }

    public record CreatedResponse(UUID id, ComplaintStatus status) {
    }

    // --- Espace admin ----------------------------------------------------
    public record AdminListItem(
            UUID id,
            Instant createdAt,
            ComplaintStatus status,
            String formationTitle,
            ApplicantType complainantType,
            String firstName,
            String lastName,
            String companyName) {

        static AdminListItem from(Complaint c) {
            return new AdminListItem(
                    c.getId(), c.getCreatedAt(), c.getStatus(), c.getFormationTitle(),
                    c.getComplainantType(), c.getFirstName(), c.getLastName(), c.getCompanyName());
        }
    }

    public record AdminDetail(
            UUID id,
            Instant createdAt,
            ComplaintStatus status,
            Instant handledAt,
            String formationId,
            String formationTitle,
            ApplicantType complainantType,
            String companyName,
            String firstName,
            String lastName,
            String email,
            String message,
            String response) {

        static AdminDetail from(Complaint c) {
            return new AdminDetail(
                    c.getId(), c.getCreatedAt(), c.getStatus(), c.getHandledAt(),
                    c.getFormationId(), c.getFormationTitle(), c.getComplainantType(),
                    c.getCompanyName(), c.getFirstName(), c.getLastName(), c.getEmail(),
                    c.getMessage(), c.getResponse());
        }
    }

    public record UpdateComplaintRequest(
            @NotNull ComplaintStatus status,
            String response) {
    }
}
