/*
 * Copies the shippable slice of mascot/dist into public/mascot.
 *
 * mascot/dist is the authoring output and weighs ~8MB, almost all of it the
 * animated fallback WebPs. The site needs far less:
 *
 *   - 01-writing        the one genuinely layered scene   → Lottie + its layers
 *   - every poster      static stills for the other 11    → ~230KB total
 *   - manifest.json     scene metadata, so nothing is hardcoded
 *
 * The other eleven Lottie files are deliberately NOT copied. They are a single
 * upscaled flat panel with a camera push; mascot/dist/index.html says outright
 * that they "exist to prove the pipeline, not to be shipped".
 */
import { cp, mkdir, readFile, readdir, rm, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, 'mascot', 'dist');
const dest = join(root, 'public', 'mascot');

const ANIMATED = '01-writing';
const ANIMATED_SLUG = 'writing';

async function main() {
  await rm(dest, { recursive: true, force: true });
  await mkdir(join(dest, 'lottie'), { recursive: true });
  await mkdir(join(dest, 'fallback'), { recursive: true });

  // The one animated scene: its JSON plus the layer images it references.
  await cp(join(src, 'lottie', `${ANIMATED}.json`), join(dest, 'lottie', `${ANIMATED}.json`));
  await cp(join(src, 'assets', ANIMATED_SLUG), join(dest, 'assets', ANIMATED_SLUG), {
    recursive: true,
  });

  // Static posters for every scene — this is what reduced-motion, off-screen
  // placements and the eleven placeholder scenes all render.
  let posters = 0;
  for (const file of await readdir(join(src, 'fallback'))) {
    if (!file.endsWith('-poster.webp')) continue;
    await cp(join(src, 'fallback', file), join(dest, 'fallback', file));
    posters++;
  }

  // The sharper 720x498 still, for placements that need more than 384px.
  await cp(
    join(src, 'review', `${ANIMATED}-poster.webp`),
    join(dest, 'fallback', `${ANIMATED}-poster@720.webp`)
  );

  await cp(join(src, 'manifest.json'), join(dest, 'manifest.json'));

  const manifest = JSON.parse(await readFile(join(dest, 'manifest.json'), 'utf8'));
  console.log(
    `mascot: ${manifest.length} scenes in manifest, 1 animated (${ANIMATED}), ${posters} posters, ${await sizeOf(dest)}`
  );
}

async function sizeOf(dir) {
  let bytes = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    bytes += entry.isDirectory() ? await rawSize(p) : (await stat(p)).size;
  }
  return `${(bytes / 1024).toFixed(0)} KB`;
}

async function rawSize(dir) {
  let bytes = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    bytes += entry.isDirectory() ? await rawSize(p) : (await stat(p)).size;
  }
  return bytes;
}

await main();
