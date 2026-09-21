# Page formation — tunnel de vente orienté conversion

Date : 2026-09-18 · Statut : validé en discussion, prêt pour le plan.

## 1. Objectif

`/formations/:formationId` reçoit du trafic publicitaire (froid, majoritairement
mobile). La page doit convertir ce trafic en **demandes de devis** (CTA
principal) et, pour les visiteurs déjà décidés, en **inscriptions** (CTA
secondaire). Elle sert les 5 formations du catalogue avec un seul gabarit.

Critères de succès :
- Un CTA « devis » visible à tout moment (carte collante desktop, barre basse mobile).
- Des preuves *réelles* (témoignages propres à la formation, captures produit),
  jamais inventées. Tout bloc dont la donnée manque est masqué.
- Un rendu « métier » : charte existante, aucune signature visuelle « IA ».
- Les leads arrivent dans l'admin existante, identifiés comme devis, avec e-mail.

## 2. Décisions prises

| Sujet | Décision |
|---|---|
| Conversion | Double CTA : devis (principal, formulaire court) + inscription (secondaire, lien vers `/inscription/:id`). |
| Preuves disponibles | Témoignages réels + captures produit. Pas de photo formateur ni de bloc certifications tant que non fournis. |
| Périmètre | Gabarit commun, mêmes blocs pour les 5 formations ; l'utilisateur remplit les preuves des 4 autres avant mise en ligne. Les entrées vides sont marquées `// À FOURNIR`. |
| Captation lead | Réutilise `POST /registrations` avec `quoteRequest: true`. Backend : passage direct en `PENDING` + notification admin. |
| Témoignages | Plus de liste partagée `temoignagesParDefaut` : chaque formation porte ses avis ou aucun. |

## 3. Structure de la page (ordre = ordre de persuasion)

0. **Barre collante** — desktop : carte prix + CTA devis + lien inscription, `position: sticky`.
   Mobile : barre basse fixe (prix HT · « Recevoir un devis ») affichée dès que le héro est sorti de l'écran.
1. **Héro** — tag, H1 = `vente.accroche`, promesse (`vente.promesse` raccourcie à 2 lignes via `vente.preuves.hero.sousTitre` si fourni, sinon `formation.description`), 3 faits clés (durée · modalité · effectif), CTA devis (ancre `#devis`) + CTA texte « Je m'inscris directement ». Colonne droite : zone photo 16:10 (`preuves.hero.image`), aplat `#f0f7ff` + filet si vide.
2. **Réassurance** — 4 faits vérifiables : formateur en direct · environnement réel · attestation (art. L.6353-1) · réponse sous 24 h ouvrées.
3. **Témoignages** — 2 à 3 `preuves.temoignages` (texte, nom, rôle, entreprise, photo facultative). Masqué si vide.
4. **Avant / Après** — deux colonnes : « Aujourd'hui » (`vente.promesse`, première phrase) / « Demain » (`vente.ctaProjection`).
5. **Ce que vous saurez faire** — `page.objectifs` en grille 3×2.
6. **Programme** — `vente.clusters` numérotés (emojis supprimés), dépliables ; galerie **captures produit** (`preuves.captures`, 3 vignettes légendées, ratio 4:3). Galerie masquée si vide.
7. **Formateur** — `preuves.formateur` : photo, nom, titre, bio, liste de preuves. Masqué si `null`.
8. **Pour qui / pas pour qui** — `vente.cible`.
9. **Inclus + journée type** — `page.inclus` et `page.parcours` (masqué si null).
10. **Tarif & financement** — prix HT/TTC, `page.financements`, mention devis sous 24 h.
11. **FAQ** — `page.faq`, financement et prérequis en tête.
12. **Formulaire devis** (`#devis`) — prénom, nom, e-mail, téléphone, statut (entreprise / indépendant / particulier), nom d'entreprise si non particulier, message facultatif, consentement. Puis lien « Je préfère m'inscrire directement ». État succès inline.
13. Bande CTA finale navy (existante, simplifiée) → ancre `#devis`.

Barre d'ancres collante conservée (Avis · Programme · Formateur · Tarif · FAQ · Devis).

## 4. Contrat de données

### `src/data/ventes.js` — nouveau bloc `preuves` par formation

```js
preuves: {
  hero: { image: '', alt: '', sousTitre: '' },
  captures: [ { image: '', legende: '' } ],      // 0..3
  temoignages: [ { texte, nom, role, entreprise, photo: '' } ],
  formateur: null | { nom, titre, bio, photo: '', preuves: [''] },
}
```
Règles : chaîne vide = absent. `getVenteById` garantit la présence de `preuves` avec des valeurs par défaut vides. Les emojis des `clusters` sont retirés.

### `src/data/formationPage.js`
- Suppression de `temoignagesParDefaut` et de la clé `temoignages` (déplacée dans `ventes.preuves`).
- `faq` réordonnée : financement, prérequis, format, TP, attestation, inscription.

### Backend (`back/`)
- `CreateRegistrationRequest` : nouveau champ `Boolean quoteRequest` (dernier paramètre).
- `RegistrationRequest` (entité) : `private boolean quoteRequest;` — colonne ajoutée par `ddl-auto=update`.
- `RegistrationController.create` : si `quoteRequest`, `status = PENDING`, puis `mailService.notifyAdminNewRequest(saved)` après `save`.
- `AdminListItem` et `AdminDetail` : champ `boolean quoteRequest` exposé (ajouté en fin de record et de `from`).
- `MailService.notifyAdminNewRequest` : objet et première ligne adaptés quand `quoteRequest` (« Nouvelle demande de devis »).

### Admin front (`src/pages/admin/RequestsView.jsx`)
- Badge « Devis » sur la ligne de liste et dans le détail quand `quote_request` est vrai.
- Filtre « Devis » ajouté à la barre de filtres existante.

## 5. Découpage du code

`src/pages/FormationVente.jsx` devient une composition (< 250 lignes) de :

```
src/components/vente/
  atomes.jsx        SectionTitle, Block, IconTile, CheckLine, Fold, ZonePhoto, RADIUS
  HeroVente.jsx
  Reassurance.jsx
  Temoignages.jsx
  AvantApres.jsx
  Objectifs.jsx
  Programme.jsx     (clusters + Captures)
  Formateur.jsx
  PourQui.jsx
  InclusJournee.jsx
  Tarif.jsx
  Faq.jsx
  FormulaireDevis.jsx
  CarteCollante.jsx (desktop) · BarreMobile.jsx
```
Chaque composant reçoit des props explicites (jamais l'objet `vente` entier sauf `Programme`). `ZonePhoto({ src, alt, ratio })` centralise le rendu image / aplat.

## 6. Formulaire devis — flux

1. Validation locale (champs requis, e-mail, téléphone ≥ 10 chiffres, consentement).
2. `createRegistration({ formationId, formationTitle, applicantType, companyName, firstName, lastName, email, phone, notes: message, quoteRequest: true })`.
3. Succès → remplacement du formulaire par un état de confirmation (« Nous vous répondons sous 24 h ouvrées ») + lien inscription.
4. Erreur réseau / 4xx → message inline, formulaire conservé.

## 7. Design

- Couleurs : `NAVY #000c5b`, `TEAL #002d74`, `MINT #9cbdff`, `LINE #dbebff`, `MINT_LIGHT #f0f7ff`, blanc. Aucun dégradé décoratif, aucune ombre flottante (seule la carte collante garde son ombre discrète existante), aucun emoji.
- Typo : Inter (corps), DM Sans (titres via `font-serif-display`).
- Formes : rectangles 8 px, pilules pour les actions, cercles pour numéros/avatars.
- Rythme : sections 48/64 px séparées par un filet ; alternance blanc → `#f0f7ff` → navy (formateur ou CTA finale).
- Images : `object-fit: cover`, `loading="lazy"` hors héro, `alt` renseigné depuis la donnée.
- Accessibilité : formulaire avec `label` explicites, erreurs annoncées (`aria-live`), contrastes AA (déjà vérifiés pour la palette).

## 8. Tests et vérification

- `npx vite build` sans erreur.
- Backend : `mvn -q compile` (pas de suite de tests existante).
- Vérification manuelle des 5 URLs `/formations/*` : blocs masqués quand la donnée manque, aucune erreur console.
- Envoi d'un devis en local → apparaît dans l'admin avec badge « Devis », statut `PENDING`.

## 9. Hors périmètre

Endpoint `/leads` dédié, séquence e-mail automatisée, A/B testing, tracking publicitaire (pixels), nouvelle page d'inscription.
