// Warung Rush — tuning, recipes and layout for the kitchen game.
// Every number that shapes difficulty or the look of the kitchen lives here,
// so the rest of the game reads plain constants instead of magic numbers.

export const CANVAS_W = 1280;
export const CANVAS_H = 800;

// The nine ingredient bins on the counter. `key` is the keyboard shortcut.
export const INGREDIENTS = [
  { id: 'nasi', name: 'Nasi', color: '#f5efe0', key: '1' },
  { id: 'telur', name: 'Telur', color: '#ffd94d', key: '2' },
  { id: 'ayam', name: 'Ayam', color: '#e8a04c', key: '3' },
  { id: 'mie', name: 'Mie', color: '#f2c14e', key: '4' },
  { id: 'sayur', name: 'Sayur', color: '#7bc96f', key: '5' },
  { id: 'sate', name: 'Sate', color: '#b5651d', key: '6' },
  { id: 'kecap', name: 'Kecap', color: '#6b4226', key: '7' },
  { id: 'teh', name: 'Teh', color: '#c97b2d', key: '8' },
  { id: 'es', name: 'Es', color: '#aee6f5', key: '9' },
];

// The menu. `needs` is the exact multiset of ingredients on the plate;
// `cook` is seconds on the wok or grill (0 means served straight away).
export const RECIPES = [
  { id: 'nasi-goreng', name: 'Nasi Goreng', needs: ['nasi', 'telur', 'kecap'], cook: 4, price: 120, station: 'wok' },
  { id: 'mie-ayam', name: 'Mie Ayam', needs: ['mie', 'ayam', 'sayur'], cook: 5, price: 140, station: 'wok' },
  { id: 'nasi-ayam', name: 'Nasi Ayam', needs: ['nasi', 'ayam', 'sayur'], cook: 4, price: 130, station: 'wok' },
  { id: 'sate-ayam', name: 'Sate Ayam', needs: ['sate', 'kecap'], cook: 6, price: 160, station: 'grill' },
  { id: 'es-teh', name: 'Es Teh', needs: ['teh', 'es'], cook: 0, price: 60, station: null },
];

export const CUSTOMERS = ['Budi', 'Sari', 'Agus', 'Dewi', 'Rina', 'Joko', 'Maya', 'Putri'];

export const SHIFT_SECONDS = 180;
export const MAX_STRIKES = 3;
export const BURN_SECONDS = 6;
export const TIP_MAX = 40;
export const PLATE_COUNT = 3;
// Keyboard shortcuts to pick a plate: Q/W/E, so 1-9 stay free for ingredients.
export const PLATE_KEYS = ['q', 'w', 'e'];
export const MAX_TICKETS = 4;

export function levelFor(served) {
  return 1 + Math.floor(served / 4);
}

export function patienceFor(level) {
  return Math.max(26, 48 - level * 2);
}

export function spawnIntervalFor(level) {
  return Math.max(7, 15 - level);
}

export function ingredientById(id) {
  return INGREDIENTS.find((ing) => ing.id === id);
}

export function recipeById(id) {
  return RECIPES.find((recipe) => recipe.id === id);
}

// A plate matches a recipe when its ingredients are exactly the recipe's,
// in any order. Returns the recipe or null.
export function matchRecipe(items) {
  const wanted = [...items].sort().join(',');
  return RECIPES.find((recipe) => [...recipe.needs].sort().join(',') === wanted) || null;
}

// Fixed geometry of the 1280x800 kitchen, shared by the renderer and input.
export const LAYOUT = {
  hud: { x: 0, y: 0, w: 1280, h: 56 },
  board: { x: 16, y: 64, w: 1248, h: 128 },
  ticket: { w: 300, h: 120, gap: 12 },
  bins: { x: 16, y: 236, w: 92, h: 92, cols: 3, gap: 10, labelY: 214 },
  plates: { x: 330, y: 240, w: 172, h: 200, gap: 14 },
  wok: { cx: 1000, cy: 330, r: 82 },
  grill: { x: 1108, y: 262, w: 148, h: 136 },
  message: { x: 16, y: 652, w: 1248, h: 44 },
  buttons: { x: 16, y: 706, h: 44, gap: 10 },
};
