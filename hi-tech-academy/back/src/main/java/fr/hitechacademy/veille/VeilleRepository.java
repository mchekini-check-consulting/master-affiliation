package fr.hitechacademy.veille;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VeilleRepository extends JpaRepository<VeilleItem, UUID> {

    List<VeilleItem> findAllByOrderByAxisAscPositionAsc();

    int countByAxis(VeilleAxis axis);
}
