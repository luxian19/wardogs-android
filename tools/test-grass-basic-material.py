from pathlib import Path
from datetime import datetime
import shutil

p = Path("www/index.html")
s = p.read_text()

old = """        grassSharedMaterial = firstMaterial.clone();
        grassSharedMaterial.map = grassDiffuseTexture;
        grassSharedMaterial.alphaMap = grassAlphaTexture;
        grassSharedMaterial.alphaTest = 0.38;
        grassSharedMaterial.transparent = false;
        grassSharedMaterial.depthWrite = true;
        grassSharedMaterial.side = THREE.DoubleSide;
        grassSharedMaterial.metalness = 0;
        grassSharedMaterial.needsUpdate = true;"""

new = """        // TEMPORARY VISIBILITY TEST: bypass PBR and alpha textures.
        grassSharedMaterial = new THREE.MeshBasicMaterial({
          color: 0x55aa33,
          side: THREE.DoubleSide
        });"""

count = s.count(old)
if count != 1:
    raise SystemExit(f"ABORT: blok material ditemukan {count} kali.")

backup = p.with_name(
    p.name + ".backup-basic-grass-" +
    datetime.now().strftime("%Y%m%d-%H%M%S")
)
shutil.copy2(p, backup)
p.write_text(s.replace(old, new, 1))

print("PATCH OK")
print("Backup:", backup)
