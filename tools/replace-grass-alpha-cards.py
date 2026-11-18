from pathlib import Path
from datetime import datetime
import re
import sys
import shutil

p = Path("www/index.html")
s = p.read_text()

start_marker = "    // WARDOGS STREAMING GRASS SYSTEM"
end_marker = "    // WARDOGS TRAINING ARENA STATE"

if s.count(start_marker) != 1 or s.count(end_marker) != 1:
    sys.exit("GAGAL: penanda sistem rumput tidak unik.")

start = s.index(start_marker)
end = s.index(end_marker, start)

new_system = r'''    // WARDOGS REALISTIC ALPHA CARD GRASS
    const GRASS_CHUNK_SIZE = 40;
    const GRASS_GRID = 23;
    const GRASS_RADIUS_CHUNKS = 2;
    const GRASS_VISIBILITY_INTERVAL = 300;

    let grassGeometry = null;
    let grassMaterial = null;
    let grassLoaded = false;
    let grassLoading = false;
    let grassCenterX = null;
    let grassCenterZ = null;
    let grassLastVisibilityCheck = 0;
    const grassChunks = new Map();
    let grassPendingChunks = [];

    const grassFrustum = new THREE.Frustum();
    const grassFrustumMatrix = new THREE.Matrix4();
    const grassChunkSphere = new THREE.Sphere();
    const grassDummy = new THREE.Object3D();
    const grassTint = new THREE.Color();

    function grassRandom(seed) {
      const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
      return value - Math.floor(value);
    }

    function createGrassCardGeometry() {
      const w = 0.38;
      const h = 1.15;

      const positions = [
        -w, 0, 0,  w, 0, 0,  w, h, 0, -w, h, 0,
        0, 0, -w,  0, 0, w,  0, h, w,  0, h, -w
      ];

      const uvs = [
        0, 0, 1, 0, 1, 1, 0, 1,
        0, 0, 1, 0, 1, 1, 0, 1
      ];

      grassGeometry = new THREE.BufferGeometry();
      grassGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
      );
      grassGeometry.setAttribute(
        'uv',
        new THREE.Float32BufferAttribute(uvs, 2)
      );
      grassGeometry.setIndex([
        0, 1, 2, 0, 2, 3,
        4, 5, 6, 4, 6, 7
      ]);
      grassGeometry.computeVertexNormals();
    }

    function loadArenaGrass() {
      if (grassLoaded || grassLoading) return;
      grassLoading = true;

      const loader = new THREE.TextureLoader();
      const base = 'assets/environment/realistic/grass/alpha_cards/';

      Promise.all([
        new Promise((resolve, reject) => {
          loader.load(base + 'grass_medium_01_diff_4k.jpg', resolve, undefined, reject);
        }),
        new Promise((resolve, reject) => {
          loader.load(base + 'grass_medium_01_alpha_4k.png', resolve, undefined, reject);
        })
      ]).then(textures => {
        const diffuse = textures[0];
        const alpha = textures[1];

        diffuse.encoding = THREE.sRGBEncoding;
        diffuse.anisotropy = Math.min(
          4, renderer.capabilities.getMaxAnisotropy()
        );

        alpha.anisotropy = Math.min(
          2, renderer.capabilities.getMaxAnisotropy()
        );

        diffuse.generateMipmaps = true;
        alpha.generateMipmaps = true;
        diffuse.minFilter = THREE.LinearMipmapLinearFilter;
        alpha.minFilter = THREE.LinearMipmapLinearFilter;

        createGrassCardGeometry();

        grassMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: diffuse,
          alphaMap: alpha,
          alphaTest: 0.42,
          transparent: false,
          side: THREE.DoubleSide,
          roughness: 1,
          metalness: 0
        });

        grassLoaded = true;
        grassLoading = false;
        grassLastVisibilityCheck = 0;

        console.log('[WARDOGS] Realistic alpha-card grass loaded');
      }).catch(error => {
        grassLoading = false;
        console.error('[WARDOGS] Alpha grass loading failed:', error);
      });
    }

    function grassChunkTerrainVisible(cx, cz) {
      const x0 = cx * GRASS_CHUNK_SIZE;
      const z0 = cz * GRASS_CHUNK_SIZE;
      const x1 = x0 + GRASS_CHUNK_SIZE;
      const z1 = z0 + GRASS_CHUNK_SIZE;

      const targets = [
        [x0 + 20, z0 + 20],
        [x0 + 4, z0 + 4],
        [x1 - 4, z0 + 4],
        [x0 + 4, z1 - 4],
        [x1 - 4, z1 - 4]
      ];

      const ox = camera.position.x;
      const oy = camera.position.y;
      const oz = camera.position.z;

      for (const target of targets) {
        const tx = target[0];
        const tz = target[1];
        const ty = getTerrainHeight(tx, tz) + 1.2;

        let blocked = false;

        for (let step = 1; step <= 7; step++) {
          const t = step / 8;
          const sx = ox + (tx - ox) * t;
          const sz = oz + (tz - oz) * t;
          const rayY = oy + (ty - oy) * t;

          if (getTerrainHeight(sx, sz) > rayY + 1.5) {
            blocked = true;
            break;
          }
        }

        if (!blocked) return true;
      }

      return false;
    }

    function grassChunkInFrustum(cx, cz) {
      const x = cx * GRASS_CHUNK_SIZE + GRASS_CHUNK_SIZE * 0.5;
      const z = cz * GRASS_CHUNK_SIZE + GRASS_CHUNK_SIZE * 0.5;
      const y = getTerrainHeight(x, z) + 0.6;

      grassChunkSphere.center.set(x, y, z);
      grassChunkSphere.radius = 30;

      return grassFrustum.intersectsSphere(grassChunkSphere);
    }

    function buildGrassChunk(cx, cz) {
      const key = cx + ',' + cz;
      if (!grassLoaded || grassChunks.has(key)) return;

      const count = GRASS_GRID * GRASS_GRID;
      const mesh = new THREE.InstancedMesh(
        grassGeometry, grassMaterial, count
      );

      mesh.name = 'AlphaGrass_' + key;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.frustumCulled = false;

      const originX = cx * GRASS_CHUNK_SIZE;
      const originZ = cz * GRASS_CHUNK_SIZE;
      let index = 0;

      for (let iz = 0; iz < GRASS_GRID; iz++) {
        for (let ix = 0; ix < GRASS_GRID; ix++) {
          const seed = (cx + 4096) * 73856093 +
                       (cz + 4096) * 19349663 +
                       iz * 83492791 + ix * 297121507;

          const x = originX +
            (ix + 0.5) * (GRASS_CHUNK_SIZE / GRASS_GRID) +
            (grassRandom(seed) - 0.5) * 1.2;

          const z = originZ +
            (iz + 0.5) * (GRASS_CHUNK_SIZE / GRASS_GRID) +
            (grassRandom(seed + 1) - 0.5) * 1.2;

          if (Math.abs(x) > 1218 || Math.abs(z) > 1218) continue;

          const width = 0.65 + grassRandom(seed + 2) * 0.8;
          const height = 0.75 + grassRandom(seed + 3) * 0.85;

          grassDummy.position.set(
            x, getTerrainHeight(x, z) + 0.025, z
          );
          grassDummy.rotation.set(
            (grassRandom(seed + 4) - 0.5) * 0.12,
            grassRandom(seed + 5) * Math.PI * 2,
            (grassRandom(seed + 6) - 0.5) * 0.12
          );
          grassDummy.scale.set(width, height, width);
          grassDummy.updateMatrix();

          mesh.setMatrixAt(index, grassDummy.matrix);

          const shade = 0.34 + grassRandom(seed + 7) * 0.13;
          grassTint.setHSL(
            0.23 + grassRandom(seed + 8) * 0.055,
            0.36 + grassRandom(seed + 9) * 0.2,
            shade
          );

          if (mesh.setColorAt) mesh.setColorAt(index, grassTint);
          index++;
        }
      }

      mesh.count = index;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

      grassRoot.add(mesh);
      grassChunks.set(key, mesh);
    }

    function updateGrassStreaming() {
      if (!state.isPlaying || state.isLobby || !grassRoot) return;

      if (!grassLoaded) {
        loadArenaGrass();
        return;
      }

      const now = performance.now();
      if (now - grassLastVisibilityCheck < GRASS_VISIBILITY_INTERVAL) {
        if (grassPendingChunks.length) {
          const next = grassPendingChunks.shift();
          buildGrassChunk(next[0], next[1]);
        }
        return;
      }

      grassLastVisibilityCheck = now;

      camera.updateMatrixWorld(true);
      grassFrustumMatrix.multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      );
      grassFrustum.setFromProjectionMatrix(grassFrustumMatrix);

      const cx = Math.floor(camera.position.x / GRASS_CHUNK_SIZE);
      const cz = Math.floor(camera.position.z / GRASS_CHUNK_SIZE);

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

          const inView = grassChunkInFrustum(x, z);
          const terrainClear = inView && grassChunkTerrainVisible(x, z);

          const existing = grassChunks.get(key);
          if (existing) {
            existing.visible = terrainClear;
          } else if (terrainClear) {
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

      if (grassPendingChunks.length) {
        const next = grassPendingChunks.shift();
        buildGrassChunk(next[0], next[1]);
      }
    }

    // END WARDOGS REALISTIC ALPHA CARD GRASS

'''

s = s[:start] + new_system + s[end:]

diag_pattern = r"      let grassDiag = document\.getElementById\('wardogs-grass-diagnostic'\);.*?(?=      // Update FPS measurement once per second\.)"
diag = re.findall(diag_pattern, s, re.S)

if len(diag) != 1:
    sys.exit(f"GAGAL: blok diagnostik rumput ditemukan {len(diag)} kali.")

replacement = """      try {
        updateGrassStreaming();
      } catch (e) {
        console.error('[GRASS STREAMING ERROR]', e);
      }

"""

s = re.sub(diag_pattern, lambda _: replacement, s, count=1, flags=re.S)

backup = p.with_name(
    p.name + ".backup-alpha-grass-" +
    datetime.now().strftime("%Y%m%d-%H%M%S")
)
backup.write_text(p.read_text())
p.write_text(s)

asset_src = Path("www/assets/environment/realistic/grass/alpha_cards")
asset_dst = Path("android/app/src/main/assets/public/assets/environment/realistic/grass/alpha_cards")

required = [
    asset_src / "grass_medium_01_diff_4k.jpg",
    asset_src / "grass_medium_01_alpha_4k.png"
]

for f in required:
    if not f.is_file():
        shutil.copy2(
            Path.home() / "storage/shared/Download" / f.name,
            f
        )

asset_dst.mkdir(parents=True, exist_ok=True)
for f in required:
    shutil.copy2(f, asset_dst / f.name)

print("PATCH ALPHA GRASS BERHASIL")
print("Backup:", backup.name)
print("Aset Android:", asset_dst)
