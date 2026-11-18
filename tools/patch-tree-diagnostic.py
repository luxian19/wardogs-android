from pathlib import Path
from datetime import datetime
import re

p = Path("www/index.html")
s = p.read_text()

pattern = re.compile(
    r"(?P<i>^[ \t]*)const variants=\[\];\s*"
    r"root\.traverse\(n\s*=>\s*\{\s*"
    r"if\(!n\.isMesh\s*&&\s*/\^\(Large\|Medium\|Small\) tree_\[1-3\]\$/\.test\(n\.name\)\)\s*"
    r"variants\.push\(n\);\s*\}\);\s*"
    r"variants\.sort\(\(a,b\)=>a\.name\.localeCompare\(b\.name,undefined,\{numeric:true\}\)\);\s*"
    r"soldierDebug\('TREE VARIANTS: '\+variants\.map\(v=>v\.name\)\.join\(', '\)\);",
    re.M
)

replacement = """\\g<i>const variants=[];
\\g<i>const treeNodeNames=[];
\\g<i>let totalTreeNodes=0;

\\g<i>root.traverse(n => {
\\g<i>  totalTreeNodes++;
\\g<i>  if(n.name && /tree/i.test(n.name))
\\g<i>    treeNodeNames.push((n.isMesh?'MESH: ':'GROUP: ')+n.name);
\\g<i>  if(!n.isMesh && /^(Large|Medium|Small) tree_[1-3]$/.test(n.name))
\\g<i>    variants.push(n);
\\g<i>});

\\g<i>variants.sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));
\\g<i>soldierDebug('TREE SCENE NODES: '+totalTreeNodes);
\\g<i>soldierDebug('TREE VARIANT COUNT: '+variants.length);
\\g<i>soldierDebug('TREE NODE NAMES: '+treeNodeNames.slice(0,35).join(' | '));"""

new, count = pattern.subn(replacement, s, count=1)

if count != 1:
    raise SystemExit("BATAL: blok variasi pohon tidak cocok. File tidak diubah.")

backup = p.with_name(
    p.name + ".backup-tree-auto-" + datetime.now().strftime("%Y%m%d-%H%M%S")
)
backup.write_text(s)
p.write_text(new)

print("PATCH DIAGNOSTIK POHON TERPASANG")
print("Backup:", backup)
