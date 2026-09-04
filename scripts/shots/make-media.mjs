/**
 * The footage the guide's editor screenshots are made from.
 *
 * Generated, never filmed. Every frame is a flat colour and a word, so no
 * capture of the timeline can contain a real person, place or brand — DNA §8
 * held to at the source rather than checked afterwards. They are also visually
 * distinct at filmstrip size, which is the whole job: a reader looking at a
 * screenshot of a timeline has to be able to tell clip 1 from clip 2.
 *
 * `drawtext` is not in every ffmpeg build (it needs libfreetype, and the one on
 * this machine is without it), so the frames are rendered from SVG by sharp —
 * already a devDependency here — and ffmpeg only turns them into clips.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'media');
mkdirSync(OUT, { recursive: true });

const W = 1080;
const H = 1920;

const CLIPS = [
  { name: 'shot-a', label: 'THE STREET', sub: 'wide, handheld', bg: '#16233f', ink: '#cfd8ef', sec: 6, hz: 220 },
  { name: 'shot-b', label: 'THE DOOR', sub: 'mid, static', bg: '#3a2a1b', ink: '#f0e0cb', sec: 5, hz: 300 },
  { name: 'shot-c', label: 'THE ROOM', sub: 'close, drifting', bg: '#14331f', ink: '#cfeeda', sec: 7, hz: 180 },
];

const STILL = { name: 'still', label: 'A STILL', sub: 'photograph', bg: '#2a1b33', ink: '#e8d5f0' };

const frame = ({ label, sub, bg, ink }) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <g fill="none" stroke="${ink}" stroke-opacity="0.16" stroke-width="3">
    <circle cx="${W / 2}" cy="${H / 2}" r="300"/>
    <path d="M0 ${H * 0.33}H${W}M0 ${H * 0.66}H${W}M${W / 3} 0V${H}M${(W / 3) * 2} 0V${H}"/>
  </g>
  <text x="${W / 2}" y="${H / 2}" text-anchor="middle" fill="${ink}"
        font-family="Helvetica, Arial, sans-serif" font-size="118" font-weight="600"
        letter-spacing="6">${label}</text>
  <text x="${W / 2}" y="${H / 2 + 110}" text-anchor="middle" fill="${ink}" fill-opacity="0.6"
        font-family="Helvetica, Arial, sans-serif" font-size="52">${sub}</text>
</svg>`;

const ff = (args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });

for (const clip of CLIPS) {
  const png = join(OUT, `${clip.name}.png`);
  await sharp(Buffer.from(frame(clip))).png().toFile(png);

  /* A slow push-in, so the filmstrip is not four identical thumbnails and the
     preview visibly moves when a reader presses play in a screen recording. */
  ff([
    '-loop', '1', '-t', String(clip.sec), '-i', png,
    '-f', 'lavfi', '-t', String(clip.sec), '-i', `sine=frequency=${clip.hz}`,
    '-vf', `scale=${W * 1.15}:-1,zoompan=z='min(zoom+0.0006,1.12)':d=${clip.sec * 30}:s=${W}x${H}:fps=30,format=yuv420p`,
    '-c:v', 'libx264', '-preset', 'veryfast', '-c:a', 'aac', '-shortest',
    join(OUT, `${clip.name}.mp4`),
  ]);
  console.log(`made ${clip.name}.mp4 (${clip.sec}s)`);
}

await sharp(Buffer.from(frame(STILL))).jpeg({ quality: 88 }).toFile(join(OUT, 'still.jpg'));
console.log('made still.jpg');

if (!existsSync(join(OUT, 'shot-a.mp4'))) process.exitCode = 1;
