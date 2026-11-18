const fs = require('fs');
const p = 'www/index.html';
let s = fs.readFileSync(p, 'utf8');

function replaceOnce(oldText, newText, label) {
  const count = s.split(oldText).length - 1;
  if (count !== 1) {
    console.error(`GAGAL: ${label} (ditemukan ${count}, seharusnya 1)`);
    process.exit(1);
  }
  s = s.replace(oldText, newText);
  console.log('OK:', label);
}

replaceOnce(
'#lobby-main-menu {\n display:flex;',
'#lobby-main-menu.hidden {display:none!important}\n#lobby-main-menu {\n display:flex;',
'Perbaikan menu Play'
);

replaceOnce(
'<div id="lobby-toast"></div>\n</div>',
'<div id="lobby-toast"></div>\n</div>\n<div id="lobby-interaction" class="hidden" style="position:fixed;inset:0;z-index:80;background:rgba(0,0,0,.78);display:none;align-items:center;justify-content:center;padding:20px;color:white">\n <div style="position:relative;width:min(420px,100%);background:#101c2b;border:1px solid #d97706;border-radius:16px;padding:28px">\n  <button id="lobby-interaction-close" aria-label="Close" style="position:absolute;right:12px;top:10px;font-size:28px;color:#fbbf24;background:none;border:0;padding:4px 10px">✕</button>\n  <h2 id="lobby-interaction-title" style="font-size:21px;font-weight:bold;color:#f59e0b;margin:12px 0">FACILITY</h2>\n  <p id="lobby-interaction-message" style="color:#cbd5e1">Coming Soon</p>\n </div>\n</div>',
'Panel interaksi dengan tombol X'
);

replaceOnce(
'<div class="tactical-panel w-full max-w-4xl rounded-2xl p-5 sm:p-8 border border-amber-500/30 shadow-2xl my-auto">',
'<div class="tactical-panel relative w-full max-w-4xl rounded-2xl p-5 sm:p-8 border border-amber-500/30 shadow-2xl my-auto">\n      <button id="close-lobby-shop" type="button" aria-label="Close shop" class="absolute right-3 top-3 z-10 rounded-lg border border-amber-500/60 bg-slate-900 px-3 py-1 text-xl font-black text-amber-400">✕</button>',
'Tombol X toko'
);

replaceOnce(
"    document.getElementById('lobby-weapon').addEventListener('click',()=>{\n      openTacticalShop('WEAPON SHOP • Select your tactical weapon loadout.');\n    });",
"    document.getElementById('lobby-weapon').addEventListener('click',()=>{\n      openTacticalShop('WEAPON SHOP • Select your tactical weapon loadout.');\n    });\n\n    function showLobbyInteraction(id) {\n      const names = {equipment:'EQUIPMENT SHOP',operator:'OPERATOR',inventory:'INVENTORY',missions:'MISSIONS'};\n      document.getElementById('lobby-interaction-title').textContent = names[id] || id.toUpperCase();\n      document.getElementById('lobby-interaction-message').textContent = 'COMING SOON';\n      const panel = document.getElementById('lobby-interaction');\n      panel.classList.remove('hidden');\n      panel.style.display = 'flex';\n    }\n\n    function closeLobbyInteraction() {\n      const panel = document.getElementById('lobby-interaction');\n      panel.classList.add('hidden');\n      panel.style.display = 'none';\n    }\n\n    document.getElementById('lobby-interaction-close').addEventListener('click', closeLobbyInteraction);\n    document.getElementById('lobby-interaction').addEventListener('click', e => {\n      if (e.target.id === 'lobby-interaction') closeLobbyInteraction();\n    });",
'Fungsi panel interaksi dan tombol X'
);

replaceOnce(
"    ['equipment','operator','inventory','missions'].forEach(id=>{\n      document.getElementById('lobby-'+id).addEventListener('click',()=>{\n        showLobbyToast(id.toUpperCase()+' • COMING SOON');\n      });\n    });",
"    ['equipment','operator','inventory','missions'].forEach(id=>{\n      document.getElementById('lobby-'+id).addEventListener('click',()=>showLobbyInteraction(id));\n    });",
'Pengaitan tombol fasilitas'
);

replaceOnce(
"    function openTacticalShop(bannerMessage = null) {\n      state.isPlaying = false;",
"    function openTacticalShop(bannerMessage = null) {\n      window.__lobbyShopOpen = !!state.isLobby;\n      if (window.__lobbyShopOpen) lobbyUI.classList.add('hidden');\n      state.isPlaying = false;",
'Integrasi toko dengan Lobby'
);

replaceOnce(
"    deployBtn.addEventListener('click', () => {",
"    document.getElementById('close-lobby-shop').addEventListener('click', () => {\n      menuOverlay.classList.add('hidden');\n      if (window.__lobbyShopOpen && state.isLobby) {\n        lobbyUI.classList.remove('hidden');\n        window.__lobbyShopOpen = false;\n      } else {\n        deployBtn.click();\n      }\n    });\n\n    deployBtn.addEventListener('click', () => {",
'Tombol X toko dan kembali'
);

const backup = p + '.before-interaction-patch.bak';
fs.copyFileSync(p, backup);
fs.writeFileSync(p, s);
console.log('\\nPATCH BERHASIL. Backup:', backup);
