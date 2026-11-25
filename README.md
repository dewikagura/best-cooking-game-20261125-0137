# Warung Rush — Game Masak Warung

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![make.fun · best-cooking-game-20261125-0137 rank](https://make.fun/badge/best-cooking-game-20261125-0137/dewikagura/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard)
[![make.fun · best-cooking-game-20261125-0137 reward](https://make.fun/badge/best-cooking-game-20261125-0137/dewikagura/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

**Warung Rush** is an original Indonesian warung cooking game. You run a small
street-food stall for one 3-minute shift: customers arrive with tickets, you
assemble their dish from 9 ingredients on the counter, cook it on the wok or
the grill, and serve it before their patience runs out.

## How to play

- **Orders arrive on the board** at the top — each ticket shows the dish, its
  price and a patience bar. A customer whose patience empties walks out, and
  3 walk-outs close the warung.
- **Build the dish on a plate**: click ingredients on the counter (or press
  keys 1–9). Three plates are open at once — pick one with Q / W / E.
- **Cook it**: dishes that need the wok or grill show a MASAK button. Food
  left ready too long burns — serve it fast or throw it away.
- **Serve**: click the matching ticket. Fast service pays a tip, and serving
  in a row builds a combo (x2 at 3 in a row, x3 at 6) that multiplies every
  price.
- **Levels rise every 4 served orders**: customers arrive faster and lose
  patience sooner, so the rush keeps growing.

## The menu

| Dish | Ingredients | Cook | Price |
| --- | --- | --- | --- |
| Nasi Goreng 🍳 | Nasi + Telur + Kecap | Wok 4s | Rp 12.000 |
| Mie Ayam 🍜 | Mie + Ayam + Sayur | Wok 5s | Rp 11.000 |
| Nasi Ayam 🍛 | Nasi + Ayam + Sayur | Wok 4s | Rp 13.000 |
| Sate Ayam 🍢 | Sate + Kecap | Grill 6s | Rp 15.000 |
| Es Teh 🧋 | Teh + Es | — | Rp 5.000 |

## Controls

- **Mouse**: click an ingredient to add it to the selected plate, click
  MASAK to cook, click a ticket to serve the matching ready plate.
- **Keys 1–9**: add an ingredient. **Q / W / E**: pick plate 1 / 2 / 3.
  **T**: throw the selected plate away. **Space**: start. **R**: restart.

## Run it locally

```sh
cd game
python3 -m http.server 8080
# open http://localhost:8080
```

## Files

- `main.ts` — the hand-in program (Node 22, stdlib only): copies `game/`
  and `screenshots/` to the output dir and writes `dossier.json`.
- `game/index.html` + `game/src/` — the game itself, plain static files:
  `config.js` (dishes, ingredients, levels), `state.js` (shift rules),
  `render.js` (all drawing), `input.js` (mouse + keyboard), `audio.js`
  (synth sounds), `main.js` (boot + frame loop + screenshot states).
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
- `screenshots/` — 4 real renders of the game's own code (cover, orders,
  assembly, serve), taken at 1280×800 with Playwright Chromium.

Made for the make.fun best cooking game bounty by @dewi-123 (ref 6t1r9fj9).
