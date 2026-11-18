from pathlib import Path

p = Path("www/index.html")
s = p.read_text()

start = s.find("    function loadArenaGrass() {")
end = s.find("    function grassRandom(seed) {", start)

if start < 0 or end < 0 or s.find("    function loadArenaGrass() {", start + 1) >= 0:
    raise SystemExit("GAGAL: batas fungsi rumput tidak unik. File tidak diubah.")

new = """    function loadArenaGrass() {
      if (grassLoaded) return;

      // Native Three.js grass geometry: no external model loader required.
      const positions = [];
      const indices = [];

      for (let blade = 0; blade < 3; blade++) {
        const angle = blade * Math.PI / 3;
        const sideX = Math.cos(angle) * 0.085;
        const sideZ = Math.sin(angle) * 0.085;
        const leanX = Math.cos(angle + 1.1) * 0.10;
        const leanZ = Math.sin(angle + 1.1) * 0.10;
        const base = positions.length / 3;

        positions.push(
          -sideX, 0, -sideZ,
           sideX, 0,  sideZ,
           leanX, 0.72, leanZ
        );

        indices.push(base, base + 1, base + 2);
      }

      grassGeometry = new THREE.BufferGeometry();
      grassGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
      );
      grassGeometry.setIndex(indices);
      grassGeometry.computeVertexNormals();

      grassMaterial = new THREE.MeshStandardMaterial({
        color: 0x789b38,
        roughness: 1,
        metalness: 0,
        side: THREE.DoubleSide
      });

      grassLoaded = true;
      grassLoading = false;
      console.log('[WARDOGS] Native grass geometry ready');
    }

"""

s = s[:start] + new + s[end:]

p.write_text(s)
print("OK: rumput native Three.js dipasang.")
