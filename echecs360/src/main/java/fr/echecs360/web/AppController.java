package fr.echecs360.web;

import fr.echecs360.user.User;
import fr.echecs360.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import java.security.Principal;
import java.util.Map;

/** Application d'échecs (réservée aux utilisateurs connectés). */
@Controller
public class AppController {

    private final UserRepository users;

    public AppController(UserRepository users) {
        this.users = users;
    }

    @GetMapping("/app")
    public String app(Principal principal, Model model) {
        User user = users.findByEmailIgnoreCase(principal.getName()).orElseThrow();
        model.addAttribute("pseudo", user.getPseudo());
        model.addAttribute("chesscomUsername",
                user.getChesscomUsername() == null ? "" : user.getChesscomUsername());
        return "app";
    }

    /** Mémorise le pseudo chess.com après le premier import de parties. */
    @PostMapping("/api/chesscom-username")
    @ResponseBody
    public ResponseEntity<Map<String, String>> saveChesscomUsername(
            @RequestBody Map<String, String> body, Principal principal) {
        String username = body.getOrDefault("username", "").trim();
        User user = users.findByEmailIgnoreCase(principal.getName()).orElseThrow();
        user.setChesscomUsername(username.isBlank() ? null : username);
        users.save(user);
        return ResponseEntity.ok(Map.of("username", username));
    }
}
