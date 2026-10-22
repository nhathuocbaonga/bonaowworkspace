from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root / "_nguon" / "Multi Plus Orange - multinutri.jpg"
target = root / "images" / "sp" / "multinutri-orange.webp"

image = Image.open(source).convert("RGB")
product = image.crop((470, 300, 860, 840))
product.thumbnail((610, 700), Image.Resampling.LANCZOS)
canvas = Image.new("RGB", (800, 800), "white")
x = (canvas.width - product.width) // 2
y = (canvas.height - product.height) // 2
canvas.paste(product, (x, y))
canvas.save(target, "WEBP", quality=92, method=6)
print(target.name)
