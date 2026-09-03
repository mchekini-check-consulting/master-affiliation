package fr.astonfly.evenement;

import fr.astonfly.commun.Statut;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EvenementRepository extends JpaRepository<Evenement, Long> {

    List<Evenement> findByStatutOrderByDateAsc(Statut statut);
}
