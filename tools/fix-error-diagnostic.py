from pathlib import Path
from datetime import datetime

p = Path("www/index.html")
s = p.read_text()

old = """      soldierDebugPanel.style.display = 'none';
      soldierDebugPanel.textContent += '\\n' + message;"""

new = """      soldierDebugPanel.style.display = 'block';
      soldierDebugPanel.textContent += '\\n' + message;"""

old_init = """    soldierDebug('Bots: ' + bots.length + '\\nLoading GLB...');"""
new_init = """    console.log('[WARDOGS DEBUG] Bots:', bots.length, 'Loading GLB...');"""

if s.count(old) != 1 or s.count(old_init) != 1:
    raise SystemExit("GAGAL: kode diagnostik tidak cocok; file tidak diubah.")

backup = Path("www/index.html.backup-diagnostic-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
backup.write_text(s)

s = s.replace(old, new, 1).replace(old_init, new_init, 1)
p.write_text(s)

print("Diagnostik error berhasil diperbaiki.")
print("Backup:", backup)
