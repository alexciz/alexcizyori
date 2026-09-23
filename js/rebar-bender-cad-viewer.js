/**
 * =========================================================================
 * COMMERCIAL REBAR BENDER 4-STAGE TRANSMISSION — INTERACTIVE 3D CAD VIEWER
 * Three.js / WebGL Real-Time CAD Assembly Viewer
 * Realistic Heavy-Industry PBR Shading: Alloy Gear Steels, Cast Housings,
 * Stepped Transmission Shafts, and Welded Structural Frame.
 *
 * Features:
 * - 0 to 1 Exploded Assembly Tier Breakdown
 * - Real-Time 279.3:1 Multi-Stage Kinematic Gear Train Animation
 * - Solid CAD / Wireframe / X-Ray Ghost Shading Modes
 * - Interactive Material & Color Swatch Customiser
 * - Zero-CORS offline & file:/// execution support
 * =========================================================================
 */

class RebarBenderCadViewer {
  constructor(canvasId, modelUrl, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.modelUrl = modelUrl || '../assets/models/rebar-bender-assembly.glb';
    this.explodedFactor = 0;
    this.displayMode = 'solid';
    this.isRotating = false;
    this.isKinematicsRunning = false;
    this.turntableSpeed = 0.004;

    // Palette states - Authentic Industrial Powertrain Materials
    this.frameColor = options.frameColor || '#1e293b';       // Industrial Slate Base Frame
    this.gearColor = options.gearColor || '#cbd5e1';         // Through-Hardened EN24T Alloy Steel
    this.motorColor = options.motorColor || '#0284c7';       // Industrial Motor Blue (LS132S)
    this.housingColor = options.housingColor || '#334155';   // SKF Cast Iron Bearing Housings

    this.parts = [];
    this.partMeshMap = {};
    this.materials = {};

    // Kinematic rotating mesh groups
    this.rotors = {
      motorGroup: [],
      shaft2Group: [],
      shaft3Group: [],
      shaft4Group: [],
      turntableGroup: []
    };

    this.worldAxisX = new THREE.Vector3(1, 0, 0);

    this.initThree();
    this.createMaterials();
    this.loadGlbModel();
    this.setupEventListeners();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    const parent = this.canvas.parentElement;
    const width = parent.clientWidth || 740;
    const height = parent.clientHeight || 480;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e17);

    // Camera calibrated for 1117mm tall upright transmission sitting flush on ground (Y=0)
    this.camera = new THREE.PerspectiveCamera(38, width / height, 10, 9000);
    this.camera.position.set(-1850, 1150, 1650);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = false;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.target.set(0, 560, 0);
      this.controls.maxDistance = 4200;
      this.controls.minDistance = 250;
      this.controls.update();
    }

    // Studio Multi-Point Lighting to Sculpt Heavy Industrial Metallic Volumes
    // 1. Hemisphere Ambient: Soft cool sky + warm ground bounce
    const hemiLight = new THREE.HemisphereLight(0xe2e8f0, 0x1e293b, 0.65);
    hemiLight.position.set(0, 2000, 0);
    this.scene.add(hemiLight);

    // 2. Primary Key Light: Directional warm sunlight sculpting gear tooth flanks and shaft shoulders
    const keyLight = new THREE.DirectionalLight(0xfffbf5, 1.35);
    keyLight.position.set(-1200, 1800, 1200);
    this.scene.add(keyLight);

    // 3. Counter-Fill Light: Cool blue-tinted fill balancing gear mesh and frame recesses
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.55);
    fillLight.position.set(1400, 900, -1000);
    this.scene.add(fillLight);

    // 4. Back / Rim Light: Sharp silhouette edge-defining rim light
    const rimLight = new THREE.DirectionalLight(0xc084fc, 0.50);
    rimLight.position.set(0, 1400, -1600);
    this.scene.add(rimLight);

    // 5. Front Detail Light: Head-on fill for V-belt pulleys, tensioner & pillow blocks
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.40);
    frontLight.position.set(-800, 600, 1400);
    this.scene.add(frontLight);

    // 6. Underside Directional Uplight: Illuminates C-channel base frame bedplate & mounting feet
    const underDirLight = new THREE.DirectionalLight(0xe2e8f0, 0.65);
    underDirLight.position.set(0, -500, 0);
    underDirLight.target.position.set(0, 400, 0);
    this.scene.add(underDirLight);
    this.scene.add(underDirLight.target);

    // 7. Underside Point Glow: Soft local uplight
    const underPointLight = new THREE.PointLight(0x38bdf8, 0.70, 1600, 1.2);
    underPointLight.position.set(0, 50, 0);
    this.scene.add(underPointLight);

    // Heavy Industrial Ground Grid (2.4m diameter)
    const gridHelper = new THREE.GridHelper(2400, 32, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = 0;
    gridHelper.material.opacity = 0.24;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);

    // Transmission Assembly Root Group
    this.machineGroup = new THREE.Group();
    this.scene.add(this.machineGroup);

    window.addEventListener('resize', () => {
      if (!this.canvas.parentElement) return;
      const w = this.canvas.parentElement.clientWidth;
      const h = this.canvas.parentElement.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  createMaterials() {
    // 1. Through-Hardened Alloy Steel for MOD4 Gears (EN24T / AISI 4340)
    this.materials.gearSteel = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.gearColor),
      metalness: 0.88,
      roughness: 0.22,
      side: THREE.DoubleSide
    });

    // 2. Polished Cylindrical Stepped Shafts (AISI 4140 / EN19)
    this.materials.shaftSteel = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xd1d5db),
      metalness: 0.92,
      roughness: 0.16,
      side: THREE.DoubleSide
    });

    // 3. SKF Pillow Block Cast Iron Housings (SY 45 / SY 50 / SY 55)
    this.materials.bearingHousing = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.housingColor),
      metalness: 0.55,
      roughness: 0.48,
      side: THREE.DoubleSide
    });

    // 4. Structural Steel Welded C-Channel Base Frame
    this.materials.frameSteel = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.frameColor),
      metalness: 0.42,
      roughness: 0.40,
      side: THREE.DoubleSide
    });

    // 4b. Ghosted Frame for X-Ray Mode
    this.materials.frameGhost = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(this.frameColor),
      metalness: 0.20,
      roughness: 0.35,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    // 5. 5.5 kW Electric Induction Motor (LS132S Cast Iron Shell)
    this.materials.motorHousing = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.motorColor),
      metalness: 0.65,
      roughness: 0.34,
      side: THREE.DoubleSide
    });

    // 6. Cast Iron V-Belt Pulleys (SPA 90mm & 280mm)
    this.materials.pulleyCast = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x475569),
      metalness: 0.78,
      roughness: 0.28,
      side: THREE.DoubleSide
    });

    // 7. Tensioner Arm & Idler Roller
    this.materials.tensioner = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xf59e0b), // Industrial Safety Amber Accent
      metalness: 0.65,
      roughness: 0.30,
      side: THREE.DoubleSide
    });

    // 8. Bright Galvanized / Zinc-Plated Hardware (M12 Bolts, DIN Nuts, Drive Keys, Endcaps)
    this.materials.hardwareZinc = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xe2e8f0),
      metalness: 0.88,
      roughness: 0.18,
      side: THREE.DoubleSide
    });

    // Category-Specific Wireframe Materials
    this.materials.gearWire = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
    this.materials.shaftWire = new THREE.MeshBasicMaterial({ color: 0x94a3b8, wireframe: true });
    this.materials.frameWire = new THREE.MeshBasicMaterial({ color: 0x64748b, wireframe: true });
    this.materials.motorWire = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
    this.materials.hardwareWire = new THREE.MeshBasicMaterial({ color: 0x475569, wireframe: true });
  }

  loadGlbModel() {
    if (typeof THREE.GLTFLoader === 'undefined') {
      console.warn("GLTFLoader not found!");
      return;
    }

    const loader = new THREE.GLTFLoader();

    const onModelLoaded = (gltf) => {
      const root = gltf.scene;

      root.traverse((child) => {
        if (child.isMesh) {
          const name = ((child.name || '') + ' ' + (child.geometry && child.geometry.name ? child.geometry.name : '')).toLowerCase();
          const origPos = child.position.clone();
          const tx = origPos.x;
          const ty = origPos.y;
          const tz = origPos.z;

          let explodeOffset = { x: 0, y: 0, z: 0 };
          let assignedMat = this.materials.frameSteel;
          let partCategory = 'frame';

          // 1. Frame C-Channels & Deck Plate (C-channels explode outward)
          if (name.includes('channel100_3')) {
            // Lower right bearing support C-channel: explodes +X
            explodeOffset = { x: 250, y: 0, z: 0 };
            assignedMat = this.materials.frameSteel;
            partCategory = 'frame';
          } else if (name.includes('channel4')) {
            // Lower left bearing support C-channel: explodes -X
            explodeOffset = { x: -180, y: 0, z: 0 };
            assignedMat = this.materials.frameSteel;
            partCategory = 'frame';
          } else if (name.includes('channel100_1')) {
            // Upper right bearing support C-channel: explodes +X
            explodeOffset = { x: 180, y: 0, z: 0 };
            assignedMat = this.materials.frameSteel;
            partCategory = 'frame';
          } else if (name.includes('channel2')) {
            // Upper left bearing support C-channel: explodes -X
            explodeOffset = { x: -250, y: 0, z: 0 };
            assignedMat = this.materials.frameSteel;
            partCategory = 'frame';
          } else if (name.includes('channel100_4')) {
            // Front lower cross C-channel: explodes +Z
            explodeOffset = { x: 0, y: 0, z: 220 };
            assignedMat = this.materials.frameSteel;
            partCategory = 'frame';
          } else if (name.includes('channel100_2')) {
            // Rear lower cross C-channel: explodes -Z
            explodeOffset = { x: 0, y: 0, z: -220 };
            assignedMat = this.materials.frameSteel;
            partCategory = 'frame';
          } else if (name.includes('channelleg_1')) {
            // Front-left leg C-channel
            explodeOffset = { x: -140, y: 0, z: 180 };
            assignedMat = this.materials.frameSteel;
            partCategory = 'frame';
          } else if (name.includes('channelleg_2')) {
            // Front-right leg C-channel
            explodeOffset = { x: 140, y: 0, z: 180 };
            assignedMat = this.materials.frameSteel;
            partCategory = 'frame';
          } else if (name.includes('channel1') && !name.includes('100')) {
            // Rear-left leg C-channel
            explodeOffset = { x: -140, y: 0, z: -180 };
            assignedMat = this.materials.frameSteel;
            partCategory = 'frame';
          } else if (name.includes('channelleg')) {
            // Rear-right leg C-channel
            explodeOffset = { x: 140, y: 0, z: -180 };
            assignedMat = this.materials.frameSteel;
            partCategory = 'frame';
          } else if (name.includes('channel5')) {
            // Upper front cross C-channel
            explodeOffset = { x: 0, y: 100, z: 180 };
            assignedMat = this.materials.frameSteel;
            partCategory = 'frame';
          } else if (name.includes('channel_1')) {
            // Upper right tie C-channel
            explodeOffset = { x: 180, y: 100, z: 0 };
            assignedMat = this.materials.frameSteel;
            partCategory = 'frame';
          } else if (name.trim() === 'channel') {
            // Upper left tie C-channel
            explodeOffset = { x: -180, y: 100, z: 0 };
            assignedMat = this.materials.frameSteel;
            partCategory = 'frame';
          } else if (name.includes('dtp')) {
            // Top turntable deck plate
            explodeOffset = { x: 0, y: 320, z: 0 };
            assignedMat = this.materials.frameSteel;
            partCategory = 'frame';

          // 2. Bearings, Bearing Bolts, Nuts, Spacers & Grease Fittings
          // All remain rigidly attached to their respective mounting C-channels!
          } else if (
            (Math.abs(tx - (-290.07)) < 8 && ty > 400) &&
            (name.includes('housingsy') || name.includes('yar 211') || name.includes('55-100') || name.includes('1_4-28') || name.includes('bolt') || name.includes('nut'))
          ) {
            // Shaft 4 Left Bearing Assembly -> mounted on Channel2
            explodeOffset = { x: -250, y: 0, z: 0 }; // Exactly matches Channel2
            assignedMat = name.includes('housingsy') ? this.materials.bearingHousing : this.materials.hardwareZinc;
            partCategory = (name.includes('housingsy') || name.includes('yar') || name.includes('55-100')) ? 'bearing' : 'hardware';
          } else if (
            (Math.abs(tx - (-157.17)) < 8 && ty > 400) &&
            (name.includes('housingsy') || name.includes('yar 211') || name.includes('55-100') || name.includes('1_4-28') || name.includes('bolt') || name.includes('nut'))
          ) {
            // Shaft 4 Right Bearing Assembly -> mounted on Channel100_1
            explodeOffset = { x: 180, y: 0, z: 0 }; // Exactly matches Channel100_1
            assignedMat = name.includes('housingsy') ? this.materials.bearingHousing : this.materials.hardwareZinc;
            partCategory = (name.includes('housingsy') || name.includes('yar') || name.includes('55-100')) ? 'bearing' : 'hardware';
          } else if (
            ((Math.abs(tx - 203.45) < 8 || Math.abs(tx - 198.05) < 8) && ty < 380) &&
            (name.includes('housingsy') || name.includes('yet 209') || name.includes('yel 210') || name.includes('45-85') || name.includes('50-90') || name.includes('1_4-28') || name.includes('spacer') || name.includes('bolt') || name.includes('nut'))
          ) {
            // Shaft 2 & 3 Right Bearing Assemblies -> mounted on Channel100_3
            explodeOffset = { x: 250, y: 0, z: 0 }; // Exactly matches Channel100_3
            assignedMat = name.includes('housingsy') ? this.materials.bearingHousing : this.materials.hardwareZinc;
            partCategory = (name.includes('housingsy') || name.includes('yet') || name.includes('yel') || name.includes('45-85') || name.includes('50-90')) ? 'bearing' : 'hardware';
          } else if (
            ((Math.abs(tx - 22.95) < 8 || Math.abs(tx - 16.35) < 8) && ty < 380) &&
            (name.includes('housingsy') || name.includes('yet 209') || name.includes('yel 210') || name.includes('45-85') || name.includes('50-90') || name.includes('1_4-28') || name.includes('spacer') || name.includes('bolt') || name.includes('nut'))
          ) {
            // Shaft 2 & 3 Left Bearing Assemblies -> mounted on Channel4
            explodeOffset = { x: -180, y: 0, z: 0 }; // Exactly matches Channel4
            assignedMat = name.includes('housingsy') ? this.materials.bearingHousing : this.materials.hardwareZinc;
            partCategory = (name.includes('housingsy') || name.includes('yet') || name.includes('yel') || name.includes('45-85') || name.includes('50-90')) ? 'bearing' : 'hardware';

          // 3. Motor & Belt Drive Components
          } else if (name.includes('132s')) {
            // 5.5 kW Electric Motor
            explodeOffset = { x: 0, y: 0, z: 300 };
            assignedMat = this.materials.motorHousing;
            partCategory = 'motor';
          } else if (name.includes('spa-a902')) {
            // Motor Input Pulley
            explodeOffset = { x: -200, y: 0, z: 300 };
            assignedMat = this.materials.pulleyCast;
            partCategory = 'pulley';
            this.rotors.motorGroup.push(child);
          } else if (name.includes('bushing_1610')) {
            // Motor Taper Bush
            explodeOffset = { x: -250, y: 0, z: 300 };
            assignedMat = this.materials.hardwareZinc;
            partCategory = 'hardware';
          } else if (name.includes('06_011') || name.includes('06_580') || name.includes('tensioner')) {
            // SE38 Rubber Tensioner Unit & Roller
            explodeOffset = { x: -220, y: 120, z: 160 };
            assignedMat = this.materials.tensioner;
            partCategory = 'tensioner';
          } else if ((name.includes('hex bolt') || name.includes('nut_din')) && tz > 250) {
            // Motor mounting bolts & nuts
            explodeOffset = { x: 0, y: 0, z: 300 };
            assignedMat = this.materials.hardwareZinc;
            partCategory = 'hardware';

          // 4. Shaft 2 & mounted parts (Tz ≈ 87, Ty ≈ 272.5) -> Explodes forward (+Z) & along X
          } else if (name.includes('shaft2')) {
            explodeOffset = { x: 0, y: 0, z: 120 };
            assignedMat = this.materials.shaftSteel;
            partCategory = 'shaft';
            this.rotors.shaft2Group.push(child);
          } else if (name.includes('spa-a2802')) {
            explodeOffset = { x: -280, y: 0, z: 120 };
            assignedMat = this.materials.pulleyCast;
            partCategory = 'pulley';
            this.rotors.shaft2Group.push(child);
          } else if (name.includes('bushing_2517')) {
            explodeOffset = { x: -330, y: 0, z: 120 };
            assignedMat = this.materials.hardwareZinc;
            partCategory = 'hardware';
          } else if (name.includes('yg4-22_40mm')) {
            explodeOffset = { x: 200, y: 0, z: 120 };
            assignedMat = this.materials.gearSteel;
            partCategory = 'gear';
            this.rotors.shaft2Group.push(child);
          } else if (name.trim() === '14x9x56 key' && tz > 0) {
            explodeOffset = { x: 180, y: 40, z: 120 };
            assignedMat = this.materials.hardwareZinc;
            partCategory = 'hardware';
          } else if (name.includes('12x8x35 key')) {
            explodeOffset = { x: -220, y: 40, z: 120 };
            assignedMat = this.materials.hardwareZinc;
            partCategory = 'hardware';
          } else if (name.includes('endcap washer_2') || (name.includes('hex bolt') && Math.abs(tz - 87) < 5 && tx > 300)) {
            explodeOffset = { x: 270, y: 0, z: 120 };
            assignedMat = this.materials.hardwareZinc;
            partCategory = 'hardware';

          // 5. Shaft 3 & mounted parts (Tz ≈ -155, Ty ≈ 272.5) -> Explodes downward (-Y) & along X
          } else if (name.includes('shaft3')) {
            explodeOffset = { x: 0, y: -140, z: -40 };
            assignedMat = this.materials.shaftSteel;
            partCategory = 'shaft';
            this.rotors.shaft3Group.push(child);
          } else if (name.includes('yg4-99') && !name.includes('50mm')) {
            explodeOffset = { x: 200, y: -140, z: -40 };
            assignedMat = this.materials.gearSteel;
            partCategory = 'gear';
            this.rotors.shaft3Group.push(child);
          } else if (name.includes('yg4-22') && !name.includes('40mm')) {
            explodeOffset = { x: -180, y: -140, z: -40 };
            assignedMat = this.materials.gearSteel;
            partCategory = 'gear';
            this.rotors.shaft3Group.push(child);
          } else if (name.includes('14x9x56 key_4')) {
            explodeOffset = { x: 180, y: -100, z: -40 };
            assignedMat = this.materials.hardwareZinc;
            partCategory = 'hardware';
          } else if (name.includes('14x9x56 key_2')) {
            explodeOffset = { x: -160, y: -100, z: -40 };
            assignedMat = this.materials.hardwareZinc;
            partCategory = 'hardware';
          } else if (name.includes('endcap washer_3') || (name.includes('hex bolt') && Math.abs(tz - (-155)) < 5 && tx > 300 && ty < 350)) {
            explodeOffset = { x: 270, y: -140, z: -40 };
            assignedMat = this.materials.hardwareZinc;
            partCategory = 'hardware';
          } else if (name.includes('endcap washer_1') || (name.includes('hex bolt') && Math.abs(tz - (-155)) < 5 && tx < -80 && ty < 350)) {
            explodeOffset = { x: -250, y: -140, z: -40 };
            assignedMat = this.materials.hardwareZinc;
            partCategory = 'hardware';

          // 6. Shaft 4 & mounted parts (Tz ≈ -153, Ty ≈ 514.5) -> Explodes upward (+Y) & along X
          } else if (name.includes('shaft4')) {
            explodeOffset = { x: 0, y: 140, z: 0 };
            assignedMat = this.materials.shaftSteel;
            partCategory = 'shaft';
            this.rotors.shaft4Group.push(child);
          } else if (name.includes('yg4-99 - 50mm')) {
            explodeOffset = { x: 180, y: 140, z: 0 };
            assignedMat = this.materials.gearSteel;
            partCategory = 'gear';
            this.rotors.shaft4Group.push(child);
          } else if (name.includes('yh4-30 fixed')) {
            explodeOffset = { x: -200, y: 140, z: 0 };
            assignedMat = this.materials.gearSteel;
            partCategory = 'gear';
            this.rotors.shaft4Group.push(child);
          } else if (name.includes('14x9x56 key_1')) {
            explodeOffset = { x: 150, y: 180, z: 0 };
            assignedMat = this.materials.hardwareZinc;
            partCategory = 'hardware';
          } else if (name.includes('14x9x56 key_3')) {
            explodeOffset = { x: -170, y: 180, z: 0 };
            assignedMat = this.materials.hardwareZinc;
            partCategory = 'hardware';
          } else if (name.includes('endcap washer_4') || (name.includes('hex bolt') && Math.abs(tz - (-153)) < 5 && tx > -50 && ty > 450 && ty < 600)) {
            explodeOffset = { x: 250, y: 140, z: 0 };
            assignedMat = this.materials.hardwareZinc;
            partCategory = 'hardware';
          } else if ((name.includes('endcap washer') && !name.includes('washer_')) || (name.includes('hex bolt') && Math.abs(tz - (-153)) < 5 && tx < -350 && ty > 450 && ty < 600)) {
            explodeOffset = { x: -270, y: 140, z: 0 };
            assignedMat = this.materials.hardwareZinc;
            partCategory = 'hardware';

          // 7. Final Stage Bull Gear / Turntable (Ty ≈ 847) -> Lifts high in +Y
          } else if (name.includes('yg4-135')) {
            explodeOffset = { x: -60, y: 280, z: 0 };
            assignedMat = this.materials.gearSteel;
            partCategory = 'bullgear';
            this.rotors.turntableGroup.push(child);
          } else if (name.includes('18x11x56 key')) {
            explodeOffset = { x: -60, y: 310, z: 0 };
            assignedMat = this.materials.hardwareZinc;
            partCategory = 'hardware';
          } else if (name.includes('bigger endcap washer') || (name.includes('hex bolt') && ty > 700)) {
            explodeOffset = { x: -60, y: 340, z: 0 };
            assignedMat = this.materials.hardwareZinc;
            partCategory = 'hardware';

          // 8. Fallback
          } else {
            explodeOffset = { x: 0, y: 0, z: 0 };
            assignedMat = this.materials.frameSteel;
            partCategory = 'frame';
          }

          // Clean vertex attributes
          if (child.geometry.attributes.color) {
            child.geometry.deleteAttribute('color');
          }
          if (!child.geometry.attributes.normal) {
            child.geometry.computeVertexNormals();
          }

          child.material = assignedMat;

          const partData = {
            mesh: child,
            name: name,
            category: partCategory,
            origPos: origPos,
            explodeOffset: explodeOffset,
            defaultMaterial: assignedMat
          };

          this.parts.push(partData);
          this.partMeshMap[name] = partData;
        }
      });

      this.machineGroup.add(root);
      console.log(`Loaded Rebar Bender 3D CAD: ${this.parts.length} mechanical parts mapped with industrial PBR materials.`);

      const loaderElem = document.getElementById('rebar-cad-loader');
      if (loaderElem) loaderElem.style.display = 'none';
    };

    // Support embedded base64 for 100% offline & file:/// execution
    if (typeof window !== 'undefined' && window.REBAR_BENDER_GLB_BASE64) {
      try {
        const binaryStr = window.atob(window.REBAR_BENDER_GLB_BASE64);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        loader.parse(bytes.buffer, '', onModelLoaded, (err) => {
          console.error("Error parsing embedded GLTF buffer:", err);
        });
        return;
      } catch (err) {
        console.warn("Embedded GLTF decoding error, falling back to URL loader:", err);
      }
    }

    loader.load(
      this.modelUrl,
      onModelLoaded,
      undefined,
      (err) => {
        console.error("Error loading Rebar Bender GLB:", err);
        const loaderElem = document.getElementById('rebar-cad-loader');
        if (loaderElem) {
          loaderElem.innerHTML = '<span style="color:#ef4444; font-size:0.8rem;">Security Notice: Opening via file:// blocks external assets. Include rebar-bender-model-data.js for standalone offline viewing.</span>';
        }
      }
    );
  }

  setExplodedView(factor) {
    this.explodedFactor = Math.max(0, Math.min(1, factor));
    this.parts.forEach((p) => {
      p.mesh.position.x = p.origPos.x + p.explodeOffset.x * this.explodedFactor;
      p.mesh.position.y = p.origPos.y + p.explodeOffset.y * this.explodedFactor;
      p.mesh.position.z = p.origPos.z + p.explodeOffset.z * this.explodedFactor;
    });

    if (this.controls) {
      // Dynamic camera tracking keeping the expanding powertrain centered
      const baseTargetY = 560;
      const explodedTargetY = 620;
      const newTargetY = baseTargetY + (explodedTargetY - baseTargetY) * this.explodedFactor;
      const deltaY = newTargetY - this.controls.target.y;
      this.controls.target.y = newTargetY;
      this.camera.position.y += deltaY;
      this.controls.update();
    }
  }

  setDisplayMode(mode) {
    this.displayMode = mode;
    this.parts.forEach((p) => {
      if (mode === 'wireframe') {
        if (p.category === 'gear' || p.category === 'bullgear') {
          p.mesh.material = this.materials.gearWire;
        } else if (p.category === 'shaft') {
          p.mesh.material = this.materials.shaftWire;
        } else if (p.category === 'motor' || p.category === 'pulley') {
          p.mesh.material = this.materials.motorWire;
        } else if (p.category === 'hardware') {
          p.mesh.material = this.materials.hardwareWire;
        } else {
          p.mesh.material = this.materials.frameWire;
        }
      } else if (mode === 'xray') {
        if (p.category === 'frame' || p.category === 'bearing') {
          p.mesh.material = this.materials.frameGhost;
        } else {
          p.mesh.material = p.defaultMaterial;
        }
      } else {
        p.mesh.material = p.defaultMaterial;
      }
    });
  }

  setFrameColor(hex) {
    this.frameColor = hex;
    this.materials.frameSteel.color.set(hex);
    if (this.materials.frameGhost) {
      this.materials.frameGhost.color.set(hex);
    }
    this.parts.forEach((p) => {
      if (p.category === 'frame' && p.mesh.material && p.mesh.material.color) {
        if (!p.mesh.material.wireframe) p.mesh.material.color.set(hex);
      }
    });
  }

  setGearColor(hex) {
    this.gearColor = hex;
    this.materials.gearSteel.color.set(hex);
    this.parts.forEach((p) => {
      if ((p.category === 'gear' || p.category === 'bullgear') && p.mesh.material && p.mesh.material.color) {
        if (!p.mesh.material.wireframe) p.mesh.material.color.set(hex);
      }
    });
  }

  setHousingColor(hex) {
    this.housingColor = hex;
    this.materials.bearingHousing.color.set(hex);
    this.parts.forEach((p) => {
      if (p.category === 'bearing' && p.mesh.material && p.mesh.material.color) {
        if (!p.mesh.material.wireframe) p.mesh.material.color.set(hex);
      }
    });
  }

  setMotorColor(hex) {
    this.motorColor = hex;
    this.materials.motorHousing.color.set(hex);
    this.parts.forEach((p) => {
      if (p.category === 'motor' && p.mesh.material && p.mesh.material.color) {
        if (!p.mesh.material.wireframe) p.mesh.material.color.set(hex);
      }
    });
  }

  toggleTurntable() {
    this.isRotating = !this.isRotating;
    return this.isRotating;
  }

  toggleKinematics() {
    this.isKinematicsRunning = !this.isKinematicsRunning;
    return this.isKinematicsRunning;
  }

  resetCamera() {
    if (this.controls) {
      this.controls.target.set(0, 560, 0);
      this.camera.position.set(-1850, 1150, 1650);
      this.controls.update();
    }
  }

  setupEventListeners() {}

  animate() {
    requestAnimationFrame(this.animate);

    if (this.controls) {
      this.controls.update();
    }

    if (this.isRotating && this.machineGroup) {
      this.machineGroup.rotation.y += this.turntableSpeed;
    }

    // Kinematic gear reduction rotation (proportional to 279.3:1 reduction ratios)
    // All shafts run along world X axis
    if (this.isKinematicsRunning) {
      const baseMotorSpeed = 0.08;
      const shaft2Speed = baseMotorSpeed / 3.111;              // 280:90 V-Belt ratio
      const shaft3Speed = -shaft2Speed / (99.0 / 22.0);        // 99:22 spur reduction
      const shaft4Speed = -shaft3Speed / (99.0 / 22.0);        // 99:22 spur reduction
      const bullSpeed = -shaft4Speed / (135.0 / 30.0);         // 135:30 bull gear reduction

      // Rotate motor & small pulley around world X axis
      this.rotors.motorGroup.forEach(m => { m.rotateOnWorldAxis(this.worldAxisX, baseMotorSpeed); });
      // Rotate shaft 2, driven pulley & pinion 1 around world X axis
      this.rotors.shaft2Group.forEach(m => { m.rotateOnWorldAxis(this.worldAxisX, shaft2Speed); });
      // Rotate shaft 3 & intermediate gears around world X axis
      this.rotors.shaft3Group.forEach(m => { m.rotateOnWorldAxis(this.worldAxisX, shaft3Speed); });
      // Rotate shaft 4 & intermediate gears around world X axis
      this.rotors.shaft4Group.forEach(m => { m.rotateOnWorldAxis(this.worldAxisX, shaft4Speed); });
      // Rotate final turntable bull gear around world X axis
      this.rotors.turntableGroup.forEach(m => { m.rotateOnWorldAxis(this.worldAxisX, bullSpeed); });
    }

    this.renderer.render(this.scene, this.camera);
  }
}