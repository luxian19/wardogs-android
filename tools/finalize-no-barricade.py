from pathlib import Path
import re
import time

p = Path("www/index.html")
s = p.read_text()
original = s

def replace_once(old, new, label):
    global s
    n = s.count(old)
    if n != 1:
        raise SystemExit(f"GAGAL {label}: ditemukan {n}, seharusnya 1.")
    s = s.replace(old, new, 1)

# Perbaiki struktur pembelian armor dan senjata
pattern = r"(sound\.playCashChaChing\(\);\s*\})\s*else\s*\{"
s, n = re.subn(pattern, r"\1\n      } else {", s, count=1)
if n != 1:
    raise SystemExit("GAGAL: struktur handleShopPurchase tidak ditemukan.")

# Hapus daftar objek destructible
replace_once("    const destructibles = [];\n", "", "daftar destructibles")

# Hapus target tembak destructible
replace_once("      destructibles.forEach(d => targetMeshes.push(d.mesh));", "", "target tembak")

# Hapus collision destructible
pattern = r"\n[ \t]*for \(let i = 0; i < destructibles\.length; i\+\+\) \{\s*if \(testBox\.intersectsBox\(destructibles\[i\]\.box\)\) return true;\s*\}"
s, n = re.subn(pattern, "", s, count=1)
if n != 1:
    raise SystemExit("GAGAL: collision destructible tidak ditemukan.")

# Hapus damage destructible dari tembakan AI
pattern = r"\n[ \t]*const hitDest = destructibles\.find\(d => d\.mesh === hits\[0\]\.object\);\s*if \(hitDest\) damageDestructible\(hitDest, 14\);"
s, n = re.subn(pattern, "", s, count=1)
if n != 1:
    raise SystemExit("GAGAL: damage destructible AI tidak ditemukan.")

backup = p.with_name("index.html.backup-final-no-barricade-" + time.strftime("%Y%m%d-%H%M%S"))
backup.write_text(original)
p.write_text(s)

print("Struktur Shop diperbaiki.")
print("Referensi destructibles dibersihkan.")
print("Backup:", backup.name)
