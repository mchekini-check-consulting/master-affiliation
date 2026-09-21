# Page formation — tunnel de vente : plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refondre `/formations/:formationId` en tunnel de vente à double CTA (devis principal, inscription secondaire), avec zones photo et preuves réelles, pour les 5 formations.

**Architecture:** La page `FormationVente.jsx` devient une composition de sections dans `src/components/vente/`. Les preuves vivent dans `ventes.js` (`preuves`). Le lead « devis » réutilise `POST /registrations` avec `quoteRequest: true` ; le backend le passe en `PENDING` et notifie l'admin, qui affiche un badge « Devis ».

**Tech Stack:** React 18 + Vite, Tailwind (classes `text-*` du `tailwind.config.js`), `@phosphor-icons/react`, react-router ; backend Spring Boot 3 / JPA (`ddl-auto=update`), PostgreSQL.

**Spec:** `docs/superpowers/specs/2026-09-18-page-formation-tunnel-vente-design.md`

## Global Constraints

- Couleurs uniquement depuis `src/components/design.jsx` : `NAVY #000c5b`, `TEAL #002d74`, `MINT #9cbdff`, `LINE #dbebff`, `MINT_LIGHT #f0f7ff`, `BODY #243037`, `BODY_MUTED #5f6568`.
- Aucun dégradé décoratif, aucune ombre flottante (sauf carte collante existante), aucun emoji dans l'UI.
- Icônes : `@phosphor-icons/react` uniquement (les `lucide-react` de `formationPage.js` restent pour les objectifs/personas existants).
- Rayon des surfaces : 8 px (`RADIUS`). Actions : pilules (`PrimaryButton`).
- Commentaires de code en français, style du dépôt (expliquer le *pourquoi*).
- Aucune preuve inventée : donnée absente ⇒ bloc masqué ou aplat `MINT_LIGHT`.
- Pas de commit tant que la question GitHub (dossier `drive/` nominatif) n'est pas tranchée ; travailler en local.

---

### Task 1 : Backend — demande de devis (`quoteRequest`)

**Files:**
- Modify: `back/src/main/java/fr/hitechacademy/registration/RegistrationDtos.java` (records `CreateRegistrationRequest`, `AdminListItem`, `AdminDetail`)
- Modify: `back/src/main/java/fr/hitechacademy/registration/RegistrationRequest.java` (entité)
- Modify: `back/src/main/java/fr/hitechacademy/registration/RegistrationController.java:46-92` (`create`)
- Modify: `back/src/main/java/fr/hitechacademy/mail/MailService.java:54-75` (`notifyAdminNewRequest`)

**Interfaces:**
- Produces : JSON entrant `quoteRequest: boolean` (optionnel, défaut `false`) ; JSON sortant admin `quote_request: boolean` (snake_case comme le reste — vérifier la stratégie Jackson du projet).

- [ ] Étape 1 — Entité : ajouter `@Column(nullable = false) private boolean quoteRequest;` + getter/setter, après `needsAdaptation`.
- [ ] Étape 2 — DTO : `Boolean quoteRequest` en dernier paramètre de `CreateRegistrationRequest` ; `boolean quoteRequest` en dernier de `AdminListItem` et `AdminDetail`, et `r.isQuoteRequest()` en dernier argument des deux `from`.
- [ ] Étape 3 — Contrôleur `create` : après `setNeedsAdaptation`, 
  ```java
  boolean devis = Boolean.TRUE.equals(body.quoteRequest());
  r.setQuoteRequest(devis);
  if (devis) r.setStatus(RegistrationStatus.PENDING); // pas de questionnaire préalable pour un devis
  RegistrationRequest saved = repository.save(r);
  if (devis) mailService.notifyAdminNewRequest(saved);
  ```
- [ ] Étape 4 — Mail : sujet et première ligne conditionnels (`r.isQuoteRequest()` ⇒ « Nouvelle demande de devis » / « Le demandeur souhaite recevoir un devis. »).
- [ ] Étape 5 — Vérifier : `cd back && mvn -q -DskipTests compile` (ou `./mvnw`). Attendu : BUILD SUCCESS.

### Task 2 : Données — `preuves` dans `ventes.js`, témoignages par formation

**Files:**
- Modify: `src/data/ventes.js` (5 entrées + `getVenteById`)
- Modify: `src/data/formationPage.js` (supprimer `temoignagesParDefaut`, réordonner `faqParDefaut`, retirer `temoignages` de `getFormationPage`)

**Interfaces:**
- Produces : `getVenteById(id)` retourne toujours `{ ..., preuves: { hero: {image, alt, sousTitre}, captures: [], temoignages: [], formateur: null } }` ; `clusters[].emoji` supprimé.

- [ ] Étape 1 — Ajouter `const PREUVES_VIDES = {...}` et, dans `getVenteById`, fusionner `{ ...PREUVES_VIDES, ...vente.preuves }`.
- [ ] Étape 2 — Kubernetes : `preuves.temoignages` = les 2 avis actuels de `temoignagesParDefaut` (Yanis K., Sarah L. — recueillis sur cette formation) ; `hero.image = '/images/hero-kubernetes-fondamentaux.png'` ; `captures` = 3 entrées `// À FOURNIR` (cluster AKS, support de cours, attestation) ; `formateur: null`.
- [ ] Étape 3 — 4 autres formations : bloc `preuves` complet avec chaînes vides, commentaire `// À FOURNIR avant mise en ligne`.
- [ ] Étape 4 — Supprimer tous les `emoji:` des clusters.
- [ ] Étape 5 — `formationPage.js` : supprimer `temoignagesParDefaut`, la clé `temoignages` du retour ; réordonner `faqParDefaut` (financement en 1er — ajouter la question « Puis-je faire financer cette formation ? » avec réponse OPCO/plan de compétences/personnel — puis prérequis, format, TP, attestation, inscription).
- [ ] Étape 6 — `grep -rn "temoignages" src/` : seuls `ventes.js` et les composants de la Task 3+ doivent rester. Corriger `TestimonialsSection.jsx` s'il consomme `temoignagesParDefaut` (il alimente l'accueil : le faire lire `ventes['kubernetes-fondamentaux'].preuves.temoignages`… ou l'agrégat de toutes les formations via `getTousLesTemoignages()` exporté par `ventes.js`).

### Task 3 : Atomes de la page de vente

**Files:**
- Create: `src/components/vente/atomes.jsx`

**Interfaces (produces):**
```jsx
export const RADIUS = 8;
export function SectionTitle({ kicker, children, sub, dark = false })
export function Block({ id, children, first = false, tone = 'white' | 'pale' | 'navy' })
export function IconTile({ icon: Icon, size = 40 })
export function CheckLine({ children, dark = false, className = '' })
export function Fold({ index, title, children, open, onToggle })
export function ZonePhoto({ src, alt = '', ratio = '16 / 10', className = '', priority = false })
```
- [ ] Étape 1 — Déplacer `SectionTitle`, `Block`, `IconTile`, `CheckLine`, `Fold` depuis `FormationVente.jsx:45-136` (inchangés sauf `Block.tone` qui pose `background` et pleine largeur via `-mx-4 sm:mx-0 px-4 sm:px-0` pour `pale`).
- [ ] Étape 2 — `ZonePhoto` : `<figure style={{ aspectRatio: ratio, borderRadius: RADIUS, overflow: 'hidden', background: MINT_LIGHT, border: 1px solid LINE }}>` ; si `src` ⇒ `<img loading={priority ? 'eager' : 'lazy'} className="w-full h-full object-cover" />`, sinon vide avec `aria-hidden`.

### Task 4 : Sections de contenu (props explicites)

**Files (create, un composant par fichier, `export default`) :**
- `src/components/vente/HeroVente.jsx` — props `{ formation, accroche, sousTitre, facts, image, alt }` ; CTA `PrimaryButton href="#devis"` « Recevoir le programme et un devis » + `Link to={/inscription/:id}` « Je m'inscris directement ». Grille `lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)]`.
- `src/components/vente/Reassurance.jsx` — props `{ items: [{icon, titre, texte}] }` (4 colonnes, filets).
- `src/components/vente/Temoignages.jsx` — props `{ temoignages }` ; retourne `null` si vide ; carte : `ZonePhoto` 1:1 56 px ou initiale, citation, nom · rôle · entreprise.
- `src/components/vente/AvantApres.jsx` — props `{ avant, apres }` ; deux colonnes « Aujourd'hui » (fond blanc) / « Demain » (fond `MINT_LIGHT`, bord `TEAL`).
- `src/components/vente/Objectifs.jsx` — props `{ objectifs }` (grille 3 colonnes, `IconTile`).
- `src/components/vente/Programme.jsx` — props `{ clusters, captures, pdf }` ; clusters en `Fold` numérotés (`index + 1` sur deux chiffres) ; sous-composant `Captures` (grille 3, `ZonePhoto ratio="4 / 3"` + `figcaption`) rendu seulement si `captures.some(c => c.image)`. Lien « Programme officiel (PDF) ».
- `src/components/vente/Formateur.jsx` — props `{ formateur }` ; `null` si absent ; `Block tone="navy"`, photo 4:5 à gauche, texte à droite, `CheckLine dark` par preuve.
- `src/components/vente/PourQui.jsx` — props `{ pour, pasPour }` (deux colonnes, coche / croix).
- `src/components/vente/InclusJournee.jsx` — props `{ inclus, parcours }` ; parcours masqué si null.
- `src/components/vente/Tarif.jsx` — props `{ prixHT, mentionTTC, financements }` ; « Devis sous 24 h ouvrées », CTA `#devis`.
- `src/components/vente/Faq.jsx` — props `{ faq }` (Fold, un seul ouvert à la fois, état interne).

- [ ] Étape 1 — Créer chaque fichier en reprenant le balisage existant de `FormationVente.jsx` (objectifs 468-504, programme 505-555, déroulé 556-619, public 620-678, méthode 679-724, avis 725-754, infos 755-773, financement 774-792, faq 793-809) adapté aux props.
- [ ] Étape 2 — `npx vite build` : succès (les composants ne sont pas encore montés, mais la syntaxe est vérifiée).

### Task 5 : Formulaire devis + carte collante + barre mobile

**Files:**
- Create: `src/components/vente/FormulaireDevis.jsx`
- Create: `src/components/vente/CarteCollante.jsx`
- Create: `src/components/vente/BarreMobile.jsx`

**Interfaces:**
- `FormulaireDevis({ formation })` — état interne `{ applicantType:'COMPANY'|'INDEPENDENT'|'INDIVIDUAL', companyName, firstName, lastName, email, phone, message, consent }` ; validation : requis, e-mail regex simple, téléphone ≥ 10 chiffres, `consent` vrai, `companyName` requis si non particulier ; appel :
  ```js
  createRegistration({
    formationId: formation.id, formationTitle: formation.title,
    applicantType, companyName: isCompany ? companyName : null,
    firstName, lastName, email, phone, notes: message || null, quoteRequest: true,
  })
  ```
  États : `idle | sending | sent | error` ; `sent` remplace le formulaire par une confirmation + lien `/inscription/:id`. Erreurs dans un `<p role="alert">`.
- `CarteCollante({ prixHT, mentionTTC, facts, pdf, inscriptionTo })` — reprend `CarteInscription` (`FormationVente.jsx:265-327`) : CTA principal `href="#devis"` « Recevoir un devis », lien secondaire « Demander une inscription » vers `inscriptionTo`, lien PDF.
- `BarreMobile({ visible, prixHT, resume })` — CTA `href="#devis"` « Recevoir un devis ».

- [ ] Étape 1 — Écrire les trois composants.
- [ ] Étape 2 — `npx vite build` : succès.

### Task 6 : Recomposer `FormationVente.jsx`

**Files:**
- Modify: `src/pages/FormationVente.jsx` (réécriture, < 250 lignes)

- [ ] Étape 1 — Conserver : `useParams`, `document.title`, calculs `fact/prixHT/mentionTTC/durée/modalité` (lignes 206-259), `heroRef`, `barreMobile`, barre d'ancres (ids : `avis`, `programme`, `formateur` si présent, `tarif`, `faq`, `devis`).
- [ ] Étape 2 — Ordre de montage : `Header` → `HeroVente` → `Reassurance` → ancres → `Temoignages` (#avis) → `AvantApres` → `Objectifs` → `Programme` (#programme) → `Formateur` (#formateur) → `PourQui` → `InclusJournee` → `Tarif` (#tarif) → `Faq` (#faq) → `FormulaireDevis` (#devis) → bande CTA finale navy (CTA `#devis`) → `Footer` ; `aside` collant à droite avec `CarteCollante` ; `BarreMobile`.
- [ ] Étape 3 — Supprimer l'ancien code (atomes, `CarteInscription`, blocs).
- [ ] Étape 4 — `npx vite build` : succès. Ouvrir les 5 URLs `/formations/*` : blocs masqués quand donnée vide, pas d'erreur console.

### Task 7 : Admin — badge et filtre « Devis »

**Files:**
- Modify: `src/pages/admin/RequestsView.jsx` (liste ~ligne 1016, détail ~ligne 273-310, filtres ~ligne 923)

- [ ] Étape 1 — Filtres : ajouter `{ key: 'DEVIS', label: 'Devis' }` et dans le filtrage `item.quote_request === true` pour cette clé.
- [ ] Étape 2 — Ligne de liste : `{item.quote_request && <Badge>Devis</Badge>}` à côté du `StatusBadge`.
- [ ] Étape 3 — Détail : même badge dans l'en-tête ; texte d'aide « Demande de devis : pas de questionnaire préalable ».
- [ ] Étape 4 — `npx vite build` : succès.

### Task 8 : Vérification de bout en bout

- [ ] Étape 1 — `npx vite build` final + `mvn -q -DskipTests compile`.
- [ ] Étape 2 — Si le backend tourne en local : envoyer un devis depuis `/formations/kubernetes-fondamentaux`, vérifier `PENDING` + badge « Devis » dans l'admin. Sinon, documenter dans le rapport que le test bout-en-bout reste à faire.
- [ ] Étape 3 — Rapport : fichiers créés/modifiés, entrées `// À FOURNIR` à compléter, commandes à lancer.
