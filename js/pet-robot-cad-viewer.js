/**
 * =========================================================================
 * SMART PET COMPANION ROBOT — INTERACTIVE 3D CAD VIEWER (THREE.JS / WEBGL)
 * Realistic Engineering Polymer / 3D Printed Satin Plastic PBR Shading
 * Real-time GLB assembly viewer with Exploded Views and Material Customization.
 * Supports in-memory parsing for 100% offline & file:/// execution.
 * =========================================================================
 */

class PetRobotCadViewer {
  constructor(canvasId, modelUrl, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.modelUrl = modelUrl || '../assets/models/pet-robot-assembly.glb';
    this.explodedFactor = 0;
    this.displayMode = 'solid';
    this.isRotating = false;
    this.isRotorSpinning = false;
    this.turntableSpeed = 0.005;

    // Palette states - Authentic high-grade molded polymer & PLA
    this.shellColor = '#e8ecf2';
    this.acrylicColor = '#7c3aed';
    this.rotorColor = '#f97316';

    this.parts = [];
    this.partMeshMap = {};
    this.materials = {};
    this.rotorMesh = null;
    this.gateMesh = null;
    this.isGateOpen = false;
    this.gateCurrentAngle = 0;
    this.gateTargetAngle = 0;
    this.gateOpenAngle = 1.62; // ~93 deg rotation: fully clears cutout with generous physical clearance before internal arms

    this.initThree();
    this.createMaterials();
    this.loadGlbModel();
    this.setupEventListeners();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    const parent = this.canvas.parentElement;
    const width = parent.clientWidth || 720;
    const height = parent.clientHeight || 440;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e17);

    this.camera = new THREE.PerspectiveCamera(40, width / height, 1, 3000);
    this.camera.position.set(-310, 240, -400);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = false; // Prevents shadow acne on complex CAD bevels
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;

    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.target.set(0, 135, 0);
      this.controls.maxDistance = 900;
      this.controls.minDistance = 80;
      this.controls.update();
    }

    // Studio Multi-Point Lighting to Sculpt 3D Volume & Form Depth
    // 1. Hemisphere Ambient: Soft sky daylight + deep slate bounce (naturally shades creases & recesses)
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 0.50);
    hemiLight.position.set(0, 400, 0);
    this.scene.add(hemiLight);

    // 2. Primary Key Light: Directional warm sunlight sculpting curvature highlights and depth gradient
    const keyLight = new THREE.DirectionalLight(0xfffbf5, 1.25);
    keyLight.position.set(-240, 360, -240);
    this.scene.add(keyLight);

    // 3. Counter-Fill Light: Cool blue-tinted fill balancing the shadow side
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.45);
    fillLight.position.set(240, 160, 200);
    this.scene.add(fillLight);

    // 4. Back / Rim Light: Sharp silhouette edge-defining rim light
    const rimLight = new THREE.DirectionalLight(0xc084fc, 0.50);
    rimLight.position.set(0, 260, 320);
    this.scene.add(rimLight);

    // 5. Front Detail Light: Soft head-on fill for treat shooter slot, camera port & LED star mounts
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.35);
    frontLight.position.set(-180, 140, -260);
    this.scene.add(frontLight);

    // 6. Underside Uplight (Directional): Illuminates acrylic chassis baseplate, wheel wells & internal drivetrain
    const underDirLight = new THREE.DirectionalLight(0xe2e8f0, 0.70);
    underDirLight.position.set(-30, -200, -30);
    underDirLight.target.position.set(0, 50, 0);
    this.scene.add(underDirLight);
    this.scene.add(underDirLight.target);

    // 7. Underside Point Glow: Soft local uplight accentuating laser-cut acrylic plate transparency
    const underPointLight = new THREE.PointLight(0xa5b4fc, 0.75, 260, 1.2);
    underPointLight.position.set(0, -25, 0);
    this.scene.add(underPointLight);

    // Ground Grid
    const gridHelper = new THREE.GridHelper(360, 24, 0x38bdf8, 0x1f293d);
    gridHelper.position.y = 0;
    gridHelper.material.opacity = 0.22;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);

    // Robot Root Group
    this.robotGroup = new THREE.Group();
    this.scene.add(this.robotGroup);

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
    // 1. Technical Engineering Plastic (Satin Molded / 3D-Printed Polymer)
    // Clearcoat creates the authentic plastic Fresnel reflection rim along silhouettes, revealing form and depth
    this.materials.shell = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(this.shellColor),
      metalness: 0.0,
      roughness: 0.32,
      clearcoat: 0.40,
      clearcoatRoughness: 0.20,
      reflectivity: 0.5,
      side: THREE.DoubleSide
    });

    // 1b. Ghosted Shell for X-Ray Mode
    this.materials.shellGhost = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(this.shellColor),
      metalness: 0.0,
      roughness: 0.32,
      clearcoat: 0.40,
      clearcoatRoughness: 0.20,
      reflectivity: 0.5,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    // 2. Laser-Cut Acrylic Chassis Plate (Physical Opaque Polymer)
    this.materials.acrylic = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(this.acrylicColor),
      metalness: 0.02,
      roughness: 0.12,
      transparent: false,
      opacity: 1.0,
      clearcoat: 0.85,
      clearcoatRoughness: 0.10,
      side: THREE.DoubleSide
    });

    // 3. Centrifugal Launcher Rotor (Glossy Molded Polymer)
    this.materials.rotor = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(this.rotorColor),
      metalness: 0.01,
      roughness: 0.25,
      clearcoat: 0.50,
      clearcoatRoughness: 0.15,
      ior: 1.48,
      side: THREE.DoubleSide
    });

    // 4. Dark Technical Hardware (Internal brackets, camera aperture, rails)
    this.materials.darkHardware = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x1a202c),
      metalness: 0.10,
      roughness: 0.44,
      clearcoat: 0.18,
      clearcoatRoughness: 0.30,
      side: THREE.DoubleSide
    });

    // 5. Custom CNC-Routed PCB Tray (FR4 Green Resin)
    this.materials.pcb = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x047857),
      metalness: 0.08,
      roughness: 0.32,
      clearcoat: 0.35,
      clearcoatRoughness: 0.20,
      side: THREE.DoubleSide
    });

    // 6. Metallic Standoffs / Hardware
    this.materials.metal = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xa1a1aa),
      metalness: 0.85,
      roughness: 0.22,
      side: THREE.DoubleSide
    });

    // Component Category-Specific Wireframe Materials
    this.materials.shellWire = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.shellColor === '#18181b' ? '#64748b' : this.shellColor),
      wireframe: true
    });

    this.materials.acrylicWire = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.acrylicColor === '#1e293b' ? '#64748b' : this.acrylicColor),
      wireframe: true
    });

    this.materials.rotorWire = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.rotorColor),
      wireframe: true
    });

    this.materials.darkHardwareWire = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x64748b), // Sleek gunmetal slate for all internal parts
      wireframe: true
    });

    this.materials.metalWire = this.materials.darkHardwareWire;

    this.materials.wireframe = this.materials.shellWire;
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
          const name = child.name || '';
          const origPos = child.position.clone();

          let explodeOffset = { x: 0, y: 0, z: 0 };
          let assignedMat = this.materials.shell;

          if (name.includes('top_dome')) {
            explodeOffset = { x: 0, y: 405, z: 0 };
            assignedMat = this.materials.shell;
          } else if (name.includes('launcher_motor_bracket')) {
            explodeOffset = { x: 0, y: 340, z: 0 };
            assignedMat = this.materials.darkHardware; // Same colour as other internals
          } else if (name.includes('hopper')) {
            explodeOffset = { x: 0, y: 325, z: 0 };
            assignedMat = this.materials.darkHardware;
          } else if (name.includes('middle_camera_battery_shell') || name.includes('battery_rail')) {
            explodeOffset = { x: 0, y: 305, z: 0 }; // Rails stay firmly attached to battery compartment
            assignedMat = this.materials.shell;
          } else if (name.includes('battery_door')) {
            explodeOffset = { x: 0, y: 305, z: -60 }; // Slides out backwards
            assignedMat = this.materials.shell;
          } else if (name.includes('camera_lens_clamp')) {
            explodeOffset = { x: 0, y: 305, z: 0 }; // Explodes straight UP with camera shell
            assignedMat = this.materials.shell;
          } else if (name.includes('shell_mid_upper')) {
            explodeOffset = { x: 0, y: 240, z: 0 };
            assignedMat = this.materials.shell;
          } else if (name.includes('treat_chute_door') || name.includes('servo_shutter_gate')) {
            // Upper door for the treat chute
            explodeOffset = { x: 0, y: 210, z: 0 };
            assignedMat = this.materials.darkHardware;
          } else if (name.includes('treat_dispenser_rotor') || (name.includes('rotor') && !name.includes('housing'))) {
            // The ROTOR: The flat disc with a chunk in it at the treat slot
            explodeOffset = { x: 0, y: 195, z: 0 };
            assignedMat = this.materials.rotor;
            this.rotorMesh = child;
          } else if (name.includes('servo_dispenser_gate') || name.includes('shell_slot_baffle') || (name.includes('gate') && !name.includes('chute'))) {
            // Dispenser gate in front of the rotor (Solid 12)
            explodeOffset = { x: 0, y: 170, z: 0 };
            assignedMat = this.materials.shell;
            this.gateMesh = child;
          } else if (name.includes('treat_shooter_ramp') || name.includes('treat_guide_chute')) {
            explodeOffset = { x: 0, y: 145, z: 0 };
            assignedMat = this.materials.darkHardware;
          } else if (name.includes('shell_shooter_housing')) {
            // Treat slot shell housing
            explodeOffset = { x: 0, y: 110, z: 0 };
            assignedMat = this.materials.shell;
          } else if (name.includes('bayonet_interlock_ring')) {
            explodeOffset = { x: 0, y: 65, z: 0 };
            assignedMat = this.materials.metal;
          } else if (name.includes('shell_lower_electronics')) {
            explodeOffset = { x: 0, y: 45, z: 0 };
            assignedMat = this.materials.shell;
          } else if (name.includes('chassis_drive_skirt')) {
            explodeOffset = { x: 0, y: 18, z: 0 };
            assignedMat = this.materials.shell;
          } else if (name.includes('shell_base_drivetrain_mount') || name.includes('drivetrain_core') || name.includes('motor_mount')) {
            explodeOffset = { x: 0, y: -25, z: 0 };
            assignedMat = this.materials.darkHardware; // Same colour as the other internals
          } else if (name.includes('chassis_acrylic_base')) {
            explodeOffset = { x: 0, y: -65, z: 0 }; // Drops down
            assignedMat = this.materials.acrylic;
          } else {
            explodeOffset = { x: 0, y: 0, z: 0 };
            assignedMat = this.materials.shell;
          }

          // Strip vertex color attributes to avoid tinting
          if (child.geometry.attributes.color) {
            child.geometry.deleteAttribute('color');
          }

          // Ensure clean vertex normals are computed smoothly across shared vertices
          if (!child.geometry.attributes.normal) child.geometry.computeVertexNormals();

          child.material = assignedMat;

          const partData = {
            mesh: child,
            name: name,
            origPos: origPos,
            explodeOffset: explodeOffset,
            defaultMaterial: assignedMat,
            isShell: (assignedMat === this.materials.shell),
            isAcrylic: (assignedMat === this.materials.acrylic),
            isRotor: (assignedMat === this.materials.rotor)
          };

          this.parts.push(partData);
          this.partMeshMap[name] = partData;
        }
      });

      this.robotGroup.add(root);
      console.log(`Loaded Pet Robot 3D CAD model: ${this.parts.length} parts mapped with realistic plastic materials.`);

      const loaderElem = document.getElementById('pet-cad-loader');
      if (loaderElem) loaderElem.style.display = 'none';
    };

    if (typeof window !== 'undefined' && window.PET_ROBOT_GLB_BASE64) {
      try {
        const binaryStr = window.atob(window.PET_ROBOT_GLB_BASE64);
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
        console.error("Error loading Pet Robot GLB:", err);
        const loaderElem = document.getElementById('pet-cad-loader');
        if (loaderElem) {
          loaderElem.innerHTML = '<span style="color:#ef4444; font-size:0.8rem;">Security Notice: Opening via file:// blocks external assets. Include pet-robot-model-data.js for standalone offline viewing.</span>';
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
      // Dynamic vertical tracking and distance scaling to keep the entire exploded assembly perfectly framed
      const baseTargetY = 135;
      const explodedTargetY = 285;
      const newTargetY = baseTargetY + (explodedTargetY - baseTargetY) * this.explodedFactor;
      const deltaY = newTargetY - this.controls.target.y;
      this.controls.target.y = newTargetY;
      this.camera.position.y += deltaY;

      const baseDist = 550;
      const targetDist = 950;
      const desiredDist = baseDist + (targetDist - baseDist) * this.explodedFactor;
      const offset = this.camera.position.clone().sub(this.controls.target);
      offset.setLength(desiredDist);
      this.camera.position.copy(this.controls.target).add(offset);
      this.controls.update();
    }
  }

  setDisplayMode(mode) {
    this.displayMode = mode;
    this.parts.forEach((p) => {
      if (mode === 'wireframe') {
        if (p.isShell) {
          p.mesh.material = this.materials.shellWire;
        } else if (p.isAcrylic) {
          p.mesh.material = this.materials.acrylicWire;
        } else if (p.isRotor) {
          p.mesh.material = this.materials.rotorWire;
        } else {
          p.mesh.material = this.materials.darkHardwareWire;
        }
      } else if (mode === 'xray') {
        if (p.isShell) {
          p.mesh.material = this.materials.shellGhost;
        } else {
          p.mesh.material = p.defaultMaterial;
        }
      } else {
        p.mesh.material = p.defaultMaterial;
      }
    });
  }

  setShellColor(hex) {
    this.shellColor = hex;
    this.materials.shell.color.set(hex);
    if (this.materials.shellGhost) {
      this.materials.shellGhost.color.set(hex);
    }
    const wireColor = hex === '#18181b' ? '#64748b' : hex;
    if (this.materials.shellWire) {
      this.materials.shellWire.color.set(wireColor);
    }
    this.parts.forEach((p) => {
      if (p.isShell && p.mesh.material && p.mesh.material.color) {
        p.mesh.material.color.set(p.mesh.material.wireframe ? wireColor : hex);
      }
    });
  }

  setAcrylicColor(hex) {
    this.acrylicColor = hex;
    this.materials.acrylic.color.set(hex);
    const wireColor = hex === '#1e293b' ? '#64748b' : hex;
    if (this.materials.acrylicWire) {
      this.materials.acrylicWire.color.set(wireColor);
    }
    this.parts.forEach((p) => {
      if (p.isAcrylic && p.mesh.material && p.mesh.material.color) {
        p.mesh.material.color.set(p.mesh.material.wireframe ? wireColor : hex);
      }
    });
  }

  setRotorColor(hex) {
    this.rotorColor = hex;
    this.materials.rotor.color.set(hex);
    if (this.materials.rotorWire) {
      this.materials.rotorWire.color.set(hex);
    }
    this.parts.forEach((p) => {
      if (p.isRotor && p.mesh.material && p.mesh.material.color) {
        p.mesh.material.color.set(hex);
      }
    });
  }

  toggleTurntable() {
    this.isRotating = !this.isRotating;
    return this.isRotating;
  }

  toggleRotorSpin() {
    this.isRotorSpinning = !this.isRotorSpinning;
    return this.isRotorSpinning;
  }

  toggleGate() {
    this.isGateOpen = !this.isGateOpen;
    this.gateTargetAngle = this.isGateOpen ? this.gateOpenAngle : 0;
    return this.isGateOpen;
  }

  toggleDoor() {
    return this.toggleGate();
  }

  resetCamera() {
    if (this.controls) {
      const baseTargetY = 135;
      const explodedTargetY = 285;
      const targetY = baseTargetY + (explodedTargetY - baseTargetY) * (this.explodedFactor || 0);

      const baseDist = 550;
      const targetDist = 950;
      const dist = baseDist + (targetDist - baseDist) * (this.explodedFactor || 0);

      const normX = -310 / 517;
      const normY = (240 - 135) / 517;
      const normZ = -400 / 517;

      this.controls.target.set(0, targetY, 0);
      this.camera.position.set(normX * dist, targetY + normY * dist, normZ * dist);
      this.controls.update();
    }
  }

  setupEventListeners() {}

  animate() {
    requestAnimationFrame(this.animate);

    if (this.controls) {
      this.controls.update();
    }

    if (this.isRotating && this.robotGroup) {
      this.robotGroup.rotation.y += this.turntableSpeed;
    }

    if (this.isRotorSpinning && this.rotorMesh) {
      this.rotorMesh.rotation.y += 0.15;
    }

    if (this.gateMesh) {
      const diff = this.gateTargetAngle - this.gateCurrentAngle;
      if (Math.abs(diff) > 0.01) {
        this.gateCurrentAngle += diff * 0.22;
      } else {
        this.gateCurrentAngle = this.gateTargetAngle;
      }
      this.gateMesh.rotation.y = this.gateCurrentAngle;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
