from pathlib import Path
import time

p = Path("www/index.html")
s = p.read_text()

start = s.find("    function buildGrassChunk(cx, cz) {")
end = s.find("    function uploadVisibleGrass() {", start)

if start < 0 or end < 0:
    raise SystemExit("GAGAL: fungsi buildGrassChunk tidak ditemukan.")

new_build = r'''    function buildGrassChunk(cx, cz) {
      const key = cx + ',' + cz;
      if (grassChunks.has(key) || !grassLoaded) return;

      const variantMatrices = Array.from(
        { length: GRASS_VARIANT_COUNT }, () => []
      );
      const variantColors = Array.from(
        { length: GRASS_VARIANT_COUNT }, () => []
      );

      const originX = cx * GRASS_CHUNK_SIZE;
      const originZ = cz * GRASS_CHUNK_SIZE;
      const spacing = GRASS_CHUNK_SIZE / GRASS_GRID;

      for (let iz = 0; iz < GRASS_GRID; iz++) {
        for (let ix = 0; ix < GRASS_GRID; ix++) {
          const seed =
            (cx + 4096) * 73856093 +
            (cz + 4096) * 19349663 +
            iz * 83492791 +
            ix * 297121507;

          const x = originX + (ix + 0.5) * spacing +
            (grassRandom(seed) - 0.5) * 2.0;
          const z = originZ + (iz + 0.5) * spacing +
            (grassRandom(seed + 1) - 0.5) * 2.0;

          if (Math.abs(x) > 1218 || Math.abs(z) > 1218) continue;

          const variant = Math.floor(
            grassRandom(seed + 2) * GRASS_VARIANT_COUNT
          );
          if (!grassGeometries[variant]) continue;

          const left = getTerrainHeight(x - 0.75, z);
          const right = getTerrainHeight(x + 0.75, z);
          const back = getTerrainHeight(x, z - 0.75);
          const front = getTerrainHeight(x, z + 0.75);

          grassNormal.set(
            left - right, 1.5, back - front
          ).normalize();

          grassDummy.position.set(
            x, getTerrainHeight(x, z) + 0.025, z
          );

          grassDummy.quaternion.setFromUnitVectors(
            grassUp, grassNormal
          );

          grassYaw.setFromAxisAngle(
            grassUp, grassRandom(seed + 3) * Math.PI * 2
          );
          grassDummy.quaternion.multiply(grassYaw);

          const isTiny = variant >= 11;
          const width = isTiny
            ? 12 + grassRandom(seed + 4) * 6
            : 4.5 + grassRandom(seed + 4) * 2.5;
          const height = isTiny
            ? 16 + grassRandom(seed + 5) * 12
            : 5 + grassRandom(seed + 5) * 3;

          grassDummy.scale.set(width, height, width);
          grassDummy.updateMatrix();

          variantMatrices[variant].push(grassDummy.matrix.clone());

          const tint = grassRandom(seed + 6);
          variantColors[variant].push(new THREE.Color(
            0.72 + tint * 0.28,
            0.80 + grassRandom(seed + 7) * 0.20,
            0.68 + grassRandom(seed + 8) * 0.27
          ));
        }
      }

      const chunkMeshes = [];

      for (let variant = 0; variant < GRASS_VARIANT_COUNT; variant++) {
        const matrices = variantMatrices[variant];
        if (!matrices.length) continue;

        const mesh = new THREE.InstancedMesh(
          grassGeometries[variant],
          grassSharedMaterial,
          matrices.length
        );

        mesh.name = 'WARDOGS_GRASS_INSTANCE_' + key + '_' + variant;
        mesh.count = matrices.length;
        mesh.castShadow = false;
        mesh.receiveShadow = false;

        // Visibility is controlled by the chunk streaming system.
        mesh.frustumCulled = false;

        for (let i = 0; i < matrices.length; i++) {
          mesh.setMatrixAt(i, matrices[i]);
          if (mesh.setColorAt) {
            mesh.setColorAt(i, variantColors[variant][i]);
          }
        }

        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

        grassRoot.add(mesh);
        chunkMeshes.push(mesh);
      }

      if (!chunkMeshes.length) return;

      grassChunks.set(key, { meshes: chunkMeshes });
    }

'''

s = s[:start] + new_build + s[end:]

old = '''          if (oldChunk && oldChunk.mesh) {
            grassRoot.remove(oldChunk.mesh);
            oldChunk.mesh.geometry.dispose();
          }'''

new = '''          if (oldChunk && oldChunk.meshes) {
            for (const mesh of oldChunk.meshes) {
              grassRoot.remove(mesh);
            }
          }'''

if s.count(old) != 1:
    raise SystemExit("GAGAL: blok penghapusan chunk tidak cocok. File belum disimpan.")

s = s.replace(old, new, 1)

backup = Path(f"www/index.html.backup-instancing-{int(time.time())}")
backup.write_text(p.read_text())
p.write_text(s)

print("InstancedMesh per varian berhasil diterapkan.")
print("Backup:", backup.name)
