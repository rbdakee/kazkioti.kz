"""Generate favicon assets from the TS2114 tractor photo.

The source is a JPEG with a white studio background. We flood-fill the
background to transparent from the image corners (so interior white pixels --
chrome, headlights, wheel rims -- stay opaque), crop to the subject's
bounding box, and emit:
  app/icon.png         (32x32) -- favicon used by browsers
  app/apple-icon.png   (180x180) -- iOS home-screen icon
  public/favicon.ico   (16/32/48 multi-size) -- legacy fallback at /favicon.ico
"""

from collections import deque
from pathlib import Path
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "images" / "tractors" / "ts2114.jpg"

# Flood-reach threshold: anything *strictly brighter* than this counts as
# "definitely background" and gets fully transparent. Lower = more aggressive.
HARD_WHITE = 248
# Soft-edge threshold: pixels between SOFT_WHITE and HARD_WHITE get partial
# alpha so the silhouette has anti-aliased edges instead of a jagged cutout.
SOFT_WHITE = 215
# How much pixels need to "leak" outward from the connected background region
# to be considered edge candidates (in pixels). Keeps interior whites opaque
# while still capturing soft shadows touching the silhouette.
SOFT_RADIUS = 6


def remove_white_background(img: Image.Image) -> Image.Image:
    """Remove the studio background with a soft, anti-aliased edge.

    Two-pass:
      1. Flood-fill from the corners marking everything reachable through
         very-white pixels (>= HARD_WHITE on each channel) as "background-
         connected".
      2. Walk SOFT_RADIUS pixels inward from that region; for those edge
         pixels, set alpha proportional to how close to white they are.
    Interior bright pixels (headlights, wheel rims) stay fully opaque because
    they are not reachable from the corners.
    """
    rgb = img.convert("RGB")
    width, height = rgb.size
    pixels = rgb.load()

    reach = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def is_hard_bg(x: int, y: int) -> bool:
        r, g, b = pixels[x, y]
        return r >= HARD_WHITE and g >= HARD_WHITE and b >= HARD_WHITE

    def enqueue_if_unseen(x: int, y: int) -> None:
        idx = y * width + x
        if not reach[idx] and is_hard_bg(x, y):
            reach[idx] = 1
            queue.append((x, y))

    for x in range(width):
        enqueue_if_unseen(x, 0)
        enqueue_if_unseen(x, height - 1)
    for y in range(height):
        enqueue_if_unseen(0, y)
        enqueue_if_unseen(width - 1, y)

    while queue:
        x, y = queue.popleft()
        if x > 0:
            enqueue_if_unseen(x - 1, y)
        if x + 1 < width:
            enqueue_if_unseen(x + 1, y)
        if y > 0:
            enqueue_if_unseen(x, y - 1)
        if y + 1 < height:
            enqueue_if_unseen(x, y + 1)

    soft_span = float(HARD_WHITE - SOFT_WHITE)
    alpha = [255] * (width * height)

    for y in range(height):
        row = y * width
        for x in range(width):
            idx = row + x
            if reach[idx]:
                alpha[idx] = 0

    # Soft halo: for each non-background pixel adjacent (within SOFT_RADIUS) to
    # a hard-background pixel, ease the alpha based on its brightness.
    for y in range(height):
        for x in range(width):
            idx = y * width + x
            if reach[idx]:
                continue
            r, g, b = pixels[x, y]
            min_ch = min(r, g, b)
            if min_ch < SOFT_WHITE:
                continue
            near_bg = False
            for dy in range(-SOFT_RADIUS, SOFT_RADIUS + 1):
                ny = y + dy
                if ny < 0 or ny >= height:
                    continue
                for dx in range(-SOFT_RADIUS, SOFT_RADIUS + 1):
                    nx = x + dx
                    if nx < 0 or nx >= width:
                        continue
                    if reach[ny * width + nx]:
                        near_bg = True
                        break
                if near_bg:
                    break
            if not near_bg:
                continue
            t = (min_ch - SOFT_WHITE) / soft_span
            t = max(0.0, min(1.0, t))
            alpha[idx] = int(round(255 * (1.0 - t)))

    rgba = rgb.convert("RGBA")
    alpha_img = Image.new("L", (width, height))
    alpha_img.putdata(alpha)
    # A tiny Gaussian blur smooths the alpha mask so that LANCZOS downscaling
    # to 32x32 has a soft gradient to work with, not a binary cutout.
    alpha_img = alpha_img.filter(ImageFilter.GaussianBlur(radius=0.8))
    rgba.putalpha(alpha_img)
    return rgba


def square_crop(img: Image.Image, margin_ratio: float = 0.08) -> Image.Image:
    """Square crop centered on the subject's opaque bounding box."""
    bbox = img.split()[-1].getbbox()
    if bbox is None:
        return img
    sx, sy, ex, ey = bbox
    box_w = ex - sx
    box_h = ey - sy
    side = max(box_w, box_h)
    margin = int(side * margin_ratio)
    side += margin * 2
    cx = (sx + ex) // 2
    cy = (sy + ey) // 2
    half = side // 2
    left = cx - half
    top = cy - half

    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    width, height = img.size
    src_left = max(left, 0)
    src_top = max(top, 0)
    src_right = min(left + side, width)
    src_bottom = min(top + side, height)
    canvas.paste(
        img.crop((src_left, src_top, src_right, src_bottom)),
        (src_left - left, src_top - top),
    )
    return canvas


def main() -> None:
    photo = Image.open(SRC)
    cut = remove_white_background(photo)
    square = square_crop(cut)

    icon_dir = ROOT / "app"
    public_dir = ROOT / "public"

    # 32x32 favicon (tabs at 1x) and 192x192 (tabs at 2x / Android home).
    square.resize((32, 32), Image.LANCZOS).save(icon_dir / "icon.png", format="PNG")
    square.resize((192, 192), Image.LANCZOS).save(
        icon_dir / "icon1.png", format="PNG"
    )
    square.resize((180, 180), Image.LANCZOS).save(
        icon_dir / "apple-icon.png", format="PNG"
    )
    square.save(
        public_dir / "favicon.ico",
        format="ICO",
        sizes=[(64, 64), (48, 48), (32, 32), (16, 16)],
    )

    print(f"wrote {icon_dir / 'icon.png'}")
    print(f"wrote {icon_dir / 'icon1.png'}")
    print(f"wrote {icon_dir / 'apple-icon.png'}")
    print(f"wrote {public_dir / 'favicon.ico'}")


if __name__ == "__main__":
    main()
