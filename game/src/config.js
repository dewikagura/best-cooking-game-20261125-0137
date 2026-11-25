// Warung Rush — config.js
// One job: every tunable number, dish, ingredient and colour of the game.
// Nothing here runs the game; state.js reads these tables to build the shift.

export const CANVAS_W = 1280;
export const CANVAS_H = 800;
export const SHIFT_SECONDS = 180;
export const MAX_WALKOUTS = 3;
export const PLATE_COUNT = 3;
export const MAX_ORDERS = 4;

// Ingredient bins: a 3x3 grid on the left counter. Centres match the
// clickable bins drawn by render.js (bin size 92, gap 10).
export const BIN_SIZE = 92;
export const BIN_CENTERS = [
  [62, 282], [164, 282], [266, 282],
  [62, 384], [164, 384], [266, 384],
  [62, 486], [164, 486], [266, 486],
];

export const INGREDIENTS = [
  { id: 'nasi',  name: 'Nasi',  emoji: '🍚', key: '1', color: '#fff3d6' },
  { id: 'telur', name: 'Telur', emoji: '🥚', key: '2', color: '#ffe9b8' },
  { id: 'ayam',  name: 'Ayam',  emoji: '🍗', key: '3', color: '#ffb37a' },
  { id: 'mie',   name: 'Mie',   emoji: '🍜', key: '4', color: '#ffd94d' },
  { id: 'sayur', name: 'Sayur', emoji: '🥬', key: '5', color: '#8fd694' },
  { id: 'sate',  name: 'Sate',  emoji: '🍢', key: '6', color: '#e07840' },
  { id: 'kecap', name: 'Kecap', emoji: '🍶', key: '7', color: '#7a4a21' },
  { id: 'teh',   name: 'Teh',   emoji: '🍵', key: '8', color: '#c98f4e' },
  { id: 'es',    name: 'Es',    emoji: '🧊', key: '9', color: '#aee6f5' },
];

export function ingredientById(id) {
  return INGREDIENTS.find((ing) => ing.id === id);
}

// Dishes: name, price in rupiah, recipe in ingredient ids, cooking time in
// seconds on its station (0 = no cooking, serve as soon as it is assembled).
export const DISHES = [
  { id: 'nasi-goreng', name: 'Nasi Goreng', emoji: '🍳', price: 12000,
    recipe: ['nasi', 'telur', 'kecap'], cookSeconds: 4, station: 'wok',
    plate: '#e07840', food: '#f5a623' },
  { id: 'mie-ayam', name: 'Mie Ayam', emoji: '🍜', price: 11000,
    recipe: ['mie', 'ayam', 'sayur'], cookSeconds: 5, station: 'wok',
    plate: '#f5c542', food: '#ffd94d' },
  { id: 'nasi-ayam', name: 'Nasi Ayam', emoji: '🍛', price: 13000,
    recipe: ['nasi', 'ayam', 'sayur'], cookSeconds: 4, station: 'wok',
    plate: '#fff3d6', food: '#e8b04b' },
  { id: 'sate-ayam', name: 'Sate Ayam', emoji: '🍢', price: 15000,
    recipe: ['sate', 'kecap'], cookSeconds: 6, station: 'grill',
    plate: '#d95d28', food: '#c96a2e' },
  { id: 'es-teh', name: 'Es Teh', emoji: '🧋', price: 5000,
    recipe: ['teh', 'es'], cookSeconds: 0, station: 'none',
    plate: '#c98f4e', food: '#aee6f5' },
];

export function dishById(id) {
  return DISHES.find((dish) => dish.id === id);
}

// Pressure curve: every 4 served orders raises the level. Higher levels
// bring customers faster and give them less patience — the rush grows
// without adding new chores.
export const ORDERS_PER_LEVEL = 4;
export function levelFor(served) {
  return Math.floor(served / ORDERS_PER_LEVEL) + 1;
}
export function arrivalInterval(level) {
  return Math.max(6, 14 - (level - 1) * 1.5);
}
export function patienceFor(level) {
  return Math.max(28, 45 - (level - 1) * 3);
}

// Combo: serving in a row without a walk-out multiplies the price.
// 3 in a row doubles it, 6 in a row triples it.
export function comboMultiplier(combo) {
  if (combo >= 6) return 3;
  if (combo >= 3) return 2;
  return 1;
}

// A dish left ready too long burns: 10 seconds after it finishes cooking.
export const BURN_AFTER_SECONDS = 10;

// Warung palette: warm wood, terracotta walls, cream counters.
export const COLORS = {
  wall: '#f7e8c9',
  wallStripe: '#f2d8a7',
  floor: '#c98d5f',
  counter: '#8a5a33',
  counterTop: '#e8b04b',
  board: '#fff8e7',
  boardEdge: '#b5772e',
  ink: '#3a2415',
  muted: '#7a5a3a',
  good: '#2e9e4f',
  warn: '#e07840',
  bad: '#d92b2b',
  gold: '#f5c542',
};
