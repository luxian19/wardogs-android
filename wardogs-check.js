    /**
     * WARDOGS: 3-Faction Tactical 3D FPS
     * Expanded Map & Full Mobile Touch Controls implementation
     */

    // ==========================================
    // 1. PROCEDURAL WEB AUDIO SYNTHESIZER (WITH MASTER GAIN & MUTE)
    // ==========================================
    class SoundEngine {
      constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.volume = 0.8;
        this.isMuted = false;
      }

      init() {
        if (!this.ctx) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AudioCtx();
          this.masterGain = this.ctx.createGain();
          this.masterGain.connect(this.ctx.destination);
          this.applyVolume();
        }
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      }

      setVolume(val0to1) {
        this.volume = Math.max(0, Math.min(1, val0to1));
        this.applyVolume();
      }

      setMuted(muted) {
        this.isMuted = Boolean(muted);
        this.applyVolume();
      }

      applyVolume() {
        if (this.masterGain && this.ctx) {
          this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        }
      }

      playGunshot(type = 'pistol') {
        if (!this.ctx || this.isMuted || this.volume <= 0) return;
        const now = this.ctx.currentTime;

        const bufferSize = this.ctx.sampleRate * (type === 'sniper' ? 0.35 : type === 'rocket' ? 0.5 : 0.14);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        if (type === 'smg') filter.frequency.setValueAtTime(2400, now);
        else if (type === 'ar') filter.frequency.setValueAtTime(1800, now);
        else if (type === 'sniper') filter.frequency.setValueAtTime(1200, now);
        else if (type === 'rocket') filter.frequency.setValueAtTime(600, now);
        else filter.frequency.setValueAtTime(2100, now);

        const gain = this.ctx.createGain();
        const vol = type === 'sniper' ? 0.45 : type === 'rocket' ? 0.5 : 0.25;
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + bufferSize / this.ctx.sampleRate);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start(now);

        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = type === 'rocket' ? 'sawtooth' : 'triangle';
        const startFreq = type === 'sniper' ? 160 : type === 'rocket' ? 110 : 190;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.12);

        oscGain.gain.setValueAtTime(vol * 0.8, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.14);
      }

      playExplosion() {
        if (!this.ctx || this.isMuted || this.volume <= 0) return;
        const now = this.ctx.currentTime;
        const duration = 0.75;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(420, now);
        filter.frequency.exponentialRampToValueAtTime(60, now + duration);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.65, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start(now);
      }

      playHitmarker(isKill = false) {
        if (!this.ctx || this.isMuted || this.volume <= 0) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isKill ? 1450 : 950, now);
        osc.frequency.exponentialRampToValueAtTime(isKill ? 1900 : 600, now + 0.06);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.075);
      }

      playCashChaChing() {
        if (!this.ctx || this.isMuted || this.volume <= 0) return;
        const now = this.ctx.currentTime;
        [1046.5, 1318.5].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(0.18, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.26);
        });
      }

      playReload() {
        if (!this.ctx || this.isMuted || this.volume <= 0) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(480, now + 0.12);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.23);
      }
    }

    const sound = new SoundEngine();

    // ==========================================
    // 2. GAME CONFIGURATION & WEAPON ARMORY (620x620 FOREST ARENA)
    // ==========================================
    const ARENA_HALF_SIZE = 290; // 580x580 playable bounds inside 620x620 forest terrain
    const FACTIONS = {
      blue: { name: 'COBALT PMC', short: 'BLUE', colorHex: 0x3b82f6, css: 'text-blue-400', spawn: new THREE.Vector3(0, 2, 205) },
      red:  { name: 'KRASNY CORPS', short: 'RED', colorHex: 0xef4444, css: 'text-red-400', spawn: new THREE.Vector3(-185, 2, -175) },
      gold: { name: 'AURELIA SYNDICATE', short: 'GOLD', colorHex: 0xf59e0b, css: 'text-amber-400', spawn: new THREE.Vector3(185, 2, -175) }
    };

    const ARMORY = [
      {
        id: 'pistol',
        name: 'M9 Tactical Pistol',
        category: 'SIDEARM • SEMI-AUTO',
        price: 0,
        damage: 28,
        fireRate: 0.22,
        magSize: 15,
        reloadTime: 1.1,
        spread: 0.012,
        auto: false,
        zoomFov: 60,
        color: 0x64748b,
        desc: 'Standard issue sidearm. Reliable accuracy & zero cost.'
      },
      {
        id: 'smg',
        name: 'Vityaz-9 SMG',
        category: 'SUBMACHINE GUN • FULL-AUTO',
        price: 600,
        damage: 21,
        fireRate: 0.085,
        magSize: 32,
        reloadTime: 1.35,
        spread: 0.028,
        auto: true,
        zoomFov: 58,
        color: 0x38bdf8,
        desc: 'Rapid close-quarters shredder with high mobility.'
      },
      {
        id: 'ar',
        name: 'AK-12M Assault Rifle',
        category: 'ASSAULT RIFLE • FULL-AUTO',
        price: 1200,
        damage: 34,
        fireRate: 0.115,
        magSize: 30,
        reloadTime: 1.55,
        spread: 0.014,
        auto: true,
        zoomFov: 50,
        color: 0x34d399,
        desc: 'Versatile mid-to-long range Eastern European rifle.'
      },
      {
        id: 'sniper',
        name: 'SV-98 Heavy Sniper',
        category: 'MARKSMAN • BOLT-ACTION',
        price: 2000,
        damage: 115,
        fireRate: 1.15,
        magSize: 5,
        reloadTime: 2.0,
        spread: 0.001,
        auto: false,
        zoomFov: 22,
        isSniper: true,
        color: 0xa78bfa,
        desc: 'High-caliber precision rifle with 3.5x optic scope.'
      },
      {
        id: 'rocket',
        name: 'RPG-32 Launcher',
        category: 'HEAVY ORDNANCE • EXPLOSIVE',
        price: 2800,
        damage: 140,
        fireRate: 1.6,
        magSize: 2,
        reloadTime: 2.3,
        spread: 0.01,
        auto: false,
        zoomFov: 55,
        isRocket: true,
        color: 0xf87171,
        desc: 'Fires explosive warheads. Obliterates cover & squads.'
      },
      {
        id: 'armor',
        name: 'Kevlar Plate Vest (+50)',
        category: 'DEFENSIVE GEAR • CONSUMABLE',
        price: 500,
        isUtility: 'armor',
        color: 0x22d3ee,
        desc: 'Restores +50 Kevlar Armor (up to 100 max shield).'
      },
      {
        id: 'barricade',
        name: 'Deployable Cover Kit',
        category: 'FORTIFICATION • PRESS [F]',
        price: 400,
        isUtility: 'barricade',
        color: 0xfbbf24,
        desc: 'Adds +1 concrete/sandbag barrier to deploy in combat.'
      }
    ];

    // ==========================================
    // 3. GLOBAL GAME STATE, SETTINGS & MOBILE INPUTS
    // ==========================================
    const state = {
      isPlaying: false,
      isLobby: false,
      isGameOver: false,
      cash: 1000,
      ownedWeapons: new Set(['pistol']),
      equippedWeaponId: 'pistol',
      ammo: 15,
      isReloading: false,
      reloadTimer: 0,
      lastShotTime: 0,
      isMouseDown: false,
      fireTouchId: null,
      isAiming: false,

      hp: 100,
      maxHp: 100,
      armor: 50,
      maxArmor: 100,
      barricadeKits: 1,
      isDead: false,

      kills: 0,
      zoneCaptures: 0,
      zoneTickAccumulator: 0,

      scores: { blue: 0, red: 0, gold: 0 },
      zoneOwner: 'neutral',

      // User Configurable Settings
      sensitivity: 1.0,
      volume: 80,
      isMuted: false,

      // Movement & Touch Physics
      velocity: new THREE.Vector3(),
      canJump: false,
      keys: {},

      // Mobile Touch Joystick State
      touchJoystick: {
        active: false,
        identifier: null,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        dirX: 0,
        dirY: 0
      },

      // Mobile Touch Look State
      touchLook: {
        active: false,
        identifier: null,
        lastX: 0,
        lastY: 0
      }
    };

    // Detect Mobile device for auto-showing touch controls
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024;

    // ==========================================
    // 4. THREE.JS SCENE, RENDERER & OVERCAST SKY ATMOSPHERE
    // ==========================================
    const canvas = document.getElementById('game-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    // Overcast moody forest sky & atmospheric mist
    const overcastColor = 0x566473;
    scene.background = new THREE.Color(overcastColor);
    scene.fog = new THREE.FogExp2(overcastColor, 0.0038);

    const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 750);
    camera.rotation.order = 'YXZ';
    scene.add(camera);

    // Overcast Diffused Sky Lighting
    const hemiLight = new THREE.HemisphereLight(0xcbd5e1, 0x263524, 0.95);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xdbeafe, 0.85);
    dirLight.position.set(110, 150, 90);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 650;
    const d = 300;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    // ==========================================
    // 5. FIRST-PERSON 3D WEAPON VIEWMODEL & FORWARD MUZZLE FLASH
    // ==========================================
    const weaponHolder = new THREE.Group();
    camera.add(weaponHolder);

    let weaponMeshGroup = new THREE.Group();
    weaponHolder.add(weaponMeshGroup);

    // Attach muzzle flash directly to camera so it stays in front of barrel even when scoped
    const muzzleFlashLight = new THREE.PointLight(0xfbbf24, 0, 10);
    muzzleFlashLight.position.set(0.24, -0.14, -1.1);
    camera.add(muzzleFlashLight);

    const muzzleFlashMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0 })
    );
    muzzleFlashMesh.position.set(0.24, -0.14, -0.95);
    camera.add(muzzleFlashMesh);

    let weaponRecoilOffset = 0;
    let weaponBobTimer = 0;

    function buildWeaponViewmodel(weaponId) {
      while (weaponMeshGroup.children.length > 0) {
        weaponMeshGroup.remove(weaponMeshGroup.children[0]);
      }

      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.75 });
      const accentMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5, metalness: 0.6 });
      const gripMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });

      if (weaponId === 'pistol') {
        const slide = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.075, 0.28), bodyMat);
        const grip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.075), gripMat);
        grip.position.set(0, -0.08, 0.08);
        grip.rotation.x = 0.22;
        weaponMeshGroup.add(slide, grip);
      } else if (weaponId === 'smg') {
        const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.1, 0.38), bodyMat);
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.16, 8), accentMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.01, -0.25);
        const mag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.055), gripMat);
        mag.position.set(0, -0.11, -0.05);
        mag.rotation.x = -0.15;
        weaponMeshGroup.add(receiver, barrel, mag);
      } else if (weaponId === 'ar') {
        const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.105, 0.52), bodyMat);
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.24, 8), accentMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.015, -0.36);
        const mag = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.2, 0.075), new THREE.MeshStandardMaterial({ color: 0x92400e }));
        mag.position.set(0, -0.12, -0.06);
        mag.rotation.x = -0.25;
        const optic = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.045, 0.12), accentMat);
        optic.position.set(0, 0.075, 0.04);
        weaponMeshGroup.add(receiver, barrel, mag, optic);
      } else if (weaponId === 'sniper') {
        const stock = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.1, 0.68), new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.7 }));
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.018, 0.42, 8), bodyMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.02, -0.52);
        const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.028, 0.28, 12), gripMat);
        scope.rotation.x = Math.PI / 2;
        scope.position.set(0, 0.085, -0.02);
        weaponMeshGroup.add(stock, barrel, scope);
      } else if (weaponId === 'rocket') {
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.85, 12), new THREE.MeshStandardMaterial({ color: 0x365314, roughness: 0.6 }));
        tube.rotation.x = Math.PI / 2;
        const warhead = new THREE.Mesh(new THREE.ConeGeometry(0.062, 0.16, 12), new THREE.MeshStandardMaterial({ color: 0xb91c1c }));
        warhead.rotation.x = -Math.PI / 2;
        warhead.position.set(0, 0, -0.49);
        weaponMeshGroup.add(tube, warhead);
      }

      weaponMeshGroup.position.set(0.26, -0.22, -0.45);
    }

    buildWeaponViewmodel('pistol');

    // ==========================================
    // 6. EXPANDED 420x420 OVERCAST FOREST MAP, TREES & BUNKERS
    // ==========================================
    const colliders = [];
    const destructibles = [];
    const ZONE_RADIUS = 18.0;
    let zoneRingMesh, zoneFloorMesh, zoneBeaconLight;

    function createOvercastSkyDome() {
      // Procedural Overcast Cloud Layer Dome
      const cloudCanvas = document.createElement('canvas');
      cloudCanvas.width = 512;
      cloudCanvas.height = 256;
      const ctx = cloudCanvas.getContext('2d');

      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, '#364152');
      grad.addColorStop(0.55, '#526071');
      grad.addColorStop(1, '#687788');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 256);

      // Soft brooding cloud puffs
      for (let i = 0; i < 160; i++) {
        const cx = Math.random() * 512;
        const cy = Math.random() * 210;
        const r = 18 + Math.random() * 55;
        const cGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
        const shade = Math.random() > 0.45 ? 'rgba(30, 41, 59, 0.28)' : 'rgba(203, 213, 225, 0.16)';
        cGrad.addColorStop(0, shade);
        cGrad.addColorStop(1, 'rgba(86, 100, 115, 0)');
        ctx.fillStyle = cGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      const skyTex = new THREE.CanvasTexture(cloudCanvas);
      const skyGeo = new THREE.SphereGeometry(520, 24, 16);
      const skyMat = new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false });
      const skyDome = new THREE.Mesh(skyGeo, skyMat);
      scene.add(skyDome);
    }

    function createExpandedForestMap() {
      createOvercastSkyDome();

      // Procedural Mossy Forest Floor Texture (620 x 620)
      const groundCanvas = document.createElement('canvas');
      groundCanvas.width = 512;
      groundCanvas.height = 512;
      const gCtx = groundCanvas.getContext('2d');
      gCtx.fillStyle = '#253322';
      gCtx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 6500; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const colors = ['#1e2b1b', '#2e3f28', '#364429', '#2b2923', '#1a2417'];
        gCtx.fillStyle = colors[i % colors.length];
        gCtx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3);
      }
      const groundTex = new THREE.CanvasTexture(groundCanvas);
      groundTex.wrapS = THREE.RepeatWrapping;
      groundTex.wrapT = THREE.RepeatWrapping;
      groundTex.repeat.set(50, 50);

      const groundGeo = new THREE.PlaneGeometry(620, 620);
      const groundMat = new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.95, metalness: 0.04 });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Forest Dirt Clearing & Trail Crossroad around Central Zone
      const clearingGeo = new THREE.CircleGeometry(28, 36);
      const clearingMat = new THREE.MeshStandardMaterial({ color: 0x3b352c, roughness: 0.95 });
      const clearing = new THREE.Mesh(clearingGeo, clearingMat);
      clearing.rotation.x = -Math.PI / 2;
      clearing.position.y = 0.02;
      clearing.receiveShadow = true;
      scene.add(clearing);

      // Outer Perimeter Timber & Earthwork Ridge Walls (400 x 400)
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x2c302e, roughness: 0.9 });
      const addStaticBox = (x, y, z, w, h, d, mat = wallMat) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        const box3 = new THREE.Box3().setFromObject(mesh);
        colliders.push({ mesh, box: box3, isStatic: true });
        return mesh;
      };

      addStaticBox(0, 6, -292, 588, 12, 4);
      addStaticBox(0, 6, 292, 588, 12, 4);
      addStaticBox(-292, 6, 0, 4, 12, 588);
      addStaticBox(292, 6, 0, 4, 12, 588);

      // Distant Misty Forest Mountains
      const mountainMat = new THREE.MeshStandardMaterial({ color: 0x26313a, roughness: 1 });
      for (let i = 0; i < 44; i++) {
        const angle = (i / 44) * Math.PI * 2;
        const dist = 340 + (i % 5) * 24;
        const radius = 44 + (i % 5) * 14;
        const height = 65 + (i % 6) * 18;
        const peak = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 7), mountainMat);
        peak.position.set(Math.cos(angle) * dist, height / 2 - 3, Math.sin(angle) * dist);
        peak.rotation.y = i * 0.65;
        scene.add(peak);
      }

      // Procedural Pine & Birch Forest Trees across the 580x580 map
      const pineTrunkMat = new THREE.MeshStandardMaterial({ color: 0x3b281c, roughness: 0.9 });
      const birchTrunkMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.85 });
      const pineFoliageDark = new THREE.MeshStandardMaterial({ color: 0x163020, roughness: 0.85 });
      const pineFoliageMid = new THREE.MeshStandardMaterial({ color: 0x1f3d28, roughness: 0.85 });
      const birchFoliageMat = new THREE.MeshStandardMaterial({ color: 0x3f5e2a, roughness: 0.8 });

      const spawnPositions = [FACTIONS.blue.spawn, FACTIONS.red.spawn, FACTIONS.gold.spawn];
      let seed = 1337;
      const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };

      for (let i = 0; i < 300; i++) {
        const tx = (rand() - 0.5) * 550;
        const tz = (rand() - 0.5) * 550;

        // Keep central Control Zone clearing open (radius > 23)
        if (Math.hypot(tx, tz) < 23) continue;

        // Keep faction spawn pads clear
        let nearSpawn = false;
        for (const sp of spawnPositions) {
          if (Math.hypot(tx - sp.x, tz - sp.z) < 16) {
            nearSpawn = true;
            break;
          }
        }
        if (nearSpawn) continue;

        const isBirch = i % 4 === 0;
        const scale = 0.85 + rand() * 0.75;
        const treeGroup = new THREE.Group();
        treeGroup.position.set(tx, 0, tz);

        const trunkH = (isBirch ? 6.5 : 5.5) * scale;
        const trunkR = (isBirch ? 0.24 : 0.34) * scale;
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(trunkR * 0.7, trunkR, trunkH, 7),
          isBirch ? birchTrunkMat : pineTrunkMat
        );
        trunk.position.y = trunkH / 2;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        treeGroup.add(trunk);

        if (isBirch) {
          const crown1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.1 * scale, 1), birchFoliageMat);
          crown1.position.set(0, trunkH + 0.8 * scale, 0);
          crown1.castShadow = true;
          const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5 * scale, 1), birchFoliageMat);
          crown2.position.set(0.6 * scale, trunkH + 2.1 * scale, 0.4 * scale);
          treeGroup.add(crown1, crown2);
        } else {
          // Layered Evergreen Pine Cones
          for (let tier = 0; tier < 3; tier++) {
            const coneR = (2.6 - tier * 0.62) * scale;
            const coneH = (3.4 - tier * 0.45) * scale;
            const cone = new THREE.Mesh(
              new THREE.ConeGeometry(coneR, coneH, 7),
              tier % 2 === 0 ? pineFoliageDark : pineFoliageMid
            );
            cone.position.y = (3.4 + tier * 2.1) * scale;
            cone.rotation.y = tier * 0.8;
            cone.castShadow = true;
            treeGroup.add(cone);
          }
        }

        scene.add(treeGroup);

        // Trunk collider box
        const trunkBox = new THREE.Box3(
          new THREE.Vector3(tx - trunkR * 1.15, 0, tz - trunkR * 1.15),
          new THREE.Vector3(tx + trunkR * 1.15, 4.5, tz + trunkR * 1.15)
        );
        colliders.push({ mesh: trunk, box: trunkBox, isStatic: true });
      }

      // Forest Boulders & Fallen Logs
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.9 });
      const boulderCoords = [
        [-32, 14], [34, -18], [-48, -36], [52, 42], [-78, 22], [82, -26],
        [-24, 58], [28, -62], [-95, -65], [98, 68], [-115, 45], [112, -48]
      ];
      boulderCoords.forEach(([bx, bz], idx) => {
        const bw = 2.8 + (idx % 3) * 1.1;
        const bh = 1.9 + (idx % 2) * 0.8;
        const bd = 2.5 + ((idx + 1) % 3) * 0.9;
        addStaticBox(bx, bh / 2, bz, bw, bh, bd, rockMat);
      });

      // Tactical Forest Outpost Bunkers & Watchtowers
      const bunkerMat = new THREE.MeshStandardMaterial({ color: 0x3f4742, roughness: 0.85 });
      const towerMat = new THREE.MeshStandardMaterial({ color: 0x3b2f26, roughness: 0.85 });

      // Tactical Concrete/Timber Bunkers around the forest perimeter
      addStaticBox(-65, 3.5, 25, 12, 7, 22, bunkerMat);
      addStaticBox(65, 3.5, 25, 12, 7, 22, bunkerMat);
      addStaticBox(-65, 3.5, -55, 12, 7, 22, bunkerMat);
      addStaticBox(65, 3.5, -55, 12, 7, 22, bunkerMat);

      // Wooden Forest Watchtowers
      addStaticBox(-110, 7, -110, 6, 14, 6, towerMat);
      addStaticBox(110, 7, -110, 6, 14, 6, towerMat);
      addStaticBox(-110, 7, 110, 6, 14, 6, towerMat);
      addStaticBox(110, 7, 110, 6, 14, 6, towerMat);

      // Center Control Zone Ring & Beacon
      const zoneGeo = new THREE.RingGeometry(ZONE_RADIUS - 0.6, ZONE_RADIUS, 48);
      const zoneMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide });
      zoneRingMesh = new THREE.Mesh(zoneGeo, zoneMat);
      zoneRingMesh.rotation.x = -Math.PI / 2;
      zoneRingMesh.position.y = 0.06;
      scene.add(zoneRingMesh);

      const zoneFloorGeo = new THREE.CircleGeometry(ZONE_RADIUS - 0.6, 48);
      const zoneFloorMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.14,
        side: THREE.DoubleSide
      });
      zoneFloorMesh = new THREE.Mesh(zoneFloorGeo, zoneFloorMat);
      zoneFloorMesh.rotation.x = -Math.PI / 2;
      zoneFloorMesh.position.y = 0.04;
      scene.add(zoneFloorMesh);

      zoneBeaconLight = new THREE.PointLight(0xfbbf24, 1.8, 34);
      zoneBeaconLight.position.set(0, 5, 0);
      scene.add(zoneBeaconLight);

      // Central Forest Stone Monument Pillar
      addStaticBox(0, 2, 0, 3.6, 4, 3.6, rockMat);

      // Scatter Destructible Supply Crates across the forest clearing & trails
      const cratePositions = [
        [-10, 1, 10], [10, 1, 10], [-10, 1, -10], [10, 1, -10],
        [-25, 1, 0], [25, 1, 0], [0, 1, 25], [0, 1, -25],
        [-40, 1, -30], [40, 1, -30], [-25, 1, 45], [25, 1, 45],
        [-75, 1, 0], [75, 1, 0], [0, 1, -75], [0, 1, 75],
        [-85, 1, -65], [85, 1, -65], [-85, 1, 65], [85, 1, 65]
      ];
      cratePositions.forEach(([cx, cy, cz]) => {
        spawnDestructibleCover(new THREE.Vector3(cx, cy, cz), 0, 'crate');
      });
    }

    function spawnDestructibleCover(pos, rotY = 0, kind = 'crate') {
      const isBarricade = kind === 'barricade';
      const w = isBarricade ? 3.2 : 2.1;
      const h = isBarricade ? 1.5 : 2.0;
      const d = isBarricade ? 0.85 : 2.1;

      const mat = new THREE.MeshStandardMaterial({
        color: isBarricade ? 0xd97706 : 0x92400e,
        roughness: 0.85
      });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      mesh.position.set(pos.x, h / 2, pos.z);
      mesh.rotation.y = rotY;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);

      const box = new THREE.Box3().setFromObject(mesh);
      const item = {
        mesh,
        box,
        hp: isBarricade ? 180 : 100,
        maxHp: isBarricade ? 180 : 100,
        kind
      };
      destructibles.push(item);
      return item;
    }

    function damageDestructible(item, amount) {
      item.hp -= amount;
      const ratio = Math.max(0.2, item.hp / item.maxHp);
      item.mesh.material.color.setRGB(
        (item.kind === 'barricade' ? 0.85 : 0.57) * ratio,
        (item.kind === 'barricade' ? 0.46 : 0.25) * ratio,
        0.06 * ratio
      );

      if (item.hp <= 0) {
        spawnParticles(item.mesh.position, item.kind === 'barricade' ? 0xd97706 : 0x92400e, 14);
        scene.remove(item.mesh);
        const idx = destructibles.indexOf(item);
        if (idx !== -1) destructibles.splice(idx, 1);
      }
    }

    createExpandedForestMap();

    // ==========================================
    // 7. PARTICLES, TRACERS & EXPLOSIONS
    // ==========================================
    const activeTracers = [];
    const activeParticles = [];

    function spawnBulletTracer(startPos, endPos, colorHex = 0xfef08a) {
      const points = [startPos.clone(), endPos.clone()];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ color: colorHex, transparent: true, opacity: 0.85 });
      const line = new THREE.Line(geo, mat);
      scene.add(line);
      activeTracers.push({ line, life: 0.1 });
    }

    function spawnParticles(origin, colorHex, count = 10, speedScale = 6) {
      const geo = new THREE.BoxGeometry(0.16, 0.16, 0.16);
      const mat = new THREE.MeshBasicMaterial({ color: colorHex });
      for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(origin);
        const vel = new THREE.Vector3(
          (Math.random() - 0.5) * speedScale,
          Math.random() * speedScale * 0.8 + 1.5,
          (Math.random() - 0.5) * speedScale
        );
        scene.add(mesh);
        activeParticles.push({ mesh, vel, life: 0.45 + Math.random() * 0.25 });
      }
    }

    function triggerRocketExplosion(pos, attackerName, attackerFaction) {
      sound.playExplosion();
      spawnParticles(pos, 0xf97316, 28, 13);
      spawnParticles(pos, 0xfacc15, 16, 9);

      const radius = 9.0;
      for (let i = destructibles.length - 1; i >= 0; i--) {
        const d = destructibles[i];
        const dist = d.mesh.position.distanceTo(pos);
        if (dist <= radius) {
          damageDestructible(d, 220 * (1 - dist / radius));
        }
      }

      bots.forEach(bot => {
        if (bot.isDead || bot.faction === attackerFaction) return;
        const dist = bot.group.position.distanceTo(pos);
        if (dist <= radius) {
          const dmg = Math.round(160 * (1 - dist / (radius + 1)));
          damageBot(bot, dmg, attackerName, attackerFaction);
          if (attackerFaction === 'blue') triggerHitmarker(bot.hp <= 0);
        }
      });

      if (attackerFaction !== 'blue' && !state.isDead) {
        const dist = camera.position.distanceTo(pos);
        if (dist <= radius) {
          damagePlayer(Math.round(95 * (1 - dist / (radius + 1))), attackerName, attackerFaction);
        }
      }
    }

    // ==========================================
    // 8. 3-FACTION AI MERCENARY BOTS
    // ==========================================
    const bots = [];

    function createBotMesh(factionKey) {
      const fData = FACTIONS[factionKey];
      const group = new THREE.Group();

      const torso = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 1.05, 0.45),
        new THREE.MeshStandardMaterial({ color: fData.colorHex, roughness: 0.5 })
      );
      torso.position.y = 1.15;
      torso.castShadow = true;
      group.add(torso);

      const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
      const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.7, 0.32), legMat);
      leftLeg.position.set(-0.2, 0.35, 0);
      const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.7, 0.32), legMat);
      rightLeg.position.set(0.2, 0.35, 0);
      group.add(leftLeg, rightLeg);

      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.44, 0.44, 0.44),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
      );
      head.position.y = 1.92;
      head.castShadow = true;
      group.add(head);

      const visor = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.14, 0.06),
        new THREE.MeshBasicMaterial({ color: fData.colorHex })
      );
      visor.position.set(0, 1.94, 0.21);
      group.add(visor);

      const gun = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.12, 0.65),
        new THREE.MeshStandardMaterial({ color: 0x334155 })
      );
      gun.position.set(0.38, 1.32, 0.28);
      group.add(gun);

      const marker = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.18, 0),
        new THREE.MeshBasicMaterial({ color: fData.colorHex })
      );
      marker.position.y = 2.55;
      group.add(marker);

      return { group, head, torso, marker };
    }

    function initBots() {
      // 4 Blue Allies + 5 Red Enemies + 5 Gold Enemies = 14 AI Bots
      const roster = [
        { faction: 'blue', name: 'Cobalt_Alpha' },
        { faction: 'blue', name: 'Cobalt_Bravo' },
        { faction: 'blue', name: 'Cobalt_Viper' },
        { faction: 'blue', name: 'Cobalt_Ghost' },
        { faction: 'red', name: 'Krasny_01' },
        { faction: 'red', name: 'Krasny_02' },
        { faction: 'red', name: 'Krasny_Wolf' },
        { faction: 'red', name: 'Krasny_Bear' },
        { faction: 'red', name: 'Krasny_Vanguard' },
        { faction: 'gold', name: 'Aurelia_01' },
        { faction: 'gold', name: 'Aurelia_02' },
        { faction: 'gold', name: 'Aurelia_Hawk' },
        { faction: 'gold', name: 'Aurelia_Rex' },
        { faction: 'gold', name: 'Aurelia_Prime' }
      ];

      roster.forEach((info, idx) => {
        const meshes = createBotMesh(info.faction);
        const spawnBase = FACTIONS[info.faction].spawn;
        meshes.group.position.set(
          spawnBase.x + ((idx % 4) - 1.5) * 5.0,
          0,
          spawnBase.z + (Math.floor(idx / 4) - 1) * 5.0
        );
        scene.add(meshes.group);

        bots.push({
          ...info,
          ...meshes,
          hp: 100,
          maxHp: 100,
          isDead: false,
          respawnTimer: 0,
          fireCooldown: Math.random() * 1.2,
          strafeDir: Math.random() > 0.5 ? 1 : -1,
          strafeTimer: 1 + Math.random() * 2
        });
      });
    }

    initBots();


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
      arenaSceneObjects.forEach(obj => { obj.visible = false; });
      lobbyGroup.visible = true;
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

    function showLobbyInteraction(id) {
      const names = {
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
      document.getElementById('lobby-interaction-message').textContent = messages[id] || 'Facility information.';
      const panel = document.getElementById('lobby-interaction');
      panel.classList.remove('hidden');
      panel.style.display = 'flex';
    }

    function closeLobbyInteraction() {
      const panel = document.getElementById('lobby-interaction');
      panel.classList.add('hidden');
      panel.style.display = 'none';
    }

    document.getElementById('lobby-interaction-close').addEventListener('click', closeLobbyInteraction);
    document.getElementById('lobby-interaction').addEventListener('click', e => {
      if (e.target.id === 'lobby-interaction') closeLobbyInteraction();
    });

    ['equipment','operator','inventory','missions'].forEach(id=>{
      document.getElementById('lobby-'+id).addEventListener('click',()=>showLobbyInteraction(id));
    });

    document.getElementById('lobby-battle').addEventListener('click',()=>{
      state.isLobby = false;
      lobbyUI.classList.add('hidden');
      document.body.classList.remove('lobby-mode');
      mobileControls.classList.add('hidden');
      if(document.pointerLockElement) document.exitPointerLock();
      arenaSceneObjects.forEach(obj => { obj.visible = true; });
      lobbyGroup.visible = false;
      respawnPlayer();
      deployBtn.click();
    });


    function damageBot(bot, amount, attackerName, attackerFaction) {
      if (bot.isDead) return;
      bot.hp -= amount;
      spawnParticles(bot.group.position.clone().add(new THREE.Vector3(0, 1.3, 0)), FACTIONS[bot.faction].colorHex, 6);

      if (bot.hp <= 0) {
        bot.isDead = true;
        bot.respawnTimer = 4.5;
        bot.group.visible = false;
        addKillfeedEntry(attackerName, attackerFaction, bot.name, bot.faction);

        if (attackerName === 'You') {
          state.kills++;
          addCash(150, '+$150 ELIMINATION BONUS');
        }
      }
    }

    // ==========================================
    // 9. PLAYER CONTROLS, SHOOTING & SHOP LOGIC
    // ==========================================
    const menuOverlay = document.getElementById('menu-overlay');
    const hud = document.getElementById('hud');
    const mobileControls = document.getElementById('mobile-controls');
    const deployBtn = document.getElementById('deploy-btn');

    function addCash(amount, reasonText = '') {
      state.cash += amount;
      updateHUD();
      updateShopUI();
      if (reasonText) {
        sound.playCashChaChing();
        const toast = document.getElementById('cash-toast');
        toast.textContent = reasonText;
        toast.classList.remove('opacity-0', 'translate-y-2');
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
          toast.classList.add('opacity-0', 'translate-y-2');
        }, 2100);
      }
    }

    function addKillfeedEntry(killer, killerFaction, victim, victimFaction) {
      const feed = document.getElementById('killfeed');
      const item = document.createElement('div');
      item.className = 'tactical-panel px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 shadow';
      const kColor = FACTIONS[killerFaction].css;
      const vColor = FACTIONS[victimFaction].css;
      item.innerHTML = `
        <span class="${kColor} font-bold">[${FACTIONS[killerFaction].short}] ${killer}</span>
        <span class="text-slate-400">eliminated</span>
        <span class="${vColor} font-bold">${victim}</span>
      `;
      feed.prepend(item);
      if (feed.children.length > 5) {
        feed.removeChild(feed.lastChild);
      }
      setTimeout(() => {
        if (item.parentNode) item.remove();
      }, 6000);
    }

    function triggerHitmarker(isKill = false) {
      sound.playHitmarker(isKill);
      const hm = document.getElementById('hitmarker');
      hm.classList.remove('opacity-0');
      clearTimeout(hm._t);
      hm._t = setTimeout(() => hm.classList.add('opacity-0'), 110);
    }

    function damagePlayer(amount, attackerName, attackerFaction) {
      if (state.isDead || state.isGameOver) return;

      if (state.armor > 0) {
        const absorbed = Math.min(state.armor, Math.ceil(amount * 0.65));
        state.armor -= absorbed;
        amount -= absorbed;
      }
      state.hp = Math.max(0, state.hp - amount);

      const vig = document.getElementById('damage-vignette');
      vig.classList.remove('opacity-0');
      clearTimeout(vig._t);
      vig._t = setTimeout(() => vig.classList.add('opacity-0'), 180);

      updateHUD();

      if (state.hp <= 0) {
        state.isDead = true;
        addKillfeedEntry(attackerName, attackerFaction, 'You', 'blue');
        openTacticalShop('YOU WERE ELIMINATED! Buy gear or redeploy to assist Blue Team.');
      }
    }

    function respawnPlayer() {
      state.isDead = false;
      state.hp = 100;
      const w = ARMORY.find(item => item.id === state.equippedWeaponId);
      state.ammo = w.magSize;
      state.isReloading = false;
      document.getElementById('reload-indicator').classList.add('hidden');

      const sp = FACTIONS.blue.spawn;
      camera.position.set(sp.x + (Math.random() - 0.5) * 8, 1.75, sp.z + (Math.random() - 0.5) * 6);
      camera.rotation.set(0, 0, 0);
      state.velocity.set(0, 0, 0);
      updateHUD();
    }

    function openTacticalShop(bannerMessage = null) {
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
    }

    function updateShopUI() {
      document.getElementById('shop-cash').textContent = `$${state.cash.toLocaleString()}`;
      const grid = document.getElementById('shop-items-grid');
      grid.innerHTML = '';

      ARMORY.forEach(item => {
        const isOwned = state.ownedWeapons.has(item.id);
        const isEquipped = state.equippedWeaponId === item.id;
        const canAfford = state.cash >= item.price;

        let btnText = '';
        let btnClass = '';
        let disabled = false;

        if (item.isUtility === 'armor') {
          if (state.armor >= state.maxArmor) {
            btnText = 'ARMOR FULL';
            btnClass = 'bg-slate-800 text-slate-500 cursor-not-allowed';
            disabled = true;
          } else if (!canAfford) {
            btnText = `BUY ($${item.price})`;
            btnClass = 'bg-slate-800 text-slate-500 cursor-not-allowed';
            disabled = true;
          } else {
            btnText = `BUY +50 ARMOR ($${item.price})`;
            btnClass = 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold cursor-pointer';
          }
        } else if (item.isUtility === 'barricade') {
          if (!canAfford) {
            btnText = `BUY KIT ($${item.price})`;
            btnClass = 'bg-slate-800 text-slate-500 cursor-not-allowed';
            disabled = true;
          } else {
            btnText = `BUY KIT ($${item.price}) [Owned: ${state.barricadeKits}]`;
            btnClass = 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer';
          }
        } else {
          if (isEquipped) {
            btnText = 'EQUIPPED';
            btnClass = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 cursor-default';
            disabled = true;
          } else if (isOwned) {
            btnText = 'EQUIP WEAPON';
            btnClass = 'bg-blue-500 hover:bg-blue-400 text-white font-bold cursor-pointer';
          } else if (!canAfford) {
            btnText = `LOCKED ($${item.price.toLocaleString()})`;
            btnClass = 'bg-slate-800 text-slate-500 cursor-not-allowed';
            disabled = true;
          } else {
            btnText = `UNLOCK & EQUIP ($${item.price.toLocaleString()})`;
            btnClass = 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer';
          }
        }

        const card = document.createElement('div');
        card.className = `p-3.5 rounded-xl bg-slate-900/90 border ${isEquipped ? 'border-emerald-500/70' : 'border-slate-700/80'} flex flex-col justify-between gap-2.5`;
        card.innerHTML = `
          <div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">${item.category}</span>
              <span class="text-xs font-extrabold ${item.price === 0 ? 'text-slate-300' : 'text-emerald-400'}">
                ${item.price === 0 ? 'FREE' : '$' + item.price.toLocaleString()}
              </span>
            </div>
            <div class="text-base font-bold text-white mt-0.5">${item.name}</div>
            <p class="text-xs text-slate-400 mt-1 leading-relaxed">${item.desc}</p>
          </div>
          <button ${disabled ? 'disabled' : ''} class="tactical-btn w-full py-2 px-3 rounded-lg text-xs uppercase tracking-wider ${btnClass}">
            ${btnText}
          </button>
        `;

        const btn = card.querySelector('button');
        btn.addEventListener('click', () => handleShopPurchase(item));
        grid.appendChild(card);
      });
    }

    function handleShopPurchase(item) {
      sound.init();
      if (item.isUtility === 'armor') {
        if (state.cash >= item.price && state.armor < state.maxArmor) {
          state.cash -= item.price;
          state.armor = Math.min(state.maxArmor, state.armor + 50);
          sound.playCashChaChing();
        }
      } else if (item.isUtility === 'barricade') {
        if (state.cash >= item.price) {
          state.cash -= item.price;
          state.barricadeKits += 1;
          sound.playCashChaChing();
        }
      } else {
        if (state.ownedWeapons.has(item.id)) {
          equipWeapon(item.id);
        } else if (state.cash >= item.price) {
          state.cash -= item.price;
          state.ownedWeapons.add(item.id);
          sound.playCashChaChing();
          equipWeapon(item.id);
        }
      }
      updateHUD();
      updateShopUI();
    }

    function equipWeapon(weaponId) {
      const w = ARMORY.find(i => i.id === weaponId);
      if (!w) return;
      state.equippedWeaponId = weaponId;
      state.ammo = w.magSize;
      state.isReloading = false;
      document.getElementById('reload-indicator').classList.add('hidden');
      buildWeaponViewmodel(weaponId);
      updateHUD();
    }

    function startReload() {
      const w = ARMORY.find(i => i.id === state.equippedWeaponId);
      if (state.isReloading || state.ammo === w.magSize) return;
      state.isReloading = true;
      state.reloadTimer = w.reloadTime;
      setAiming(false);
      sound.playReload();
      document.getElementById('reload-indicator').classList.remove('hidden');
    }

    function deployBarricade() {
      if (state.barricadeKits <= 0 || state.isDead || !state.isPlaying) return;
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      forward.y = 0;
      forward.normalize();

      const spawnPos = camera.position.clone().addScaledVector(forward, 3.2);
      spawnPos.y = 0;

      if (spawnPos.length() < 2.6) return;

      spawnDestructibleCover(spawnPos, camera.rotation.y, 'barricade');
      state.barricadeKits--;
      sound.playReload();
      updateHUD();
    }

    function setAiming(aim) {
      state.isAiming = aim;
      const w = ARMORY.find(i => i.id === state.equippedWeaponId);
      const scope = document.getElementById('sniper-scope');
      if (aim && w.isSniper && state.isPlaying) {
        scope.classList.remove('hidden');
        weaponHolder.visible = false;
        // Center muzzle flash directly along the forward barrel axis in front of camera
        muzzleFlashMesh.position.set(0, -0.06, -1.25);
        muzzleFlashLight.position.set(0, -0.06, -1.4);
      } else {
        scope.classList.add('hidden');
        weaponHolder.visible = true;
        if (aim) {
          muzzleFlashMesh.position.set(0, -0.08, -1.05);
          muzzleFlashLight.position.set(0, -0.08, -1.2);
        } else {
          muzzleFlashMesh.position.set(0.24, -0.14, -0.95);
          muzzleFlashLight.position.set(0.24, -0.14, -1.1);
        }
      }
    }

    function fireWeapon() {
      if (!state.isPlaying || state.isDead || state.isReloading || state.isGameOver) return;
      const now = performance.now() / 1000;
      const w = ARMORY.find(i => i.id === state.equippedWeaponId);
      if (now - state.lastShotTime < w.fireRate) return;

      if (state.ammo <= 0) {
        startReload();
        return;
      }

      state.lastShotTime = now;
      state.ammo--;
      updateHUD();

      sound.playGunshot(w.id);
      weaponRecoilOffset = w.isRocket ? 0.16 : w.isSniper ? 0.14 : 0.065;
      camera.rotation.x += w.isSniper ? 0.032 : 0.011;

      muzzleFlashLight.intensity = 3.5;
      muzzleFlashMesh.material.opacity = 0.95;
      setTimeout(() => {
        muzzleFlashLight.intensity = 0;
        muzzleFlashMesh.material.opacity = 0;
      }, 45);

      const spreadFactor = state.isAiming ? w.spread * 0.25 : w.spread;
      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * spreadFactor,
        (Math.random() - 0.5) * spreadFactor,
        -1
      ).normalize().applyQuaternion(camera.quaternion);

      const raycaster = new THREE.Raycaster(camera.position.clone(), dir, 0.2, 360);

      const targetMeshes = [];
      colliders.forEach(c => targetMeshes.push(c.mesh));
      destructibles.forEach(d => targetMeshes.push(d.mesh));
      bots.forEach(b => {
        if (!b.isDead) {
          targetMeshes.push(b.torso, b.head);
        }
      });

      const intersects = raycaster.intersectObjects(targetMeshes, false);
      const muzzleWorldPos = new THREE.Vector3();
      muzzleFlashMesh.getWorldPosition(muzzleWorldPos);

      let hitPoint = camera.position.clone().addScaledVector(dir, 220);
      if (intersects.length > 0) {
        const hit = intersects[0];
        hitPoint.copy(hit.point);

        const hitBot = bots.find(b => !b.isDead && (b.torso === hit.object || b.head === hit.object));
        if (hitBot) {
          const isHeadshot = hit.object === hitBot.head;
          const finalDamage = isHeadshot ? Math.round(w.damage * 1.65) : w.damage;
          damageBot(hitBot, finalDamage, 'You', 'blue');
          triggerHitmarker(hitBot.hp <= 0);
        } else {
          const hitDest = destructibles.find(d => d.mesh === hit.object);
          if (hitDest) {
            damageDestructible(hitDest, w.damage);
          }
          spawnParticles(hitPoint, 0x94a3b8, 4, 3.5);
        }
      } else if (w.isRocket) {
        triggerRocketExplosion(hitPoint, 'You', 'blue');
      }

      spawnBulletTracer(muzzleWorldPos, hitPoint, w.isRocket ? 0xf97316 : 0xfef08a);

      if (state.ammo === 0) {
        startReload();
      }
    }

    function updateHUD() {
      document.getElementById('hud-cash').textContent = `$${state.cash.toLocaleString()}`;
      document.getElementById('hud-hp-text').textContent = `${state.hp}`;
      document.getElementById('hud-hp-bar').style.width = `${(state.hp / state.maxHp) * 100}%`;
      document.getElementById('hud-armor-text').textContent = `${state.armor}`;
      document.getElementById('hud-armor-bar').style.width = `${(state.armor / state.maxArmor) * 100}%`;

      const w = ARMORY.find(i => i.id === state.equippedWeaponId);
      document.getElementById('hud-weapon-type').textContent = w.category.split('•')[0].trim();
      document.getElementById('hud-weapon-name').textContent = w.name.toUpperCase();
      document.getElementById('hud-ammo').textContent = state.ammo;
      document.getElementById('hud-mag-size').textContent = w.magSize;

      document.getElementById('hud-barricades').textContent = `${state.barricadeKits}`;

      const b = Math.min(100, Math.floor(state.scores.blue));
      const r = Math.min(100, Math.floor(state.scores.red));
      const g = Math.min(100, Math.floor(state.scores.gold));
      document.getElementById('score-blue').textContent = b;
      document.getElementById('score-red').textContent = r;
      document.getElementById('score-gold').textContent = g;
      document.getElementById('bar-blue').style.width = `${b}%`;
      document.getElementById('bar-red').style.width = `${r}%`;
      document.getElementById('bar-gold').style.width = `${g}%`;
    }

    // ==========================================
    // 10. EXPANDED TACTICAL SATELLITE RADAR MAP & CORNER MINIMAP
    // ==========================================
    const radarModal = document.getElementById('tactical-map-overlay');
    const radarCanvas = document.getElementById('radar-canvas');
    const radarCtx = radarCanvas.getContext('2d');
    const minimapCanvas = document.getElementById('minimap-canvas');
    const minimapCtx = minimapCanvas.getContext('2d');

    function renderRadarToCanvas(ctx, width, height, dotScale = 1) {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Draw grid rings
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, (width / 2) * (i / 3), 0, Math.PI * 2);
        ctx.stroke();
      }

      // Arena is 580x580 (-290 to +290)
      const scale = width / (ARENA_HALF_SIZE * 2);
      const toRadarX = (x) => width / 2 + x * scale;
      const toRadarY = (z) => height / 2 + z * scale;

      // Draw Central Control Zone
      ctx.beginPath();
      ctx.arc(toRadarX(0), toRadarY(0), ZONE_RADIUS * scale, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(251, 191, 36, 0.22)';
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw Bots
      bots.forEach(b => {
        if (b.isDead) return;
        const bx = toRadarX(b.group.position.x);
        const bz = toRadarY(b.group.position.z);
        ctx.fillStyle = b.faction === 'blue' ? '#3b82f6' : b.faction === 'red' ? '#ef4444' : '#f59e0b';
        ctx.beginPath();
        ctx.arc(bx, bz, 3.5 * dotScale, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Player
      if (!state.isDead) {
        const px = toRadarX(camera.position.x);
        const pz = toRadarY(camera.position.z);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(px, pz, 5 * dotScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    function toggleTacticalMap(open) {
      if (open) {
        radarModal.classList.remove('hidden');
        renderRadarToCanvas(radarCtx, radarCanvas.width, radarCanvas.height, 1.25);
      } else {
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

    // ==========================================
    // 11. SETTINGS, SENSITIVITY & CUSTOM TOUCH LAYOUT SYSTEM
    // ==========================================
    const DEFAULT_TOUCH_LAYOUT = {
      joystick: { x: 24, y: 88, scale: 1.0, baseSize: 120, label: 'JOYSTICK' },
      fire:     { x: null, right: 24, y: 32, scale: 1.0, baseSize: 88, label: 'FIRE' },
      jump:     { x: null, right: 124, y: 36, scale: 1.0, baseSize: 52, label: 'JUMP' },
      scope:    { x: null, right: 120, y: 102, scale: 1.0, baseSize: 52, label: 'ADS' },
      reload:   { x: null, right: 40, y: 134, scale: 1.0, baseSize: 50, label: 'RELOAD' },
      cover:    { x: null, right: 178, y: 72, scale: 1.0, baseSize: 48, label: 'COVER' }
    };

    let customLayout = JSON.parse(JSON.stringify(DEFAULT_TOUCH_LAYOUT));
    let selectedLayoutKey = 'fire';

    function loadUserConfig() {
      try {
        const saved = localStorage.getItem('wardogs_tactical_config_v2');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.volume === 'number') state.volume = parsed.volume;
          if (typeof parsed.isMuted === 'boolean') state.isMuted = parsed.isMuted;
          if (typeof parsed.sensitivity === 'number') state.sensitivity = parsed.sensitivity;
          if (parsed.layout) {
            Object.keys(DEFAULT_TOUCH_LAYOUT).forEach(k => {
              if (parsed.layout[k]) {
                customLayout[k] = { ...DEFAULT_TOUCH_LAYOUT[k], ...parsed.layout[k] };
              }
            });
          }
        }
      } catch (err) {
        // Ignore storage errors
      }
      sound.setVolume(state.volume / 100);
      sound.setMuted(state.isMuted);
      syncSettingsUI();
      applyTouchLayout();
    }

    function saveUserConfig() {
      try {
        localStorage.setItem('wardogs_tactical_config_v2', JSON.stringify({
          volume: state.volume,
          isMuted: state.isMuted,
          sensitivity: state.sensitivity,
          layout: customLayout
        }));
      } catch (err) {
        // Ignore storage errors
      }
    }

    function applyTouchLayout() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      Object.keys(customLayout).forEach(key => {
        const cfg = customLayout[key];
        const el = document.getElementById(`ctrl-${key}`);
        if (!el) return;
        const size = Math.round(cfg.baseSize * cfg.scale);
        const leftPx = cfg.x !== null && cfg.x !== undefined
          ? Math.max(4, Math.min(vw - size - 4, cfg.x))
          : Math.max(4, vw - (cfg.right || 24) - size);
        const bottomPx = Math.max(4, Math.min(vh - size - 4, cfg.y));

        el.style.left = `${leftPx}px`;
        el.style.right = 'auto';
        el.style.bottom = `${bottomPx}px`;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
      });
    }

    function syncSettingsUI() {
      document.getElementById('setting-vol-slider').value = state.volume;
      document.getElementById('setting-vol-val').textContent = state.isMuted ? 'MUTED' : `${state.volume}%`;
      const muteBtn = document.getElementById('setting-mute-btn');
      muteBtn.textContent = state.isMuted ? 'UNMUTE' : 'MUTE';
      muteBtn.className = state.isMuted
        ? 'px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold cursor-pointer'
        : 'px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 text-[10px] font-bold text-slate-200 cursor-pointer';

      document.getElementById('setting-sens-slider').value = Math.round(state.sensitivity * 100);
      document.getElementById('setting-sens-val').textContent = `${state.sensitivity.toFixed(2)}x`;

      const selCfg = customLayout[selectedLayoutKey];
      document.getElementById('selected-ctrl-name').textContent = selCfg.label;
      document.getElementById('setting-scale-slider').value = Math.round(selCfg.scale * 100);
      document.getElementById('setting-scale-val').textContent = `${Math.round(selCfg.scale * 100)}%`;
    }

    function renderLayoutEditorStage() {
      const stage = document.getElementById('layout-editor-stage');
      stage.querySelectorAll('.layout-draggable').forEach(n => n.remove());

      const stageRect = stage.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scaleX = stageRect.width / vw;
      const scaleY = stageRect.height / vh;

      Object.keys(customLayout).forEach(key => {
        const cfg = customLayout[key];
        const size = Math.round(cfg.baseSize * cfg.scale);
        const leftPx = cfg.x !== null && cfg.x !== undefined ? cfg.x : vw - (cfg.right || 24) - size;
        const bottomPx = cfg.y;

        const box = document.createElement('div');
        const isSel = selectedLayoutKey === key;
        box.className = `layout-draggable absolute rounded-full flex items-center justify-center font-black text-xs select-none border-2 ${
          isSel ? 'border-amber-400 bg-amber-500/35 text-white ring-4 ring-amber-400/30 z-10' : 'border-slate-400/70 bg-slate-800/80 text-slate-200'
        }`;
        box.style.width = `${Math.round(size * scaleX)}px`;
        box.style.height = `${Math.round(size * scaleX)}px`;
        box.style.left = `${Math.round(leftPx * scaleX)}px`;
        box.style.bottom = `${Math.round(bottomPx * scaleY)}px`;
        box.textContent = cfg.label;

        let dragging = false;
        let startClientX = 0;
        let startClientY = 0;
        let origLeft = leftPx;
        let origBottom = bottomPx;

        const onStart = (cx, cy) => {
          selectedLayoutKey = key;
          syncSettingsUI();
          dragging = true;
          startClientX = cx;
          startClientY = cy;
          origLeft = cfg.x !== null && cfg.x !== undefined ? cfg.x : vw - (cfg.right || 24) - size;
          origBottom = cfg.y;
          renderLayoutEditorStage();
        };

        const onMove = (cx, cy) => {
          if (!dragging) return;
          const dx = (cx - startClientX) / scaleX;
          const dy = (cy - startClientY) / scaleY;
          cfg.x = Math.max(4, Math.min(vw - size - 4, Math.round(origLeft + dx)));
          cfg.y = Math.max(4, Math.min(vh - size - 4, Math.round(origBottom - dy)));
          applyTouchLayout();
          renderLayoutEditorStage();
        };

        const onEnd = () => {
          dragging = false;
        };

        box.addEventListener('mousedown', (e) => {
          e.preventDefault();
          onStart(e.clientX, e.clientY);
          const mm = (ev) => onMove(ev.clientX, ev.clientY);
          const mu = () => {
            onEnd();
            window.removeEventListener('mousemove', mm);
            window.removeEventListener('mouseup', mu);
          };
          window.addEventListener('mousemove', mm);
          window.addEventListener('mouseup', mu);
        });

        box.addEventListener('touchstart', (e) => {
          e.preventDefault();
          const t = e.changedTouches[0];
          onStart(t.clientX, t.clientY);
        }, { passive: false });

        box.addEventListener('touchmove', (e) => {
          e.preventDefault();
          const t = e.changedTouches[0];
          onMove(t.clientX, t.clientY);
        }, { passive: false });

        box.addEventListener('touchend', onEnd);
        stage.appendChild(box);
      });
    }

    let settingsOpenedFromGame = false;
    function openSettingsModal(fromGame = false) {
      sound.init();
      settingsOpenedFromGame = fromGame;
      if (fromGame) {
        state.isPlaying = false;
        state.isMouseDown = false;
        state.fireTouchId = null;
        setAiming(false);
        if (document.pointerLockElement === canvas) {
          document.exitPointerLock();
        }
      }
      syncSettingsUI();
      document.getElementById('settings-overlay').classList.remove('hidden');
      requestAnimationFrame(renderLayoutEditorStage);
    }

    function closeSettingsModal() {
      saveUserConfig();
      applyTouchLayout();
      document.getElementById('settings-overlay').classList.add('hidden');
      if (settingsOpenedFromGame && !state.isDead && !state.isGameOver) {
        state.isPlaying = true;
        if (!isMobileDevice) {
          canvas.requestPointerLock();
        }
      }
    }

    document.getElementById('hud-settings-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openSettingsModal(true);
    });
    document.getElementById('menu-settings-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openSettingsModal(false);
    });
    document.getElementById('save-settings-btn').addEventListener('click', closeSettingsModal);
    document.getElementById('close-settings-btn').addEventListener('click', closeSettingsModal);

    document.getElementById('setting-vol-slider').addEventListener('input', (e) => {
      sound.init();
      state.volume = parseInt(e.target.value, 10);
      if (state.volume > 0 && state.isMuted) state.isMuted = false;
      sound.setVolume(state.volume / 100);
      sound.setMuted(state.isMuted);
      syncSettingsUI();
    });

    document.getElementById('setting-mute-btn').addEventListener('click', () => {
      sound.init();
      state.isMuted = !state.isMuted;
      sound.setMuted(state.isMuted);
      syncSettingsUI();
    });

    document.getElementById('setting-sens-slider').addEventListener('input', (e) => {
      state.sensitivity = parseInt(e.target.value, 10) / 100;
      syncSettingsUI();
    });

    document.getElementById('setting-scale-slider').addEventListener('input', (e) => {
      const newScale = parseInt(e.target.value, 10) / 100;
      customLayout[selectedLayoutKey].scale = newScale;
      applyTouchLayout();
      syncSettingsUI();
      renderLayoutEditorStage();
    });

    document.getElementById('reset-layout-btn').addEventListener('click', () => {
      customLayout = JSON.parse(JSON.stringify(DEFAULT_TOUCH_LAYOUT));
      applyTouchLayout();
      syncSettingsUI();
      renderLayoutEditorStage();
      saveUserConfig();
    });

    // ==========================================
    // 12. STRICTLY ISOLATED MOBILE TOUCH JOYSTICK, LOOK & BUTTONS
    // ==========================================
    const joystickBase = document.getElementById('joystick-base');
    const joystickThumb = document.getElementById('joystick-thumb');

    joystickBase.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const touch = e.changedTouches[0];
      state.touchJoystick.active = true;
      state.touchJoystick.identifier = touch.identifier;
      const rect = joystickBase.getBoundingClientRect();
      state.touchJoystick.startX = rect.left + rect.width / 2;
      state.touchJoystick.startY = rect.top + rect.height / 2;
      updateJoystickPosition(touch.clientX, touch.clientY);
    }, { passive: false });

    joystickBase.addEventListener('touchmove', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!state.touchJoystick.active) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === state.touchJoystick.identifier) {
          updateJoystickPosition(touch.clientX, touch.clientY);
        }
      }
    }, { passive: false });

    const resetJoystick = (e) => {
      if (e) e.stopPropagation();
      state.touchJoystick.active = false;
      state.touchJoystick.identifier = null;
      state.touchJoystick.dirX = 0;
      state.touchJoystick.dirY = 0;
      joystickThumb.style.transform = `translate(0px, 0px)`;
    };

    joystickBase.addEventListener('touchend', resetJoystick);
    joystickBase.addEventListener('touchcancel', resetJoystick);

    function updateJoystickPosition(clientX, clientY) {
      const rect = joystickBase.getBoundingClientRect();
      const maxDist = Math.max(24, rect.width * 0.35);
      let dx = clientX - state.touchJoystick.startX;
      let dy = clientY - state.touchJoystick.startY;
      const dist = Math.hypot(dx, dy);

      if (dist > maxDist) {
        dx = (dx / dist) * maxDist;
        dy = (dy / dist) * maxDist;
      }

      joystickThumb.style.transform = `translate(${dx}px, ${dy}px)`;
      state.touchJoystick.dirX = dx / maxDist;
      state.touchJoystick.dirY = dy / maxDist;
    }

    // Touch Look ONLY when touching the 3D canvas directly (never on UI buttons)
    canvas.addEventListener('touchstart', (e) => {
      if (!state.isPlaying && !state.isLobby) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier !== state.touchJoystick.identifier && touch.identifier !== state.fireTouchId && !state.touchLook.active) {
          state.touchLook.active = true;
          state.touchLook.identifier = touch.identifier;
          state.touchLook.lastX = touch.clientX;
          state.touchLook.lastY = touch.clientY;
        }
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if ((!state.isPlaying && !state.isLobby) || !state.touchLook.active) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === state.touchLook.identifier) {
          const dx = touch.clientX - state.touchLook.lastX;
          const dy = touch.clientY - state.touchLook.lastY;
          state.touchLook.lastX = touch.clientX;
          state.touchLook.lastY = touch.clientY;

          const baseSens = state.isAiming ? 0.0011 : 0.0023;
          const sens = baseSens * state.sensitivity;
          camera.rotation.y -= dx * sens;
          camera.rotation.x -= dy * sens;
          camera.rotation.x = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, camera.rotation.x));
        }
      }
    }, { passive: true });

    const endTouchLook = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === state.touchLook.identifier) {
          state.touchLook.active = false;
          state.touchLook.identifier = null;
        }
      }
    };
    canvas.addEventListener('touchend', endTouchLook);
    canvas.addEventListener('touchcancel', endTouchLook);

    // FIRE button ONLY triggers shooting (isolated touch identifier + stopPropagation)
    const fireBtn = document.getElementById('ctrl-fire');
    fireBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const touch = e.changedTouches[0];
      state.fireTouchId = touch.identifier;
      state.isMouseDown = true;
      fireWeapon();
    }, { passive: false });

    const stopFireTouch = (e) => {
      e.preventDefault();
      e.stopPropagation();
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === state.fireTouchId) {
          state.fireTouchId = null;
          state.isMouseDown = false;
        }
      }
    };
    fireBtn.addEventListener('touchend', stopFireTouch, { passive: false });
    fireBtn.addEventListener('touchcancel', stopFireTouch, { passive: false });

    // Non-shooting action buttons strictly stop propagation and NEVER fire
    const bindIsolatedActionBtn = (id, callback) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        callback();
      }, { passive: false });
      btn.addEventListener('mousedown', (e) => {
        e.stopPropagation();
      });
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!('ontouchstart' in window)) callback();
      });
    };

    bindIsolatedActionBtn('ctrl-jump', () => {
      if (state.canJump && state.isPlaying) {
        state.velocity.y = 7.8;
        state.canJump = false;
      }
    });

    bindIsolatedActionBtn('ctrl-scope', () => {
      if (state.isPlaying) {
        setAiming(!state.isAiming);
      }
    });

    bindIsolatedActionBtn('ctrl-reload', () => {
      if (state.isPlaying) {
        startReload();
      }
    });

    bindIsolatedActionBtn('ctrl-cover', () => {
      if (state.isPlaying) {
        deployBarricade();
      }
    });

    document.getElementById('hud-shop-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openTacticalShop('TACTICAL ARMORY • Spend your Cash on upgraded weapons & fortifications.');
    });

    // ==========================================
    // 13. DESKTOP INPUT EVENT LISTENERS
    // ==========================================
    document.getElementById('close-lobby-shop').addEventListener('click', () => {
      menuOverlay.classList.add('hidden');
      if (window.__lobbyShopOpen && state.isLobby) {
        lobbyUI.classList.remove('hidden');
        window.__lobbyShopOpen = false;
      } else {
        deployBtn.click();
      }
    });

    deployBtn.addEventListener('click', () => {
      sound.init();
      if (state.isDead) {
        respawnPlayer();
      }
      menuOverlay.classList.add('hidden');
      hud.classList.remove('hidden');
      if (isMobileDevice) {
        mobileControls.classList.remove('hidden');
        applyTouchLayout();
      }
      state.isPlaying = true;
      if (!isMobileDevice) {
        canvas.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      const locked = document.pointerLockElement === canvas;
      if (!locked && state.isPlaying && !state.isGameOver && !isMobileDevice && document.getElementById('settings-overlay').classList.contains('hidden')) {
        openTacticalShop('OPERATION PAUSED • Adjust your loadout or click Resume.');
      }
    });

    document.addEventListener('mousemove', (e) => {
      if ((!state.isPlaying && !state.isLobby) || document.pointerLockElement !== canvas) return;
      const baseSens = state.isAiming ? 0.0011 : 0.0022;
      const sens = baseSens * state.sensitivity;
      camera.rotation.y -= e.movementX * sens;
      camera.rotation.x -= e.movementY * sens;
      camera.rotation.x = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, camera.rotation.x));
    });

    // Only trigger mouse fire when clicking directly on the 3D canvas
    canvas.addEventListener('mousedown', (e) => {
      if (!state.isPlaying || (document.pointerLockElement !== canvas && !isMobileDevice)) return;
      if (e.button === 0) {
        state.isMouseDown = true;
        fireWeapon();
      } else if (e.button === 2) {
        setAiming(true);
      }
    });

    document.addEventListener('mouseup', (e) => {
      if (e.button === 0) state.isMouseDown = false;
      if (e.button === 2) setAiming(false);
    });

    document.addEventListener('contextmenu', (e) => e.preventDefault());

    document.addEventListener('keydown', (e) => {
      state.keys[e.code] = true;
      if (state.isLobby && (e.code === 'KeyE' || e.code === 'Enter')) {
        interactWithLobbyNPC();
        return;
      }
      if (!state.isPlaying) return;

      if (e.code === 'KeyR') startReload();
      if (e.code === 'KeyF') deployBarricade();
      if (e.code === 'KeyM') toggleTacticalMap(radarModal.classList.contains('hidden'));
      if (e.code === 'KeyB') {
        openTacticalShop('TACTICAL ARMORY • Spend your Cash on upgraded weapons & fortifications.');
      }
      if (e.code === 'Space' && state.canJump) {
        state.velocity.y = 7.8;
        state.canJump = false;
      }
    });

    document.addEventListener('keyup', (e) => {
      state.keys[e.code] = false;
    });

    document.getElementById('next-match-btn').addEventListener('click', () => {
      state.scores = { blue: 0, red: 0, gold: 0 };
      state.kills = 0;
      state.zoneCaptures = 0;
      state.isGameOver = false;
      state.isDead = false;
      state.hp = 100;
      state.armor = Math.max(state.armor, 50);

      bots.forEach((b, idx) => {
        b.isDead = false;
        b.hp = 100;
        b.group.visible = true;
        const sb = FACTIONS[b.faction].spawn;
        b.group.position.set(sb.x + ((idx % 4) - 1.5) * 5.0, 0, sb.z + (Math.floor(idx / 4) - 1) * 5.0);
      });

      document.getElementById('gameover-overlay').classList.add('hidden');
      respawnPlayer();
      openTacticalShop('NEW OPERATION STARTED • Your Persistent Cash & Armory carried over!');
    });

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      applyTouchLayout();
    });

    // ==========================================
    // 14. COLLISION & PHYSICS HELPERS (EXPANDED 400x400 ARENA)
    // ==========================================
    function checkPositionBlocked(pos, radius = 0.65) {
      if (Math.abs(pos.x) > ARENA_HALF_SIZE - 4 || Math.abs(pos.z) > ARENA_HALF_SIZE - 4) return true;

      const playerMin = new THREE.Vector3(pos.x - radius, 0.1, pos.z - radius);
      const playerMax = new THREE.Vector3(pos.x + radius, 1.8, pos.z + radius);
      const testBox = new THREE.Box3(playerMin, playerMax);

      for (let i = 0; i < colliders.length; i++) {
        if (testBox.intersectsBox(colliders[i].box)) return true;
      }
      for (let i = 0; i < destructibles.length; i++) {
        if (testBox.intersectsBox(destructibles[i].box)) return true;
      }
      return false;
    }

    // ==========================================
    // 15. AI BOT SIMULATION & KING OF THE HILL
    // ==========================================
    function updateBots(dt) {
      bots.forEach(bot => {
        if (bot.isDead) {
          bot.respawnTimer -= dt;
          if (bot.respawnTimer <= 0) {
            bot.isDead = false;
            bot.hp = 100;
            bot.group.visible = true;
            const sb = FACTIONS[bot.faction].spawn;
            bot.group.position.set(
              sb.x + (Math.random() - 0.5) * 14,
              0,
              sb.z + (Math.random() - 0.5) * 14
            );
          }
          return;
        }

        bot.marker.rotation.y += dt * 2.5;

        let nearestTargetPos = null;
        let nearestTargetObj = null;
        let minDist = 75;
        bots.forEach(other => {
          if (other === bot || other.isDead || other.faction === bot.faction) return;
          const d = bot.group.position.distanceTo(other.group.position);
          if (d < minDist) {
            minDist = d;
            nearestTargetPos = other.group.position;
            nearestTargetObj = { type: 'bot', ref: other };
          }
        });

        if (bot.faction !== 'blue' && !state.isDead) {
          const playerFloorPos = new THREE.Vector3(camera.position.x, 0, camera.position.z);
          const d = bot.group.position.distanceTo(playerFloorPos);
          if (d < minDist) {
            minDist = d;
            nearestTargetPos = playerFloorPos;
            nearestTargetObj = { type: 'player' };
          }
        }

        const distToZone = bot.group.position.length();
        bot.strafeTimer -= dt;
        if (bot.strafeTimer <= 0) {
          bot.strafeDir *= -1;
          bot.strafeTimer = 1.4 + Math.random() * 1.8;
        }

        const moveDir = new THREE.Vector3();
        if (distToZone > ZONE_RADIUS * 0.65) {
          moveDir.subVectors(new THREE.Vector3(0, 0, 0), bot.group.position).normalize();
        } else if (nearestTargetPos) {
          const toTarget = new THREE.Vector3().subVectors(nearestTargetPos, bot.group.position).normalize();
          moveDir.set(-toTarget.z * bot.strafeDir, 0, toTarget.x * bot.strafeDir);
        }

        const speed = 4.8;
        const nextX = bot.group.position.clone().add(new THREE.Vector3(moveDir.x * speed * dt, 0, 0));
        if (!checkPositionBlocked(nextX, 0.55)) bot.group.position.x = nextX.x;

        const nextZ = bot.group.position.clone().add(new THREE.Vector3(0, 0, moveDir.z * speed * dt));
        if (!checkPositionBlocked(nextZ, 0.55)) bot.group.position.z = nextZ.z;

        const lookTarget = nearestTargetPos || new THREE.Vector3(0, 0, 0);
        bot.group.lookAt(lookTarget.x, 0, lookTarget.z);

        if (nearestTargetObj && minDist < 65) {
          bot.fireCooldown -= dt;
          if (bot.fireCooldown <= 0) {
            bot.fireCooldown = 0.65 + Math.random() * 0.75;

            const origin = bot.group.position.clone().add(new THREE.Vector3(0, 1.45, 0));
            const targetAim = nearestTargetPos.clone().add(new THREE.Vector3(
              (Math.random() - 0.5) * 1.4,
              1.3,
              (Math.random() - 0.5) * 1.4
            ));

            const rayDir = new THREE.Vector3().subVectors(targetAim, origin).normalize();
            const ray = new THREE.Raycaster(origin, rayDir, 0.3, 50);

            const coverMeshes = [
              ...colliders.map(c => c.mesh),
              ...destructibles.map(d => d.mesh)
            ];
            const hits = ray.intersectObjects(coverMeshes, false);

            let endPt = targetAim;
            if (hits.length > 0 && hits[0].distance < origin.distanceTo(targetAim)) {
              endPt = hits[0].point;
              const hitDest = destructibles.find(d => d.mesh === hits[0].object);
              if (hitDest) damageDestructible(hitDest, 14);
            } else {
              if (Math.random() < 0.42) {
                if (nearestTargetObj.type === 'bot') {
                  damageBot(nearestTargetObj.ref, 18, bot.name, bot.faction);
                } else if (nearestTargetObj.type === 'player' && state.isPlaying) {
                  damagePlayer(12, bot.name, bot.faction);
                }
              }
            }

            spawnBulletTracer(origin, endPt, FACTIONS[bot.faction].colorHex);
          }
        }
      });
    }

    function updateControlZone(dt) {
      const counts = { blue: 0, red: 0, gold: 0 };

      const playerInside = !state.isDead && Math.hypot(camera.position.x, camera.position.z) <= ZONE_RADIUS;
      if (playerInside) counts.blue++;

      bots.forEach(b => {
        if (!b.isDead && Math.hypot(b.group.position.x, b.group.position.z) <= ZONE_RADIUS) {
          counts[b.faction]++;
        }
      });

      const factionsPresent = Object.keys(counts).filter(k => counts[k] > 0);
      const badge = document.getElementById('zone-status-badge');

      if (factionsPresent.length === 0) {
        state.zoneOwner = 'neutral';
        badge.textContent = 'NEUTRAL';
        badge.className = 'px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-600 uppercase text-[9px]';
        zoneRingMesh.material.color.setHex(0x94a3b8);
        zoneFloorMesh.material.color.setHex(0x94a3b8);
        zoneBeaconLight.color.setHex(0x94a3b8);
      } else if (factionsPresent.length > 1) {
        state.zoneOwner = 'contested';
        badge.textContent = 'CONTESTED';
        badge.className = 'px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500 uppercase text-[9px] animate-pulse-fast';
        zoneRingMesh.material.color.setHex(0xc084fc);
        zoneFloorMesh.material.color.setHex(0xc084fc);
        zoneBeaconLight.color.setHex(0xc084fc);
      } else {
        const owner = factionsPresent[0];
        state.zoneOwner = owner;
        const fInfo = FACTIONS[owner];
        badge.textContent = fInfo.short;
        badge.className = `px-1.5 py-0.2 rounded bg-slate-900 ${fInfo.css} border border-current uppercase text-[9px]`;
        zoneRingMesh.material.color.setHex(fInfo.colorHex);
        zoneFloorMesh.material.color.setHex(fInfo.colorHex);
        zoneBeaconLight.color.setHex(fInfo.colorHex);

        state.scores[owner] = Math.min(100, state.scores[owner] + dt * 2.4);

        if (owner === 'blue' && playerInside) {
          state.zoneTickAccumulator += dt;
          if (state.zoneTickAccumulator >= 3.0) {
            state.zoneTickAccumulator = 0;
            state.zoneCaptures++;
            addCash(50, '+$50 ZONE CAPTURE TICK');
          }
        }

        if (state.scores[owner] >= 100 && !state.isGameOver) {
          triggerMatchEnd(owner);
        }
      }

      updateHUD();
    }

    function triggerMatchEnd(winnerFaction) {
      state.isGameOver = true;
      state.isPlaying = false;
      setAiming(false);
      if (document.pointerLockElement === canvas) {
        document.exitPointerLock();
      }

      if (winnerFaction === 'blue') {
        addCash(300, '+$300 FACTION VICTORY BONUS');
      }

      const fInfo = FACTIONS[winnerFaction];
      document.getElementById('winner-badge').textContent = `${fInfo.name} DOMINANCE`;
      document.getElementById('winner-title').textContent =
        winnerFaction === 'blue' ? 'COBALT PMC VICTORY!' : `${fInfo.name} WINS!`;
      document.getElementById('end-kills').textContent = state.kills;
      document.getElementById('end-captures').textContent = state.zoneCaptures;
      document.getElementById('end-cash').textContent = `$${state.cash.toLocaleString()}`;

      hud.classList.add('hidden');
      mobileControls.classList.add('hidden');
      document.getElementById('gameover-overlay').classList.remove('hidden');
    }

    // ==========================================
    // 15. MAIN ANIMATION & GAME LOOP
    // ==========================================
    let prevTime = performance.now();

    function animate() {
      requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min(0.05, (now - prevTime) / 1000);
      prevTime = now;

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
          const nx=THREE.MathUtils.clamp(camera.position.x+dir.x*5.5*dt,-63,63);
          const nz=THREE.MathUtils.clamp(camera.position.z+dir.z*5.5*dt,-63,63);

          if(!isLobbyPositionBlocked(nx,camera.position.z)) camera.position.x=nx;
          if(!isLobbyPositionBlocked(camera.position.x,nz)) camera.position.z=nz;
        }

        camera.position.y=1.75;
        updateLobbyInteractionPrompt();
      }

      if (state.isPlaying && !state.isDead && !state.isGameOver) {
        const w = ARMORY.find(i => i.id === state.equippedWeaponId);
        if (state.isMouseDown && w.auto) {
          fireWeapon();
        }

        if (state.isReloading) {
          state.reloadTimer -= dt;
          weaponMeshGroup.rotation.x = Math.sin((1 - state.reloadTimer / w.reloadTime) * Math.PI) * -0.65;
          if (state.reloadTimer <= 0) {
            state.isReloading = false;
            state.ammo = w.magSize;
            weaponMeshGroup.rotation.x = 0;
            document.getElementById('reload-indicator').classList.add('hidden');
            updateHUD();
          }
        }

        const targetFov = state.isAiming ? w.zoomFov : 72;
        camera.fov += (targetFov - camera.fov) * 12 * dt;
        camera.updateProjectionMatrix();

        // Player movement (Keyboard WASD + Virtual Joystick)
        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), camera.rotation.y);
        const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), camera.rotation.y);

        const inputDir = new THREE.Vector3();
        if (state.keys['KeyW'] || state.keys['ArrowUp']) inputDir.add(forward);
        if (state.keys['KeyS'] || state.keys['ArrowDown']) inputDir.sub(forward);
        if (state.keys['KeyD'] || state.keys['ArrowRight']) inputDir.add(right);
        if (state.keys['KeyA'] || state.keys['ArrowLeft']) inputDir.sub(right);

        // Add joystick vector if active
        if (state.touchJoystick.active) {
          inputDir.addScaledVector(forward, -state.touchJoystick.dirY);
          inputDir.addScaledVector(right, state.touchJoystick.dirX);
        }

        if (inputDir.lengthSq() > 0) inputDir.normalize();

        const isSprinting = state.keys['ShiftLeft'] && !state.isAiming && inputDir.lengthSq() > 0;
        const moveSpeed = isSprinting ? 11.2 : state.isAiming ? 4.8 : 7.6;

        const nextPosX = camera.position.clone().add(new THREE.Vector3(inputDir.x * moveSpeed * dt, 0, 0));
        if (!checkPositionBlocked(nextPosX, 0.55)) {
          camera.position.x = nextPosX.x;
        }
        const nextPosZ = camera.position.clone().add(new THREE.Vector3(0, 0, inputDir.z * moveSpeed * dt));
        if (!checkPositionBlocked(nextPosZ, 0.55)) {
          camera.position.z = nextPosZ.z;
        }

        state.velocity.y -= 21 * dt;
        camera.position.y += state.velocity.y * dt;
        if (camera.position.y <= 1.75) {
          camera.position.y = 1.75;
          state.velocity.y = 0;
          state.canJump = true;
        }

        weaponRecoilOffset = Math.max(0, weaponRecoilOffset - dt * 0.45);
        if (inputDir.lengthSq() > 0 && state.canJump) {
          weaponBobTimer += dt * (isSprinting ? 13 : 9);
        }
        const bobX = Math.cos(weaponBobTimer * 0.5) * 0.012;
        const bobY = Math.abs(Math.sin(weaponBobTimer)) * 0.012;

        const targetWeaponX = state.isAiming ? 0 : 0.26 + bobX;
        const targetWeaponY = state.isAiming ? -0.15 : -0.22 - bobY;
        const targetWeaponZ = -0.45 + weaponRecoilOffset;

        weaponMeshGroup.position.x += (targetWeaponX - weaponMeshGroup.position.x) * 14 * dt;
        weaponMeshGroup.position.y += (targetWeaponY - weaponMeshGroup.position.y) * 14 * dt;
        weaponMeshGroup.position.z += (targetWeaponZ - weaponMeshGroup.position.z) * 18 * dt;

        const spreadPx = 8 + (inputDir.lengthSq() > 0 ? 6 : 0) + weaponRecoilOffset * 90 - (state.isAiming ? 4 : 0);
        document.getElementById('ch-top').style.transform = `translateY(${-spreadPx}px)`;
        document.getElementById('ch-bottom').style.transform = `translateY(${spreadPx}px)`;
        document.getElementById('ch-left').style.transform = `translateX(${-spreadPx}px)`;
        document.getElementById('ch-right').style.transform = `translateX(${spreadPx}px)`;

        updateBots(dt);
        updateControlZone(dt);
        renderRadarToCanvas(minimapCtx, minimapCanvas.width, minimapCanvas.height, 0.7);
      }

      for (let i = activeTracers.length - 1; i >= 0; i--) {
        const t = activeTracers[i];
        t.life -= dt;
        t.line.material.opacity = Math.max(0, t.life * 8);
        if (t.life <= 0) {
          scene.remove(t.line);
          t.line.geometry.dispose();
          activeTracers.splice(i, 1);
        }
      }

      for (let i = activeParticles.length - 1; i >= 0; i--) {
        const p = activeParticles[i];
        p.life -= dt;
        p.vel.y -= 16 * dt;
        p.mesh.position.addScaledVector(p.vel, dt);
        p.mesh.rotation.x += 5 * dt;
        p.mesh.rotation.y += 5 * dt;
        if (p.life <= 0 || p.mesh.position.y < 0) {
          scene.remove(p.mesh);
          activeParticles.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    }

    window.onload = function () {
      loadUserConfig();
      respawnPlayer();
      state.isPlaying = false;
      state.isLobby = false;
      arenaSceneObjects.forEach(obj => obj.visible = false);
      lobbyGroup.visible = true;
      camera.position.set(0,1.75,22);
      camera.rotation.set(0,0,0);
      document.getElementById('menu-overlay').classList.add('hidden');
      document.getElementById('lobby-main-menu').classList.remove('hidden');
      document.getElementById('lobby-ui').classList.add('hidden');
      updateShopUI();
      updateHUD();
      if (isMobileDevice) {
        document.getElementById('menu-subtitle').innerHTML += ' <b class="text-amber-400">Mobile Touch Controls Ready!</b>';
      }
      animate();
    };
