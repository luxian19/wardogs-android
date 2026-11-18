const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'www', 'index.html');
let html = fs.readFileSync(file, 'utf8');

if (html.includes('WARDOGS_LOBBY_V2')) {
  throw new Error('Lobby V2 sudah terpasang. Dibatalkan.');
}

const checks = [
  ['canvas', '<canvas id="game-canvas"></canvas>'],
  ['game state', 'const state = {'],
  ['initBots', '    initBots();'],
  ['animate', '    function animate() {'],
  ['window.onload', '    window.onload = function () {'],
  ['deploy button', "deployBtn.addEventListener('click'"]
];

for (const [name, anchor] of checks) {
  if (!html.includes(anchor)) {
    throw new Error('Anchor tidak ditemukan: ' + name);
  }
}

const css = `
/* WARDOGS_LOBBY_V2 */
#lobby-main-menu,#lobby-ui {
 position:fixed;inset:0;z-index:50;color:white;
 font-family:Arial,sans-serif;
}
#lobby-main-menu {
 display:flex;flex-direction:column;justify-content:center;
 padding:32px;
 background:linear-gradient(90deg,rgba(2,6,12,.96),rgba(2,6,12,.45)),
 linear-gradient(0deg,rgba(2,6,12,.8),transparent);
}
.lobby-panel {
 background:rgba(7,15,26,.88);border:1px solid #64748b;
 border-radius:14px;padding:18px;backdrop-filter:blur(8px);
}
.lobby-btn {
 display:block;width:100%;padding:13px;margin:8px 0;
 border:1px solid #64748b;border-radius:9px;
 background:#172536;color:white;font-weight:bold;text-align:left;
}
.lobby-btn.primary {background:#d97706;color:#111827;text-align:center}
#lobby-ui {pointer-events:none;padding:18px}
#lobby-ui .lobby-panel,#lobby-ui button {pointer-events:auto}
#lobby-ui .lobby-top {display:flex;justify-content:space-between;gap:10px}
#lobby-ui .lobby-actions {position:absolute;top:90px;left:18px;width:210px}
#lobby-toast {
 position:absolute;bottom:100px;left:50%;transform:translateX(-50%);
 background:#111827;border:1px solid #f59e0b;padding:12px 18px;
 border-radius:10px;display:none
}
body.lobby-mode #ctrl-fire,
body.lobby-mode #ctrl-jump,
body.lobby-mode #ctrl-scope,
body.lobby-mode #ctrl-reload,
body.lobby-mode #ctrl-cover {display:none!important}
body.lobby-mode #hud {display:none!important}
`;

const overlays = `
<div id="lobby-main-menu">
 <div style="max-width:440px">
  <div style="font-size:13px;letter-spacing:8px;color:#f59e0b">TACTICAL COMBAT</div>
  <h1 style="font-size:clamp(48px,10vw,76px);font-weight:1000;line-height:1">WARDOGS</h1>
  <p style="color:#cbd5e1;margin:14px 0 28px">Choose your mission. Prepare for deployment.</p>
  <button id="lobby-play" class="lobby-btn primary">PLAY</button>
  <button id="lobby-settings" class="lobby-btn">SETTINGS</button>
  <p style="font-size:11px;color:#94a3b8;margin-top:22px">MOBILE TACTICAL OPERATIONS</p>
 </div>
</div>
<div id="lobby-ui" class="hidden">
 <div class="lobby-top">
  <div class="lobby-panel"><b style="color:#f59e0b">WARDOGS</b> • MILITARY BASE</div>
  <div class="lobby-panel">FREE ROAM</div>
 </div>
 <div class="lobby-panel lobby-actions">
  <b>BASE FACILITIES</b>
  <button id="lobby-weapon" class="lobby-btn">WEAPON SHOP</button>
  <button id="lobby-equipment" class="lobby-btn">EQUIPMENT SHOP</button>
  <button id="lobby-operator" class="lobby-btn">OPERATOR</button>
  <button id="lobby-inventory" class="lobby-btn">INVENTORY</button>
  <button id="lobby-missions" class="lobby-btn">MISSIONS</button>
  <button id="lobby-battle" class="lobby-btn primary">⚔ BATTLE</button>
 </div>
 <div id="lobby-toast"></div>
</div>`;

const lobbyCode = `
    // WARDOGS_LOBBY_V2: isolated 3D military base
    const arenaSceneObjects = scene.children.filter(
      obj => obj !== camera && obj !== hemiLight && obj !== dirLight
    );
    const lobbyGroup = new THREE.Group();
    scene.add(lobbyGroup);

    const lobbyGround = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({color:0x263442, roughness:0.95})
    );
    lobbyGround.rotation.x = -Math.PI / 2;
    lobbyGroup.add(lobbyGround);

    const lobbyAmbient = new THREE.HemisphereLight(0xcbdcf2,0x202b36,1.25);
    lobbyGroup.add(lobbyAmbient);
    const lobbySun = new THREE.DirectionalLight(0xffe0b0,1.5);
    lobbySun.position.set(-15,25,12);
    lobbyGroup.add(lobbySun);

    function lobbyBox(x,y,z,w,h,d,color) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w,h,d),
        new THREE.MeshStandardMaterial({color,roughness:0.8})
      );
      mesh.position.set(x,y,z);
      lobbyGroup.add(mesh);
      return mesh;
    }

    function lobbyBuilding(x,z,w,d,color,label) {
      lobbyBox(x,2,z,w,4,d,color);
      lobbyBox(x,4.15,z,w+0.5,0.3,d+0.5,0x17212b);
      lobbyBox(x,1.1,z-d/2-0.06,2.2,2.2,0.12,0x111827);
      const sign = lobbyBox(x,3.5,z-d/2-0.1,Math.min(w,5),0.55,0.12,0xd97706);
      sign.material.emissive = new THREE.Color(0x442200);
    }

    lobbyBuilding(-12,-12,12,8,0x526273,'ARMORY');
    lobbyBuilding(12,-12,12,8,0x475569,'EQUIPMENT');
    lobbyBuilding(-12,8,10,8,0x334155,'BARRACKS');
    lobbyBuilding(12,8,10,8,0x3f4b59,'OPERATIONS');

    // Hangar
    lobbyBox(0,2,-28,24,4,12,0x394958);
    lobbyBox(0,4.2,-28,25,0.35,13,0x17212b);
    // Landing pad
    lobbyBox(0,0.08,17,13,0.16,10,0x374151);
    lobbyBox(0,0.18,17,8,0.04,0.35,0xfacc15);
    // Containers and perimeter barriers
    for(let i=0;i<5;i++) {
      lobbyBox(-25+i*12,1,-2,5,2,2, i%2?0x475569:0x854d0e);
      lobbyBox(-35+i*17,1,-38,8,2,2,0x374151);
    }
    // Lighting poles
    for(let i=0;i<4;i++) {
      const x = i<2?-24:24, z = i%2?-20:15;
      lobbyBox(x,4,z,0.22,8,0.22,0x111827);
      const lamp = new THREE.PointLight(0xffd28a,1.2,16);
      lamp.position.set(x,8,z);
      lobbyGroup.add(lamp);
    }

    function showLobbyToast(message) {
      const toast = document.getElementById('lobby-toast');
      toast.textContent = message;
      toast.style.display = 'block';
      clearTimeout(window.__lobbyToastTimer);
      window.__lobbyToastTimer = setTimeout(()=>toast.style.display='none',2200);
    }

    const lobbyMain = document.getElementById('lobby-main-menu');
    const lobbyUI = document.getElementById('lobby-ui');

    document.getElementById('lobby-play').addEventListener('click',()=>{
      lobbyMain.classList.add('hidden');
      lobbyUI.classList.remove('hidden');
      state.isLobby = true;
      state.isPlaying = false;
      document.body.classList.add('lobby-mode');
      camera.position.set(0,1.75,22);
      camera.rotation.set(0,0,0);
      if(isMobileDevice) {
        mobileControls.classList.remove('hidden');
        applyTouchLayout();
      } else {
        canvas.requestPointerLock();
      }
    });

    document.getElementById('lobby-settings').addEventListener('click',()=>{
      document.getElementById('menu-settings-btn').click();
    });

    document.getElementById('lobby-weapon').addEventListener('click',()=>{
      openTacticalShop('WEAPON SHOP • Select your tactical weapon loadout.');
    });

    ['equipment','operator','inventory','missions'].forEach(id=>{
      document.getElementById('lobby-'+id).addEventListener('click',()=>{
        showLobbyToast(id.toUpperCase()+' • COMING SOON');
      });
    });

    document.getElementById('lobby-battle').addEventListener('click',()=>{
      state.isLobby = false;
      lobbyUI.classList.add('hidden');
      document.body.classList.remove('lobby-mode');
      mobileControls.classList.add('hidden');
      if(document.pointerLockElement) document.exitPointerLock();
      respawnPlayer();
      deployBtn.click();
    });
`;

function once(oldText, newText, label) {
  const n = html.split(oldText).length - 1;
  if(n !== 1) throw new Error(label + ': jumlah anchor ' + n + ', dibutuhkan 1.');
  html = html.replace(oldText,newText);
}

once('  </style>',css+'\\n  </style>','CSS');
once('  <canvas id="game-canvas"></canvas>',
     '  <canvas id="game-canvas"></canvas>\\n'+overlays,'Menu HTML');
once('      isPlaying: false,',
     '      isPlaying: false,\\n      isLobby: false,','Game state');
once('    initBots();',
     '    initBots();\\n'+lobbyCode,'Lobby scene');

function replaceRegexOnce(regex, replacement, label) {
  const matches = [...html.matchAll(new RegExp(regex.source, regex.flags + "g"))];
  if (matches.length !== 1) {
    throw new Error(label + ': ditemukan ' + matches.length + ' pola.');
  }
  html = html.replace(regex, replacement);
}

replaceRegexOnce(
  /(canvas\.addEventListener\('touchstart', \(e\) => \{\s*)if\s*\(!state\.isPlaying\)\s*return;/,
  '$1if (!state.isPlaying && !state.isLobby) return;',
  'Touch look start'
);

replaceRegexOnce(
  /(canvas\.addEventListener\('touchmove', \(e\) => \{\s*)if\s*\(!state\.isPlaying\s*\|\|\s*!state\.touchLook\.active\)\s*return;/,
  '$1if ((!state.isPlaying && !state.isLobby) || !state.touchLook.active) return;',
  'Touch look move'
);

replaceRegexOnce(
  /(document\.addEventListener\('mousemove', \(e\) => \{\s*)if\s*\(!state\.isPlaying\s*\|\|\s*document\.pointerLockElement !== canvas\)\s*return;/,
  '$1if ((!state.isPlaying && !state.isLobby) || document.pointerLockElement !== canvas) return;',
  'Mouse look'
);

const animateAnchor = `      prevTime = now;

      if (state.isPlaying && !state.isDead && !state.isGameOver) {`;
const animateReplacement = `      prevTime = now;

      if (state.isLobby) {
        const forward = new THREE.Vector3(0,0,-1).applyAxisAngle(new THREE.Vector3(0,1,0),camera.rotation.y);
        const right = new THREE.Vector3(1,0,0).applyAxisAngle(new THREE.Vector3(0,1,0),camera.rotation.y);
        const dir = new THREE.Vector3();
        if(state.keys['KeyW'] || state.keys['ArrowUp']) dir.add(forward);
        if(state.keys['KeyS'] || state.keys['ArrowDown']) dir.sub(forward);
        if(state.keys['KeyD'] || state.keys['ArrowRight']) dir.add(right);
        if(state.keys['KeyA'] || state.keys['ArrowLeft']) dir.sub(right);
        if(state.touchJoystick.active) {
          dir.addScaledVector(forward,-state.touchJoystick.dirY);
          dir.addScaledVector(right,state.touchJoystick.dirX);
        }
        if(dir.lengthSq()>0) {
          dir.normalize();
          camera.position.x += dir.x*5.5*dt;
          camera.position.z += dir.z*5.5*dt;
        }
        camera.position.x = THREE.MathUtils.clamp(camera.position.x,-38,38);
        camera.position.z = THREE.MathUtils.clamp(camera.position.z,-42,28);
        camera.position.y = 1.75;
      }

      if (state.isPlaying && !state.isDead && !state.isGameOver) {`;
once(animateAnchor,animateReplacement,'Lobby movement');

const loadAnchor = `      state.isPlaying = false;
      updateShopUI();`;
const loadReplacement = `      state.isPlaying = false;
      state.isLobby = false;
      arenaSceneObjects.forEach(obj => obj.visible = false);
      lobbyGroup.visible = true;
      camera.position.set(0,1.75,22);
      camera.rotation.set(0,0,0);
      document.getElementById('menu-overlay').classList.add('hidden');
      document.getElementById('lobby-main-menu').classList.remove('hidden');
      document.getElementById('lobby-ui').classList.add('hidden');
      updateShopUI();`;
once(loadAnchor,loadReplacement,'Initial screen');

const backup = file+'.before-lobby-v2-'+Date.now()+'.bak';
fs.copyFileSync(file,backup);
fs.writeFileSync(file,html,'utf8');

console.log('Lobby V2 berhasil dipasang.');
console.log('Backup:',backup);
