from pathlib import Path

p = Path("www/index.html")
s = p.read_text()

def replace_once(old, new, label):
    global s
    count = s.count(old)
    if count != 1:
        raise SystemExit(f"GAGAL: anchor {label} ditemukan {count} kali. Tidak ada perubahan.")
    s = s.replace(old, new, 1)
    print("OK:", label)

replace_once(
    "      const ground = new THREE.Mesh(groundGeo, groundMat);\n      ground.receiveShadow = true;\n      ground.castShadow = false;\n      scene.add(ground);",
    """      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.receiveShadow = true;
      ground.castShadow = false;
      scene.add(ground);

      // WARDOGS GRASS ROOT - included in arenaSceneObjects.
      const grassRoot = new THREE.Group();
      grassRoot.name = 'WARDOGS_GRASS_ROOT';
      scene.add(grassRoot);""",
    "grass root"
)

replace_once(
    "    const soldierGLTFLoader = new THREE.GLTFLoader();\n    soldierGLTFLoader.setMeshoptDecoder(MeshoptDecoder);",
    """    const soldierGLTFLoader = new THREE.GLTFLoader();
    soldierGLTFLoader.setMeshoptDecoder(MeshoptDecoder);

    // WARDOGS STREAMING GRASS SYSTEM
    const GRASS_CHUNK_SIZE = 40;
    const GRASS_GRID = 16;
    const GRASS_RADIUS_CHUNKS = 2;
    let grassGeometry = null;
    let grassMaterial = null;
    let grassLoaded = false;
    let grassLoading = false;
    let grassCenterX = null;
    let grassCenterZ = null;
    const grassChunks = new Map();
    let grassPendingChunks = [];

    function loadArenaGrass() {
      if (grassLoaded || grassLoading) return;
      grassLoading = true;

      soldierGLTFLoader.load(
        'assets/environment/realistic/grass/nature-kit-grass.glb',
        gltf => {
          try {
            gltf.scene.updateMatrixWorld(true);
            let source = null;
            gltf.scene.traverse(obj => {
              if (!source && obj.isMesh) source = obj;
            });
            if (!source) throw new Error('Mesh rumput tidak ditemukan');

            grassGeometry = source.geometry.clone();
            grassGeometry.applyMatrix4(source.matrixWorld);
            grassGeometry.computeBoundingBox();

            const bounds = grassGeometry.boundingBox;
            grassGeometry.translate(
              -(bounds.min.x + bounds.max.x) * 0.5,
              -bounds.min.y,
              -(bounds.min.z + bounds.max.z) * 0.5
            );
            grassGeometry.computeBoundingSphere();

            grassMaterial = new THREE.MeshStandardMaterial({
              color: 0x829b4b,
              roughness: 1,
              metalness: 0,
              side: THREE.DoubleSide
            });

            grassLoaded = true;
            grassLoading = false;
            console.log('[WARDOGS] Main grass model loaded');
          } catch (error) {
            grassLoading = false;
            console.error('[WARDOGS] Grass preparation failed:', error);
          }
        },
        undefined,
        error => {
          grassLoading = false;
          console.error('[WARDOGS] Grass model load failed:', error);
        }
      );
    }

    function grassRandom(seed) {
      const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
      return value - Math.floor(value);
    }

    function buildGrassChunk(cx, cz) {
      const count = GRASS_GRID * GRASS_GRID;
      const mesh = new THREE.InstancedMesh(
        grassGeometry, grassMaterial, count
      );
      mesh.name = 'GrassChunk_' + cx + '_' + cz;
      mesh.castShadow = false;
      mesh.receiveShadow = false;

      const dummy = new THREE.Object3D();
      const originX = cx * GRASS_CHUNK_SIZE;
      const originZ = cz * GRASS_CHUNK_SIZE;
      let index = 0;

      for (let iz = 0; iz < GRASS_GRID; iz++) {
        for (let ix = 0; ix < GRASS_GRID; ix++) {
          const seed = (cx + 4096) * 73856093 +
                       (cz + 4096) * 19349663 +
                       iz * 83492791 + ix * 297121507;

          const x = originX + (ix + 0.5) * 2.5 +
                    (grassRandom(seed) - 0.5) * 1.0;
          const z = originZ + (iz + 0.5) * 2.5 +
                    (grassRandom(seed + 1) - 0.5) * 1.0;

          if (Math.abs(x) > 1218 || Math.abs(z) > 1218) continue;

          const scale = 0.55 + grassRandom(seed + 2) * 0.35;
          dummy.position.set(x, getTerrainHeight(x, z) + 0.015, z);
          dummy.rotation.set(0, grassRandom(seed + 3) * Math.PI * 2, 0);
          dummy.scale.set(scale, scale, scale);
          dummy.updateMatrix();
          mesh.setMatrixAt(index++, dummy.matrix);
        }
      }

      mesh.count = index;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
      grassRoot.add(mesh);
      grassChunks.set(cx + ',' + cz, mesh);
    }

    function updateGrassStreaming() {
      if (!state.isPlaying || state.isLobby) return;

      if (!grassLoaded) {
        loadArenaGrass();
        return;
      }

      const cx = Math.floor(camera.position.x / GRASS_CHUNK_SIZE);
      const cz = Math.floor(camera.position.z / GRASS_CHUNK_SIZE);

      if (cx !== grassCenterX || cz !== grassCenterZ) {
        grassCenterX = cx;
        grassCenterZ = cz;
        grassPendingChunks = [];

        const wanted = new Set();

        for (let z = cz - GRASS_RADIUS_CHUNKS;
             z <= cz + GRASS_RADIUS_CHUNKS; z++) {
          for (let x = cx - GRASS_RADIUS_CHUNKS;
               x <= cx + GRASS_RADIUS_CHUNKS; x++) {
            const key = x + ',' + z;
            wanted.add(key);
            if (!grassChunks.has(key)) {
              grassPendingChunks.push([x, z]);
            }
          }
        }

        for (const [key, mesh] of grassChunks) {
          if (!wanted.has(key)) {
            grassRoot.remove(mesh);
            grassChunks.delete(key);
          }
        }
      }

      // Build only one chunk per frame to protect mobile performance.
      if (grassPendingChunks.length) {
        const next = grassPendingChunks.shift();
        buildGrassChunk(next[0], next[1]);
      }
    }""",
    "grass streaming system"
)

replace_once(
    "      const dt = Math.min(0.05, (now - prevTime) / 1000);\n      prevTime = now;",
    """      const dt = Math.min(0.05, (now - prevTime) / 1000);
      prevTime = now;

      updateGrassStreaming();""",
    "grass animation update"
)

p.write_text(s)
print("PATCH SELESAI")
