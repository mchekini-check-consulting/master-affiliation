---
name: page-vente
description: Transforme n'importe quelle offre (formation, coaching, service, SaaS, produit digital, ebook, atelier) en page de vente complète selon le modèle "bénéfice + curiosité". Génère systématiquement 5 sections - accroche, promesse, programme/contenu réécrit, cible, CTA - en intégrant naturellement les mots-clés SEO/métier du domaine. Utiliser ce skill dès que l'utilisateur demande une page de vente, un tunnel de vente, une landing page, une offre "vendeuse", des titres accrocheurs, ou de "rendre vendeur" un contenu - même s'il fournit seulement une liste brute de modules, de fonctionnalités ou de livrables. S'applique à tout domaine (IA, comptabilité, business, tech, santé, immobilier, etc.) et à tout type d'offre.
---

# Page de vente (modèle bénéfice + curiosité)

Ce skill transforme n'importe quelle offre en page de vente prête pour un tunnel de vente. La règle d'or : **la personne voit ce qu'elle va GAGNER, sans qu'on lui révèle le contenu ni la méthode**.

Types d'offres couverts : formation, coaching, accompagnement, service, SaaS, produit digital, ebook, atelier, masterclass, abonnement. Le "programme" (section 3) s'adapte : modules pour une formation, fonctionnalités pour un SaaS, livrables pour un service, chapitres pour un ebook, étapes pour un accompagnement.

Langue : français par défaut ; si l'offre ou la demande est dans une autre langue, rédiger dans cette langue en gardant les mêmes règles.

## Structure de sortie (toujours ces 5 sections, dans cet ordre)

1. **Accroche** — 1 phrase choc qui interpelle la cible (question, douleur, ou promesse audacieuse). Max 15 mots.
2. **Promesse** — 2-3 phrases : la transformation concrète obtenue ("Avant → Après"). Jamais de description du contenu, uniquement le résultat pour la personne.
3. **Programme / Contenu** — tous les éléments (modules, fonctionnalités, livrables, étapes...) réécrits au format bénéfice + curiosité (voir règles ci-dessous), organisés en clusters thématiques avec un emoji et un titre de cluster lui-même vendeur.
4. **Cible** — "C'est fait pour vous si..." : 3-5 puces identifiantes (situations vécues, frustrations, ambitions). Optionnel : 2-3 puces "Ce n'est PAS pour vous si..." pour renforcer la crédibilité — et rediriger vers une autre offre du catalogue si elle existe.
5. **CTA** — appel à l'action : 1 phrase d'urgence ou de projection + le bouton/l'action (ex. "Réservez votre place", "Essayez gratuitement", "Téléchargez le programme complet"). Proposer 2 variantes de CTA (une urgence, une projection).

## Règles de réécriture des éléments (bénéfice + curiosité)

Chaque titre DOIT :
- **Montrer un gain** : temps gagné, argent, compétence, statut, sécurité, sérénité ("Rédigez en 5 minutes ce qui vous prenait 1 heure").
- **Créer un manque** : teaser sans révéler la méthode ("le pouvoir caché de...", "ce que personne ne vous a expliqué", "l'arme secrète que...", "avant d'en être victime").
- **Rester court** : idéalement moins de 15 mots après les deux-points.
- **Parler à la 2e personne** (VOUS/votre) chaque fois que possible ; les majuscules d'emphase (VOUS, JAMAIS, AGIR) avec parcimonie, 1 max par cluster.

Formules qui fonctionnent (varier, ne jamais utiliser la même deux fois de suite) :
- Résultat chiffré : "X en Y minutes", "10x meilleures"
- Question implicite : "lequel est fait pour VOUS ?"
- Interdit/danger : "ce que vous ne devez JAMAIS...", "les erreurs qui peuvent vous coûter cher"
- Secret/révélation : "le secret des...", "ce qu'ils font à la place", "le pouvoir caché de..."
- Avant/après : "quand l'IA arrête de répondre et commence à AGIR"
- Projection : "repartez avec VOTRE...", "prêt à l'emploi"

Interdictions strictes :
- ❌ Phrases explicatives longues ou descriptives de type article ("le marché s'est rééquilibré et plusieurs modèles coexistent...")
- ❌ Révéler la méthode ou la réponse dans le titre
- ❌ Jargon non expliqué pour une cible grand public (adapter le niveau de jargon à la cible)
- ❌ Titres plats de type sommaire ("Introduction à X", "Présentation de Y")
- ❌ Promesses invérifiables ou mensongères (revenus garantis, résultats médicaux, "sans effort") — rester vendeur mais honnête

## Intégration des mots-clés

Identifier les mots-clés du domaine (fournis par l'utilisateur ou déduits du contenu) et les tisser NATURELLEMENT dans les titres — jamais en liste. Exemples : IA, RAG, MCP, Agents, prompting pour une offre IA ; facturation électronique, Plateforme Agréée, conformité pour la comptabilité ; SEO, funnel, conversion pour le marketing.

Règles :
- Chaque mot-clé prioritaire apparaît au moins 1 fois dans le programme et 1 fois dans accroche/promesse/cible si pertinent.
- Le mot-clé technique est toujours accompagné d'un bénéfice qui le rend désirable même pour qui ne le connaît pas ("RAG : branchez l'IA sur VOS documents et obtenez des réponses fiables").
- Ne pas sur-optimiser : maximum 1-2 mots-clés par titre.

## Adaptation à la cible

Avant de rédiger, déterminer (demander si ambigu) :
- **Grand public / débutants** → zéro jargon non teasé, bénéfices quotidiens (temps, argent, famille, sérénité)
- **Business / entrepreneurs** → bénéfices ROI, clients, croissance, avantage concurrentiel
- **Tech / experts** → bénéfices carrière, production, maîtrise, état de l'art ; le jargon pointu devient un ATOUT d'accroche
- **Métier réglementé (compta, juridique, santé...)** → bénéfices conformité, sécurité, sanctions évitées, sérénité

## Format de sortie

- Markdown par défaut ; proposer ensuite un export (PDF stylé, docx ou landing page HTML) sans le générer d'office.
- Emojis : 1 par titre de cluster, aucun dans les titres des éléments.
- Numérotation continue des éléments sur toute l'offre.
- Terminer par 1-2 questions d'itération max (ex. ajuster le ton, la cible, le CTA).

## Exemple de référence

Lire `references/exemple-formation-ia.md` pour un exemple complet validé (formation "IA pour tous") montrant le ton exact attendu, du titre à la structure des clusters. S'en inspirer pour le style, jamais le copier pour un autre domaine ou un autre type d'offre.
