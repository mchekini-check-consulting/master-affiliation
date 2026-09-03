#!/usr/bin/env python3
"""Prépare les chunks de traduction : normalise FR/EN, diffe, écrit
chunks/chunk-NN.json = [{id, fr:[lignes], en:[lignes]}] et skeleton.json
(opcodes du squelette pour l'assemblage)."""
import difflib, json, re
from pathlib import Path

ROOT = Path("/Users/mchekini/Downloads/master-affiliation/astonfly/ASTONFLY.COM")
OUT = Path(__file__).parent
(OUT / "chunks").mkdir(parents=True, exist_ok=True)

SWITCHER_RE = re.compile(
    r"onClick: \(\) => \{ if \(l\.code === '(?:EN|FR)'\) \{ window\.location\.href = 'ASTONFLY%20[^']+'; return; \} this\.setState\(\{ lang: l\.code, langOpen: false \}\); \},")
SWITCHER_NEW = ("onClick: () => { var p = { FR: '/', EN: '/en/', PT: '/pt/', ES: '/es/', "
                "IT: '/it/', DE: '/de/' }[l.code] || '/'; window.location.href = p; },")

def normalize(text):
    text, n1 = SWITCHER_RE.subn(SWITCHER_NEW, text)
    text, n2 = re.subn(r"lang: '(?:FR|EN)', langOpen", "lang: '@@LANG@@', langOpen", text)
    text, n3 = re.subn(r"_seoLang = '(?:fr|en)'", "_seoLang = '@@lang@@'", text)
    assert n1 == 1 and n2 == 1 and n3 == 1, (n1, n2, n3)
    return text

fr = normalize((ROOT / "ASTONFLY FINAL VERSION.dc.html").read_text(encoding="utf8")).splitlines(keepends=True)
en = normalize((ROOT / "ASTONFLY EN.dc.html").read_text(encoding="utf8")).splitlines(keepends=True)

sm = difflib.SequenceMatcher(None, fr, en, autojunk=False)
ops = sm.get_opcodes()

hunks, skeleton = [], []
for t, i1, i2, j1, j2 in ops:
    if t == "equal":
        skeleton.append({"type": "equal", "i1": i1, "i2": i2})
    else:
        hid = len(hunks)
        hunks.append({"id": hid, "fr": fr[i1:i2], "en": en[j1:j2]})
        skeleton.append({"type": "hunk", "id": hid})

(OUT / "skeleton.json").write_text(json.dumps(skeleton), encoding="utf8")
(OUT / "fr-normalized.txt").write_text("".join(fr), encoding="utf8")

# chunks bornés en taille (fr+en) pour les agents
MAX = 16_000
chunk, size, n = [], 0, 0
def flush():
    global chunk, size, n
    if chunk:
        (OUT / "chunks" / f"chunk-{n:02d}.json").write_text(
            json.dumps(chunk, ensure_ascii=False), encoding="utf8")
        n += 1
        chunk, size = [], 0

for h in hunks:
    s = sum(len(l) for l in h["fr"]) + sum(len(l) for l in h["en"])
    if size + s > MAX:
        flush()
    chunk.append(h)
    size += s
flush()

print(f"{len(hunks)} hunks, {n} chunks, skeleton {len(skeleton)} entrées")
big = max(hunks, key=lambda h: sum(len(l) for l in h["fr"]))
print("plus gros hunk:", big["id"], sum(len(l) for l in big["fr"]), "octets fr")
