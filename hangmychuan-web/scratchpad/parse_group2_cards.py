from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OCR = ROOT / "_nguon" / "hang-nhom-2-card-ocr-v2"
OUTPUT = ROOT / "_nguon" / "hang-nhom-2-raw-v2.json"

BRANDS = {
    2: "DHC",
    3: "Blackmores",
    4: "Doppelherz",
    5: "LiveSpo",
    6: "Oribe",
    7: "Webber Naturals",
    8: "Cocoon",
    9: "Manhae",
    10: "Femfresh",
    11: "Batiste",
    12: "Neubria",
    13: "Vitabiotics",
    14: "Optibac",
    15: "Bio Island",
    16: "Healthy Care",
    17: "Elevit (Bayer)",
    18: "Careline",
    19: "Ostelin",
    20: "Nutri D-Day",
    21: "Eviralab",
    22: "RE:CIPE",
    23: "Mason Natural",
    24: "Nature's Bounty",
    25: "Olympian Labs",
    26: "Lineabon",
    27: "Inocare",
    28: "BoBo",
    29: "Chulago",
    30: "Hàng ngoại nhập khác",
}

STOP_MARKERS = (
    "bổ sung",
    "hỗ trợ",
    "dưỡng ẩm",
    "làm sạch",
    "giúp ",
    "sản phẩm",
    "chăm sóc",
    "cung cấp",
    "thực phẩm bảo vệ",
)
PACKAGE_PREFIXES = ("lọ ", "túi ", "gói ", "tuýp ", "chai ", "hộp ", "quy cách")


def normalize(text: str) -> str:
    return unicodedata.normalize("NFC", text).replace("  ", " ").strip(" -—_|`~")


def extract_price(text: str) -> int | None:
    match = re.search(r"Giá\s+niêm\s+yết[\s\S]{0,180}?([0-9][0-9.]{2,})\s*(?:Đ|D|0)", text, re.I)
    if not match:
        return None
    digits = re.sub(r"\D", "", match.group(1))
    if not digits:
        return None
    value = int(digits)
    # OCR occasionally reads the currency symbol Đ as a trailing zero.
    if value > 10_000_000 and value % 10 == 0:
        value //= 10
    return value


def extract_name_lines(text: str, brand: str) -> list[str]:
    block = re.split(r"Giá\s+niêm\s+yết", text, flags=re.I)[0]
    result: list[str] = []
    normalized_brand = brand.lower().replace("natural", "").strip()
    for raw in block.splitlines():
        line = normalize(raw)
        lower = line.lower()
        if not line or len(line) < 3:
            continue
        if any(marker in lower for marker in STOP_MARKERS):
            break
        if lower.startswith(PACKAGE_PREFIXES):
            continue
        if normalized_brand and normalized_brand in lower and len(line) < len(brand) + 15:
            continue
        letters = sum(char.isalpha() for char in line)
        if letters < 3 or letters / max(len(line), 1) < 0.35:
            continue
        if len(result) < 3:
            result.append(line)
    return result


records = []
for path in sorted(OCR.glob("*.txt")):
    page = int(path.stem[1:3])
    text = path.read_text(encoding="utf-8")
    brand = BRANDS.get(page, "")
    records.append(
        {
            "card": path.stem,
            "page": page,
            "brand": brand,
            "name_lines": extract_name_lines(text, brand),
            "price": extract_price(text),
            "ocr": text.strip(),
        }
    )

OUTPUT.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Wrote {len(records)} records to {OUTPUT}")
