// Warung Rush — the game state: orders, plates, score, timers and the shift.
// Pure logic: no drawing and no DOM here, so the rules can be tested on their own.

import {
  CUSTOMERS, SHIFT_SECONDS, MAX_STRIKES, PLATE_COUNT, MAX_TICKETS,
  BURN_SECONDS, TIP_MAX, levelFor, patienceFor, spawnIntervalFor,
  matchRecipe, recipeById,
} from './config.js';

// A small seeded random generator, so screenshot states are reproducible.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function emptyPlate(id) {
  return { id, items: [], dish: null, cooking: 0, cookTime: 0, ready: false, burnLeft: 0 };
}

export function newGame(seed) {
  const rng = makeRng(seed || 20261125);
  return {
    screen: 'title',
    seed: seed || 20261125,
    rng,
    timeLeft: SHIFT_SECONDS,
    elapsed: 0,
    served: 0,
    strikes: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    level: 1,
    spawnTimer: 4,
    nextTicketId: 1,
    customers: [],
    plates: [emptyPlate(0), emptyPlate(1), emptyPlate(2)],
    selectedPlate: 0,
    message: 'Klik MULAI untuk membuka warung!',
    messageTimer: 0,
    shakeTicketId: null,
    shakeTimer: 0,
    muted: false,
    overReason: '',
  };
}

function randomDish(rng) {
  const recipes = ['nasi-goreng', 'mie-ayam', 'nasi-ayam', 'sate-ayam', 'es-teh'];
  return recipes[Math.floor(rng() * recipes.length)];
}

export function spawnCustomer(state) {
  if (state.customers.length >= MAX_TICKETS) return;
  const level = state.level;
  const patience = patienceFor(level);
  const name = CUSTOMERS[Math.floor(state.rng() * CUSTOMERS.length)];
  state.customers.push({
    id: state.nextTicketId++,
    name,
    dishId: randomDish(state.rng),
    patience,
    maxPatience: patience,
    hue: Math.floor(state.rng() * 360),
    arrivedAt: state.elapsed,
  });
}

export function startShift(state) {
  state.screen = 'playing';
  state.message = 'Pesanan pertama datang! Klik bahan di counter.';
  state.messageTimer = 4;
  spawnCustomer(state);
  spawnCustomer(state);
}

// Add one ingredient to a plate. Returns 'added' | 'full' | 'done' | 'busy'.
export function addIngredient(state, plateIndex, ingredientId) {
  const plate = state.plates[plateIndex];
  if (!plate || plate.cooking > 0) return 'busy';
  if (plate.ready) return 'done';
  if (plate.items.length >= 3) return 'full';
  plate.items.push(ingredientId);
  plate.dish = matchRecipe(plate.items);
  if (plate.dish && plate.dish.cook === 0) plate.ready = true;
  return 'added';
}

// Move a finished plate onto its station. Returns true when cooking starts.
export function startCooking(state, plateIndex) {
  const plate = state.plates[plateIndex];
  if (!plate || !plate.dish || plate.dish.cook === 0) return false;
  if (plate.cooking > 0 || plate.ready) return false;
  plate.cooking = 0.001;
  plate.cookTime = plate.dish.cook;
  return true;
}

// Serve the ticket with a matching ready plate. Returns the earned coins or 0.
export function serveTicket(state, ticketId) {
  const ticket = state.customers.find((c) => c.id === ticketId);
  if (!ticket) return 0;
  const plateIndex = state.plates.findIndex(
    (p) => p.ready && p.dish && p.dish.id === ticket.dishId,
  );
  if (plateIndex < 0) {
    state.shakeTicketId = ticketId;
    state.shakeTimer = 0.4;
    state.message = 'Belum ada ' + recipeById(ticket.dishId).name + ' yang siap!';
    state.messageTimer = 2.5;
    return 0;
  }
  const plate = state.plates[plateIndex];
  const tip = Math.round(TIP_MAX * (ticket.patience / ticket.maxPatience));
  const earned = plate.dish.price + tip;
  state.coins += earned;
  state.served += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.level = levelFor(state.served);
  state.plates[plateIndex] = emptyPlate(plateIndex);
  state.customers = state.customers.filter((c) => c.id !== ticketId);
  state.message = 'Mantap! ' + ticket.name + ' bayar Rp' + earned + ' (tip Rp' + tip + ').';
  state.messageTimer = 3;
  return earned;
}

export function clearPlate(state, plateIndex) {
  const plate = state.plates[plateIndex];
  if (!plate) return;
  state.plates[plateIndex] = emptyPlate(plateIndex);
  state.message = 'Piring ' + (plateIndex + 1) + ' dibersihkan.';
  state.messageTimer = 2;
}

// Advance clocks, cooking, patience, spawns and the shift timer.
export function updateGame(state, dt) {
  if (state.screen !== 'playing') return;
  state.elapsed += dt;
  state.timeLeft = Math.max(0, state.timeLeft - dt);
  if (state.messageTimer > 0) state.messageTimer -= dt;
  if (state.shakeTimer > 0) state.shakeTimer -= dt;

  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    spawnCustomer(state);
    state.spawnTimer = spawnIntervalFor(state.level);
  }

  for (const plate of state.plates) {
    if (plate.cooking > 0 && !plate.ready) {
      plate.cooking += dt;
      if (plate.cooking >= plate.cookTime) {
        plate.cooking = 0;
        plate.ready = true;
        plate.burnLeft = BURN_SECONDS;
        state.message = plate.dish.name + ' matang! Sajikan sebelum hangus!';
        state.messageTimer = 3;
      }
    } else if (plate.ready && plate.dish && plate.dish.cook > 0) {
      plate.burnLeft -= dt;
      if (plate.burnLeft <= 0) {
        state.plates[plate.id] = emptyPlate(plate.id);
        state.combo = 0;
        state.message = plate.dish.name + ' hangus di piring! Buang dan masak lagi.';
        state.messageTimer = 3;
      }
    }
  }

  for (const customer of [...state.customers]) {
    customer.patience -= dt;
    if (customer.patience <= 0) {
      state.customers = state.customers.filter((c) => c.id !== customer.id);
      state.strikes += 1;
      state.combo = 0;
      state.message = customer.name + ' pergi karena kelamaan menunggu! (' + state.strikes + '/' + MAX_STRIKES + ')';
      state.messageTimer = 3;
    }
  }

  if (state.strikes >= MAX_STRIKES) {
    state.screen = 'over';
    state.overReason = 'Tiga pelanggan pergi kecewa.';
  } else if (state.timeLeft <= 0) {
    state.screen = 'over';
    state.overReason = 'Shift selesai! Warung tutup.';
  }
}
