package fr.naturaprep.securite;

import fr.naturaprep.membre.Membre;
import fr.naturaprep.membre.MembreRepository;
import java.util.List;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/** Charge un membre par email pour Spring Security. */
@Service
public class AppUserDetailsService implements UserDetailsService {

    private final MembreRepository membres;

    public AppUserDetailsService(MembreRepository membres) {
        this.membres = membres;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Membre membre = membres.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("Membre introuvable"));
        return new User(
                membre.getEmail(),
                membre.getPasswordHash(),
                List.of(new SimpleGrantedAuthority("ROLE_MEMBRE")));
    }
}
