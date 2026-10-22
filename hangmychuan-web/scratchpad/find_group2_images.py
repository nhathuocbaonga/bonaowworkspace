from __future__ import annotations

import json
import re
import time
import unicodedata
import urllib.parse
import urllib.request
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = json.loads((ROOT / "_nguon" / "hang-nhom-2-catalog.json").read_text(encoding="utf-8"))
OUT = ROOT / "_nguon" / "hang-nhom-2-image-matches.json"
ENDPOINT = "https://duocthethao.com/searchProductData?limit=12&search="


def norm(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode().lower()
    value = value.replace("doppelherz", "doppel herz").replace("coq10", "co q10")
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def tokens(value: str) -> set[str]:
    stop = {"vien", "hop", "chai", "goi", "lo", "tuyp", "mau", "nhom", "ngay", "san", "pham"}
    return {x for x in norm(value).split() if len(x) > 1 and x not in stop}


def numbers(value: str) -> set[str]:
    return set(re.findall(r"\d+(?:[.,]\d+)?", norm(value)))


def score(item: dict, candidate: dict) -> float:
    wanted = norm(f"{item['brand']} {item['name']}")
    found = norm(candidate.get("name", ""))
    wt, ft = tokens(wanted), tokens(found)
    overlap = len(wt & ft) / max(1, len(wt | ft))
    seq = SequenceMatcher(None, wanted, found).ratio()
    brand = 1.0 if norm(item["brand"]) in found else 0.0
    wn, fn = numbers(wanted), numbers(found)
    number_score = len(wn & fn) / max(1, len(wn)) if wn else 1.0
    mismatch_penalty = 0.16 if wn and not wn.issubset(fn) else 0.0
    return round(overlap * 0.44 + seq * 0.21 + brand * 0.22 + number_score * 0.13 - mismatch_penalty, 4)


def search(query: str) -> list[dict]:
    request = urllib.request.Request(
        ENDPOINT + urllib.parse.quote(query),
        headers={"User-Agent": "HangMyChuanImageAudit/1.0 (+https://hangmychuan.vn)"},
    )
    with urllib.request.urlopen(request, timeout=25) as response:
        return json.load(response).get("data", [])


results = []
for index, item in enumerate(CATALOG, 1):
    short_name = re.split(r"[–—-]", item["name"], maxsplit=1)[0].strip()
    queries = [f"{item['brand']} {item['name']}", item["name"], f"{item['brand']} {short_name}"]
    candidates: dict[int, dict] = {}
    for query in queries:
        try:
            for candidate in search(query):
                candidates[candidate["id"]] = candidate
        except Exception as exc:
            print(f"{item['id']}: lỗi tìm {query!r}: {exc}")
        time.sleep(0.15)
    ranked = sorted(
        ({**candidate, "match_score": score(item, candidate)} for candidate in candidates.values()),
        key=lambda x: x["match_score"], reverse=True,
    )
    best = ranked[0] if ranked else None
    results.append({
        "id": item["id"], "brand": item["brand"], "name": item["name"],
        "best": best, "alternatives": ranked[1:4],
    })
    print(f"[{index:03}/{len(CATALOG)}] {item['id']}: {best['match_score'] if best else 0:.2f} {best['name'] if best else 'KHÔNG CÓ'}")
    time.sleep(0.18)

OUT.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Đã ghi {len(results)} kết quả vào {OUT}")
