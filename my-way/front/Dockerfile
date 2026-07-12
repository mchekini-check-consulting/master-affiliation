# Étape 1 : build Angular (production)
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Étape 2 : nginx léger qui sert le build et proxifie /api vers le backend
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Angular 17+ : la sortie du build est dist/<nom-du-projet>/browser
COPY --from=build /app/dist/my-way/browser /usr/share/nginx/html
EXPOSE 80
