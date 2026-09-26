# Hi-Tech Academy — règles de design (site public)

## Palette de couleurs (obligatoire partout)

Charte issue du design system `tokens.json` (migration bleu marine du 18/09/2026, primaire passé à `#002d74` le 24/09/2026).

### Les 4 couleurs identitaires

| Rôle | Couleur |
|------|---------|
| **Primaire** (titres sombres, CTA, bandes sombres) | `#002d74` |
| Surfaces, cartes, tags, accents sur fond sombre | `#9cbdff` |
| **Accent bleu vif** — aplats décoratifs, texte BLANC dessus | `#0062e1` |
| Fonds pâles de section | `#f0f7ff` |

### Les paliers techniques

| Rôle | Couleur |
|------|---------|
| Liens, icônes | `#002d74` |
| Survol du primaire (boutons pleins) | `#011f55` |
| Formes et accents **décoratifs** (jamais du texte fin) | `#0066b0` |
| Filets et bordures | `#dbebff` |
| Aplat pâle secondaire (fond de bloc accentué) | `#dfedff` |
| Survol d'un aplat accent | `#004a94` |

### Contraintes d'accessibilité

- `#0062e1` porte du texte **blanc** uniquement — jamais de texte foncé.
- `#0066b0` est décoratif : interdit pour du texte courant. Pour un lien ou une icône porteuse de sens, utiliser `#002d74`.
- `#9cbdff` ne porte que du texte `#002d74` ou `#243037` — jamais de blanc.

### Neutres

- Titres et texte fort `#243037`, texte secondaire `#5f6568`, gris faible `#8c8c8c` / `#adaaaa`.
- Neutres purs tolérés : blanc, `#f3f3f7`, `#f0f0f0`, `#e5e1e1`.
- **Périmètre** : site public uniquement. `src/pages/admin/*`, `Admin.jsx` et `AuditQualiopiContent.jsx` gardent leur propre jeu de couleurs.
- Hors charte par nature, à ne jamais convertir : couleurs d'alerte des formulaires (`#a12626`, `#fdecec`, `#c2410c`, `#8a5a00`, `#fdf3e2`…), couleurs de marque Google et le rouge République Française `#e2001a`.
- Ombres en `rgba(0,45,116,…)` uniquement.
- **Fond du site** : blanc pur (`src/index.css`). Les sections publiques restent `background: 'transparent'` ; seules les cartes gardent un fond blanc.
- Aucune autre teinte (pas de vert, doré, violet…), sauf les couleurs d'alerte.
- Sur fond sombre (`#002d74` / `#002d74`), les accents et mots-clés passent en `#9cbdff`.
- **Titres en `#243037`, jamais en bleu vif** : le bleu reste réservé aux boutons, icônes, fonds et accents.
- Tokens centralisés dans `src/components/design.jsx` : les utiliser plutôt que des hex en dur.

### Rendu propre (anti « effet IA »)

- **Aucun tiret cadratin `—` dans le corps du texte** (accroches, paragraphes, listes, témoignages, légendes...). Reformuler avec une virgule, un point, ou deux phrases. Périmètre : site public uniquement (voir plus haut) ; les commentaires de code n'y sont pas soumis.
- **Aucune `text-shadow` ni `drop-shadow` sur du texte ou des images de contenu.**
- Le blanc est `#ffffff` plein : pas de `text-white/60`, pas de `rgba(255,255,255,0.x)` sur du texte.
- Pas de carte « verre » (`rgba(255,255,255,.06)` + `backdrop-blur`) : des aplats pleins avec une bordure franche.
- Pas de dégradé décoratif de section ni de particules animées : des aplats.
- Interlettrage des grands titres : **−0,015em à −0,02em maximum** (au-delà, les glyphes se touchent et le titre paraît flou).
- Graisse des titres : 700 (le 800 empâte le rendu à l'écran).

## Largeur du contenu

- Contenu à **1400 px utiles** : conteneur de section `max-w-site mx-auto px-4 sm:px-6` (`max-w-site` = 1400 px + 2 × 24 px, défini dans `tailwind.config.js`). Pas d'autre largeur de conteneur, pas de `lg:px-12` qui décalerait l'alignement.
- Exceptions : colonnes de texte seules (FAQ, formulaires) en `max-w-3xl` ; hero et header suivent la même largeur `max-w-site`.
- **Une seule largeur sur tout le site**, sans exception : header, héro, sections Tailwind, sections CSS et footer. Il n'y a plus ni 1500 ni 1600 px.
- Côté Tailwind : `max-w-site`. Côté CSS écrit à la main (`index.css`, `styles/footer.css`) : `width: var(--canvas)`, défini dans `:root`. Les deux valent la même chose — si l'un change, changer l'autre.
- `--canvas-left` (également dans `:root`) donne la distance entre le bord de la fenêtre et le bord du conteneur. **C'est la seule façon correcte d'ancrer un élément en `position: absolute` sur le bord du contenu** (photo du héro, accroches manuscrites). Un `right: 40px` posé sur une section pleine largeur se cale sur la fenêtre, pas sur la grille : c'est ce qui faisait chevaucher l'accroche et les cartes entre 1400 et 1700 px de large.

## Typographie

### Duo typographique

- **Titres : DM Sans** — `<h1>`–`<h6>`, titres de sections, de cartes, d'en-têtes d'action. Variable CSS `--font-heading`, token Tailwind `font-heading` / `font-display`, export `serifFont` de `design.jsx`, classe `.font-serif-display`.
- **Corps et interface : Inter** — paragraphes, descriptions, formulaires, navigation, boutons, badges, métadonnées. Variable `--font-body`, token `font-body`, exports `bodyFont` et `headingFont`.
- **Caveat** reste réservée aux accroches manuscrites décoratives (`--font-hand`, `font-hand`). Jamais pour du contenu porteur d'information.
- Les trois sont chargées par l'`@import` Google Fonts en tête de `src/index.css`.
- Ne plus utiliser Montserrat, Poppins, Plus Jakarta Sans, Bricolage Grotesque, Avalance, Ryker, Source Serif 4 ni Roboto sur le site public (l'admin n'est pas concerné).

> Note sur les noms d'exports de `design.jsx` : ils sont **historiques** et ne correspondent plus à leur intitulé. `serifFont` = police de **titres** (DM Sans, rien d'une serif), `headingFont` = police **d'interface** (Inter). Ils sont conservés pour ne casser aucun composant. Dans une feuille de style, préférer `var(--font-heading)` / `var(--font-body)`.

### Échelle — Major Third (ratio 1.25), base 16 px

| Rôle | Desktop | Mobile (<768px) | Graisse | Interlignage | Interlettrage | Token |
|---|---|---|---|---|---|---|
| Hero / Display | 48 px | 36 px | 800 | 1.15 | −0.02em | `text-hero` |
| H1 | 36 px | 28 px | 700 | 1.2 | −0.02em | `text-h1` |
| H2 | 28 px | 22 px | 700 | 1.25 | −0.01em | `text-h2` |
| H3 | 22 px | 18 px | 600 | 1.3 | 0 | `text-h3` |
| H4 | 18 px | 18 px | 600 | 1.35 | 0 | `text-h4` |
| H5 / H6 | 16 px | 16 px | 600 | 1.4 | 0 | `text-h5` |
| Body Large | 18 px | 18 px | 400 | 1.6 | 0 | `text-body-lg` |
| Body Base | 16 px | **16 px** | 400 | 1.5 | 0 | `text-body-base` |
| Body Small | 14 px | 14 px | 400/500 | 1.4 | 0 | `text-body-sm` |
| Caption | 12 px | 12 px | 400 | 1.33 | 0 | `text-caption` |
| Bouton (CTA) | 16 px | 16 px | 600 | 1.0 | 0 | `text-cta` |
| Lien | 16 px | 16 px | 500 | 1.5 | 0 | — |

Règles fermes :
- **Le corps ne descend jamais sous 16 px**, mobile compris : en dessous, iOS zoome sur les champs de saisie et la lecture décroche.
- L'interlettrage négatif est réservé aux tailles ≥ 28 px. En dessous, il dégrade la lisibilité au lieu de resserrer.
- Utiliser le token (`text-h2`) plutôt que le triplet `text-[28px] font-bold leading-tight` : taille, graisse et interlignage restent solidaires, et la réduction mobile s'applique toute seule.
- Les tailles viennent des variables CSS `--text-*` : changer l'échelle se fait **à un seul endroit**, dans `:root` de `index.css`.

### Longueur de ligne (measure)

- Tout bloc de texte courant : **65 à 75 caractères** — `max-w-measure` (68ch) ou la classe `.measure`.
- Colonne étroite (encadré, légende, colonne latérale) : `max-w-measure-narrow` (56ch) ou `.measure-narrow`.
- Ne jamais laisser un paragraphe occuper les 1400 px de `max-w-site`.

## Mensurations d'interface

Tout tombe sur la **grille de 4 px**, les valeurs structurantes sur **8 px**.

### Hauteurs de contrôles (tokens `h-control*`)

| Contrôle | Hauteur | Padding horizontal | Rayon | Texte |
|---|---|---|---|---|
| Bouton XL (CTA de hero) | 60 px | 32 px (68 px côté pastille) | pilule | 16 px / 600 |
| Bouton L (CTA de section) | 52 px | 28 px | pilule | 16 px / 600 |
| Bouton M (défaut, header) | 44 px | 24 px | pilule | 16 px / 600 |
| Bouton S (tag, filtre) | 36 px | 16 px | pilule | 14 px / 500 |
| Champ de formulaire | 52 px | 16 px | 12 px | 16 px / 400 |
| Zone de texte | 120 px min | 16 px | 12 px | 16 px / 400 |

- **Cible tactile : 44 × 44 px minimum**, y compris pour une icône seule. En dessous, on ajoute du padding invisible plutôt que d'agrandir le visuel.
- Icône dans un bouton : 16 px (bouton S/M), 20 px (L/XL). Gouttière icône↔texte : 8 px.

### Rayons

**Deux formes, pas dix.** Un rayon unique pour toutes les surfaces, une pilule
pour tout ce qui se clique. C'est la multiplication des rayons (22, 15, 12,
24…) qui donne l'air « gabarit généré ».

| Élément | Rayon |
|---|---|
| Boutons, pastilles, tags, onglets | `999px` (pilule) |
| **Toute surface rectangulaire** — cartes, encadrés, tableaux, champs, pastilles d'icône | **8 px** |
| Capsule du header | `999px` (pilule) |
| Panneaux flottants du header (méga-menu, menu mobile) | 24 px |

Corollaire : **pas de vignette arrondie flottant dans une carte arrondie.**
Deux rayons concentriques séparés par un padding, c'est le tic visuel le plus
reconnaissable des maquettes automatiques. L'image affleure le bord de la
carte, qui la détoure via son `overflow: hidden`.

### Rythme vertical

- Entre deux sections : **96 px** desktop / 64 px mobile.
- Entre le titre d'une section et son contenu : **32 px**.
- Entre deux blocs d'une même section : 48 px.
- Entre deux éléments d'une liste : 12 px ; entre deux cartes d'une grille : 24 px.
- **Marge au-dessus d'un titre = 2 × la marge en dessous** (ex. 48 px / 24 px). C'est cette asymétrie qui rattache le titre au contenu qu'il introduit, et non à ce qui le précède. C'est la règle de hiérarchie la plus rentable du document.

### Padding interne

| Conteneur | Padding |
|---|---|
| Carte standard | 28 px (24 px sous 1200 px, 20 px mobile) |
| Carte compacte | 16 px |
| Bandeau / encadré | 32 px |
| Section (gouttière latérale) | `px-4 sm:px-6`, jamais moins de 16 px |

### Élévation (ombres)

Toujours teintées du primaire, jamais en gris neutre ni en bleu nuit :

| Niveau | Valeur |
|---|---|
| Repos (carte) | `0 6px 18px -10px rgba(0,45,116,.16)` |
| Survol / carte active | `0 18px 40px -20px rgba(0,45,116,.28)` |
| Élément flottant (header collé, menu) | `0 8px 24px rgba(0,45,116,.10)` |

## Bouton primaire (obligatoire pour tout CTA principal)

Utiliser **toujours** `PrimaryButton` (`src/components/ui/primary-button.jsx`).

Le bouton est **volontairement simple** : une pilule pleine en `#002d74`, un
libellé blanc, rien d'autre. **Pas d'icône, pas de pastille, pas d'animation
de survol** — seulement un changement de couleur vers `#011f55`. Ne pas
réintroduire de flèche ni d'effet de glissement : c'est une décision explicite.

```jsx
import PrimaryButton from '@/components/ui/primary-button';

<PrimaryButton to="/formations">Choisir ma formation</PrimaryButton>   // lien interne (react-router)
<PrimaryButton href="#contact">Contactez-nous</PrimaryButton>          // lien <a>
<PrimaryButton type="submit" onClick={fn}>Envoyer</PrimaryButton>      // <button>
<PrimaryButton to="/x" inverted>…</PrimaryButton>                      // variante blanche sur fond sombre
<PrimaryButton to="/x" size="lg">…</PrimaryButton>                     // 56 px ; "sm" = 44 px (header)
```

Props : `to` | `href` | (sinon `<button>`), `inverted`, `size` (`sm` 44 px ·
`md` 48 px · `lg` 56 px), `className`, et tout attribut natif. Une prop `icon`
éventuellement transmise par un ancien appel est absorbée sans effet.

## Héro de la page d'accueil

Le héro est sur **aplat `#002d74`**, pas sur blanc. Conséquences à respecter :

- Titre en blanc, mot-clé accentué en `#9cbdff`, chapô en `#dbebff`.
- Filets en `#002d74` (jamais du blanc en opacité).
- Pastilles d'icône en `#9cbdff` avec un glyphe `#002d74` — jamais de blanc sur
  `#9cbdff`.
- Le header reçoit `embedded` et bascule tout seul en variante claire tant qu'on
  n'a pas défilé (`sombre` dans `Header.jsx`) : carré du logo inversé, libellés
  blancs, bouton `inverted`. Si le fond du héro redevient clair, cette bascule
  doit être retirée en même temps.
