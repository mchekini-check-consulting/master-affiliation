package fr.hitechacademy.seo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface SeoRunRepository extends JpaRepository<SeoRun, UUID> {

    List<SeoRun> findTop20ByOrderByCreatedAtDesc();

    List<SeoRun> findByStatusOrderByCreatedAtAsc(SeoRunStatus status);

    boolean existsByStatusIn(Collection<SeoRunStatus> statuses);
}
