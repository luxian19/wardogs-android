const fs = require('fs');

const file = 'www/index.html';
const manifest = 'android/app/src/main/AndroidManifest.xml';

let html = fs.readFileSync(file, 'utf8');
let xml = fs.readFileSync(manifest, 'utf8');

function replaceOnce(source, oldText, newText, label) {
  const count = source.split(oldText).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: pola ditemukan ${count} kali, patch dibatalkan.`);
  }
  return source.replace(oldText, newText);
}

const changes = [];

// 1. Hide old lobby facility menu; interact with NPCs instead.
html = replaceOnce(
  html,
  'body.lobby-mode #hud {display:none!important}',
  `body.lobby-mode #hud {display:none!important}
body.lobby-mode #lobby-ui .lobby-actions {display:none!important}
body:not(.lobby-mode) #hud-shop-btn {display:none!important}
body.lobby-mode #mobile-controls {
  display:block!important;
  z-index:60!important;
}
body.lobby-mode #lobby-interaction {z-index:24!important}
body.lobby-mode #menu-overlay {z-index:30!important}
`,
  'Lobby CSS'
);
changes.push('Lobby menu and mobile controls CSS');

// 2. Lock the native Android activity to landscape.
xml = replaceOnce(
  xml,
  'android:name=".MainActivity"',
  'android:name=".MainActivity"\n            android:screenOrientation="landscape"',
  'Android landscape orientation'
);
changes.push('Android landscape lock');

// 3. Replace NPC interaction routing.
html = replaceOnce(
  html,
  `      if(npc.action==='weapon') {
        openTacticalShop('ARMORY • Select your tactical weapon loadout.');
      } else {
        showLobbyInteraction(npc.action);
      }`,
  `      if(npc.action==='weapon') {
        openTacticalShop('ARMORY • Select your tactical weapon loadout.');
      } else if(npc.name==='MISSION OFFICER') {
        startLobbyBattle();
      } else {
        showLobbyInteraction(npc.action);
      }`,
  'Mission Officer interaction'
);
changes.push('Mission Officer starts battle');

// 4. Add the dedicated lobby-to-battle transition.
html = replaceOnce(
  html,
  `    document.getElementById('lobby-battle').addEventListener('click',()=>{`,
  `    function startLobbyBattle() {
      if(!state.isLobby) return;
      closeLobbyInteraction();
      state.isLobby = false;
      lobbyUI.classList.add('hidden');
      document.body.classList.remove('lobby-mode');
      mobileControls.classList.add('hidden');
      if(document.pointerLockElement) document.exitPointerLock();
      arenaSceneObjects.forEach(obj => { obj.visible = true; });
      lobbyGroup.visible = false;
      respawnPlayer();
      deployBtn.click();
    }

    document.getElementById('lobby-battle').addEventListener('click',()=>{`,
  'Battle transition function'
);
changes.push('Dedicated battle transition');

// 5. Keep old battle button compatible with the new transition.
html = replaceOnce(
  html,
  `    document.getElementById('lobby-battle').addEventListener('click',()=>{
      state.isLobby = false;
      lobbyUI.classList.add('hidden');
      document.body.classList.remove('lobby-mode');
      mobileControls.classList.add('hidden');
      if(document.pointerLockElement) document.exitPointerLock();
      arenaSceneObjects.forEach(obj => { obj.visible = true; });
      lobbyGroup.visible = false;
      respawnPlayer();
      deployBtn.click();
    });`,
  `    document.getElementById('lobby-battle').addEventListener('click',startLobbyBattle);`,
  'Legacy battle button'
);
changes.push('Legacy battle button compatibility');

// 6. Replace shop function with lobby-only shop and combat pause screen.
html = replaceOnce(
  html,
  `    function openTacticalShop(bannerMessage = null) {
      window.__lobbyShopOpen = !!state.isLobby;
      if (window.__lobbyShopOpen) lobbyUI.classList.add('hidden');
      state.isPlaying = false;
      state.isMouseDown = false;
      setAiming(false);
      if (document.pointerLockElement === canvas) {
        document.exitPointerLock();
      }
      const banner = document.getElementById('status-banner');
      if (bannerMessage) {
        banner.classList.remove('hidden');
        document.getElementById('status-banner-text').textContent = bannerMessage;
        deployBtn.textContent = state.isDead ? 'REDEPLOY TO COMBAT' : 'RESUME COMBAT';
      } else {
        banner.classList.add('hidden');
        deployBtn.textContent = 'RESUME COMBAT';
      }
      updateShopUI();
      hud.classList.add('hidden');
      mobileControls.classList.add('hidden');
      menuOverlay.classList.remove('hidden');
    }`,
  `    function openTacticalShop(bannerMessage = null) {
      const fromLobby = !!state.isLobby;
      window.__lobbyShopOpen = fromLobby;

      if (!fromLobby && state.isPlaying) {
        // Combat pause/death screen must never expose the armory.
        state.isPlaying = false;
        state.isMouseDown = false;
        setAiming(false);
        if (document.pointerLockElement === canvas) {
          document.exitPointerLock();
        }
      }

      if (fromLobby) lobbyUI.classList.add('hidden');

      const banner = document.getElementById('status-banner');
      if (bannerMessage) {
        banner.classList.remove('hidden');
        document.getElementById('status-banner-text').textContent = bannerMessage;
        deployBtn.textContent = state.isDead ? 'REDEPLOY TO COMBAT' : 'RESUME COMBAT';
      } else {
        banner.classList.add('hidden');
        deployBtn.textContent = fromLobby ? 'CLOSE ARMORY' : 'RESUME COMBAT';
      }

      const shopSection = document.getElementById('shop-items-grid')?.parentElement?.parentElement;
      if (shopSection) shopSection.style.display = fromLobby ? '' : 'none';

      const shopHeading = document.querySelector('#menu-overlay h2');
      if (shopHeading) shopHeading.textContent = fromLobby ? 'Armory & Tactical Loadout Shop' : 'Operation Status';

      const shopHint = document.querySelector('#menu-overlay h2 + span');
      if (shopHint) shopHint.textContent = fromLobby ? 'Click an item to purchase & equip' : 'Combat temporarily paused';

      updateShopUI();
      hud.classList.add('hidden');

      // Keep the movement joystick visible while using the lobby armory.
      if (fromLobby && isMobileDevice) {
        mobileControls.classList.remove('hidden');
        applyTouchLayout();
      } else {
        mobileControls.classList.add('hidden');
      }

      menuOverlay.classList.remove('hidden');
    }`,
  'Lobby-only armory and combat pause'
);
changes.push('Separate lobby armory from combat pause');

// 7. Closing the armory restores lobby movement controls.
html = replaceOnce(
  html,
  `      if (window.__lobbyShopOpen && state.isLobby) {
        lobbyUI.classList.remove('hidden');
        window.__lobbyShopOpen = false;
      } else {
        deployBtn.click();
      }`,
  `      if (window.__lobbyShopOpen && state.isLobby) {
        lobbyUI.classList.remove('hidden');
        window.__lobbyShopOpen = false;
        if(isMobileDevice) {
          mobileControls.classList.remove('hidden');
          applyTouchLayout();
        }
      } else {
        deployBtn.click();
      }`,
  'Close armory controls'
);
changes.push('Restore joystick after armory');

// 8. HUD shop button only works inside the lobby.
html = replaceOnce(
  html,
  `    document.getElementById('hud-shop-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openTacticalShop('TACTICAL ARMORY • Spend your Cash on upgraded weapons & fortifications.');
    });`,
  `    document.getElementById('hud-shop-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      if(state.isLobby) {
        openTacticalShop('ARMORY • Select your tactical weapon loadout.');
      }
    });`,
  'HUD shop restriction'
);
changes.push('Disable combat HUD shop');

// 9. Disable keyboard B shop shortcut during combat.
html = replaceOnce(
  html,
  `      if (e.code === 'KeyB') {
        openTacticalShop('TACTICAL ARMORY • Spend your Cash on upgraded weapons & fortifications.');
      }`,
  `      // The B shop shortcut is disabled. Use the Quartermaster in the lobby.`,
  'Keyboard B shop shortcut'
);
changes.push('Disable keyboard B shop');

// 10. Attempt browser landscape lock on the PLAY gesture as a fallback.
html = replaceOnce(
  html,
  `    document.getElementById('lobby-play').addEventListener('click',()=>{
      lobbyMain.classList.add('hidden');`,
  `    document.getElementById('lobby-play').addEventListener('click',()=>{
      try {
        if(screen.orientation && screen.orientation.lock) {
          screen.orientation.lock('landscape').catch(()=>{});
        }
      } catch(e) {}
      lobbyMain.classList.add('hidden');`,
  'Browser landscape fallback'
);
changes.push('Browser landscape fallback');

// Write only after all checks and replacements have passed.
fs.writeFileSync(file, html);
fs.writeFileSync(manifest, xml);

console.log('\\nMAJOR UPDATE 2 PATCH APPLIED');
changes.forEach((item, i) => console.log(`${i + 1}. ${item}`));
