from pathlib import Path
import time

p = Path("www/index.html")
s = p.read_text()

# 1. Pastikan struktur file sesuai.
start = s.find("    function buildGrassChunk(cx, cz) {")
end = s.find("    function uploadVisibleGrass() {", start)

if start < 0 or end < 0:
    raise SystemExit("GAGAL: fungsi buildGrassChunk tidak ditemukan.")

upload_end = s.find("    function loadArenaGrass() {", end)
if upload_end < 0:
    raise SystemExit("GAGAL: fungsi loadArenaGrass tidak ditemukan.")

new_functions = r'''    function buildGrassChunk(cx, cz) {
      const key = cx + ',' + cz;
      if (grassChunks.has(key) || !grassLoaded) return;

      const matrices = Array.from(
        { length: GRASS_VARIANT_COUNT }, () => []
      );
      const colors = Array.from(
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

          const matrixData = new Float32Array(16);
          grassDummy.matrix.toArray(matrixData);
          matrices[variant].push(matrixData);

          const tint = grassRandom(seed + 6);
          colors[variant].push(new Float32Array([
            0.72 + tint * 0.28,
            0.80 + grassRandom(seed + 7) * 0.20,
            0.68 + grassRandom(seed + 8) * 0.27
          ]));
        }
      }

      grassChunks.set(key, { matrices, colors });
    }

    function uploadVisibleGrass() {
      if (!grassMeshes.length) return;

      const counts = new Uint32Array(GRASS_VARIANT_COUNT);

      for (const key of grassVisibleKeys) {
        const chunk = grassChunks.get(key);
        if (!chunk) continue;

        for (let variant = 0; variant < GRASS_VARIANT_COUNT; variant++) {
          const mesh = grassMeshes[variant];
          const sourceMatrices = chunk.matrices[variant];
          const sourceColors = chunk.colors[variant];

          for (let i = 0; i < sourceMatrices.length; i++) {
            const slot = counts[variant];

            if (slot >= GRASS_INSTANCE_CAPACITY) break;

            grassMatrix.fromArray(sourceMatrices[i]);
            mesh.setMatrixAt(slot, grassMatrix);

            const color = sourceColors[i];
            grassColor.setRGB(color[0], color[1], color[2]);
            mesh.setColorAt(slot, grassColor);

            counts[variant]++;
          }
        }
      }

      for (let variant = 0; variant < GRASS_VARIANT_COUNT; variant++) {
        const mesh = grassMeshes[variant];
        mesh.count = counts[variant];
        mesh.instanceMatrix.needsUpdate = true;

        if (mesh.instanceColor) {
          mesh.instanceColor.needsUpdate = true;
        }
      }
    }

'''

# 2. Replace both chunk functions.
backup = Path(f"www/index.html.backup-global-instancing-{int(time.time())}")
backup.write_text(s)

s = s[:start] + new_functions + s[upload_end:]

# 3. Replace old chunk geometry disposal with data-only removal.
old_remove = '''            if (oldChunk && oldChunk.mesh) {
              grassRoot.remove(oldChunk.mesh);
              oldChunk.mesh.geometry.dispose();
            }
            grassChunks.delete(key);'''

new_remove = '''            // Global InstancedMesh: hapus hanya data chunk.
            grassChunks.delete(key);'''

if s.count(old_remove) != 1:
    raise SystemExit("GAGAL: blok penghapusan chunk tidak cocok.")

s = s.replace(old_remove, new_remove, 1)

# 4. Increase reusable instance capacity.
old_capacity = "    const GRASS_INSTANCE_CAPACITY = 4096;"
if s.count(old_capacity) != 1:
    raise SystemExit("GAGAL: kapasitas instance tidak cocok.")

s = s.replace(
    old_capacity,
    "    const GRASS_INSTANCE_CAPACITY = 8192;",
    1
)

# 5. Use neutral material for per-instance colors.
old_material = '''        grassSharedMaterial = new THREE.MeshBasicMaterial({
          color: 0x55aa33,
          side: THREE.DoubleSide,
          vertexColors: true
        });'''

new_material = '''        grassSharedMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
          vertexColors: false
        });'''

if s.count(old_material) != 1:
    raise SystemExit("GAGAL: material rumput tidak cocok.")

s = s.replace(old_material, new_material, 1)

# 6. Create 17 shared global InstancedMesh objects after geometry loading.
anchor = '''          grassGeometries.push(geometry);
        }

        grassLoaded = true;'''

replacement = '''          grassGeometries.push(geometry);
        }

        // Satu InstancedMesh global untuk setiap varian.
        grassMeshes.length = 0;

        for (let i = 0; i < GRASS_VARIANT_COUNT; i++) {
          const mesh = new THREE.InstancedMesh(
            grassGeometries[i],
            grassSharedMaterial,
            GRASS_INSTANCE_CAPACITY
          );

          mesh.name = 'WARDOGS_GRASS_GLOBAL_' + i;
          mesh.count = 0;
          mesh.frustumCulled = false;
          mesh.castShadow = false;
          mesh.receiveShadow = false;

          grassRoot.add(mesh);
          grassMeshes.push(mesh);
        }

        grassLoaded = true;'''

if s.count(anchor) != 1:
    raise SystemExit("GAGAL: lokasi inisialisasi geometri tidak cocok.")

s = s.replace(anchor, replacement, 1)

# 7. Limit chunk construction per frame.
old_build_limit = "      while (grassPendingChunks.length && built < 4) {"
if s.count(old_build_limit) != 1:
    raise SystemExit("GAGAL: batas pembangunan chunk tidak ditemukan.")

s = s.replace(
    old_build_limit,
    "      while (grassPendingChunks.length && built < 2) {",
    1
)

# 8. Remove temporary GPU test overlay.
gpu_start = s.find("// TEMP: GPU INSTANCING CAPABILITY TEST")
if gpu_start >= 0:
    gpu_end = s.find("    let currentPixelRatio = 1;", gpu_start)
    if gpu_end < 0:
        raise SystemExit("GAGAL: akhir GPU TEST tidak ditemukan.")
    s = s[:gpu_start] + s[gpu_end:]

p.write_text(s)

print("Global InstancedMesh patch berhasil diterapkan.")
print("17 mesh global | kapasitas 8192 per varian | 2 chunk/frame")
print("Backup:", backup.name)
