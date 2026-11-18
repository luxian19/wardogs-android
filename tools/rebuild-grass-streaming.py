from pathlib import Path

p = Path("www/index.html")
s = p.read_text()

start = "// REALISTIC GRASS GLB: multiple real model variations."
end = "// FOREST FLOOR GLB: leaf litter, ferns, twigs, logs and stones."
floor_end = "// Forest Dirt Clearing & Trail Crossroad around Central Zone"

if s.count(start) != 1 or s.count(end) != 1 or s.count(floor_end) != 1:
    raise SystemExit("GAGAL: penanda kode tidak cocok. Tidak ada perubahan.")

a = s.index(start)
b = s.index(end, a)
c = s.index(floor_end, b)

if b <= a or c <= b:
    raise SystemExit("GAGAL: urutan blok tidak valid.")

new_grass = r"""
// WARDOGS GRASS STREAMING V1
let updateForestGrassStreaming = function() {};
const grassLoader = new THREE.GLTFLoader();

grassLoader.load(
  'assets/environment/realistic/grass/nature-kit-grass.glb',
  gltf => {
    soldierDebug('NATURE KIT GRASS: BERHASIL DIMUAT');

    const root = gltf.scene;
    root.updateMatrixWorld(true);
    let sourceMesh = null;

    root.traverse(n => {
      if (!sourceMesh && n.isMesh && n.geometry && n.material) {
        sourceMesh = n;
      }
    });

    if (!sourceMesh) {
      console.error('WARDOGS: mesh sumber rumput tidak ditemukan');
      return;
    }

    const grassGeometry = sourceMesh.geometry.clone();
    grassGeometry.applyMatrix4(sourceMesh.matrixWorld);
    grassGeometry.computeBoundingBox();

    const bounds = grassGeometry.boundingBox;
    const grassHeight = bounds.max.y - bounds.min.y;

    if (!Number.isFinite(grassHeight) || grassHeight < 0.001) {
      console.error('WARDOGS: ukuran model rumput tidak valid');
      return;
    }

    grassGeometry.translate(
      -(bounds.min.x + bounds.max.x) * 0.5,
      -bounds.min.y,
      -(bounds.min.z + bounds.max.z) * 0.5
    );
    grassGeometry.computeBoundingSphere();

    const grassMaterial = Array.isArray(sourceMesh.material)
      ? sourceMesh.material.map(m => m.clone())
      : sourceMesh.material.clone();

    const materials = Array.isArray(grassMaterial)
      ? grassMaterial : [grassMaterial];

    materials.forEach(m => {
      m.side = THREE.DoubleSide;
      m.roughness = 1;
      m.metalness = 0;
    });

    const CHUNK_SIZE = 160;
    const MAP_MIN = -1220;
    const activeChunks = new Map();
    let lastCenterX = NaN;
    let lastCenterZ = NaN;

    const makeGrassChunk = (ix, iz, tier) => {
      const x0 = MAP_MIN + ix * CHUNK_SIZE;
      const z0 = MAP_MIN + iz * CHUNK_SIZE;
      const x1 = x0 + CHUNK_SIZE;
      const z1 = z0 + CHUNK_SIZE;

      const mobile = isMobileDevice;
      const wanted = tier === 0
        ? (mobile ? 650 : 1000)
        : tier === 1
          ? (mobile ? 240 : 360)
          : (mobile ? 65 : 110);

      const items = [];
      const attempts = wanted * 5;

      for (let k = 0; k < attempts && items.length < wanted; k++) {
        const x = x0 + forestRandom() * CHUNK_SIZE;
        const z = z0 + forestRandom() * CHUNK_SIZE;

        if (x < -1220 || x > 1220 || z < -1220 || z > 1220) continue;
        if (Math.hypot(x, z) < 42) continue;
        if (forestNear(x, z, forestSpawns, 22)) continue;
        if (forestNear(x, z, forestPads, 20)) continue;
        if (forestBlockedAt(x, z, 7)) continue;
        if (forestSteep(x, z, 16)) continue;

        const scale = (mobile ? 0.78 : 0.9) *
          (0.72 + forestRandom() * 0.56) / grassHeight;

        items.push({
          x,
          y: getTerrainHeight(x, z) + 0.012,
          z,
          yaw: forestRandom() * Math.PI * 2,
          scale
        });
      }

      if (!items.length) return null;

      const mesh = new THREE.InstancedMesh(
        grassGeometry,
        Array.isArray(grassMaterial)
          ? grassMaterial
          : grassMaterial,
        items.length
      );

      mesh.name = 'WARDOGS_GrassChunk_' + ix + '_' + iz;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.frustumCulled = false;

      const t = new THREE.Matrix4();
      const r = new THREE.Matrix4();
      const sc = new THREE.Matrix4();
      const m = new THREE.Matrix4();

      items.forEach((item, i) => {
        t.makeTranslation(item.x, item.y, item.z);
        r.makeRotationY(item.yaw);
        sc.makeScale(item.scale, item.scale, item.scale);
        m.copy(t).multiply(r).multiply(sc);
        mesh.setMatrixAt(i, m);
      });

      mesh.instanceMatrix.needsUpdate = true;
      scene.add(mesh);
      return mesh;
    };

    updateForestGrassStreaming = function() {
      const cx = Math.floor((camera.position.x - MAP_MIN) / CHUNK_SIZE);
      const cz = Math.floor((camera.position.z - MAP_MIN) / CHUNK_SIZE);

      if (cx === lastCenterX && cz === lastCenterZ) return;

      lastCenterX = cx;
      lastCenterZ = cz;

      const wantedChunks = new Map();

      for (let dz = -2; dz <= 2; dz++) {
        for (let dx = -2; dx <= 2; dx++) {
          const ix = cx + dx;
          const iz = cz + dz;

          if (ix < 0 || ix > 15 || iz < 0 || iz > 15) continue;

          const tier = Math.max(Math.abs(dx), Math.abs(dz));
          wantedChunks.set(ix + ':' + iz, { ix, iz, tier });
        }
      }

      for (const [key, mesh] of activeChunks) {
        if (!wantedChunks.has(key)) {
          scene.remove(mesh);
          activeChunks.delete(key);
        }
      }

      for (const [key, info] of wantedChunks) {
        if (activeChunks.has(key)) continue;

        const mesh = makeGrassChunk(
          info.ix, info.iz, info.tier
        );

        if (mesh) activeChunks.set(key, mesh);
      }

      console.log(
        'WARDOGS GRASS CHUNKS:',
        activeChunks.size
      );
    };

    updateForestGrassStreaming();
    console.log('WARDOGS: grass streaming siap');
  },
  undefined,
  e => {
    console.error('WARDOGS GRASS ERROR:', e);
  }
);
"""

new_floor = """
// FOREST FLOOR GLB DINONAKTIFKAN SEMENTARA.
// Model ini memiliki geometri berat dan akan dievaluasi
// kembali setelah performa sistem rumput baru terukur.

"""

render_old = "      renderer.render(scene, camera);"
render_new = """      updateForestGrassStreaming();
      renderer.render(scene, camera);"""

if s.count(render_old) != 1:
    raise SystemExit("GAGAL: render loop tidak ditemukan secara unik.")

backup = Path("www/index.html.backup-before-grass-streaming")
backup.write_text(s)

s = s[:a] + new_grass + new_floor + s[c:]
s = s.replace(render_old, render_new, 1)
p.write_text(s)

print("BERHASIL: sistem rumput streaming dipasang.")
print("Backup:", backup)
