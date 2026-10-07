# Product Marketing Context — Hi-Tech Academy

**Document version:** v1
**Last updated:** 2026-10-07

## Product Overview
**One-liner:** Organisme de formation certifié Qualiopi qui forme en direct (classe virtuelle, petits groupes) aux compétences tech et IA, avec prise en charge du financement montée avec le stagiaire.
**What it does:** Hi-Tech Academy conçoit et anime des formations professionnelles 100 % à distance, en direct (Google Meet), sur l'IA, le cloud et la facturation électronique. Chaque parcours suit le cadre Qualiopi : analyse du besoin, test de positionnement, formation, évaluation, attestation. L'équipe monte le dossier de financement (OPCO, FAF, plan de développement des compétences) avec le client.
**Product category:** Formation professionnelle continue (actions de formation).
**Product type:** Service (formations inter/intra, à distance, en direct).
**Business model:** Vente de formations au forfait (1 000 € à 2 400 € HT par stagiaire), finançables par les dispositifs de la formation professionnelle. EURL, TVA 20 %.

## Target Audience
**Target companies:** TPE/PME françaises, cabinets comptables, équipes tech et métiers ; aussi indépendants et particuliers en reconversion ou montée en compétences.
**Decision-makers:** Dirigeants de TPE/PME, responsables RH/formation, le salarié lui-même (via son employeur et l'OPCO), l'indépendant (via son FAF).
**Primary use case:** Monter en compétences rapidement (IA, Kubernetes, facturation électronique) sans perdre des semaines, avec un reste à charge nul ou faible.
**Jobs to be done:**
- « Former mon équipe à l'IA sans qu'on y passe des mois ni que ça coûte un budget. »
- « Être opérationnel sur un outil précis (Pennylane, Kubernetes) avant une échéance réelle (réforme facturation électronique, projet infra). »
- « Sécuriser le financement : je ne sais pas à quoi j'ai droit ni comment monter un dossier. »

## Personas
| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| Dirigeant TPE/PME | ROI, budget, temps d'absence | Pas le temps de gérer l'administratif formation | Prise en charge jusqu'à 100 % par l'OPCO, dossier monté ensemble, formation en 1 à 3 jours |
| Salarié / pro en poste | Employabilité, compétence concrète | Peur que la formation soit théorique / e-learning passif | Formation en direct, TP corrigés, suivi individuel 30 min après |
| Indépendant | Reste à charge, simplicité | Ne connaît pas son FAF ni ses droits | On identifie le financeur (AGEFICE, FIF PL, FAFCEA) et on monte le dossier avec lui |
| Particulier | Prix, confiance | Offres de formation « arnaque » partout | Qualiopi, programme et tarifs publics, appel gratuit sans engagement |

## Problems & Pain Points
**Core problem:** Les gens savent qu'ils doivent se former (IA, réforme facturation électronique, cloud) mais repoussent : ils ne savent pas ce que ça coûte vraiment, qui finance, ni si la formation sera sérieuse.
**Why alternatives fall short:**
- E-learning en libre accès : personne ne le termine, aucune prise en charge humaine.
- Grands organismes : sessions annulées faute d'inscrits, délais longs, administratif opaque.
- Tutos gratuits : pas de structure, pas d'attestation, pas finançable.
**What it costs them:** Dossiers de financement jamais déposés (budget OPCO perdu), équipes en retard sur l'IA et la facturation électronique, temps perdu à comparer des offres.
**Emotional tension:** Peur de se faire avoir, peur de l'administratif, peur d'y passer trop de temps pour rien.

## Differentiation
**Key differentiators:**
- Formation **en direct** avec un formateur (pas de vidéos préenregistrées), petits groupes.
- **Session maintenue dès 1 inscrit** : jamais annulée faute de participants.
- **Montage du dossier de financement fait avec le client** (OPCO, FAF, plan de développement) — l'appel de 30 min sert aussi à vérifier la prise en charge, jusqu'à 100 % selon la situation.
- Certifié **Qualiopi** : programme, tarifs, délais d'accès et modalités publics sur chaque page.
- Après la formation : pack de fiches réflexes + suivi individuel de 30 minutes offert.
**Why customers choose us:** Zéro friction (tout à distance, dates posées à l'inscription), zéro surprise (tarif et programme affichés), reste à charge souvent nul.

## Objections
| Objection | Response |
|-----------|----------|
| « C'est trop cher » | Prise en charge jusqu'à 100 % par OPCO/FAF selon la situation ; l'appel gratuit sert à la vérifier avant tout engagement. |
| « Je n'ai pas le temps de gérer le dossier » | Nous préparons devis, programme et convention ; le client dépose, nous restons disponibles jusqu'à l'accord. |
| « Encore une formation en ligne que je ne finirai pas » | En direct, petits groupes, TP corrigés, évaluation finale, suivi individuel après. |
| « Est-ce sérieux ? » | Certification Qualiopi (certificat public), programme PDF, tarifs affichés, taux de satisfaction mesurés. |

**Anti-persona:** Qui cherche un e-learning à 20 €, une certification éditeur officielle, ou une formation CPF « gratuite » sans projet réel.

## Customer Language
**How they describe the problem:**
- « Est-ce que c'est pris en charge ? »
- « Je ne sais pas comment ça marche avec mon OPCO. »
- « J'ai pas le temps de me former. »
**Words to use:** prise en charge, financement, OPCO, reste à charge, en direct, attestation, dossier monté ensemble, appel gratuit, sans engagement.
**Words to avoid:** révolutionnaire, secret, offre limitée (fausse), 100 % garanti sans condition, CPF (les formations ne sont pas éligibles CPF — ne jamais l'affirmer), jargon course-bro.

## Brand Voice
**Tone:** Professionnel, direct, rassurant. Vouvoiement.
**Style:** Phrases concrètes, chiffres réels, pas d'exclamation, pas de superlatifs vides.
**Personality:** Sérieux, pédagogue, transparent, proche.

## Proof Points
**Metrics:** 95 % de satisfaction, 100 % de recommandation (enquêtes qualité Qualiopi, affichées sur le site).
**Certifications:** Qualiopi (actions de formation), certificat RNQ public.
**Testimonials:** Avis nominatifs avec rôle et photo dans `ventes.js` (`preuves.temoignages`).

## Goals
**Business goal:** Remplir les sessions de formation via des appels qualifiés.
**Conversion action:** Réserver le **point stratégique gratuit de 30 minutes** (visio) sur Calendly : https://calendly.com/contact-hi-techacademy/point-strategique — vérifie le besoin, le niveau et la prise en charge financière. CTA unique du tunnel ; l'inscription formelle (`/inscription/:id`) reste le parcours Qualiopi en second plan.
**Current metrics:** Non mesurées (pas d'analytics de conversion branchées à ce jour).

## Changelog
*Newest first. One line per revision: what changed and why.*
- v1 (2026-10-07) — Initial context, auto-draft depuis le code (formations.jsx, ventes.js, composants vente) pour la refonte copywriting + offre orientée Calendly.
