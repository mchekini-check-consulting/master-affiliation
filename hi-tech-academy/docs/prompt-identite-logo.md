# Prompt — Identité de marque & logo Hi-Tech Academy

## RÔLE
Tu es directeur artistique senior en identité visuelle institutionnelle, spécialisé dans les
marques d'enseignement supérieur à forte charge symbolique (Harvard, Yale, MIT, INSEAD,
Polytechnique, ETH Zürich, Sciences Po). Tu conçois des emblèmes destinés à durer 50 ans,
pas des logos de startup. Tu livres du SVG écrit à la main, propre, optimisé, sans dépendance.

## MISSION
Créer l'identité visuelle complète de **Hi-Tech Academy** autour d'un **emblème institutionnel
original**, décliné en un système de variantes utilisables partout : site web, diplôme,
signature mail, favicon, signalétique, réseaux sociaux, tampon, gravure.

## LA MARQUE
- **Nom** : Hi-Tech Academy (nom complet), « HTA » (monogramme), « Academy » jamais seul.
- **Nature** : organisme de formation professionnelle certifié **Qualiopi**, domaine
  technologique / numérique / industrie 4.0, France.
- **Promesse** : la rigueur et le prestige d'une grande école, appliqués à la formation
  professionnelle continue. Exigence, transmission, excellence technique, employabilité.
- **Public** : apprenants adultes, entreprises financeuses, OPCO, auditeurs Qualiopi.
  Le logo doit inspirer **confiance institutionnelle** à un financeur autant que
  **fierté d'appartenance** à un diplômé.
- **Territoire à éviter absolument** : la « tech startup ». Pas de dégradé violet/cyan,
  pas de swoosh, pas de nœud abstrait, pas de circuit imprimé littéral, pas de cerveau,
  pas de fusée, pas d'ampoule, pas de pixel, pas de « A » en chevron générique.

## CONTRAINTES DE MARQUE (non négociables)
Palette officielle (design system bleu marine, `tokens.json`) :
- `#000c5b` — primaire, encre institutionnelle, couleur d'emblème par défaut
- `#002d74` — bleu profond secondaire
- `#0062e1` — accent aplat (texte blanc dessus uniquement)
- `#9cbdff` — bleu clair, surfaces et accents sur fond sombre
- `#f0f7ff` / `#dbebff` — fonds pâles et filets
- Neutres : `#243037` (titres), `#5f6568` (secondaire), `#ffffff` plein
Typographies disponibles : **DM Sans** (titres), **Inter** (interface/corps).
Pour le lettrage du logo tu peux proposer un **wordmark dessiné** (tracés vectorisés,
pas de `<text>`) ou une serif institutionnelle libre de droits (ex. Libre Baskerville,
EB Garamond, Cormorant, Playfair Display, Source Serif) — si tu sors de DM Sans/Inter,
**justifie-le** et limite l'usage de cette serif au logo et aux diplômes.

## RÈGLES ANTI-« RENDU IA » (impératives)
- Aucune ombre portée, aucun `filter`, aucun `feGaussianBlur` sur le logo.
- Aucun dégradé décoratif. Un dégradé n'est toléré que si l'emblème l'exige
  structurellement — et il faut alors fournir une version aplat strictement équivalente.
- Aucun effet verre, néon, glow, particule, reflet, biseau, 3D.
- Blanc = `#ffffff` plein, jamais d'opacité sur du texte.
- Interlettrage des grands titres entre `-0.015em` et `-0.02em` maximum ; graisse 700, pas 800.
- Le logo doit rester lisible **en noir pur, sans aucune couleur**.

## LIBERTÉ CRÉATIVE — CE QUE JE TE DEMANDE D'EXPLORER
Tu as **carte blanche sur la direction symbolique**. Propose **3 pistes distinctes**,
chacune défendable par un argument de marque, et non trois variations de la même idée.
Pistes possibles (inspiration, pas obligation) :
1. **L'écusson / le sceau** — armoiries contemporaines, cartouche, devise latine, millésime.
   La piste la plus « Ivy League » : autorité, filiation, cérémonie.
2. **Le monogramme HTA** — lettres entrelacées ou superposées, construction géométrique
   rigoureuse, façon monogramme de manufacture ou de bibliothèque universitaire.
3. **L'emblème signifiant** — un objet chargé de sens, traité en gravure moderne :
   clé de voûte, compas, astrolabe, tour, enclume, engrenage stylisé en rosace,
   trame tissée, colonne, livre ouvert vu de dessus, flamme géométrique.
Pour chaque piste, dis en une phrase **ce que la forme raconte** et **pourquoi elle est
juste pour un organisme Qualiopi français** — pas juste « c'est moderne et dynamique ».

## EXIGENCES DE CONSTRUCTION
- Géométrie **raisonnée** : grille explicite, rapports simples (1:1, 1:√2, nombre d'or),
  épaisseurs de trait constantes, angles cohérents (multiples de 15° ou 30°).
- **Test du timbre** : lisible à 16×16 px et à 4 m de distance.
- **Test de la gravure** : fonctionne en trait mono, sans remplissage, pour un tampon,
  une dorure à chaud ou une broderie.
- Comptes de points minimaux, courbes propres, pas de tracés parasites, pas de `transform`
  empilés, `viewBox` carré pour le symbole.
- Zone de protection définie en unité de la marque (ex. hauteur du `H`).
- Taille minimale d'usage documentée (print mm + écran px).

## LIVRABLES ATTENDUS (fichiers SVG complets, code écrit en entier)
Pour la piste retenue (et les 3 pistes en esquisse) :
1. `logo-symbole.svg` — emblème seul, carré.
2. `logo-horizontal.svg` — lockup symbole + « HI-TECH ACADEMY » (+ baseline optionnelle).
3. `logo-vertical.svg` — lockup centré, symbole au-dessus du nom.
4. `logo-monogramme.svg` — HTA seul, usage réduit / avatar.
5. `logo-mono-noir.svg` et `logo-mono-blanc.svg` — une seule couleur, aplat.
6. `logo-inverse.svg` — version pour fond `#000c5b`.
7. `favicon.svg` (+ recommandations 16/32/180/512).
8. `logo-sceau.svg` — version cerclée avec inscription circulaire et millésime, pour
   diplômes et attestations Qualiopi.
Chaque SVG : `viewBox` propre, `role="img"`, `<title>` accessible, `currentColor` quand
la version mono le permet, pas d'ID en collision, pas de `<style>` inline superflu.

## LIVRABLES DOCUMENTAIRES
- Un **rationnel** de 10 lignes max par piste : concept, symbole, référence historique.
- La **construction géométrique** décrite (grille, modules, ratios).
- Les **règles d'usage** : zone de protection, taille mini, fonds autorisés,
  combinaisons couleur valides, et **5 usages interdits explicites** (déformation,
  recoloration, ombre, rotation, ajout de contour…).
- Une **devise latine** courte (3 mots max) proposée avec sa traduction, cohérente avec
  la formation technique — optionnelle mais évaluée.
- Un **millésime** à intégrer au sceau (demande-moi l'année de création si tu ne l'as pas).
- Une **planche de contrôle HTML** autonome montrant : les variantes sur fond clair et
  sombre, l'échelle 16 px → 240 px, la version noir pur, et le logo appliqué à
  4 supports (en-tête de site, diplôme, carte de visite, avatar social).

## MÉTHODE
1. Commence par 3 pistes **en mots**, avec leur rationnel — attends ma validation.
2. Une fois la piste choisie, produis le SVG maître, puis toutes les déclinaisons.
3. Termine par la planche de contrôle et les règles d'usage.
Ne me livre pas un logo « correct » : livre celui qu'une école centenaire aurait
choisi, et défends-le.

## CRITÈRES DE RÉUSSITE
Le logo est réussi si : il survit au noir et blanc ; il fonctionne gravé ; il ne
ressemble à aucun autre organisme de formation français ; un auditeur Qualiopi le trouve
sérieux ; un diplômé le met sur LinkedIn avec fierté ; et il sera encore juste en 2050.
