# Qualiopilote — Plan produit

Plateforme SaaS multi-tenant par abonnement pour organismes de formation (OF)
français : parties prenantes, formations & sessions, génération documentaire
Qualiopi, questionnaires/quiz, automatisations, extranets, émargement &
signature, BPF, abonnement. Le cahier des charges complet fait référence.

## État actuel

**Coquille livrée** (landing + connexion de démonstration + shell back-office).
Le produit lui-même n'est pas encore développé : les phases ci-dessous sont à
venir.

## Décisions & écarts

- **Stack** : le cahier des charges propose Next.js 15 + Prisma + Better Auth +
  shadcn/ui. **Choix retenu : Angular + Spring Boot + PostgreSQL** (cohérence
  avec le monorepo `master-affiliation` et les compétences de l'équipe).
  Implications à porter dans les phases suivantes :
  - UI : shadcn/ui (React) → composants Angular maison + `lucide-angular`.
  - Server Actions → API REST Spring Boot (contexte `/api`).
  - Better Auth → Spring Security (sessions séparées back-office / extranets).
  - React Email/Resend → templating côté back (à définir) ; TipTap reste
    utilisable en Angular pour les champs riches.
  - pg-boss → planificateur côté Spring (ex. Quartz / `@Scheduled` + table de
    jobs) ; Playwright PDF → à trancher (service Node dédié ou alternative JVM).
- **Authentification actuelle** : **factice**, identifiants en dur `test`/`test`
  vérifiés côté Angular, session en `localStorage`. À remplacer par la vraie
  auth multi-tenant en phase 0.
- **SEO** : front Angular prérendu (`outputMode: static`) ; landing et connexion
  prérendues en HTML statique, back-office en CSR (fallback `index.csr.html`).

## Phases (cahier des charges)

- [ ] **Phase 0 — Socle** : auth réelle + organisations, RBAC + DAL scopée,
      layout back-office, thème, seed initial, référentiels (civilités, formes
      juridiques, pays, typologies client/stagiaire BPF, Cerfa 10103, NSF, TVA).
- [ ] **Phase 1 — Parties prenantes** : CRUD clients (entreprise/particulier),
      apprenants, formateurs ; listes filtrables ; « référent → apprenant ».
- [ ] **Phase 2 — Formations** : fiche à onglets (Aperçu, Informations,
      Documents, Questionnaires, Quiz, Formateurs, Déroulement, Paramètres).
- [ ] **Phase 3 — Bibliothèque & documents** : éditeur, registre de variables,
      30 modèles seedés, fusion + génération PDF.
- [ ] **Phase 4 — Sessions & automatisations** : sessions/séances/inscriptions,
      jobs datés, envois email, timeline d'exécution.
- [ ] **Phase 5 — Questionnaires & quiz** : builders, liens publics, réponses,
      statistiques, widgets d'engagement.
- [ ] **Phase 6 — E-learning & extranets** (apprenant / client / formateur).
- [ ] **Phase 7 — Catalogue public, demandes d'inscription, émargement,
      signature simple**.
- [ ] **Phase 8 — Paramètres organisation, BPF, abonnements Stripe, affiliation,
      super-admin plateforme**.

## Livrable actuel — détail (coquille)

- [x] Landing publique (`/`) — présentation + CTA connexion (prérendue, SEO).
- [x] Connexion (`/connexion`) — formulaire `test`/`test`, erreur si incorrect.
- [x] Back-office (`/app`) protégé par un guard — sidebar complète (toutes les
      rubriques du cahier des charges), tableau de bord, et une page « Bientôt
      disponible » par module.
