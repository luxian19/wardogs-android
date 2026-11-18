from pathlib import Path
from datetime import datetime
import shutil

p = Path("www/index.html")
s = p.read_text()

anchor = """        scene.add(directGrassTest);"""

insert = """        scene.add(directGrassTest);

        // TEMPORARY TEST: isolated InstancedMesh.
        const instanceTestMaterial = new THREE.MeshBasicMaterial({
          color: 0x0088ff,
          side: THREE.DoubleSide,
          depthTest: false
        });

        const instanceTest = new THREE.InstancedMesh(
          sourceMeshes[4].geometry,
          instanceTestMaterial,
          1
        );

        const instanceTestPosition = camera.position.clone()
          .add(directGrassDirection.clone().multiplyScalar(18));

        const instanceTestMatrix = new THREE.Matrix4().compose(
          instanceTestPosition,
          new THREE.Quaternion(),
          new THREE.Vector3(12, 12, 12)
        );

        instanceTest.setMatrixAt(0, instanceTestMatrix);
        instanceTest.count = 1;
        instanceTest.instanceMatrix.needsUpdate = true;
        instanceTest.frustumCulled = false;
        instanceTest.renderOrder = 1001;
        scene.add(instanceTest);

        console.log('[WARDOGS] Isolated InstancedMesh test added');"""

if s.count(anchor) != 1:
    raise SystemExit("ABORT: anchor tidak unik")

backup = p.with_name(
    p.name + ".backup-grass-instance-" +
    datetime.now().strftime("%Y%m%d-%H%M%S")
)
shutil.copy2(p, backup)
p.write_text(s.replace(anchor, insert, 1))

print("PATCH OK")
print("Backup:", backup)
