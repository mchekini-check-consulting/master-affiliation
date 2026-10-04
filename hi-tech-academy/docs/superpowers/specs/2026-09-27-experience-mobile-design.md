# Expérience mobile du site public : design

Date : 27/09/2026
Branche : `Correction`
Statut : design validé en conversation, spec à relire

## 1. Objectif

Rendre le site public Hi-Tech Academy pleinement responsive et lui donner une
expérience mobile soignée : tout est lisible et utilisable de 320 px à 768 px,
avec des comportements pensés pour le tactile (menu plein écran, rails au
balayage, CTA collant, animations légères).

### Décisions prises avec le porteur du projet

| Sujet | Décision |
|---|---|
| Ambition | Expérience mobile repensée (corrections + comportements mobiles) |
| Périmètre | Site public complet. L'admin reste tel quel |
| Approche | Socle commun d'abord, puis page par page, dans le système de style existant de chaque section |
| Listes de l'accueil | Catalogue, témoignages et blog en rails au balayage |
| Barre CTA de la page de vente | Libellé court « S'inscrire » sur mobile |
| Vérification | Captures automatiques Playwright |

### Critères de réussite

À 320, 375, 414 et 768 px, sur toutes les pages publiques :

1. Aucun défilement horizontal de la page.
2. Aucun texte tronqué ni débordant de son conteneur.
3. Aucune cible tactile sous 44 × 44 px.
4. Aucun corps de texte sous 16 px.
5. Aucun élément fixe qui en recouvre un autre.
6. À 1280 px, le rendu desktop est identique à l'actuel.
7. `npm run lint` et `npm run build` passent.

### Hors périmètre

- Espace admin (`src/pages/Admin.jsx`, `src/pages/admin/*`, `AuditQualiopiContent`).
- Back.
- Pages sans route (Login, Register, ForgotPassword, ResetPassword).
- Composants jamais importés, ni corrigés ni supprimés :
  `vente/FormulaireDevis`, `vente/Methode`, `vente/Temoignages`,
  `hero/HeroImage`, `hero/TechStat`, `MarqueeStrip`, `ui/card-fan-carousel`,
  `ui/carousel-squeeze`, `ui/story-scroll`, `ui/card-carousel`,
  `ui/colorful-bento-grid`, `ui/footer-section-4`, `ui/text-dia`.
  Un nettoyage pourra faire l'objet d'un chantier séparé.

## 2. Contraintes

- Charte de `hi-tech-academy/CLAUDE.md` : palette `#002d74`, `PrimaryButton`
  pour tout CTA principal, échelle typographique, rayons, rythme vertical.
- Le bouton primaire reste simple : pas d'icône, pas d'animation de survol.
- Pas de dégradé décoratif, pas de carte « verre », pas d'ombre sur le texte.
- Les règles globales `h1` à `h6` et `p` de `index.css` s'appliquent aussi à
  l'admin : elles ne sont pas modifiées. Les changements typographiques passent
  par les tokens et par les composants publics.
- Aucun composant n'est dupliqué en version mobile : le responsive se fait en
  CSS (classes Tailwind, media queries). Le JavaScript n'intervient que pour les
  comportements (balayage, verrouillage du défilement, visibilité de la barre CTA).

## 3. Socle commun (lot 1)

### 3.1 Bouton primaire

Fichier : `src/components/ui/primary-button.jsx`.

- Sous 640 px : le libellé peut passer à la ligne (`whitespace-normal`), le
  texte est centré, la hauteur devient une hauteur minimale, et le bouton ne
  dépasse jamais son conteneur (`max-w-full`).
- Nouvelle prop `block` : le bouton occupe toute la largeur sous 640 px. Elle
  est posée sur les CTA de section qui le demandent.
- À partir de 640 px : comportement actuel inchangé (`whitespace-nowrap w-fit`).

### 3.2 Échelle typographique

Les tailles mobiles sont celles de la charte (sous 768 px) :

| Rôle | Mobile | Token |
|---|---|---|
| Hero | 36 px | `text-hero` |
| H1 | 28 px | `text-h1` |
| H2 | 22 px | `text-h2` |
| H3 | 18 px | `text-h3` |
| Corps | 16 px | `text-body-base` |

- Les `clamp()` inline dont le minimum dépasse l'échelle sont remplacés par le
  token correspondant.
- `index.css:225` (h2 à 38 px sous 640 px) est aligné sur `text-h2`.
- Les chiffres décoratifs (résultats, prix, guillemet des témoignages) gardent
  une taille propre, plafonnée à 40 px sur mobile.
- Les tailles Tailwind en dur des pages Formations, BlogPost, LegalNotices et
  PageNotFound passent aux tokens.

### 3.3 Seuils

Les nouveaux réglages utilisent uniquement 640, 768 et 1024 px (valeurs Tailwind
par défaut). Les seuils existants du CSS manuel ne sont pas modifiés quand ils
fonctionnent.

### 3.4 Éléments fixes en bas d'écran

Ordre d'empilement, du plus haut au plus bas :

1. Bandeau cookies (tant qu'il est affiché).
2. Menu mobile plein écran.
3. Barre CTA de la page de vente, barre d'actions du parcours d'inscription.
4. Bouton « retour en haut ».

- Les z-index sont centralisés dans des variables CSS de `:root`.
- Une variable `--bottom-bar-h` est publiée par la barre fixe présente sur la
  page (0 s'il n'y en a pas). Le bouton « retour en haut » se place à
  `bottom: calc(var(--bottom-bar-h) + 16px + env(safe-area-inset-bottom))`.
- Toutes les barres fixes ajoutent `env(safe-area-inset-bottom)` à leur padding bas.
- `index.html` : ajout de `viewport-fit=cover` à la meta viewport.

### 3.5 Hauteurs d'écran

`--screen-h` utilise `100dvh` avec repli sur `100vh` pour les navigateurs qui
ne le gèrent pas. Le calcul du zoom des grands écrans est conservé.

### 3.6 Débordement horizontal

La cause du débordement est corrigée sur l'accueil et sur À propos, puis les
`overflow-x-clip` de `Home.jsx:17` et `About.jsx:105` sont retirés. Si une
décoration volontairement hors cadre l'exige, le `clip` est posé sur la section
concernée, pas sur la page.

### 3.7 Composant de rail

Nouveau composant `src/components/ui/rail.jsx`, basé sur `embla-carousel-react`
(déjà installé).

- Sous 768 px : défilement horizontal au doigt, aimantation sur chaque carte,
  carte à environ 85 % de la largeur pour laisser voir l'amorce de la suivante,
  points de position.
- À partir de 768 px : le rail rend ses enfants dans la grille existante, sans
  carrousel. Le desktop ne change pas.
- Accessibilité : rôle `region` avec libellé, points de position cliquables
  avec cible de 44 px, navigation au clavier.

### 3.8 Animation d'apparition

Nouveau composant `src/components/ui/reveal.jsx`, basé sur framer-motion.

- Fondu et glissement vertical de 16 px, durée 400 ms, joué une seule fois à
  l'entrée dans l'écran.
- Désactivé si `prefers-reduced-motion: reduce`.
- Appliqué aux titres de section et aux blocs principaux, jamais au héro ni au
  contenu au-dessus de la ligne de flottaison.

## 4. Navigation et accueil (lot 2)

### 4.1 Header et menu mobile

Fichier : `src/components/Header.jsx`.

- Sous 360 px : nom du site réduit et gouttière resserrée pour tenir à 320 px.
- Le panneau mobile devient un menu plein écran : liens en `text-h3`,
  accordéon des formations conservé, défilement interne.
- À l'ouverture : défilement de la page verrouillé, focus placé dans le menu.
  Fermeture par la croix, la touche Échap ou un changement de route.
- Bas du menu : « Voir les formations » (`PrimaryButton`, pleine largeur) et
  « Prendre rendez-vous » (lien secondaire vers `/contact?mode=rendez-vous`).

### 4.2 Sections de l'accueil

| Section | Fichier | Changement mobile |
|---|---|---|
| Héro et carrousel | `hero/HeroSection.jsx`, `hero/HeroCourseCarousel.jsx`, `index.css` (`.hcc*`) | Balayage au doigt, une carte centrée avec amorce de la suivante, points de position. Le défilement automatique s'arrête à la première interaction |
| Parcours par profil | `AboutSection.jsx`, `index.css` (`.audience-*`) | Titre à l'échelle, statistiques sur deux lignes (`flex-wrap`) |
| Catalogue | `FormationsSection.jsx`, `index.css` (`.catalogue-*`) | Rail, lien « Voir toutes les formations » |
| Pourquoi nous | `WhyUsSection.jsx` | Marge verticale à 64 px, titre à l'échelle |
| Résultats | `ResultsSection.jsx` | Grille 2 × 2, chiffres plafonnés à 40 px |
| Méthode | `TimelineSection.jsx` | Frise verticale, marge à 64 px |
| Financement | `FinancementSection.jsx` | Boutons de profil en hauteur automatique, CTA en `block`, padding des blocs à 20 px |
| Témoignages | `TestimonialsSection.jsx` | Rail, guillemet plafonné à 40 px |
| Blog | `BlogSection.jsx` | Rail, extraits à 16 px |
| FAQ | `FAQSection.jsx` | Questions et réponses à 16 px, cibles de 48 px |
| CTA final | `CTASection.jsx` | Bouton en `block` |
| Footer | `Footer.jsx`, `styles/footer.css` | Sous 640 px, colonnes de liens en accordéons |

`ResultsSection` est aussi utilisée par la page de vente : ses corrections
valent pour les deux.

## 5. Page de vente (lot 3)

Fichiers : `src/pages/FormationVente.jsx`, `src/components/vente/*`.

| Section | Fichier | Changement mobile |
|---|---|---|
| Héro | `HeroVente.jsx` | Retrait du haut ramené à 112 px, titre en `text-h1` |
| Carte du héro | `CarteHero.jsx` | Infos clés en une colonne sous 640 px, plus de troncature |
| Objectifs | `Objectifs.jsx` | Titre à l'échelle |
| Programme | `Programme.jsx` | Accordéon conservé, titres à l'échelle |
| Arguments | `Arguments.jsx` | Padding à 20 px, CTA en `block` |
| Formateur | `Formateur.jsx` | Ajustement des tailles |
| Pour qui | `PourQui.jsx` | Padding à 20 px, CTA en `block` |
| Parcours | `Parcours.jsx` | Titre à l'échelle |
| Tarif | `Tarif.jsx` | Prix plafonné à 40 px, liste des détails en une colonne |
| FAQ | `Faq.jsx`, `atomes.jsx` (`Fold`) | Texte à 16 px, cibles de 48 px |
| Barre CTA | `BarreCta.jsx` | Voir ci-dessous |

### Barre CTA fixe

- Prix à gauche, `PrimaryButton` à droite.
- Libellé « S'inscrire » sous 640 px, libellé actuel au-dessus.
- Elle apparaît quand le héro sort de l'écran et se masque quand la section
  Tarif est visible (deux `IntersectionObserver`).
- Elle publie sa hauteur dans `--bottom-bar-h`.

## 6. Parcours d'inscription (lot 4)

Pages : `Inscription`, `AnalyseBesoin`, `QuestionnaireCommanditaire`,
`ApprenantQuestionnaire`, `TestPositionnement`, `EvaluationFinale`.

Les composants partagés sont exportés par `src/pages/Inscription.jsx`.

- **Stepper.** Sous 640 px : « Étape 2 sur 3 », nom de l'étape et barre de
  progression. Au-dessus : les trois colonnes actuelles.
- **Champs.** Texte à 16 px, hauteur de 52 px (charte), attributs `inputMode`,
  `autoComplete` et `type` adaptés à chaque champ.
- **Actions.** Sous 640 px, « Précédent » et « Continuer » sont dans une barre
  fixée en bas, qui publie `--bottom-bar-h`. Le contenu reçoit le padding bas
  correspondant.
- **Quiz.** Chaque réponse est une carte entièrement cliquable, hauteur
  minimale de 52 px, état sélectionné visible.
- **Erreurs.** Les messages restent sous le champ concerné. À la validation, la
  page défile jusqu'au premier champ en erreur.

## 7. Autres pages (lot 5)

| Page | Fichier | Changement mobile |
|---|---|---|
| Formations | `pages/Formations.jsx` | Retrait du haut, titres aux tokens, texte des cartes à 16 px |
| Financements | `pages/Financements.jsx` | Retrait du haut, grilles, titres |
| Contact | `pages/Contact.jsx` | Grilles de créneaux à 2 colonnes sous 640 px, padding à 20 px |
| À propos | `pages/About.jsx`, `PageHero.jsx` | Retrait du haut, titres |
| Réclamations | `ComplaintsSection.jsx` | Grille à 3 colonnes repliée en une colonne |
| Blog | `pages/Blog.jsx` | Ajustement des tailles |
| Article | `pages/BlogPost.jsx` | Règles `img` (`max-width: 100%`) et `pre` (défilement horizontal), couverture en 16/9 sous 640 px |
| Modale livre offert | `BookOffer.jsx` | Sous 640 px : panneau qui monte du bas, hauteur maximale de 90 dvh, défilement interne, champs à 16 px, fermeture de 44 px |
| Pages légales | `LegalNotices`, `PrivacyPolicy`, `TermsAndConditions` | Texte à 16 px, titres aux tokens |
| Cookies | `CookieConsent.jsx`, `CookiePolicy.jsx` | Texte à 16 px, boutons pleine largeur empilés sous 640 px. Le tableau garde son défilement horizontal |
| 404 | `lib/PageNotFound.jsx` | Titre plafonné |

## 8. Vérification

### Outil

Playwright est ajouté en dépendance de développement de `hi-tech-academy`.
Rien n'est ajouté au site en production.

- Script `scripts/captures-mobile.mjs`, lancé par `npm run captures`.
- Il démarre sur le serveur de prévisualisation et capture chaque route
  publique en pleine page à 320, 375, 414, 768 et 1280 px.
- Les captures sont écrites dans `captures/` (ajouté à `.gitignore`).
- Le script mesure aussi, pour chaque page et chaque largeur, si
  `document.documentElement.scrollWidth` dépasse la largeur de la fenêtre, et
  liste les éléments cliquables de moins de 44 px. Il échoue si un débordement
  horizontal est détecté.

### Référence desktop

Avant le lot 1, une série de captures à 1280 px est prise sur l'état actuel.
À la fin de chaque lot, les captures à 1280 px sont comparées à cette référence.

### Pages qui dépendent du back

Les pages du parcours après inscription (`/inscription/demande/:id/...`) et les
articles dynamiques du blog ont besoin de données. Si le back local n'est pas
lancé, elles sont capturées avec des réponses simulées par Playwright, et ce
point est signalé dans le compte rendu du lot.

### Contrôle par lot

1. `npm run lint` et `npm run build`.
2. `npm run captures`.
3. Relecture des captures contre les sept critères de réussite.
4. Compte rendu : ce qui est vérifié, ce qui ne l'est pas, défauts restants.

## 9. Découpage

| Lot | Contenu |
|---|---|
| 0 | Outil de captures et référence desktop |
| 1 | Socle commun (section 3) |
| 2 | Navigation et accueil (section 4) |
| 3 | Page de vente (section 5) |
| 4 | Parcours d'inscription (section 6) |
| 5 | Autres pages (section 7) |

Chaque lot est livré et vérifié avant le suivant.

## 10. Risques

| Risque | Parade |
|---|---|
| Régression desktop | Changements limités aux largeurs sous 1024 px, comparaison des captures à 1280 px |
| Effet de bord sur l'admin | Règles globales `h1` à `h6` et `p` non modifiées. Contrôle visuel de `/admin` à la fin du lot 1 |
| Trois systèmes de style | Chaque section est corrigée dans son système actuel, sans migration |
| Estimations de l'audit | Les largeurs de débordement viennent d'une lecture du code. Les captures du lot 0 donnent l'état réel avant toute correction |
| Passage à `100dvh` | Repli sur `100vh`, contrôle des pages en `min-h-screen` |
