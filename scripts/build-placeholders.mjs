/**
 * Generates the stand-in captures the show uses until `npm run shoot` produces
 * real ones.
 *
 * They are drawn with the app's own dark tokens so the density, framing and
 * rhythm are honest about what will replace them — a grey box would make the
 * scene timing look wrong. They carry no data of any kind, which is why the
 * gitignore lets `_placeholder-*` through while every real capture stays out
 * until the credential review.
 */
import { writeFileSync } from 'node:fs';

const W = 1280;
const H = 800;

const CSS = `
    .bg{fill:#0b0f18}.panel{fill:#0e131e}.well{fill:#090d15}.line{fill:#1c2436}
    .ink{fill:#eef1f9}.ink2{fill:#97a2bd}.ink3{fill:#55607d}
    .horn{fill:#c9a668}.acc{fill:#0f52ba}.acc2{fill:#5b8ff9}
`;

/** The app chrome every capture sits inside: sidebar, rail, header. */
function chrome(title) {
  const nav = [96, 128, 160, 200, 232, 264, 304, 336, 368]
    .map((y, i) => `<rect class="${i === 2 ? 'ink2' : 'ink3'}" x="24" y="${y}" width="${
      [78, 96, 66, 88, 72, 104, 84, 92, 70][i]
    }" height="8" rx="2" opacity="${i === 2 ? '.9' : '.45'}"/>`)
    .join('');

  return `
  <rect class="bg" width="${W}" height="${H}"/>
  <rect class="panel" width="236" height="${H}"/>
  <rect class="line" x="236" width="1" height="${H}"/>
  <path class="horn" d="M26 30c6-8 14-8 18 0 4-8 12-8 18 0-4 12-14 18-18 18s-14-6-18-18z" opacity=".9"/>
  <rect class="ink" x="72" y="32" width="62" height="10" rx="2" opacity=".9"/>
  ${nav}
  <rect class="ink" x="284" y="44" width="${title * 7}" height="14" rx="3" opacity=".92"/>
  <rect class="line" x="236" y="92" width="${W - 236}" height="1"/>`;
}

function card(x, y, w, h, extra = '') {
  return `<rect class="panel" x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/>
  <rect class="line" x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="none" stroke="#1c2436"/>${extra}`;
}

function lines(x, y, widths, cls = 'ink3', gap = 16, op = '.5') {
  return widths
    .map((w, i) => `<rect class="${cls}" x="${x}" y="${y + i * gap}" width="${w}" height="7" rx="2" opacity="${op}"/>`)
    .join('');
}

const scenes = {
  /* Ideas — a column of topic cards, each with a gold pillar mark. */
  ideas: () =>
    [0, 1, 2].
      map((i) => {
        const y = 128 + i * 168;
        return card(284, y, 660, 144,
          `<rect class="horn" x="284" y="${y}" width="3" height="144" rx="2"/>
           <rect class="ink" x="312" y="${y + 26}" width="${420 - i * 40}" height="12" rx="3" opacity=".92"/>
           ${lines(312, y + 56, [520, 470])}
           <rect class="acc" x="312" y="${y + 100}" width="86" height="26" rx="6" opacity=".85"/>
           <rect class="line" x="410" y="${y + 100}" width="76" height="26" rx="6"/>
           <rect class="line" x="498" y="${y + 100}" width="92" height="26" rx="6"/>`);
      })
      .join('') +
    card(976, 128, 280, 352, `${lines(1004, 160, [180, 140, 210, 120], 'ink3', 18)}`),

  /* D1 Studio — a review list of cuts, with a player above it. */
  d1: () =>
    card(284, 128, 660, 300, `<rect class="well" x="285" y="129" width="658" height="298" rx="10"/>
      <circle class="acc2" cx="614" cy="278" r="34" opacity=".9"/>
      <path class="bg" d="M604 262l26 16-26 16z"/>`) +
    [0, 1, 2, 3]
      .map((i) => {
        const y = 452 + i * 62;
        return card(284, y, 660, 50,
          `<rect class="alarm" x="308" y="${y + 20}" width="10" height="10" rx="5" fill="#e05a6a" opacity=".8"/>
           <rect class="ink2" x="332" y="${y + 20}" width="${180 - i * 18}" height="9" rx="2" opacity=".7"/>
           ${lines(560, y + 21, [260], 'ink3', 0, '.45')}`);
      })
      .join('') +
    card(976, 128, 280, 486, lines(1004, 160, [200, 160, 220, 140, 190], 'ink3', 20)),

  /* Voice — a waveform over a transcript. */
  voice: () =>
    card(284, 128, 972, 220, Array.from({ length: 74 }, (_, i) => {
      const h = 12 + Math.abs(Math.sin(i / 3.4) * 74) + (i % 5) * 4;
      return `<rect class="acc2" x="${312 + i * 12.6}" y="${238 - h / 2}" width="5" height="${h}" rx="2.5" opacity="${i < 40 ? '.92' : '.32'}"/>`;
    }).join('')) +
    [0, 1, 2].
      map((i) => card(284, 376 + i * 96, 972, 76,
        `<rect class="horn" x="312" y="${400 + i * 96}" width="46" height="9" rx="2" opacity=".85"/>
         ${lines(376, 400 + i * 96, [640 - i * 60], 'ink', 0, '.8')}
         ${lines(376, 422 + i * 96, [520 - i * 40], 'ink3', 0, '.45')}`))
      .join(''),

  /* Studios — an artboard with a caption band and a right-hand inspector. */
  studios: () =>
    card(284, 128, 640, 560, `<rect class="well" x="285" y="129" width="638" height="558" rx="10"/>
      <rect class="line" x="330" y="180" width="548" height="330" rx="8"/>
      <rect class="ink" x="392" y="556" width="424" height="16" rx="4" opacity=".9"/>
      <rect class="horn" x="392" y="556" width="128" height="16" rx="4"/>
      <rect class="ink3" x="440" y="590" width="328" height="10" rx="3" opacity=".4"/>`) +
    card(956, 128, 300, 560,
      [0, 1, 2, 3, 4, 5].map((i) =>
        `<rect class="line" x="984" y="${164 + i * 84}" width="244" height="56" rx="8"/>
         ${lines(1004, 184 + i * 84, [96], 'ink2', 0, '.6')}
         <rect class="${i % 2 ? 'horn' : 'acc'}" x="1180" y="${182 + i * 84}" width="28" height="12" rx="6" opacity=".8"/>`).join('')),

  /* Performance — one sentence, then the bars it came from. */
  performance: () =>
    card(284, 128, 972, 130, `${lines(316, 168, [700], 'ink', 0, '.92')}${lines(316, 196, [560], 'ink2', 0, '.6')}
      <rect class="horn" x="284" y="128" width="3" height="130" rx="2"/>`) +
    card(284, 286, 972, 402, Array.from({ length: 14 }, (_, i) => {
      const h = 40 + Math.abs(Math.sin(i / 2.1) * 190);
      return `<rect class="${i === 6 ? 'horn' : 'acc'}" x="${330 + i * 64}" y="${620 - h}" width="34" height="${h}" rx="6" opacity="${i === 6 ? '.95' : '.55'}"/>`;
    }).join('') + `<rect class="line" x="316" y="626" width="908" height="1"/>`),
};

for (const [name, draw] of Object.entries(scenes)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Placeholder for the ${name} capture">
  <!-- PLACEHOLDER, generated by scripts/build-placeholders.mjs.
       Replaced by a real capture from 'npm run shoot'. Drawn with the app's own
       dark tokens so density and rhythm are honest; contains no data. -->
  <defs><style>${CSS}</style></defs>${chrome(name.length)}${draw()}
</svg>
`;
  writeFileSync(new URL(`../public/shots/_placeholder-${name}.svg`, import.meta.url), svg);
  console.log(`wrote _placeholder-${name}.svg`);
}
