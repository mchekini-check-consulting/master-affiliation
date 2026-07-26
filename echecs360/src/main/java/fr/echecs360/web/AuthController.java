package fr.echecs360.web;

import fr.echecs360.user.User;
import fr.echecs360.user.UserRepository;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

/** Inscription et connexion (formulaires publics). */
@Controller
public class AuthController {

    /** Formulaire d'inscription avec validation serveur en français. */
    public record RegisterForm(
            @NotBlank(message = "L'adresse email est obligatoire")
            @Email(message = "Adresse email invalide")
            String email,
            @NotBlank(message = "Le pseudo est obligatoire")
            @Size(min = 2, max = 30, message = "Le pseudo doit faire entre 2 et 30 caractères")
            String pseudo,
            @NotBlank(message = "Le mot de passe est obligatoire")
            @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
            String password) {
    }

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository users, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/login")
    public String login(Model model) {
        addAuthMeta(model, "Connexion — Échecs360",
                "Connectez-vous à votre compte Échecs360 pour jouer aux échecs, affronter le bot "
                + "et analyser vos parties.", "/login");
        return "login";
    }

    @GetMapping("/register")
    public String registerForm(Model model) {
        model.addAttribute("form", new RegisterForm("", "", ""));
        addRegisterMeta(model);
        return "register";
    }

    @PostMapping("/register")
    public String register(@Validated @ModelAttribute("form") RegisterForm form,
                           BindingResult binding, Model model) {
        if (!binding.hasFieldErrors("email") && users.existsByEmailIgnoreCase(form.email())) {
            binding.rejectValue("email", "email.taken", "Un compte existe déjà avec cette adresse email");
        }
        if (binding.hasErrors()) {
            addRegisterMeta(model);
            return "register";
        }
        User user = new User();
        user.setEmail(form.email().trim().toLowerCase());
        user.setPseudo(form.pseudo().trim());
        user.setPasswordHash(passwordEncoder.encode(form.password()));
        users.save(user);
        return "redirect:/login?registered";
    }

    private static void addRegisterMeta(Model model) {
        addAuthMeta(model, "Créer un compte — Échecs360",
                "Créez votre compte Échecs360 gratuitement : jouez aux échecs à deux, affrontez le "
                + "bot et analysez vos parties chess.com.", "/register");
    }

    private static void addAuthMeta(Model model, String title, String description, String path) {
        model.addAttribute("metaTitle", title);
        model.addAttribute("metaDescription", description);
        model.addAttribute("canonical", "https://echecs360.fr" + path);
    }
}
