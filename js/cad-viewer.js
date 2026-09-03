/**
 * =========================================================================
 * EMBEDDED 3D CAD & MECHANICAL TRANSMISSION VIEWER
 * Real-time WebGL Three.js Gearbox & Mechanism Viewer for Project Modals
 * =========================================================================
 */

class ProjectCadViewer {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.explodedFactor = 0;
    this.displayMode = 'solid';
    this.isKinematicsRunning = true;
    this.gearSpeed = 0.02;

    this.parts = [];
    this.materials = {};

    this.initThree();
    this.createMaterials();
    this.buildTransmissionAssembly();
    this.setupEventListeners();
    this.animate();
  }

  initThree() {
    const width = this.canvas.parentElement.clientWidth || 700;
    const height = this.canvas.parentElement.clientHeight || 380;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x080c14);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(28, 22, 34);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;

    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.06;
      this.controls.maxDistance = 120;
      this.controls.minDistance = 10;
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight1.position.set(30, 40, 20);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight2.position.set(-20, -20, -20);
    this.scene.add(dirLight2);

    const gridHelper = new THREE.GridHelper(60, 30, 0x38bdf8, 0x1f2937);
    gridHelper.position.y = -10;
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);
  }

  createMaterials() {
    this.materials.steelGears = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.85,
      roughness: 0.25
    });

    this.materials.pinionBronze = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.75,
      roughness: 0.2
    });

    this.materials.bullGearGold = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.85,
      roughness: 0.2
    });

    this.materials.shaftSteel = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.15
    });

    this.materials.wireframe = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });

    this.materials.feaStress = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      vertexColors: true,
      metalness: 0.2,
      roughness: 0.5
    });
  }

  createGearGeometry(radius, thickness, numTeeth, toothHeight = 0.7, holeRadius = 1.2) {
    const shape = new THREE.Shape();
    const toothAngle = (Math.PI * 2) / numTeeth;

    for (let i = 0; i < numTeeth; i++) {
      const a1 = i * toothAngle;
      const a2 = a1 + toothAngle * 0.25;
      const a3 = a1 + toothAngle * 0.5;
      const a4 = a1 + toothAngle * 0.75;

      const rRoot = radius - toothHeight * 0.5;
      const rTip = radius + toothHeight * 0.5;

      const x1 = Math.cos(a1) * rRoot;
      const y1 = Math.sin(a1) * rRoot;
      const x2 = Math.cos(a2) * rTip;
      const y2 = Math.sin(a2) * rTip;
      const x3 = Math.cos(a3) * rTip;
      const y3 = Math.sin(a3) * rTip;
      const x4 = Math.cos(a4) * rRoot;
      const y4 = Math.sin(a4) * rRoot;

      if (i === 0) shape.moveTo(x1, y1);
      else shape.lineTo(x1, y1);

      shape.lineTo(x2, y2);
      shape.lineTo(x3, y3);
      shape.lineTo(x4, y4);
    }

    if (holeRadius > 0) {
      const holePath = new THREE.Path();
      holePath.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
      shape.holes.push(holePath);
    }

    const extrudeSettings = {
      depth: thickness,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.1,
      bevelThickness: 0.1
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    this.applyFeaStressVertexColors(geom, radius);
    return geom;
  }

  applyFeaStressVertexColors(geometry, outerRadius) {
    const count = geometry.attributes.position.count;
    const colors = [];
    const color = new THREE.Color();
    const pos = geometry.attributes.position;

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const dist = Math.sqrt(x * x + y * y);

      let stressRatio = 0.15;
      if (Math.abs(dist - outerRadius * 0.85) < outerRadius * 0.2) {
        stressRatio = 0.85 + Math.sin(Math.atan2(y, x) * 10) * 0.15;
      } else if (dist < outerRadius * 0.3) {
        stressRatio = 0.25;
      } else {
        stressRatio = 0.45;
      }

      if (stressRatio < 0.33) color.setHSL(0.6 - stressRatio * 0.8, 1.0, 0.5);
      else if (stressRatio < 0.66) color.setHSL(0.33 - (stressRatio - 0.33) * 0.6, 1.0, 0.5);
      else color.setHSL(0.12 - (stressRatio - 0.66) * 0.36, 1.0, 0.5);

      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  }

  buildTransmissionAssembly() {
    this.assemblyGroup = new THREE.Group();
    this.scene.add(this.assemblyGroup);

    // 1. Stage 1: Motor Pinion (High Speed)
    const pinionGeom = this.createGearGeometry(2.4, 2.0, 12, 0.6, 0.8);
    this.pinion1 = new THREE.Mesh(pinionGeom, this.materials.pinionBronze);
    this.pinion1.position.set(-14, 0, 0);
    this.assemblyGroup.add(this.pinion1);

    // Shaft 1
    const shaft1Geom = new THREE.CylinderGeometry(0.7, 0.7, 10, 16);
    const shaft1 = new THREE.Mesh(shaft1Geom, this.materials.shaftSteel);
    shaft1.rotation.x = Math.PI / 2;
    this.pinion1.add(shaft1);

    this.parts.push({
      mesh: this.pinion1,
      basePos: new THREE.Vector3(-14, 0, 0),
      explodeVector: new THREE.Vector3(-6, 0, 0),
      speedMult: 4.0,
      type: 'pinion'
    });

    // 2. Stage 2: Intermediate Countershaft 1
    const gear2Geom = this.createGearGeometry(5.2, 2.0, 24, 0.6, 1.2);
    this.gear2 = new THREE.Mesh(gear2Geom, this.materials.steelGears);
    this.gear2.position.set(-6.5, 0, 0);
    this.assemblyGroup.add(this.gear2);

    const pinion2Geom = this.createGearGeometry(2.6, 2.0, 13, 0.6, 1.2);
    this.pinion2 = new THREE.Mesh(pinion2Geom, this.materials.pinionBronze);
    this.pinion2.position.z = 2.4;
    this.gear2.add(this.pinion2);

    this.parts.push({
      mesh: this.gear2,
      basePos: new THREE.Vector3(-6.5, 0, 0),
      explodeVector: new THREE.Vector3(-2, 0, 4),
      speedMult: -2.0,
      type: 'gear'
    });

    // 3. Stage 3: Intermediate Countershaft 2
    const gear3Geom = this.createGearGeometry(6.4, 2.2, 28, 0.65, 1.4);
    this.gear3 = new THREE.Mesh(gear3Geom, this.materials.steelGears);
    this.gear3.position.set(2.5, 0, 2.4);
    this.assemblyGroup.add(this.gear3);

    const pinion3Geom = this.createGearGeometry(2.8, 2.2, 14, 0.65, 1.4);
    this.pinion3 = new THREE.Mesh(pinion3Geom, this.materials.pinionBronze);
    this.pinion3.position.z = 2.6;
    this.gear3.add(this.pinion3);

    this.parts.push({
      mesh: this.gear3,
      basePos: new THREE.Vector3(2.5, 0, 2.4),
      explodeVector: new THREE.Vector3(2, 0, -4),
      speedMult: 1.0,
      type: 'gear'
    });

    // 4. Stage 4: Massive Output Bull Gear & Rebar Bending Turntable
    const bullGearGeom = this.createGearGeometry(9.2, 3.2, 38, 0.8, 2.2);
    this.bullGear = new THREE.Mesh(bullGearGeom, this.materials.bullGearGold);
    this.bullGear.position.set(13.5, 0, 5.0);
    this.assemblyGroup.add(this.bullGear);

    // Turntable Bending Pin
    const pinGeom = new THREE.CylinderGeometry(1.0, 1.0, 4.5, 16);
    const pin = new THREE.Mesh(pinGeom, this.materials.shaftSteel);
    pin.position.set(3.5, 0, 2.2);
    pin.rotation.x = Math.PI / 2;
    this.bullGear.add(pin);

    this.parts.push({
      mesh: this.bullGear,
      basePos: new THREE.Vector3(13.5, 0, 5.0),
      explodeVector: new THREE.Vector3(6, 0, 6),
      speedMult: -0.35,
      type: 'bull'
    });

    this.assemblyGroup.rotation.x = 0.35;
    this.assemblyGroup.rotation.y = -0.4;
  }

  setExplodedView(factor) {
    this.explodedFactor = Math.max(0, Math.min(1, factor));
    this.parts.forEach(part => {
      part.mesh.position.copy(part.basePos).addScaledVector(part.explodeVector, this.explodedFactor);
    });
  }

  setDisplayMode(mode) {
    this.displayMode = mode;
    const isWire = mode === 'wireframe';
    const isFea = mode === 'fea';

    this.parts.forEach(part => {
      if (isWire) {
        part.mesh.material = this.materials.wireframe;
      } else if (isFea) {
        part.mesh.material = this.materials.feaStress;
      } else {
        if (part.type === 'pinion') part.mesh.material = this.materials.pinionBronze;
        else if (part.type === 'bull') part.mesh.material = this.materials.bullGearGold;
        else part.mesh.material = this.materials.steelGears;
      }
    });
  }

  toggleKinematics(running) {
    this.isKinematicsRunning = running !== undefined ? running : !this.isKinematicsRunning;
  }

  resetCamera() {
    this.camera.position.set(28, 22, 34);
    if (this.controls) {
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      if (!this.canvas || !this.canvas.parentElement) return;
      const width = this.canvas.parentElement.clientWidth;
      const height = this.canvas.parentElement.clientHeight || 380;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.controls) {
      this.controls.update();
    }

    if (this.isKinematicsRunning && this.explodedFactor < 0.6) {
      this.parts.forEach(part => {
        part.mesh.rotation.z += this.gearSpeed * part.speedMult;
      });
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.ProjectCadViewer = ProjectCadViewer;
