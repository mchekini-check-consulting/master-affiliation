package fr.echecs360;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestBuilders.formLogin;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.response.SecurityMockMvcResultMatchers.authenticated;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrlPattern;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Parcours d'authentification : inscription, connexion, protection de /app
 * et accessibilité des pages publiques (SSR du blog compris).
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = "spring.datasource.url=jdbc:h2:mem:echecs360-test;MODE=PostgreSQL")
class AuthFlowTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void visiteurNonConnecteRedirigeVersLogin() throws Exception {
        mvc.perform(get("/app"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrlPattern("**/login"));
    }

    @Test
    void pagesPubliquesAccessiblesSansCompte() throws Exception {
        mvc.perform(get("/")).andExpect(status().isOk());
        mvc.perform(get("/blog")).andExpect(status().isOk());
        mvc.perform(get("/sitemap.xml")).andExpect(status().isOk());
        mvc.perform(get("/robots.txt"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Disallow: /app")));
        // SSR : le texte de l'article est présent dans le HTML initial
        mvc.perform(get("/blog/le-roque-explique-simplement"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString(
                        "le roi se déplace de deux cases".replace("le roi", "roi"))));
    }

    @Test
    void inscriptionPuisConnexionPuisAccesApp() throws Exception {
        // Inscription
        mvc.perform(post("/register").with(csrf())
                        .param("email", "test@echecs360.fr")
                        .param("pseudo", "Testeur")
                        .param("password", "motdepasse8"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login?registered"));

        // Connexion → redirection vers /app
        var login = mvc.perform(formLogin().user("test@echecs360.fr").password("motdepasse8"))
                .andExpect(authenticated())
                .andExpect(redirectedUrl("/app"))
                .andReturn();

        // /app accessible une fois connecté
        mvc.perform(get("/app").session(
                        (org.springframework.mock.web.MockHttpSession) login.getRequest().getSession()))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Deux joueurs")));
    }

    @Test
    void validationInscriptionEnFrancais() throws Exception {
        mvc.perform(post("/register").with(csrf())
                        .param("email", "pas-un-email")
                        .param("pseudo", "X")
                        .param("password", "court"))
                .andExpect(status().isOk())
                .andExpect(model().attributeHasFieldErrors("form", "email", "pseudo", "password"));
    }
}
