from pathlib import Path

p = Path("www/index.html")
s = p.read_text()

old = "    function getTerrainHeight(x, z) {"
new = "    let grassRoot = null;\n\n    function getTerrainHeight(x, z) {"

if s.count(old) != 1:
    raise SystemExit("GAGAL: lokasi deklarasi tidak unik.")

s = s.replace(old, new, 1)

old = "      const grassRoot = new THREE.Group();"
new = "      grassRoot = new THREE.Group();"

if s.count(old) != 1:
    raise SystemExit("GAGAL: deklarasi grassRoot tidak unik.")

s = s.replace(old, new, 1)
p.write_text(s)
print("OK: grassRoot sekarang dapat diakses sistem streaming.")
