// Warung Rush — main.ts
// Hands the game in (Node 22, standard library only). Copies game/ and
// screenshots/ from beside this file into the output directory, checks the
// screenshots fit the scorer's caps, then writes /output/dossier.json with
// the vendored make.fun library so the gate can check the files and the
// judge can read the dossier. The grader runs this program twice and both
// runs must write the same bytes, so nothing here depends on time or chance.

import { cp, mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

async function handIn() {
  await mkdir(outDir, { recursive: true });
  await cp(join(repoRoot, 'game'), join(outDir, 'game'), { recursive: true });
  const shotsDir = join(repoRoot, 'screenshots');
  const outShots = join(outDir, 'screenshots');
  await mkdir(outShots, { recursive: true });
  if (existsSync(shotsDir)) {
    await cp(shotsDir, outShots, { recursive: true });
  }
  const shots = (await readdir(outShots)).filter((name) => !name.startsWith('.'));
  if (shots.length < 3 || shots.length > 4) {
    throw new Error('Warung Rush needs 3 or 4 screenshots, found ' + shots.length);
  }
  for (const shot of shots) {
    const info = await stat(join(outShots, shot));
    if (info.size > 262144) throw new Error('screenshot over 256 KiB: ' + shot);
  }

  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });
  await writeFile(join(outDir, 'dossier.json'), dossier);
  console.log('Warung Rush handed in: ' + shots.length + ' screenshots, dossier ' + dossier.length + ' bytes -> ' + outDir);
}

await handIn();
