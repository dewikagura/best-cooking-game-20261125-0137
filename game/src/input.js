// Warung Rush — input.js
// One job: turn mouse clicks and key presses into game actions. Knows where
// every button, bin, plate and ticket is drawn, and hands the intent to
// state.js. Exposes the live state at window.__warung for playtesting.

import { BIN_CENTERS, BIN_SIZE, INGREDIENTS } from './config.js';
import { addIngredient, serveCustomer, startCooking, startShift, clearPlate } from './state.js';
import { sounds } from './audio.js';

const TICKET = { x: 46, y: 78, w: 240, h: 110, gap: 12 };
const PLATE = { x: 340, y: 300, w: 160, h: 150, gap: 20 };
const MASAK = { w: 136, h: 30, dy: 84 };
const TRASH = { x: 40, y: 708, w: 122, h: 40 };
const START = { x: 540, y: 565, w: 200, h: 55 };

function inside(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}

export function ticketRect(index) {
  return { x: TICKET.x + index * (TICKET.w + TICKET.gap), y: TICKET.y, w: TICKET.w, h: TICKET.h };
}

export function plateRect(index) {
  return { x: PLATE.x + index * (PLATE.w + PLATE.gap), y: PLATE.y, w: PLATE.w, h: PLATE.h };
}

export function masakRect(index) {
  const plate = plateRect(index);
  return { x: plate.x + 12, y: plate.y + MASAK.dy, w: MASAK.w, h: MASAK.h };
}

export function attachInput(canvas, state) {
  window.__warung = { state };
  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 1280;
    const y = ((event.clientY - rect.top) / rect.height) * 800;
    handleClick(state, x, y);
  });
  window.addEventListener('keydown', (event) => handleKey(state, event));
}

function handleClick(state, x, y) {
  if (state.screen === 'title') {
    if (inside(x, y, START)) { sounds.click(); startShift(state); }
    return;
  }
  if (state.screen === 'over') {
    if (inside(x, y, START)) { sounds.click(); startShift(state); }
    return;
  }
  if (inside(x, y, TRASH)) {
    clearPlate(state, state.selectedPlate);
    sounds.fail();
    return;
  }
  for (let i = 0; i < state.customers.length; i++) {
    if (inside(x, y, ticketRect(i))) {
      const paid = serveCustomer(state, i);
      if (paid) sounds.coin();
      else sounds.fail();
      return;
    }
  }
  for (let i = 0; i < 3; i++) {
    if (inside(x, y, masakRect(i))) {
      if (startCooking(state, i)) sounds.sizzle();
      return;
    }
    if (inside(x, y, plateRect(i))) {
      state.selectedPlate = i;
      sounds.click();
      return;
    }
  }
  for (let i = 0; i < INGREDIENTS.length; i++) {
    const [cx, cy] = BIN_CENTERS[i];
    if (Math.abs(x - cx) <= BIN_SIZE / 2 && Math.abs(y - cy) <= BIN_SIZE / 2) {
      const result = addIngredient(state, INGREDIENTS[i].id);
      if (result === 'added') sounds.chop();
      else if (result === 'done') sounds.ding();
      else sounds.fail();
      return;
    }
  }
}

function handleKey(state, event) {
  const key = event.key.toLowerCase();
  if (key === ' ' || key === 'enter') {
    if (state.screen !== 'playing') { sounds.click(); startShift(state); }
    event.preventDefault();
    return;
  }
  if (key === 'r') {
    if (state.screen !== 'title') { sounds.click(); startShift(state); }
    return;
  }
  if (state.screen !== 'playing') return;
  const ingIndex = INGREDIENTS.findIndex((ing) => ing.key === key);
  if (ingIndex >= 0) {
    const result = addIngredient(state, INGREDIENTS[ingIndex].id);
    if (result === 'added') sounds.chop();
    else if (result === 'done') sounds.ding();
    else sounds.fail();
    return;
  }
  if (key === 'q') { state.selectedPlate = 0; sounds.click(); }
  if (key === 'w') { state.selectedPlate = 1; sounds.click(); }
  if (key === 'e') { state.selectedPlate = 2; sounds.click(); }
  if (key === 't') { clearPlate(state, state.selectedPlate); sounds.fail(); }
}
