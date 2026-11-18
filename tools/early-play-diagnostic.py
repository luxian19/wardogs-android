from pathlib import Path
from datetime import datetime

p = Path("www/index.html")
s = p.read_text()

anchor = '''  <script>
    /**
     * WARDOGS: 3-Faction Tactical 3D FPS'''

diagnostic = '''  <script>
    // WARDOGS EARLY PLAY DIAGNOSTIC
    (function () {
      function report(message) {
        let panel = document.getElementById('early-play-diagnostic');
        if (!panel) {
          panel = document.createElement('div');
          panel.id = 'early-play-diagnostic';
          panel.style.cssText =
            'position:fixed;top:8px;left:8px;right:8px;z-index:2147483647;' +
            'background:#180000;color:#fff;padding:12px;font:12px monospace;' +
            'white-space:pre-wrap;max-height:45vh;overflow:auto;' +
            'border:2px solid red;pointer-events:none;';
          document.body.appendChild(panel);
        }
        panel.textContent += '\\n' + message;
      }

      window.addEventListener('error', function (e) {
        report('EARLY ERROR: ' + (e.message || 'Unknown') +
          ' | ' + (e.filename || '') + ':' + (e.lineno || ''));
      });

      window.addEventListener('unhandledrejection', function (e) {
        report('EARLY PROMISE: ' + String(e.reason));
      });

      document.addEventListener('pointerdown', function (e) {
        if (e.target && (e.target.id === 'lobby-play' ||
            e.target.closest && e.target.closest('#lobby-play'))) {
          report('PLAY POINTERDOWN RECEIVED');
        }
      }, true);

      document.addEventListener('click', function (e) {
        if (e.target && (e.target.id === 'lobby-play' ||
            e.target.closest && e.target.closest('#lobby-play'))) {
          report('PLAY CLICK RECEIVED');
        }
      }, true);

      window.addEventListener('load', function () {
        const btn = document.getElementById('lobby-play');
        report('PAGE LOADED | PLAY=' + !!btn +
          ' | disabled=' + (btn ? btn.disabled : 'missing'));
      });
    })();
  </script>
  <script>
    /**
     * WARDOGS: 3-Faction Tactical 3D FPS'''

if s.count(anchor) != 1:
    raise SystemExit("GAGAL: anchor script utama tidak ditemukan secara unik.")

backup = Path("www/index.html.backup-early-diagnostic-" +
              datetime.now().strftime("%Y%m%d-%H%M%S"))
backup.write_text(s)
p.write_text(s.replace(anchor, diagnostic, 1))

print("Diagnostik awal dipasang.")
print("Backup:", backup)
