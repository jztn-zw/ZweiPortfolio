"""Create pixel-identical WebP assets for PNGs referenced by the portfolio.

Requires Pillow with WebP support. Missing PNG originals are skipped; existing
originals are not deleted by this script.
Run from the project root with: python scripts/optimize-images.py
"""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json
import re

from PIL import Image, ImageChops

root = Path(__file__).resolve().parents[1]
references = set()
for source in (root / "src").rglob("*"):
    if source.suffix in {".tsx", ".ts", ".css"}:
        references.update(re.findall(r"/images/([\w/-]+)\.(?:png|webp)", source.read_text(encoding="utf-8")))


def convert(name):
    original = root / "public/images" / f"{name}.png"
    if not original.exists():
        return None
    output = original.with_suffix(".webp")
    with Image.open(original) as source:
        pixels = source.convert("RGBA")
        pixels.save(output, "WEBP", lossless=True, exact=True, method=6)
        with Image.open(output) as saved:
            if ImageChops.difference(pixels, saved.convert("RGBA")).getbbox(alpha_only=False):
                raise ValueError(f"Pixel mismatch: {name}")
    result = {"asset": name, "original": original.stat().st_size, "optimized": output.stat().st_size, "pixel_identical": True}
    print(json.dumps(result), flush=True)
    return result


with ThreadPoolExecutor(max_workers=3) as workers:
    results = [result for result in workers.map(convert, sorted(references)) if result]
(root / "output").mkdir(exist_ok=True)
(root / "output/media-optimization.json").write_text(json.dumps(results, indent=2), encoding="utf-8")
