// Warung Rush — mouse and keyboard input: which part of the kitchen a click
// lands on, and what that click does to the state.

import { INGREDIENTS, LAYOUT } from './config.js';
import { addIngredient, startCooking, serveTicket, clearPlate, startShift, newGame } from './state.js';
import { ensureAudio, playClick, playAdd, playSizzle, playDing, playBuzzer } from './audio.js';

function inside(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function binAt(x, y) {
  const { bins } = LAYOUT;
  for (let i = 0; i < INGREDIENTS.length; i++) {
    const col = i % bins.cols;
    const row = Math.floor(i / bins.cols);
    const rect = {
      x: bins.x + col * (bins.w + bins.gap),
      y: bins.y + row * (bins.h + bins.gap),
      w: bins.w,
      h: bins.h,
    };
    if (inside(x, y, rect)) return INGREDIENTS[i];
  }
  return null;
}

function plateAt(x, y) {
  const { plates } = LAYOUT;
  for (let i = 0; i < 3; i++) {
    const rect = { x: plates.x + i * (plates.w + plates.gap), y: plates.y, w: plates.w, h: plates.h };
    if (inside(x, y, rect)) return i;
  }
  return -1;
}

function ticketAt(state, x, y) {
  const { board, ticket } = LAYOUT;
  for (let i = 0; i < state.customers.length; i++) {
    const rect = { x: board.x + i * (ticket.w + ticket.gap), y: board.y, w: ticket.w, h: ticket.h };
    if (inside(x, y, rect)) return state.customers[i].id;
  }
  return null;
}

function buttonAt(state, x, y) {
  if (!state.buttonRects) return null;
  for (const b of state.buttonRects) {
    if (inside(x, y, b)) return b.action;
  }
  return null;
}

// A click on a plate's MASAK strip starts cooking; anywhere else selects it.
function cookStripAt(plateIndex, x, y) {
  const { plates } = LAYOUT;
  const px = plates.x + plateIndex * (plates.w + plates.gap);
  return inside(x, y, { x: px + 16, y: plates.y + 148, w: plates.w - 32, h: 22 });
}

export function handleClick(state, x, y) {
  ensureAudio();
  if (state.screen === 'title') {
    startShift(state);
    playDing(state.muted);
    return;
  }
  if (state.screen === 'over') {
    const fresh = newGame(state.seed + 1);
    Object.assign(state, fresh);
    startShift(state);
    return;
  }

  const action = buttonAt(state, x, y);
  if (action === 'trash') {
    clearPlate(state, state.selectedPlate);
    playClick(state.muted);
    return;
  }
  if (action === 'sound') {
    state.muted = !state.muted;
    state.message = state.muted ? 'Suara dimatikan.' : 'Suara dinyalakan.';
    state.messageTimer = 2;
    return;
  }
  if (action === 'restart') {
    const fresh = newGame(state.seed + 1);
    Object.assign(state, fresh);
    startShift(state);
    return;
  }

  const ticketId = ticketAt(state, x, y);
  if (ticketId !== null) {
    const earned = serveTicket(state, ticketId);
    if (earned > 0) playDing(state.muted);
    else playBuzzer(state.muted);
    return;
  }

  const ingredient = binAt(x, y);
  if (ingredient) {
    const result = addIngredient(state, state.selectedPlate, ingredient.id);
    if (result === 'added') {
      playAdd(state.muted);
      const plate = state.plates[state.selectedPlate];
      if (plate.dish) {
        state.message = plate.dish.name + ' teracik! ' + (plate.dish.cook > 0 ? 'Klik MASAK di piring.' : 'Siap disajikan!');
        state.messageTimer = 3;
      }
    } else if (result === 'full') {
      state.message = 'Piring sudah penuh (3 bahan).';
      state.messageTimer = 2;
      playBuzzer(state.muted);
    } else if (result === 'busy') {
      state.message = 'Piring itu sedang dimasak, tunggu sebentar.';
      state.messageTimer = 2;
    }
    return;
  }

  const plateIndex = plateAt(x, y);
  if (plateIndex >= 0) {
    const plate = state.plates[plateIndex];
    if (plate.dish && plate.cooking === 0 && !plate.ready && cookStripAt(plateIndex, x, y)) {
      if (startCooking(state, plateIndex)) {
        playSizzle(state.muted);
        state.message = plate.dish.name + ' masuk ' + plate.dish.station + '…';
        state.messageTimer = 2;
      }
    } else {
      state.selectedPlate = plateIndex;
      playClick(state.muted);
    }
  }
}

export function handleKey(state, key) {
  ensureAudio();
  if (key === ' ') {
    if (state.screen === 'title') { startShift(state); playDing(state.muted); }
    return;
  }
  if (key === 'r' || key === 'R') {
    const fresh = newGame(state.seed + 1);
    Object.assign(state, fresh);
    startShift(state);
    return;
  }
  if (state.screen !== 'playing') return;
  const ingredient = INGREDIENTS.find((ing) => ing.key === key);
  if (ingredient) {
    const result = addIngredient(state, state.selectedPlate, ingredient.id);
    if (result === 'added') playAdd(state.muted);
    return;
  }
  const plateKeys = ['q', 'w', 'e'];
  const plateIndex = plateKeys.indexOf(key.toLowerCase());
  if (plateIndex >= 0) {
    state.selectedPlate = plateIndex;
    playClick(state.muted);
  }
}
