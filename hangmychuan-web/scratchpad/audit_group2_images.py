from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
paths = sorted((ROOT / "images" / "sp").glob("g2-*.webp"))
cols, thumb, label_h = 8, 150, 28
rows = (len(paths) + cols - 1) // cols
sheet = Image.new("RGB", (cols * thumb, rows * (thumb + label_h)), "#eceef3")
draw = ImageDraw.Draw(sheet)
font = ImageFont.load_default()

for index, path in enumerate(paths):
    image = Image.open(path).convert("RGB")
    image.thumbnail((thumb - 12, thumb - 12), Image.Resampling.LANCZOS)
    col, row = index % cols, index // cols
    x = col * thumb + (thumb - image.width) // 2
    y = row * (thumb + label_h) + (thumb - image.height) // 2
    sheet.paste(image, (x, y))
    label = path.stem
    box = draw.textbbox((0, 0), label, font=font)
    draw.text((col * thumb + (thumb - (box[2] - box[0])) // 2,
               row * (thumb + label_h) + thumb + 5), label, fill="#20243b", font=font)

output = ROOT / "scratchpad" / "group2-images-audit.jpg"
sheet.save(output, quality=82, optimize=True, progressive=True)
print(output)
