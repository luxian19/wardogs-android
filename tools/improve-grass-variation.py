from pathlib import Path
from datetime import datetime
import shutil

p = Path("www/index.html")
s = p.read_text()

changes = [
(
"""          const variant = 11 + Math.floor(grassRandom(seed + 2) * 6);""",
"""          const variant = Math.floor(
            grassRandom(seed + 2) * GRASS_VARIANT_COUNT
          );"""
),
(
"""          grassDummy.scale.set(
            12 + grassRandom(seed + 4) * 6,
            16 + grassRandom(seed + 5) * 12,
            12 + grassRandom(seed + 4) * 6
          );""",
"""          const isTiny = variant >= 11;
          const width = isTiny
            ? 12 + grassRandom(seed + 4) * 6
            : 4.5 + grassRandom(seed + 4) * 2.5;
          const height = isTiny
            ? 16 + grassRandom(seed + 5) * 12
            : 5 + grassRandom(seed + 5) * 3;

          grassDummy.scale.set(width, height, width);"""
),
(
"""          const shade = 0.88 + grassRandom(seed + 6) * 0.12;""",
"""          const tint = grassRandom(seed + 6);
          const redTint = 0.72 + tint * 0.28;
          const greenTint = 0.80 + grassRandom(seed + 7) * 0.20;
          const blueTint = 0.68 + grassRandom(seed + 8) * 0.27;"""
),
(
"""            colors.push(
              shade,
              Math.min(1, shade + 0.025),
              Math.max(0, shade - 0.045)
            );""",
"""            colors.push(redTint, greenTint, blueTint);"""
)
]

for old, new in changes:
    if s.count(old) != 1:
        raise SystemExit("ABORT: pola tidak ditemukan tepat satu kali:\n" + old[:100])
    s = s.replace(old, new, 1)

backup = p.with_name(
    p.name + ".backup-grass-variation-" +
    datetime.now().strftime("%Y%m%d-%H%M%S")
)
shutil.copy2(p, backup)
p.write_text(s)

print("PATCH OK: 17 varian, ukuran dan warna bervariasi")
print("Backup:", backup)
