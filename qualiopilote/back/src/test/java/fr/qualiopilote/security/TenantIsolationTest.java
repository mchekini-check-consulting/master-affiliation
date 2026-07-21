package fr.qualiopilote.security;

import fr.qualiopilote.organization.Organization;
import fr.qualiopilote.organization.OrganizationRepository;
import fr.qualiopilote.rbac.Role;
import fr.qualiopilote.user.UserAccount;
import fr.qualiopilote.user.UserAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Vérifie l'isolation multi-tenant : un membre connecté d'un organisme ne voit
 * que les comptes de SON organisme via /members, jamais ceux d'un autre.
 */
@SpringBootTest
@AutoConfigureMockMvc
class TenantIsolationTest {

    @Autowired
    MockMvc mvc;
    @Autowired
    OrganizationRepository organizations;
    @Autowired
    UserAccountRepository users;
    @Autowired
    PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        users.deleteAll();
        organizations.deleteAll();

        Organization alpha = creerOrg("Organisme Alpha", "alpha");
        Organization beta = creerOrg("Organisme Beta", "beta");

        creerMembre(alpha, "owner@alpha.fr", Role.OWNER);
        creerMembre(alpha, "manager@alpha.fr", Role.MANAGER);
        creerMembre(beta, "owner@beta.fr", Role.OWNER);
    }

    private Organization creerOrg(String nom, String slug) {
        Organization o = new Organization();
        o.setNom(nom);
        o.setSlug(slug);
        return organizations.save(o);
    }

    private void creerMembre(Organization org, String email, Role role) {
        UserAccount u = new UserAccount();
        u.setOrganizationId(org.getId());
        u.setEmail(email);
        u.setPasswordHash(passwordEncoder.encode("secret"));
        u.setFirstName("Prenom");
        u.setLastName("Nom");
        u.setRole(role);
        u.setActive(true);
        users.save(u);
    }

    private MockHttpSession connexion(String email) throws Exception {
        var result = mvc.perform(post("/auth/login")
                        .contentType("application/json")
                        .content("{\"email\":\"" + email + "\",\"password\":\"secret\"}"))
                .andExpect(status().isOk())
                .andReturn();
        return (MockHttpSession) result.getRequest().getSession(false);
    }

    @Test
    void unMembreNeVoitQueLesComptesDeSonOrganisme() throws Exception {
        MockHttpSession session = connexion("owner@alpha.fr");

        mvc.perform(get("/members").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(content().string(containsString("owner@alpha.fr")))
                .andExpect(content().string(containsString("manager@alpha.fr")))
                .andExpect(content().string(not(containsString("owner@beta.fr"))));
    }

    @Test
    void unAutreOrganismeVoitSaProprePopulation() throws Exception {
        MockHttpSession session = connexion("owner@beta.fr");

        mvc.perform(get("/members").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(content().string(containsString("owner@beta.fr")))
                .andExpect(content().string(not(containsString("alpha.fr"))));
    }

    @Test
    void accesSansSessionEstRefuse() throws Exception {
        mvc.perform(get("/members"))
                .andExpect(status().isUnauthorized());
    }
}
