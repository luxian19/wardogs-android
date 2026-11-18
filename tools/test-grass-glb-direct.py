from pathlib import Path
from datetime import datetime
import shutil

p = Path("www/index.html")
s = p.read_text()

anchor = """        grassDiffuseTexture.encoding = THREE.sRGBEncoding;"""

insert = """        // TEMPORARY TEST: render GLB grass as a normal Mesh.
        const directGrassGeometry = sourceMeshes[4].geometry.clone();
        const directGrassMaterial = new THREE.MeshBasicMaterial({
          color: 0x00ff00,
          side: THREE.DoubleSide,
          depthTest: false
        });
        const directGrassTest = new THREE.Mesh(
          directGrassGeometry,
          directGrassMaterial
        );

        camera.updateMatrixWorld(true);
        const directGrassDirection = new THREE.Vector3();
        camera.getWorldDirection(directGrassDirection);

        directGrassTest.position.copy(
          camera.position.clone().add(
            directGrassDirection.multiplyScalar(12)
          )
        );
        directGrassTest.scale.setScalar(12);
        directGrassTest.renderOrder = 1000;
        scene.add(directGrassTest);

        console.log('[WARDOGS] Direct GLB grass mesh test added');

        grassDiffuseTexture.encoding = THREE.sRGBEncoding;"""

if s.count(anchor) != 1:
    raise SystemExit("ABORT: anchor tidak unik")

backup = p.with_name(
    p.name + ".backup-grass-glb-" +
    datetime.now().strftime("%Y%m%d-%H%M%S")
)
shutil.copy2(p, backup)
p.write_text(s.replace(anchor, insert, 1))

print("PATCH OK")
print("Backup:", backup)
