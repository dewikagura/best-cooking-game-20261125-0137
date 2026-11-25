// Warung Rush — the hand-in program for the best cooking game bounty.
//
// It runs on Node 22 with the standard library only. It takes the game
// (game/) and the screenshots (screenshots/) that sit beside this file,
// copies both into the output directory, and writes dossier.json there —
// the summary the judge reads — using the vendored make.fun library.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps, from the bounty's gate: only text_max_bytes shapes
// the dossier's bytes; the rest make this program fail exactly where the
// scorer would refuse the entry, so a bad hand-in never slips through here.
const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function copyEntryFiles() {
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
  const shotsDir = join(repoRoot, 'screenshots');
  const outShotsDir = join(outputDir, 'screenshots');
  mkdirSync(outShotsDir, { recursive: true });
  if (existsSync(shotsDir)) {
    cpSync(shotsDir, outShotsDir, { recursive: true });
  }
}

function writeDossier() {
  const dossier = buildDossier(outputDir, dossierCaps);
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

copyEntryFiles();
writeDossier();
console.log('Warung Rush handed in: game/ + screenshots/ + dossier.json -> ' + outputDir);
