// Warung Rush — render.js
// One job: draw the whole warung on the canvas — the kitchen, the order
// board, the ingredient counter, the plates, the stations and the HUD.
// Reads state, never changes it. Big clear labels so the game reads at
// a glance, even shrunk to a contact-sheet cell.

import { BIN_CENTERS, BIN_SIZE, COLORS, INGREDIENTS, comboMultiplier, dishById } from './config.js';
import { masakRect, plateRect, ticketRect } from './input.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align, weight) {
  ctx.fillStyle = color || COLORS.ink;
  ctx.font = (weight || 'bold') + ' ' + size + 'px sans-serif';
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function money(n) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

function clock(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m + ':' + String(s).padStart(2, '0');
}

export function draw(ctx, state, now) {
  ctx.clearRect(0, 0, 1280, 800);
  if (state.screen === 'title') { drawTitle(ctx, state); return; }
  if (state.screen === 'over') { drawKitchen(ctx, state, now); drawOver(ctx, state); return; }
  drawKitchen(ctx, state, now);
  drawHud(ctx, state);
  drawBoard(ctx, state, now);
  drawBins(ctx, state);
  drawPlates(ctx, state, now);
  drawStations(ctx, state, now);
  drawBottom(ctx, state);
  if (state.bannerTime > 0) {
    ctx.fillStyle = 'rgba(58,36,21,0.88)';
    rr(ctx, 390, 196, 500, 44, 22);
    ctx.fill();
    text(ctx, state.banner, 640, 219, 22, '#ffe9b8', 'center');
  }
}

function drawKitchen(ctx, state, now) {
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, 1280, 800);
  ctx.fillStyle = COLORS.wallStripe;
  for (let y = 60; y < 800; y += 120) ctx.fillRect(0, y, 1280, 14);
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 640, 1280, 160);
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  for (let x = 0; x < 1280; x += 160) ctx.fillRect(x, 640, 4, 160);
  // Back counter shelf with jars and chilli.
  ctx.fillStyle = COLORS.counter;
  ctx.fillRect(0, 560, 1280, 80);
  ctx.fillStyle = COLORS.counterTop;
  ctx.fillRect(0, 560, 1280, 14);
  text(ctx, '🍶  🫙  🌶️  🧄  🥜  🍋', 1120, 610, 34, '#fff', 'center');
}

function drawHud(ctx, state) {
  ctx.fillStyle = '#4a2c14';
  ctx.fillRect(0, 0, 1280, 56);
  ctx.fillStyle = COLORS.gold;
  ctx.fillRect(0, 56, 1280, 4);
  text(ctx, '💰 ' + money(state.coins), 24, 30, 24, '#ffe9b8');
  text(ctx, '💵 tips ' + money(state.tips), 250, 30, 18, '#ffd94d');
  const low = state.timeLeft <= 30;
  text(ctx, '⏱ ' + clock(state.timeLeft), 640, 30, 34, low ? '#ff6b5e' : '#ffffff', 'center');
  text(ctx, '⭐ LEVEL ' + state.level, 1010, 30, 22, '#ffe9b8', 'right');
  const mult = comboMultiplier(state.combo);
  const comboText = state.combo > 0
    ? '🔥 KOMBO x' + mult + ' (' + state.combo + ')'
    : '🔥 KOMBO —';
  text(ctx, comboText, 1260, 30, 22, mult >= 2 ? '#ff9d5c' : '#c9a06a', 'right');
}

function drawBoard(ctx, state, now) {
  text(ctx, '📋 PESANAN — klik tiket untuk mengantar', 46, 69, 15, COLORS.muted);
  if (state.customers.length === 0) {
    ctx.fillStyle = COLORS.board;
    rr(ctx, 46, 70, 240, 110, 12);
    ctx.fill();
    text(ctx, 'Menunggu pelanggan…', 166, 125, 17, COLORS.muted, 'center');
    return;
  }
  state.customers.forEach((customer, i) => {
    const rect = ticketRect(i);
    const dish = dishById(customer.dishId);
    const frac = Math.max(0, customer.patience / customer.patienceMax);
    const flashing = state.flashTicket === customer.id && state.flashTime > 0;
    ctx.fillStyle = COLORS.board;
    rr(ctx, rect.x, rect.y, rect.w, rect.h, 12);
    ctx.fill();
    ctx.lineWidth = flashing ? 5 : 3;
    ctx.strokeStyle = flashing ? COLORS.bad : COLORS.boardEdge;
    rr(ctx, rect.x, rect.y, rect.w, rect.h, 12);
    ctx.stroke();
    text(ctx, customer.face, rect.x + 34, rect.y + 34, 40, '#000', 'center');
    text(ctx, dish.emoji + ' ' + dish.name, rect.x + 66, rect.y + 30, 20, COLORS.ink);
    text(ctx, money(dish.price), rect.x + 66, rect.y + 58, 18, COLORS.muted);
    // Patience bar.
    ctx.fillStyle = '#e8dcc8';
    rr(ctx, rect.x + 14, rect.y + 82, rect.w - 28, 14, 7);
    ctx.fill();
    ctx.fillStyle = frac > 0.5 ? COLORS.good : frac > 0.25 ? COLORS.warn : COLORS.bad;
    rr(ctx, rect.x + 14, rect.y + 82, (rect.w - 28) * frac, 14, 7);
    ctx.fill();
    if (frac <= 0.25) {
      const pulse = 0.5 + 0.5 * Math.sin(now * 6);
      text(ctx, 'CEPAT!', rect.x + rect.w - 16, rect.y + 58, 16, 'rgba(217,43,43,' + pulse.toFixed(2) + ')', 'right');
    }
  });
}

function drawBins(ctx, state) {
  ctx.fillStyle = 'rgba(138,90,51,0.16)';
  rr(ctx, 16, 228, 316, 320, 14);
  ctx.fill();
  INGREDIENTS.forEach((ing, i) => {
    const [cx, cy] = BIN_CENTERS[i];
    const half = BIN_SIZE / 2;
    ctx.fillStyle = ing.color;
    rr(ctx, cx - half, cy - half, BIN_SIZE, BIN_SIZE, 12);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#b5772e';
    rr(ctx, cx - half, cy - half, BIN_SIZE, BIN_SIZE, 12);
    ctx.stroke();
    text(ctx, ing.emoji, cx, cy - 14, 40, '#000', 'center');
    text(ctx, ing.name, cx, cy + 26, 15, COLORS.ink, 'center');
    ctx.fillStyle = '#4a2c14';
    ctx.beginPath();
    ctx.arc(cx - half + 12, cy - half + 12, 12, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, ing.key, cx - half + 12, cy - half + 13, 14, '#fff', 'center');
  });
  text(ctx, 'BAHAN · klik / tekan 1–9', 174, 540, 16, COLORS.muted, 'center');
}

function drawDishIcon(ctx, dish, cx, cy, r) {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#d8c8a8';
  ctx.stroke();
  ctx.fillStyle = dish.food;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.72, r * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = dish.plate;
  ctx.beginPath();
  ctx.arc(cx - r * 0.3, cy - r * 0.18, r * 0.14, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.28, cy - r * 0.1, r * 0.12, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.05, cy + r * 0.2, r * 0.13, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, dish.emoji, cx, cy - r * 0.08, Math.round(r * 0.95), '#000', 'center');
}

function drawPlates(ctx, state, now) {
  text(ctx, '🍽 PIRING — Q / W / E pilih', 340, 258, 18, COLORS.muted);
  state.plates.forEach((plate, i) => {
    const rect = plateRect(i);
    const cx = rect.x + rect.w / 2;
    const selected = state.selectedPlate === i;
    ctx.fillStyle = COLORS.board;
    rr(ctx, rect.x, rect.y, rect.w, rect.h, 12);
    ctx.fill();
    ctx.lineWidth = selected ? 4 : 2;
    ctx.strokeStyle = selected ? COLORS.gold : COLORS.boardEdge;
    rr(ctx, rect.x, rect.y, rect.w, rect.h, 12);
    ctx.stroke();
    const keyLabel = ['Q', 'W', 'E'][i];
    text(ctx, keyLabel, rect.x + 16, rect.y + 18, 15, selected ? '#b5772e' : COLORS.muted, 'center');
    if (plate.burnt) {
      text(ctx, '🔥 GOSONG!', cx, rect.y + 20, 17, COLORS.bad, 'center');
      text(ctx, 'Buang (T)', cx, rect.y + 128, 14, COLORS.muted, 'center');
      return;
    }
    if (plate.dish) {
      text(ctx, plate.dish.name, cx, rect.y + 20, 16, COLORS.ink, 'center');
      drawDishIcon(ctx, plate.dish, cx, rect.y + 62, 40);
    } else if (plate.items.length > 0) {
      text(ctx, 'Meracik ' + plate.items.length + '/3', cx, rect.y + 20, 15, COLORS.muted, 'center');
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, rect.y + 62, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#d8c8a8';
      ctx.stroke();
      plate.items.forEach((itemId, k) => {
        const ing = INGREDIENTS.find((g) => g.id === itemId);
        const ix = cx + (k - (plate.items.length - 1) / 2) * 34;
        text(ctx, ing.emoji, ix, rect.y + 62, 30, '#000', 'center');
      });
    } else {
      text(ctx, 'Piring ' + (i + 1), cx, rect.y + 20, 16, COLORS.muted, 'center');
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#c9b48a';
      ctx.beginPath();
      ctx.arc(cx, rect.y + 62, 40, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, 'Klik bahan', cx, rect.y + 128, 14, COLORS.muted, 'center');
    }
    const btn = masakRect(i);
    if (plate.cooking) {
      const frac = Math.min(1, plate.cooking.elapsed / plate.cooking.need);
      ctx.fillStyle = '#e8dcc8';
      rr(ctx, btn.x, btn.y, btn.w, btn.h, 8);
      ctx.fill();
      ctx.fillStyle = plate.cooking.station === 'wok' ? COLORS.warn : '#c96a2e';
      rr(ctx, btn.x, btn.y, btn.w * frac, btn.h, 8);
      ctx.fill();
      text(ctx, (plate.cooking.station === 'wok' ? '🔥 WOK ' : '🍢 GRILL ') + Math.round(frac * 100) + '%', cx, btn.y + 15, 15, '#fff', 'center');
    } else if (plate.ready) {
      ctx.fillStyle = COLORS.good;
      rr(ctx, btn.x, btn.y, btn.w, btn.h, 8);
      ctx.fill();
      text(ctx, '✅ SIAP!', cx, btn.y + 15, 17, '#fff', 'center');
      if (plate.dish && plate.dish.cookSeconds > 0) {
        const urgent = plate.burnLeft <= 4;
        text(ctx, 'hangus ' + Math.ceil(plate.burnLeft) + 's', cx, rect.y + 138, 14, urgent ? COLORS.bad : COLORS.muted, 'center');
      }
    } else if (plate.dish && plate.dish.cookSeconds > 0) {
      ctx.fillStyle = COLORS.warn;
      rr(ctx, btn.x, btn.y, btn.w, btn.h, 8);
      ctx.fill();
      text(ctx, '🔥 MASAK', cx, btn.y + 15, 17, '#fff', 'center');
    }
  });
}

function drawStations(ctx, state, now) {
  text(ctx, '🔥 DAPUR — WOK & GRILL', 900, 258, 18, COLORS.muted);
  const stations = [
    { id: 'wok', name: 'WOK', emoji: '🍳', x: 900 },
    { id: 'grill', name: 'GRILL', emoji: '🍢', x: 1080 },
  ];
  for (const station of stations) {
    ctx.fillStyle = '#4a2c14';
    rr(ctx, station.x, 280, 170, 170, 14);
    ctx.fill();
    const flame = 0.6 + 0.4 * Math.sin(now * 5 + station.x);
    ctx.fillStyle = 'rgba(255,' + Math.round(140 + 60 * flame) + ',60,' + (0.5 + 0.3 * flame).toFixed(2) + ')';
    ctx.beginPath();
    ctx.moveTo(station.x + 55, 400);
    ctx.quadraticCurveTo(station.x + 85, 400 - 46 * flame, station.x + 115, 400);
    ctx.closePath();
    ctx.fill();
    text(ctx, station.emoji, station.x + 85, 330, 52, '#000', 'center');
    text(ctx, station.name, station.x + 85, 372, 20, '#ffe9b8', 'center');
    const cooking = state.plates.find((p) => p.cooking && p.cooking.station === station.id);
    if (cooking) {
      const frac = Math.min(1, cooking.cooking.elapsed / cooking.cooking.need);
      ctx.fillStyle = '#2b1a0e';
      rr(ctx, station.x + 16, 408, 138, 14, 7);
      ctx.fill();
      ctx.fillStyle = COLORS.gold;
      rr(ctx, station.x + 16, 408, 138 * frac, 14, 7);
      ctx.fill();
      text(ctx, cooking.dish.name + ' ' + Math.round(frac * 100) + '%', station.x + 85, 436, 14, '#ffe9b8', 'center');
    } else {
      text(ctx, '— siap —', station.x + 85, 420, 15, '#c9a06a', 'center');
    }
  }
  const urgent = state.plates.some((p) => p.ready && p.dish && p.dish.cookSeconds > 0 && p.burnLeft <= 4);
  if (urgent) {
    const pulse = 0.5 + 0.5 * Math.sin(now * 6);
    text(ctx, '⚠ HAMPIR GOSONG — antar cepat!', 1080, 478, 18, 'rgba(217,43,43,' + pulse.toFixed(2) + ')', 'center');
  }
}

function drawBottom(ctx, state) {
  ctx.fillStyle = '#b5462f';
  rr(ctx, 40, 708, 122, 40, 10);
  ctx.fill();
  text(ctx, '🗑 Buang', 101, 729, 16, '#fff', 'center');
  text(ctx, '1–9 bahan  •  Q/W/E piring  •  klik tiket = antar  •  R ulang', 640, 729, 16, '#f7e8c9', 'center');
  text(ctx, 'Disajikan: ' + state.served + '  •  Pergi: ' + state.walkouts + '/' + 3, 1240, 729, 16, '#f7e8c9', 'right');
}

function drawTitle(ctx, state) {
  drawKitchen(ctx, state, 0);
  ctx.fillStyle = 'rgba(43,26,14,0.35)';
  ctx.fillRect(0, 0, 1280, 800);
  ctx.fillStyle = COLORS.board;
  rr(ctx, 290, 90, 700, 560, 20);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = COLORS.boardEdge;
  rr(ctx, 290, 90, 700, 560, 20);
  ctx.stroke();
  text(ctx, '🍜  WARUNG RUSH  🍳', 640, 160, 52, COLORS.ink, 'center');
  text(ctx, 'Game masak warung — layani pelanggan sebelum mereka pergi!', 640, 212, 21, COLORS.muted, 'center');
  text(ctx, '🍳  🍜  🍛  🍢  🧋', 640, 268, 44, '#000', 'center');
  text(ctx, 'Racik 5 hidangan dari 9 bahan, masak di wok & grill,', 640, 330, 19, COLORS.ink, 'center');
  text(ctx, 'antar tepat waktu — kombo & level bikin makin ngebut!', 640, 360, 19, COLORS.ink, 'center');
  text(ctx, 'Shift 3 menit  •  3 pelanggan pergi = tutup warung', 640, 408, 18, COLORS.warn, 'center');
  ctx.fillStyle = COLORS.gold;
  rr(ctx, 540, 565, 200, 55, 14);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#b5772e';
  rr(ctx, 540, 565, 200, 55, 14);
  ctx.stroke();
  text(ctx, '▶  MULAI', 640, 594, 26, COLORS.ink, 'center');
  text(ctx, 'Klik bahan atau tekan 1–9  •  Q/W/E pilih piring  •  R ulang', 640, 640, 15, COLORS.muted, 'center');
}

function drawOver(ctx, state) {
  ctx.fillStyle = 'rgba(43,26,14,0.6)';
  ctx.fillRect(0, 0, 1280, 800);
  ctx.fillStyle = COLORS.board;
  rr(ctx, 390, 120, 500, 440, 20);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = COLORS.boardEdge;
  rr(ctx, 390, 120, 500, 440, 20);
  ctx.stroke();
  text(ctx, '⏰ SHIFT SELESAI!', 640, 180, 36, COLORS.ink, 'center');
  text(ctx, state.overReason, 640, 224, 20, COLORS.warn, 'center');
  const rows = [
    ['🍽 Disajikan', String(state.served)],
    ['💰 Koin', money(state.coins)],
    ['💵 Tips', money(state.tips)],
    ['🔥 Kombo terbaik', 'x' + comboMultiplier(state.bestCombo) + ' (' + state.bestCombo + ')'],
    ['⭐ Level tercapai', String(state.level)],
  ];
  rows.forEach((row, i) => {
    const y = 280 + i * 40;
    text(ctx, row[0], 440, y, 20, COLORS.ink);
    text(ctx, row[1], 840, y, 20, COLORS.ink, 'right');
  });
  ctx.fillStyle = COLORS.gold;
  rr(ctx, 540, 565, 200, 55, 14);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#b5772e';
  rr(ctx, 540, 565, 200, 55, 14);
  ctx.stroke();
  text(ctx, '▶  MAIN LAGI', 640, 594, 24, COLORS.ink, 'center');
}
