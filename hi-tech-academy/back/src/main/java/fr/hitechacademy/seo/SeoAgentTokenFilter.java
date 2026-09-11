package fr.hitechacademy.seo;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

/**
 * Authentifie l'orchestrateur SEO par token de service : un header
 * « Authorization: Bearer <SEO_AGENT_TOKEN> » valide donne le rôle SEO_AGENT
 * (routes /seo/**). Token vide en configuration = accès agent désactivé.
 */
@Component
public class SeoAgentTokenFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final String agentToken;

    public SeoAgentTokenFilter(@Value("${app.seo.agent-token:}") String agentToken) {
        this.agentToken = agentToken;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (!agentToken.isBlank() && header != null && header.startsWith(BEARER_PREFIX)) {
            byte[] provided = header.substring(BEARER_PREFIX.length()).getBytes(StandardCharsets.UTF_8);
            byte[] expected = agentToken.getBytes(StandardCharsets.UTF_8);
            // Comparaison en temps constant
            if (MessageDigest.isEqual(provided, expected)) {
                var authentication = new UsernamePasswordAuthenticationToken(
                        "seo-agent", null, List.of(new SimpleGrantedAuthority("ROLE_SEO_AGENT")));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }
        filterChain.doFilter(request, response);
    }
}
