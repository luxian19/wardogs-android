import json, struct

p = "www/assets/environment/realistic/forest/grass-medium-01.glb"
d = open(p, "rb").read()
_, _, length = struct.unpack_from("<4sII", d, 0)

o = 12
doc = binary = None

while o < length:
    size, kind = struct.unpack_from("<I4s", d, o)
    o += 8
    chunk = d[o:o+size]
    o += size
    if kind == b"JSON":
        doc = json.loads(chunk.decode().rstrip("\0 "))
    elif kind == b"BIN\0":
        binary = chunk

if doc is None or binary is None:
    raise SystemExit("GLB tidak lengkap")

formats = {
    5120: ("b", 1), 5121: ("B", 1),
    5122: ("h", 2), 5123: ("H", 2),
    5125: ("I", 4), 5126: ("f", 4)
}

print("MESH | UV MIN U,V | UV MAX U,V | JUMLAH")

for i, mesh in enumerate(doc["meshes"]):
    for prim in mesh["primitives"]:
        ai = prim["attributes"].get("TEXCOORD_0")
        if ai is None:
            continue

        a = doc["accessors"][ai]
        bv = doc["bufferViews"][a["bufferView"]]
        fmt, size = formats[a["componentType"]]
        components = 2
        element_size = size * components
        stride = bv.get("byteStride", element_size)
        start = bv.get("byteOffset", 0) + a.get("byteOffset", 0)

        values = []
        for n in range(a["count"]):
            pos = start + n * stride
            values.append(struct.unpack_from(
                "<" + fmt * 2, binary, pos
            ))

        u = [v[0] for v in values]
        v = [v[1] for v in values]

        name = doc["nodes"][i].get("name", mesh.get("name", str(i)))
        print(
            name,
            "|", round(min(u), 4), round(min(v), 4),
            "|", round(max(u), 4), round(max(v), 4),
            "|", len(values)
        )
