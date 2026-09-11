package fr.hitechacademy.seo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Configuration du pipeline SEO : une seule ligne (id = 1). Le toggle
 * agent_enabled court-circuite tout : désactivé, l'orchestrateur ne fait
 * aucun appel DataForSEO ni LLM.
 */
@Entity
@Table(name = "seo_config")
public class SeoConfig {

    public static final long SINGLETON_ID = 1L;

    @Id
    private Long id = SINGLETON_ID;

    @Column(nullable = false)
    private boolean agentEnabled = false;

    public Long getId() { return id; }

    public boolean isAgentEnabled() { return agentEnabled; }
    public void setAgentEnabled(boolean agentEnabled) { this.agentEnabled = agentEnabled; }
}
