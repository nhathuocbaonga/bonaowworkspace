from __future__ import annotations

import io
import json
import os
import time
import urllib.request
import urllib.parse
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
MATCHES = json.loads((ROOT / "_nguon" / "hang-nhom-2-image-matches.json").read_text(encoding="utf-8"))
REPORT = ROOT / "_nguon" / "hang-nhom-2-image-upgrade-report.json"

# Những mã có kết quả tìm kiếm gần tên nhưng sai phiên bản sẽ không được thay tự động.
REJECT = set()

# Kết quả đúng đã đối chiếu thủ công theo tên, số viên/dung tích và hình trên catalogue.
OVERRIDE = {
    "g2-p04-l-02": "https://duocthethao.com/storage/image/Screenshot 2025-09-16 1146131757997914.png",
    "g2-p05-r-05": "https://duocthethao.com/storage/image/Screenshot 2026-08-07 1340471786084868.png",
    "g2-p06-l-09": "https://duocthethao.com/storage/image/unnamed (9)1624937448.jpg",
    "g2-p08-l-02": "https://duocthethao.com/storage/image/ChatGPT Image Aug 8, 2026, 03_10_49 PM1786176673.png",
    "g2-p08-r-10": "https://duocthethao.com/storage/image/ChatGPT Image Aug 8, 2026, 03_17_50 PM1786177102.png",
    "g2-p10-l-01": "https://duocthethao.com/storage/image/LJQKkqq6G21675394443.jpg",
    "g2-p13-r-05": "https://duocthethao.com/storage/image/Screenshot 2025-12-11 1043371765424500.png",
    "g2-p13-r-07": "https://duocthethao.com/storage/image/27448_5cba66ff7c929bccc2831638261921.jpg",
    "g2-p16-r-06": "https://duocthethao.com/storage/image/Screenshot 2026-08-03 1319561785738064.png",
    "g2-p17-l-02": "https://duocthethao.com/storage/image/2629CC2E-2A63-4735-A1BA-1AF2460C03BD1673364715.jpeg",
    "g2-p26-l-01": "https://duocthethao.com/storage/image/87491674788693.jpg",
    "g2-p30-r-05": "https://duocthethao.com/storage/image/z6816685413871_7f41d0e50726adaab3515338381b9bae1752814999.jpg",
    "g2-p04-l-06": "https://apotekazero.rs/fajlovi/product/doppelherz-aktiv-omega-3-1000mg-80-kapsula-501.jpg",
    "g2-p04-r-21": "https://www.valsona.at/upload/image/big/9778.jpg",
    "g2-p07-r-02": "https://beyondrx.ca/cdn/shop/files/webbernaturalsOmega-3TripleStrength900mgEPADHA_120softgels_-ProductLabelinEnglish-min.jpg?v=1685242504&width=1946",
    "g2-p10-r-04": "https://www.regentsparkpharmacy.com.au/cdn/shop/files/femfresh-intimate-skin-care-soothing-wash-250ml-719607.jpg?v=1721119783&width=1500",
    "g2-p18-r-04": "https://bizweb.dktcdn.net/thumb/1024x1024/100/502/072/products/image-1733365156282.png?v=1733568133663",
    "g2-p24-l-01": "https://cdn.nhathuoclongchau.com.vn/v1/static/00003337_ginkgo_biloba_60mg_60v_natures_bounty_8579_63db_large_dc0d941fcd.jpg",
    "g2-p27-l-02": "https://www.inocare.vn/cdn/shop/files/Tam_n_c_Mini_h_ng.png?v=1763634803",
}


def fetch(url: str) -> bytes:
    parts = urllib.parse.urlsplit(url)
    safe_url = urllib.parse.urlunsplit((parts.scheme, parts.netloc, urllib.parse.quote(parts.path), parts.query, parts.fragment))
    request = urllib.request.Request(safe_url, headers={"User-Agent": "Mozilla/5.0 HangMyChuan/1.0"})
    with urllib.request.urlopen(request, timeout=35) as response:
        return response.read()


def optimize(data: bytes) -> tuple[bytes, tuple[int, int]]:
    image = ImageOps.exif_transpose(Image.open(io.BytesIO(data)))
    original_size = image.size
    if image.mode not in {"RGB", "RGBA"}:
        image = image.convert("RGBA" if "transparency" in image.info else "RGB")
    if image.mode == "RGBA":
        base = Image.new("RGBA", image.size, "white")
        base.alpha_composite(image)
        image = base.convert("RGB")
    else:
        image = image.convert("RGB")
    image.thumbnail((584, 584), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (640, 640), "white")
    canvas.paste(image, ((640 - image.width) // 2, (640 - image.height) // 2))
    out = io.BytesIO()
    canvas.save(out, "WEBP", quality=80, method=6)
    if out.tell() > 110_000:
        out = io.BytesIO()
        canvas.save(out, "WEBP", quality=72, method=6)
    return out.getvalue(), original_size


only_ids = {x for x in os.environ.get("HMC_IMAGE_IDS", "").split(",") if x}
report = []
for index, row in enumerate(MATCHES, 1):
    product_id = row["id"]
    if only_ids and product_id not in only_ids:
        continue
    if product_id in REJECT or not row.get("best"):
        report.append({"id": product_id, "status": "kept-catalogue", "reason": "chưa đủ chắc chắn đúng phiên bản"})
        continue
    url = OVERRIDE.get(product_id, row["best"]["img"])
    try:
        raw = fetch(url)
        optimized, original_size = optimize(raw)
        if max(original_size) < 280:
            raise ValueError(f"ảnh nguồn quá nhỏ: {original_size}")
        target = ROOT / "images" / "sp" / f"{product_id}.webp"
        target.write_bytes(optimized)
        report.append({
            "id": product_id, "status": "upgraded", "source": url,
            "source_size": list(original_size), "bytes": len(optimized),
        })
        print(f"[{index:03}/{len(MATCHES)}] {product_id}: {original_size} -> {len(optimized) // 1024} KB")
    except Exception as exc:
        report.append({"id": product_id, "status": "kept-catalogue", "reason": str(exc), "source": url})
        print(f"[{index:03}/{len(MATCHES)}] {product_id}: GIỮ ẢNH CŨ ({exc})")
    time.sleep(0.12)

REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
upgraded = sum(x["status"] == "upgraded" for x in report)
total_bytes = sum(x.get("bytes", 0) for x in report)
print(f"Đã nâng cấp {upgraded}/{len(report)} ảnh; tổng ảnh mới {total_bytes / 1024 / 1024:.2f} MB.")
