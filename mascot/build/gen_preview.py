#!/usr/bin/env python3
"""Write dist/index.html — the contact sheet that plays all twelve at once.

This is the review surface for the whole project. Everything you need to judge is visible on
one page: whether the loops seam, whether they pulse in unison, whether each one still reads
as the same character, and which scenes are still running on placeholder art.
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"

PAGE = """<!doctype html>
<meta charset="utf-8">
<title>Diwche — twelve loops</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  :root {{
    --paper: #F6F1E4; --ink: #3A3226; --rule: #DCD2BC;
    --skin: #7C9A63; --alarm: #B4463C;
  }}
  * {{ box-sizing: border-box; }}
  body {{
    margin: 0; padding: 40px 32px 64px; background: var(--paper); color: var(--ink);
    font: 15px/1.55 ui-serif, Georgia, "Iowan Old Style", serif;
  }}
  header {{ max-width: 760px; margin: 0 auto 40px; }}
  h1 {{ font-size: 30px; margin: 0 0 6px; letter-spacing: -0.01em; }}
  .lede {{ margin: 0 0 18px; opacity: .78; }}
  .controls {{ display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }}
  button {{
    font: inherit; font-size: 13px; padding: 5px 12px; border: 1px solid var(--rule);
    background: #fff; color: inherit; border-radius: 999px; cursor: pointer;
  }}
  button:hover {{ border-color: var(--ink); }}
  .grid {{
    max-width: 1360px; margin: 0 auto;
    display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 28px;
  }}
  figure {{ margin: 0; }}
  .stage {{
    position: relative; border-radius: 10px; overflow: hidden;
    border: 1px solid var(--rule); background: #fff;
  }}
  /* The animations are transparent cutouts, so the backdrop has to be switchable — a pale
     fringe on a cut edge is completely invisible against white and obvious against black. */
  body.bg-dark .stage {{ background: #15171d; border-color: #2c2f38; }}
  body.bg-grey .stage {{ background: #82858c; border-color: #6d7078; }}
  body.bg-check .stage {{
    background-color: #fff;
    background-image:
      linear-gradient(45deg, #d6d2c6 25%, transparent 25%, transparent 75%, #d6d2c6 75%),
      linear-gradient(45deg, #d6d2c6 25%, transparent 25%, transparent 75%, #d6d2c6 75%);
    background-size: 22px 22px;
    background-position: 0 0, 11px 11px;
  }}
  body.bg-dark {{ background: #0d0f13; color: #d8d4c8; }}
  body.bg-dark .tag {{ background: #2a2b22; color: #c9be93; }}
  body.bg-dark button {{ background: #1d2027; color: inherit; border-color: #343842; }}
  .stage > div {{ position: absolute; inset: 0; }}
  figcaption {{
    display: flex; align-items: baseline; gap: 8px; padding: 9px 2px 0; flex-wrap: wrap;
  }}
  .n {{ font-variant-numeric: tabular-nums; opacity: .45; font-size: 12px; }}
  .title {{ font-weight: 600; white-space: nowrap; }}
  .meta {{
    margin-left: auto; font-size: 11.5px; opacity: .6; white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }}
  .usage {{ padding: 2px 2px 0; font-size: 12.5px; opacity: .62; }}
  .tag {{
    font-size: 10.5px; text-transform: uppercase; letter-spacing: .06em;
    padding: 2px 7px; border-radius: 4px; background: #EFE6CF; color: #7A6A45;
  }}
  .tag.placeholder {{ background: #F6E0DC; color: var(--alarm); }}
  .note {{
    max-width: 760px; margin: 44px auto 0; padding-top: 20px;
    border-top: 1px solid var(--rule); font-size: 13.5px; opacity: .72;
  }}
  code {{ font-family: ui-monospace, Menlo, monospace; font-size: 12.5px; }}
</style>

<header>
  <h1>Diwche — twelve loops</h1>
  <p class="lede">
    Every animation in the set, playing together. Watch for three things: a visible jump at
    the loop point, several of them pulsing in time with each other, and any scene where he
    stops looking like the same creature.
  </p>
  <div class="controls">
    <button id="toggle">Pause all</button>
    <button id="restart">Restart together</button>
    <button id="slow">Quarter speed</button>
    <button id="backdrop">Backdrop: light</button>
    <span class="meta" id="summary"></span>
  </div>
</header>

<div class="grid" id="grid"></div>

<div class="note">
  Every scene is a transparent cutout taken from the original drawing: no background of its
  own, so it sits on whatever the page behind it happens to be. Switch the backdrop to
  <strong>dark</strong> before judging one — the drawings were made on cream paper, and a pale
  fringe left on a cut edge is invisible against white and glaring against black.
  <br><br>
  Nine of the twelve blink. Four do not: one is too pleased with himself, and three are drawn
  with skin so close in tone to their own eye-whites that a painted eyelid reads as a patch
  rather than a lid.
</div>

<script src="vendor/lottie_light.min.js"></script>
<script>
const SCENES = {manifest};
const grid = document.getElementById('grid');
const anims = [];

for (const s of SCENES) {{
  const fig = document.createElement('figure');
  fig.innerHTML = `
    <div class="stage" style="aspect-ratio:${{s.w}} / ${{s.h}}"><div></div></div>
    <figcaption>
      <span class="n">${{String(s.name).slice(0, 2)}}</span>
      <span class="title">${{s.title}}</span>
      <span class="tag ${{s.mode}}">${{s.mode === 'placeholder' ? 'placeholder' : s.rig}}</span>
      <span class="meta">${{s.loop}}s · ${{s.frames}}f · ${{Math.round((s.json_bytes + s.asset_bytes) / 1024)}} KB</span>
    </figcaption>
    <div class="usage">${{s.usage}}</div>`;
  grid.appendChild(fig);

  const anim = lottie.loadAnimation({{
    container: fig.querySelector('.stage > div'),
    renderer: 'svg',
    loop: true,
    autoplay: false,
    path: `lottie/${{s.name}}.json`,
    // Mirrors how the Angular directive loads them: the JSON carries an empty `u` on every
    // asset and the path is supplied here, so the files are location-independent.
    assetsPath: `assets/${{s.slug}}/`,
    rendererSettings: {{ progressiveLoad: true, preserveAspectRatio: 'xMidYMid meet' }},
  }});

  // Loop lengths already differ across the set, but scenes that share one would stay in
  // lockstep forever if they all started at frame zero together. Starting each at its own
  // offset breaks that up. It is derived from the name rather than random so the page looks
  // the same on every reload.
  anim.addEventListener('DOMLoaded', () => {{
    const seed = [...s.name].reduce((a, c) => a + c.charCodeAt(0), 0);
    anim.goToAndPlay(seed % anim.totalFrames, true);
  }});
  anims.push(anim);
}}

const kb = SCENES.reduce((a, s) => a + s.json_bytes + s.asset_bytes, 0) / 1024;
const ph = SCENES.filter(s => s.mode === 'placeholder').length;
document.getElementById('summary').textContent =
  `${{SCENES.length}} scenes · ${{(kb / 1024).toFixed(2)}} MB` + (ph ? ` · ${{ph}} placeholder` : '');

const BACKDROPS = ['light', 'check', 'grey', 'dark'];
let backdrop = 0;
document.getElementById('backdrop').onclick = (e) => {{
  backdrop = (backdrop + 1) % BACKDROPS.length;
  document.body.className = 'bg-' + BACKDROPS[backdrop];
  e.target.textContent = 'Backdrop: ' + BACKDROPS[backdrop];
}};

let playing = true, slow = false;
document.getElementById('toggle').onclick = (e) => {{
  playing = !playing;
  anims.forEach(a => playing ? a.play() : a.pause());
  e.target.textContent = playing ? 'Pause all' : 'Play all';
}};
document.getElementById('restart').onclick = () => anims.forEach(a => a.goToAndPlay(0, true));
// (Restart deliberately drops the stagger, so you can check for a seam on all twelve at once.)
document.getElementById('slow').onclick = (e) => {{
  slow = !slow;
  anims.forEach(a => a.setSpeed(slow ? 0.25 : 1));
  e.target.textContent = slow ? 'Full speed' : 'Quarter speed';
}};
</script>
"""


def main():
    manifest = json.loads((DIST / "manifest.json").read_text())
    (DIST / "index.html").write_text(PAGE.format(manifest=json.dumps(manifest)))
    print(f"wrote dist/index.html ({len(manifest)} scenes)")


if __name__ == "__main__":
    main()
