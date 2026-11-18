from pathlib import Path
import time

p = Path("www/index.html")
s = p.read_text()

start = "      // Scatter Destructible Supply Crates across the forest clearing & trails"
end = "    function spawnDestructibleCover(pos, rotY = 0, kind = 'crate') {"

if s.count(start) != 1 or s.count(end) != 1:
    raise SystemExit("GAGAL: batas kode tidak cocok. File tidak diubah.")

a = s.index(start)
b = s.index(end, a)

if b <= a:
    raise SystemExit("GAGAL: urutan batas salah.")

backup = p.with_name(
    "index.html.backup-crates-" + time.strftime("%Y%m%d-%H%M%S")
)
backup.write_text(s)

s = s[:a] + s[b:]
p.write_text(s)

print("20 peti suplai lama dihapus.")
print("Fungsi deployable barricade tetap dipertahankan.")
print("Backup:", backup.name)
