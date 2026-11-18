from pathlib import Path
from datetime import datetime
import shutil

html = Path("www/index.html")
glb = Path("www/assets/environment/realistic/forest/grass-medium-01.glb")
diffuse = Path("www/assets/environment/realistic/grass/alpha_cards/grass_medium_01_diff_4k.jpg")
alpha = Path("www/assets/environment/realistic/grass/alpha_cards/grass_medium_01_alpha_4k.png")

for p in (html, glb, diffuse, alpha):
    if not p.is_file():
        raise SystemExit("FILE TIDAK DITEMUKAN: " + str(p))

src = html.read_text()
start = "    // WARDOGS REALISTIC ALPHA CARD GRASS"
end = "    // END WARDOGS REALISTIC ALPHA CARD GRASS"

if src.count(start) != 1 or src.count(end) != 1:
    raise SystemExit("ANCHOR TIDAK COCOK. File tidak diubah.")

new = r'''    // WARDOGS REALISTIC GLB GRASS - VISIBILITY BASED

    const GRASS_CHUNK_SIZE = 40;
    const GRASS_GRID = 7;
    const GRASS_RENDER_DISTANCE = 420;
    const GRASS_VISIBILITY_INTERVAL = 650;
    const GRASS_INSTANCE_CAPACITY = 4096;
    const GRASS_VARIANT_COUNT = 17;

    let grassLoaded = false;
    let grassLoading = false;
    let grassLastVisibilityCheck = 0;
    let grassLastUpload = 0;

    const grassChunks = new Map();
    const grassVisibleKeys = new Set();
    let grassPendingChunks = [];

    const grassMeshes = [];
    const grassGeometries = [];

    const grassFrustum = new THREE.Frustum();
    const grassFrustumMatrix = new THREE.Matrix4();
    const grassChunkSphere = new THREE.Sphere();

    const grassDummy = new THREE.Object3D();
    const grassUp = new THREE.Vector3(0, 1, 0);
    const grassNormal = new THREE.Vector3();
    const grassYaw = new THREE.Quaternion();
    const grassColor = new THREE.Color();
    const grassMatrix = new THREE.Matrix4();

    let grassDiffuseTexture = null;
    let grassAlphaTexture = null;
    let grassSharedMaterial = null;

    function grassRandom(seed) {
      const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
      return value - Math.floor(value);
    }

    function grassChunkTerrainVisible(cx, cz, x0, z0, x1, z1) {
      const targets = [
        [(x0 + x1) * 0.5, (z0 + z1) * 0.5],
        [x0 + 3, z0 + 3],
        [x1 - 3, z0 + 3],
        [x0 + 3, z1 - 3],
        [x1 - 3, z1 - 3]
      ];

      const ox = camera.position.x;
      const oy = camera.position.y;
      const oz = camera.position.z;

      for (const target of targets) {
        const tx = target[0];
        const tz = target[1];
        const ty = getTerrainHeight(tx, tz) + 1.5;

        let blocked = false;

        for (let step = 1; step <= 6; step++) {
          const t = step / 7;
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

    function grassChunkInView(cx, cz) {
      const x0 = Math.max(-1220, cx * GRASS_CHUNK_SIZE);
      const z0 = Math.max(-1220, cz * GRASS_CHUNK_SIZE);
      const x1 = Math.min(1220, (cx + 1) * GRASS_CHUNK_SIZE);
      const z1 = Math.min(1220, (cz + 1) * GRASS_CHUNK_SIZE);

      const x = (x0 + x1) * 0.5;
      const z = (z0 + z1) * 0.5;
      const y = getTerrainHeight(x, z) + 1;

      grassChunkSphere.center.set(x, y, z);
      grassChunkSphere.radius = 36;

      if (!grassFrustum.intersectsSphere(grassChunkSphere)) {
        return false;
      }

      const dx = x - camera.position.x;
      const dy = y - camera.position.y;
      const dz = z - camera.position.z;
      const maxDistance = GRASS_RENDER_DISTANCE + 36;

      if (dx * dx + dy * dy + dz * dz > maxDistance * maxDistance) {
        return false;
      }

      if (!grassChunkTerrainVisible(cx, cz, x0, z0, x1, z1)) {
        return false;
      }

      return true;
    }

    function buildGrassChunk(cx, cz) {
      const key = cx + ',' + cz;
      if (grassChunks.has(key) || !grassLoaded) return;

      const variants = Array.from(
        { length: GRASS_VARIANT_COUNT },
        () => ({ matrices: [], colors: [] })
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

          const x = originX +
            (ix + 0.5) * spacing +
            (grassRandom(seed) - 0.5) * 2.0;

          const z = originZ +
            (iz + 0.5) * spacing +
            (grassRandom(seed + 1) - 0.5) * 2.0;

          if (Math.abs(x) > 1218 || Math.abs(z) > 1218) continue;

          const variant = Math.floor(
            grassRandom(seed + 2) * GRASS_VARIANT_COUNT
          );

          const left = getTerrainHeight(x - 0.75, z);
          const right = getTerrainHeight(x + 0.75, z);
          const back = getTerrainHeight(x, z - 0.75);
          const front = getTerrainHeight(x, z + 0.75);

          grassNormal.set(
            left - right,
            1.5,
            back - front
          ).normalize();

          grassDummy.position.set(
            x,
            getTerrainHeight(x, z) + 0.025,
            z
          );

          grassDummy.quaternion.setFromUnitVectors(
            grassUp,
            grassNormal
          );

          grassYaw.setFromAxisAngle(
            grassUp,
            grassRandom(seed + 3) * Math.PI * 2
          );

          grassDummy.quaternion.multiply(grassYaw);

          const width = 1.0 + grassRandom(seed + 4) * 0.65;
          const height = 1.45 + grassRandom(seed + 5) * 1.05;

          grassDummy.scale.set(width, height, width);
          grassDummy.updateMatrix();

          const shade = 0.88 + grassRandom(seed + 6) * 0.12;
          grassColor.setRGB(
            shade,
            Math.min(1, shade + 0.025),
            Math.max(0, shade - 0.045)
          );

          const bucket = variants[variant];
          bucket.matrices.push(grassDummy.matrix.toArray());
          bucket.colors.push(grassColor.toArray());
        }
      }

      grassChunks.set(key, { variants });
    }

    function uploadVisibleGrass() {
      const counts = new Uint32Array(GRASS_VARIANT_COUNT);

      for (const key of grassVisibleKeys) {
        const chunk = grassChunks.get(key);
        if (!chunk) continue;

        for (let v = 0; v < GRASS_VARIANT_COUNT; v++) {
          const bucket = chunk.variants[v];
          const mesh = grassMeshes[v];

          for (let i = 0; i < bucket.matrices.length; i++) {
            const index = counts[v];

            if (index >= GRASS_INSTANCE_CAPACITY) break;

            grassMatrix.fromArray(bucket.matrices[i]);
            mesh.setMatrixAt(index, grassMatrix);

            grassColor.fromArray(bucket.colors[i]);
            mesh.setColorAt(index, grassColor);

            counts[v]++;
          }
        }
      }

      for (let v = 0; v < GRASS_VARIANT_COUNT; v++) {
        const mesh = grassMeshes[v];

        mesh.count = counts[v];
        mesh.visible = counts[v] > 0;
        mesh.instanceMatrix.needsUpdate = true;

        if (mesh.instanceColor) {
          mesh.instanceColor.needsUpdate = true;
        }
      }
    }

    function loadArenaGrass() {
      if (grassLoaded || grassLoading) return;
      grassLoading = true;

      const textureLoader = new THREE.TextureLoader();
      const base = 'assets/environment/realistic/grass/alpha_cards/';

      const loadTexture = (path) => new Promise((resolve, reject) => {
        textureLoader.load(path, resolve, undefined, reject);
      });

      const loadGLB = () => new Promise((resolve, reject) => {
        soldierGLTFLoader.load(
          'assets/environment/realistic/forest/grass-medium-01.glb',
          resolve,
          undefined,
          reject
        );
      });

      Promise.all([
        loadTexture(base + 'grass_medium_01_diff_4k.jpg'),
        loadTexture(base + 'grass_medium_01_alpha_4k.png'),
        loadGLB()
      ]).then(results => {
        grassDiffuseTexture = results[0];
        grassAlphaTexture = results[1];

        const gltf = results[2];
        const sourceMeshes = [];

        gltf.scene.traverse(object => {
          if (object.isMesh && object.geometry) {
            sourceMeshes.push(object);
          }
        });

        if (sourceMeshes.length !== GRASS_VARIANT_COUNT) {
          throw new Error(
            'Jumlah mesh GLB tidak sesuai: ' + sourceMeshes.length
          );
        }

        grassDiffuseTexture.encoding = THREE.sRGBEncoding;
        grassDiffuseTexture.flipY = false;
        grassDiffuseTexture.anisotropy = Math.min(
          4,
          renderer.capabilities.getMaxAnisotropy()
        );
        grassDiffuseTexture.generateMipmaps = true;
        grassDiffuseTexture.minFilter = THREE.LinearMipmapLinearFilter;
        grassDiffuseTexture.needsUpdate = true;

        grassAlphaTexture.flipY = false;
        grassAlphaTexture.anisotropy = Math.min(
          2,
          renderer.capabilities.getMaxAnisotropy()
        );
        grassAlphaTexture.generateMipmaps = true;
        grassAlphaTexture.minFilter = THREE.LinearMipmapLinearFilter;
        grassAlphaTexture.needsUpdate = true;

        const firstMaterial = Array.isArray(sourceMeshes[0].material)
          ? sourceMeshes[0].material[0]
          : sourceMeshes[0].material;

        if (!firstMaterial) {
          throw new Error('Material asli GLB tidak ditemukan');
        }

        grassSharedMaterial = firstMaterial.clone();
        grassSharedMaterial.map = grassDiffuseTexture;
        grassSharedMaterial.alphaMap = grassAlphaTexture;
        grassSharedMaterial.alphaTest = 0.38;
        grassSharedMaterial.transparent = false;
        grassSharedMaterial.depthWrite = true;
        grassSharedMaterial.side = THREE.DoubleSide;
        grassSharedMaterial.metalness = 0;
        grassSharedMaterial.needsUpdate = true;

        if (grassSharedMaterial.normalMap) {
          grassSharedMaterial.normalMap.anisotropy = 2;
        }

        if (grassSharedMaterial.roughnessMap) {
          grassSharedMaterial.roughnessMap.anisotropy = 2;
        }

        for (let i = 0; i < sourceMeshes.length; i++) {
          const source = sourceMeshes[i];
          const geometry = source.geometry.clone();

          const localTransform = new THREE.Matrix4().compose(
            new THREE.Vector3(0, 0, 0),
            source.quaternion,
            source.scale
          );

          geometry.applyMatrix4(localTransform);
          geometry.computeBoundingSphere();

          grassGeometries.push(geometry);

          const mesh = new THREE.InstancedMesh(
            geometry,
            grassSharedMaterial,
            GRASS_INSTANCE_CAPACITY
          );

          mesh.name = 'WARDOGS_GRASS_VARIANT_' + i;
          mesh.count = 0;
          mesh.visible = false;
          mesh.castShadow = false;
          mesh.receiveShadow = false;
          mesh.frustumCulled = false;

          mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

          grassMeshes.push(mesh);
          grassRoot.add(mesh);
        }

        grassLoaded = true;
        grassLoading = false;
        grassLastVisibilityCheck = 0;

        console.log(
          '[WARDOGS] GLB grass loaded:',
          sourceMeshes.length,
          'variants; PBR + external 4K alpha'
        );

      }).catch(error => {
        grassLoading = false;
        console.error('[WARDOGS] GLB grass loading failed:', error);
      });
    }

    function updateGrassStreaming() {
      if (!grassRoot) return;

      if (!state.isPlaying || state.isLobby) {
        grassRoot.visible = false;
        return;
      }

      grassRoot.visible = true;

      if (!grassLoaded) {
        loadArenaGrass();
        return;
      }

      const now = performance.now();

      if (now - grassLastVisibilityCheck >= GRASS_VISIBILITY_INTERVAL) {
        grassLastVisibilityCheck = now;

        camera.updateMatrixWorld(true);

        grassFrustumMatrix.multiplyMatrices(
          camera.projectionMatrix,
          camera.matrixWorldInverse
        );

        grassFrustum.setFromProjectionMatrix(grassFrustumMatrix);

        grassVisibleKeys.clear();
        grassPendingChunks = [];

        // Scan seluruh grid dunia.
        // Kandidat ditentukan oleh frustum, jarak kamera dan terrain occlusion.
        // Tidak memakai radius pemain/kamera sebagai batas pencarian chunk.

        for (let cz = -31; cz <= 30; cz++) {
          for (let cx = -31; cx <= 30; cx++) {
            if (!grassChunkInView(cx, cz)) continue;

            const key = cx + ',' + cz;
            grassVisibleKeys.add(key);

            if (!grassChunks.has(key)) {
              grassPendingChunks.push([cx, cz]);
            }
          }
        }

        // Buang data chunk yang sudah tidak terlihat.
        for (const key of grassChunks.keys()) {
          if (!grassVisibleKeys.has(key)) {
            grassChunks.delete(key);
          }
        }
      }

      // Bangun maksimal empat chunk per frame agar tidak membuat lonjakan CPU.
      let built = 0;

      while (grassPendingChunks.length && built < 4) {
        const next = grassPendingChunks.shift();
        buildGrassChunk(next[0], next[1]);
        built++;
      }

      if (
        built > 0 ||
        now - grassLastUpload >= 350
      ) {
        uploadVisibleGrass();
        grassLastUpload = now;
      }
    }

    // END WARDOGS REALISTIC ALPHA CARD GRASS'''

a = src.index(start)
b = src.index(end, a) + len(end)

backup = html.with_name(
    "index.html.backup-glb-grass-" +
    datetime.now().strftime("%Y%m%d-%H%M%S")
)
shutil.copy2(html, backup)

html.write_text(src[:a] + new + src[b:])

print("PATCH BERHASIL")
print("Backup:", backup)
print("Model:", glb)
print("Variasi:", 17)
print("Rendering: frustum + camera distance + terrain occlusion")
