from pathlib import Path
from datetime import datetime

p = Path("www/index.html")
s = p.read_text()

blocks = [
    (
        "// WARDOGS REALISTIC FOREST ASSET PLACEMENT",
        "// Outer Perimeter Timber & Earthwork Ridge Walls (400 x 400)"
    ),
    (
        "// REALISTIC FIR FOREST GLB WITH DISTANCE-BASED CHUNK LOD.",
        "// Tactical Forest Outpost Bunkers & Watchtowers"
    )
]

for start, end in blocks:
    if s.count(start) != 1 or s.count(end) != 1:
        raise SystemExit("GAGAL: penanda tidak cocok: " + start)

    a = s.index(start)
    b = s.index(end, a)

    if b <= a:
        raise SystemExit("GAGAL: urutan blok salah: " + start)

backup = Path(
    "www/index.html.backup-before-clear-vegetation-" +
    datetime.now().strftime("%Y%m%d-%H%M%S")
)
backup.write_text(s)

for start, end in blocks:
    a = s.index(start)
    b = s.index(end, a)
    s = s[:a] + (
        "// OLD VEGETATION REMOVED - GRASS SYSTEM REBUILD\n\n"
    ) + s[b:]

p.write_text(s)

print("Vegetasi lama berhasil dibersihkan.")
print("Backup:", backup)
