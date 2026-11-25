// Warung Rush — every pixel of the kitchen, drawn with the canvas 2D API.
// No image files are shipped: food, customers, the wok and the grill are all
// drawn shapes, so the game stays one small folder of code.

import { CANVAS_W, CANVAS_H, INGREDIENTS, RECIPES, LAYOUT, ingredientById, recipeById } from './config.js';

const CREAM = '#f5e6c8';
const WOOD = '#7a4a21';
const WOOD_DARK = '#5d3413';
const INK = '#241505';
const RED = '#c0392b';
const GREEN = '#27ae60';
const GOLD = '#f1c40f';
const TEAL = '#16a085';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight, align) {
  ctx.fillStyle = color || INK;
  ctx.font = (weight || 'bold') + ' ' + size + 'px "DejaVu Sans", sans-serif';
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

function formatRupiah(n) {
  return 'Rp' + Math.round(n).toLocaleString('id-ID');
}

// One ingredient drawn as a little picture: rice mound, egg, drumstick,
// noodles, greens, satay skewer, sauce bottle, tea cup, ice cubes.
export function drawFoodIcon(ctx, id, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineWidth = Math.max(2, r * 0.08);
  if (id === 'nasi') {
    ctx.fillStyle = '#fff8e7';
    ctx.beginPath(); ctx.arc(0, r * 0.15, r * 0.85, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#d8c9a3'; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2;
    for (const dx of [-0.4, 0, 0.4]) {
      ctx.beginPath(); ctx.moveTo(dx * r, -r * 0.5); ctx.quadraticCurveTo(dx * r + r * 0.2, -r * 0.8, dx * r, -r * 1.05); ctx.stroke();
    }
  } else if (id === 'telur') {
    ctx.fillStyle = '#fffdf5';
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.95, r * 0.7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#e8ddc0'; ctx.stroke();
    ctx.fillStyle = '#ffb703';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.38, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'ayam') {
    ctx.fillStyle = '#d97b2f';
    ctx.beginPath(); ctx.arc(-r * 0.2, -r * 0.1, r * 0.62, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f6e3c5';
    ctx.beginPath(); ctx.arc(r * 0.55, r * 0.45, r * 0.28, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff3dc'; ctx.lineWidth = r * 0.16;
    ctx.beginPath(); ctx.moveTo(r * 0.1, r * 0.25); ctx.lineTo(r * 0.5, r * 0.45); ctx.stroke();
  } else if (id === 'mie') {
    ctx.strokeStyle = '#f2c14e'; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.85, i * r * 0.45);
      ctx.bezierCurveTo(-r * 0.4, i * r * 0.45 - r * 0.45, r * 0.1, i * r * 0.45 + r * 0.45, r * 0.85, i * r * 0.45);
      ctx.stroke();
    }
  } else if (id === 'sayur') {
    ctx.fillStyle = '#4caf50';
    for (const [dx, dy, rot] of [[-0.35, 0.1, -0.6], [0.3, -0.15, 0.5], [0, -0.35, 0]]) {
      ctx.save(); ctx.translate(dx * r, dy * r); ctx.rotate(rot);
      ctx.beginPath(); ctx.ellipse(0, 0, r * 0.32, r * 0.55, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = '#2e7d32'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, r * 0.4); ctx.lineTo(0, r * 0.9); ctx.stroke();
  } else if (id === 'sate') {
    ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = r * 0.1;
    ctx.beginPath(); ctx.moveTo(-r * 0.9, r * 0.55); ctx.lineTo(r * 0.9, -r * 0.55); ctx.stroke();
    ctx.fillStyle = '#a0522d';
    for (const t of [-0.45, 0, 0.45]) {
      ctx.save(); ctx.translate(t * r * 0.9, -t * r * 0.9); ctx.rotate(Math.PI / 4);
      ctx.fillRect(-r * 0.3, -r * 0.3, r * 0.6, r * 0.6);
      ctx.restore();
    }
  } else if (id === 'kecap') {
    ctx.fillStyle = '#4a2c17';
    roundRect(ctx, -r * 0.35, -r * 0.2, r * 0.7, r * 0.95, r * 0.15); ctx.fill();
    ctx.fillRect(-r * 0.18, -r * 0.75, r * 0.36, r * 0.6);
    ctx.fillStyle = '#f5e6c8';
    ctx.fillRect(-r * 0.35, -r * 0.05, r * 0.7, r * 0.4);
  } else if (id === 'teh') {
    ctx.fillStyle = '#c97b2d';
    ctx.beginPath(); ctx.moveTo(-r * 0.6, -r * 0.4); ctx.lineTo(r * 0.6, -r * 0.4); ctx.lineTo(r * 0.45, r * 0.7); ctx.lineTo(-r * 0.45, r * 0.7); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#c97b2d'; ctx.lineWidth = r * 0.14;
    ctx.beginPath(); ctx.arc(r * 0.65, r * 0.1, r * 0.3, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-r * 0.3, -r * 0.7); ctx.quadraticCurveTo(-r * 0.1, -r * 1, -r * 0.3, -r * 1.15); ctx.stroke();
  } else if (id === 'es') {
    ctx.fillStyle = 'rgba(174,230,245,0.95)';
    ctx.strokeStyle = '#5fb8d4'; ctx.lineWidth = 2;
    for (const [dx, dy, rot] of [[-0.3, 0.2, 0.3], [0.3, -0.15, -0.2]]) {
      ctx.save(); ctx.translate(dx * r, dy * r); ctx.rotate(rot);
      ctx.fillRect(-r * 0.35, -r * 0.35, r * 0.7, r * 0.7);
      ctx.strokeRect(-r * 0.35, -r * 0.35, r * 0.7, r * 0.7);
      ctx.restore();
    }
  }
  ctx.restore();
}

function drawCustomerFace(ctx, cx, cy, r, hue, mood) {
  ctx.save();
  ctx.fillStyle = 'hsl(' + hue + ', 55%, 78%)';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = INK;
  ctx.beginPath(); ctx.arc(cx - r * 0.35, cy - r * 0.15, r * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + r * 0.35, cy - r * 0.15, r * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = r * 0.08; ctx.lineCap = 'round';
  ctx.beginPath();
  if (mood === 'happy') {
    ctx.arc(cx, cy + r * 0.1, r * 0.45, Math.PI * 0.15, Math.PI * 0.85);
  } else if (mood === 'angry') {
    ctx.arc(cx, cy + r * 0.75, r * 0.45, Math.PI * 1.15, Math.PI * 1.85);
  } else {
    ctx.moveTo(cx - r * 0.35, cy + r * 0.35); ctx.lineTo(cx + r * 0.35, cy + r * 0.35);
  }
  ctx.stroke();
  ctx.restore();
}

function drawHud(ctx, state) {
  const { hud } = LAYOUT;
  ctx.fillStyle = '#3a2410';
  ctx.fillRect(hud.x, hud.y, hud.w, hud.h);
  ctx.fillStyle = GOLD;
  ctx.fillRect(0, hud.h - 3, CANVAS_W, 3);
  text(ctx, 'WARUNG RUSH', 16, 30, 30, GOLD, '900');
  text(ctx, 'Level ' + state.level, 300, 30, 20, CREAM);
  text(ctx, 'Koin: ' + formatRupiah(state.coins), 420, 30, 20, CREAM);
  text(ctx, 'Disajikan: ' + state.served, 620, 30, 20, CREAM);
  text(ctx, 'Kombo x' + state.combo, 780, 30, 20, state.combo >= 3 ? GOLD : CREAM);
  const timeColor = state.timeLeft <= 30 ? '#ff6b5e' : CREAM;
  text(ctx, '⏱ ' + formatTime(state.timeLeft), 1060, 30, 26, timeColor, '900');
  text(ctx, '✖'.repeat(state.strikes) + '○'.repeat(Math.max(0, 3 - state.strikes)), 1180, 30, 16, '#ff6b5e');
}

function drawTicket(ctx, ticket, x, y, state) {
  const { w, h } = LAYOUT.ticket;
  const shake = state.shakeTicketId === ticket.id && state.shakeTimer > 0
    ? Math.sin(state.shakeTimer * 60) * 4 : 0;
  const recipe = recipeById(ticket.dishId);
  const ratio = ticket.patience / ticket.maxPatience;
  const mood = ratio > 0.5 ? 'happy' : ratio > 0.25 ? 'flat' : 'angry';
  ctx.save();
  ctx.translate(shake, 0);
  ctx.fillStyle = ratio <= 0.25 ? '#ffe1dc' : '#fffdf5';
  roundRect(ctx, x, y, w, h, 12); ctx.fill();
  ctx.strokeStyle = ratio <= 0.25 ? RED : '#d8c9a3'; ctx.lineWidth = 2; ctx.stroke();
  // A gold SIAP! badge when a matching dish is ready on a plate.
  const hasReady = state.plates.some((p) => p.ready && p.dish && p.dish.id === ticket.dishId);
  if (hasReady) {
    ctx.fillStyle = GOLD;
    roundRect(ctx, x + w - 78, y - 11, 68, 22, 9); ctx.fill();
    ctx.strokeStyle = '#b7950b'; ctx.lineWidth = 1; ctx.stroke();
    text(ctx, 'SIAP!', x + w - 44, y + 1, 13, INK, '900', 'center');
  }
  drawCustomerFace(ctx, x + 34, y + 34, 24, ticket.hue, mood);
  text(ctx, ticket.name, x + 66, y + 22, 17, INK, '900');
  text(ctx, recipe.name, x + 66, y + 46, 19, RED, '900');
  // recipe dots
  let dx = x + 66;
  for (const ingId of recipe.needs) {
    const ing = ingredientById(ingId);
    ctx.fillStyle = ing.color;
    ctx.beginPath(); ctx.arc(dx + 8, y + 74, 9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1; ctx.stroke();
    dx += 24;
  }
  text(ctx, recipe.station ? 'Masak: ' + recipe.station : 'Tanpa masak', x + 66, y + 100, 13, '#7a6a55');
  // patience bar
  ctx.fillStyle = '#e8ddc0';
  roundRect(ctx, x + 190, y + 92, 96, 12, 6); ctx.fill();
  ctx.fillStyle = ratio > 0.5 ? GREEN : ratio > 0.25 ? GOLD : RED;
  roundRect(ctx, x + 190, y + 92, 96 * Math.max(0, ratio), 12, 6); ctx.fill();
  text(ctx, Math.ceil(ticket.patience) + ' dtk', x + 190, y + 76, 12, '#7a6a55');
  ctx.restore();
}

function drawOrderBoard(ctx, state) {
  const { board } = LAYOUT;
  ctx.fillStyle = WOOD_DARK;
  roundRect(ctx, board.x - 4, board.y - 4, board.w + 8, board.h + 8, 10); ctx.fill();
  const { w, gap } = LAYOUT.ticket;
  state.customers.forEach((ticket, i) => {
    drawTicket(ctx, ticket, board.x + i * (w + gap), board.y, state);
  });
  if (state.customers.length === 0) {
    text(ctx, 'Belum ada pesanan — pelanggan segera datang…', board.x + 16, board.y + 60, 18, CREAM);
  }
}

function drawBins(ctx, state) {
  const { bins } = LAYOUT;
  text(ctx, 'BAHAN — klik untuk tambah ke piring', bins.x, bins.labelY, 14, GOLD, '900');
  INGREDIENTS.forEach((ing, i) => {
    const col = i % bins.cols;
    const row = Math.floor(i / bins.cols);
    const x = bins.x + col * (bins.w + bins.gap);
    const y = bins.y + row * (bins.h + bins.gap);
    ctx.fillStyle = '#fffdf5';
    roundRect(ctx, x, y, bins.w, bins.h, 12); ctx.fill();
    ctx.strokeStyle = '#d8c9a3'; ctx.lineWidth = 2; ctx.stroke();
    drawFoodIcon(ctx, ing.id, x + bins.w / 2, y + 34, 24);
    text(ctx, ing.name, x + bins.w / 2, y + 72, 14, INK, '900', 'center');
    ctx.fillStyle = '#7a6a55';
    ctx.beginPath(); ctx.arc(x + bins.w - 14, y + 14, 10, 0, Math.PI * 2); ctx.fill();
    text(ctx, ing.key, x + bins.w - 14, y + 15, 11, '#fff', '900', 'center');
  });
}

function drawPlate(ctx, plate, x, y, selected, state) {
  const { w, h } = LAYOUT.plates;
  ctx.fillStyle = selected ? '#fff3d6' : '#efe3c2';
  roundRect(ctx, x, y, w, h, 12); ctx.fill();
  ctx.strokeStyle = selected ? GOLD : '#c9b183'; ctx.lineWidth = selected ? 3 : 2; ctx.stroke();
  text(ctx, 'PIRING ' + (plate.id + 1), x + w / 2, y + 18, 13, '#7a6a55', '900', 'center');
  // the plate itself
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.ellipse(x + w / 2, y + 92, 62, 46, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#d8c9a3'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#f5efe0';
  ctx.beginPath(); ctx.ellipse(x + w / 2, y + 92, 44, 30, 0, 0, Math.PI * 2); ctx.fill();
  // ingredients on the plate
  plate.items.forEach((ingId, i) => {
    const px = x + w / 2 + (i - (plate.items.length - 1) / 2) * 34;
    drawFoodIcon(ctx, ingId, px, y + 92 - i * 6, 16);
  });
  if (plate.cooking > 0) {
    const p = Math.min(1, plate.cooking / plate.cookTime);
    ctx.fillStyle = '#e8ddc0';
    roundRect(ctx, x + 16, y + 152, w - 32, 12, 6); ctx.fill();
    ctx.fillStyle = '#e67e22';
    roundRect(ctx, x + 16, y + 152, (w - 32) * p, 12, 6); ctx.fill();
    text(ctx, 'Memasak ' + Math.round(p * 100) + '%', x + w / 2, y + 178, 13, '#b45f06', '900', 'center');
  } else if (plate.ready && plate.dish) {
    const burnRatio = plate.dish.cook > 0 ? Math.max(0, plate.burnLeft / 6) : 1;
    ctx.fillStyle = GREEN;
    roundRect(ctx, x + 16, y + 148, w - 32, 22, 8); ctx.fill();
    text(ctx, 'SIAP! ' + plate.dish.name, x + w / 2, y + 159, 13, '#fff', '900', 'center');
    if (plate.dish.cook > 0) {
      ctx.fillStyle = '#e8ddc0';
      roundRect(ctx, x + 16, y + 176, w - 32, 8, 4); ctx.fill();
      ctx.fillStyle = burnRatio > 0.4 ? GOLD : RED;
      roundRect(ctx, x + 16, y + 176, (w - 32) * burnRatio, 8, 4); ctx.fill();
    }
  } else if (plate.dish) {
    ctx.fillStyle = '#b45f06';
    roundRect(ctx, x + 16, y + 148, w - 32, 22, 8); ctx.fill();
    text(ctx, '▶ MASAK (' + plate.dish.cook + ' dtk)', x + w / 2, y + 159, 13, '#fff', '900', 'center');
    text(ctx, plate.dish.name, x + w / 2, y + 182, 12, '#7a6a55', '900', 'center');
  } else {
    text(ctx, plate.items.length + '/3 bahan', x + w / 2, y + 160, 13, '#7a6a55', '900', 'center');
    text(ctx, 'Klik bahan di kiri', x + w / 2, y + 180, 11, '#a08a68', '900', 'center');
  }
}

function drawStations(ctx, state) {
  const { wok, grill } = LAYOUT;
  const wokBusy = state.plates.some((p) => p.cooking > 0 && p.dish && p.dish.station === 'wok');
  const grillBusy = state.plates.some((p) => p.cooking > 0 && p.dish && p.dish.station === 'grill');
  // wok
  ctx.fillStyle = '#2b2b2b';
  ctx.beginPath(); ctx.arc(wok.cx, wok.cy, wok.r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#454545';
  ctx.beginPath(); ctx.arc(wok.cx, wok.cy, wok.r - 12, 0, Math.PI * 2); ctx.fill();
  if (wokBusy) {
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.moveTo(wok.cx - 40, wok.cy + wok.r + 4);
    ctx.quadraticCurveTo(wok.cx, wok.cy + wok.r - 34, wok.cx + 40, wok.cy + wok.r + 4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.moveTo(wok.cx - 22, wok.cy + wok.r + 4);
    ctx.quadraticCurveTo(wok.cx, wok.cy + wok.r - 18, wok.cx + 22, wok.cy + wok.r + 4);
    ctx.closePath(); ctx.fill();
  }
  text(ctx, 'WOK', wok.cx, wok.cy + wok.r + 26, 15, CREAM, '900', 'center');
  // grill
  ctx.fillStyle = '#3d3d3d';
  roundRect(ctx, grill.x, grill.y, grill.w, grill.h, 10); ctx.fill();
  ctx.strokeStyle = '#888'; ctx.lineWidth = 3;
  for (let i = 0; i < 5; i++) {
    const gy = grill.y + 20 + i * 22;
    ctx.beginPath(); ctx.moveTo(grill.x + 12, gy); ctx.lineTo(grill.x + grill.w - 12, gy); ctx.stroke();
  }
  if (grillBusy) {
    ctx.fillStyle = '#e67e22';
    ctx.beginPath(); ctx.arc(grill.x + grill.w / 2, grill.y + grill.h - 16, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath(); ctx.arc(grill.x + grill.w / 2, grill.y + grill.h - 16, 5, 0, Math.PI * 2); ctx.fill();
  }
  text(ctx, 'PANGGANGAN', grill.x + grill.w / 2, grill.y + grill.h + 22, 13, CREAM, '900', 'center');
  text(ctx, 'STASIUN MASAK', 1068, 240, 14, GOLD, '900', 'center');
}

function drawMessageBar(ctx, state) {
  const { message } = LAYOUT;
  ctx.fillStyle = '#3a2410';
  roundRect(ctx, message.x, message.y, message.w, message.h, 10); ctx.fill();
  const msg = state.messageTimer > 0 || state.screen === 'playing' ? state.message : '';
  text(ctx, msg, message.x + 16, message.y + 23, 17, CREAM);
}

function drawButtons(ctx, state) {
  const { buttons } = LAYOUT;
  const labels = [
    { label: '🗑 Buang piring', w: 170, action: 'trash' },
    { label: state.muted ? '🔇 Suara: mati' : '🔊 Suara: nyala', w: 170, action: 'sound' },
    { label: '↻ Ulangi shift', w: 150, action: 'restart' },
  ];
  let x = buttons.x;
  for (const b of labels) {
    ctx.fillStyle = '#5d3413';
    roundRect(ctx, x, buttons.y, b.w, buttons.h, 10); ctx.fill();
    ctx.strokeStyle = GOLD; ctx.lineWidth = 1; ctx.stroke();
    text(ctx, b.label, x + b.w / 2, buttons.y + 23, 15, CREAM, '900', 'center');
    b.x = x; b.y = buttons.y; b.h = buttons.h;
    x += b.w + buttons.gap;
  }
  state.buttonRects = labels;
  const hintX = x + 8;
  text(ctx, 'Kombo x' + state.combo + '  •  Terbaik x' + state.bestCombo, hintX, buttons.y + 14, 14, GOLD, '900');
  text(ctx, 'Klik bahan (atau tombol 1-9) → piring, MASAK, lalu klik pesanan untuk menyajikan.', hintX, buttons.y + 34, 13, CREAM);
}

function drawKitchen(ctx, state) {
  // wall and floor
  ctx.fillStyle = '#2a1a0e';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(0, 204, CANVAS_W, 436);
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(0, 204, CANVAS_W, 10);
  // checkerboard floor tiles under the work area
  for (let ty = 448; ty < 648; ty += 64) {
    for (let tx = 0; tx < CANVAS_W; tx += 64) {
      if (((tx / 64) + (ty / 64)) % 2 === 0) {
        ctx.fillStyle = '#75512a';
        ctx.fillRect(tx, ty, 64, 64);
      }
    }
  }
  drawHud(ctx, state);
  drawOrderBoard(ctx, state);
  drawBins(ctx, state);
  const { plates } = LAYOUT;
  state.plates.forEach((plate, i) => {
    drawPlate(ctx, plate, plates.x + i * (plates.w + plates.gap), plates.y, state.selectedPlate === i, state);
  });
  drawStations(ctx, state);
  drawMessageBar(ctx, state);
  drawButtons(ctx, state);
}

function drawTitleScreen(ctx, state) {
  ctx.fillStyle = '#2a1a0e';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = GOLD;
  ctx.beginPath(); ctx.arc(640, 150, 70, 0, Math.PI * 2); ctx.fill();
  drawFoodIcon(ctx, 'nasi', 640, 150, 44);
  text(ctx, 'WARUNG RUSH', 640, 270, 72, GOLD, '900', 'center');
  text(ctx, 'Masak cepat, sajikan cepat — jangan sampai pelanggan kabur!', 640, 330, 22, CREAM, '900', 'center');
  const lines = [
    '1. Klik bahan di counter untuk meracik pesanan di piring.',
    '2. Masakan berwok / panggangan harus dimasak — angkat sebelum hangus.',
    '3. Klik pesanan pelanggan untuk menyajikan. Tip besar kalau cepat!',
    '4. Tiga pelanggan kabur = warung tutup. Shift 3 menit.',
  ];
  lines.forEach((line, i) => text(ctx, line, 640, 400 + i * 34, 18, CREAM, '900', 'center'));
  ctx.fillStyle = '#c0392b';
  roundRect(ctx, 490, 560, 300, 64, 14); ctx.fill();
  const pulse = 0.7 + 0.3 * Math.sin(state.elapsed * 4);
  ctx.globalAlpha = pulse;
  text(ctx, '▶  MULAI MASAK', 640, 593, 26, '#fff', '900', 'center');
  ctx.globalAlpha = 1;
  text(ctx, 'Tombol 1-9: bahan  •  Spasi: jeda  •  R: ulangi', 640, 680, 15, '#c9b183', '900', 'center');
  text(ctx, 'Menu: Nasi Goreng • Mie Ayam • Nasi Ayam • Sate Ayam • Es Teh', 640, 712, 15, '#c9b183', '900', 'center');
}

function drawGameOverScreen(ctx, state) {
  drawKitchen(ctx, state);
  ctx.fillStyle = 'rgba(20,10,2,0.78)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#fffdf5';
  roundRect(ctx, 340, 180, 600, 400, 18); ctx.fill();
  text(ctx, 'TUTUP WARUNG', 640, 240, 44, RED, '900', 'center');
  text(ctx, state.overReason, 640, 292, 18, INK, '900', 'center');
  text(ctx, 'Koin hari ini: ' + formatRupiah(state.coins), 640, 350, 26, INK, '900', 'center');
  text(ctx, 'Pesanan disajikan: ' + state.served + '   •   Kombo terbaik: x' + state.bestCombo, 640, 396, 19, INK, '900', 'center');
  text(ctx, 'Level tercapai: ' + state.level, 640, 430, 19, INK, '900', 'center');
  ctx.fillStyle = GREEN;
  roundRect(ctx, 490, 470, 300, 56, 12); ctx.fill();
  text(ctx, '↻  MAIN LAGI', 640, 499, 24, '#fff', '900', 'center');
  text(ctx, 'Klik di mana saja untuk membuka warung lagi.', 640, 550, 15, '#7a6a55', '900', 'center');
}

export function drawGame(ctx, state) {
  if (state.screen === 'title') drawTitleScreen(ctx, state);
  else if (state.screen === 'over') drawGameOverScreen(ctx, state);
  else drawKitchen(ctx, state);
}
