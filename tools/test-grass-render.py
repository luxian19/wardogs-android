from pathlib import Path
from datetime import datetime
import shutil

p = Path("www/index.html")
s = p.read_text()

anchor = """      scene.add(grassRoot);"""

insert = """
      scene.add(grassRoot);

      // TEMPORARY GRASS RENDER TEST
      camera.updateMatrixWorld(true);
      const grassTestDirection = new THREE.Vector3();
      camera.getWorldDirection(grassTestDirection);
      const grassTestPosition = camera.position.clone()
        .add(grassTestDirection.multiplyScalar(15));

      const grassTestCube = new THREE.Mesh(
        new THREE.BoxGeometry(3, 3, 3),
        new THREE.MeshBasicMaterial({
          color: 0x00ff00,
          depthTest: false
        })
      );
      grassTestCube.position.copy(grassTestPosition);
      grassTestCube.renderOrder = 999;
      scene.add(grassTestCube);
      console.log('[WARDOGS] Grass render test cube added');
"""

if s.count(anchor) != 1:
    raise SystemExit("ABORT: anchor tidak ditemukan secara unik")

backup = p.with_name(
    p.name + ".backup-grass-render-" +
    datetime.now().strftime("%Y%m%d-%H%M%S")
)
shutil.copy2(p, backup)
p.write_text(s.replace(anchor, insert, 1))

print("PATCH OK")
print("Backup:", backup)
