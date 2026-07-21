package fr.qualiopilote.user;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Membres (comptes back-office) de l'organisme courant. */
@RestController
@RequestMapping("/members")
public class MemberController {

    private final MemberService members;

    public MemberController(MemberService members) {
        this.members = members;
    }

    @GetMapping
    public List<Map<String, Object>> list() {
        return members.listeDeMonOrganisme().stream()
                .map(u -> {
                    // LinkedHashMap : tolère last_login_at null (Map.of l'interdit)
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", u.getId());
                    m.put("email", u.getEmail());
                    m.put("first_name", u.getFirstName() == null ? "" : u.getFirstName());
                    m.put("last_name", u.getLastName() == null ? "" : u.getLastName());
                    m.put("role", u.getRole().name());
                    m.put("active", u.isActive());
                    m.put("last_login_at", u.getLastLoginAt());
                    return m;
                })
                .toList();
    }
}
