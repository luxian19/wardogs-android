const fs = require('fs');
const file = 'www/index.html';
let s = fs.readFileSync(file, 'utf8');

const patches = [
[
`      closeLobbyInteraction();
      state.isLobby = false;`,
`      closeLobbyInteraction();
      const interactionPanel = document.getElementById('lobby-interaction');
      if (interactionPanel) {
        interactionPanel.classList.add('hidden');
        interactionPanel.style.display = 'none';
      }
      document.body.classList.remove('lobby-dialog-open');
      state.isLobby = false;`,
'NPC dialog cleanup'
],
[
`      mobileControls.classList.add('hidden');
      menuOverlay.classList.remove('hidden');
    }

    function updateShopUI()`,
`      mobileControls.classList.add('hidden');
      menuOverlay.classList.remove('hidden');
      menuOverlay.style.display = 'flex';
    }

    function updateShopUI()`,
'Operation menu visibility'
],
[
`    function toggleTacticalMap(open) {
      if (open) {
        radarModal.classList.remove('hidden');
        renderRadarToCanvas(radarCtx, radarCanvas.width, radarCanvas.height, 1.25);
      } else {
        radarModal.classList.add('hidden');
      }
    }`,
`    function toggleTacticalMap(open) {
      if (open) {
        radarModal.classList.remove('hidden');
        radarModal.style.display = 'flex';
        renderRadarToCanvas(radarCtx, radarCanvas.width, radarCanvas.height, 1.25);
      } else {
        radarModal.classList.add('hidden');
        radarModal.style.display = 'none';
      }
    }`,
'Tactical map visibility'
],
[
`    document.getElementById('close-map-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTacticalMap(false);
    });`,
`    document.getElementById('close-map-btn').addEventListener('click', (e) => {
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
    });`,
'Map close controls'
],
[
`      menuOverlay.classList.add('hidden');
      if (window.__lobbyShopOpen && state.isLobby) {`,
`      menuOverlay.classList.add('hidden');
      menuOverlay.style.display = 'none';
      if (window.__lobbyShopOpen && state.isLobby) {`,
'Close menu'
],
[
`      menuOverlay.classList.add('hidden');
      hud.classList.remove('hidden');`,
`      menuOverlay.classList.add('hidden');
      menuOverlay.style.display = 'none';
      hud.classList.remove('hidden');`,
'Deploy and redeploy menu'
],
[
`      document.getElementById('menu-overlay').classList.add('hidden');`,
`      document.getElementById('menu-overlay').classList.add('hidden');
      document.getElementById('menu-overlay').style.display = 'none';`,
'Initial menu visibility'
]
];

for (const [oldText, newText, label] of patches) {
  const count = s.split(oldText).length - 1;
  if (count !== 1) {
    console.error(`GAGAL: ${label}, ditemukan ${count} kecocokan.`);
    process.exit(1);
  }
}

const backup = `www/index.html.before-bugfix-${Date.now()}.bak`;
fs.copyFileSync(file, backup);

for (const [oldText, newText, label] of patches) {
  s = s.replace(oldText, newText);
  console.log('OK:', label);
}

fs.writeFileSync(file, s);
console.log('PATCH BERHASIL DITERAPKAN.');
console.log('Backup:', backup);
