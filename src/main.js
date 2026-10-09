/**
 * main.js
 * Entry point for Cinema XXI 3D Theater Experience Simulator.
 */

import * as THREE from 'three';
import { VideoManager } from './cinema/VideoManager.js';
import { SeatManager } from './cinema/SeatManager.js';
import { CinemaScene } from './cinema/CinemaScene.js';
import { PlayerController } from './cinema/PlayerController.js';
import { UIManager } from './ui/UIManager.js';

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('canvas-container');
  const videoElement = document.getElementById('theater-video-element');

  // 1. Core Cinema Subsystems
  const videoManager = new VideoManager(videoElement);
  
  // We need a dummy scene first or instantiate CinemaScene which creates the scene
  // CinemaScene will pass its scene to SeatManager or we construct them cleanly:
  const tempScene = new THREE.Scene();
  const seatManager = new SeatManager(tempScene);

  // CinemaScene creates the real Three.js scene and links seatManager
  const cinemaScene = new CinemaScene(container, videoManager, seatManager);

  // Transfer seatManager's indicator to cinemaScene.scene
  seatManager.scene = cinemaScene.scene;
  if (seatManager.indicatorGroup) {
    cinemaScene.scene.add(seatManager.indicatorGroup);
  }

  // 2. Player First-Person Controller
  const playerController = new PlayerController(
    cinemaScene.camera,
    container,
    cinemaScene,
    seatManager
  );

  // 3. UI Manager (Login, Movie Selection, Seat Map, Cinema HUD)
  const uiManager = new UIManager(
    videoManager,
    seatManager,
    playerController,
    cinemaScene
  );

  // 4. Animation / Simulation Render Loop
  let lastTime = performance.now();
  const startTime = performance.now();

  function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const delta = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    const elapsedTime = (now - startTime) / 1000;

    // Update Player Movement & Collision
    playerController.update(delta);

    // Update Seat Beacon Animation
    seatManager.update(delta, elapsedTime);

    // Update Lighting Transitions & Screen Bounce
    cinemaScene.update(delta);

    // Update Video Texture to GPU
    videoManager.update();

    // Update Interactive Proximity & Raycast HUD Prompts
    uiManager.updateHUD();

    // Render 3D Frame
    cinemaScene.render();
  }

  animate();

  console.log('🎬 Cinema XXI 3D Simulator initialized successfully!');
});
