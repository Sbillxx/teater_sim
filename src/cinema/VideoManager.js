/**
 * VideoManager.js
 * Manages the theater screen video source, THREE.VideoTexture,
 * local video loading, playback state, and procedural canvas video fallback.
 */

import * as THREE from 'three';

export const DEFAULT_MOVIES = [
  {
    id: 'cyberpunk',
    title: 'NEO TOKYO 2099',
    genre: 'Sci-Fi • Thriller',
    rating: '17+',
    duration: '02:18',
    description: 'Petualangan agen detektif sibernetik di kota masa depan yang dipenuhi distopia neon dan konspirasi megakorporasi.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    posterColor: '#e50914'
  },
  {
    id: 'nature',
    title: 'THE CHRONICLES OF BUNNY',
    genre: 'Animation • Family',
    rating: 'SU (Semua Umur)',
    duration: '09:56',
    description: 'Kisah seru dan kocak hewan hutan dalam menghadapi perundungan tupai nakal di hutan tropis cerah.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    posterColor: '#2e7d32'
  },
  {
    id: 'sci_space',
    title: 'COSMIC HORIZON',
    genre: 'Sci-Fi • Mystery',
    rating: '13+',
    duration: '10:53',
    description: 'Eksplorasi dua astronot di dalam struktur misterius berbentuk raksasa di orbit planet alien.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    posterColor: '#1565c0'
  }
];

export class VideoManager {
  constructor(videoElement) {
    this.videoEl = videoElement || document.getElementById('theater-video-element');
    this.videoTexture = null;
    this.currentMovie = DEFAULT_MOVIES[0];
    this.isPlaying = false;
    this.isLocalFile = false;

    // Fallback animated canvas generator
    this.fallbackCanvas = null;
    this.fallbackCtx = null;
    this.useFallback = false;
    this.animFrameId = null;

    this.onTimeUpdateCallback = null;
    this.onPlayStateCallback = null;

    this.initVideoElement();
    this.setupFallbackCanvas();
  }

  initVideoElement() {
    this.videoEl.crossOrigin = 'anonymous';
    this.videoEl.playsInline = true;
    this.videoEl.preload = 'auto';
    this.videoEl.volume = 0.8;

    this.videoEl.addEventListener('timeupdate', () => {
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.videoEl.currentTime, this.videoEl.duration);
      }
    });

    this.videoEl.addEventListener('play', () => {
      this.isPlaying = true;
      if (this.onPlayStateCallback) this.onPlayStateCallback(true);
    });

    this.videoEl.addEventListener('pause', () => {
      this.isPlaying = false;
      if (this.onPlayStateCallback) this.onPlayStateCallback(false);
    });

    this.videoEl.addEventListener('ended', () => {
      this.isPlaying = false;
      if (this.onPlayStateCallback) this.onPlayStateCallback(false);
    });

    this.videoEl.addEventListener('loadeddata', () => {
      if (this.videoTexture) {
        this.videoTexture.needsUpdate = true;
      }
    });

    this.videoEl.addEventListener('canplay', () => {
      if (this.videoTexture) {
        this.videoTexture.needsUpdate = true;
      }
    });

    this.videoEl.addEventListener('error', (e) => {
      console.warn('Video failed to load from network, activating procedural cinema screen trailer fallback.', e);
      if (!this.isLocalFile) {
        this.activateFallbackAnimation();
      }
    });
  }

  /**
   * Sets up a vibrant procedural 2D canvas that renders an animated XXI Cinema trailer
   * if online video is slow, blocked, or offline.
   */
  setupFallbackCanvas() {
    this.fallbackCanvas = document.createElement('canvas');
    this.fallbackCanvas.width = 1280;
    this.fallbackCanvas.height = 720;
    this.fallbackCtx = this.fallbackCanvas.getContext('2d');
  }

  activateFallbackAnimation() {
    this.useFallback = true;
    let frame = 0;

    const render = () => {
      if (!this.useFallback) return;
      frame++;
      const ctx = this.fallbackCtx;
      const w = 1280;
      const h = 720;

      // Dark sci-fi gradient
      const grad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, 700);
      grad.addColorStop(0, '#1c142b');
      grad.addColorStop(0.5, '#0d0d17');
      grad.addColorStop(1, '#050508');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Neon grid horizon
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
      ctx.lineWidth = 2;
      const horizon = h * 0.65;
      const offset = (frame * 2) % 40;

      for (let y = horizon; y < h; y += 20 + (y - horizon) * 0.4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      for (let x = -w; x < w * 2; x += 80) {
        ctx.beginPath();
        ctx.moveTo(w / 2, horizon);
        ctx.lineTo(x + offset, h);
        ctx.stroke();
      }

      // Glowing pulsing sun / logo
      const glow = Math.sin(frame * 0.05) * 10;
      const sunGrad = ctx.createRadialGradient(w / 2, horizon - 50, 20, w / 2, horizon - 50, 160 + glow);
      sunGrad.addColorStop(0, '#fff4cc');
      sunGrad.addColorStop(0.4, '#d4af37');
      sunGrad.addColorStop(0.8, '#c41e24');
      sunGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(w / 2, horizon - 50, 160 + glow, 0, Math.PI * 2);
      ctx.fill();

      // Film Title text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 58px "Cinzel", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#d4af37';
      ctx.shadowBlur = 20;
      ctx.fillText(this.currentMovie ? this.currentMovie.title : 'XXI CINEMA PREMIERE', w / 2, 220);

      ctx.font = '600 24px "Outfit", sans-serif';
      ctx.fillStyle = '#f7e7a9';
      ctx.shadowBlur = 10;
      ctx.fillText('FEATURE PRESENTATION • DOLBY DIGITAL SOUND', w / 2, 270);

      // Timecode
      const sec = Math.floor(frame / 60);
      const min = Math.floor(sec / 60);
      const formattedTime = `${String(min).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
      ctx.font = '20px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.shadowBlur = 0;
      ctx.fillText(`TIME: ${formattedTime}`, w / 2, h - 40);

      if (this.videoTexture) {
        this.videoTexture.needsUpdate = true;
      }
      this.animFrameId = requestAnimationFrame(render);
    };

    if (this.videoTexture) {
      this.videoTexture.image = this.fallbackCanvas;
      this.videoTexture.needsUpdate = true;
    }
    render();
  }

  /**
   * Creates or returns THREE.VideoTexture
   */
  createTexture() {
    if (!this.videoTexture) {
      this.videoTexture = new THREE.VideoTexture(this.videoEl);
      this.videoTexture.minFilter = THREE.LinearFilter;
      this.videoTexture.magFilter = THREE.LinearFilter;
      this.videoTexture.generateMipmaps = false;
      this.videoTexture.colorSpace = THREE.SRGBColorSpace;
    }
    return this.videoTexture;
  }

  /**
   * Selects a movie from presets
   */
  setMovie(movie) {
    this.currentMovie = movie;
    this.isLocalFile = false;
    this.useFallback = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    this.videoEl.src = movie.url;
    this.videoEl.load();

    if (this.videoTexture) {
      this.videoTexture.image = this.videoEl;
      this.videoTexture.needsUpdate = true;
    }
  }

  /**
   * Loads custom user local video file
   */
  loadLocalFile(file) {
    if (!file) return;
    this.useFallback = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    const objectUrl = URL.createObjectURL(file);
    const movieData = {
      id: 'local_' + Date.now(),
      title: file.name.replace(/\.[^/.]+$/, ''),
      genre: 'Local Video File',
      rating: 'Semua Umur',
      duration: '--:--',
      description: `File lokal diputar dari perangkat: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
      url: objectUrl,
      isLocal: true
    };

    this.currentMovie = movieData;
    this.isLocalFile = true;
    this.videoEl.removeAttribute('crossorigin');
    this.videoEl.src = objectUrl;
    this.videoEl.load();

    if (this.videoTexture) {
      this.videoTexture.image = this.videoEl;
      this.videoTexture.needsUpdate = true;
    }
    return movieData;
  }

  play() {
    if (this.useFallback) {
      this.isPlaying = true;
      if (this.onPlayStateCallback) this.onPlayStateCallback(true);
      return;
    }

    const playPromise = this.videoEl.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
          if (this.videoTexture) {
            this.videoTexture.needsUpdate = true;
          }
          if (this.onPlayStateCallback) this.onPlayStateCallback(true);
        })
        .catch((err) => {
          console.warn('Autoplay prevented or playback error:', err);
          if (err.name === 'NotAllowedError') {
            this.videoEl.muted = true;
            this.videoEl.play().then(() => {
              this.isPlaying = true;
              if (this.onPlayStateCallback) this.onPlayStateCallback(true);
            }).catch(() => {
              if (!this.isLocalFile) this.activateFallbackAnimation();
            });
          } else {
            if (!this.isLocalFile) this.activateFallbackAnimation();
          }
        });
    }
  }

  update() {
    if (this.videoTexture && this.videoEl && !this.videoEl.paused) {
      this.videoTexture.needsUpdate = true;
    }
  }

  pause() {
    this.videoEl.pause();
    this.isPlaying = false;
    if (this.onPlayStateCallback) this.onPlayStateCallback(false);
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  seek(seconds) {
    if (Number.isFinite(this.videoEl.duration)) {
      this.videoEl.currentTime = Math.max(0, Math.min(this.videoEl.duration, seconds));
    }
  }

  skip(secondsDelta) {
    if (Number.isFinite(this.videoEl.duration)) {
      this.seek(this.videoEl.currentTime + secondsDelta);
    }
  }

  setVolume(vol) {
    this.videoEl.volume = Math.max(0, Math.min(1, vol));
  }

  getVolume() {
    return this.videoEl.volume;
  }
}
