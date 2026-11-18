from pathlib import Path

p = Path("www/index.html")
s = p.read_text()

old = "        mesh.computeBoundingSphere();"
new = "        mesh.frustumCulled = false;"

if s.count(old) != 1:
    raise SystemExit("GAGAL: baris computeBoundingSphere tidak ditemukan secara unik.")

Path("www/index.html.backup-grass-bounding").write_text(s)
p.write_text(s.replace(old, new, 1))
print("OK: perhitungan bounding diperbaiki.")
