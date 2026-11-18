from pathlib import Path
import time

p = Path("www/index.html")
s = p.read_text()

def remove_once(text, start, end, label):
    if s.count(start) != 1 or s.count(end) != 1:
        raise SystemExit(
            f"GAGAL {label}: batas tidak unik. File tidak diubah."
        )
    a = s.index(start)
    b = s.index(end, a)
    if b <= a:
        raise SystemExit(f"GAGAL {label}: urutan batas salah.")
    return text[:a] + text[b:]

# Hapus seluruh bangunan dan dekorasi perimeter.
s = remove_once(
    s,
    "// Outer Perimeter Timber & Earthwork Ridge Walls (400 x 400)",
    "// Center Control Zone Ring & Beacon",
    "bangunan perimeter"
)

# Hapus monumen, tetapi pertahankan peti suplai.
s = remove_once(
    s,
    "// Central Forest Stone Monument Pillar",
    "// Scatter Destructible Supply Crates",
    "monumen"
)

# Matikan panel diagnostik merah.
early = "      function report(message) {"
if s.count(early) != 1:
    raise SystemExit("GAGAL: fungsi diagnostik awal tidak unik.")
s = s.replace(
    early,
    early + "\n        return;",
    1
)

# Sembunyikan panel diagnostik lama.
s = s.replace(
    "soldierDebugPanel.style.display = 'block';",
    "soldierDebugPanel.style.display = 'none';"
)

# Pastikan panel lama tidak ditampilkan saat dibuat.
s = s.replace(
    "soldierDebugPanel.style.display = 'block';",
    "soldierDebugPanel.style.display = 'none';"
)

backup = p.with_name(
    "index.html.backup-buildings-" + time.strftime("%Y%m%d-%H%M%S")
)
backup.write_text(p.read_text())
p.write_text(s)

print("Pembersihan bangunan dan panel diagnostik selesai.")
print("Backup:", backup.name)
