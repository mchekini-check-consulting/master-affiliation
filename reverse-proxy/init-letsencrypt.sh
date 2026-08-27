#!/usr/bin/env bash
# Bootstrap TLS — à lancer UNE SEULE FOIS sur le serveur, depuis la racine
# du repo (/opt/master-affiliation) :
#
#   bash reverse-proxy/init-letsencrypt.sh
#
# Problème résolu : nginx refuse de démarrer si les certificats référencés
# dans conf.d/ n'existent pas, mais certbot a besoin de nginx (port 80) pour
# valider le challenge ACME. On crée donc des certificats factices, on
# démarre nginx, puis on les remplace par les vrais.
#
# Les renouvellements suivants sont automatiques (service "certbot" du
# docker-compose, toutes les 12h).
#
# Test sans consommer les quotas Let's Encrypt : STAGING=1 bash ...

set -euo pipefail

domains=(fidexil.check-consulting.net hi-tech-academy.fr freelance-now.fr parents-malins.fr preparation.check-consulting.net qualiopilote.fr echecs360.fr naturalisation.check-consulting.net immo-scrapper.check-consulting.net n8n.check-consulting.net aston.check-consulting.net)
email="me.chekini@gmail.com"
staging="${STAGING:-0}"

cd "$(dirname "$0")/.."

echo "### 1/4 — Certificats factices (pour que nginx accepte de démarrer)"
for domain in "${domains[@]}"; do
  docker compose run --rm --entrypoint /bin/sh certbot -c "
    if [ ! -f /etc/letsencrypt/live/$domain/fullchain.pem ]; then
      mkdir -p /etc/letsencrypt/live/$domain
      openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
        -keyout /etc/letsencrypt/live/$domain/privkey.pem \
        -out /etc/letsencrypt/live/$domain/fullchain.pem \
        -subj /CN=$domain
    fi"
done

echo "### 2/4 — (Re)démarrage du reverse proxy avec la conf TLS"
docker compose up -d --force-recreate reverse-proxy

echo "### 3/4 — Émission des vrais certificats Let's Encrypt"
staging_arg=""
if [ "$staging" != "0" ]; then staging_arg="--staging"; fi

for domain in "${domains[@]}"; do
  # Supprime le certificat factice (sinon certbot refuse d'écrire par-dessus)
  docker compose run --rm --entrypoint /bin/sh certbot -c "
    rm -rf /etc/letsencrypt/live/$domain \
           /etc/letsencrypt/archive/$domain \
           /etc/letsencrypt/renewal/$domain.conf"
  docker compose run --rm --entrypoint certbot certbot certonly \
    --webroot -w /var/www/certbot \
    $staging_arg \
    --email "$email" --agree-tos --no-eff-email \
    -d "$domain"
done

echo "### 4/4 — Rechargement de nginx + démarrage du renouvellement auto"
docker compose exec reverse-proxy nginx -s reload
docker compose up -d certbot

echo "Terminé. Vérifier : curl -I https://${domains[0]}"
