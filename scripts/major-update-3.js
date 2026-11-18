const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../www/index.html');
let html = fs.readFileSync(file, 'utf8');

function exact(oldText, newText, label) {
  const count = html.split(oldText).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: ditemukan ${count} target, seharusnya 1.`);
  }
  html = html.replace(oldText, newText);
  console.log('OK:', label);
}

function regex(pattern, replacement, label) {
  const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g';
  const count = [...html.matchAll(new RegExp(pattern.source, flags))].length;
  if (count !== 1) {
    throw new Error(`${label}: ditemukan ${count} target, seharusnya 1.`);
  }
  html = html.replace(pattern, replacement);
  console.log('OK:', label);
}

if (html.includes('WARDOGS_MAJOR_UPDATE_3')) {
  console.log('Major Update 3 sudah diterapkan. Tidak ada perubahan.');
  process.exit(0);
}

// 1. CSS lobby, modal, settings, dan armory.
exact(
  'body.lobby-mode #menu-overlay {z-index:30!important}',
  `/* WARDOGS_MAJOR_UPDATE_3 */
body.lobby-mode #menu-overlay {z-index:100!important}
#lobby-settings-corner {
  position:fixed;top:18px;right:18px;z-index:90;
  width:46px;height:46px;border-radius:12px;
  border:1px solid #d69b32;background:#111c2a;
  color:#fbbf24;font-size:22px;font-weight:900;
  box-shadow:0 5px 20px #0008;
}
#lobby-interaction {
  z-index:95!important;
  background:rgba(2,6,12,.78)!important;
  backdrop-filter:blur(7px);
}
body.lobby-dialog-open #mobile-controls,
body.lobby-armory-open #mobile-controls,
body.lobby-settings-open #mobile-controls {
  display:none!important;
}
body.lobby-mode #settings-overlay {z-index:110!important}
body.lobby-mode #armory-footer-actions {display:none!important}
#lobby-interaction .deploy-confirm-actions {
  display:flex;gap:12px;justify-content:center;
  margin-top:24px;flex-wrap:wrap;
}
#lobby-interaction .deploy-confirm-actions button {
  min-width:125px;padding:13px 18px;border-radius:10px;
  font-weight:900;letter-spacing:1px;
}
#lobby-interaction .deploy-confirm {
  background:#d97706;color:#111827;border:1px solid #fbbf24;
}
#lobby-interaction .deploy-cancel {
  background:#263445;color:white;border:1px solid #64748b;
}
#shop-items-grid > * {
  border-radius:14px;
  border:1px solid rgba(245,158,11,.25);
  background:linear-gradient(145deg,rgba(30,41,59,.96),rgba(8,15,26,.98));
  transition:border-color .2s,transform .2s;
}
#shop-items-grid > *:hover {
  border-color:#f59e0b;transform:translateY(-2px);
}
#menu-overlay .tactical-panel {
  border-color:rgba(245,158,11,.55);
  background:linear-gradient(145deg,#172334,#080e18);
}`,
  'CSS Major Update 3'
);

// 2. Tombol Settings pojok lobby.
regex(
  /(\n[ \t]*)(<div class="lobby-panel lobby-actions">)/,
  '$1<button id="lobby-settings-corner" type="button" aria-label="Settings" title="Settings">⚙</button>\n$1$2',
  'Tombol Settings pojok lobby'
);

// 3. Hapus tombol BATTLE lama dari panel fasilitas.
regex(
  /\n[ \t]*<button id="lobby-battle" class="lobby-btn primary">⚔ BATTLE<\/button>/,
  '',
  'Hapus tombol Battle lama'
);

// 4. Tambahkan NPC khusus deployment.
exact(
  "    createLobbySoldier('GARAGE OFFICER',0,42,0x59616a,'inventory');",
  "    createLobbySoldier('GARAGE OFFICER',0,42,0x59616a,'inventory');\n    createLobbySoldier('DEPLOYMENT OFFICER',0,-24,0x8a5432,'deploy');",
  'Deployment Officer'
);

// 5. Ubah interaksi NPC. Mission Officer tidak lagi memulai pertempuran.
regex(
  /if\(npc\.action==='weapon'\) \{\s*openTacticalShop\('ARMORY • Select your tactical weapon loadout\.'\);\s*\} else if\(npc\.name==='MISSION OFFICER'\) \{\s*startLobbyBattle\(\);\s*\} else \{\s*showLobbyInteraction\(npc\.action\);\s*\}/,
  `if(npc.action==='weapon') {
        openTacticalShop('ARMORY • Select your tactical weapon loadout.');
      } else {
        showLobbyInteraction(npc.action);
      }`,
  'Rute interaksi NPC'
);

// 6. Tambahkan informasi Deployment Officer.
exact(
  "        missions:'MISSION COMMAND'\n      };",
  "        missions:'MISSION COMMAND',\n        deploy:'DEPLOYMENT CONTROL'\n      };",
  'Judul dialog Deployment'
);

exact(
  "        missions:'Mission command: new combat operations will be available here.'\n      };",
  "        missions:'Mission command: review available operations and mission briefings.',\n        deploy:'You are about to leave the military base and enter the combat arena. Check your loadout before deployment. Do you want to proceed?'\n      };",
  'Briefing Deployment'
);

// 7. Tambahkan tombol konfirmasi di dalam panel dialog.
exact(
  `      const panel = document.getElementById('lobby-interaction');
      panel.classList.remove('hidden');
      panel.style.display = 'flex';`,
  `      const panel = document.getElementById('lobby-interaction');
      panel.querySelector('.deploy-confirm-actions')?.remove();

      if(id === 'deploy') {
        const actions = document.createElement('div');
        actions.className = 'deploy-confirm-actions';
        actions.innerHTML = '<button type="button" class="deploy-confirm">DEPLOY</button><button type="button" class="deploy-cancel">CANCEL</button>';
        actions.querySelector('.deploy-confirm').addEventListener('click', startLobbyBattle);
        actions.querySelector('.deploy-cancel').addEventListener('click', closeLobbyInteraction);
        document.getElementById('lobby-interaction-message')
          .insertAdjacentElement('afterend', actions);
      }

      document.body.classList.add('lobby-dialog-open');
      panel.classList.remove('hidden');
      panel.style.display = 'flex';`,
  'Tombol konfirmasi deployment'
);

// 8. Pulihkan kontrol setelah dialog NPC ditutup.
exact(
  `      panel.classList.add('hidden');
      panel.style.display = 'none';
    }`,
  `      panel.classList.add('hidden');
      panel.style.display = 'none';
      panel.querySelector('.deploy-confirm-actions')?.remove();
      document.body.classList.remove('lobby-dialog-open');
    }`,
  'Pemulihan kontrol dialog'
);

// 9. Hapus listener tombol Battle yang sudah tidak ada.
exact(
  "    document.getElementById('lobby-battle').addEventListener('click',startLobbyBattle);",
  '',
  'Hapus listener Battle lama'
);

// 10. Hubungkan tombol Settings pojok.
exact(
  `    document.getElementById('lobby-settings').addEventListener('click',()=>{
      document.getElementById('menu-settings-btn').click();
    });`,
  `    document.getElementById('lobby-settings').addEventListener('click',()=>{
      document.getElementById('menu-settings-btn').click();
    });

    document.getElementById('lobby-settings-corner').addEventListener('click',()=>{
      openSettingsModal(false);
    });`,
  'Aksi tombol Settings pojok'
);

// 11. Tandai footer armory agar tersembunyi di lobby.
regex(
  /<div class="mt-6 pt-5 border-t border-slate-700\/80 flex flex-col sm:flex-row items-center justify-between gap-4">/,
  '<div id="armory-footer-actions" class="mt-6 pt-5 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">',
  'Identifikasi footer armory'
);

// 12. Sembunyikan analog ketika armory lobby terbuka.
regex(
  /\/\/ Keep the movement joystick visible while using the lobby armory\.[\s\S]*?menuOverlay\.classList\.remove\('hidden'\);/,
  `// Armory lobby menjadi halaman persiapan penuh.
      if(fromLobby) {
        document.body.classList.add('lobby-armory-open');
      } else {
        document.body.classList.remove('lobby-armory-open');
      }
      mobileControls.classList.add('hidden');
      menuOverlay.classList.remove('hidden');`,
  'Kontrol armory'
);

// 13. Pulihkan tampilan lobby setelah armory ditutup.
regex(
  /(if \(window\.__lobbyShopOpen && state\.isLobby\) \{\s*)(lobbyUI\.classList\.remove\('hidden'\);)/,
  "$1document.body.classList.remove('lobby-armory-open');\n        $2",
  'Pemulihan setelah armory'
);

// 14. Sembunyikan analog saat Settings dibuka dari lobby.
regex(
  /(syncSettingsUI\(\);\s*)(document\.getElementById\('settings-overlay'\)\.classList\.remove\('hidden'\);)/,
  `$1if(state.isLobby) {
        document.body.classList.add('lobby-settings-open');
        mobileControls.classList.add('hidden');
      }
      $2`,
  'Kontrol Settings'
);

// 15. Pulihkan analog setelah Settings ditutup.
regex(
  /(document\.getElementById\('settings-overlay'\)\.classList\.add\('hidden'\);\s*)(if \(settingsOpenedFromGame)/,
  `$1if(state.isLobby) {
        document.body.classList.remove('lobby-settings-open');
        if(isMobileDevice) {
          mobileControls.classList.remove('hidden');
          applyTouchLayout();
        }
      }
      $2`,
  'Pemulihan Settings'
);

// Validasi sebelum menulis file.
for (const [value, label] of [
  ['WARDOGS_MAJOR_UPDATE_3', 'Marker update'],
  ['DEPLOYMENT OFFICER', 'NPC deployment'],
  ['lobby-settings-corner', 'Tombol Settings'],
  ['lobby-dialog-open', 'Status dialog'],
  ['lobby-armory-open', 'Status armory'],
  ['lobby-settings-open', 'Status Settings'],
  ['armory-footer-actions', 'Footer armory'],
  ['function startLobbyBattle()', 'Transisi arena'],
  ['deploy-confirm', 'Konfirmasi deployment']
]) {
  if (!html.includes(value)) {
    throw new Error('Validasi gagal: ' + label);
  }
}

// Pastikan tombol Battle lama benar-benar sudah tidak dirujuk.
if (html.includes("getElementById('lobby-battle')")) {
  throw new Error('Masih ada referensi tombol Battle lama.');
}

// Backup dibuat hanya setelah semua pemeriksaan berhasil.
const backup = file + '.before-major-update-3-' +
  new Date().toISOString().replace(/[:.]/g, '-');

fs.copyFileSync(file, backup);
fs.writeFileSync(file, html, 'utf8');

console.log('\nMajor Update 3 berhasil diterapkan.');
console.log('Backup:', backup);
