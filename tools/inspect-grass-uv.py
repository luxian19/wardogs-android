import json, struct
from pathlib import Path

p = Path("www/assets/environment/realistic/forest/grass-medium-01.glb")
d = p.read_bytes()

magic, version, length = struct.unpack_from("<4sII", d, 0)
if magic != b"glTF":
    raise SystemExit("File bukan GLB")

o = 12
doc = None
binary = None

while o < length:
    size, kind = struct.unpack_from("<I4s", d, o)
    o += 8
    chunk = d[o:o+size]
    o += size
    if kind == b"JSON":
        doc = json.loads(chunk.decode().rstrip("\0 "))
    elif kind == b"BIN\0":
        binary = chunk

if not doc or binary is None:
    raise SystemExit("Chunk GLB tidak lengkap")

out = Path("tools/wardogs-grass-textures")
out.mkdir(exist_ok=True)

print("=== TEKSTUR INTERNAL GLB ===")
for i, im in enumerate(doc.get("images", [])):
    bv = doc["bufferViews"][im["bufferView"]]
    start = bv.get("byteOffset", 0)
    data = binary[start:start+bv["byteLength"]]
    ext = "jpg" if im["mimeType"] == "image/jpeg" else "bin"
    target = out / f"texture-{i}.{ext}"
    target.write_bytes(data)
    print(i, im["mimeType"], len(data), "bytes", "->", target)

print("\n=== RENTANG UV SETIAP MESH ===")
accessors = doc["accessors"]

for i, mesh in enumerate(doc["meshes"]):
    for prim in mesh.get("primitives", []):
        ai = prim.get("attributes", {}).get("TEXCOORD_0")
        if ai is None:
            print(i, mesh.get("name"), "UV tidak ditemukan")
            continue

        a = accessors[ai]
        print(
            i, mesh.get("name"),
            "UV accessor:", ai,
            "min:", a.get("min"),
            "max:", a.get("max")
        )

print("\n=== SELESAI ===")
