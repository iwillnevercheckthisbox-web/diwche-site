#!/usr/bin/env python3
"""Copy the built animations into the Angular app.

    python3 build/install.py

`frontend/public/` is the only directory Angular serves static files from (it is mapped
wholesale in `frontend/angular.json`), so everything the player needs goes to
`frontend/public/mascot/`. That path is what `DiwcheDirective`'s default `diwcheBase` points
at.

The preview page, the vendored player and the standalone builds are deliberately not copied —
they are authoring tools, not app assets.
"""
import pathlib
import shutil
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
TARGET = ROOT.parent.parent / "frontend" / "public" / "mascot"


def main():
    if not (DIST / "manifest.json").exists():
        raise SystemExit("Nothing built yet. Run: python3 build/make.py")

    TARGET.mkdir(parents=True, exist_ok=True)
    total = 0
    for folder in ("lottie", "assets"):
        src = DIST / folder
        if not src.exists():
            print(f"  (no {folder}/ — skipped)")
            continue
        dst = TARGET / folder
        shutil.rmtree(dst, ignore_errors=True)
        shutil.copytree(src, dst)
        size = sum(f.stat().st_size for f in dst.rglob("*") if f.is_file())
        total += size
        print(f"  {folder:10s} {size / 1024:8.1f} KB")

    # Posters only, not the animated fallbacks. A transparent animated WebP of one of these
    # runs past a megabyte — the alpha channel defeats the compression — against about 150 KB
    # for the Lottie it is supposed to be standing in for. Shipping it would mean the
    # "lightweight" path costing eight times what the real one does. The poster is what the
    # reduced-motion branch actually shows, and it is around 30 KB.
    src = DIST / "fallback"
    if src.exists():
        dst = TARGET / "fallback"
        shutil.rmtree(dst, ignore_errors=True)
        dst.mkdir(parents=True)
        size = 0
        for poster in src.glob("*-poster.webp"):
            shutil.copy2(poster, dst / poster.name)
            size += poster.stat().st_size
        total += size
        print(f"  {'posters':10s} {size / 1024:8.1f} KB  "
              f"(animated fallbacks left behind — see the note in install.py)")

    shutil.copy2(DIST / "manifest.json", TARGET / "manifest.json")
    print(f"\n  installed {total / 1024 / 1024:.2f} MB into "
          f"{TARGET.relative_to(ROOT.parent.parent)}")
    print("  Nothing is loaded until a <div diwche> is rendered — the player and each "
          "scene are fetched on demand.")


if __name__ == "__main__":
    main()
