#!/usr/bin/env python3
"""Construit astonfly/public/ depuis l'export ASTONFLY.COM :
- index.html (FR) et en/index.html (EN) avec chemins d'assets absolus
- fichiers runtime (support.js, astonfly-model.js, image-slot.js, sidecar)
- iframes de cartes
- uniquement les assets (images/uploads/models/docs) réellement référencés

Partie SEO volontairement écartée : ni robots.txt ni sitemap.xml (ceux de
l'export pointent vers www.astonfly.com), et les balises canonical/hreflang
des HTML sont retirées.
"""
import re, shutil, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "ASTONFLY.COM"
I18N = ROOT / "i18n"
DEST = ROOT / "public"

# Versions linguistiques : /  = FR (export original), /en/ = export EN,
# /pt/ /es/ /it/ /de/ = traductions générées (voir i18n/README.md)
LANGS = {
    "en": SRC / "ASTONFLY EN.dc.html",
    "pt": I18N / "ASTONFLY-PT.html",
    "es": I18N / "ASTONFLY-ES.html",
    "it": I18N / "ASTONFLY-IT.html",
    "de": I18N / "ASTONFLY-DE.html",
}

# Sélecteur de langue : l'export navigue vers les fichiers .dc.html (cassé une
# fois déployé) et ignore PT/ES/IT/DE — on le fait naviguer vers /xx/
SWITCHER_RE = re.compile(
    r"onClick: \(\) => \{ if \(l\.code === '(?:EN|FR)'\) \{ window\.location\.href = 'ASTONFLY%20[^']+'; return; \} this\.setState\(\{ lang: l\.code, langOpen: false \}\); \},")
SWITCHER_NEW = ("onClick: () => { var p = { FR: '/', EN: '/en/', PT: '/pt/', ES: '/es/', "
                "IT: '/it/', DE: '/de/' }[l.code] || '/'; window.location.href = p; },")

# Contenus dynamiques (admin) : au montage, la SPA charge les articles et les
# événements publiés depuis l'API dans la langue de la page. Les contenus codés
# en dur restent le socle : les articles de l'API viennent devant (un slug API
# remplace le slug codé en dur), les événements de l'API remplacent la liste
# d'exemple, et l'échec de l'API (dev local sans back) est silencieux.
CMS_LOADER = """_cmsCharger() {
    var self = this;
    var lang = this._seoLang || 'fr';
    try {
      fetch('/api/v1/public/articles?lang=' + lang)
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (liste) {
          if (!liste || !liste.length) return;
          var slugs = {};
          liste.forEach(function (p) { slugs[p.slug] = true; });
          self.posts = liste.concat(self.posts.filter(function (p) { return !slugs[p.slug]; }));
          liste.forEach(function (p) { if (p.cat && self.postCats.indexOf(p.cat) === -1) self.postCats.push(p.cat); });
          self.setState({});
        }).catch(function () {});
      fetch('/api/v1/public/events?lang=' + lang)
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (liste) {
          if (liste && liste.length) { self.events = liste; self.setState({}); }
        }).catch(function () {});
    } catch (e) {}
  }

  componentDidMount() { this._cmsCharger();"""

ASSET_RE = re.compile(r'(?:images|uploads|models|docs)/[^"\'\\)\s}<>]+')
# Réécrit les refs relatives en absolues sans toucher aux URLs complètes
# (https://.../images/...) ni aux data URIs base64 (chars alnum + / = -).
ABS_RE = re.compile(r'(?<![\w/.+=-])(?:\./)?((?:images|uploads|models|docs)/)')
# Balises SEO pointant vers www.astonfly.com, à retirer
SEO_LINK_RE = re.compile(r'[ \t]*<link rel="(?:canonical|alternate)"[^>]*>\n?')
SEO_META_RE = re.compile(r'[ \t]*<meta[^>]*astonfly\.com[^>]*>\n?')
SEO_LD_RE = re.compile(r'[ \t]*<script type="application/ld\+json">.*?</script>\n?', re.S)

def rewrite(text):
    text = text.replace('src="./support.js"', 'src="/support.js"')
    text = text.replace('from="./astonfly-model.js"', 'from="/astonfly-model.js"')
    text = text.replace('src="image-slot.js"', 'src="/image-slot.js"')
    for m in ("campus-map.html", "residences-map.html", "residences-map-paris.html", "world-demand-map.html"):
        text = text.replace(f'src="{m}"', f'src="/{m}"')
    text = SEO_LINK_RE.sub('', text)
    text = SEO_META_RE.sub('', text)
    text = SEO_LD_RE.sub('', text)
    # — aucun lien vers le site astonfly.com (les mailto restent) —
    # boutons « visite virtuelle 360° » du corps de page : masqués
    text = text.replace(
        '<a href="https://astonfly.com/assets/360visit/index.htm" target="_blank" rel="noopener"',
        '<a hidden href="#"')
    # entrée « campus à 360° » des méga-menus : retirée
    text = re.sub(r"\.concat\(\[\{ title: '(?:Le campus à 360°|The campus in 360°)'[^\]]*\]\)", '', text)
    # CTA du méga-menu L'école : sans href, le code retombe sur '#'
    text = text.replace(", href: 'https://astonfly.com/assets/360visit/index.htm' }", " }")
    # partage d'articles : URL du domaine courant au lieu du site réel
    text = text.replace("const url = 'https://www.astonfly.com/actualites/'",
                        "const url = window.location.origin + '/actualites/'")
    # vidéo du hero : pas de chargement depuis astonfly.com, le poster reste
    text = text.replace("if (!v.querySelector('source')) {", "if (false) {")
    text = text.replace("s.src = 'https://astonfly.com/wp-content/uploads/2025/02/Astonfly-Landing-Page.mp4#t=2';",
                        "s.src = '';")
    text = SWITCHER_RE.sub(SWITCHER_NEW, text)
    text = text.replace("componentDidMount() {", CMS_LOADER, 1)
    return ABS_RE.sub(r'/\1', text)

def main():
    if DEST.exists():
        shutil.rmtree(DEST)
    DEST.mkdir(parents=True)

    fr = (SRC / "ASTONFLY FINAL VERSION.dc.html").read_text(encoding="utf8")
    (DEST / "index.html").write_text(rewrite(fr), encoding="utf8")

    variants = [fr]
    for code, path in LANGS.items():
        if not path.is_file():
            print(f"ATTENTION : {path.name} absent, /{code}/ non généré")
            continue
        text = path.read_text(encoding="utf8")
        (DEST / code).mkdir()
        (DEST / code / "index.html").write_text(rewrite(text), encoding="utf8")
        variants.append(text)

    for f in ("support.js", "astonfly-model.js", "image-slot.js",
              ".image-slots.state.json", "campus-map.html", "residences-map.html",
              "residences-map-paris.html", "world-demand-map.html"):
        shutil.copy2(SRC / f, DEST / f)

    # Page d'administration (articles, catégories, événements)
    shutil.copytree(ROOT / "admin", DEST / "admin")

    refs = set()
    for text in variants:
        refs.update(ASSET_RE.findall(text))
    refs = {r.rstrip('.,;:!?') for r in refs}

    missing, copied = [], 0
    for ref in sorted(refs):
        src = SRC / ref
        if not src.is_file():
            missing.append(ref)
            continue
        dst = DEST / ref
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
        copied += 1

    total = sum(f.stat().st_size for f in DEST.rglob("*") if f.is_file())
    print(f"copiés : {copied} assets, total public/ = {total/1e6:.1f} Mo")
    if missing:
        print(f"MANQUANTS ({len(missing)}) :")
        for m in missing:
            print("  -", m)

if __name__ == "__main__":
    main()
