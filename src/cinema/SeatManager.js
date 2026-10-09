/**
 * SeatManager.js
 * Manages 3D Cinema seating grid, user-selected seat tracking,
 * visual glow beacon, and proximity/raycast detection for sitting down.
 */

import * as THREE from 'three';

export class SeatManager {
  constructor(scene) {
    this.scene = scene;
    this.seats = new Map(); // key: "A1", value: { id, row, col, worldPos, meshGroup, sitCamPos, lookAtPos }
    this.selectedSeatId = null;
    this.indicatorMesh = null;
    this.isSeated = false;

    this.createIndicator();
  }

  /**
   * Registers a 3D seat mesh group and its calculated sitting viewpoint
   */
  registerSeat(seatId, row, col, worldPos, meshGroup) {
    // Sitting eye position is natural head height above cushion
    const sitCamPos = new THREE.Vector3(
      worldPos.x,
      worldPos.y + 1.08, // Seated eye height above tier floor
      worldPos.z - 0.05   // Centered comfortably in seat
    );

    // Look directly towards cinema screen center (elevated IMAX screen)
    const lookAtPos = new THREE.Vector3(0, 6.0, -16.2);

    this.seats.set(seatId, {
      id: seatId,
      row,
      col,
      worldPos,
      meshGroup,
      sitCamPos,
      lookAtPos
    });
  }

  /**
   * Glowing golden beacon that hovers over the user's chosen seat
   */
  createIndicator() {
    this.indicatorGroup = new THREE.Group();

    // Golden rotating ring
    const ringGeo = new THREE.TorusGeometry(0.32, 0.04, 16, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf3e5ab,
      wireframe: false,
      transparent: true,
      opacity: 0.85
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    this.indicatorGroup.add(ring);

    // Downward pointing arrow cone
    const coneGeo = new THREE.ConeGeometry(0.14, 0.35, 16);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.9
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.rotation.x = Math.PI; // point down
    cone.position.y = 0.35;
    this.indicatorGroup.add(cone);

    // Soft point light glow on the seat
    const beaconLight = new THREE.PointLight(0xd4af37, 1.2, 3.5);
    beaconLight.position.set(0, 0.3, 0);
    this.indicatorGroup.add(beaconLight);

    this.indicatorGroup.visible = false;
    this.scene.add(this.indicatorGroup);
  }

  /**
   * Sets the user's chosen seat and places the floating beacon above it
   */
  setSelectedSeat(seatId) {
    this.selectedSeatId = seatId;
    const seatData = this.seats.get(seatId);

    if (seatData) {
      this.indicatorGroup.visible = true;
      this.indicatorGroup.position.set(
        seatData.worldPos.x,
        seatData.worldPos.y + 1.45,
        seatData.worldPos.z
      );
    } else {
      this.indicatorGroup.visible = false;
    }
  }

  getSelectedSeatData() {
    return this.seats.get(this.selectedSeatId) || null;
  }

  /**
   * Animate the floating seat indicator (rotation + bobbing)
   */
  update(delta, time) {
    if (this.indicatorGroup && this.indicatorGroup.visible) {
      this.indicatorGroup.rotation.y += delta * 1.5;
      const baseSeat = this.seats.get(this.selectedSeatId);
      if (baseSeat) {
        this.indicatorGroup.position.y = baseSeat.worldPos.y + 1.45 + Math.sin(time * 3) * 0.08;
      }
    }
  }

  /**
   * Check if player is near their selected seat or near any other seat
   * @param {THREE.Vector3} playerPos 
   * @param {THREE.Vector3} lookDir 
   * @returns {{ canSit: boolean, seatData?: object, isOtherSeat?: boolean, otherSeatId?: string }}
   */
  checkInteraction(playerPos, lookDir) {
    if (this.isSeated || !this.selectedSeatId) {
      return { canSit: false };
    }

    const mySeat = this.seats.get(this.selectedSeatId);
    if (mySeat) {
      const dist = playerPos.distanceTo(mySeat.worldPos);
      if (dist < 2.4) {
        // Check if player is roughly facing the seat
        const toSeat = new THREE.Vector3().subVectors(mySeat.worldPos, playerPos).normalize();
        const dot = lookDir.dot(toSeat);
        if (dot > 0.25 || dist < 1.3) {
          return { canSit: true, seatData: mySeat };
        }
      }
    }

    // Check proximity to other seats for realistic tooltip
    for (const [id, seat] of this.seats.entries()) {
      if (id === this.selectedSeatId) continue;
      const dist = playerPos.distanceTo(seat.worldPos);
      if (dist < 1.8) {
        const toSeat = new THREE.Vector3().subVectors(seat.worldPos, playerPos).normalize();
        const dot = lookDir.dot(toSeat);
        if (dot > 0.7) {
          return { canSit: false, isOtherSeat: true, otherSeatId: id };
        }
      }
    }

    return { canSit: false };
  }
}
