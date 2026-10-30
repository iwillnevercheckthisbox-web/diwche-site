"""Builds pipeline.html from src/pipeline.src.html with the Diw poses inlined as data URIs."""
import base64, os, subprocess, sys
here = os.path.dirname(os.path.abspath(__file__))
subprocess.run([sys.executable, os.path.join(here, "mascot", "build_diw.py")], check=True)
s = open(os.path.join(here, "src", "pipeline.src.html")).read()
for pose in ("proud", "think", "listen", "done"):
    raw = open(os.path.join(here, "mascot", f"diw-{pose}.svg"), "rb").read()
    s = s.replace(f"__DIW_{pose.upper()}__", "data:image/svg+xml;base64," + base64.b64encode(raw).decode())
assert "__DIW_" not in s
open(os.path.join(here, "pipeline.html"), "w").write(s)
print("pipeline.html", len(s), "bytes")
