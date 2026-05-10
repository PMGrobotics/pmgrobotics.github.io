import sys
from pathlib import Path
from PIL import Image

script_dir = Path(sys.argv[1])
max_size   = int(sys.argv[2])
quality    = int(sys.argv[3])
force      = sys.argv[4] == "1"

images_dir  = script_dir / "images"
total_orig  = 0
total_thumb = 0
count       = 0


def resize(src: Path, dst: Path):
    global total_orig, total_thumb, count

    if dst.exists() and not force:
        print(f"  skip (exists): {src.name}  [use --force to overwrite]")
        return

    dst.parent.mkdir(parents=True, exist_ok=True)
    orig_bytes = src.stat().st_size

    with Image.open(src) as img:
        orig_w, orig_h = img.size
        img = img.copy()
        img.thumbnail((max_size, max_size), Image.LANCZOS)
        new_w, new_h = img.size

        fmt = src.suffix.lstrip(".").upper()
        if fmt in ("JPG", "JPEG"):
            fmt = "JPEG"
            save_kw = {"quality": quality, "optimize": True}
        elif fmt == "PNG":
            save_kw = {"optimize": True}
        else:
            save_kw = {}

        img.save(dst, format=fmt, **save_kw)

    thumb_bytes  = dst.stat().st_size
    total_orig  += orig_bytes
    total_thumb += thumb_bytes
    count       += 1

    savings = (1 - thumb_bytes / orig_bytes) * 100 if orig_bytes else 0
    print(f"  {src.name}  {orig_w}x{orig_h} → {new_w}x{new_h}  "
          f"{orig_bytes/1024:.0f}KB → {thumb_bytes/1024:.0f}KB  ({savings:.0f}% smaller)")


# Project images
projects_dir = images_dir / "projects"
for project_dir in sorted(projects_dir.iterdir()):
    if not project_dir.is_dir():
        continue
    imgs = sorted(f for f in project_dir.iterdir()
                  if f.is_file() and f.suffix.lower() in (".png", ".jpg", ".jpeg"))
    if not imgs:
        continue
    print(f"\n[{project_dir.name}]")
    for img in imgs:
        resize(img, project_dir / "thumbs" / img.name)

# Team photos
team_dir = images_dir / "team"
print(f"\n[team]")
for img in sorted(f for f in team_dir.iterdir()
                  if f.is_file() and f.suffix.lower() in (".png", ".jpg", ".jpeg")):
    resize(img, team_dir / "thumbs" / img.name)

# Summary
print(f"\n{'─'*55}")
print(f"Done. {count} image(s) processed.")
if total_orig:
    print(f"Total: {total_orig/1024/1024:.1f} MB → {total_thumb/1024/1024:.1f} MB  "
          f"({(1 - total_thumb/total_orig)*100:.0f}% smaller)")

print("""
Next steps — update YAML thumbnail: fields, e.g.:
  thumbnail: "images/projects/arcsec/thumbs/twinkle.png"

Detail page images: list stays pointing to originals (full res).
Team photo: field stays pointing to originals unless you want small there too.
""")
