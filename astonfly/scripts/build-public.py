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
DEST = ROOT / "public"

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
    return ABS_RE.sub(r'/\1', text)

def main():
    if DEST.exists():
        shutil.rmtree(DEST)
    (DEST / "en").mkdir(parents=True)

    fr = (SRC / "ASTONFLY FINAL VERSION.dc.html").read_text(encoding="utf8")
    en = (SRC / "ASTONFLY EN.dc.html").read_text(encoding="utf8")

    (DEST / "index.html").write_text(rewrite(fr), encoding="utf8")
    (DEST / "en" / "index.html").write_text(rewrite(en), encoding="utf8")

    for f in ("support.js", "astonfly-model.js", "image-slot.js",
              ".image-slots.state.json", "campus-map.html", "residences-map.html",
              "residences-map-paris.html", "world-demand-map.html"):
        shutil.copy2(SRC / f, DEST / f)

    refs = set()
    for text in (fr, en):
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
