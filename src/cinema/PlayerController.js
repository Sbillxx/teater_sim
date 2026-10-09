/**
 * PlayerController.js
 * Handles first-person walking, mouse look (PointerLockControls),
 * automatic stair elevation physics, and cinematic sit/stand camera animations.
 */

import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export class PlayerController {
  constructor(camera, domElement, cinemaScene, seatManager) {
    this.camera = camera;
    this.domElement = domElement;
    this.cinemaScene = cinemaScene;
    this.seatManager = seatManager;

    this.controls = new PointerLockControls(this.camera, document.body);

    // Movement state
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.isSprinting = false;

    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    this.walkSpeed = 3.8;
    this.sprintSpeed = 6.2;
    this.playerEyeHeight = 1.65; // standing eye level

    // Sitting animation state
    this.isSeated = false;
    this.isTransitioning = false;
    this.transitionProgress = 0;
    this.startPos = new THREE.Vector3();
    this.startQuat = new THREE.Quaternion();
    this.targetPos = new THREE.Vector3();
    this.targetQuat = new THREE.Quaternion();
    this.standbyStandingPos = new THREE.Vector3();

    // Callbacks
    this.onLockChange = null;
    this.onSitStateChange = null;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Keyboard inputs
    const onKeyDown = (event) => {
      if (this.isSeated) {
        if (event.code === 'Space') {
          this.standUp();
        }
        return;
      }

      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.moveForward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.moveBackward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.moveLeft = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.moveRight = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.isSprinting = true;
          break;
      }
    };

    const onKeyUp = (event) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.moveForward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.moveBackward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.moveLeft = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.moveRight = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.isSprinting = false;
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // PointerLock state events
    this.controls.addEventListener('lock', () => {
      if (this.onLockChange) this.onLockChange(true);
    });

    this.controls.addEventListener('unlock', () => {
      if (this.onLockChange) this.onLockChange(false);
    });
  }

  lock() {
    if (!this.isSeated) {
      this.controls.lock();
    }
  }

  unlock() {
    this.controls.unlock();
  }

  isLocked() {
    return this.controls.isLocked;
  }

  /**
   * Calculates floor elevation based on two-tier stadium auditorium layout
   */
  getFloorHeightAt(x, z) {
    // Stage front area
    if (z < -11.5) return 0.0;
    // Lower Section (Rows A & B)
    if (z < -9.5) return 0.50;  // Row A
    if (z < -5.4) return 1.05;  // Row B & Cross-Aisle

    // Upper Stadium Tiers (0.80m risers matching reference photo)
    if (z < -3.3) return 1.85;  // Row C
    if (z < -1.5) return 2.65;  // Row D
    if (z < 0.3)  return 3.45;  // Row E
    if (z < 2.1)  return 4.25;  // Row F
    if (z < 3.9)  return 5.05;  // Row G
    return 5.85;                // Rear entrance lobby platform
  }

  /**
   * Smoothly sit down into selected seat
   */
  sitDown(seatData) {
    if (this.isSeated || this.isTransitioning || !seatData) return;

    this.isTransitioning = true;
    this.transitionProgress = 0;
    this.standbyStandingPos.copy(this.camera.position);

    // Starting camera transforms
    this.startPos.copy(this.camera.position);
    this.startQuat.copy(this.camera.quaternion);

    // Target seated camera position
    this.targetPos.copy(seatData.sitCamPos);

    // Target rotation: looking straight at cinema screen center
    const tempCam = this.camera.clone();
    tempCam.position.copy(this.targetPos);
    tempCam.lookAt(seatData.lookAtPos);
    this.targetQuat.copy(tempCam.quaternion);

    // Unlock mouse so user can interact with seated controls
    this.unlock();
    this.isSeated = true;
    this.seatManager.isSeated = true;

    if (this.onSitStateChange) {
      this.onSitStateChange(true, seatData);
    }
  }

  /**
   * Stand up from seat and resume walking
   */
  standUp() {
    if (!this.isSeated || this.isTransitioning) return;

    this.isTransitioning = true;
    this.transitionProgress = 0;

    this.startPos.copy(this.camera.position);
    this.startQuat.copy(this.camera.quaternion);

    // Stand back up slightly into the aisle in front of the chair
    const currentSeat = this.seatManager.getSelectedSeatData();
    if (currentSeat) {
      this.targetPos.set(
        currentSeat.worldPos.x,
        currentSeat.worldPos.y + this.playerEyeHeight,
        currentSeat.worldPos.z - 0.75
      );
    } else {
      this.targetPos.copy(this.standbyStandingPos);
    }

    // Look towards the elevated screen
    const tempCam = this.camera.clone();
    tempCam.position.copy(this.targetPos);
    tempCam.lookAt(0, 6.0, -16.2);
    this.targetQuat.copy(tempCam.quaternion);

    this.isSeated = false;
    this.seatManager.isSeated = false;

    if (this.onSitStateChange) {
      this.onSitStateChange(false, null);
    }
  }

  /**
   * Frame update for movement, collision bounding, and sit transition
   */
  update(delta) {
    // 1. Handle Smooth Sit/Stand Camera Animation
    if (this.isTransitioning) {
      this.transitionProgress += delta * 1.8;
      const t = Math.min(1.0, this.transitionProgress);
      // Ease in-out cubic
      const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      this.camera.position.lerpVectors(this.startPos, this.targetPos, easeT);
      this.camera.quaternion.slerpQuaternions(this.startQuat, this.targetQuat, easeT);

      if (t >= 1.0) {
        this.isTransitioning = false;
      }
      return;
    }

    // If seated, camera is fixed comfortably in seat
    if (this.isSeated) {
      return;
    }

    // 2. First-Person Walk Movement
    if (this.controls.isLocked) {
      const speed = this.isSprinting ? this.sprintSpeed : this.walkSpeed;

      // Damping
      this.velocity.x -= this.velocity.x * 10.0 * delta;
      this.velocity.z -= this.velocity.z * 10.0 * delta;

      this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
      this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
      this.direction.normalize();

      if (this.moveForward || this.moveBackward) {
        this.velocity.z -= this.direction.z * speed * 10.0 * delta;
      }
      if (this.moveLeft || this.moveRight) {
        this.velocity.x -= this.direction.x * speed * 10.0 * delta;
      }

      this.controls.moveRight(-this.velocity.x * delta);
      this.controls.moveForward(-this.velocity.z * delta);

      // 3. Room Boundaries & Collision Clamping
      const pos = this.camera.position;
      pos.x = Math.max(-10.5, Math.min(10.5, pos.x));
      pos.z = Math.max(-14.0, Math.min(12.0, pos.z));

      // 4. Stair Elevation Physics
      const floorH = this.getFloorHeightAt(pos.x, pos.z);
      const targetEyeY = floorH + this.playerEyeHeight;

      // Smooth step climb
      pos.y += (targetEyeY - pos.y) * Math.min(1.0, delta * 12.0);
    }
  }

  /**
   * Returns current forward-facing direction vector
   */
  getLookDirection() {
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    return dir;
  }
}
