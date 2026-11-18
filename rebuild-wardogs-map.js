const fs = require('fs');
const file = 'www/index.html';
let s = fs.readFileSync(file, 'utf8');

function replaceOnce(oldText, newText, label) {
  const count = s.split(oldText).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: ditemukan ${count} bagian, seharusnya 1. Patch dibatalkan.`);
  }
  s = s.replace(oldText, newText);
  console.log('OK:', label);
}

fs.copyFileSync(file, file + '.before-map-rebuild-final.bak');

// 1. Ganti HTML map lama
const oldHTML = `  <!-- EXPANDED TACTICAL OVERHEAD MAP MODAL -->
  <div id="tactical-map-overlay" class="fixed inset-0 z-40 items-center justify-center bg-slate-950/90 backdrop-blur-md p-4" style="display:none">
    <div class="tactical-panel max-w-2xl w-full rounded-2xl p-6 border-2 border-amber-500/60 flex flex-col items-center">
      <div class="flex items-center justify-between w-full pb-3 border-b border-slate-700">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-amber-500"></span>
          <h2 class="text-xl font-black text-white uppercase tracking-wider">TACTICAL SATELLITE RADAR</h2>
        </div>
        <button id="close-map-btn" class="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-600">
          CLOSE [ESC]
        </button>
      </div>

      <!-- Radar Canvas View -->
      <div class="relative w-full aspect-square max-w-[420px] my-4 rounded-xl bg-slate-950 border-2 border-slate-700 overflow-hidden shadow-2xl">
        <canvas id="radar-canvas" width="400" height="400" class="w-full h-full block"></canvas>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300 pt-2 border-t border-slate-700 w-full">
        <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Blue Team (You & Allies)</span>
        <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Red Mercenaries</span>
        <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> Gold Syndicate</span>
        <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-yellow-400 border border-black inline-block"></span> Central Control Zone</span>
      </div>
    </div>
  </div>`;

const newHTML = `  <!-- WARDOGS RESPONSIVE TACTICAL MAP -->
  <div id="tactical-map-overlay" role="dialog" aria-modal="true"
       aria-label="Tactical battlefield map"
       style="display:none">
    <section id="tactical-map-panel">
      <header id="tactical-map-header">
        <div class="tactical-map-heading">
          <span class="tactical-map-live-dot"></span>
          <div>
            <strong>TACTICAL MAP</strong>
            <small>BATTLEFIELD OVERVIEW</small>
          </div>
        </div>
        <button id="close-map-btn" type="button" aria-label="Close tactical map">✕ CLOSE</button>
      </header>

      <div id="tactical-map-canvas-wrap">
        <canvas id="radar-canvas" width="600" height="600"></canvas>
      </div>

      <footer id="tactical-map-legend">
        <span><i class="map-dot blue"></i> BLUE</span>
        <span><i class="map-dot red"></i> RED</span>
        <span><i class="map-dot gold"></i> GOLD</span>
        <span><i class="map-dot zone"></i> CONTROL ZONE</span>
      </footer>
      <div id="tactical-map-hint">Tap outside the panel or CLOSE to return to battle</div>
    </section>
  </div>`;

replaceOnce(oldHTML, newHTML, 'HTML map lama');

// 2. Tambahkan CSS map baru
const cssAnchor = '  </style>';
const newCSS = `
    /* WARDOGS RESPONSIVE TACTICAL MAP */
    #tactical-map-overlay {
      position:fixed!important;
      inset:0!important;
      z-index:9999!important;
      display:none;
      align-items:center;
      justify-content:center;
      padding: max(10px, env(safe-area-inset-top)) max(10px, env(safe-area-inset-right)) max(10px, env(safe-area-inset-bottom)) max(10px, env(safe-area-inset-left));
      background:rgba(2,6,15,.96);
      backdrop-filter:blur(10px);
      overflow:auto;
      overscroll-behavior:contain;
      touch-action:pan-y;
      box-sizing:border-box;
    }
    #tactical-map-overlay * {box-sizing:border-box}
    #tactical-map-panel {
      width:min(100%,720px);
      max-height:100%;
      min-height:0;
      display:flex;
      flex-direction:column;
      align-items:stretch;
      gap:10px;
      padding:clamp(10px,2.5vw,20px);
      border:1px solid rgba(245,158,11,.65);
      border-radius:16px;
      background:linear-gradient(145deg,#172334,#070d17);
      box-shadow:0 15px 60px #000b;
      overflow:auto;
    }
    #tactical-map-header {
      flex:0 0 auto;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px;
      min-height:48px;
      border-bottom:1px solid #334155;
      padding-bottom:10px;
    }
    .tactical-map-heading {display:flex;align-items:center;gap:10px;color:#fff}
    .tactical-map-heading strong {display:block;font-size:clamp(14px,3vw,19px);letter-spacing:1px}
    .tactical-map-heading small {display:block;color:#94a3b8;font-size:9px;letter-spacing:2px;margin-top:3px}
    .tactical-map-live-dot {width:10px;height:10px;flex:0 0 10px;border-radius:50%;background:#f59e0b;box-shadow:0 0 12px #f59e0b}
    #close-map-btn {
      flex:0 0 auto;
      min-width:86px;
      min-height:44px;
      padding:10px 13px;
      border:1px solid #f59e0b;
      border-radius:9px;
      background:#7f1d1d;
      color:white;
      font-size:13px;
      font-weight:900;
      letter-spacing:.5px;
      touch-action:manipulation;
      cursor:pointer;
      position:relative;
      z-index:2;
    }
    #close-map-btn:active {background:#b91c1c;transform:scale(.97)}
    #tactical-map-canvas-wrap {
      flex:0 1 auto;
      align-self:center;
      width:min(100%, min(68vh, 560px));
      aspect-ratio:1/1;
      min-height:0;
      border:2px solid #475569;
      border-radius:12px;
      overflow:hidden;
      background:#020617;
      box-shadow:0 5px 25px #0009;
    }
    #radar-canvas {display:block;width:100%;height:100%;max-width:100%;max-height:100%}
    #tactical-map-legend {
      flex:0 0 auto;
      display:flex;
      flex-wrap:wrap;
      justify-content:center;
      gap:8px 16px;
      padding:9px 4px;
      border-top:1px solid #334155;
      color:#cbd5e1;
      font-size:10px;
      font-weight:800;
    }
    #tactical-map-legend span {display:flex;align-items:center;gap:6px}
    .map-dot {display:inline-block;width:9px;height:9px;border-radius:50%}
    .map-dot.blue {background:#3b82f6}
    .map-dot.red {background:#ef4444}
    .map-dot.gold {background:#f59e0b}
    .map-dot.zone {background:#facc15;border:1px solid #fff}
    #tactical-map-hint {flex:0 0 auto;text-align:center;color:#64748b;font-size:10px}
    @media (orientation:landscape) and (max-height:500px) {
      #tactical-map-overlay {padding:5px}
      #tactical-map-panel {
        width:min(100%,900px);
        max-height:100%;
        display:grid;
        grid-template-columns:minmax(0,1fr) auto;
        grid-template-rows:auto minmax(0,1fr) auto;
        column-gap:14px;
        row-gap:5px;
        padding:8px 12px;
      }
      #tactical-map-header {grid-column:1 / -1;min-height:38px;padding-bottom:5px}
      #tactical-map-canvas-wrap {
        grid-column:1;
        grid-row:2 / 4;
        width:min(65vh,calc(100vw - 150px),430px);
        max-height:calc(100vh - 65px);
      }
      #tactical-map-legend {
        grid-column:2;
        grid-row:2;
        align-self:center;
        flex-direction:column;
        justify-content:center;
        gap:12px;
        border-top:0;
        font-size:11px;
      }
      #tactical-map-hint {grid-column:2;grid-row:3;max-width:150px}
      #close-map-btn {min-height:38px}
    }
    @media (max-width:380px) and (orientation:portrait) {
      #tactical-map-panel {padding:8px;gap:7px}
      #tactical-map-canvas-wrap {width:min(100%,55vh,420px)}
      #tactical-map-legend {gap:7px 10px;font-size:9px}
    }
`;
replaceOnce(cssAnchor, newCSS + cssAnchor, 'CSS map baru');

// 3. Ganti fungsi toggle dan handler lama
const oldJS = `    function toggleTacticalMap(open) {
      if (open) {
        radarModal.classList.remove('hidden');
        radarModal.style.display = 'flex';
        renderRadarToCanvas(radarCtx, radarCanvas.width, radarCanvas.height, 1.25);
      } else {
        radarModal.style.display = 'none';
        radarModal.classList.add('hidden');
      }
    }

    document.getElementById('hud-minimap-box').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTacticalMap(true);
    });
    document.getElementById('close-map-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTacticalMap(false);
    });

    radarModal.addEventListener('click', (e) => {
      if (e.target === radarModal) toggleTacticalMap(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !radarModal.classList.contains('hidden')) {
        toggleTacticalMap(false);
      }
    });`;

const newJS = `    let tacticalMapOpen = false;

    function toggleTacticalMap(open) {
      tacticalMapOpen = !!open;
      if (tacticalMapOpen) {
        radarModal.style.display = 'flex';
        radarModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('tactical-map-active');
        renderRadarToCanvas(radarCtx, radarCanvas.width, radarCanvas.height, 1.25);
      } else {
        radarModal.style.display = 'none';
        radarModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('tactical-map-active');
      }
    }

    document.getElementById('hud-minimap-box').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleTacticalMap(true);
    });

    document.getElementById('close-map-btn').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleTacticalMap(false);
    });

    radarModal.addEventListener('click', (e) => {
      if (e.target === radarModal) toggleTacticalMap(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && tacticalMapOpen) {
        e.preventDefault();
        toggleTacticalMap(false);
      }
    });

    document.addEventListener('backbutton', () => {
      if (tacticalMapOpen) toggleTacticalMap(false);
    });

    window.addEventListener('resize', () => {
      if (tacticalMapOpen) {
        requestAnimationFrame(() => {
          renderRadarToCanvas(radarCtx, radarCanvas.width, radarCanvas.height, 1.25);
        });
      }
    });`;

replaceOnce(oldJS, newJS, 'JavaScript map lama');

// 4. Sembunyikan prompt NPC secara eksplisit ketika battle dimulai
const oldBattle = `      closeLobbyInteraction();
      const interactionPanel = document.getElementById('lobby-interaction');`;

const newBattle = `      closeLobbyInteraction();
      if (lobbyPrompt) lobbyPrompt.style.display = 'none';
      if (lobbyInteractButton) lobbyInteractButton.style.display = 'none';
      nearestLobbyNPC = null;
      const interactionPanel = document.getElementById('lobby-interaction');`;

replaceOnce(oldBattle, newBattle, 'Pembersihan HUD NPC saat battle');

// 5. Tambahkan perlindungan tambahan saat mode lobby berakhir
const oldPromptGuard = `      if(!state.isLobby) {
        lobbyPrompt.style.display='none';
        lobbyInteractButton.style.display='none';
        return;
      }`;

const newPromptGuard = `      if(!state.isLobby) {
        lobbyPrompt.style.display='none';
        lobbyInteractButton.style.display='none';
        nearestLobbyNPC=null;
        return;
      }`;

replaceOnce(oldPromptGuard, newPromptGuard, 'Pengaman prompt NPC');

fs.writeFileSync(file, s);
console.log('\\nPATCH SELESAI. File tersimpan:', file);
