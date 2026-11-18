const fs = require('fs');
const file = 'www/index.html';
let html = fs.readFileSync(file, 'utf8');

function count(s) {
  return html.split(s).length - 1;
}

function replaceOnce(oldText, newText, label) {
  const n = count(oldText);
  if (n !== 1) throw new Error(label + ': anchor ditemukan ' + n + ' kali.');
  html = html.replace(oldText, newText);
}

const start = '    // WARDOGS_LOBBY_V2: isolated 3D military base';
const end = '    function showLobbyToast(message) {';

if (count(start) !== 1 || count(end) !== 1) {
  throw new Error('Blok lobby tidak cocok. File tidak diubah.');
}

const lobby = String.raw`
    // WARDOGS MAJOR UPDATE 1 - MILITARY BASE
    const arenaSceneObjects = scene.children.filter(
      obj => obj !== camera && obj !== hemiLight && obj !== dirLight
    );

    const lobbyGroup = new THREE.Group();
    scene.add(lobbyGroup);

    const lobbyMaterials = {};
    const lobbyColliders = [];
    const lobbyNPCs = [];

    function lobbyMat(color, roughness = 0.85) {
      const key = color + ':' + roughness;
      if (!lobbyMaterials[key]) {
        lobbyMaterials[key] = new THREE.MeshStandardMaterial({
          color, roughness
        });
      }
      return lobbyMaterials[key];
    }

    function lobbyBox(x,y,z,w,h,d,color,solid=false) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w,h,d),
        lobbyMat(color)
      );
      mesh.position.set(x,y,z);
      lobbyGroup.add(mesh);

      if (solid) lobbyColliders.push({x,z,w,d});
      return mesh;
    }

    function lobbyBuilding(x,z,w,d,color,label) {
      lobbyBox(x,2,z,w,4,d,color,true);
      lobbyBox(x,4.15,z,w+0.7,0.3,d+0.7,0x17212b);
      lobbyBox(x,1.15,z-d/2-0.07,2.4,2.3,0.14,0x111827);
      lobbyBox(x,3.5,z-d/2-0.13,Math.min(w,6),0.55,0.15,0xd97706);

      // Entrance lights
      for (const side of [-1,1]) {
        const lamp = new THREE.PointLight(0xffbd65,0.35,7);
        lamp.position.set(x+side*(w/2-0.7),3,z-d/2-0.5);
        lobbyGroup.add(lamp);
      }
    }

    // Base ground and outdoor environment
    const lobbyGround = new THREE.Mesh(
      new THREE.PlaneGeometry(140,140),
      lobbyMat(0x40503d,1)
    );
    lobbyGround.rotation.x = -Math.PI/2;
    lobbyGround.position.y = -0.04;
    lobbyGroup.add(lobbyGround);

    // Main roads and central plaza
    lobbyBox(0,0,0,13,0.08,132,0x343c40);
    lobbyBox(0,0,0,132,0.08,11,0x343c40);
    lobbyBox(0,0.06,0,22,0.08,22,0x555b59);

    for (let z=-60; z<=60; z+=12) {
      lobbyBox(0,0.11,z,0.25,0.025,5,0xeabf57);
    }

    // Facility buildings
    lobbyBuilding(0,-48,22,13,0x536477,'COMMAND CENTER');
    lobbyBuilding(-29,-17,17,13,0x59616a,'ARMORY');
    lobbyBuilding(29,-17,17,13,0x4d6266,'EQUIPMENT');
    lobbyBuilding(-29,19,17,13,0x465363,'BARRACKS');
    lobbyBuilding(29,19,17,13,0x505a69,'OPERATIONS');
    lobbyBuilding(0,51,25,13,0x394b5a,'HANGAR');

    // Shooting range
    lobbyBox(-51,0.05,0,17,0.1,37,0x555c4c);
    for (let i=0;i<4;i++) {
      const x=-57+i*4;
      lobbyBox(x,1,-12,0.15,2,0.15,0x252b2d);
      lobbyBox(x,1,-11.8,1.3,1.5,0.12,0xc6b58a);
    }

    // Helicopter landing zone
    lobbyBox(0,0.07,32,17,0.14,13,0x454c50);
    lobbyBox(0,0.16,32,11,0.035,0.35,0xfacc15);
    lobbyBox(0,0.16,32,0.35,0.035,8,0xfacc15);

    // Supply containers
    for (let i=0;i<6;i++) {
      const x=-48+i*19;
      lobbyBox(x,1,-34,7,2.1,3, i%2 ? 0x596b70 : 0x805b35,true);
      lobbyBox(x,2.1,-34,7.1,0.12,3.1,0x27343b);
    }

    // Perimeter fences and guard posts
    for (let x=-65;x<=65;x+=5) {
      lobbyBox(x,1.3,-66,0.16,2.6,0.16,0x30383b);
      lobbyBox(x,1.3,66,0.16,2.6,0.16,0x30383b);
    }
    for (let z=-66;z<=66;z+=5) {
      lobbyBox(-66,1.3,z,0.16,2.6,0.16,0x30383b);
      lobbyBox(66,1.3,z,0.16,2.6,0.16,0x30383b);
    }

    lobbyBox(-61,1.3,-61,8,2.6,8,0x46515a,true);
    lobbyBox(61,1.3,-61,8,2.6,8,0x46515a,true);
    lobbyBox(-61,1.3,61,8,2.6,8,0x46515a,true);
    lobbyBox(61,1.3,61,8,2.6,8,0x46515a,true);

    // Barricades
    for(let i=0;i<8;i++) {
      lobbyBox(-43+i*12,0.7,7,4,1.4,0.8,0x8a7952,true);
    }

    // Lighting
    const lobbyAmbient = new THREE.HemisphereLight(0xcbdcf2,0x303b2d,1.15);
    lobbyGroup.add(lobbyAmbient);

    const lobbySun = new THREE.DirectionalLight(0xffe0b0,1.4);
    lobbySun.position.set(-30,45,25);
    lobbyGroup.add(lobbySun);

    for (let i=0;i<8;i++) {
      const x = (i%4)*36-54;
      const z = i<4 ? -37 : 37;
      lobbyBox(x,5,z,0.25,10,0.25,0x20282b);
      const lamp = new THREE.PointLight(0xffd28a,0.65,22);
      lamp.position.set(x,9,z);
      lobbyGroup.add(lamp);
    }

    // Original procedural soldier characters
    function createLobbySoldier(name,x,z,uniform,action) {
      const soldier = new THREE.Group();
      const bodyMat = lobbyMat(uniform);
      const darkMat = lobbyMat(0x20282d);
      const skinMat = lobbyMat(0xb58a68);
      const gearMat = lobbyMat(0x343d38);

      function part(geo,mat,px,py,pz) {
        const mesh = new THREE.Mesh(geo,mat);
        mesh.position.set(px,py,pz);
        soldier.add(mesh);
        return mesh;
      }

      part(new THREE.BoxGeometry(0.65,0.85,0.35),bodyMat,0,1.25,0);
      part(new THREE.SphereGeometry(0.23,10,8),skinMat,0,1.83,0);
      part(new THREE.SphereGeometry(0.27,10,8),darkMat,0,2.02,0);

      part(new THREE.BoxGeometry(0.48,0.12,0.4),gearMat,0,1.45,-0.2);

      for(const side of [-1,1]) {
        part(new THREE.BoxGeometry(0.2,0.75,0.23),bodyMat,side*0.43,1.25,0);
        part(new THREE.BoxGeometry(0.23,0.65,0.27),darkMat,side*0.19,0.4,0);
        part(new THREE.BoxGeometry(0.24,0.14,0.4),darkMat,side*0.19,0.08,-0.04);
      }

      // Rifle silhouette
      const rifle = part(new THREE.BoxGeometry(0.12,0.12,0.85),darkMat,0.45,1.12,-0.28);
      rifle.rotation.x=-0.12;

      const marker = new THREE.Mesh(
        new THREE.TorusGeometry(0.48,0.045,6,20),
        new THREE.MeshBasicMaterial({color:0xfbbf24})
      );
      marker.rotation.x=Math.PI/2;
      marker.position.y=0.08;
      soldier.add(marker);

      soldier.position.set(x,0,z);
      lobbyGroup.add(soldier);

      lobbyNPCs.push({name,x,z,action,group:soldier,marker});
    }

    createLobbySoldier('COMMANDER',0,-38,0x465b4a,'missions');
    createLobbySoldier('QUARTERMASTER',-29,-7,0x59616a,'weapon');
    createLobbySoldier('EQUIPMENT OFFICER',29,-7,0x4d6266,'equipment');
    createLobbySoldier('TRAINING INSTRUCTOR',-29,29,0x59664a,'operator');
    createLobbySoldier('MISSION OFFICER',29,29,0x465363,'missions');
    createLobbySoldier('GARAGE OFFICER',0,42,0x59616a,'inventory');

    // Lobby interaction UI
    let lobbyPrompt = document.getElementById('lobby-interact-prompt');
    if(!lobbyPrompt) {
      lobbyPrompt=document.createElement('div');
      lobbyPrompt.id='lobby-interact-prompt';
      lobbyPrompt.style.cssText='position:fixed;bottom:105px;left:50%;transform:translateX(-50%);z-index:75;background:#101923ee;border:1px solid #eab308;border-radius:10px;padding:12px 16px;color:white;text-align:center;display:none;pointer-events:none;font: bold 13px Arial';
      document.body.appendChild(lobbyPrompt);
    }

    let lobbyInteractButton=document.getElementById('lobby-interact-button');
    if(!lobbyInteractButton) {
      lobbyInteractButton=document.createElement('button');
      lobbyInteractButton.id='lobby-interact-button';
      lobbyInteractButton.textContent='INTERACT';
      lobbyInteractButton.style.cssText='position:fixed;right:22px;bottom:125px;z-index:76;display:none;background:#d97706;color:#111827;border:2px solid #fbbf24;border-radius:12px;padding:15px 20px;font-weight:900';
      document.body.appendChild(lobbyInteractButton);
    }

    let nearestLobbyNPC=null;

    function updateLobbyInteractionPrompt() {
      if(!state.isLobby) {
        lobbyPrompt.style.display='none';
        lobbyInteractButton.style.display='none';
        return;
      }

      let nearest=null;
      let best=4.5;

      for(const npc of lobbyNPCs) {
        const distance=Math.hypot(
          camera.position.x-npc.x,
          camera.position.z-npc.z
        );
        npc.marker.visible=distance<9;
        if(distance<best) {
          best=distance;
          nearest=npc;
        }
      }

      nearestLobbyNPC=nearest;
      if(nearest) {
        lobbyPrompt.textContent='E  •  TALK TO '+nearest.name;
        lobbyPrompt.style.display='block';
        lobbyInteractButton.style.display='block';
      } else {
        lobbyPrompt.style.display='none';
        lobbyInteractButton.style.display='none';
      }
    }

    function interactWithLobbyNPC() {
      if(!state.isLobby || !nearestLobbyNPC) return;

      const npc=nearestLobbyNPC;
      if(npc.action==='weapon') {
        openTacticalShop('ARMORY • Select your tactical weapon loadout.');
      } else {
        showLobbyInteraction(npc.action);
      }
    }

    lobbyInteractButton.addEventListener('click',interactWithLobbyNPC);

    function isLobbyPositionBlocked(x,z) {
      const r=0.55;
      for(const b of lobbyColliders) {
        if(
          x+r>b.x-b.w/2 && x-r<b.x+b.w/2 &&
          z+r>b.z-b.d/2 && z-r<b.z+b.d/2
        ) return true;
      }
      return false;
    }

`;

html = html.replace(
  new RegExp(start.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') +
  '[\\s\\S]*?(?=' +
  end.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + ')'),
  lobby
);

const oldMovement = `      if (state.isLobby) {
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
      }`;

const newMovement = `      if (state.isLobby) {
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
          const nx=THREE.MathUtils.clamp(camera.position.x+dir.x*5.5*dt,-63,63);
          const nz=THREE.MathUtils.clamp(camera.position.z+dir.z*5.5*dt,-63,63);

          if(!isLobbyPositionBlocked(nx,camera.position.z)) camera.position.x=nx;
          if(!isLobbyPositionBlocked(camera.position.x,nz)) camera.position.z=nz;
        }

        camera.position.y=1.75;
        updateLobbyInteractionPrompt();
      }`;

replaceOnce(oldMovement,newMovement,'Lobby movement and collision');

replaceOnce(
`      state.keys[e.code] = true;
      if (!state.isPlaying) return;`,
`      state.keys[e.code] = true;
      if (state.isLobby && (e.code === 'KeyE' || e.code === 'Enter')) {
        interactWithLobbyNPC();
        return;
      }
      if (!state.isPlaying) return;`,
'Keyboard interaction'
);

replaceOnce(
`      const names = {equipment:'EQUIPMENT SHOP',operator:'OPERATOR',inventory:'INVENTORY',missions:'MISSIONS'};
      document.getElementById('lobby-interaction-title').textContent = names[id] || id.toUpperCase();
      document.getElementById('lobby-interaction-message').textContent = 'COMING SOON';`,
`      const names = {
        equipment:'EQUIPMENT OFFICE',
        operator:'TRAINING CENTER',
        inventory:'GARAGE & VEHICLE DEPOT',
        missions:'MISSION COMMAND'
      };
      const messages = {
        equipment:'Equipment services are being prepared for a future deployment.',
        operator:'Training grounds: operator training and combat practice.',
        inventory:'Vehicle and equipment depot. More functions are coming soon.',
        missions:'Mission command: new combat operations will be available here.'
      };
      document.getElementById('lobby-interaction-title').textContent = names[id] || id.toUpperCase();
      document.getElementById('lobby-interaction-message').textContent = messages[id] || 'Facility information.';`,
'NPC facility information'
);

if (!html.includes('WARDOGS MAJOR UPDATE 1 - MILITARY BASE')) {
  throw new Error('Verifikasi lobby gagal.');
}

const backup=file+'.before-major-update-1-'+Date.now()+'.bak';
fs.copyFileSync(file,backup);
fs.writeFileSync(file,html,'utf8');

console.log('MAJOR UPDATE 1 PATCH BERHASIL.');
console.log('Backup:',backup);
