from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PAGES = ROOT / "_nguon" / "hang-nhom-2-pages"
OUT = ROOT / "_nguon" / "hang-nhom-2-cards-v2"
OUT.mkdir(parents=True, exist_ok=True)


def runs(values: np.ndarray) -> list[tuple[int, int]]:
    if not len(values):
        return []
    result: list[tuple[int, int]] = []
    start = previous = int(values[0])
    for raw in values[1:]:
        current = int(raw)
        if current == previous + 1:
            previous = current
            continue
        result.append((start, previous))
        start = previous = current
    result.append((start, previous))
    return result


summary: list[str] = []
for page_path in sorted(PAGES.glob("page-*.jpg"))[1:]:
    image = Image.open(page_path).convert("RGB")
    pixels = np.asarray(image)
    green = (
        (pixels[:, :, 0] < 70)
        & (pixels[:, :, 1] > 45)
        & (pixels[:, :, 1] < 160)
        & (pixels[:, :, 2] < 110)
    )
    width, _ = image.size
    halves = ((0, width // 2), (width // 2, width))
    page_number = int(page_path.stem.split("-")[-1])
    card_number = 0

    for side, (left, right) in zip(("L", "R"), halves):
        row_counts = green[:, left:right].sum(axis=1)
        threshold = int((right - left) * 0.58)
        green_runs = [r for r in runs(np.where(row_counts > threshold)[0]) if r[0] > 80]
        borders = [r for r in green_runs if r[1] - r[0] <= 8]
        bands = [r for r in green_runs if r[1] - r[0] >= 18]

        for band in bands:
            border = next((candidate for candidate in reversed(borders) if candidate[1] < band[0]), None)
            if border is None:
                continue
            card_number += 1
            crop = image.crop((left + 5, max(0, border[0] - 2), right - 5, min(image.height, band[1] + 2)))
            name = f"p{page_number:02d}-{side}-{card_number:02d}.jpg"
            crop.save(OUT / name, quality=95, optimize=True)
            summary.append(f"{name}\t{crop.width}x{crop.height}")

(OUT / "manifest.txt").write_text("\n".join(summary) + "\n", encoding="utf-8")
print(f"Cropped {len(summary)} product cards")
