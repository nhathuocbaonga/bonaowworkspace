from __future__ import annotations

import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "_nguon" / "hang-nhom-2-raw-v2.json"
OUT = ROOT / "_nguon" / "hang-nhom-2-catalog.json"

GIFT_IDS = {
    "g2-p02-l-01", "g2-p02-l-02", "g2-p02-l-05", "g2-p02-r-06",
    "g2-p03-l-04", "g2-p03-r-06", "g2-p03-r-07", "g2-p03-r-08",
    "g2-p03-r-09", "g2-p03-r-10", "g2-p13-r-05", "g2-p19-l-01",
    "g2-p24-l-01", "g2-p24-l-02", "g2-p24-r-03",
}


CURATED = {
    2: [
        "Vitamin C Hard Capsule 30 ngày", "Biotin Sustained Release 30 ngày – gói 30 viên",
        "Son dưỡng môi Lip Cream 1,5g", "Calcium + CBP – túi 90 ngày", "Zinc – 30 ngày",
        "Vitamin C Hard Capsule 90 ngày", "Adlay Extract chiết xuất Ý Dĩ – 30 ngày",
        "Collagen – 30 ngày", "Zinc – 15 ngày",
    ],
    3: [
        "Omega Double High Strength Fish Oil", "Bio Magnesium – 100 viên", "Milk Thistle",
        "Pregnancy & Breastfeeding Gold", "Cholesterol Health", "Evening Primrose Oil",
        "CoQ10 150mg", "Bio C 1000mg", "Multivitamin For Men", "Ginkgo Forte – 40 viên",
    ],
    4: [
        "Aktiv Magnesium + Calcium + D3 – 30 viên", "A-Z Depot – 30 viên", "Ginkgo + B-Vitamins + Choline – 30 viên",
        "Aktiv Vitamin E – 30 viên", "Vitamin D3 + K2 – 30 viên", "Aktiv Omega-3 Seefischöl 1000 – 80 viên",
        "Joints ULTRA – 30 viên", "Aktiv Optima Kinder – chai 100ml", "Haemo Vital – 30 viên",
        "Kinder Immune Syrup – chai 150ml", "Prostacalm – 30 viên", "Vital Pregna – 30 viên",
        "Aktiv Omega-3 Folic Acid B6+B12 – 30 viên", "Coenzyme Q10 – 30 viên", "Liver Complex – 30 viên",
        "Vitamin C 1000 – 30 viên", "Active Men Plus – 30 viên", "Eye Vital – 30 viên",
        "Active Breath – 30 viên", "Anti Stress – 30 viên", "Hair Plus – 30 viên",
        "Kinder Omega-3 Syrup – chai 250ml", "Thymepect – chai 100ml",
    ],
    5: [
        "Clausy – hộp 10 ống", "Preg-Mom 3 tỷ – hộp 20 ống", "Dia 30 – hộp 10 ống",
        "Dung dịch vệ sinh tai mũi họng Navax – 10 ống x 4ml", "Colon 3 tỷ – hộp 10 ống",
        "Navax xịt giảm viêm tai mũi họng – chai 20ml", "Navax Sơ Sinh – hộp 5 ống",
    ],
    6: [
        "GH Creation EX – 270 viên", "Glucosamine – 360 viên", "Glucosamine – 950 viên",
        "Trà ổi hỗ trợ giảm cân – 60 túi", "Nattokinase 4000FU – 60 viên", "Viên uống hàu tươi – 120 viên",
        "BBB viên uống nở ngực – 300 viên", "Bột Collagen Hyaluronic Acid 11000mg – túi 180g",
        "Dầu gan cá mập – 360 viên", "Viên uống bảo vệ gan, giải rượu Fine Japan – 90 viên",
        "Viên uống hàu tươi tỏi nghệ – 180 viên", "Dầu cá Omega-3 hỗ trợ tim mạch – 180 viên",
        "Glucosamine – 900 viên", "Trà giảm mỡ bụng Genpi – 60 gói", "Viên nhai Collagen vị đào – 180 viên",
        "Nattokinase 2000FU – 60 viên", "Viên nhai Vitamin C vị Cherry", "Tảo xoắn Spirulina – 2200 viên",
        "Dầu gan cá mập – 180 viên", "Tinh bột nghệ giải rượu, bảo vệ gan – túi 20g",
        "Viên uống giấm đen giảm cân Kozu Capsule – 216 viên",
    ],
    7: ["Magnesium Bisglycinate 200mg – 120 viên", "Triple Strength Omega-3 900mg – 120 viên"],
    8: [
        "Son dưỡng dầu dừa Bến Tre 5g", "Mặt nạ nghệ Hưng Yên 30ml", "Nước dưỡng tóc tinh dầu bưởi 140ml",
        "Dầu xả bưởi 310ml", "Đường thốt nốt An Giang làm sạch da chết cơ thể 200ml",
        "Nước tẩy trang sen Hậu Giang 500ml", "Cà phê Đắk Lắk làm sạch da chết cơ thể 200ml",
        "Cà phê Đắk Lắk làm sạch da chết mặt 150ml", "Nước tẩy trang bí đao 140ml", "Dầu gội bưởi 310ml",
        "Gel bí đao rửa mặt 140ml", "Thạch bí đao Winter Melon Gel Cream 30ml",
    ],
    9: [
        "Menopause – 30 viên", "Menopause – 90 viên", "Femmes Enceintes dành cho bà bầu – 30 viên",
        "Menopause – 60 viên", "Intima Équilibre – 30 viên", "Collagène Expert – 30 viên",
    ],
    10: [
        "Intimate Wash màu cam", "Intimate Skin Care Daily Wash màu be", "Active Wash màu xanh",
        "Intimate Wash màu hồng", "0% Sensitive Intimate Wash màu xám",
    ],
    11: [
        "Dry Shampoo Fruity & Cheeky Cherry 200ml", "Dry Shampoo Fresh Breezy Citrus 200ml",
        "Dry Shampoo Original Classic Fresh 200ml", "Dry Shampoo Blush Flirty Floral 200ml",
        "Dry Shampoo Tropical Exotic Coconuts 200ml",
    ],
    12: ["Neubiotics Her – 30 viên", "Neu Kid – 30 viên"],
    13: [
        "Feroglobin B12 Capsules – 30 viên", "Pregnacare Max – 84 viên", "Pregnacare Plus Omega-3 – 56 viên",
        "Feroglobin B12 Liquid – chai 200ml", "Osteocare Tablets – 30 viên", "Osteocare Liquid – chai 200ml",
        "Pregnacare Breastfeeding – 84 viên",
    ],
    14: [
        "For Women – 30 viên", "Pregnancy – 30 viên", "Baby Drops – dạng giọt",
        "For Women – 90 viên", "Babies & Children – 30 gói",
    ],
    15: [
        "Milk Calcium Bone Care – 150 viên", "Baby Ddrops Vitamin D3 – chai 2,5ml (90 giọt)", "DHA For Kids – 60 viên",
        "DHA For Pregnancy – 60 viên", "Zinc – 120 viên", "Milk Calcium For Kids – 90 viên",
    ],
    16: [
        "Kids High Strength DHA – 60 viên", "Kids Milk Calcium – 60 viên", "Ginkgo Biloba 2000 – 100 viên",
        "Vitamin E 500IU – 200 viên", "Shark Cartilage 750mg – 200 viên", "Ultimate Omega 3-6-9 – 200 viên",
        "Fish Oil Omega 3 1000mg – 200 viên", "Fish Oil 1000mg – 400 viên", "Super Lecithin 1200mg – 100 viên",
    ],
    17: ["Elevit DHA – 30 viên", "Elevit cho bà bầu – 30 viên", "Elevit Breastfeeding – 30 viên"],
    18: [
        "Kem cừu Lanolin Cream màu tím", "Evening Primrose Oil 1000mg – 60 viên",
        "Kem cừu Lanolin Cream màu trắng", "Fish Oil 1000mg – 60 viên",
    ],
    19: ["Calcium & Vitamin D3 – 130 viên", "Calcium & Vitamin D3 – 60 viên"],
    20: [
        "Liver Health Milk Thistle Plus", "Signature Teeth Health", "Vitamin C 10000 Gold chống oxy hóa",
        "Biotin 10000", "Fish Collagen Plus – Collagen cá thủy phân",
    ],
    21: [
        "Tone Up Sun Cream SPF50+ PA+++", "Mela-Light Ampoule", "Mặt nạ NAD+ – hộp 10 miếng",
        "Whitening Body Cream – 300ml",
    ],
    22: ["Crystal Sun Spray SPF50+ PA+++ – 180ml", "Crystal Sun Spray SPF50+ PA+++ – 80ml"],
    23: [
        "Ferrous Gluconate sắt hữu cơ – 50 viên", "Milk Thistle 500mg – 60 viên",
        "Ginkgo Biloba – 60 viên", "Natural Calcium Citrate + D3 – 60 viên",
    ],
    24: ["Ginkgo Biloba – 60 viên", "Milk Thistle 1000mg – 50 viên", "Melatonin điều hòa giấc ngủ – 60 viên"],
    25: ["Ginkgo Biloba – 30 viên", "DIM For Her cải thiện nội tiết tố nữ – 30 viên"],
    26: ["K2 + D3 Drops", "Vitamin D3 K2 dạng xịt", "K2 + D3 Plus+"],
    27: [
        "Máy tăm nước Pro UV diệt khuẩn màu trắng", "Máy tăm nước Mini màu hồng",
        "Bàn chải điện sóng âm cao tần màu trắng", "Máy tăm nước Pro UV diệt khuẩn màu đen",
        "Bàn chải điện sóng âm cao tần màu hồng", "Máy tăm nước Mini màu xanh Mint",
    ],
    28: ["Xịt nước muối biển đẳng trương", "Xịt nước muối biển ưu trương"],
    29: [
        "Medical Classic Acne Patch – 46 miếng", "Pink Lover Acne Patch – 36 miếng",
        "Sensitive Skin Acne Patch – 36 miếng", "Bling Pearl Flower Acne Patch – 16 miếng",
        "Bling Glitter Lover Acne Patch – 36 miếng", "Bling Water Lover Acne Patch – 36 miếng",
        "Giấy thấm dầu", "Nighttime Acne Patch – 36 miếng", "Bling Diamond Flower Acne Patch",
        "Purple Lover Acne Patch – 36 miếng", "Bling Happy Star Acne Patch",
    ],
    30: [
        "Tinh chất hàu Oyster Plus – 60 viên", "BioGaia Protectis – chai 5ml", "Men phụ khoa Bifidolab Woman Project",
        "Vitaline D Natural Vitamin D3 4000IU – 120 viên", "Xịt Premium bổ sung D3 K2 MK7 Plus DHA – 20ml",
        "Bestical Strawberry Flavor Syrup – 120ml", "Vitamin C 1000mg – 120 viên",
        "Magie hữu cơ Magnefol – 30 viên",
    ],
}

PRICE_OVERRIDES = {
    "p04-L-04": 349000, "p04-L-05": 389000, "p04-L-08": 351000, "p04-L-11": 369000,
    "p04-R-18": 395000, "p04-R-20": 349000,
    "p06-L-09": 870000, "p06-R-12": 600000, "p06-R-18": 840000, "p06-R-21": 300000,
    "p07-R-02": 918000, "p09-L-02": 1260000, "p12-R-02": 525000,
    "p13-L-02": 648000, "p13-R-05": 258000, "p14-L-03": 460000,
    "p15-L-02": 460000, "p16-L-03": 243000, "p25-L-01": 310000, "p30-R-08": 490000,
}

PAGE_BRANDS = {
    2: "DHC", 3: "Blackmores", 4: "Doppelherz", 5: "LiveSpo", 6: "Orihiro",
    7: "Webber Naturals", 8: "Cocoon", 9: "Manhae", 10: "Femfresh", 11: "Batiste",
    12: "Neubria", 13: "Vitabiotics", 14: "Optibac", 15: "Bio Island", 16: "Healthy Care",
    17: "Elevit", 18: "Careline", 19: "Ostelin", 20: "Nutri D-Day", 21: "Eviralab",
    22: "RE:CIPE", 23: "Mason Natural", 24: "Nature's Bounty", 25: "Olympian Labs",
    26: "Lineabon", 27: "Inocare", 28: "BoBo", 29: "Chulago",
}

CARD_BRANDS = {
    "p30-L-01": "Goodhealth", "p30-L-02": "BioGaia", "p30-L-03": "Bifidolab", "p30-L-04": "Vitaline",
    "p30-R-05": "Premium", "p30-R-06": "Bestical", "p30-R-07": "Korean Vitamin C", "p30-R-08": "Solvitale",
}


def ascii_key(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", text).strip()


def classify(name: str, page: int) -> tuple[str, str]:
    key = ascii_key(name)
    if page in {8, 10, 11, 21, 22, 29}:
        return "lam-dep", "tam-goi" if page in {10, 11} else "cham-soc-da"
    if page == 27:
        return "lam-dep", "rang-mieng"
    if page == 28:
        return "suc-khoe", "mat-mui"
    if any(word in key for word in ("eye vital", "teeth health")):
        return "vitamin-tpcn", "mat" if "eye" in key else "co-xuong-khop"
    if any(word in key for word in ("gh creation", "lineabon", "milk calcium bone care")):
        return "me-be", "vitamin-be"
    if any(word in key for word in ("bbb", "bifidolab")):
        return "vitamin-tpcn", "phu-nu"
    if "biogaia protectis" in key or "navax so sinh" in key:
        return "me-be", "suc-khoe-be"
    if "nattokinase" in key:
        return "vitamin-tpcn", "tim"
    if any(word in key for word in ("pregnancy", "pregnacare", "breastfeeding", "ba bau", "vital pregna", "elevit", "femmes enceintes")):
        return "me-be", "me-bau"
    if any(word in key for word in ("kids", "kinder", "baby", "babies", "neu kid", "so sinh", "bestical", "premium bo sung d3")):
        return "me-be", "vitamin-be"
    if any(word in key for word in ("collagen", "biotin", "hair plus", "lanolin", "son duong")):
        return "lam-dep", "collagen" if "collagen" in key or "biotin" in key or "hair" in key else "cham-soc-da"
    if any(word in key for word in ("menopause", "intima", "for women", "primrose", "noi tiet", "dim for her", "neubiotics her")):
        return "vitamin-tpcn", "phu-nu"
    if any(word in key for word in ("oyster", "prostacalm", "men plus", "multivitamin for men", "hau tuoi")):
        return "vitamin-tpcn", "nam-gioi"
    if any(word in key for word in ("omega", "fish oil", "coq10", "cholesterol", "lecithin", "dau ca")):
        return "vitamin-tpcn", "tim"
    if any(word in key for word in ("ginkgo", "melatonin", "anti stress")):
        return "vitamin-tpcn", "nao"
    if any(word in key for word in ("calcium", "canxi", "glucosamine", "joints", "bone care", "shark cartilage", "k2", "d3", "magnesium", "magie", "osteo")):
        return "vitamin-tpcn", "co-xuong-khop"
    if any(word in key for word in ("liver", "milk thistle", "bao ve gan", "giai ruou", "dau gan ca map")):
        return "vitamin-tpcn", "gan"
    if any(word in key for word in ("clausy", "colon", "dia 30", "probiotic", "biogaia", "preg mom", "neubiotic", "optibac")):
        return "vitamin-tpcn", "tieu-hoa"
    if any(word in key for word in ("giam can", "giam mo", "kozu", "tra oi")):
        return "vitamin-tpcn", "giam-can"
    if any(word in key for word in ("navax", "thymepect", "active breath")):
        return "suc-khoe", "mat-mui" if "navax" in key else "di-ung"
    if any(word in key for word in ("a z depot", "multivitamin", "optima kinder")):
        return "vitamin-tpcn", "vitamin-tong-hop"
    return "vitamin-tpcn", "vitamin-khoang"


def clean_description(text: str) -> str:
    lines = [line.strip(" -—_|`~") for line in text.splitlines() if line.strip()]
    useful = []
    for line in lines:
        low = ascii_key(line)
        if "gia niem yet" in low or "gia ban si" in low:
            break
        if any(marker in low for marker in ("bo sung", "ho tro", "duong ", "lam sach", "xoa ", "xit ", "mat na")):
            useful.append(line)
        elif useful and len(useful) < 3 and not re.search(r"\d{2,}\.\d{3}", line):
            useful.append(line)
    text = " ".join(useful)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:360]


raw = json.loads(RAW.read_text(encoding="utf-8"))
by_page: dict[int, list[dict]] = defaultdict(list)
for record in raw:
    by_page[record["page"]].append(record)

catalog = []
for page, records in sorted(by_page.items()):
    names = CURATED[page]
    if len(names) != len(records):
        raise ValueError(f"Trang {page}: {len(records)} thẻ nhưng có {len(names)} tên chuẩn hóa")
    for record, name in zip(records, names):
        card = record["card"]
        price = PRICE_OVERRIDES.get(card, record["price"])
        if not price:
            raise ValueError(f"{card}: thiếu giá niêm yết")
        brand = CARD_BRANDS.get(card, PAGE_BRANDS.get(page, ""))
        group, sub = classify(name, page)
        catalog.append({
            "id": f"g2-{card.lower()}",
            "card": card,
            "name": name,
            "brand": brand,
            "price": price,
            "group": group,
            "sub": sub,
            "img": f"images/sp/g2-{card.lower()}.webp",
            "gift": f"g2-{card.lower()}" in GIFT_IDS,
            "source_description": clean_description(record["ocr"]),
        })

OUT.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Đã chuẩn hóa {len(catalog)} sản phẩm vào {OUT}")
