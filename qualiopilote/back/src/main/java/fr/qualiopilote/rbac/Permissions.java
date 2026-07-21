package fr.qualiopilote.rbac;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Matrice de permissions par défaut (rôle → module → actions autorisées),
 * source de vérité pour le RBAC. Les rôles personnalisés / surcharges par
 * organisme (stockés en base) seront ajoutés ultérieurement ; ce socle sert
 * de valeurs par défaut.
 */
public final class Permissions {

    private Permissions() {
    }

    private static final Set<Action> TOUTES = EnumSet.allOf(Action.class);
    private static final Set<Action> LECTURE = EnumSet.of(Action.VOIR);
    private static final Set<Action> LECTURE_EXPORT = EnumSet.of(Action.VOIR, Action.EXPORTER);
    private static final Set<Action> GESTION = EnumSet.of(Action.VOIR, Action.CREER, Action.MODIFIER, Action.SUPPRIMER, Action.EXPORTER);

    // Modules « opérationnels » gérés par les managers
    private static final Module[] OPERATIONNELS = {
            Module.CLIENTS, Module.APPRENANTS, Module.FORMATEURS, Module.FORMATIONS,
            Module.SESSIONS, Module.CATALOGUE_PUBLIC, Module.BIBLIOTHEQUE,
            Module.QUESTIONNAIRES, Module.QUIZ, Module.E_LEARNING, Module.EMARGEMENT,
    };

    private static final Map<Role, Map<Module, Set<Action>>> MATRICE = new EnumMap<>(Role.class);

    static {
        // OWNER : tout sur tout
        Map<Module, Set<Action>> owner = new EnumMap<>(Module.class);
        for (Module m : Module.values()) {
            owner.put(m, TOUTES);
        }
        MATRICE.put(Role.OWNER, owner);

        // ADMIN : tout, sauf l'abonnement/facturation en lecture seule
        Map<Module, Set<Action>> admin = new EnumMap<>(Module.class);
        for (Module m : Module.values()) {
            admin.put(m, TOUTES);
        }
        admin.put(Module.ABONNEMENT, LECTURE);
        MATRICE.put(Role.ADMIN, admin);

        // MANAGER : gestion opérationnelle ; BPF export ; paramètres/affiliation en lecture ; pas d'abonnement
        Map<Module, Set<Action>> manager = new EnumMap<>(Module.class);
        for (Module m : OPERATIONNELS) {
            manager.put(m, GESTION);
        }
        manager.put(Module.BPF, LECTURE_EXPORT);
        manager.put(Module.PARAMETRES, LECTURE);
        manager.put(Module.AFFILIATION, LECTURE);
        MATRICE.put(Role.MANAGER, manager);

        // TRAINER : ses formations/sessions/apprenants en lecture, émargement en gestion
        Map<Module, Set<Action>> trainer = new EnumMap<>(Module.class);
        trainer.put(Module.FORMATIONS, LECTURE);
        trainer.put(Module.SESSIONS, LECTURE);
        trainer.put(Module.APPRENANTS, LECTURE);
        trainer.put(Module.QUESTIONNAIRES, LECTURE);
        trainer.put(Module.EMARGEMENT, EnumSet.of(Action.VOIR, Action.CREER, Action.MODIFIER));
        MATRICE.put(Role.TRAINER, trainer);

        // VIEWER : lecture (+ export) sur les modules opérationnels
        Map<Module, Set<Action>> viewer = new EnumMap<>(Module.class);
        for (Module m : OPERATIONNELS) {
            viewer.put(m, LECTURE_EXPORT);
        }
        MATRICE.put(Role.VIEWER, viewer);
    }

    /** Le rôle a-t-il le droit d'effectuer cette action sur ce module ? */
    public static boolean autorise(Role role, Module module, Action action) {
        Set<Action> actions = MATRICE.getOrDefault(role, Map.of()).get(module);
        return actions != null && actions.contains(action);
    }

    /** Actions autorisées pour un rôle sur un module (jamais null). */
    public static Set<Action> actions(Role role, Module module) {
        return MATRICE.getOrDefault(role, Map.of()).getOrDefault(module, Set.of());
    }
}
