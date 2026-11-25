// Warung Rush — state.js
// One job: the shift itself. Holds the whole game state and every rule that
// changes it: orders arriving, plates being built, cooking, burning, serving,
// combos, levels and the walk-outs that end the shift. No drawing here.

import {
  DISHES, MAX_ORDERS, MAX_WALKOUTS, SHIFT_SECONDS, BURN_AFTER_SECONDS,
  arrivalInterval, comboMultiplier, dishById, levelFor, patienceFor,
} from './config.js';

export function createState() {
  return {
    screen: 'title',
    timeLeft: SHIFT_SECONDS,
    coins: 0,
    tips: 0,
    served: 0,
    walkouts: 0,
    combo: 0,
    bestCombo: 0,
    level: 1,
    customers: [],
    plates: [
      { items: [], dish: null, cooking: null, ready: false, burnt: false, burnLeft: 0 },
      { items: [], dish: null, cooking: null, ready: false, burnt: false, burnLeft: 0 },
      { items: [], dish: null, cooking: null, ready: false, burnt: false, burnLeft: 0 },
    ],
    selectedPlate: 0,
    spawnIn: 1.5,
    nextCustomerId: 1,
    over: false,
    overReason: '',
    flashTicket: -1,
    flashTime: 0,
    banner: '',
    bannerTime: 0,
  };
}

export function recipeMatches(items, recipe) {
  if (items.length !== recipe.length) return false;
  const sortedItems = [...items].sort();
  const sortedRecipe = [...recipe].sort();
  return sortedItems.every((item, i) => item === sortedRecipe[i]);
}

export function spawnCustomer(state, dishId) {
  const dish = dishById(dishId ?? DISHES[Math.floor(Math.random() * DISHES.length)].id);
  const faces = ['😋', '😊', '🤤', '😃', '🧑‍🍳', '👵', '👨', '👩'];
  state.customers.push({
    id: state.nextCustomerId++,
    dishId: dish.id,
    face: faces[Math.floor(Math.random() * faces.length)],
    patience: patienceFor(state.level),
    patienceMax: patienceFor(state.level),
  });
}

// Drop one ingredient onto the selected plate. Returns 'added', 'done'
// (recipe complete), 'full' or 'busy'.
export function addIngredient(state, ingredientId) {
  const plate = state.plates[state.selectedPlate];
  if (plate.cooking || plate.ready || plate.burnt) return 'busy';
  if (plate.items.length >= 3) return 'full';
  plate.items.push(ingredientId);
  const dish = DISHES.find((d) => recipeMatches(plate.items, d.recipe));
  if (dish) {
    plate.dish = dish;
    if (dish.cookSeconds === 0) plate.ready = true;
    return 'done';
  }
  return 'added';
}

// Send a finished plate to its station. Returns true when cooking starts.
export function startCooking(state, plateIndex) {
  const plate = state.plates[plateIndex];
  if (!plate.dish || plate.cooking || plate.ready || plate.burnt) return false;
  if (plate.dish.cookSeconds <= 0) return false;
  plate.cooking = { station: plate.dish.station, elapsed: 0, need: plate.dish.cookSeconds };
  return true;
}

export function clearPlate(state, plateIndex) {
  state.plates[plateIndex] = {
    items: [], dish: null, cooking: null, ready: false, burnt: false, burnLeft: 0,
  };
}

// Serve the ready plate whose dish matches the ticket. Returns the payment
// { price, tip, total } or null when nothing matches.
export function serveCustomer(state, customerIndex) {
  const customer = state.customers[customerIndex];
  if (!customer) return null;
  const plateIndex = state.plates.findIndex(
    (plate) => plate.ready && plate.dish && plate.dish.id === customer.dishId,
  );
  if (plateIndex < 0) {
    state.flashTicket = customer.id;
    state.flashTime = 0.6;
    return null;
  }
  const plate = state.plates[plateIndex];
  const mult = comboMultiplier(state.combo);
  const patienceFraction = Math.max(0, customer.patience / customer.patienceMax);
  const price = plate.dish.price * mult;
  const tip = Math.round(plate.dish.price * patienceFraction * 0.5);
  state.coins += price + tip;
  state.tips += tip;
  state.served += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  clearPlate(state, plateIndex);
  state.customers.splice(customerIndex, 1);
  const newLevel = levelFor(state.served);
  if (newLevel > state.level) {
    state.level = newLevel;
    state.banner = 'LEVEL ' + newLevel + ' — PESANAN MAKIN CEPAT!';
    state.bannerTime = 2.2;
  }
  return { price, tip, total: price + tip };
}

// Advance the shift by dt seconds: timer, arrivals, patience, cooking,
// burning and walk-outs.
export function update(state, dt) {
  if (state.screen !== 'playing' || state.over) return;
  state.timeLeft -= dt;
  if (state.flashTime > 0) state.flashTime -= dt;
  if (state.bannerTime > 0) state.bannerTime -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    endShift(state, 'Waktu habis!');
    return;
  }
  state.spawnIn -= dt;
  if (state.spawnIn <= 0 && state.customers.length < MAX_ORDERS) {
    spawnCustomer(state);
    state.spawnIn = arrivalInterval(state.level) * (0.8 + Math.random() * 0.4);
  }
  for (let i = state.customers.length - 1; i >= 0; i--) {
    const customer = state.customers[i];
    customer.patience -= dt;
    if (customer.patience <= 0) {
      state.customers.splice(i, 1);
      state.walkouts += 1;
      state.combo = 0;
      state.banner = 'PELANGGAN PERGI! (' + state.walkouts + '/' + MAX_WALKOUTS + ')';
      state.bannerTime = 1.8;
      if (state.walkouts >= MAX_WALKOUTS) {
        endShift(state, '3 pelanggan pergi!');
        return;
      }
    }
  }
  for (const plate of state.plates) {
    if (plate.cooking) {
      plate.cooking.elapsed += dt;
      if (plate.cooking.elapsed >= plate.cooking.need) {
        plate.cooking = null;
        plate.ready = true;
        plate.burnLeft = BURN_AFTER_SECONDS;
      }
    } else if (plate.ready && plate.dish && plate.dish.cookSeconds > 0) {
      plate.burnLeft -= dt;
      if (plate.burnLeft <= 0) {
        plate.ready = false;
        plate.burnt = true;
        plate.dish = null;
        plate.items = [];
      }
    }
  }
}

export function endShift(state, reason) {
  state.over = true;
  state.overReason = reason;
  state.screen = 'over';
}

export function startShift(state) {
  const fresh = createState();
  Object.assign(state, fresh, { screen: 'playing' });
  spawnCustomer(state);
  spawnCustomer(state);
  state.spawnIn = arrivalInterval(1);
}
