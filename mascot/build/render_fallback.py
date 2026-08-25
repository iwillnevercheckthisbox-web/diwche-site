#!/usr/bin/env python3
"""Render each Lottie to a looping animated WebP, plus a static poster.

    python3 build/render_fallback.py            # everything
    python3 build/render_fallback.py writing    # one scene

Why animated WebP and not WebM: Safari still does not support alpha in VP9/WebM — the
transparency is ignored and the animation renders on a black box. Safari's transparent-video
path is HEVC-with-alpha, which is awkward to produce and not free. Animated WebP has carried
a full alpha channel in every major browser since 2020. APNG works too but the files run
several times larger.

Why Pillow and not ffmpeg: the ffmpeg on this machine is built without libwebp, so it cannot
write WebP at all. Pillow can, and does.

Frames are stepped deterministically with `goToAndStop` rather than screen-recorded. Recording
drops and duplicates frames, which is exactly how you get a fallback that stutters at the loop
point after all the care taken to make the Lottie itself seamless.

Needs Playwright, which this repo already has in `frontend/node_modules`.
"""
from __future__ import annotations

import json
import pathlib
import subprocess
import sys
import tempfile

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _scenes import BY_SLUG  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
REPO = ROOT.parent.parent           # …/Social-Media-Admin
PLAYWRIGHT = REPO / "frontend" / "node_modules" / "playwright"

# Rendered smaller and slower than the Lottie. Animated WebP stores whole frames rather than
# deltas, so cost scales with pixels x frames: at 30fps and 512px a four-second loop lands
# around 2 MB, which is absurd for a mascot shown at 300px. Half the frame rate and three
# quarters the size cuts that by roughly 5x and is indistinguishable at display size, because
# the motion here is slow by design.
RENDER = 384
FALLBACK_FPS = 15
PORT = 8791

CAPTURE_JS = r"""
const {chromium} = require(%(playwright)s);
const scenes = %(scenes)s;
const out = %(out)s;
const size = %(size)d;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport: {width: size, height: size}});
  await page.goto(`http://localhost:%(port)d/_capture.html`);

  for (const s of scenes) {
    await page.evaluate(([name, slug]) => window.__load(name, slug), [s.name, s.slug]);
    await page.waitForFunction(() => window.__ready === true, {timeout: 30000});
    const info = await page.evaluate(() => ({
      total: window.__anim.totalFrames,
      w: window.__anim.animationData.w,
      h: window.__anim.animationData.h,
    }));
    const total = info.total;
    // Match the viewport to the animation's own proportions. A fixed square viewport
    // letterboxes anything that is not square, and those transparent bands then get baked
    // into every frame of the output.
    const longest = Math.max(info.w, info.h);
    await page.setViewportSize({
      width: Math.round(size * info.w / longest),
      height: Math.round(size * info.h / longest),
    });
    const step = %(step)d;
    for (let f = 0; f < total; f += step) {
      await page.evaluate((f) => {
        window.__anim.goToAndStop(f, true);
        return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      }, f);
      await page.screenshot({
        path: `${out}/${s.name}/${String(f).padStart(4, '0')}.png`,
        omitBackground: true,
      });
    }
    console.log(`captured ${s.name} (${total} frames)`);
  }
  await browser.close();
})();
"""

CAPTURE_HTML = """<!doctype html>
<meta charset="utf-8">
<style>html,body{margin:0;background:transparent}#s{width:100vw;height:100vh}</style>
<div id="s"></div>
<script src="vendor/lottie_light.min.js"></script>
<script>
window.__ready = false;
window.__load = (name, slug) => {
  window.__ready = false;
  if (window.__anim) window.__anim.destroy();
  document.getElementById('s').innerHTML = '';
  window.__anim = lottie.loadAnimation({
    container: document.getElementById('s'),
    renderer: 'svg', loop: false, autoplay: false,
    path: `lottie/${name}.json`, assetsPath: `assets/${slug}/`,
    rendererSettings: {preserveAspectRatio: 'xMidYMid meet'},
  });
  // DOMLoaded fires only once the external layer images have resolved, which is what we
  // actually need — a missing image does not throw, it just renders blank.
  window.__anim.addEventListener('DOMLoaded', () => { window.__ready = true; });
};
</script>
"""


def serve(root, port):
    return subprocess.Popen(
        [sys.executable, "-m", "http.server", str(port), "--bind", "127.0.0.1"],
        cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def assemble(frame_dir, out_path, fps, poster_path):
    from PIL import Image
    files = sorted(frame_dir.glob("*.png"))
    if not files:
        raise SystemExit(f"no frames captured in {frame_dir}")
    frames = [Image.open(f).convert("RGBA") for f in files]

    # Lossy WebP: painterly art with pencil grain compresses terribly losslessly.
    frames[0].save(out_path, format="WEBP", save_all=True, append_images=frames[1:],
                   duration=int(round(1000 / fps)), loop=0, quality=72, method=6,
                   lossless=False)

    # A frame from a third of the way in, which is past any entrance animation and shows the
    # scene settled — this is what a reduced-motion viewer sees.
    frames[len(frames) // 3].save(poster_path, format="WEBP", quality=88, method=6)
    return len(frames)


def main(argv):
    global RENDER, FALLBACK_FPS
    # --size / --fps override the shipping defaults, for making a higher-quality copy to
    # review or share. The defaults stay tuned for what actually gets served.
    argv = list(argv)
    for flag, cast in (("--size", int), ("--fps", int)):
        if flag in argv:
            i = argv.index(flag)
            value = cast(argv[i + 1])
            del argv[i:i + 2]
            if flag == "--size":
                RENDER = value
            else:
                FALLBACK_FPS = value
    out_dir = DIST / "fallback"
    if "--review" in argv:
        argv.remove("--review")
        out_dir = DIST / "review"
    out_dir.mkdir(parents=True, exist_ok=True)

    if not PLAYWRIGHT.exists():
        raise SystemExit(f"Playwright not found at {PLAYWRIGHT}. Run npm install in frontend/.")

    manifest = json.loads((DIST / "manifest.json").read_text())
    wanted = [a for a in argv[1:] if not a.startswith("-")]
    if wanted:
        manifest = [m for m in manifest if m["slug"] in wanted]

    (DIST / "_capture.html").write_text(CAPTURE_HTML)

    # Frames are sampled by stepping the source, so only rates that divide the Lottie's 30fps
    # keep the loop the right length. Snap to the nearest that does, rather than silently
    # stretching a four second loop into four point eight.
    step = max(1, round(30 / FALLBACK_FPS))
    effective = 30 // step
    if effective != FALLBACK_FPS:
        print(f"  (fps {FALLBACK_FPS} does not divide 30; using {effective})")
    FALLBACK_FPS = effective

    server = serve(DIST, PORT)
    try:
        with tempfile.TemporaryDirectory() as tmp:
            tmpdir = pathlib.Path(tmp)
            for m in manifest:
                (tmpdir / m["name"]).mkdir(parents=True, exist_ok=True)
            script = tmpdir / "capture.js"
            script.write_text(CAPTURE_JS % dict(
                playwright=json.dumps(str(PLAYWRIGHT)),
                scenes=json.dumps(manifest), out=json.dumps(str(tmpdir)),
                size=RENDER, port=PORT, step=step))
            subprocess.run(["node", str(script)], check=True, cwd=REPO / "frontend")

            for m in manifest:
                scene = BY_SLUG[m["slug"]]
                webp = out_dir / f"{m['name']}.webp"
                poster = out_dir / f"{m['name']}-poster.webp"
                count = assemble(tmpdir / m["name"], webp, FALLBACK_FPS, poster)
                seconds = count / FALLBACK_FPS
                print(f"  {m['name']:22s} {count:3d} frames @ {FALLBACK_FPS}fps = "
                      f"{seconds:.1f}s  loop {webp.stat().st_size / 1024:7.1f} KB  "
                      f"poster {poster.stat().st_size / 1024:5.1f} KB")
    finally:
        server.terminate()
        (DIST / "_capture.html").unlink(missing_ok=True)


if __name__ == "__main__":
    main(sys.argv)
