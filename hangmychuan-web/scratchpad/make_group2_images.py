from pathlib import Path
import json
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
CATALOG = json.loads((ROOT / "_nguon" / "hang-nhom-2-catalog.json").read_text(encoding="utf-8"))
CARDS = ROOT / "_nguon" / "hang-nhom-2-cards-v2"
OUT = ROOT / "images" / "sp"

for item in CATALOG:
    card = Image.open(CARDS / f"{item['card']}.jpg").convert("RGB")
    # Catalogue bố trí ảnh sản phẩm ở cột trái; bỏ phần chữ và dải giá phía dưới.
    pack = card.crop((22, 7, 157, max(10, card.height - 70)))
    bg = Image.new("RGB", pack.size, "white")
    diff = ImageChops.difference(pack, bg).convert("L")
    bbox = diff.point(lambda p: 255 if p > 12 else 0).getbbox()
    if bbox:
        pack = pack.crop(bbox)
    scale = min(500 / pack.width, 500 / pack.height)
    pack = pack.resize((max(1, round(pack.width * scale)), max(1, round(pack.height * scale))), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (640, 640), "white")
    canvas.paste(pack, ((640 - pack.width) // 2, (640 - pack.height) // 2))
    canvas.save(ROOT / item["img"], "WEBP", quality=92, method=6)

print(f"Đã tạo {len(CATALOG)} ảnh sản phẩm nền trắng, không kéo méo.")
