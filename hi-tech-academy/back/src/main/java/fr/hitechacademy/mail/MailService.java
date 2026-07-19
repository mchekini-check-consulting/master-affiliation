package fr.hitechacademy.mail;

import fr.hitechacademy.registration.ApplicantType;
import fr.hitechacademy.registration.RegistrationRequest;
import fr.hitechacademy.registration.RegistrationStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Envoi des emails transactionnels via le SMTP Google Workspace
 * (contact@hi-techacademy.fr). Si MAIL_PASSWORD n'est pas défini, les envois
 * sont désactivés et simplement journalisés : aucun parcours ne doit échouer
 * à cause d'un email.
 */
@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender mailSender;
    private final boolean enabled;
    private final String from;
    private final String adminRecipient;

    public MailService(
            JavaMailSender mailSender,
            @Value("${spring.mail.password}") String password,
            @Value("${spring.mail.username}") String from,
            @Value("${app.mail.admin-recipient}") String adminRecipient) {
        this.mailSender = mailSender;
        this.enabled = password != null && !password.isBlank();
        this.from = from;
        this.adminRecipient = adminRecipient;
        if (!enabled) {
            log.warn("MAIL_PASSWORD non défini : envoi d'emails désactivé");
        }
    }

    /** Nouvelle demande transmise (questionnaire complété) : notifie l'organisme. */
    @Async
    public void notifyAdminNewRequest(RegistrationRequest r) {
        String applicant = r.getApplicantType() == ApplicantType.COMPANY
                ? r.getCompanyName() + " (référent : " + r.getFirstName() + " " + r.getLastName() + ")"
                : r.getFirstName() + " " + r.getLastName();

        String body = """
                Une nouvelle demande d'inscription vient d'être transmise.

                Formation : %s
                Demandeur : %s
                Profil : %s
                Email : %s
                Téléphone : %s

                Le questionnaire obligatoire a été renseigné. Consultez la demande
                et validez-la ou refusez-la depuis l'espace admin :
                https://hi-tech-academy.fr/admin

                — Notification automatique Hi-Tech Academy""";

        send(adminRecipient,
                "Nouvelle demande d'inscription — " + r.getFormationTitle(),
                body.formatted(
                        r.getFormationTitle(),
                        applicant,
                        applicantLabel(r.getApplicantType()),
                        r.getEmail(),
                        r.getPhone()));
    }

    /** Demande validée ou refusée : informe le demandeur. */
    @Async
    public void notifyApplicantDecision(RegistrationRequest r) {
        String greeting = "Madame".equals(r.getCivility()) ? "Madame" : "Monsieur".equals(r.getCivility()) ? "Monsieur" : "Bonjour";

        if (r.getStatus() == RegistrationStatus.VALIDATED) {
            String body = """
                    %s %s,

                    Bonne nouvelle : votre demande d'inscription à la formation
                    « %s » a été validée.

                    Nous revenons vers vous très rapidement avec la convention ou le
                    contrat de formation, puis la convocation précisant les dates et
                    les modalités de connexion à la classe virtuelle.

                    Pour toute question : contact@hi-techacademy.fr — 07 51 47 41 35.

                    À très bientôt,
                    Mahdi CHEKINI
                    HI-TECH ACADEMY — 73 rue de Reuilly, 75012 Paris
                    Déclaration d'activité n° 11756755575 (préfet de région d'Île-de-France)""";
            send(r.getEmail(),
                    "Votre inscription à « " + r.getFormationTitle() + " » est validée",
                    body.formatted(greeting, r.getLastName(), r.getFormationTitle()));
        } else if (r.getStatus() == RegistrationStatus.REFUSED) {
            String body = """
                    %s %s,

                    Nous vous remercions de l'intérêt porté à la formation
                    « %s ».

                    Après étude, nous ne sommes malheureusement pas en mesure de donner
                    une suite favorable à votre demande d'inscription. N'hésitez pas à
                    nous contacter pour en échanger ou envisager une prochaine session :
                    contact@hi-techacademy.fr — 07 51 47 41 35.

                    Cordialement,
                    Mahdi CHEKINI
                    HI-TECH ACADEMY — 73 rue de Reuilly, 75012 Paris""";
            send(r.getEmail(),
                    "Votre demande d'inscription — " + r.getFormationTitle(),
                    body.formatted(greeting, r.getLastName(), r.getFormationTitle()));
        }
    }

    private void send(String to, String subject, String body) {
        if (!enabled) {
            log.info("Email non envoyé (désactivé) — à: {}, sujet: {}", to, subject);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email envoyé — à: {}, sujet: {}", to, subject);
        } catch (Exception e) {
            // L'échec d'un email ne doit jamais faire échouer le parcours
            log.error("Échec d'envoi d'email — à: {}, sujet: {}", to, subject, e);
        }
    }

    private static String applicantLabel(ApplicantType type) {
        return switch (type) {
            case COMPANY -> "Entreprise";
            case INDEPENDENT -> "Indépendant";
            case INDIVIDUAL -> "Particulier";
        };
    }
}
