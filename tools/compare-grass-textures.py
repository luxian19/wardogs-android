from PIL import Image, ImageChops, ImageStat
import numpy as np

base = "www/assets/environment/realistic/grass/alpha_cards/"
internal = "tools/wardogs-grass-textures/texture-1.jpg"

a = Image.open(internal).convert("RGB")
b = Image.open(base + "grass_medium_01_diff_4k.jpg").convert("RGB").resize(a.size)
mask = Image.open(base + "grass_medium_01_alpha_4k.png").convert("L").resize(a.size)

x = np.asarray(a, dtype=np.float32)
y = np.asarray(b, dtype=np.float32)
m = np.asarray(mask, dtype=np.float32)

diff = np.abs(x-y)

print("=== PERBANDINGAN ATLAS ===")
print("Internal:", a.size)
print("Eksternal:", b.size)
print("Rata-rata selisih RGB:", round(float(diff.mean()), 3))
print("Kesamaan piksel:", round(float(100*(1-diff.mean()/255)), 2), "%")

corr = np.corrcoef(x.flatten(), y.flatten())[0,1]
print("Korelasi warna:", round(float(corr), 5))
print("Alpha minimum/maksimum:", int(m.min()), int(m.max()))
print("Alpha rata-rata:", round(float(m.mean()), 2))
print("Area transparan:", round(float(np.mean(m < 128)*100), 2), "%")

preview = Image.new("RGB", (1024, 512))
preview.paste(a.resize((512,512)), (0,0))
preview.paste(b.resize((512,512)), (512,0))
preview.save("tools/grass-texture-comparison.jpg", quality=90)

print("\nPreview tersimpan: tools/grass-texture-comparison.jpg")
print("Kiri = internal GLB | Kanan = diffuse eksternal")
