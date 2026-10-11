/**
 * CinemaScene.js
 * Builds the realistic XXI Cinema auditorium based on reference photo:
 * - Two-tier stadium architecture: Lower Stalls (Rows A-B) & High Stadium Tier (Rows C-G)
 * - 0.80m Stadium Risers ensuring 100% unobstructed screen visibility for every back seat
 * - Dual Aisles (Left & Right) lined with warm amber LED step lights
 * - Black steel safety guardrails in front of lower & upper sections
 * - 98 Vibrant red velvet theater armchairs in 3 distinct blocks (Left wing, Center, Right wing)
 * - Elevated Mammoth IMAX Curved Screen (18m x 8.5m)
 * - Acoustic wine-burgundy wall panels with downlight scallops
 * - Dimming house lights & volumetric projector beam
 */

import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator.js';

export class CinemaScene {
  constructor(container, videoManager, seatManager) {
    this.container = container;
    this.videoManager = videoManager;
    this.seatManager = seatManager;

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Lighting references for smooth dimming
    this.houseLights = [];
    this.ambientLight = null;
    this.projectorSpot = null;
    this.projectorBeamMesh = null;
    this.screenMesh = null;

    // Light dimming state
    this.currentLightFactor = 1.0;
    this.targetLightFactor = 1.0;
    this.dimSpeed = 1.2;

    this.init();
  }

  init() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070509);
    this.scene.fog = new THREE.FogExp2(0x0c0710, 0.018);

    // 2. Camera (POV at rear entrance landing looking towards the screen)
    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      120
    );
    // Stand at rear platform (Y = 5.85 + 1.65 = 7.50, Z = 7.0)
    this.camera.position.set(0, 7.5, 7.0);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 4. Build Environment
    this.buildArchitecture();
    this.buildSeating();
    this.buildSafetyRailings();
    this.buildCinemaScreen();
    this.buildProjectorBooth();
    this.setupLighting();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Builds auditorium hall: tiered floor risers, acoustic walls, dual aisles with amber lights
   */
  buildArchitecture() {
    const carpetTex = TextureGenerator.createCarpetTexture();
    const wallTex = TextureGenerator.createAcousticWallTexture();

    const carpetMat = new THREE.MeshStandardMaterial({
      map: carpetTex,
      roughness: 0.85,
      metalness: 0.1
    });

    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.75,
      metalness: 0.15
    });

    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x08060a,
      roughness: 0.95,
      metalness: 0.05
    });

    const roomW = 24;
    const roomL = 34;
    const roomH = 12.5;

    // --- Ceiling ---
    const ceilingGeo = new THREE.PlaneGeometry(roomW, roomL);
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, roomH, -1);
    this.scene.add(ceiling);

    // --- Left & Right Wine-Burgundy Acoustic Walls ---
    const sideWallGeo = new THREE.PlaneGeometry(roomL, roomH);
    const leftWall = new THREE.Mesh(sideWallGeo, wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-roomW / 2, roomH / 2, -1);
    this.scene.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeo, wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(roomW / 2, roomH / 2, -1);
    this.scene.add(rightWall);

    // --- Back Wall (Projector Wall) ---
    const endWallGeo = new THREE.PlaneGeometry(roomW, roomH);
    const backWall = new THREE.Mesh(endWallGeo, wallMat);
    backWall.rotation.y = Math.PI;
    backWall.position.set(0, roomH / 2, 14);
    this.scene.add(backWall);

    // --- Front Screen Wall ---
    const frontWallMat = new THREE.MeshStandardMaterial({ color: 0x030305, roughness: 0.95 });
    const frontWall = new THREE.Mesh(endWallGeo, frontWallMat);
    frontWall.position.set(0, roomH / 2, -18);
    this.scene.add(frontWall);

    // --- 1. Front Flat Floor (Stage / Orchestra level) ---
    const frontFloorGeo = new THREE.BoxGeometry(roomW, 0.4, 6.5);
    const frontFloor = new THREE.Mesh(frontFloorGeo, carpetMat);
    frontFloor.position.set(0, -0.2, -14.75);
    this.scene.add(frontFloor);

    // --- 2. Lower Section Tiers (Rows A & B) ---
    // Row A Tier
    const tierAGeo = new THREE.BoxGeometry(roomW, 0.5, 1.8);
    const tierAMesh = new THREE.Mesh(tierAGeo, carpetMat);
    tierAMesh.position.set(0, 0.25, -10.2);
    this.scene.add(tierAMesh);

    // Row B Tier & Cross-Aisle
    const tierBGeo = new THREE.BoxGeometry(roomW, 1.05, 3.8);
    const tierBMesh = new THREE.Mesh(tierBGeo, carpetMat);
    tierBMesh.position.set(0, 0.525, -7.4);
    this.scene.add(tierBMesh);

    // --- 3. Upper Stadium Tiers (Rows C through G) with 0.80m risers ---
    const stadiumTiers = [
      { name: 'C', z: -4.2, y: 1.85, depth: 1.8, riser: 0.80 },
      { name: 'D', z: -2.4, y: 2.65, depth: 1.8, riser: 0.80 },
      { name: 'E', z: -0.6, y: 3.45, depth: 1.8, riser: 0.80 },
      { name: 'F', z: 1.2, y: 4.25, depth: 1.8, riser: 0.80 },
      { name: 'G', z: 3.0, y: 5.05, depth: 1.8, riser: 0.80 }
    ];

    stadiumTiers.forEach((tier) => {
      const geo = new THREE.BoxGeometry(roomW, tier.y, tier.depth);
      const mesh = new THREE.Mesh(geo, carpetMat);
      mesh.position.set(0, tier.y / 2, tier.z);
      this.scene.add(mesh);
    });

    // --- 4. Rear Entrance Landing Platform ---
    const rearPlatformGeo = new THREE.BoxGeometry(roomW, 5.85, 9.0);
    const rearPlatform = new THREE.Mesh(rearPlatformGeo, carpetMat);
    rearPlatform.position.set(0, 5.85 / 2, 8.4);
    this.scene.add(rearPlatform);

    // --- 5. Amber LED Step Lights on Dual Aisles (matching reference photo) ---
    // Left Aisle center X = -4.3, Right Aisle center X = 4.3
    const allSteps = [
      { z: -11.1, y: 0.50 },
      { z: -9.4, y: 1.05 },
      { z: -5.1, y: 1.85 },
      { z: -3.3, y: 2.65 },
      { z: -1.5, y: 3.45 },
      { z: 0.3, y: 4.25 },
      { z: 2.1, y: 5.05 },
      { z: 3.9, y: 5.85 }
    ];

    allSteps.forEach((step) => {
      // Left Aisle Step Lights (left and right edges of the aisle)
      this.createAmberStepDot(-4.85, step.y, step.z);
      this.createAmberStepDot(-3.75, step.y, step.z);

      // Right Aisle Step Lights (left and right edges of the aisle)
      this.createAmberStepDot(3.75, step.y, step.z);
      this.createAmberStepDot(4.85, step.y, step.z);
    });

    // --- 6. Glowing EXIT Signs ---
    this.createExitSign(-roomW / 2 + 0.1, 7.2, 11.5, Math.PI / 2);
    this.createExitSign(roomW / 2 - 0.1, 7.2, 11.5, -Math.PI / 2);
  }

  createAmberStepDot(x, y, z) {
    const dotGeo = new THREE.SphereGeometry(0.035, 12, 12);
    const dotMat = new THREE.MeshBasicMaterial({
      color: 0xffaa22,
      toneMapped: false
    });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.set(x, y + 0.04, z);
    this.scene.add(dot);
  }

  /**
   * Black steel safety guardrails (matching photo in front of lower & upper tiers)
   */
  buildSafetyRailings() {
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x15151c,
      roughness: 0.35,
      metalness: 0.85
    });

    // 1. Front Railing in front of Row A (Z = -11.4, floor Y = 0.5)
    this.createRailingSegment(-10.5, 10.5, -11.4, 0.5, railMat);

    // 2. Cross-Aisle Railing in front of Upper Stadium tier (Z = -5.4, floor Y = 1.05)
    // Left wing section
    this.createRailingSegment(-10.5, -5.0, -5.4, 1.05, railMat);
    // Center block section
    this.createRailingSegment(-3.5, 3.5, -5.4, 1.05, railMat);
    // Right wing section
    this.createRailingSegment(5.0, 10.5, -5.4, 1.05, railMat);
  }

  createRailingSegment(xStart, xEnd, z, floorY, railMat) {
    const group = new THREE.Group();
    const length = Math.abs(xEnd - xStart);
    const centerX = (xStart + xEnd) / 2;
    const railH = 0.95;

    // Top horizontal handrail
    const topRailGeo = new THREE.CylinderGeometry(0.025, 0.025, length, 16);
    topRailGeo.rotateZ(Math.PI / 2);
    const topRail = new THREE.Mesh(topRailGeo, railMat);
    topRail.position.set(centerX, floorY + railH, z);
    group.add(topRail);

    // Mid horizontal rail
    const midRailGeo = new THREE.CylinderGeometry(0.018, 0.018, length, 16);
    midRailGeo.rotateZ(Math.PI / 2);
    const midRail = new THREE.Mesh(midRailGeo, railMat);
    midRail.position.set(centerX, floorY + railH * 0.55, z);
    group.add(midRail);

    // Vertical posts every 1.5m
    const numPosts = Math.max(2, Math.floor(length / 1.5) + 1);
    for (let i = 0; i < numPosts; i++) {
      const px = xStart + (i / (numPosts - 1)) * length;
      const postGeo = new THREE.CylinderGeometry(0.025, 0.025, railH, 16);
      const post = new THREE.Mesh(postGeo, railMat);
      post.position.set(px, floorY + railH / 2, z);
      group.add(post);
    }

    this.scene.add(group);
  }

  /**
   * Green EXIT sign on theater walls
   */
  createExitSign(x, y, z, rotY) {
    const exitTex = TextureGenerator.createExitSignTexture();
    const exitMat = new THREE.MeshBasicMaterial({
      map: exitTex,
      toneMapped: false
    });
    const exitGeo = new THREE.PlaneGeometry(1.0, 0.5);
    const exitMesh = new THREE.Mesh(exitGeo, exitMat);
    exitMesh.position.set(x, y, z);
    exitMesh.rotation.y = rotY;
    this.scene.add(exitMesh);

    const greenGlow = new THREE.PointLight(0x00e676, 0.5, 3.5);
    greenGlow.position.set(x + (x > 0 ? -0.3 : 0.3), y, z);
    this.scene.add(greenGlow);
  }

  /**
   * Builds the 98 red velvet cinema armchairs arranged in 3 blocks across 7 rows
   */
  buildSeating() {
    const velvetTex = TextureGenerator.createVelvetFabricTexture();
    const seatVelvetMat = new THREE.MeshStandardMaterial({
      map: velvetTex,
      roughness: 0.75,
      metalness: 0.1
    });

    const seatFrameMat = new THREE.MeshStandardMaterial({
      color: 0x141419,
      roughness: 0.45,
      metalness: 0.7
    });

    // 7 Rows: A, B (Lower); C, D, E, F, G (Upper Stadium)
    const rows = [
      { name: 'A', z: -10.2, y: 0.50 },
      { name: 'B', z: -8.5, y: 1.05 },
      { name: 'C', z: -4.2, y: 1.85 },
      { name: 'D', z: -2.4, y: 2.65 },
      { name: 'E', z: -0.6, y: 3.45 },
      { name: 'F', z: 1.2, y: 4.25 },
      { name: 'G', z: 3.0, y: 5.05 }
    ];

    // Shared Geometries for better performance
    const geos = {
      cushion: new THREE.BoxGeometry(0.74, 0.12, 0.65),
      back: new THREE.BoxGeometry(0.72, 0.52, 0.14),
      head: new THREE.BoxGeometry(0.66, 0.18, 0.15),
      leg: new THREE.BoxGeometry(0.12, 0.36, 0.12),
      arm: new THREE.BoxGeometry(0.10, 0.38, 0.58),
      armPad: new THREE.BoxGeometry(0.11, 0.04, 0.58),
      cup: new THREE.CylinderGeometry(0.045, 0.045, 0.07, 16),
      num: new THREE.PlaneGeometry(0.16, 0.08)
    };

    // 14 Seats per row divided into 3 blocks:
    const colXMap = [
      -7.5, -6.5, -5.5,
      -3.15, -2.25, -1.35, -0.45, 0.45, 1.35, 2.25, 3.15,
      5.5, 6.5, 7.5
    ];

    rows.forEach((row) => {
      colXMap.forEach((xPos, colIdx) => {
        const colNum = colIdx + 1;
        const seatId = `${row.name}${colNum}`;

        const seatGroup = this.createCinemaChair(
          seatVelvetMat,
          seatFrameMat,
          seatId,
          geos
        );
        seatGroup.position.set(xPos, row.y, row.z);
        this.scene.add(seatGroup);

        // Register seat with manager
        this.seatManager.registerSeat(
          seatId,
          row.name,
          colNum,
          new THREE.Vector3(xPos, row.y, row.z),
          seatGroup
        );
      });
    });
  }

  /**
   * Constructs an individual ergonomic cinema armchair matching the photo
   * Height from floor to headrest top: 0.90m (leaves complete sightline clearance)
   */
  createCinemaChair(fabricMat, frameMat, seatId, geos) {
    const group = new THREE.Group();

    // 1. Cushion
    const cushion = new THREE.Mesh(geos.cushion, fabricMat);
    cushion.position.set(0, 0.40, 0);
    group.add(cushion);

    // 2. Backrest
    const back = new THREE.Mesh(geos.back, fabricMat);
    back.position.set(0, 0.68, 0.26);
    back.rotation.x = -0.10;
    group.add(back);

    // 3. Headrest
    const head = new THREE.Mesh(geos.head, fabricMat);
    head.position.set(0, 0.88, 0.28);
    head.rotation.x = -0.12;
    group.add(head);

    // 4. Base Leg Mount
    const leg = new THREE.Mesh(geos.leg, frameMat);
    leg.position.set(0, 0.18, 0);
    group.add(leg);

    // 5. Left & Right Armrests with Cup Holders
    [-0.41, 0.41].forEach((sideX) => {
      const arm = new THREE.Mesh(geos.arm, frameMat);
      arm.position.set(sideX, 0.45, 0.04);
      group.add(arm);

      // Arm cushion top
      const armPad = new THREE.Mesh(geos.armPad, fabricMat);
      armPad.position.set(sideX, 0.65, 0.04);
      group.add(armPad);

      // Cup holder cylinder ring at the front tip
      const cup = new THREE.Mesh(geos.cup, frameMat);
      cup.position.set(sideX, 0.62, -0.24);
      group.add(cup);
    });

    // 6. Brass Seat Number Plate
    const numTex = TextureGenerator.createSeatNumberTexture(seatId);
    const numMat = new THREE.MeshBasicMaterial({ map: numTex });
    const numPlate = new THREE.Mesh(geos.num, numMat);
    numPlate.position.set(0, 0.94, 0.20);
    numPlate.rotation.x = -0.12;
    group.add(numPlate);

    return group;
  }

  /**
   * Mammoth IMAX/XXI curved screen
   * Elevated so the bottom of the screen (Y = 1.95m) is well above all front chairs
   */
  buildCinemaScreen() {
    const videoTexture = this.videoManager.createTexture();

    // Curved screen geometry using segmented Plane
    const screenW = 22.0;
    const screenH = 10.5;
    const segmentsX = 48;
    const segmentsY = 12;

    const screenGeo = new THREE.PlaneGeometry(screenW, screenH, segmentsX, segmentsY);
    const pos = screenGeo.attributes.position;
    const halfW = screenW / 2;

    // Gentle concave curve toward audience:
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const ratio = x / halfW;
      const curveZ = (ratio * ratio) * 0.95; // 95cm concave curve
      pos.setZ(i, curveZ);
    }
    screenGeo.computeVertexNormals();

    const screenMat = new THREE.MeshBasicMaterial({
      map: videoTexture,
      side: THREE.DoubleSide,
      toneMapped: false
    });

    this.screenMesh = new THREE.Mesh(screenGeo, screenMat);
    // Centered at Y = 7.2 (bottom at 1.95m, top at 12.45m), Z = -16.2
    this.screenMesh.position.set(0, 7.2, -16.2);
    this.scene.add(this.screenMesh);

    // Outer Screen Masking Frame (Black velvet border)
    const frameGeo = new THREE.BoxGeometry(screenW + 1.0, screenH + 1.0, 0.25);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x040407,
      roughness: 0.95
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.set(0, 7.2, -16.7);
    this.scene.add(frameMesh);

    // Screen Bottom Emblem Plate (• CINEMA XXI PREMIERE •)
    const brandTex = TextureGenerator.createScreenBrandTexture();
    const brandMat = new THREE.MeshBasicMaterial({ map: brandTex, side: THREE.DoubleSide, toneMapped: false });
    const brandGeo = new THREE.PlaneGeometry(6.5, 0.85);
    const brandPlate = new THREE.Mesh(brandGeo, brandMat);
    brandPlate.position.set(0, 1.25, -16.0);
    this.scene.add(brandPlate);

    // Screen light bounce on front stage
    this.screenBounceLight = new THREE.PointLight(0xffeedd, 0.5, 24);
    this.screenBounceLight.position.set(0, 5.0, -14.5);
    this.scene.add(this.screenBounceLight);
  }

  /**
   * Projector booth at rear and volumetric projector beam
   */
  buildProjectorBooth() {
    // Projector booth glass window
    const windowGeo = new THREE.PlaneGeometry(2.4, 1.2);
    const windowMat = new THREE.MeshBasicMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.8
    });
    const boothWindow = new THREE.Mesh(windowGeo, windowMat);
    boothWindow.position.set(0, 8.8, 13.9);
    this.scene.add(boothWindow);

    // Volumetric Projector Light Cone Beam
    const beamLength = 30;
    const coneRadius = 9.0;
    const beamGeo = new THREE.ConeGeometry(coneRadius, beamLength, 32, 1, true);
    beamGeo.translate(0, -beamLength / 2, 0);
    beamGeo.rotateX(Math.PI / 2);

    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xddeeff,
      transparent: true,
      opacity: 0.04,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    this.projectorBeamMesh = new THREE.Mesh(beamGeo, beamMat);
    this.projectorBeamMesh.position.set(0, 8.8, 13.8);
    this.projectorBeamMesh.lookAt(0, 6.2, -16.2);
    this.scene.add(this.projectorBeamMesh);

    // Projector Spotlight
    this.projectorSpot = new THREE.SpotLight(0xffffff, 2.8, 42, Math.PI / 6, 0.4, 1.2);
    this.projectorSpot.position.set(0, 8.8, 13.8);
    this.projectorSpot.target.position.set(0, 6.2, -16.2);
    this.scene.add(this.projectorSpot);
    this.scene.add(this.projectorSpot.target);
  }

  /**
   * Cinema Hall Lighting System (Ambient + Sconces + Wall Scallop Spotlights)
   */
  setupLighting() {
    // 1. Ambient Warm Theater Tone
    this.ambientLight = new THREE.AmbientLight(0xffeedd, 0.75);
    this.scene.add(this.ambientLight);

    // 2. Ceiling Recessed Downlights with Wall Scallops (matching photo)
    [-8, 0, 8].forEach((xPos) => {
      [-10, -1, 8].forEach((zPos) => {
        const downlight = new THREE.PointLight(0xffe2b0, 1.5, 25, 1.4);
        downlight.position.set(xPos, 11.8, zPos);
        this.scene.add(downlight);
        this.houseLights.push({ light: downlight, baseIntensity: 1.5 });

        // Visual fixture mesh
        const fixtureGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.08, 16);
        const fixtureMat = new THREE.MeshBasicMaterial({ color: 0xfff0cf });
        const fixture = new THREE.Mesh(fixtureGeo, fixtureMat);
        fixture.position.set(xPos, 12.4, zPos);
        this.scene.add(fixture);
      });
    });

    // 3. Wall Scallop Spotlights along Wine-Burgundy Walls (matching photo)
    const wallZSpots = [-10, 0, 8];
    wallZSpots.forEach((zPos) => {
      // Left Wall Spotlights
      const leftSpot = new THREE.SpotLight(0xffdfa8, 1.5, 20, Math.PI / 4, 0.5, 1.5);
      leftSpot.position.set(-11.0, 11.8, zPos);
      leftSpot.target.position.set(-11.9, 5.0, zPos);
      this.scene.add(leftSpot);
      this.scene.add(leftSpot.target);
      this.houseLights.push({ light: leftSpot, baseIntensity: 1.5 });

      // Right Wall Spotlights
      const rightSpot = new THREE.SpotLight(0xffdfa8, 1.5, 20, Math.PI / 4, 0.5, 1.5);
      rightSpot.position.set(11.0, 11.8, zPos);
      rightSpot.target.position.set(11.9, 5.0, zPos);
      this.scene.add(rightSpot);
      this.scene.add(rightSpot.target);
      this.houseLights.push({ light: rightSpot, baseIntensity: 1.5 });
    });

    // 4. Back Wall Wash Downlights (matching spotlights in photo above rear seats)
    [-6, -2, 2, 6].forEach((xPos) => {
      const backSpot = new THREE.SpotLight(0xffdfa8, 1.4, 15, Math.PI / 5, 0.5, 1.5);
      backSpot.position.set(xPos, 11.8, 12.0);
      backSpot.target.position.set(xPos, 6.0, 13.9);
      this.scene.add(backSpot);
      this.scene.add(backSpot.target);
      this.houseLights.push({ light: backSpot, baseIntensity: 1.4 });
    });
  }

  /**
   * Set target lighting intensity factor:
   * 1.0 = Full house lights (walking around)
   * 0.03 = Dim movie theater lights (watching film)
   */
  setLightingFactor(factor, speed = 1.0) {
    this.targetLightFactor = Math.max(0.02, Math.min(1.0, factor));
    this.dimSpeed = speed;
  }

  /**
   * Render loop update
   */
  update(delta) {
    // Smooth light transition (fade in / out)
    if (Math.abs(this.currentLightFactor - this.targetLightFactor) > 0.001) {
      const step = (this.targetLightFactor - this.currentLightFactor) * delta * this.dimSpeed;
      this.currentLightFactor += step;

      // Update ambient light
      if (this.ambientLight) {
        this.ambientLight.intensity = 0.75 * this.currentLightFactor;
      }

      // Update all house downlights and sconces
      this.houseLights.forEach((item) => {
        item.light.intensity = item.baseIntensity * this.currentLightFactor;
      });

      // Update projector beam intensity (inverse: brighter when dark)
      if (this.projectorBeamMesh) {
        const darkFactor = 1.0 - this.currentLightFactor;
        this.projectorBeamMesh.material.opacity = 0.03 + darkFactor * 0.16;
      }
      if (this.projectorSpot) {
        const darkFactor = 1.0 - this.currentLightFactor;
        this.projectorSpot.intensity = 0.8 + darkFactor * 2.4;
      }
    }

    // Dynamic screen bounce light flicker
    if (this.screenBounceLight && this.videoManager.isPlaying) {
      const noise = (Math.sin(Date.now() * 0.01) + Math.cos(Date.now() * 0.02)) * 0.06;
      this.screenBounceLight.intensity = (0.45 + noise) * (1.0 - this.currentLightFactor * 0.7);
    }
  }

  render() {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
