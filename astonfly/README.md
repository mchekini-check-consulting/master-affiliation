# Astonfly

Site vitrine de l'école de pilotage Astonfly — [aston.check-consulting.net](https://aston.check-consulting.net).

- **Contenu** : export « dc-runtime » du site astonfly.com (SPA React rendue côté
  client : un seul `index.html` de ~1,7 Mo + `en/index.html`, navigation interne
  par état, React/Babel chargés depuis unpkg). L'export source complet vit dans
  `ASTONFLY.COM/` (non versionné, ~660 Mo) ; seuls les assets réellement
  référencés sont repris dans `public/` (~110 Mo) par `scripts/build-public.py`.
- **Langues** : FR (`/`), EN (`/en/`), PT (`/pt/`), ES (`/es/`), IT (`/it/`),
  DE (`/de/`). FR et EN viennent de l'export ; PT/ES/IT/DE sont générées dans
  `i18n/` (voir `i18n/README.md`). Le sélecteur de langue navigue entre les
  préfixes.
- **Stack** : [Astro](https://astro.build) sert de coquille de build — `public/`
  est copié tel quel dans `dist/`, servi par nginx avec fallback SPA
  (`/admissions/`, `/formation-…` → `index.html`, `/xx/…` → `xx/index.html`).
- **Admin** : `/admin/` — rédaction d'articles de blog (avec sélection des
  langues de publication et traduction automatique), gestion des catégories et
  des événements de la landing, brouillon/publication. Sources dans `admin/`,
  backend Spring Boot + PostgreSQL dans `back/` (Basic Auth `ADMIN_EMAIL` /
  `ADMIN_PASSWORD`, traduction via `OPENAI_API_KEY`). La SPA charge les
  contenus publiés depuis `/api` au chargement de la page, dans sa langue.
- **Services Docker** : `astonfly` (front, port 80, réseau `default` +
  `astonfly-net`), `astonfly-back` (8080, proxifié sous `/api`), `astonfly-db`.
- **Images** : `ghcr.io/mchekini-check-consulting/master-affiliation/astonfly`
  et `…/astonfly-back`.
- **Pipeline** : `.github/workflows/astonfly.yml` (déclenchée si `astonfly/**` change sur `main`),
  build des 2 images ; secrets GitHub optionnels `OPENAI_API_KEY` et
  `ASTONFLY_ADMIN_PASSWORD` injectés dans le `.env` du serveur au déploiement.

## Mettre à jour le contenu

Après un nouvel export dans `ASTONFLY.COM/` :

```bash
python3 scripts/build-public.py   # régénère public/ (chemins absolus + assets référencés)
```

Le script réécrit les chemins relatifs en absolus (`images/…` → `/images/…`)
pour que les assets se chargent aussi sur les URL profondes servies en fallback.

## Développement local

```bash
npm install
npm run build      # génère dist/ (public/ copié tel quel + 404.html)
npx serve dist     # ou : docker compose up -d --build astonfly (depuis la racine)
```

## Notes

- **SEO volontairement écarté** : pas de `robots.txt` ni de `sitemap.xml`, et le
  script retire des HTML les balises canonical/hreflang, les meta og:url/og:image
  et les blocs JSON-LD de l'export (tous pointaient vers `www.astonfly.com`).
- La vidéo du hero et la visite virtuelle 360 sont chargées depuis `astonfly.com`
  (URLs absolues de l'export, côté contenu).
- Lien mort hérité de l'export : `docs/agrement-part-cao-astontec.pdf` (absent).
