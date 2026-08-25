# The layer recipe

Every scene is generated as a set of **separate transparent images**, not one flat picture.
This is what makes animation possible: the build script can rotate an arm without touching
the head, and cross-fade eyelids without touching anything else.

Each scene file (`01-writing.md` … `12-print-check.md`) fills in the `{...}` slots below.
Nothing else changes between scenes — same layer names, same order, same framing language.

## Generation order matters

Generate `pose` **first**. It is the reference every later layer is matched against — you
attach the generated `pose.png` alongside `../source/diwche.png` when generating the parts,
so the model has both the character design and this scene's exact pose to match. Skipping
this step is the single most common cause of layers that do not line up.

## The layers

| file | required | what it is |
|---|---|---|
| `pose.png` | yes | The whole scene, flat, on normal cream paper. Reference only — never shipped, never animated, never keyed. |
| `bg.png` | yes | Background plate, no character, no props that move. Opaque. |
| `body.png` | yes | Torso, arms-at-rest, and legs if standing. **No head.** |
| `head.png` | yes | Head, horns and face, **eyes closed-lidded blank** — the eye layers sit on top. |
| `eyes-open.png` | yes | Just the two eyes at their normal droopy-lidded rest. Tiny image. |
| `eyes-closed.png` | yes | Just the two eyes fully shut, drawn as two curved lashes. Tiny image. |
| `arm-{action}.png` | yes | The one arm that performs the scene's action, from shoulder to fingertips. |
| `prop-{name}.png` | per scene | Each object that moves independently. One file each. |
| `bubble.png` | most | The empty thought-bubble cloud outline plus its trailing circles. |
| `bubble-icon.png` | most | What floats inside the bubble. Separate so it can pop and spin on its own. |

Static objects that never move — the inkpot, the pencil cup, the bookshelf — belong in
`bg.png`. Only give something its own file if it actually animates. Every extra layer is
extra bytes and extra chances for a seam.

## The prompts

### 1. Pose (reference)

> Attach `../source/diwche.png`.
>
> ```
> Redraw this character consistently and cleanly in a single new illustration.
>
> CHARACTER: {character-bible summary — paste the "Fixed design" table's key rows}
> Skin is muted sage green. Eyes are red-brown with heavy droopy upper lids. Two tan horns
> curving up and back. Small tusks on the lower lip. Big head, short pot-bellied body.
>
> WEARING: cream dress shirt, sleeves rolled to the elbow, under {outfit}.
>
> SCENE: {framing}. {scene description}
>
> {STYLE BLOCK — variant B, but with the character present and the background included}
> ```

### 2. Background plate

> ```
> {background description}. Empty — no character anywhere in the image.
>
> {STYLE BLOCK — variant B}
> ```

### 3. Body

> Attach `pose.png`.
>
> ```
> From this illustration, redraw ONLY the character's body: torso, shoulders, both arms in a
> neutral resting position{, and legs and feet if standing}. Wearing {outfit} over a cream
> shirt with rolled sleeves.
>
> Do NOT include the head, horns or neck — the body ends at a clean flat cut across the base
> of the neck. Do not include the background, the desk, or any props.
>
> {STYLE BLOCK — variant A}
> ```

### 4. Head

> Attach `pose.png`.
>
> ```
> From this illustration, redraw ONLY the character's head and horns, facing forward with
> {expression}. Include the forehead bumps, the flat nose, the mouth and the two tusks.
>
> Leave the EYE SOCKETS EMPTY — draw the socket shape and its shading, but no eyeball, no
> iris, no pupil, no eyelid. The eyes are added as a separate layer.
>
> Include a short neck stub at the bottom so the head overlaps the body cleanly. No body, no
> shoulders, no background.
>
> {STYLE BLOCK — variant A}
> ```

### 5. Eyes, open

> Attach `head.png`.
>
> ```
> Draw ONLY the pair of eyes that belong in this head's empty sockets, sized and spaced to sit
> exactly in them. Large round eyes, off-white sclera with a warm pink-grey wash in the
> corners, red-brown iris, black pupil, and a HEAVY DROOPY UPPER EYELID covering the top third
> of each eye. {gaze}
>
> Nothing else in the image — no face, no head, no skin. Just the two eyes on flat magenta.
>
> {STYLE BLOCK — variant A}
> ```

### 6. Eyes, closed

> Attach `eyes-open.png`.
>
> ```
> Draw the same pair of eyes fully closed, at exactly the same position, size and spacing as
> the attached image. Each closed eye is a single downward-curving ink lash line with a soft
> crease above it. No sclera, no iris, no pupil visible.
>
> Nothing else in the image. Just the two closed eyes on flat magenta.
>
> {STYLE BLOCK — variant A}
> ```

### 7. Action arm

> Attach `pose.png`.
>
> ```
> From this illustration, redraw ONLY the character's {which} arm, complete from the shoulder
> joint to the fingertips, {holding what}. Cream shirt sleeve rolled to the elbow, sage green
> three-fingered hand.
>
> The shoulder end is a clean flat cut where it meets the torso. No body, no head, no
> background, nothing else the hand touches.
>
> {STYLE BLOCK — variant A}
> ```

### 8. Props

One generation per moving object:

> ```
> A single {object}, drawn on its own, seen from {angle}, at a slight three-quarter tilt.
> Nothing else in the image.
>
> {STYLE BLOCK — variant A}
> ```

### 9. Bubble and icon

> ```
> An empty thought bubble: a classic cloud outline drawn in a loose wobbly ink line, with
> three small trailing circles descending from its lower {left|right} corner in decreasing
> size. The inside of the cloud is empty and fully transparent — not white, not filled.
>
> {STYLE BLOCK — variant A}
> ```

> ```
> A single {icon}, drawn small and centred, with nothing around it. No bubble, no cloud, no
> frame.
>
> {STYLE BLOCK — variant A}
> ```

## Checking a generation before you keep it

1. **Any letters or numbers anywhere?** Reject. This is the most frequent failure.
2. **Is the magenta flat and uniform?** A gradient, a painted paper texture, or a shadow cast
   onto the background all defeat the chroma key. A subject sitting on *painted cream paper*
   instead of flat magenta cannot be recovered — regenerate it.
3. **Is there magenta bleeding onto the subject?** Look at the ink outline especially. A
   little fringing is handled by the despill pass in `import_art.py`; large magenta areas on
   the character are not.
4. **Does the skin match `#7C9A63`?** The models drift toward blue and toward saturated
   grass-green. Both are wrong.
5. **Are the eyelids heavy?** Wide-open eyes are the second most common drift.
6. **For part layers: is the cut clean**, with no fragment of a neighbouring part attached?

## How the alpha actually gets cut

`import_art.py` runs two strategies and keeps the better result:

- **Chroma key** — an HSV mask on the magenta (hue near 300°, high saturation, high value),
  dilated a couple of pixels to catch the anti-aliased fringe, then a despill pass that pulls
  the magenta cast out of edge pixels. Pure NumPy, no OpenCV needed, and it handles props,
  detached arms and thought bubbles — subjects where a single-subject matting model gets
  confused.
- **BiRefNet matting** — this repo already runs one, at `../../../bg-removal-service/app.py`
  (`POST /remove-bg`, multipart `file`, `X-API-Key` header). It is the strongest free matting
  model available and it is already containerised, so there is no reason to install a second
  copy. It is the better choice for clean single-subject silhouettes like `body` and `head`.

The importer picks per layer, defaulting to chroma key, with BiRefNet available via a flag in
the rig file.
