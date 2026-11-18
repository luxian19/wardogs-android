from pathlib import Path
from datetime import datetime
import shutil
import re

p = Path("www/index.html")
s = p.read_text()

def replace_function(source, name, next_name, body):
    pattern = rf"    function {name}\(.*?(?=    function {next_name}\()"
    result, count = re.subn(pattern, body + "\n\n", source, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f"ABORT: fungsi {name} tidak ditemukan unik")
    return result

# Hapus objek tes sementara.
for marker, end_marker in [
    ("      // TEMPORARY GRASS RENDER TEST", "      console.log('[WARDOGS] Grass render test cube added');"),
    ("        // TEMPORARY TEST: render GLB grass as a normal Mesh.", "        console.log('[WARDOGS] Direct GLB grass mesh test added');")
]:
    if marker in s:
        a = s.index(marker)
        b = s.index(end_marker, a) + len(end_marker)
        s = s[:a] + s[b:]

# Ganti pembuatan InstancedMesh saat pemuatan GLB.
pattern = r"          const mesh = new THREE\.InstancedMesh\(.*?          grassRoot\.add\(mesh\);"
s, count = re.subn(pattern, "", s, count=1, flags=re.S)
if count != 1:
    raise SystemExit("ABORT: blok InstancedMesh GLB tidak ditemukan")

# Material mendukung warna vertex.
old = """        grassSharedMaterial = new THREE.MeshBasicMaterial({
          color: 0x55aa33,
          side: THREE.DoubleSide
        });"""
new = """        grassSharedMaterial = new THREE.MeshBasicMaterial({
          color: 0x55aa33,
          side: THREE.DoubleSide,
          vertexColors: true
        });"""
if s.count(old) != 1:
    raise SystemExit("ABORT: material rumput tidak cocok")
s = s.replace(old, new, 1)

build = r"""    function buildGrassChunk(cx, cz) {
      const key = cx + ',' + cz;
      if (grassChunks.has(key) || !grassLoaded) return;

      const positions = [];
      const normals = [];
      const uvs = [];
      const colors = [];
      const indices = [];
      let vertexOffset = 0;

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

          // Varian low-poly: 11 sampai 16.
          const variant = 11 + Math.floor(grassRandom(seed + 2) * 6);
          const sourceGeometry = grassGeometries[variant];
          if (!sourceGeometry) continue;

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

          grassDummy.scale.set(
            12 + grassRandom(seed + 4) * 6,
            16 + grassRandom(seed + 5) * 12,
            12 + grassRandom(seed + 4) * 6
          );
          grassDummy.updateMatrix();

          const geometry = sourceGeometry.clone();
          geometry.applyMatrix4(grassDummy.matrix);

          const pos = geometry.getAttribute('position');
          const norm = geometry.getAttribute('normal');
          const uv = geometry.getAttribute('uv');
          const index = geometry.getIndex();

          const shade = 0.88 + grassRandom(seed + 6) * 0.12;

          for (let i = 0; i < pos.count; i++) {
            positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));

            if (norm) {
              normals.push(norm.getX(i), norm.getY(i), norm.getZ(i));
            } else {
              normals.push(0, 1, 0);
            }

            if (uv) {
              uvs.push(uv.getX(i), uv.getY(i));
            } else {
              uvs.push(0, 0);
            }

            colors.push(
              shade,
              Math.min(1, shade + 0.025),
              Math.max(0, shade - 0.045)
            );
          }

          if (index) {
            for (let i = 0; i < index.count; i++) {
              indices.push(index.getX(i) + vertexOffset);
            }
          } else {
            for (let i = 0; i < pos.count; i++) {
              indices.push(i + vertexOffset);
            }
          }

          vertexOffset += pos.count;
          geometry.dispose();
        }
      }

      if (!positions.length) return;

      const merged = new THREE.BufferGeometry();
      merged.setAttribute(
        'position', new THREE.Float32BufferAttribute(positions, 3)
      );
      merged.setAttribute(
        'normal', new THREE.Float32BufferAttribute(normals, 3)
      );
      merged.setAttribute(
        'uv', new THREE.Float32BufferAttribute(uvs, 2)
      );
      merged.setAttribute(
        'color', new THREE.Float32BufferAttribute(colors, 3)
      );
      merged.setIndex(indices);
      merged.computeBoundingSphere();

      const mesh = new THREE.Mesh(merged, grassSharedMaterial);
      mesh.name = 'WARDOGS_GRASS_CHUNK_' + key;
      mesh.castShadow = false;
      mesh.receiveShadow = false;

      grassRoot.add(mesh);
      grassChunks.set(key, { mesh });
    }"""

upload = """    function uploadVisibleGrass() {
      // Chunk sudah digabung menjadi mesh saat dibangun.
    }"""

s = replace_function(s, "buildGrassChunk", "uploadVisibleGrass", build)
s = replace_function(s, "uploadVisibleGrass", "loadArenaGrass", upload)

# Hapus mesh dan GPU geometry saat chunk tidak terlihat.
old = """            grassChunks.delete(key);"""
new = """            const oldChunk = grassChunks.get(key);
            if (oldChunk && oldChunk.mesh) {
              grassRoot.remove(oldChunk.mesh);
              oldChunk.mesh.geometry.dispose();
            }
            grassChunks.delete(key);"""
if s.count(old) != 1:
    raise SystemExit("ABORT: blok penghapusan chunk tidak cocok")
s = s.replace(old, new, 1)

backup = p.with_name(
    p.name + ".backup-merged-grass-" +
    datetime.now().strftime("%Y%m%d-%H%M%S")
)
shutil.copy2(p, backup)
p.write_text(s)

print("PATCH OK: mesh gabungan per chunk")
print("Backup:", backup)
print("InstancedMesh rumput dihapus dari jalur rendering.")
