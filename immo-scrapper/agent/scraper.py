"""Agent de scrapping Licitor.

Récupère les annonces publiées sur licitor.com (prochaines adjudications),
extrait descriptif, surface, occupation, adresse et lien de la fiche, puis
les envoie à l'API immo-scrapper (POST /v1/annonces, upsert par URL).

Politesse : délai entre chaque requête, nombre de fiches limité par passage,
les fiches déjà en base ne sont pas re-visitées. Un passage au démarrage,
puis un passage chaque nuit à minuit (heure de Paris via TZ).
"""

import base64
import math
import os
import re
import time
import urllib.parse
from datetime import datetime, timedelta

import requests
from bs4 import BeautifulSoup

BASE = "https://www.licitor.com"
API = os.environ.get("API_URL", "http://immo-scrapper-back:8080/api")
CLE_API = os.environ.get("SCRAPPER_API_KEY", "changeme-scrapper")
PAGES_LISTING = int(os.environ.get("PAGES_LISTING", "3"))
MAX_FICHES = int(os.environ.get("MAX_FICHES_PAR_RUN", "60"))
DELAI = float(os.environ.get("DELAI_SECONDES", "2.5"))
CLE_MAPS = os.environ.get("GOOGLE_MAPS_API_KEY", "").strip()

session = requests.Session()
session.headers["User-Agent"] = (
    "Mozilla/5.0 (compatible; ImmoScrapperBot/1.0; veille personnelle)"
)


def log(message: str) -> None:
    print(f"[{datetime.now():%Y-%m-%d %H:%M:%S}] {message}", flush=True)


def obtenir(url: str) -> str:
    """GET poli : un délai systématique avant chaque requête vers Licitor."""
    time.sleep(DELAI)
    reponse = session.get(url, timeout=30)
    reponse.raise_for_status()
    return reponse.text


# ---------- Découverte des fiches ----------

def liens_du_listing() -> list[str]:
    """Les liens de fiches depuis les premières pages du listing d'accueil."""
    liens: list[str] = []
    vus: set[str] = set()
    for page in range(1, PAGES_LISTING + 1):
        url = BASE + "/" if page == 1 else f"{BASE}/?p={page}"
        try:
            soup = BeautifulSoup(obtenir(url), "html.parser")
        except Exception as e:
            log(f"listing page {page} inaccessible : {e}")
            continue
        for a in soup.select("a.Ad[href]"):
            href = a["href"]
            if href.startswith("/annonce/") and href not in vus:
                vus.add(href)
                liens.append(BASE + href)
    return liens


def urls_connues() -> set[str]:
    try:
        annonces = requests.get(f"{API}/v1/annonces", timeout=30).json()
        return {a["url"] for a in annonces}
    except Exception as e:
        log(f"impossible de lire les annonces existantes : {e}")
        return set()


# ---------- Extraction d'une fiche ----------

TYPES = [
    ("Appartement", ["appartement", "studio", "duplex", "chambre"]),
    ("Maison", ["maison", "pavillon", "villa", "propriété", "longère", "fermette"]),
    ("Local commercial", ["local", "commercial", "murs", "boutique", "bureau", "entrepôt", "atelier"]),
    ("Parking", ["parking", "garage", "box", "stationnement", "cave"]),
]


def deviner_type(titre: str) -> str:
    bas = titre.lower()
    for nom, mots in TYPES:
        if any(mot in bas for mot in mots):
            return nom
    return "Autre"


def deviner_statut(texte: str) -> str:
    bas = texte.lower()
    if "libre" in bas:
        return "Libre"
    if "loué" in bas or "louée" in bas or "bail en cours" in bas:
        return "Loué"
    if "occupé" in bas or "occupée" in bas:
        return "Occupé"
    return "Inconnu"


def extraire_surface(texte: str) -> float:
    """Première surface exprimée en m² (les très petites valeurs type cave sont ignorées)."""
    candidates = [
        float(m.group(1).replace(" ", "").replace(" ", "").replace(",", "."))
        for m in re.finditer(r"(\d{1,4}(?:[\s ]?\d{3})*(?:[.,]\d{1,2})?)\s*m²", texte)
    ]
    candidates = [c for c in candidates if 1 <= c <= 10000]
    return candidates[0] if candidates else 0.0


def cap_vers(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Cap (en degrés 0-360) du point 1 vers le point 2 : sert à orienter
    la caméra Street View vers la façade du bien."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dl = math.radians(lon2 - lon1)
    y = math.sin(dl) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(dl)
    return (math.degrees(math.atan2(y, x)) + 360) % 360


# Les services de vignettes Google refusent les User-Agents de bots (403) :
# on se présente comme un navigateur pour ces deux appels uniquement.
UA_NAVIGATEUR = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"


def photo_google_maps(lat: float, lng: float) -> str | None:
    """Première photo de l'adresse sur Google Maps, sans clé : on cherche le
    panorama Street View le plus proche (le service interne qu'utilise Maps),
    puis on récupère sa vignette publique, caméra orientée vers le bien."""
    try:
        time.sleep(0.3)
        pb = (f"!1m5!1sapiv3!5sUS!11m2!1m1!1b0!2m4!1m2!3d{lat}!4d{lng}!2d50"
              "!3m10!2m2!1sfr!2sFR!9m1!1e2!11m4!1m3!1e2!2b1!3e2"
              "!4m10!1e1!1e2!1e3!1e4!1e8!1e6!5m1!1e2!6m1!1e2")
        recherche = requests.get(
            "https://maps.googleapis.com/maps/api/js/GeoPhotoService.SingleImageSearch",
            params={"pb": pb, "callback": "cb"},
            headers={"User-Agent": UA_NAVIGATEUR},
            timeout=20,
        )
        pano = re.search(r'"([A-Za-z0-9_-]{22})"', recherche.text)
        if not pano:
            return None  # pas de Street View à moins de 50 m

        parametres = {
            "panoid": pano.group(1),
            "cb_client": "maps_sv.tactile.gps",
            "w": 640, "h": 400, "pitch": 0,
        }
        position = re.search(r"\[null,null,(-?\d+\.\d+),(-?\d+\.\d+)\]", recherche.text)
        if position:
            parametres["yaw"] = round(cap_vers(
                float(position.group(1)), float(position.group(2)), lat, lng), 1)

        time.sleep(0.3)
        image = requests.get(
            "https://streetviewpixels-pa.googleapis.com/v1/thumbnail",
            params=parametres,
            headers={"User-Agent": UA_NAVIGATEUR},
            timeout=30,
        )
        if image.status_code == 200 and image.headers.get("Content-Type", "").startswith("image/"):
            return base64.b64encode(image.content).decode()
        log(f"vignette refusée ({image.status_code}) pour {lat},{lng}")
    except Exception as e:
        log(f"photo Google Maps indisponible pour {lat},{lng} : {e}")
    return None


def photo_street_view(coords: str | None, adresse: str, ville: str) -> str | None:
    """Photo Street View (JPEG base64) de l'adresse, si une clé Maps est
    configurée et qu'une image existe (la requête metadata est gratuite)."""
    if not CLE_MAPS:
        return None
    localisation = coords or f"{adresse}, {ville}, France"
    try:
        meta = requests.get(
            "https://maps.googleapis.com/maps/api/streetview/metadata",
            params={"location": localisation, "key": CLE_MAPS},
            timeout=20,
        ).json()
        if meta.get("status") != "OK":
            return None
        image = requests.get(
            "https://maps.googleapis.com/maps/api/streetview",
            params={"size": "640x400", "location": localisation, "fov": "80", "key": CLE_MAPS},
            timeout=30,
        )
        if image.status_code == 200 and image.headers.get("Content-Type", "").startswith("image/"):
            return base64.b64encode(image.content).decode()
    except Exception as e:
        log(f"street view indisponible pour {localisation} : {e}")
    return None


def parser_fiche(url: str) -> dict | None:
    soup = BeautifulSoup(obtenir(url), "html.parser")
    contenu = soup.select_one(".AdContent")
    if not contenu:
        return None

    horaire = contenu.select_one("p.Date time[datetime]")
    if not horaire:
        return None
    audience = horaire["datetime"][:19]  # 2026-09-24T09:00:00

    titre_el = contenu.select_one(".SousLot h2")
    titre = titre_el.get_text(" ", strip=True) if titre_el else "Bien immobilier"

    descriptif = " ".join(
        p.get_text(" ", strip=True) for p in contenu.select(".SousLot p")
    ).strip()

    prix_el = contenu.select_one(".Lot h3")
    prix_texte = prix_el.get_text(" ", strip=True) if prix_el else ""
    chiffres = re.sub(r"[^\d]", "", prix_texte)
    prix = int(chiffres) if chiffres else 0

    ville_el = contenu.select_one(".Location .City")
    rue_el = contenu.select_one(".Location .Street")
    ville = ville_el.get_text(" ", strip=True) if ville_el else ""
    adresse = rue_el.get_text(" ", strip=True) if rue_el else ""

    if not ville or prix <= 0:
        return None

    # Lien Google Maps : la fiche Licitor fournit les coordonnées exactes ;
    # sinon on retombe sur une recherche Maps par adresse.
    carte_el = contenu.select_one(".Location .Map a[href]")
    carte_url = carte_el["href"] if carte_el else (
        "https://www.google.com/maps/search/?api=1&query="
        + urllib.parse.quote(f"{adresse}, {ville}, France")
    )
    coords_m = re.search(r"q=(-?\d+\.\d+),(-?\d+\.\d+)", carte_url)
    coords = f"{coords_m.group(1)},{coords_m.group(2)}" if coords_m else None

    # Photo de l'adresse vue depuis Google Maps : API officielle si une clé
    # est fournie, sinon la vignette Street View publique (gratuite, sans clé)
    photo = photo_street_view(coords, adresse, ville) if CLE_MAPS else None
    if photo is None and coords_m:
        photo = photo_google_maps(float(coords_m.group(1)), float(coords_m.group(2)))

    return {
        "type": deviner_type(titre),
        "adresse": adresse or titre[:290],
        "ville": ville,
        "prix": prix,
        "surface_m2": extraire_surface(descriptif),
        "audience": audience,
        "statut": deviner_statut(descriptif),
        "url": url,
        "descriptif": descriptif[:4900],
        "carte_url": carte_url[:490],
        "photo_base64": photo,
    }


def poster(annonce: dict) -> bool:
    reponse = requests.post(
        f"{API}/v1/annonces",
        json=annonce,
        headers={"X-API-KEY": CLE_API},
        timeout=30,
    )
    if reponse.status_code in (200, 201):
        return True
    log(f"refus API ({reponse.status_code}) pour {annonce['url']} : {reponse.text[:200]}")
    return False


# ---------- Passage complet ----------

def passage() -> None:
    log("début du passage de scrapping")
    liens = liens_du_listing()
    connues = urls_connues()
    nouvelles = [u for u in liens if u not in connues][:MAX_FICHES]
    log(f"{len(liens)} fiches listées, {len(nouvelles)} nouvelles à visiter (max {MAX_FICHES})")

    envoyees = 0
    for url in nouvelles:
        try:
            annonce = parser_fiche(url)
            if annonce is None:
                log(f"fiche incomplète ignorée : {url}")
                continue
            if poster(annonce):
                envoyees += 1
        except Exception as e:
            log(f"erreur sur {url} : {e}")
    log(f"passage terminé : {envoyees} annonce(s) envoyée(s)")


def secondes_avant_minuit() -> float:
    maintenant = datetime.now()
    minuit = (maintenant + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    return (minuit - maintenant).total_seconds()


if __name__ == "__main__":
    # L'API peut mettre quelques secondes à démarrer en même temps que nous
    for tentative in range(30):
        try:
            requests.get(f"{API}/actuator/health", timeout=5)
            break
        except Exception:
            time.sleep(5)

    passage()  # un passage au démarrage
    while True:
        attente = secondes_avant_minuit()
        log(f"prochain passage à minuit (dans {attente / 3600:.1f} h)")
        time.sleep(attente)
        passage()
