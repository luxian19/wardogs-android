from pathlib import Path

p = Path("www/index.html")
s = p.read_text()

old = """      const key = cx + ',' + cz;
      if (!premiumGrassLoaded || !grassChunks.has(key) ||
          premiumGrassChunks.has(key)) return;

      const count = 2;
"""

new = """      const key = cx + ',' + cz;
      if (!premiumGrassLoaded || !grassChunks.has(key) ||
          premiumGrassChunks.has(key)) return;

      // Premium clumps are decorative accents, not the main grass layer.
      if (Math.abs(cx + cz) % 2 !== 0) return;

      const count = 1;
"""

if s.count(old) != 1:
    raise SystemExit("GAGAL: blok premium grass tidak ditemukan secara unik.")

Path("www/index.html.backup-premium-optimize").write_text(s)
p.write_text(s.replace(old, new, 1))
print("OK: jumlah premium grass dikurangi untuk optimasi GPU.")
