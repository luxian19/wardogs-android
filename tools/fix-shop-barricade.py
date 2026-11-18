from pathlib import Path
import time

p = Path("www/index.html")
s = p.read_text()

old = """else {
            btnText = `BUY KIT ($${item.price}) [Owned: ${state.barricadeKits}]`;
            btnClass = 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer';
          }
        } else {"""

new = """} else {"""

if s.count(old) != 1:
    raise SystemExit(f"GAGAL: blok ditemukan {s.count(old)} kali, bukan 1.")

backup = p.with_name("index.html.backup-shop-fix-" + time.strftime("%Y%m%d-%H%M%S"))
backup.write_text(s)
p.write_text(s.replace(old, new, 1))

print("Sisa blok Shop barikade dihapus.")
print("Backup:", backup.name)
