/**
 * UIManager.js
 * Manages the multi-step UI flow:
 * 1. Login & Visitor Registration
 * 2. Movie Catalog & Local File Upload
 * 3. Interactive 2D XXI Seat Plan & Ticket Generator
 * 4. In-Theater HUD, PointerLock overlay, and Seated Media Controls
 */

import { DEFAULT_MOVIES } from '../cinema/VideoManager.js';
import { audioManager } from '../cinema/AudioManager.js';

export class UIManager {
  constructor(videoManager, seatManager, playerController, cinemaScene) {
    this.videoManager = videoManager;
    this.seatManager = seatManager;
    this.playerController = playerController;
    this.cinemaScene = cinemaScene;

    // State
    this.userName = 'Tamu XXI';
    this.membership = 'Premiere';
    this.selectedMovie = DEFAULT_MOVIES[0];
    this.selectedSeat = 'E7'; // Center stadium sweet spot
    this.occupiedSeats = new Set(['A2', 'A8', 'B3', 'B12', 'C5', 'C10', 'D4', 'D13', 'E2', 'E11', 'F6', 'F9', 'G3', 'G12']);

    // Cache DOM Elements
    this.initDOMElements();
    this.setupEventListeners();
  }

  initDOMElements() {
    // Screens
    this.screenLogin = document.getElementById('step-login');
    this.screenMovie = document.getElementById('step-movie');
    this.screenSeat = document.getElementById('step-seat');

    // Login Form
    this.formLogin = document.getElementById('form-login');
    this.inputUsername = document.getElementById('input-username');
    this.selectMembership = document.getElementById('select-membership');

    // Movie Screen
    this.greetingUsername = document.getElementById('greeting-username');
    this.movieGrid = document.getElementById('movie-grid');
    this.inputLocalVideo = document.getElementById('input-local-video');
    this.btnBackToLogin = document.getElementById('btn-back-to-login');
    this.btnProceedToSeat = document.getElementById('btn-proceed-to-seat');

    // Seat Screen
    this.seatScreenMovieTitle = document.getElementById('seat-screen-movie-title');
    this.seatPlanWrapper = document.getElementById('seat-plan-wrapper');
    this.btnBackToMovie = document.getElementById('btn-back-to-movie');
    this.ticketMovieName = document.getElementById('ticket-movie-name');
    this.ticketUserName = document.getElementById('ticket-user-name');
    this.ticketSeatDisplay = document.getElementById('ticket-seat-display');
    this.btnEnterTheater = document.getElementById('btn-enter-theater');

    // In-Theater HUD Elements
    this.theaterHud = document.getElementById('theater-hud');
    this.crosshair = document.getElementById('crosshair');
    this.interactionPrompt = document.getElementById('interaction-prompt');
    this.seatTooltip = document.getElementById('seat-tooltip');
    this.pointerlockOverlay = document.getElementById('pointerlock-overlay');
    this.btnResumeLock = document.getElementById('btn-resume-lock');
    this.seatedControls = document.getElementById('seated-controls');

    this.hudSeatDisplay = document.getElementById('hud-seat-display');
    this.hudVisitorDisplay = document.getElementById('hud-visitor-display');
    this.hudMovieTitle = document.getElementById('hud-movie-title');

    // Controls
    this.btnToggleLights = document.getElementById('btn-toggle-lights');
    this.btnExitToLobby = document.getElementById('btn-exit-to-lobby');
    this.btnStandUp = document.getElementById('btn-stand-up');
    this.btnPlayPause = document.getElementById('btn-play-pause');
    this.iconPlayPause = document.getElementById('icon-play-pause');
    this.btnRewind = document.getElementById('btn-rewind');
    this.btnForward = document.getElementById('btn-forward');
    this.btnVolumeToggle = document.getElementById('btn-volume-toggle');
    this.videoVolume = document.getElementById('video-volume');
    this.videoProgress = document.getElementById('video-progress');
    this.videoCurrentTime = document.getElementById('video-current-time');
    this.videoDuration = document.getElementById('video-duration');
    this.btnChangeVideo = document.getElementById('btn-change-video');
  }

  setupEventListeners() {
    // 1. Login Form Submit
    this.formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = this.inputUsername.value.trim();
      if (val) this.userName = val;
      this.membership = this.selectMembership.value;
      audioManager.playChime();

      this.goToScreen('movie');
      this.greetingUsername.textContent = this.userName;
      this.renderMovieGrid();
    });

    // 2. Movie Navigation
    this.btnBackToLogin.addEventListener('click', () => {
      audioManager.playClick();
      this.goToScreen('login');
    });

    this.btnProceedToSeat.addEventListener('click', () => {
      audioManager.playClick();
      this.goToScreen('seat');
      this.renderSeatMap();
    });

    // Local Video File Picker
    this.inputLocalVideo.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        audioManager.playChime();
        const customMovie = this.videoManager.loadLocalFile(file);
        this.selectedMovie = customMovie;
        this.renderMovieGrid();
        this.btnProceedToSeat.disabled = false;

        // If player is already seated in theater, immediately update title and play!
        if (this.playerController.isSeated) {
          this.hudMovieTitle.textContent = customMovie.title;
          setTimeout(() => {
            this.videoManager.play();
          }, 300);
        }
      }
    });

    // 3. Seat Screen Navigation
    this.btnBackToMovie.addEventListener('click', () => {
      audioManager.playClick();
      this.goToScreen('movie');
    });

    this.btnEnterTheater.addEventListener('click', () => {
      audioManager.playChime();
      this.enterTheater();
    });

    // 4. PointerLock Overlay
    this.btnResumeLock.addEventListener('click', () => {
      audioManager.playClick();
      this.playerController.lock();
    });

    // 5. HUD Actions
    this.btnToggleLights.addEventListener('click', () => {
      audioManager.playClick();
      const isDim = this.cinemaScene.currentLightFactor < 0.5;
      this.cinemaScene.setLightingFactor(isDim ? 1.0 : 0.05, 2.0);
    });

    this.btnExitToLobby.addEventListener('click', () => {
      audioManager.playClick();
      this.exitToLobby();
    });

    // 6. Seated Media Playback Actions
    this.btnStandUp.addEventListener('click', () => {
      audioManager.playClick();
      this.playerController.standUp();
    });

    this.btnPlayPause.addEventListener('click', () => {
      audioManager.playClick();
      this.videoManager.togglePlay();
    });

    this.btnRewind.addEventListener('click', () => {
      audioManager.playClick();
      this.videoManager.skip(-10);
    });

    this.btnForward.addEventListener('click', () => {
      audioManager.playClick();
      this.videoManager.skip(10);
    });

    this.videoVolume.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value);
      this.videoManager.setVolume(vol);
      this.btnVolumeToggle.textContent = vol === 0 ? '🔇' : '🔊';
    });

    this.btnVolumeToggle.addEventListener('click', () => {
      if (this.videoManager.getVolume() > 0) {
        this.prevVolume = this.videoManager.getVolume();
        this.videoManager.setVolume(0);
        this.videoVolume.value = 0;
        this.btnVolumeToggle.textContent = '🔇';
      } else {
        const restoreVol = this.prevVolume || 0.8;
        this.videoManager.setVolume(restoreVol);
        this.videoVolume.value = restoreVol;
        this.btnVolumeToggle.textContent = '🔊';
      }
    });

    this.videoProgress.addEventListener('input', (e) => {
      const pct = parseFloat(e.target.value) / 100;
      if (this.videoManager.videoEl.duration) {
        this.videoManager.seek(pct * this.videoManager.videoEl.duration);
      }
    });

    this.btnChangeVideo.addEventListener('click', () => {
      this.inputLocalVideo.click();
    });

    // Hook video timeline updates
    this.videoManager.onTimeUpdateCallback = (currentTime, duration) => {
      if (Number.isFinite(duration) && duration > 0) {
        this.videoProgress.value = (currentTime / duration) * 100;
        this.videoCurrentTime.textContent = this.formatTime(currentTime);
        this.videoDuration.textContent = this.formatTime(duration);
      } else {
        this.videoCurrentTime.textContent = this.formatTime(currentTime);
      }
    };

    this.videoManager.onPlayStateCallback = (isPlaying) => {
      this.iconPlayPause.textContent = isPlaying ? '⏸️' : '▶️';
    };

    // Controller callbacks
    this.playerController.onLockChange = (isLocked) => {
      if (isLocked) {
        this.pointerlockOverlay.classList.add('hidden');
        this.crosshair.classList.remove('hidden');
      } else {
        if (!this.playerController.isSeated) {
          this.pointerlockOverlay.classList.remove('hidden');
        }
        this.crosshair.classList.add('hidden');
      }
    };

    this.playerController.onSitStateChange = (isSeated, seatData) => {
      if (isSeated) {
        this.onUserSitDown(seatData);
      } else {
        this.onUserStandUp();
      }
    };

    // Global Key Listener for Sitting / Standing
    document.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE') {
        const interaction = this.seatManager.checkInteraction(
          this.playerController.camera.position,
          this.playerController.getLookDirection()
        );
        if (interaction.canSit && interaction.seatData) {
          audioManager.playChime();
          this.playerController.sitDown(interaction.seatData);
        }
      }
    });
  }

  /**
   * Switch active screen modal
   */
  goToScreen(screenKey) {
    [this.screenLogin, this.screenMovie, this.screenSeat].forEach((screen) => {
      screen.classList.remove('active');
    });

    if (screenKey === 'login') this.screenLogin.classList.add('active');
    if (screenKey === 'movie') this.screenMovie.classList.add('active');
    if (screenKey === 'seat') this.screenSeat.classList.add('active');
  }

  /**
   * Render Movie Grid
   */
  renderMovieGrid() {
    this.movieGrid.innerHTML = '';

    DEFAULT_MOVIES.forEach((movie) => {
      const isSel = this.selectedMovie && this.selectedMovie.id === movie.id;
      const card = document.createElement('div');
      card.className = `movie-card ${isSel ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="movie-thumb-wrapper">
          <canvas class="movie-thumb-canvas" width="280" height="160"></canvas>
          <span class="movie-genre-badge">${movie.genre}</span>
          <span class="movie-rating-badge">${movie.rating}</span>
        </div>
        <div class="movie-card-body">
          <h4 class="movie-card-title">${movie.title}</h4>
          <div class="movie-card-meta">Durasi: ${movie.duration} • Dolby Atmos</div>
          <p class="movie-card-desc">${movie.description}</p>
          <div class="card-select-status">
            ${isSel ? '✓ Film Terpilih' : 'Klik untuk Memilih'}
          </div>
        </div>
      `;

      // Draw poster canvas preview
      const canvas = card.querySelector('canvas');
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 280, 160);
      grad.addColorStop(0, '#1a1020');
      grad.addColorStop(1, movie.posterColor || '#0a0a14');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 280, 160);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px "Cinzel", serif';
      ctx.textAlign = 'center';
      ctx.fillText(movie.title, 140, 85);

      card.addEventListener('click', () => {
        audioManager.playClick();
        this.selectedMovie = movie;
        this.videoManager.setMovie(movie);
        this.renderMovieGrid();
        this.btnProceedToSeat.disabled = false;
      });

      this.movieGrid.appendChild(card);
    });

    // If a custom local video was loaded, show it at the front
    if (this.videoManager.isLocalFile && this.selectedMovie) {
      const card = document.createElement('div');
      card.className = 'movie-card selected';
      card.innerHTML = `
        <div class="movie-thumb-wrapper" style="background: linear-gradient(135deg, #1f1430, #381525);">
          <div style="display:flex; align-items:center; justify-content:center; height:100%; font-size:3rem;">🎬</div>
          <span class="movie-genre-badge">FILE LOKAL</span>
          <span class="movie-rating-badge">USER</span>
        </div>
        <div class="movie-card-body">
          <h4 class="movie-card-title">${this.selectedMovie.title}</h4>
          <div class="movie-card-meta">Video Lokal Pribadi</div>
          <p class="movie-card-desc">${this.selectedMovie.description}</p>
          <div class="card-select-status">✓ Film Terpilih (Lokal)</div>
        </div>
      `;
      this.movieGrid.prepend(card);
    }

    this.btnProceedToSeat.disabled = !this.selectedMovie;
  }

  /**
   * Render Interactive 2D Seat Map
   */
  renderSeatMap() {
    this.seatScreenMovieTitle.textContent = this.selectedMovie.title;
    this.ticketMovieName.textContent = this.selectedMovie.title;
    this.ticketUserName.textContent = this.userName;
    this.seatPlanWrapper.innerHTML = '';

    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

    rows.forEach((rowLetter) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'seat-row';

      const labelLeft = document.createElement('span');
      labelLeft.className = 'row-label';
      labelLeft.textContent = rowLetter;
      rowEl.appendChild(labelLeft);

      // Left Wing: Seats 1 to 3
      for (let col = 1; col <= 3; col++) {
        rowEl.appendChild(this.createSeatButton(rowLetter, col));
      }

      // Left Aisle gap (Lorong Kiri)
      const aisleLeft = document.createElement('div');
      aisleLeft.className = 'aisle-space';
      rowEl.appendChild(aisleLeft);

      // Center Block: Seats 4 to 11
      for (let col = 4; col <= 11; col++) {
        rowEl.appendChild(this.createSeatButton(rowLetter, col));
      }

      // Right Aisle gap (Lorong Kanan)
      const aisleRight = document.createElement('div');
      aisleRight.className = 'aisle-space';
      rowEl.appendChild(aisleRight);

      // Right Wing: Seats 12 to 14
      for (let col = 12; col <= 14; col++) {
        rowEl.appendChild(this.createSeatButton(rowLetter, col));
      }

      const labelRight = document.createElement('span');
      labelRight.className = 'row-label';
      labelRight.textContent = rowLetter;
      rowEl.appendChild(labelRight);

      this.seatPlanWrapper.appendChild(rowEl);
    });

    this.updateTicketPreview();
  }

  createSeatButton(row, col) {
    const seatId = `${row}${col}`;
    const btn = document.createElement('button');
    btn.className = 'seat-button';
    btn.textContent = col;
    btn.dataset.seatId = seatId;

    if (this.occupiedSeats.has(seatId)) {
      btn.classList.add('occupied');
      btn.title = `Kursi ${seatId} telah dipesan orang lain`;
    } else {
      if (this.selectedSeat === seatId) {
        btn.classList.add('selected');
      }

      btn.addEventListener('click', () => {
        audioManager.playClick();
        this.selectedSeat = seatId;
        this.seatPlanWrapper.querySelectorAll('.seat-button').forEach((b) => {
          b.classList.remove('selected');
        });
        btn.classList.add('selected');
        this.updateTicketPreview();
      });
    }

    return btn;
  }

  updateTicketPreview() {
    if (this.selectedSeat) {
      this.ticketSeatDisplay.textContent = this.selectedSeat;
      this.btnEnterTheater.disabled = false;
    } else {
      this.ticketSeatDisplay.textContent = 'PILIH';
      this.btnEnterTheater.disabled = true;
    }
  }

  /**
   * Enter the 3D Theater Experience
   */
  enterTheater() {
    // 1. Hide all overlay screens
    this.goToScreen(null);

    // 2. Set the chosen seat in 3D scene
    this.seatManager.setSelectedSeat(this.selectedSeat);

    // 3. Update HUD information
    this.hudSeatDisplay.textContent = `Kursi: ${this.selectedSeat}`;
    this.hudVisitorDisplay.textContent = `Tamu: ${this.userName}`;
    this.hudMovieTitle.textContent = this.selectedMovie.title;

    // 4. Show Theater HUD and PointerLock overlay
    this.theaterHud.classList.remove('hidden');
    this.pointerlockOverlay.classList.remove('hidden');

    // 5. Start audio room ambience
    audioManager.startRoomAmbience();

    // 6. House lights bright initially
    this.cinemaScene.setLightingFactor(1.0, 2.0);
  }

  /**
   * Called when user presses [E] to sit in their chosen seat
   */
  onUserSitDown(seatData) {
    this.seatedControls.classList.remove('hidden');
    this.crosshair.classList.add('hidden');
    this.interactionPrompt.classList.add('hidden');

    // 1. Play cinematic sub-bass rumble
    audioManager.playCinematicBoom();

    // 2. Dim theater lights down to authentic movie darkness
    this.cinemaScene.setLightingFactor(0.04, 0.7);

    // 3. Start movie playback automatically on the screen!
    setTimeout(() => {
      this.videoManager.play();
    }, 1200);
  }

  /**
   * Called when user stands up from seat
   */
  onUserStandUp() {
    this.seatedControls.classList.add('hidden');
    this.pointerlockOverlay.classList.remove('hidden');

    // Turn house lights partially back on for walking safely
    this.cinemaScene.setLightingFactor(0.9, 1.5);
  }

  /**
   * Return to lobby
   */
  exitToLobby() {
    this.videoManager.pause();
    this.playerController.unlock();
    this.theaterHud.classList.add('hidden');
    this.seatedControls.classList.add('hidden');
    audioManager.stopRoomAmbience();
    this.goToScreen('movie');
  }

  /**
   * Per-frame HUD updates (checking Raycast / seat proximity)
   */
  updateHUD() {
    if (this.playerController.isSeated) {
      this.interactionPrompt.classList.add('hidden');
      this.seatTooltip.classList.add('hidden');
      return;
    }

    const camPos = this.playerController.camera.position;
    const lookDir = this.playerController.getLookDirection();
    const result = this.seatManager.checkInteraction(camPos, lookDir);

    if (result.canSit && result.seatData) {
      this.interactionPrompt.classList.remove('hidden');
      this.interactionPrompt.querySelector('.prompt-text').textContent =
        `Duduk di Kursi ${result.seatData.id}`;
      this.seatTooltip.classList.add('hidden');
    } else if (result.isOtherSeat) {
      this.interactionPrompt.classList.add('hidden');
      this.seatTooltip.classList.remove('hidden');
      this.seatTooltip.querySelector('.tooltip-text').textContent =
        `Kursi ${result.otherSeatId} bukan pesanan Anda`;
    } else {
      this.interactionPrompt.classList.add('hidden');
      this.seatTooltip.classList.add('hidden');
    }
  }

  formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
}
