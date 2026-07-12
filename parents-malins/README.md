# Parents Malins

Site d'affiliation orienté SEO — [parents-malins.fr](https://parents-malins.fr).

- **Stack** : [Astro](https://astro.build) (génération statique → HTML pur), servi par nginx.
- **Service Docker** : `parents-malins` (port interne 80, joint par le reverse proxy via le réseau `default`).
- **Image** : `ghcr.io/mchekini-check-consulting/master-affiliation/parents-malins`.
- **Pipeline** : `.github/workflows/parents-malins.yml` (déclenchée si `parents-malins/**` change sur `main`).

## Initialiser le projet Astro

Le code applicatif n'est pas encore généré. Depuis ce dossier :

```bash
npm create astro@latest . -- --template minimal
```

Puis renseigner le domaine dans `astro.config.mjs` (`site: "https://parents-malins.fr"`)
et créer `public/robots.txt`.

## Développement local

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # génère dist/
```

## Docker

```bash
# Depuis la racine du repo
docker compose up -d --build parents-malins
```
