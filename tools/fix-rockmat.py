from pathlib import Path

p = Path("www/index.html")
s = p.read_text()

old = "      addStaticBox(0, 2, 0, 3.6, 4, 3.6, rockMat);"
new = """      const monumentRockMat = new THREE.MeshStandardMaterial({
        color: 0x666b70,
        roughness: 0.92,
        metalness: 0.04
      });
      addStaticBox(0, 2, 0, 3.6, 4, 3.6, monumentRockMat);"""

if s.count(old) != 1:
    raise SystemExit(f"GAGAL: anchor ditemukan {s.count(old)} kali; file tidak diubah.")

backup = p.with_name("index.html.backup-rockmat")
if backup.exists():
    import time
    backup = p.with_name(f"index.html.backup-rockmat-{time.strftime('%Y%m%d-%H%M%S')}")
backup.write_text(s)
p.write_text(s.replace(old, new, 1))
print("Material monumen batu diperbaiki. Backup:", backup.name)
