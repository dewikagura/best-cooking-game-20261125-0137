// Warung Rush — main.js
// One job: boot the game and run the frame loop. Wires config, state,
// render and input together, and builds the deterministic ?shot= states
// the screenshots are taken from (frozen frames, no timer running).

import { CANVAS_W, CANVAS_H } from './config.js';
import { addIngredient, createState, spawnCustomer, startCooking, update } from './state.js';
import { draw } from './render.js';
import { attachInput } from './input.js';

const canvas = document.getElementById('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const state = createState();
attachInput(canvas, state);
if (shot) buildShot(state, shot);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!shot) update(state, dt);
  draw(ctx, state, now / 1000);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Deterministic screenshot states: fixed customers, plates and HUD numbers,
// with the timer frozen (main.js never calls update() in shot mode) so
// every capture of the same state looks the same.
function buildShot(state, shot) {
  state.screen = 'playing';
  state.over = false;
  if (shot === 'cover') {
    // The cover must show everything at once: a full board, one plate
    // mid-assembly, one plate ready to serve, one dish on the wok, a combo
    // burning and the shift timer ticking.
    state.timeLeft = 132;
    state.coins = 24000;
    state.tips = 3500;
    state.served = 5;
    state.combo = 4;
    state.bestCombo = 4;
    state.level = 2;
    spawnCustomer(state, 'nasi-goreng');
    spawnCustomer(state, 'mie-ayam');
    spawnCustomer(state, 'sate-ayam');
    state.customers[0].patience = 38; state.customers[0].patienceMax = 42;
    state.customers[1].patience = 22; state.customers[1].patienceMax = 42;
    state.customers[2].patience = 9; state.customers[2].patienceMax = 42;
    state.selectedPlate = 0;
    addIngredient(state, 'nasi');
    addIngredient(state, 'telur');
    state.selectedPlate = 1;
    addIngredient(state, 'sate');
    addIngredient(state, 'kecap');
    startCooking(state, 1);
    state.plates[1].cooking = null;
    state.plates[1].ready = true;
    state.plates[1].burnLeft = 10;
    state.selectedPlate = 2;
    addIngredient(state, 'nasi');
    addIngredient(state, 'telur');
    addIngredient(state, 'kecap');
    startCooking(state, 2);
    state.plates[2].cooking.elapsed = 2.4;
    state.selectedPlate = 0;
  } else if (shot === 'orders') {
    state.timeLeft = 165;
    state.coins = 8000;
    state.tips = 1200;
    state.served = 2;
    state.combo = 1;
    state.bestCombo = 2;
    state.level = 1;
    spawnCustomer(state, 'nasi-ayam');
    spawnCustomer(state, 'es-teh');
    spawnCustomer(state, 'sate-ayam');
    spawnCustomer(state, 'mie-ayam');
    state.customers[0].patience = 40; state.customers[0].patienceMax = 45;
    state.customers[1].patience = 33; state.customers[1].patienceMax = 45;
    state.customers[2].patience = 18; state.customers[2].patienceMax = 45;
    state.customers[3].patience = 7; state.customers[3].patienceMax = 45;
  } else if (shot === 'assembly') {
    state.timeLeft = 150;
    state.coins = 12000;
    state.tips = 1800;
    state.served = 3;
    state.combo = 2;
    state.bestCombo = 3;
    state.level = 1;
    spawnCustomer(state, 'mie-ayam');
    state.customers[0].patience = 30; state.customers[0].patienceMax = 45;
    state.selectedPlate = 0;
    addIngredient(state, 'mie');
    addIngredient(state, 'ayam');
    state.selectedPlate = 1;
    addIngredient(state, 'nasi');
    addIngredient(state, 'telur');
    state.selectedPlate = 0;
  } else if (shot === 'serve') {
    state.timeLeft = 98;
    state.coins = 31500;
    state.tips = 6200;
    state.served = 9;
    state.combo = 6;
    state.bestCombo = 6;
    state.level = 3;
    spawnCustomer(state, 'es-teh');
    state.customers[0].patience = 26; state.customers[0].patienceMax = 39;
    state.selectedPlate = 0;
    addIngredient(state, 'teh');
    addIngredient(state, 'es');
    state.selectedPlate = 1;
    addIngredient(state, 'nasi');
    addIngredient(state, 'ayam');
    addIngredient(state, 'sayur');
    startCooking(state, 1);
    state.plates[1].cooking.elapsed = 2;
    state.selectedPlate = 2;
    addIngredient(state, 'sate');
    state.selectedPlate = 0;
  }
}
