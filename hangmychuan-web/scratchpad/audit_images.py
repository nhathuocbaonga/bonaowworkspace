from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
files = sorted((root / "images" / "sp").glob("*.webp"))
files += sorted((root / "images" / "sp").glob("*.jpg"))
cols, cell_w, cell_h = 5, 220, 250
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * cell_w, rows * cell_h), "#f4f1eb")
draw = ImageDraw.Draw(sheet)
font = ImageFont.load_default()

for index, path in enumerate(files):
    image = Image.open(path).convert("RGB")
    image.thumbnail((190, 195), Image.Resampling.LANCZOS)
    x = (index % cols) * cell_w
    y = (index // cols) * cell_h
    px = x + (cell_w - image.width) // 2
    py = y + 8 + (195 - image.height) // 2
    sheet.paste(image, (px, py))
    draw.text((x + 8, y + 210), path.stem[:30], fill="#111111", font=font)
    draw.text((x + 8, y + 226), f"{Image.open(path).size[0]}x{Image.open(path).size[1]}", fill="#666666", font=font)

out = root / "scratchpad" / "product-images-audit.jpg"
sheet.save(out, quality=88)
print(out)
