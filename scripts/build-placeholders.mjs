/**
 * Generates the stand-in captures the funnel uses until `npm run shoot` can
 * take real ones from the running app.
 *
 * The rule these follow: **chrome is legible, account data is not.** Navigation,
 * page titles, button labels, column headers and field names are drawn as real
 * text, because a client looking at these should come away knowing what the app
 * actually is. Anything that would belong to a particular Instagram account —
 * topic wording, captions, handles, follower counts, the numbers themselves —
 * stays as a skeleton bar, because inventing it would be showing them a page
 * that does not exist.
 *
 * They carry no data of any kind, which is why the gitignore lets
 * `_placeholder-*` through while every real capture stays out until the
 * credential review.
 */
import { writeFileSync } from 'node:fs';

const W = 1280;
const H = 800;
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const CSS = `
    .bg{fill:#0b0f18}.panel{fill:#0e131e}.well{fill:#090d15}.line{fill:#1c2436}
    .sk{fill:#2a3450}.sk2{fill:#1f2738}
    .horn{fill:#c9a668}.acc{fill:#0f52ba}.acc2{fill:#5b8ff9}
    text{font-family:${FONT};fill:#eef1f9}
    .t-nav{font-size:13px;fill:#97a2bd}
    .t-nav-on{font-size:13px;fill:#eef1f9;font-weight:500}
    .t-group{font-size:10px;fill:#55607d;letter-spacing:1.2px}
    .t-title{font-size:20px;fill:#eef1f9}
    .t-btn{font-size:12px;fill:#f3f6ff;font-weight:500}
    .t-btn-q{font-size:12px;fill:#97a2bd}
    .t-label{font-size:11px;fill:#55607d;letter-spacing:1px}
    .t-meta{font-size:11px;fill:#55607d}
    .t-body{font-size:13px;fill:#97a2bd}
`;

/** Sidebar groups, as the app actually has them. */
const NAV = [
  ['CREATE', ['Create', 'D1 Studio', 'Reel', 'Story']],
  ['LIBRARY', ['Gallery', 'Music', 'Templates', 'Palettes']],
  ['INSIGHT', ['Ideas', 'Performance']],
  ['MANAGE', ['Accounts', 'Activity']],
];

/** The app frame: sidebar with real labels, header with the real page title. */
function chrome(active, title, actions = []) {
  let y = 96;
  let nav = '';
  for (const [group, items] of NAV) {
    nav += `<text class="t-group" x="24" y="${y}">${group}</text>`;
    y += 22;
    for (const item of items) {
      const on = item === active;
      if (on) {
        nav += `<rect class="line" x="14" y="${y - 14}" width="200" height="28" rx="6"/>
                <rect class="horn" x="14" y="${y - 14}" width="2.5" height="28" rx="1.25"/>`;
      }
      nav += `<text class="${on ? 't-nav-on' : 't-nav'}" x="30" y="${y + 5}">${item}</text>`;
      y += 30;
    }
    y += 14;
  }

  let bar = '';
  let bx = W - 32;
  for (let i = actions.length - 1; i >= 0; i--) {
    const { text, primary } = actions[i];
    const w = text.length * 7.4 + 28;
    bx -= w;
    bar += primary
      ? `<rect class="acc" x="${bx}" y="34" width="${w}" height="32" rx="8"/>
         <text class="t-btn" x="${bx + w / 2}" y="54" text-anchor="middle">${text}</text>`
      : `<rect class="line" x="${bx}" y="34" width="${w}" height="32" rx="8" fill="none" stroke="#2a3450"/>
         <text class="t-btn-q" x="${bx + w / 2}" y="54" text-anchor="middle">${text}</text>`;
    bx -= 10;
  }

  return `
  <rect class="bg" width="${W}" height="${H}"/>
  <rect class="panel" width="236" height="${H}"/>
  <rect class="line" x="236" width="1" height="${H}"/>
  <path class="horn" d="M24 34c6-9 15-9 19 0 4-9 13-9 19 0-4 13-15 19-19 19s-15-6-19-19z" opacity=".9"/>
  <text x="72" y="41" style="font-size:17px">Diwche</text>
  ${nav}
  <text class="t-title" x="284" y="55">${title}</text>
  ${bar}
  <rect class="line" x="236" y="88" width="${W - 236}" height="1"/>`;
}

const card = (x, y, w, h, inner = '') =>
  `<rect class="panel" x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/>
   <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="none" stroke="#1c2436"/>${inner}`;

/** Skeleton bars — this is where an account's own words would be. */
const sk = (x, y, widths, gap = 15, cls = 'sk2') =>
  widths
    .map((w, i) => `<rect class="${cls}" x="${x}" y="${y + i * gap}" width="${w}" height="8" rx="4"/>`)
    .join('');

const pill = (x, y, text, cls = 'acc') => {
  const w = text.length * 6.6 + 22;
  return `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="26" rx="7" opacity="${cls === 'acc' ? '1' : '.9'}"/>
          <text class="t-btn" x="${x + w / 2}" y="${y + 17}" text-anchor="middle">${text}</text>`;
};

const ghost = (x, y, text) => {
  const w = text.length * 6.6 + 22;
  return `<rect x="${x}" y="${y}" width="${w}" height="26" rx="7" fill="none" stroke="#2a3450"/>
          <text class="t-btn-q" x="${x + w / 2}" y="${y + 17}" text-anchor="middle">${text}</text>`;
};

const scenes = {
  /* Ideas — real column headers and real actions; the topics themselves masked. */
  ideas: () =>
    chrome('Ideas', 'Ideas', [{ text: 'Talk to me' }, { text: 'More topics', primary: true }]) +
    `<text class="t-label" x="284" y="122">TODAY</text>` +
    [0, 1, 2]
      .map((i) => {
        const y = 138 + i * 150;
        return card(284, y, 640, 130,
          `<rect class="horn" x="284" y="${y}" width="3" height="130" rx="1.5"/>
           ${sk(312, y + 24, [380 - i * 40], 15, 'sk')}
           ${sk(312, y + 50, [560, 470])}
           <text class="t-meta" x="312" y="${y + 96}">Why today</text>
           ${sk(370, y + 89, [180])}
           ${pill(770, y + 86, 'Make')}
           ${ghost(834, y + 86, 'Keep')}`);
      })
      .join('') +
    card(956, 138, 300, 430,
      `<text class="t-label" x="984" y="168">YOUR DIRECTION</text>
       ${sk(984, 186, [230, 200, 244, 170], 18)}
       <rect class="line" x="984" y="272" width="244" height="1"/>
       <text class="t-label" x="984" y="300">PAGES YOU ADMIRE</text>
       ${sk(984, 318, [150, 176, 132], 24)}`),

  /* D1 Studio — the review screen, with the reason column named. */
  d1: () =>
    chrome('D1 Studio', 'D1 Studio — review', [{ text: 'Discard' }, { text: 'Use this cut', primary: true }]) +
    card(284, 116, 640, 300, `<rect class="well" x="285" y="117" width="638" height="298" rx="10"/>
      <circle class="acc2" cx="604" cy="266" r="32" opacity=".9"/>
      <path class="bg" d="M595 251l24 15-24 15z"/>
      <rect class="line" x="316" y="380" width="576" height="4" rx="2"/>
      <rect class="acc2" x="316" y="380" width="210" height="4" rx="2"/>`) +
    `<text class="t-label" x="284" y="450">WHAT HE REMOVED</text>
     <text class="t-label" x="700" y="450">REASON</text>` +
    [
      ['A pause', 'Silence, 1.4s'],
      ['A stumble', 'Restarted the sentence'],
      ['A retake', 'Same line, said better later'],
      ['A pause', 'Silence, 0.9s'],
    ]
      .map(([what, why], i) => {
        const y = 466 + i * 56;
        return card(284, y, 640, 44,
          `<circle cx="308" cy="${y + 22}" r="4" fill="#e05a6a" opacity=".85"/>
           <text class="t-body" x="324" y="${y + 27}">${what}</text>
           <text class="t-meta" x="416" y="${y + 27}">${why}</text>`);
      })
      .join('') +
    card(956, 116, 300, 570,
      `<text class="t-label" x="984" y="146">TELEPROMPTER</text>
       ${sk(984, 164, [230, 244, 200, 236, 170], 18)}
       <rect class="line" x="984" y="272" width="244" height="1"/>
       <text class="t-label" x="984" y="300">SCROLL SPEED</text>
       <rect class="line" x="984" y="316" width="244" height="4" rx="2"/>
       <rect class="acc2" x="984" y="316" width="140" height="4" rx="2"/>
       <text class="t-label" x="984" y="360">TEXT SIZE</text>
       <rect class="line" x="984" y="376" width="244" height="4" rx="2"/>
       <rect class="acc2" x="984" y="376" width="96" height="4" rx="2"/>`),

  /* The studios — a real inspector with named controls. */
  studios: () =>
    chrome('Templates', 'Visual Studio', [{ text: 'Preview' }, { text: 'Publish', primary: true }]) +
    card(284, 116, 620, 570, `<rect class="well" x="285" y="117" width="618" height="568" rx="10"/>
      <rect class="line" x="330" y="160" width="528" height="330" rx="8"/>
      <text class="t-meta" x="594" y="330" text-anchor="middle">1080 × 1350</text>
      ${sk(400, 530, [388], 22, 'sk')}
      ${sk(430, 566, [328])}
      <rect class="horn" x="400" y="530" width="110" height="8" rx="4"/>`) +
    card(932, 116, 324, 570,
      [
        ['Palette', 'Sapphire'],
        ['Font', 'Vazirmatn'],
        ['Character', 'The essayist'],
        ['Language', 'Persian'],
        ['Captions', 'Word by word'],
        ['Safe zone', 'On'],
      ]
        .map(([label, value], i) =>
          `<text class="t-body" x="960" y="${162 + i * 62}">${label}</text>
           <rect class="line" x="1084" y="${146 + i * 62}" width="144" height="28" rx="7"/>
           <text class="t-meta" x="1156" y="${164 + i * 62}" text-anchor="middle">${value}</text>`)
        .join('') +
        `<rect class="line" x="960" y="510" width="268" height="1"/>
         <text class="t-label" x="960" y="540">LAYERS</text>
         ${sk(960, 558, [180, 148, 200], 24)}`),

  /* Performance — real column headers, the account's own figures masked. */
  performance: () =>
    chrome('Performance', 'Performance', [{ text: 'Last 30 days' }, { text: 'Export' }]) +
    card(284, 116, 972, 108,
      `<rect class="horn" x="284" y="116" width="3" height="108" rx="1.5"/>
       <text class="t-label" x="312" y="146">WHAT WORKED, AND WHY</text>
       ${sk(312, 162, [700, 540], 20, 'sk')}`) +
    [
      ['Reach', 176],
      ['Saves', 120],
      ['Shares', 96],
      ['Follows', 64],
    ]
      .map(([label], i) =>
        card(284 + i * 246, 244, 226, 96,
          `<text class="t-label" x="${308 + i * 246}" y="274">${label.toUpperCase()}</text>
           ${sk(308 + i * 246, 288, [96], 15, 'sk')}
           ${sk(308 + i * 246, 312, [140])}`))
      .join('') +
    card(284, 360, 972, 326,
      `<text class="t-label" x="312" y="392">WHEN YOUR POSTS ACTUALLY DID BEST</text>
       ${Array.from({ length: 14 }, (_, i) => {
         const h = 30 + Math.abs(Math.sin(i / 2.1) * 170);
         return `<rect class="${i === 6 ? 'horn' : 'acc'}" x="${330 + i * 64}" y="${638 - h}" width="34" height="${h}" rx="6" opacity="${i === 6 ? '.95' : '.5'}"/>`;
       }).join('')}
       <rect class="line" x="312" y="644" width="916" height="1"/>
       ${['00', '04', '08', '12', '16', '20']
         .map((t, i) => `<text class="t-meta" x="${340 + i * 176}" y="666">${t}:00</text>`)
         .join('')}`),
};

for (const [name, draw] of Object.entries(scenes)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Placeholder for the ${name} screen">
  <!-- PLACEHOLDER, generated by scripts/build-placeholders.mjs.
       Chrome is real text so the app is recognisable; anything that would be a
       particular account's own words or numbers is a skeleton bar, because
       inventing those would show a page that does not exist.
       Replaced by a real capture from 'npm run shoot'. -->
  <defs><style>${CSS}</style></defs>${chrome ? '' : ''}${draw()}
</svg>
`;
  writeFileSync(new URL(`../public/shots/_placeholder-${name}.svg`, import.meta.url), svg);
  console.log(`wrote _placeholder-${name}.svg`);
}
