from pathlib import Path
from datetime import datetime
import shutil

p = Path("www/index.html")
s = p.read_text()

anchor = """    function updateGrassStreaming() {
      if (!grassRoot) return;"""

replacement = """    let grassDebugElement = null;
    let grassDebugLast = 0;

    function updateGrassDebug() {
      const now = performance.now();

      if (!grassDebugElement) {
        grassDebugElement = document.createElement('div');
        grassDebugElement.id = 'wardogs-grass-debug';
        grassDebugElement.style.cssText =
          'position:fixed;left:8px;top:8px;z-index:99999;' +
          'background:rgba(0,0,0,.82);color:#9f9;' +
          'font:11px monospace;padding:7px;pointer-events:none;' +
          'white-space:pre-line;border:1px solid #696;';
        document.body.appendChild(grassDebugElement);
      }

      if (now - grassDebugLast < 500) return;
      grassDebugLast = now;

      let instances = 0;
      for (const mesh of grassMeshes) instances += mesh.count;

      grassDebugElement.textContent =
        'GRASS DIAGNOSTIC' +
        '\\\\nPlaying: ' + state.isPlaying +
        ' | Lobby: ' + state.isLobby +
        '\\\\nLoaded: ' + grassLoaded +
        ' | Loading: ' + grassLoading +
        '\\\\nMeshes: ' + grassMeshes.length +
        ' | Instances: ' + instances +
        '\\\\nVisible chunks: ' + grassVisibleKeys.size +
        '\\\\nBuilt chunks: ' + grassChunks.size +
        ' | Pending: ' + grassPendingChunks.length +
        '\\\\nCamera: ' +
        camera.position.x.toFixed(0) + ', ' +
        camera.position.y.toFixed(0) + ', ' +
        camera.position.z.toFixed(0);
    }

    function updateGrassStreaming() {
      if (!grassRoot) return;
      updateGrassDebug();"""

count = s.count(anchor)
if count != 1:
    raise SystemExit(f"ABORT: anchor ditemukan {count} kali, bukan 1.")

backup = p.with_name(
    p.name + ".backup-grass-debug-" +
    datetime.now().strftime("%Y%m%d-%H%M%S")
)
shutil.copy2(p, backup)
p.write_text(s.replace(anchor, replacement, 1))

print("PATCH OK")
print("Backup:", backup)
