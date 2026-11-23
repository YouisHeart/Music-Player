"""Generate original demo artwork for the Cyber Music Player.

Artwork is produced with the public Pollinations text-to-image endpoint and then
post-processed locally (watermark strip cropped, cinematic upscale, bloom, grain,
WebP conversion). Development-time tool only: generated assets are committed so
the application never needs network access at runtime.

Usage: python scripts/generate_assets.py [--only name] [--force]
"""
from __future__ import annotations

import argparse
import io
import time
import urllib.parse
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
WALLPAPERS = ROOT / "public" / "wallpapers"
COVERS = ROOT / "public" / "covers"
RAW = ROOT / "scripts" / ".raw"

ENDPOINT = "https://image.pollinations.ai/prompt/{prompt}"

WALLPAPER_JOBS = {
    "neon-city": (
        "wide cinematic anime background of an empty cyberpunk city street at night, towering skyscrapers "
        "covered in cyan and violet neon signs, holographic billboards in the distance, wet asphalt with "
        "colorful reflections, low fog, deep navy sky, Makoto Shinkai style, ultra detailed architecture, "
        "no people, no characters, no text, no watermark"
    ),
    "sakura-shrine": (
        "wide cinematic anime background of a traditional japanese shrine at night surrounded by blooming "
        "sakura trees, glowing paper lanterns, petals drifting, a distant futuristic city skyline glowing "
        "purple between the branches, deep indigo starry sky, teal rim light, no people, no characters, "
        "no text, no watermark"
    ),
    "rain-alley": (
        "wide cinematic anime background of a narrow cyberpunk alley at night in the rain, glowing neon "
        "signs in cyan magenta and violet, wet asphalt reflections, steam vents, overhead cables, distant "
        "skyscrapers, dramatic lighting, empty street, no people, no characters, no text, no watermark"
    ),
    "star-lake": (
        "wide cinematic anime background of a vast starry night sky with the milky way over a calm mountain "
        "lake, aurora ribbons in teal and violet, silhouetted pine trees, glowing fireflies, mirror "
        "reflections, deep navy indigo palette, no people, no characters, no text, no watermark"
    ),
}

COVER_JOBS = {
    "cover-rooftop": (
        "anime illustration of a silver haired girl sitting on a rooftop ledge overlooking a neon cyberpunk "
        "city at dusk, seen from behind, purple and orange sunset clouds, holographic skyline, cinematic "
        "rim light, ultra detailed digital painting, album cover composition, no text, no watermark"
    ),
    "cover-headphones": (
        "anime cyberpunk portrait of a girl wearing glowing headphones, neon cyan and purple light on her "
        "face, futuristic city bokeh background, dark moody atmosphere, ultra detailed digital painting, "
        "album cover composition, no text, no watermark"
    ),
    "cover-starlake": (
        "anime illustration of a lone figure standing in a shallow reflective lake under a vast starry sky "
        "with teal and violet nebula clouds, silhouetted, glowing particles floating, cinematic, ultra "
        "detailed, album cover composition, no text, no watermark"
    ),
    "cover-umbrella": (
        "anime illustration of a girl with a transparent umbrella on a rainy neon street at night seen from "
        "behind, reflections of magenta and cyan signs in puddles, moody cinematic atmosphere, ultra "
        "detailed digital painting, album cover composition, no text, no watermark"
    ),
    "cover-turntable": (
        "close up of a futuristic vinyl turntable on a rooftop at night, glowing blue neon ring around the "
        "record, city lights bokeh in the background, cinematic, ultra detailed anime illustration, "
        "album cover composition, no people, no text, no watermark"
    ),
    "cover-sakura": (
        "anime portrait of a girl in a dark kimono under glowing sakura trees at night, petals falling, "
        "purple and teal neon rim light, distant futuristic temple lights, cinematic, ultra detailed "
        "digital painting, album cover composition, no text, no watermark"
    ),
}


def download(prompt: str, width: int, height: int, seed: int) -> bytes:
    query = urllib.parse.urlencode(
        {
            "width": width,
            "height": height,
            "seed": seed,
            "model": "flux",
        }
    )
    url = ENDPOINT.format(prompt=urllib.parse.quote(prompt, safe="")) + "?" + query
    request = urllib.request.Request(url, headers={"User-Agent": "cyber-music-player/1.0"})
    with urllib.request.urlopen(request, timeout=240) as response:
        return response.read()


def add_bloom(image: Image.Image, radius: int, strength: float) -> Image.Image:
    bright = image.filter(ImageFilter.GaussianBlur(radius))
    return Image.blend(image, Image.blend(image, bright, 0.55), strength)


def add_grain(image: Image.Image, amount: float) -> Image.Image:
    array = np.asarray(image).astype(np.float32)
    rng = np.random.default_rng(20261123)
    grain = rng.normal(0.0, amount, array.shape[:2])[:, :, None]
    array = np.clip(array + grain, 0, 255)
    return Image.fromarray(array.astype(np.uint8), "RGB")


def cinematic_upscale(image: Image.Image, size: tuple[int, int], centering: tuple[float, float]) -> Image.Image:
    image = ImageOps.fit(image, size, method=Image.LANCZOS, centering=centering)
    image = ImageEnhance.Color(image).enhance(1.08)
    image = ImageEnhance.Contrast(image).enhance(1.05)
    image = image.filter(ImageFilter.UnsharpMask(radius=2.0, percent=85, threshold=2))
    image = add_bloom(image, radius=max(8, size[0] // 80), strength=0.22)
    image = add_grain(image, 2.6)
    # Gentle vignette so UI text always keeps contrast over the artwork.
    width, height = size
    yy, xx = np.mgrid[0:height, 0:width]
    cx, cy = width / 2, height / 2
    distance = np.sqrt(((xx - cx) / cx) ** 2 + ((yy - cy) / cy) ** 2)
    vignette = np.clip(1.06 - 0.34 * distance**2, 0.55, 1.0)[:, :, None]
    array = np.asarray(image).astype(np.float32) * vignette
    return Image.fromarray(np.clip(array, 0, 255).astype(np.uint8), "RGB")


def process(raw: bytes, target: Path, size: tuple[int, int], cover: bool) -> None:
    image = Image.open(io.BytesIO(raw)).convert("RGB")
    width, height = image.size
    crop = max(22, int(height * 0.08))
    image = image.crop((0, 0, width, max(1, height - crop)))
    centering = (0.5, 0.44) if cover else (0.5, 0.5)
    image = cinematic_upscale(image, size, centering)
    image.save(target, "WEBP", quality=89, method=6)
    print(f"  saved {target.relative_to(ROOT)} {image.size}", flush=True)


def run_jobs(jobs: dict[str, str], directory: Path, size: tuple[int, int], cover: bool, only: str | None, force: bool) -> None:
    directory.mkdir(parents=True, exist_ok=True)
    RAW.mkdir(parents=True, exist_ok=True)
    for index, (name, prompt) in enumerate(jobs.items()):
        if only and only not in name:
            continue
        raw_path = RAW / f"{name}.jpg"
        target = directory / f"{name}.webp"
        if target.exists() and not force:
            print(f"skip {target.name}", flush=True)
            continue
        for attempt in range(1, 6):
            try:
                print(f"generating {name} (attempt {attempt})", flush=True)
                raw = download(prompt, 640 if not cover else 512, 360 if not cover else 512, seed=20261123 + index * 13)
                raw_path.write_bytes(raw)
                process(raw, target, size, cover)
                break
            except Exception as error:  # noqa: BLE001 - dev-time tool
                print(f"  failed: {error}", flush=True)
                time.sleep(5 * attempt)
        else:
            print(f"  giving up on {name}", flush=True)
        time.sleep(2.0)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", default=None)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--covers-only", action="store_true")
    parser.add_argument("--wallpapers-only", action="store_true")
    args = parser.parse_args()

    if not args.covers_only:
        run_jobs(WALLPAPER_JOBS, WALLPAPERS, (1536, 864), False, args.only, args.force)
    if not args.wallpapers_only:
        run_jobs(COVER_JOBS, COVERS, (900, 900), True, args.only, args.force)


if __name__ == "__main__":
    main()
