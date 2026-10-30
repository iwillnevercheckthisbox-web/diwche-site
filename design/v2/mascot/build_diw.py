"""Diw v2: a lovable 2D div. Flat fills, one outline weight, one shade tone.
Brief: genderless, half-bare (open vest, bare arms and belly), a frown that is also
satisfaction with the job, big eyes and ears, two small upward horns, tools on the vest
(caliper, camera, microphone, brush), and an oversized head because it is the one who thinks.
Run: python3 build_diw.py  -> writes diw-*.svg next to this file."""
import os

C = dict(
    line="#1F1B24",      # outline, never pure black
    skin="#7FB5B0",      # soft div teal
    skin2="#5E968F",     # its one shade
    belly="#A9D1C9",
    horn="#EFE6CF", horn2="#D5C7A2",
    vest="#C9A668", vest2="#A8843F",   # brand gold
    shorts="#2B2434",
    eye="#FFFDF7", pupil="#1F1B24",
    blush="#E8907E",
    metal="#C8CCD3", metal2="#9AA1AC",
    tool="#2A2E3A",
)
W = 5  # outline weight

def mirror(d):  # mirror an x,y list across x = 200
    return [(400 - x, y) for x, y in d]

def P(d, fill, stroke=True, extra=""):
    s = f' stroke="{C["line"]}" stroke-width="{W}" stroke-linejoin="round" stroke-linecap="round"' if stroke else ""
    return f'<path d="{d}" fill="{fill}"{s} {extra}/>'

def limb(d, width, fill):
    """A limb drawn as a thick stroke with an outline underneath, so it reads as one flat shape."""
    return (f'<path d="{d}" fill="none" stroke="{C["line"]}" stroke-width="{width + 2*W}" stroke-linecap="round"/>'
            f'<path d="{d}" fill="none" stroke="{fill}" stroke-width="{width}" stroke-linecap="round"/>')

def eyes(mood):
    out = []
    for side in (-1, 1):
        cx = 200 + side * 52
        if mood == "done":   # closed, pleased: upward arcs under a frowning brow
            out.append(f'<path d="M{cx-26} 206 Q{cx} 186 {cx+26} 206" fill="none" stroke="{C["line"]}" stroke-width="7" stroke-linecap="round"/>')
        else:
            px, py = {"proud": (side * -6, 8), "think": (-10, -10), "listen": (side * -4, 4)}[mood]
            clip = f"eye{side+1}{mood}"
            out.append(f'<clipPath id="{clip}"><ellipse cx="{cx}" cy="198" rx="35" ry="40"/></clipPath>')
            out.append(f'<g class="eye" style="transform-origin:{cx}px 198px">')
            out.append(f'<ellipse cx="{cx}" cy="198" rx="35" ry="40" fill="{C["eye"]}"/>')
            out.append(f'<g clip-path="url(#{clip})">')
            out.append(f'<circle cx="{cx+px}" cy="{198+py}" r="19" fill="{C["pupil"]}"/>')
            out.append(f'<circle cx="{cx+px+7}" cy="{198+py-8}" r="6" fill="{C["eye"]}"/>')
            # the heavy upper lid: the frown lives here (inner corner lower)
            lid_in, lid_out = (190, 172) if mood != "think" else (178, 176)
            if mood == "think" and side == 1: lid_in, lid_out = (170, 170)
            if side == -1:
                out.append(f'<path d="M{cx-40} 150 L{cx+40} 150 L{cx+40} {lid_in} L{cx-40} {lid_out} Z" fill="{C["skin"]}"/>')
            else:
                out.append(f'<path d="M{cx-40} 150 L{cx+40} 150 L{cx+40} {lid_out} L{cx-40} {lid_in} Z" fill="{C["skin"]}"/>')
            out.append('</g>')
            out.append(f'<ellipse cx="{cx}" cy="198" rx="35" ry="40" fill="none" stroke="{C["line"]}" stroke-width="{W}"/>')
            # lid edge
            if side == -1:
                out.append(f'<path d="M{cx-33} {lid_out+1} L{cx+33} {lid_in-1}" stroke="{C["line"]}" stroke-width="{W}" stroke-linecap="round"/>')
            else:
                out.append(f'<path d="M{cx-33} {lid_in-1} L{cx+33} {lid_out+1}" stroke="{C["line"]}" stroke-width="{W}" stroke-linecap="round"/>')
            out.append('</g>')
        # brows: short, thick, angled down toward the middle
        if mood == "think" and side == 1:
            b = f'M{cx-30} 140 Q{cx} 128 {cx+30} 136'          # one brow up: considering
        else:
            b = f'M{cx-30*side*-1} 142 Q{cx} 140 {cx+34*side*-1} 158' if False else None
            b = (f'M{cx-32} 140 Q{cx-2} 140 {cx+30} 157') if side == -1 else (f'M{cx+32} 140 Q{cx+2} 140 {cx-30} 157')
        out.append(f'<path d="{b}" fill="none" stroke="{C["line"]}" stroke-width="10" stroke-linecap="round"/>')
    return "".join(out)

def mouth(mood):
    if mood == "think":
        return f'<path d="M184 268 Q194 262 204 268 T224 266" fill="none" stroke="{C["line"]}" stroke-width="{W}" stroke-linecap="round"/>'
    # the satisfied smirk: flat on one side, lifted on the other, one small fang
    fang = f'<path d="M210 268 L214 280 L219 266" fill="{C["eye"]}" stroke="{C["line"]}" stroke-width="3" stroke-linejoin="round"/>'
    curve = 'M178 262 Q204 276 230 256' if mood != "listen" else 'M184 264 Q204 274 224 262'
    return f'<path d="{curve}" fill="none" stroke="{C["line"]}" stroke-width="{W}" stroke-linecap="round"/>' + fang + \
           f'<path d="M227 252 L233 258" stroke="{C["line"]}" stroke-width="4" stroke-linecap="round"/>'

def ear(side, perk=False):
    pts = "M70 170 C42 158 20 146 4 132 C10 172 32 214 72 230 Z"
    inner = "M64 184 C46 176 32 166 20 154 C28 180 44 204 66 216 Z"
    if perk:
        pts = "M70 166 C44 146 26 122 16 96 C10 146 30 206 72 228 Z"
        inner = "M64 180 C48 164 34 144 26 122 C26 160 42 196 66 212 Z"
    g = P(pts, C["skin"]) + P(inner, C["skin2"], stroke=False)
    return g if side == -1 else f'<g transform="translate(400 0) scale(-1 1)">{g}</g>'

def horn(side):
    d = "M146 100 C138 76 140 52 154 32 C160 52 170 70 178 92 Z"
    tip = "M150 52 C151 44 152 38 154 32 C157 40 160 46 162 52 C158 50 154 50 150 52 Z"
    g = P(d, C["horn"]) + P(tip, C["horn2"], stroke=False) + \
        f'<path d="M147 80 Q160 76 171 80" fill="none" stroke="{C["horn2"]}" stroke-width="3" stroke-linecap="round"/>'
    return g if side == -1 else f'<g transform="translate(400 0) scale(-1 1)">{g}</g>'

HEAD = "M200 70 C300 68 348 128 342 202 C336 268 284 314 200 316 C116 314 64 268 58 202 C52 128 100 68 200 70 Z"

def tools():
    t = []
    # camera on the left panel, strap over the shoulder
    t.append(f'<path d="M166 312 Q172 336 168 350" fill="none" stroke="{C["tool"]}" stroke-width="4"/>')
    t.append(f'<rect x="146" y="346" width="40" height="28" rx="6" fill="{C["tool"]}" stroke="{C["line"]}" stroke-width="3"/>')
    t.append(f'<rect x="152" y="341" width="12" height="7" rx="2" fill="{C["tool"]}" stroke="{C["line"]}" stroke-width="3"/>')
    t.append(f'<circle cx="168" cy="360" r="9" fill="{C["metal2"]}" stroke="{C["eye"]}" stroke-width="3"/>')
    t.append(f'<circle cx="171" cy="357" r="2.5" fill="{C["eye"]}"/>')
    # right pocket holding a caliper and a pencil
    t.append(f'<path d="M236 300 L236 372" stroke="{C["metal"]}" stroke-width="7" stroke-linecap="square"/>')
    t.append(f'<path d="M236 300 L236 372" stroke="{C["line"]}" stroke-width="2" stroke-dasharray="1 6"/>')
    t.append(f'<path d="M229 302 L252 302 L252 310 L240 316 L229 316 Z" fill="{C["metal"]}" stroke="{C["line"]}" stroke-width="3" stroke-linejoin="round"/>')
    t.append(f'<path d="M229 324 L250 324 L250 330 L240 336 L229 334 Z" fill="{C["metal2"]}" stroke="{C["line"]}" stroke-width="3" stroke-linejoin="round"/>')
    t.append(f'<path d="M222 318 L222 372" stroke="{C["blush"]}" stroke-width="7" stroke-linecap="round"/>')
    t.append(f'<path d="M222 312 L222 318" stroke="{C["horn"]}" stroke-width="7" stroke-linecap="round"/>')
    t.append(P("M214 360 L258 360 L256 396 Q236 402 216 396 Z", C["vest2"]))
    t.append(f'<path d="M218 368 L254 368" stroke="{C["vest"]}" stroke-width="2" stroke-dasharray="4 4"/>')
    return "".join(t)

def body():
    b = []
    # tail, behind everything
    b.append(f'<path d="M252 430 C296 442 318 418 320 392" fill="none" stroke="{C["line"]}" stroke-width="{10+2*W}" stroke-linecap="round"/>')
    b.append(f'<path d="M252 430 C296 442 318 418 320 392" fill="none" stroke="{C["skin"]}" stroke-width="10" stroke-linecap="round"/>')
    b.append(P("M320 368 L332 396 L308 394 Z", C["skin2"]))
    # legs and feet
    b += [limb("M174 440 L172 474", 24, C["skin"]), limb("M226 440 L228 474", 24, C["skin"])]
    b.append(P("M146 488 C146 470 192 468 196 486 C196 496 148 498 146 488 Z", C["skin"]))
    b.append(P("M254 488 C254 470 208 468 204 486 C204 496 252 498 254 488 Z", C["skin"]))
    # torso: bare belly in the middle
    b.append(P("M146 300 C136 344 134 392 150 432 L250 432 C266 392 264 344 254 300 Z", C["skin"]))
    b.append(P("M176 330 C170 360 172 400 184 420 L216 420 C228 400 230 360 224 330 Z", C["belly"], stroke=False))
    # shorts
    b.append(P("M148 418 L252 418 L256 452 L208 454 L200 440 L192 454 L144 452 Z", C["shorts"]))
    # vest: two open panels with a stitched hem
    b.append(P("M146 300 C136 344 134 392 150 426 L186 426 C180 384 178 340 190 300 Z", C["vest"]))
    b.append(P("M254 300 C264 344 266 392 250 426 L214 426 C220 384 222 340 210 300 Z", C["vest"]))
    b.append(f'<path d="M152 418 L182 418 M248 418 L218 418" stroke="{C["vest2"]}" stroke-width="3" stroke-dasharray="5 4"/>')
    b.append(tools())
    return "".join(b)

def arms_layer(arms):
    b = []
    if arms == "brush":      # left hand holds a microphone low, right hand rests a brush on the shoulder
        b.append(limb("M152 318 Q122 352 118 392", 24, C["skin"]))
        b.append(f'<rect x="96" y="372" width="18" height="44" rx="8" transform="rotate(-18 105 394)" fill="{C["tool"]}" stroke="{C["line"]}" stroke-width="3"/>')
        b.append(f'<circle cx="100" cy="366" r="14" fill="{C["metal"]}" stroke="{C["line"]}" stroke-width="{W}"/>')
        b.append(f'<path d="M90 362 L110 362 M92 370 L108 370" stroke="{C["metal2"]}" stroke-width="2.5"/>')
        b.append(P("M104 384 C104 374 128 374 130 386 C130 398 106 400 104 390 Z", C["skin"]))
        b.append(limb("M248 318 Q300 340 322 300", 24, C["skin"]))
        b.append(f'<path d="M312 326 L366 232" stroke="{C["line"]}" stroke-width="{9+2*W}" stroke-linecap="round"/>')
        b.append(f'<path d="M312 326 L366 232" stroke="{C["blush"]}" stroke-width="9" stroke-linecap="round"/>')
        b.append(P("M360 242 L372 218 L380 224 L368 248 Z", C["metal"]))
        b.append(P("M372 218 C374 204 384 196 394 194 C394 206 388 218 380 224 Z", C["vest2"]))
        b.append(P("M310 300 C310 288 334 286 336 298 C338 312 312 314 310 304 Z", C["skin"]))
    else:                    # thinking: hand under the chin, other arm across the belly
        b.append(limb("M248 318 Q270 360 234 380", 24, C["skin"]))
        b.append(P("M224 372 C224 362 246 362 248 374 C248 386 226 388 224 378 Z", C["skin"]))
        b.append(limb("M152 330 Q118 330 168 296", 22, C["skin"]))
        b.append(P("M160 296 C158 282 184 278 188 290 C190 304 164 308 160 300 Z", C["skin"]))
    return "".join(b)

def diw(mood="proud", arms="brush", animate=True):
    css = ""
    if animate:
        css = ("<style>"
               ".bob{animation:bob 4.8s cubic-bezier(.45,0,.55,1) infinite}"
               "@keyframes bob{50%{transform:translateY(-4px)}}"
               ".eye{animation:blink 5.2s infinite}"
               "@keyframes blink{0%,94%,100%{transform:scaleY(1)}96%{transform:scaleY(.08)}}"
               "@media (prefers-reduced-motion:reduce){.bob,.eye{animation:none}}"
               "</style>")
    head = (horn(-1) + horn(1) + ear(-1, perk=(mood == "listen")) + ear(1, perk=(mood == "listen")) +
            P(HEAD, C["skin"]) +
            # cranium shade: the big thinking head gets one soft shadow band low on the face
            P("M70 236 C90 290 140 312 200 314 C260 312 310 290 330 236 C300 280 250 298 200 298 C150 298 100 280 70 236 Z", C["skin2"], stroke=False) +
            f'<ellipse cx="128" cy="250" rx="18" ry="10" fill="{C["blush"]}" opacity=".45"/>'
            f'<ellipse cx="272" cy="250" rx="18" ry="10" fill="{C["blush"]}" opacity=".45"/>' +
            f'<path d="M193 230 Q200 238 207 230" fill="none" stroke="{C["line"]}" stroke-width="4" stroke-linecap="round"/>' +
            eyes(mood) + mouth(mood))
    label = {"proud": "Diw, arms full of tools, frowning the way you do at a job well done",
             "think": "Diw, hand under the chin, thinking it through",
             "listen": "Diw with ears up, listening",
             "done": "Diw, eyes shut, pleased with the finished work"}[mood]
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-24 14 448 498" role="img" aria-label="{label}">{css}'
            f'<ellipse cx="200" cy="494" rx="96" ry="10" fill="{C["line"]}" opacity=".12"/>'
            f'<g class="bob">{body()}{head}{arms_layer(arms)}</g></svg>')

if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    for name, mood, arms in [("proud", "proud", "brush"), ("think", "think", "chin"),
                             ("listen", "listen", "brush"), ("done", "done", "brush")]:
        open(os.path.join(here, f"diw-{name}.svg"), "w").write(diw(mood, arms))
    print("ok")
