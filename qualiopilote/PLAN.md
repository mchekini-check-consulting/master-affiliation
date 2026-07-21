# Qualiopilote — Plan produit

Plateforme SaaS multi-tenant par abonnement pour organismes de formation (OF)
français : parties prenantes, formations & sessions, génération documentaire
Qualiopi, questionnaires/quiz, automatisations, extranets, émargement &
signature, BPF, abonnement. Le cahier des charges complet fait référence.

## État actuel

**Phase 0 (Socle) livrée** : authentification réelle multi-tenant, RBAC et DAL
scopée par organisme, référentiels, seed initial. Le reste du produit (phases
1→8) est à venir.

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
- **Authentification** : réelle depuis la phase 0 — Spring Security par session
  (cookie), comptes `user_accounts` rattachés à un `organizations`, mots de passe
  BCrypt. Le front interroge `/api/auth/login`, `/me`, `/logout` en
  `withCredentials`. L'auth factice `test`/`test` a été supprimée.
- **SEO** : front Angular prérendu (`outputMode: static`) ; landing et connexion
  prérendues en HTML statique, back-office en CSR (fallback `index.csr.html`).
- **Compte de démonstration** (seed) : `demo@qualiopilote.fr` / `demo`, rôle
  OWNER de l'organisme « Organisme de démonstration » (slug `demo`). Seed
  idempotent, désactivable via `app.seed.enabled=false` ; identifiants
  paramétrables par variables d'environnement `SEED_*`.

## Phases (cahier des charges)

- [x] **Phase 0 — Socle** : auth réelle + organisations, RBAC + DAL scopée,
      layout back-office, thème, seed initial, référentiels (civilités, formes
      juridiques, pays, typologies client/stagiaire BPF, Cerfa 10103, NSF, TVA).
      Sidebar filtrée par permissions ; test d'isolation inter-tenant vert.
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

## Phase 0 — détail livré

### Backend (`back/`)

- [x] Sécurité par session (Spring Security) : BCrypt, entrée 401 JSON, CSRF
      désactivé pour l'API, `HttpSessionSecurityContextRepository`.
- [x] Entités `organizations` (tenant) et `user_accounts` (membre + rôle RBAC).
- [x] RBAC en dur : `Role` (OWNER/ADMIN/MANAGER/TRAINER/VIEWER) ×
      `Module` × `Action`, matrice `Permissions`.
- [x] `TenantContext` : organizationId/userId/role du principal + `requirePermission`.
- [x] DAL scopée : `MemberService`/`MemberController` (`GET /api/members`) ne
      renvoie que les comptes de l'organisme courant.
- [x] `AuthController` : `POST /api/auth/login`, `POST /logout`, `GET /me`
      (profil + organisme + permissions calculées pour la sidebar).
- [x] Référentiels JSON (`classpath:referentiels/*.json`) exposés en lecture via
      `GET /api/referentiels` et `/api/referentiels/{clé}`.
- [x] Seed initial idempotent (organisme démo + compte OWNER).
- [x] Test d'isolation multi-tenant (`TenantIsolationTest`) — 3 cas verts.

### Front (`front/`)

- [x] Landing publique (`/`) et connexion (`/connexion`) prérendues (SEO).
- [x] `AuthService` réel : login/me/logout via l'API en `withCredentials`,
      session en `signal`, helper `peut(module, action)`.
- [x] Guard back-office : valide le cookie de session via `/api/auth/me` dans
      le navigateur (CSR).
- [x] Sidebar filtrée par permissions RBAC ; nom d'organisme + e-mail au pied.
- [x] Une page « Bientôt disponible » par module (phases 1→8 à venir).
