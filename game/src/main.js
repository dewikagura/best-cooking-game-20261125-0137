// Warung Rush — the entry point: canvas setup, the game loop, the title /
// playing / game-over screens, and the deterministic ?shot= states used for
// the entry's screenshots (each one a real state of the same game).

import { CANVAS_W, CANVAS_H, matchRecipe } from './config.js';
import { newGame, spawnCustomer, updateGame, emptyPlate } from './state.js';
import { drawGame } from './render.js';
import { handleClick, handleKey } from './input.js';
import { ensureAudio, playLevelUp } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');

let state = newGame(20261125);

// Build one fixed, good-looking kitchen state per screenshot name.
// Every shot is a real game state: same rules, same drawing, no staging code.
function applyShot(name) {
  const shot = newGame(20261125);
  shot.screen = 'playing';
  shot.messageTimer = 99;
  const setPlate = (index, items, cooking, ready, burnLeft) => {
    const plate = shot.plates[index];
    plate.items = items;
    plate.dish = matchRecipe(items);
    if (cooking) { plate.cooking = cooking; plate.cookTime = plate.dish ? plate.dish.cook : 0; }
    if (ready) { plate.ready = true; plate.burnLeft = burnLeft || 6; }
  };
  const addTicket = (dishId, patience, maxPatience, name, hue) => {
    shot.customers.push({
      id: shot.nextTicketId++, name, dishId,
      patience, maxPatience, hue, arrivedAt: 0,
    });
  };
  if (name === 'cover') {
    shot.timeLeft = 92; shot.coins = 1240; shot.served = 9; shot.combo = 3; shot.bestCombo = 5; shot.level = 3;
    shot.message = 'Sate Ayam siap! Antar sebelum hangus!';
    addTicket('nasi-goreng', 12, 40, 'Budi', 20);
    addTicket('mie-ayam', 30, 44, 'Sari', 200);
    addTicket('sate-ayam', 38, 44, 'Agus', 280);
    setPlate(0, ['nasi', 'telur'], 0, false, 0);
    setPlate(1, ['mie', 'ayam', 'sayur'], 3.0, false, 0);
    setPlate(2, ['sate', 'kecap'], 0, true, 4.2);
    shot.selectedPlate = 0;
  } else if (name === 'orders') {
    shot.timeLeft = 168; shot.coins = 240; shot.served = 2; shot.combo = 1; shot.bestCombo = 2; shot.level = 1;
    shot.message = 'Empat pesanan masuk! Racik dari bahan di counter.';
    addTicket('nasi-goreng', 44, 46, 'Dewi', 340);
    addTicket('es-teh', 42, 46, 'Rina', 60);
    addTicket('sate-ayam', 40, 46, 'Joko', 140);
    addTicket('mie-ayam', 38, 46, 'Maya', 260);
  } else if (name === 'assembly') {
    shot.timeLeft = 120; shot.coins = 480; shot.served = 4; shot.combo = 2; shot.bestCombo = 3; shot.level = 2;
    shot.message = 'Tambah Kecap untuk Nasi Goreng di Piring 1!';
    addTicket('nasi-goreng', 30, 42, 'Putri', 100);
    addTicket('es-teh', 36, 42, 'Budi', 20);
    setPlate(0, ['nasi', 'telur'], 0, false, 0);
    setPlate(1, ['mie'], 0, false, 0);
    shot.selectedPlate = 0;
  } else if (name === 'serve') {
    shot.timeLeft = 75; shot.coins = 860; shot.served = 6; shot.combo = 2; shot.bestCombo = 4; shot.level = 2;
    shot.message = 'Nasi Goreng siap disajikan! Klik pesanan Budi!';
    addTicket('nasi-goreng', 20, 40, 'Budi', 20);
    addTicket('mie-ayam', 34, 44, 'Sari', 200);
    setPlate(0, ['nasi', 'telur', 'kecap'], 0, true, 5.0);
    shot.selectedPlate = 0;
  }
  return shot;
}

if (shotName) {
  state = applyShot(shotName);
  // Screenshot states hold still: no timers run, so the render is identical
  // every time the same shot is opened.
  state.screen = 'playing';
} else {
  state = newGame((Date.now() % 100000) | 0);
}

canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (CANVAS_W / rect.width);
  const y = (event.clientY - rect.top) * (CANVAS_H / rect.height);
  handleClick(state, x, y);
});

window.addEventListener('keydown', (event) => {
  if (event.key === ' ') event.preventDefault();
  handleKey(state, event.key);
});

canvas.addEventListener('pointerdown', () => ensureAudio(), { once: true });

let lastTime = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  if (!shotName) {
    const levelBefore = state.level;
    updateGame(state, dt);
    if (state.level > levelBefore) playLevelUp(state.muted);
  }
  drawGame(ctx, state);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Exposed for automated play-testing: the test driver reads and drives it.
window.__warung = {
  get state() { return state; },
  click(x, y) { handleClick(state, x, y); },
  key(k) { handleKey(state, k); },
  start() { state.screen = 'title'; handleClick(state, 640, 593); },
};
