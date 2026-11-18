from pathlib import Path
import time

p = Path("www/index.html")
s = p.read_text()

old = """      const radius = 9.0;
      }

      bots.forEach(bot => {"""

new = """      const radius = 9.0;

      bots.forEach(bot => {"""

if s.count(old) != 1:
    raise SystemExit("GAGAL: pola kurung berlebih tidak ditemukan secara unik.")

backup = p.with_name("index.html.backup-rocket-fix-" + time.strftime("%Y%m%d-%H%M%S"))
backup.write_text(s)
p.write_text(s.replace(old, new, 1))

print("Kurung berlebih diperbaiki.")
print("Backup:", backup.name)
