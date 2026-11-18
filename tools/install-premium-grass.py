from pathlib import Path

p = Path("www/index.html")
s = p.read_text()

anchor1 = """    const grassChunks = new Map();
    let grassPendingChunks = [];
"""

insert1 = """    const grassChunks = new Map();
    let grassPendingChunks = [];

    // WARDOGS PREMIUM GRASS CLUMPS
    let premiumGrassGeometry = null;
    let premiumGrassMaterial = null;
    let premiumGrassLoading = false;
    let premiumGrassLoaded = false;
    const premiumGrassChunks = new Map();
    let premiumGrassPendingChunks = [];

    function loadPremiumGrass() {
      if (premiumGrassLoading || premiumGrassLoaded) return;
      premiumGrassLoading = true;

      soldierGLTFLoader.load(
        'assets/environment/realistic/grass/grass-clump.glb',
        gltf => {
          try {
            gltf.scene.updateMatrixWorld(true);
            let sourceMesh = null;

            gltf.scene.traverse(obj => {
              if (!sourceMesh && obj.isMesh) sourceMesh = obj;
            });

            if (!sourceMesh) throw new Error('Mesh grass-clump tidak ditemukan');

            premiumGrassGeometry = sourceMesh.geometry.clone();
            premiumGrassGeometry.applyMatrix4(sourceMesh.matrixWorld);

            const sourceMaterial = Array.isArray(sourceMesh.material)
              ? sourceMesh.material[0] : sourceMesh.material;
            premiumGrassMaterial = sourceMaterial.clone();

            premiumGrassLoaded = true;
            premiumGrassLoading = false;

            for (const key of grassChunks.keys()) {
              const parts = key.split(',');
              premiumGrassPendingChunks.push([
                Number(parts[0]), Number(parts[1])
              ]);
            }

            console.log('[WARDOGS] Premium grass loaded');
          } catch (e) {
            premiumGrassLoading = false;
            console.error('[WARDOGS] Premium grass setup failed:', e);
          }
        },
        undefined,
        error => {
          premiumGrassLoading = false;
          console.error('[WARDOGS] Premium grass load failed:', error);
        }
      );
    }

    function buildPremiumGrassChunk(cx, cz) {
      const key = cx + ',' + cz;
      if (!premiumGrassLoaded || !grassChunks.has(key) ||
          premiumGrassChunks.has(key)) return;

      const count = 2;
      const mesh = new THREE.InstancedMesh(
        premiumGrassGeometry, premiumGrassMaterial, count
      );
      mesh.name = 'PremiumGrass_' + key;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.frustumCulled = false;

      const dummy = new THREE.Object3D();

      for (let i = 0; i < count; i++) {
        const seed = (cx + 4096) * 73856093 +
                     (cz + 4096) * 19349663 + i * 92837111;

        const x = cx * GRASS_CHUNK_SIZE +
                  4 + grassRandom(seed) * (GRASS_CHUNK_SIZE - 8);
        const z = cz * GRASS_CHUNK_SIZE +
                  4 + grassRandom(seed + 1) * (GRASS_CHUNK_SIZE - 8);

        dummy.position.set(x, getTerrainHeight(x, z) + 0.02, z);
        dummy.rotation.set(0, grassRandom(seed + 2) * Math.PI * 2, 0);

        const scale = 1.8 + grassRandom(seed + 3) * 0.7;
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }

      mesh.instanceMatrix.needsUpdate = true;
      grassRoot.add(mesh);
      premiumGrassChunks.set(key, mesh);
    }
"""

anchor2 = """      grassChunks.set(cx + ',' + cz, mesh);
    }

    function updateGrassStreaming() {
"""

insert2 = """      grassChunks.set(cx + ',' + cz, mesh);

      if (premiumGrassLoaded) {
        premiumGrassPendingChunks.push([cx, cz]);
      }
    }

    function updateGrassStreaming() {
"""

anchor3 = """      if (!grassLoaded) {
        loadArenaGrass();
        return;
      }

      const cx = Math.floor(camera.position.x / GRASS_CHUNK_SIZE);
"""

insert3 = """      if (!grassLoaded) {
        loadArenaGrass();
        return;
      }

      loadPremiumGrass();

      const cx = Math.floor(camera.position.x / GRASS_CHUNK_SIZE);
"""

anchor4 = """            grassRoot.remove(mesh);
            grassChunks.delete(key);
"""

insert4 = """            grassRoot.remove(mesh);
            grassChunks.delete(key);

            const premiumMesh = premiumGrassChunks.get(key);
            if (premiumMesh) {
              grassRoot.remove(premiumMesh);
              premiumGrassChunks.delete(key);
            }
"""

anchor5 = """      if (grassPendingChunks.length) {
        const next = grassPendingChunks.shift();
        buildGrassChunk(next[0], next[1]);
      }
    }

    // WARDOGS TRAINING ARENA STATE
"""

insert5 = """      if (grassPendingChunks.length) {
        const next = grassPendingChunks.shift();
        buildGrassChunk(next[0], next[1]);
      } else if (premiumGrassPendingChunks.length) {
        const next = premiumGrassPendingChunks.shift();
        buildPremiumGrassChunk(next[0], next[1]);
      }
    }

    // WARDOGS TRAINING ARENA STATE
"""

for name, anchor in [
    ("global", anchor1),
    ("chunk", anchor2),
    ("loader", anchor3),
    ("cleanup", anchor4),
    ("stream", anchor5)
]:
    if s.count(anchor) != 1:
        raise SystemExit(f"GAGAL: anchor {name} ditemukan {s.count(anchor)} kali. Tidak ada perubahan.")

Path("www/index.html.backup-premium-grass").write_text(s)

s = s.replace(anchor1, insert1, 1)
s = s.replace(anchor2, insert2, 1)
s = s.replace(anchor3, insert3, 1)
s = s.replace(anchor4, insert4, 1)
s = s.replace(anchor5, insert5, 1)

p.write_text(s)
print("OK: sistem premium grass berhasil dipasang.")
