from pathlib import Path

p = Path("www/index.html")
s = p.read_text()

anchor = """      updateGrassStreaming();

      // Update FPS measurement once per second."""

replacement = """      let grassDiag = document.getElementById('wardogs-grass-diagnostic');
      if (!grassDiag) {
        grassDiag = document.createElement('div');
        grassDiag.id = 'wardogs-grass-diagnostic';
        grassDiag.style.cssText =
          'position:fixed;top:8px;left:8px;z-index:999999;' +
          'background:rgba(0,0,0,.88);color:#9cff70;' +
          'padding:9px;font:11px monospace;white-space:pre-wrap;' +
          'pointer-events:none;max-width:94vw;';
        document.body.appendChild(grassDiag);
      }

      let grassError = 'none';
      try {
        updateGrassStreaming();
      } catch (e) {
        grassError = String(e && (e.stack || e.message) || e);
        console.error('[GRASS DIAGNOSTIC]', grassError);
      }

      if (now - (window.__grassDiagTime || 0) > 500) {
        window.__grassDiagTime = now;
        grassDiag.textContent =
          'WARDOGS GRASS DIAGNOSTIC\\\\n' +
          'Playing: ' + state.isPlaying + ' | Lobby: ' + state.isLobby + '\\\\n' +
          'Root: ' + !!grassRoot +
          ' | Visible: ' + (grassRoot ? grassRoot.visible : 'null') + '\\\\n' +
          'Loaded: ' + grassLoaded +
          ' | Geometry: ' + (grassGeometry ? grassGeometry.attributes.position.count : 0) + '\\\\n' +
          'Chunks: ' + grassChunks.size +
          ' | Pending: ' + grassPendingChunks.length + '\\\\n' +
          'Camera: ' + camera.position.x.toFixed(1) + ', ' +
          camera.position.z.toFixed(1) + '\\\\n' +
          'Error: ' + grassError;
      }

      // Update FPS measurement once per second."""

if s.count(anchor) != 1:
    raise SystemExit("GAGAL: anchor animate tidak unik. File tidak diubah.")

Path("www/index.html.backup-grass-diagnostic").write_text(s)
p.write_text(s.replace(anchor, replacement, 1))
print("OK: panel diagnostik rumput dipasang.")
