# Prépa Technique

Site orienté SEO — [preparation.check-consulting.net](https://preparation.check-consulting.net).

- **Stack** : [Astro](https://astro.build) (génération statique → HTML pur), servi par nginx.
- **Service Docker** : `prepa-technique` (port interne 80, joint par le reverse proxy via le réseau `default`).
- **Image** : `ghcr.io/mchekini-check-consulting/master-affiliation/prepa-technique`.
- **Pipeline** : `.github/workflows/prepa-technique.yml` (déclenchée si `prepa-technique/**` change sur `main`).

## Développement local

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # génère dist/
```

## Docker

```bash
# Depuis la racine du repo
docker compose up -d --build prepa-technique
```
