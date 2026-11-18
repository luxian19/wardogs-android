const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'www', 'index.html');
let html = fs.readFileSync(file, 'utf8');

function replaceOnce(oldText, newText, label) {
  const count = html.split(oldText).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: ditemukan ${count} anchor, seharusnya 1. File tidak diubah.`);
  }
  html = html.replace(oldText, newText);
}

const css = `
    /* WARDOGS 3D LOBBY */
    #lobby-main-menu {
      background: linear-gradient(90deg, rgba(3,8,15,.94), rgba(3,8,15,.40)),
                  linear-gradient(0deg, rgba(3,8,15,.75), transparent 65%);
    }
    .lobby-action {
      width: 100%;
      padding: 12px 14px;
      text-align: left;
      color: #e5e7eb;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 1.5px;
      background: rgba(15,23,42,.88);
      border: 1px solid rgba(148,163,184,.3);
      border-left: 3px solid #eab308;
      border-radius: 5px;
    }
    .lobby-action:active { background: rgba(161,98,7,.65); }
    #lobby-toast {
      position: fixed;
      left: 50%;
      bottom: 20%;
      transform: translateX(-50%);
      z-index: 60;
      padding: 12px 20px;
      background: rgba(2,6,23,.94);
      border: 1px solid #eab308;
      color: #fef3c7;
      font-size: 12px;
      font-weight: bold;
      letter-spacing: 1px;
      text-align: center;
      pointer-events: none;
    }
    body.lobby-mode #ctrl-fire,
    body.lobby-mode #ctrl-jump,
    body.lobby-mode #ctrl-scope,
    body.lobby-mode #ctrl-reload,
    body.lobby-mode #ctrl-cover {
      display: none !important;
    }
`;

const overlays = `
  <!-- WARDOGS MAIN MENU -->
  <div id="lobby-main-menu" class="fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-12">
    <div>
      <div class="text-amber-400 text-xs font-black tracking-[.45em]">TACTICAL COMBAT SYSTEM</div>
      <div class="mt-2 text-5xl sm:text-7xl font-black italic tracking-widest text-white"
           style="text-shadow:0 4px 25px #000">WARDOGS</div>
      <div class="mt-2 text-xs sm:text-sm tracking-[.35em] text-slate-300">THREE FACTIONS. ONE BATTLEFIELD.</div>
    </div>
    <div class="flex flex-col gap-3 w-full max-w-xs">
      <button id="lobby-play" class="tactical-btn bg-amber-500 hover:bg-amber-400 text-black font-black tracking-[.25em] py-4 rounded-sm">
        ▶ PLAY
      </button>
      <button id="lobby-settings" class="tactical-btn border border-slate-400/50 bg-slate-900/80 text-white font-bold tracking-widest py-3 rounded-sm">
        SETTINGS
      </button>
      <div class="text-[9px] tracking-widest text-slate-400 mt-3">WARDOGS // MOBILE TACTICAL FPS</div>
    </div>
  </div>

  <!-- EXPLOREABLE MILITARY LOBBY -->
  <div id="lobby-ui" class="fixed inset-0 z-40 hidden pointer-events-none">
    <div class="absolute top-4 left-4 tactical-panel rounded p-3">
      <div class="text-amber-400 text-[10px] font-black tracking-[.25em]">WARDOGS HQ</div>
      <div class="text-white text-lg font-black tracking-widest">MILITARY BASE</div>
      <div class="text-slate-400 text-[9px]">EXPLORE THE FACILITY</div>
    </div>
    <div class="absolute top-4 right-4 w-40 sm:w-52 flex flex-col gap-2 pointer-events-auto">
      <button id="lobby-weapon" class="lobby-action">▣ WEAPON SHOP</button>
      <button id="lobby-equipment" class="lobby-action">▣ EQUIPMENT SHOP</button>
      <button id="lobby-operator" class="lobby-action">▣ OPERATOR</button>
      <button id="lobby-inventory" class="lobby-action">▣ INVENTORY</button>
      <button id="lobby-missions" class="lobby-action">▣ MISSIONS</button>
    </div>
    <div class="absolute bottom-5 right-5 pointer-events-auto">
      <button id="lobby-battle" class="bg-amber-500 hover:bg-amber-400 text-black font-black tracking-[.2em] px-8 py-4 rounded-sm shadow-xl">
        ⚔ BATTLE
      </button>
    </div>
    <div class="absolute bottom-5 left-5 text-[9px] tracking-widest text-white/70 hud-shadow">
      WASD / JOYSTICK: MOVE · DRAG: LOOK
    </div>
  </div>
  <div id="lobby-toast" class="hidden"></div>
`;

const lobbyCode = `
    // ==========================================
    // WARDOGS: SEPARATE 3D MILITARY LOBBY
    // ==========================================
    const arenaSceneObjects = scene.children.filter(
      obj => obj !== camera && obj !== hemiLight && obj !== dirLight
    );

    const lobbyGroup = new THREE.Group();
    lobbyGroup.name = 'WARDOGS_MILITARY_LOBBY';
    scene.add(lobbyGroup);

    function lobbyBox(x, y, z, sx, sy, sz, color, materialOptions = {}) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(sx, sy, sz),
        new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...materialOptions })
      );
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      lobbyGroup.add(mesh);
      return mesh;
    }

    function lobbySign(x, y, z, width, height, title, subtitle) {
      const canvasSign = document.createElement('canvas');
      canvasSign.width = 512;
      canvasSign.height = 160;
      const ctx = canvasSign.getContext('2d');
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, 512, 160);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(0, 0, 12, 160);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 48px Arial';
      ctx.fillText(title, 30, 70);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 22px Arial';
      ctx.fillText(subtitle, 32, 112);
      const texture = new THREE.CanvasTexture(canvasSign);
      const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
      );
      sign.position.set(x, y, z);
      lobbyGroup.add(sign);
    }

    function lobbyBuilding(x, z, width, depth, color, title, subtitle) {
      const h = 4.5;
      lobbyBox(x, h / 2, z, width, h, depth, color);
      lobbyBox(x, h + .18, z, width + .5, .35, depth + .5, 0x202b36);
      lobbyBox(x, 1.25, z - depth / 2 - .08, 2.2, 2.5, .18, 0x111827);
      lobbyBox(x - width * .29, 2.7, z - depth / 2 - .10, 1.5, 1.0, .12, 0x64748b, { metalness: .5 });
      lobbyBox(x + width * .29, 2.7, z - depth / 2 - .10, 1.5, 1.0, .12, 0x64748b, { metalness: .5 });
      lobbySign(x, h + 1.1, z - depth / 2 - .12, Math.min(width * .8, 8), 1.5, title, subtitle);
    }

    // Ground and central road
    const lobbyGround = new THREE.Mesh(
      new THREE.PlaneGeometry(90, 90),
      new THREE.MeshStandardMaterial({ color: 0x465044, roughness: 1 })
    );
    lobbyGround.rotation.x = -Math.PI / 2;
    lobbyGround.position.y = -.08;
    lobbyGroup.add(lobbyGround);

    lobbyBox(0, .01, -7, 9, .04, 65, 0x343a40);
    for (let z = 20; z > -38; z -= 8) {
      lobbyBox(0, .04, z, .18, .025, 3, 0xeab308);
    }

    // Main hangar
    lobbyBuilding(0, -27, 19, 11, 0x59636b, 'HANGAR', 'AIR OPERATIONS');
    lobbyBox(0, 2.3, -21.35, 8, 4.2, .15, 0x26323b);
    lobbyBox(0, 4.5, -21.2, 8.5, .25, .35, 0xeab308);

    // Barracks and facility buildings
    lobbyBuilding(-16, -7, 10, 10, 0x46515a, 'WEAPON', 'ARMORY');
    lobbyBuilding(16, -7, 10, 10, 0x4b5548, 'EQUIP', 'SUPPLY DEPOT');
    lobbyBuilding(-16, -25, 9, 9, 0x50545b, 'OPERATOR', 'PERSONNEL');
    lobbyBuilding(16, -25, 9, 9, 0x50545b, 'MISSION', 'COMMAND');

    // Containers
    for (let i = 0; i < 3; i++) {
      lobbyBox(-25 + i * 4, 1.2, 9, 3.8, 2.4, 3.2, i % 2 ? 0x7c3429 : 0x36546a);
      lobbyBox(25 - i * 4, 1.2, 9, 3.8, 2.4, 3.2, i % 2 ? 0x52613d : 0x7c3429);
    }

    // Watch towers and floodlights
    for (const x of [-29, 29]) {
      lobbyBox(x, 3, -15, .45, 6, .45, 0x343b42);
      lobbyBox(x, 6.2, -15, 3.5, .35, 3.5, 0x4b5563);
      lobbyBox(x, 7.2, -15, 2.5, 1.7, 2.5, 0x64748b);
      const lamp = new THREE.PointLight(0xffd27a, 1.2, 22);
      lamp.position.set(x, 8, -15);
      lobbyGroup.add(lamp);
    }

    // Helipad
    const helipad = new THREE.Mesh(
      new THREE.CircleGeometry(5, 48),
      new THREE.MeshStandardMaterial({ color: 0x353b40, roughness: 1 })
    );
    helipad.rotation.x = -Math.PI / 2;
    helipad.position.set(0, .03, 13);
    lobbyGroup.add(helipad);
    lobbyBox(0, .06, 13, 3, .025, .25, 0xeab308);
    lobbyBox(0, .06, 13, .25, .025, 3, 0xeab308);

    lobbyGroup.add(new THREE.HemisphereLight(0xb9d4ee, 0x323b2d, 1.25));
    const lobbySun = new THREE.DirectionalLight(0xffe0b0, 1.5);
    lobbySun.position.set(-12, 24, 10);
    lobbyGroup.add(lobbySun);

    function showLobbyToast(message) {
      const toast = document.getElementById('lobby-toast');
      toast.textContent = message;
      toast.classList.remove('hidden');
      clearTimeout(window.__lobbyToastTimer);
      window.__lobbyToastTimer = setTimeout(() => toast.classList.add('hidden'), 2200);
    }

    const lobbyMainMenu = document.getElementById('lobby-main-menu');
    const lobbyUI = document.getElementById('lobby-ui');

    document.getElementById('lobby-play').addEventListener('click', () => {
      lobbyMainMenu.classList.add('hidden');
      lobbyUI.classList.remove('hidden');
      state.isLobby = true;
      state.isPlaying = false;
      document.body.classList.add('lobby-mode');
      if (isMobileDevice) {
        mobileControls.classList.remove('hidden');
        applyTouchLayout();
      } else {
        canvas.requestPointerLock();
      }
    });

    document.getElementById('lobby-settings').addEventListener('click', () => {
      document.getElementById('menu-settings-btn').click();
    });

    document.getElementById('lobby-weapon').addEventListener('click', () => {
      openTacticalShop('WEAPON SHOP • Select your tactical weapon loadout.');
    });

    for (const id of ['equipment', 'operator', 'inventory', 'missions']) {
      document.getElementById('lobby-' + id).addEventListener('click', () => {
        showLobbyToast(id.toUpperCase() + ' • COMING SOON');
      });
    }

    document.getElementById('lobby-battle').addEventListener('click', () => {
      state.isLobby = false;
      lobbyUI.classList.add('hidden');
      document.body.classList.remove('lobby-mode');
      mobileControls.classList.add('hidden');
      if (document.pointerLockElement) document.exitPointerLock();
      respawnPlayer();
      deployBtn.click();
    });
`;

replaceOnce(
  /const state = \{\s*isPlaying: false,/,
  (match) => match + "\n      isLobby: false,",
  "game state"
);

replaceOnce(
  /initBots\(\);\s*function damageBot/,
  "initBots();\n\n" + lobbyCode + "\n\nfunction damageBot",
  "lobby scene insertion"
);

replaceOnce(
  '    // Touch Look ONLY when touching the 3D canvas directly (never on UI buttons)\\n    canvas.addEventListener(\'touchstart\', (e) => {\\n      if (!state.isPlaying) return;',
  '    // Touch Look ONLY when touching the 3D canvas directly (never on UI buttons)\\n    canvas.addEventListener(\'touchstart\', (e) => {\\n      if (!state.isPlaying && !state.isLobby) return;',
  'touch look start'
);

replaceOnce(
  '    canvas.addEventListener(\'touchmove\', (e) => {\\n      if (!state.isPlaying || !state.touchLook.active) return;',
  '    canvas.addEventListener(\'touchmove\', (e) => {\\n      if ((!state.isPlaying && !state.isLobby) || !state.touchLook.active) return;',
  'touch look move'
);

replaceOnce(
  '    document.addEventListener(\'mousemove\', (e) => {\\n      if (!state.isPlaying || document.pointerLockElement !== canvas) return;',
  '    document.addEventListener(\'mousemove\', (e) => {\\n      if ((!state.isPlaying && !state.isLobby) || document.pointerLockElement !== canvas) return;',
  'desktop camera look'
);

replaceOnce(
  '    function animate() {\\n      requestAnimationFrame(animate);\\n\\n      const now = performance.now();\\n      const dt = Math.min(0.05, (now - prevTime) / 1000);\\n      prevTime = now;\\n\\n      if (state.isPlaying && !state.isDead && !state.isGameOver) {',
  `    function animate() {
      requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min(0.05, (now - prevTime) / 1000);
      prevTime = now;

      // Lobby-only movement: no combat, gravity, or arena collision.
      if (state.isLobby) {
        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(
          new THREE.Vector3(0, 1, 0), camera.rotation.y
        );
        const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(
          new THREE.Vector3(0, 1, 0), camera.rotation.y
        );
        const dir = new THREE.Vector3();
        if (state.keys['KeyW'] || state.keys['ArrowUp']) dir.add(forward);
        if (state.keys['KeyS'] || state.keys['ArrowDown']) dir.sub(forward);
        if (state.keys['KeyD'] || state.keys['ArrowRight']) dir.add(right);
        if (state.keys['KeyA'] || state.keys['ArrowLeft']) dir.sub(right);
        if (state.touchJoystick.active) {
          dir.addScaledVector(forward, -state.touchJoystick.dirY);
          dir.addScaledVector(right, state.touchJoystick.dirX);
        }
        if (dir.lengthSq() > 0) {
          dir.normalize();
          camera.position.x += dir.x * 5.5 * dt;
          camera.position.z += dir.z * 5.5 * dt;
        }
        camera.position.x = THREE.MathUtils.clamp(camera.position.x, -34, 34);
        camera.position.z = THREE.MathUtils.clamp(camera.position.z, -39, 22);
        camera.position.y = 1.75;
      }

      if (state.isPlaying && !state.isDead && !state.isGameOver) {`,
  'lobby movement'
);

replaceOnce(
  '    window.onload = function () {\\n      loadUserConfig();\\n      respawnPlayer();\\n      state.isPlaying = false;',
  `    window.onload = function () {
      loadUserConfig();
      respawnPlayer();
      state.isPlaying = false;
      state.isLobby = false;
      arenaSceneObjects.forEach(obj => { obj.visible = false; });
      lobbyGroup.visible = true;
      camera.position.set(0, 1.75, 18);
      camera.rotation.set(0, 0, 0);
      menuOverlay.classList.add('hidden');
      document.getElementById('lobby-main-menu').classList.remove('hidden');
      document.getElementById('lobby-ui').classList.add('hidden');`,
  'initial lobby scene'
);

replaceOnce(
  '    /* Animations */',
  css + '\\n    /* Animations */',
  'lobby styles'
);

replaceOnce(
  '  <canvas id="game-canvas"></canvas>',
  '  <canvas id="game-canvas"></canvas>\\n' + overlays,
  'lobby HTML'
);

// Check JavaScript and markup anchors before writing.
if (!html.includes("state.isLobby = true;") ||
    !html.includes("WARDOGS_MILITARY_LOBBY") ||
    !html.includes('id="lobby-battle"')) {
  throw new Error('Validasi akhir gagal. File asli tidak diubah.');
}

const backup = file + '.pre-lobby-' + new Date().toISOString().replace(/[:.]/g, '-');
fs.copyFileSync(file, backup);
fs.writeFileSync(file, html, 'utf8');

console.log('PATCH BERHASIL DIPASANG.');
console.log('Backup:', backup);
console.log('File:', file);
console.log('Lobby 3D, menu utama, joystick eksplorasi, dan Battle sudah ditambahkan.');
