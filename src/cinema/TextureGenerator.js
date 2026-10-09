/**
 * TextureGenerator.js
 * Generates high-quality procedural canvas textures for the XXI Cinema theater:
 * - Luxury acoustic wall panels
 * - Deep velvet red theater carpet with geometric diamonds
 * - Seat numbers on brass plates
 * - Neon green EXIT signs
 * - Screen frame with XXI Cinema emblem
 */

import * as THREE from 'three';

export class TextureGenerator {
  /**
   * Cinema carpet texture with geometric diamond pattern and deep crimson velvet
   */
  static createCarpetTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base deep dark burgundy
    ctx.fillStyle = '#1c0709';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle noise
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 20;
      data[i] = Math.min(255, Math.max(0, data[i] + n));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n * 0.4));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n * 0.4));
    }
    ctx.putImageData(imgData, 0, 0);

    // Diamond grid motif (classic luxury cinema carpet)
    ctx.strokeStyle = '#380f14';
    ctx.lineWidth = 4;
    const step = 64;
    for (let x = -512; x < 1024; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 512, 512);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, 512);
      ctx.lineTo(x + 512, 0);
      ctx.stroke();
    }

    // Gold diamond dot accent in centers
    ctx.fillStyle = '#6b4f17';
    for (let x = step / 2; x < 512; x += step) {
      for (let y = step / 2; y < 512; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 8);
    return texture;
  }

  /**
   * Wall acoustic panels texture (dark wine-burgundy acoustic paneling from reference photo)
   */
  static createAcousticWallTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base dark wine/burgundy tone matching photo
    ctx.fillStyle = '#1c0810';
    ctx.fillRect(0, 0, 512, 512);

    // Wide vertical architectural acoustic panels
    const panelWidth = 64;
    for (let x = 0; x < 512; x += panelWidth) {
      // Panel face
      const grad = ctx.createLinearGradient(x, 0, x + panelWidth, 0);
      grad.addColorStop(0, '#240b15');
      grad.addColorStop(0.5, '#2e0f1c');
      grad.addColorStop(1, '#1e0912');
      ctx.fillStyle = grad;
      ctx.fillRect(x + 2, 0, panelWidth - 4, 512);

      // Deep groove
      ctx.fillStyle = '#0a0306';
      ctx.fillRect(x, 0, 2, 512);

      // Subtle edge highlight
      ctx.fillStyle = 'rgba(255, 120, 150, 0.08)';
      ctx.fillRect(x + 2, 0, 1, 512);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 2);
    return texture;
  }

  /**
   * Velvet chair fabric texture (vibrant cinema red matching reference photo)
   */
  static createVelvetFabricTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Vibrant plush cinema red
    ctx.fillStyle = '#c01520';
    ctx.fillRect(0, 0, 256, 256);

    const imgData = ctx.getImageData(0, 0, 256, 256);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const grain = (Math.random() - 0.5) * 40;
      data[i] = Math.min(255, Math.max(0, data[i] + grain));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain * 0.15));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain * 0.25));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  /**
   * Brass seat number plate texture
   */
  static createSeatNumberTexture(seatCode) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Brass gradient background
    const grad = ctx.createLinearGradient(0, 0, 128, 64);
    grad.addColorStop(0, '#9e7d23');
    grad.addColorStop(0.5, '#f3e5ab');
    grad.addColorStop(1, '#805d15');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 64);

    // Border
    ctx.strokeStyle = '#3d2b07';
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, 120, 56);

    // Text
    ctx.fillStyle = '#1c1303';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(seatCode, 64, 34);

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Glowing green EXIT sign
   */
  static createExitSignTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Dark green background
    ctx.fillStyle = '#02240c';
    ctx.fillRect(0, 0, 256, 128);

    ctx.strokeStyle = '#00e676';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 244, 116);

    // Glowing EXIT Text
    ctx.fillStyle = '#00e676';
    ctx.font = 'bold 56px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EXIT', 128, 64);

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Screen Masking Bottom Brand Emblem (XXI PREMIERE)
   */
  static createScreenBrandTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#060608';
    ctx.fillRect(0, 0, 512, 96);

    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 36px "Cinzel", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('• CINEMA XXI PREMIERE •', 256, 44);

    ctx.fillStyle = '#a68728';
    ctx.font = '16px "Outfit", sans-serif';
    ctx.fillText('DOLBY ATMOS • LASER PROJECTOR', 256, 74);

    return new THREE.CanvasTexture(canvas);
  }
}
