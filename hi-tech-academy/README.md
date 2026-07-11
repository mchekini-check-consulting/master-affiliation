# hi-tech-academy

Front de Hi-Tech Academy : application React (Vite + Tailwind + shadcn/ui)
générée avec [Base44](https://base44.com), servie par nginx en SPA.
Le backend (auth, données) est le service Base44 de l'app
(`base44/.app.jsonc`, app id injecté dans le bundle au build par
`@base44/vite-plugin`).

- **Domaine** : https://hi-tech-academy.fr
- **Service Docker** : `hi-tech-academy` (compose racine, port interne 80)
- **Image** : `ghcr.io/mchekini-check-consulting/master-affiliation/hi-tech-academy`
- **Pipeline** : `.github/workflows/hi-tech-academy.yml` (déclenchée si `hi-tech-academy/**` change sur `main`)

## Commandes utiles

```bash
npm install
npm run dev        # http://localhost:5173 — le proxy /api -> Base44 est configuré par .env.local
                   # (VITE_BASE44_APP_BASE_URL=https://base44.app, fichier gitignoré)
npm run build      # génère dist/
npm run lint

# via Docker, depuis la racine du repo
docker compose up -d --build hi-tech-academy
```

## Pages

- `/` — accueil (sections hero, formations, timeline, FAQ, blog…)
- `/mentions-legales`, `/politique-confidentialite`, `/conditions-vente`
- Auth Base44 : `src/pages/Login.jsx`, `Register.jsx`, etc. (non routées pour l'instant, voir `src/App.jsx`)
