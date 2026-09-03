# Traductions PT / ES / IT / DE

Versions traduites du site (même format brut que l'export `ASTONFLY.COM`),
servies sous `/pt/`, `/es/`, `/it/`, `/de/` par `scripts/build-public.py`.

## Comment elles ont été générées

L'export d'origine ne fournit que le FR (`ASTONFLY FINAL VERSION.dc.html`) et
l'EN (`ASTONFLY EN.dc.html`), deux fichiers de structure identique. La méthode :

1. **`generate-segments.py`** normalise les deux fichiers (sélecteur de langue,
   état `lang`, `_seoLang` → placeholders) puis les diffe ligne à ligne :
   les ~1 300 hunks qui diffèrent sont exactement les segments que le
   traducteur officiel a traduits — tout le reste (code JS, balises, styles)
   est identique et n'est jamais touché.
2. Chaque hunk (couple FR→EN) est traduit vers la langue cible en appliquant
   la même transformation : on traduit ce que l'EN a traduit, on garde ce que
   l'EN a gardé (délimiteurs de chaînes, échappements, locales adaptées).
3. Les hunks traduits sont réinjectés dans le squelette commun, puis le
   fichier est validé : syntaxe du script dc (`node --check`) et comptages
   structurels (`<section`, `<sc-if>`, `{{ }}`) identiques à l'EN.

Conventions : pt-PT impersonnel, es-ES tutoiement, it tutoiement, de
vouvoiement (Sie) ; termes réglementaires (ATPL, EASA, APS MCC, type rating,
noms d'avions/compagnies) et montants inchangés.

## Mettre à jour après un nouvel export

Les traductions sont figées sur l'export actuel. Si `ASTONFLY.COM/` est
remplacé par un nouvel export, rejouer le processus (diff FR/EN → traduction
des hunks nouveaux/modifiés → assemblage) ou régénérer entièrement.
