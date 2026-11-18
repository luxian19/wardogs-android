from pathlib import Path

p = Path("www/index.html")
s = p.read_text()

old_grid = "const GRASS_GRID = 16;"
new_grid = "const GRASS_GRID = 23;"

old_spacing = "(ix + 0.5) * 2.5"
new_spacing = "(ix + 0.5) * (GRASS_CHUNK_SIZE / GRASS_GRID)"

old_spacing_z = "(iz + 0.5) * 2.5"
new_spacing_z = "(iz + 0.5) * (GRASS_CHUNK_SIZE / GRASS_GRID)"

if s.count(old_grid) != 1:
    raise SystemExit("GAGAL: konfigurasi GRASS_GRID tidak unik.")
if s.count(old_spacing) != 1 or s.count(old_spacing_z) != 1:
    raise SystemExit("GAGAL: pola jarak rumput tidak cocok.")

Path("www/index.html.backup-grass-density").write_text(s)

s = s.replace(old_grid, new_grid, 1)
s = s.replace(old_spacing, new_spacing, 1)
s = s.replace(old_spacing_z, new_spacing_z, 1)

p.write_text(s)
print("OK: kepadatan rumput ditingkatkan sekitar 2,07 kali.")
