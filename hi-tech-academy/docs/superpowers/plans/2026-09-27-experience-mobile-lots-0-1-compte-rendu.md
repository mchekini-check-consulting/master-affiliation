# Expérience mobile, lots 0 et 1 : compte rendu

Date : 27/09/2026
Plan : `docs/superpowers/plans/2026-09-27-experience-mobile-lots-0-1.md`
Aucun commit n'a été fait : les changements sont dans l'arbre de travail.

## 1. Vérifié

| Commande | Résultat |
|---|---|
| `npm run test:mobile` | 106 tests réussis, 0 échec |
| dont `debordement.spec.js` | 68 sur 68 (17 routes × 4 largeurs) |
| dont `desktop.spec.js` | 17 sur 17 (rendu à 1280 px identique à la référence, 300 pixels d'écart tolérés) |
| dont `socle.spec.js` | 3 sur 3 |
| dont `elements-fixes.spec.js` | 13 sur 13 |
| dont `bouton.spec.js` | 5 sur 5 |
| `npm run captures -- apres-lot-1` | 85 captures, aucune page avec défilement horizontal |
| `npm run build` | réussi (lancé par chaque série de tests) |
| `npm run lint` | 2 erreurs, toutes deux présentes avant le chantier (voir section 5) |

Chaque test a été vu en échec avant la correction, sauf « le bandeau cookies
passe au-dessus de la barre CTA », qui passait déjà : il sert de garde contre
une régression.

Contrôle visuel fait sur captures à 320 et 375 px : CTA de la section
financement, barre CTA de la page de vente avec le bouton « retour en haut »,
titre de la section profils.

## 2. État de départ

Pages avec défilement horizontal avant le lot :

| Page | Largeur | Éléments en cause |
|---|---|---|
| `/formations/kubernetes-fondamentaux` | 320 px | Contenu large de 337 px : bloc d'un bouton primaire sans retour à la ligne, qui élargit toute la page, header compris |
| `/formations/management-processus-ia` | 320 px | Même cause |

Aucune autre page ne défilait horizontalement. L'audit par lecture du code
annonçait plus de débordements qu'il n'y en a réellement.

Éléments qui sortent de la fenêtre sans faire défiler la page (masqués par un
`overflow`) : 165 au total sur les 85 captures.

## 3. État après le lot 1

| Mesure | Avant | Après |
|---|---|---|
| Pages avec défilement horizontal | 2 | 0 |
| Éléments qui sortent de la fenêtre | 165 | 132 |
| Pages de vente à 320 px, éléments qui sortent | 16 | 1 |
| Cibles tactiles sous 44 px (largeurs mobiles) | 1680 | 1680 |

Ce qui reste, et le lot qui le traite :

| Constat | Lot |
|---|---|
| Accueil : les cartes latérales du carrousel du héro sortent de la fenêtre (23 éléments à 375 px). C'est la cause du `overflow-x-clip` de `Home.jsx` | 2 |
| Header à 320 px : le bouton du menu dépasse de la capsule | 2 |
| Un conteneur fixe `div.fixed.top-0.z-[100]` dépasse de 16 px sur toutes les pages : c'est la zone des notifications, vide et invisible | 2 |
| Cibles tactiles sous 44 px : liens du footer (24 px de haut), logo du header (40 px), répétés sur toutes les pages | 2 |
| Boutons primaires sur deux ou trois lignes à 320 px (92 px de haut pour le CTA de la section financement) : rien ne déborde, mais la pilule est peu lisible. Piste : padding latéral réduit sous 640 px, libellés raccourcis | 2 et 3 |

## 3 bis. Relecture indépendante

Une relecture par un agent séparé n'a relevé aucun constat critique et cinq
constats importants, tous corrigés :

| Constat | Correction |
|---|---|
| Barre CTA haute de 89 px sur mobile, bouton sur deux lignes, résumé tronqué | Libellé court « S'inscrire » sous 640 px (avancé depuis le lot 3). Barre à 69 px, résumé entier. Test vu en échec (89 px) puis réussi |
| Le test de recouvrement passait même barre cachée | Le test vérifie d'abord que la barre est affichée |
| Le test de changement de page rechargeait le document | Navigation par clic sur un lien interne, sans rechargement |
| Un serveur déjà lancé pouvait servir un ancien build | Le serveur n'est plus réutilisé |
| La comparaison desktop tolérait de gros écarts et ne voyait pas les éléments fixes | Seuil absolu de 300 pixels, plus une capture de fenêtre après défilement |

Constats mineurs reportés, à décider :

- `--bottom-bar-h` est surévalué sur les écrans de 2048 px et plus (zoom de page) : l'écart sous le bouton « retour en haut » y est de 63 px au lieu de 32. Aucun recouvrement.
- Le hook `useBottomBar` suppose une seule barre par page. À revoir si le lot 4 en ajoute une.
- `PrimaryButton` reçoit `max-w-full` et `text-center` à toutes les largeurs. Sans effet mesuré à 640, 768, 1024 et 1280 px sur trois pages.
- Le test de débordement ne voit pas un contenu coupé par `overflow-x-clip`. Le rapport de captures le voit.
- Le script de captures perd tout son rapport si une seule page échoue.
- Les captures de référence desktop ne sont pas versionnées : elles n'existent que sur ce poste.

## 4. Non vérifié

- **Intérieur de l'admin.** `/admin` affiche l'écran de connexion sans le back. Cet écran est identique à l'attendu, mais les vues internes n'ont pas été contrôlées.
- **Pages du parcours après inscription** (`/inscription/demande/:id/...`). Absentes des routes testées, prévues au lot 4.
- **Articles dynamiques du blog.** Le back est simulé (réponse 503) : seuls les articles statiques sont capturés.
- **Zone sûre sur un vrai iPhone.** Chromium ne simule pas l'encoche ni la barre d'accueil.
- **Navigateur sans `dvh`.** Le repli sur `100vh` est contrôlé par relecture, pas par un test.
- **Safari et Firefox.** Les tests tournent sur Chromium uniquement.

## 5. Décisions prises pendant l'exécution

| Décision | Raison | Coût si c'est faux |
|---|---|---|
| Aucun commit | Demande du porteur du projet | Commits à faire après validation |
| `npm` et `npx` sans le préfixe `rtk` | `rtk npm` échoue sur ce poste (« program not found ») | Sorties de commande plus longues |
| Délai des assertions Playwright porté à 30 s | La capture stable de l'accueil dépasse les 5 s par défaut | Tests plus lents quand ils échouent |
| Écart sous le bouton « retour en haut » gardé à 24 px | La spec donne 16 px, mais la position desktop aurait bougé | Un réglage à changer |

Erreurs de lint présentes avant le chantier, non corrigées car hors périmètre :

- `src/pages/Financements.jsx:12` : import `Starfield` inutilisé.
- `src/pages/admin/ComplaintsView.jsx:4` : import `Badge` inutilisé.
