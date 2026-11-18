from pathlib import Path
import re
import time

p = Path("www/index.html")
s = p.read_text()
original = s

def sub(pattern, replacement, label, expected=1, flags=0):
    global s
    s2, n = re.subn(pattern, replacement, s, count=expected, flags=flags)
    if n != expected:
        raise SystemExit(f"GAGAL {label}: ditemukan {n}, seharusnya {expected}.")
    s = s2

# HUD barricade
sub(r'^[ \t]*<span class="text-amber-300 text-\[10px\]">🧱 <span id="hud-barricades">1</span></span>\s*\n',
    '', "HUD barikade", flags=re.M)

# Tombol mobile
sub(r'^[ \t]*<button id="ctrl-cover".*?</button>\s*\n',
    '', "tombol cover", flags=re.M | re.S)

# CSS khusus tombol
sub(r'^[ \t]*body\.lobby-mode #ctrl-cover \{display:none!important\}\s*\n',
    '', "CSS cover", flags=re.M)

# Item Shop
sub(r"\s*\{\s*id: 'barricade',\s*name: 'Deployable Cover Kit',.*?\n\s*\}",
    '', "item Shop barikade", flags=re.S)

# State
sub(r'^[ \t]*barricadeKits: 1,\s*\n', '', "state barikade", flags=re.M)

# Tutup map dengan benar, sekaligus hapus fungsi cover lama
sub(r'^[ \t]*function spawnDestructibleCover\(pos, rotY = 0, kind = .crate.\) \{.*?(?=^[ \t]*createExpandedForestMap\(\);)',
    '    }\n\n', "fungsi cover dan damage lama", flags=re.M | re.S)

# Interaksi ledakan dengan destructibles
sub(r'^[ \t]*for \(let i = destructibles\.length - 1; i >= 0; i--\) \{.*?^[ \t]*\}\s*\n',
    '', "interaksi ledakan cover", flags=re.M | re.S)

# Shop: tampilan item barricade
sub(r"^[ \t]*\} else if \(item\.isUtility === 'barricade'\) \{.*?^[ \t]*\}\s*(?=else \{)",
    '', "tampilan Shop barikade", flags=re.M | re.S)

# Shop: pembelian barricade
sub(r"^[ \t]*\} else if \(item\.isUtility === 'barricade'\) \{.*?^[ \t]*\}\s*(?=else \{)",
    '', "pembelian barikade", flags=re.M | re.S)

# Fungsi deploy
sub(r'^[ \t]*function deployBarricade\(\) \{.*?^[ \t]*\}\s*\n',
    '', "fungsi deploy", flags=re.M | re.S)

# Damage destructible saat menembak
sub(r'^[ \t]*const hitDest = destructibles\.find\(d => d\.mesh === hit\.object\);\s*\n[ \t]*if \(hitDest\) \{\s*\n[ \t]*damageDestructible\(hitDest, w\.damage\);\s*\n[ \t]*\}\s*\n',
    '', "damage saat menembak", flags=re.M)

# HUD update
sub(r'^[ \t]*document\.getElementById\('"'hud-barricades'"'\)\.textContent = `\$\{state\.barricadeKits\}`;\s*\n',
    '', "update HUD", flags=re.M)

# Tombol mobile binding
sub(r"^[ \t]*bindIsolatedActionBtn\('ctrl-cover'.*?^[ \t]*\}\);\s*\n",
    '', "binding tombol cover", flags=re.M | re.S)

# Keyboard F
sub(r"^[ \t]*if \(e\.code === 'KeyF'\) deployBarricade\(\);\s*\n",
    '', "shortcut F", flags=re.M)

# AI tidak lagi memeriksa objek destructible
sub(r'\.\.\.destructibles\.map\(d => d\.mesh\),?\s*\n?', '',
    "AI destructible", flags=re.M)

if s == original:
    raise SystemExit("Tidak ada perubahan. File tidak ditulis.")

backup = p.with_name("index.html.backup-no-barricade-" + time.strftime("%Y%m%d-%H%M%S"))
backup.write_text(original)
p.write_text(s)

print("Sistem barikade dihapus.")
print("Backup:", backup.name)
