# Orchestrateur SEO/GEO : démon Node (cron interne 00 h / 12 h + prise en
# charge des lancements manuels de l'admin via /api/seo/runs).
FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src
CMD ["node", "src/main.js"]
