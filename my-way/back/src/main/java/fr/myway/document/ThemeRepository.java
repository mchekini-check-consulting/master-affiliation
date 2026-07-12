package fr.myway.document;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ThemeRepository extends JpaRepository<Theme, Long> {
    boolean existsByNameIgnoreCase(String name);
    List<Theme> findAllByOrderByNameAsc();
}
