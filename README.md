# Warung Rush — Masak Cepat, Sajikan Cepat

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/dewikagura/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/dewikagura/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

A complete, original cooking game for the make.fun "best cooking game" bounty.
You run a small Indonesian warung kitchen: customers arrive with orders, you
click ingredients on the counter to assemble dishes on plates, cook them on
the wok or the grill, and serve before patience runs out — and before the
food burns. Orders get faster, tips get bigger, and three walk-outs close
the warung. One 3-minute shift, endless rush.

## How to play

- **Click an ingredient** on the counter (or press keys 1–9) to add it to the
  selected plate. Click a plate to select it.
- **Match a recipe** exactly: Nasi Goreng (Nasi + Telur + Kecap),
  Mie Ayam (Mie + Ayam + Sayur), Nasi Ayam (Nasi + Ayam + Sayur),
  Sate Ayam (Sate + Kecap, grill), Es Teh (Teh + Es, no cooking).
- **Click MASAK** on a finished plate to cook it on the wok or grill.
  A cooked dish stays ready for a few seconds — serve it before it burns.
- **Click a customer's ticket** to serve the matching ready plate. Fast
  service pays a bigger tip and builds your combo.
- **Space** starts the game, **R** restarts the shift, **Trash** clears a plate.

## Menu

| Hidangan | Bahan | Masak | Harga |
| --- | --- | --- | --- |
| Nasi Goreng | Nasi + Telur + Kecap | Wok 4 dtk | Rp120 |
| Mie Ayam | Mie + Ayam + Sayur | Wok 5 dtk | Rp140 |
| Nasi Ayam | Nasi + Ayam + Sayur | Wok 4 dtk | Rp130 |
| Sate Ayam | Sate + Kecap | Panggangan 6 dtk | Rp160 |
| Es Teh | Teh + Es | — | Rp60 |

## Run it locally

Serve the `game/` folder with any static server and open it in a desktop
browser — no build step, no network:

```sh
cd game && python3 -m http.server 8080
# open http://localhost:8080
```

Screenshot states (deterministic, for the entry's own screenshots):

```sh
http://localhost:8080/?shot=cover      # busy kitchen mid-service
http://localhost:8080/?shot=orders     # order board full of tickets
http://localhost:8080/?shot=assembly   # a dish mid-assembly
http://localhost:8080/?shot=serve      # a plate ready to serve
```

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` to the output directory and
writes `dossier.json` with the vendored make.fun library
(`vendor/makefun-game.ts`).

## Sources

- Art, names and recipes are original, drawn in code with the canvas API.
- Sounds are synthesised with WebAudio — no audio files are shipped.

Made with make.fun — ref 6t1r9fj9.
