from pathlib import Path

p = Path("www/index.html")
s = p.read_text()

old = "mesh.computeBoundingSphere();"
if s.count(old) != 1:
    raise SystemExit(f"GAGAL: ditemukan {s.count(old)} pemanggilan mesh.computeBoundingSphere().")

Path("www/index.html.backup-grass-bounding-v2").write_text(s)
s = s.replace(old, "mesh.frustumCulled = false;", 1)

if "mesh.computeBoundingSphere();" in s:
    raise SystemExit("GAGAL: pemanggilan lama masih tersisa.")

p.write_text(s)
print("OK: pemanggilan pada mesh rumput sudah diganti.")
