from pathlib import Path
from datetime import datetime
import shutil

p = Path("www/index.html")
s = p.read_text()

replacements = [
    ("const GRASS_GRID = 7;", "const GRASS_GRID = 12;"),
    (
        "grassRandom(seed + 2) * GRASS_VARIANT_COUNT",
        "grassRandom(seed + 2) * 11"
    ),
    (
        "const width = 1.0 + grassRandom(seed + 4) * 0.65;",
        "const width = 2.0 + grassRandom(seed + 4) * 1.0;"
    ),
    (
        "const height = 1.45 + grassRandom(seed + 5) * 1.05;",
        "const height = 4.0 + grassRandom(seed + 5) * 2.0;"
    )
]

for old, new in replacements:
    count = s.count(old)
    if count != 1:
        raise SystemExit(f"ABORT: pola ditemukan {count} kali: {old}")
    s = s.replace(old, new, 1)

backup = p.with_name(
    p.name + ".backup-grass-density-" +
    datetime.now().strftime("%Y%m%d-%H%M%S")
)
shutil.copy2(p, backup)
p.write_text(s)

print("PATCH OK")
print("Backup:", backup)
print("Grid: 12x12 | Variants: 11 | Scale diperbesar")
