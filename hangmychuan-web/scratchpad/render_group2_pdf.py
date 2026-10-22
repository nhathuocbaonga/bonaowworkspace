from pathlib import Path

import pypdfium2 as pdfium
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "_nguon" / "Bang Gia Hang Nhom 2.pdf"
OUT = ROOT / "_nguon" / "hang-nhom-2-pages"
OUT.mkdir(parents=True, exist_ok=True)


pdf = pdfium.PdfDocument(PDF)
thumbs = []
for index in range(len(pdf)):
    page = pdf[index]
    bitmap = page.render(scale=2.0)
    image = bitmap.to_pil().convert("RGB")
    page_path = OUT / f"page-{index + 1:02d}.jpg"
    image.save(page_path, quality=92, optimize=True)

    thumb = image.copy()
    thumb.thumbnail((360, 520), Image.Resampling.LANCZOS)
    tile = Image.new("RGB", (380, 560), "white")
    tile.paste(thumb, ((380 - thumb.width) // 2, 30))
    draw = ImageDraw.Draw(tile)
    draw.text((14, 8), f"Trang {index + 1}", fill="black", font=ImageFont.load_default())
    thumbs.append(tile)

columns = 4
rows = (len(thumbs) + columns - 1) // columns
sheet = Image.new("RGB", (columns * 380, rows * 560), "#eeeeee")
for index, tile in enumerate(thumbs):
    sheet.paste(tile, ((index % columns) * 380, (index // columns) * 560))
sheet.save(OUT / "contact-sheet.jpg", quality=90, optimize=True)
print(f"Rendered {len(pdf)} pages to {OUT}")
