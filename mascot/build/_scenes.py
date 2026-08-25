"""The twelve scenes, in one place.

Both the prompt writer (`gen_prompts.py`) and the animation builder (`make.py`) read this
file, so a scene is described exactly once and the prompts can never drift from the rig.
"""

# Loop lengths deliberately differ so a page showing several at once never pulses in unison.
# Each is a whole number of frames at 30fps and every sub-cycle divides into it evenly.
FPS = 30

SCENES = [
    dict(
        num=1, slug="writing", title="Writing", rig="desk", loop=4.0,
        outfit="a brown tweed waistcoat",
        scene="He sits at a wooden desk, hunched over a sheet of paper, writing with a "
              "quill. A tall untidy stack of paper sits to his right, an inkpot and a "
              "closed green book to his left.",
        background="A wooden desk running across the bottom of the frame. Behind it, a "
                   "loosely sketched bookshelf full of books. On the desk: an inkpot, a "
                   "closed book, and a tall stack of loose paper on the right.",
        expression="heavy-lidded eyes and a flat, concentrating mouth",
        gaze="Both eyes look downward, as if at something on a desk below.",
        arm=("right", "loosely holding a long feather quill pen, forearm resting on a desk"),
        props=[("quill", "long feather quill pen", "the side"),
               ("sheet", "single sheet of paper with a few short wavy squiggle lines of "
                          "handwriting on it, no real letters", "slightly above")],
        bubbles=[("right", "a feather quill crossed over a small stack of three books")],
        motion=[
            "The quill arm rocks through a short scribbling arc, five times per loop.",
            "Squiggle lines appear on the sheet one after another, then reset at the loop.",
            "Two or three tiny ink dots flick off the nib and fade.",
            "The bubble drifts up and down; the quill icon inside rocks against it.",
        ],
        usage="script and rewrite jobs (`step-rewrite`), any long text generation",
    ),
    dict(
        num=2, slug="editing", title="Editing", rig="desk", loop=3.6,
        outfit="a slate-blue cardigan",
        scene="He sits at a desk with FOUR arms instead of two, each doing a different job "
              "at once: one holds a red correcting pen, one a stylus over a tablet, one "
              "holds up a proof sheet, one reaches for a mug. He looks entirely unbothered "
              "by having four arms.",
        background="A wooden desk running across the bottom of the frame. On it, a flat "
                   "tablet, a marked-up proof sheet, a mug, and scattered pens. A pale "
                   "sketched bookshelf behind.",
        expression="heavy-lidded eyes and a slightly pressed, patient mouth",
        gaze="Both eyes look down and slightly left.",
        arm=("upper right", "holding a red correcting pen"),
        props=[("pen", "red correcting pen", "the side"),
               ("stylus", "thin stylus", "the side"),
               ("proof", "sheet of paper covered in wavy squiggle lines and small red "
                          "correction marks, no real letters", "slightly above"),
               ("mug", "chipped ceramic mug", "the side")],
        bubbles=[("left", "a small checklist card bearing one green tick and one red cross, "
                          "and no writing at all")],
        motion=[
            "All four arms work at once, each on its own offset phase so they never sync.",
            "The tablet glows faintly brighter and dimmer.",
            "Red correction marks appear on the proof sheet one by one.",
            "The tick and cross in the bubble alternate which one is brighter.",
        ],
        usage="subtitle and edit jobs (`subtitle`), any review-and-correct step",
    ),
    dict(
        num=3, slug="illustrating", title="Illustrating", rig="standing", loop=4.0,
        outfit="a grey canvas work apron with paint smudges",
        scene="He stands at a wooden easel, turned three-quarters toward it, painting a "
              "creature onto the canvas with a brush. A jar of brushes stands beside him.",
        background="A plain cream ground with a soft shadow area, and a loosely sketched "
                   "bookshelf far behind. A jar of brushes standing on the floor to one side.",
        expression="heavy-lidded eyes and a small, absorbed pursed mouth",
        gaze="Both eyes look up and to the left, toward a canvas.",
        arm=("right", "raised, holding a paintbrush up toward a canvas"),
        props=[("brush", "paintbrush with a wooden handle", "the side"),
               ("easel", "simple wooden A-frame easel holding a blank canvas", "the front"),
               ("canvas-art", "loose sketch of a small friendly creature, drawn in pencil "
                              "with a few patches of colour, floating on its own", "the front")],
        bubbles=[("right", "a small friendly creature drawn in three or four loose pencil "
                           "lines, like a quick idea sketch")],
        motion=[
            "The brush arm makes long painting strokes across the canvas.",
            "The sketch on the canvas fades in progressively as the strokes land.",
            "The easel takes a tiny shove on each firm stroke.",
            "The idea sketch in the bubble redraws itself line by line.",
        ],
        usage="image generation (`infographic`), banner and illustration jobs",
    ),
    dict(
        num=4, slug="brainstorming", title="Brainstorming", rig="standing", loop=3.6,
        outfit="a terracotta cardigan",
        scene="He stands with one hand raised to his temple, index finger tapping his head, "
              "thinking hard. A whiteboard covered in faint squiggles and arrows stands "
              "behind him.",
        background="A plain cream ground with a soft shadow area. A large whiteboard on a "
                   "stand behind, covered in faint grey squiggles, arrows and circles that "
                   "are clearly not real writing.",
        expression="one eyebrow ridge raised, eyes heavy-lidded and unfocused, mouth pushed "
                   "to one side in thought",
        gaze="Both eyes look up and to the right, unfocused, as if thinking.",
        arm=("right", "bent up so the index finger touches the side of the head"),
        props=[("bulb", "round old-fashioned lightbulb with a curly filament", "the front"),
               ("swirl", "loose spiral of pencil line, like a thought curling", "the front")],
        bubbles=[("right", "a round old-fashioned lightbulb")],
        motion=[
            "The finger taps the temple twice, pauses, taps again.",
            "The lightbulb flickers, catches, and glows steady, then resets.",
            "The thought spiral rotates slowly and continuously.",
            "A rare, slow blink — he is concentrating, not sleeping.",
        ],
        usage="Topics, suggestions, and the direction wizard in the brain module",
    ),
    dict(
        num=5, slug="pitching", title="Pitching", rig="standing", loop=4.0,
        outfit="a tan waistcoat",
        scene="He stands facing the viewer, holding up a storyboard sheet in one hand and "
              "pointing at it with a pencil in the other, presenting an idea. A larger "
              "storyboard poster hangs on the wall behind him.",
        background="A plain cream ground with a soft shadow area. A large storyboard poster "
                   "pinned to the wall behind, drawn as a faint grey grid of empty panels "
                   "with squiggle marks inside.",
        expression="heavy-lidded eyes and a small hopeful half-smile",
        gaze="Both eyes look forward at the viewer, then slightly toward one hand.",
        arm=("right", "extended outward holding a pencil like a pointer"),
        props=[("pencil", "yellow pencil", "the side"),
               ("board", "small storyboard sheet: a two-by-two grid of empty panels with "
                         "loose squiggle marks inside, no real writing", "slightly above")],
        bubbles=[("right", "a small two-by-two storyboard grid with loose squiggle marks "
                           "inside the panels")],
        motion=[
            "The pointing arm sweeps across the held board and back.",
            "The held board tilts gently as he presents it.",
            "His weight shifts from foot to foot — the whole body leans a degree or two.",
            "Panels in the bubble light up one at a time as he points.",
        ],
        usage="strategy and pitch views, anything presenting a proposed direction",
    ),
    dict(
        num=6, slug="layout-design", title="Layout Design", rig="desk", loop=3.6,
        outfit="a navy waistcoat with a dark bow tie",
        scene="He leans over a drafting table, sliding a long ruler across a page layout "
              "with one hand and marking it with a pencil in the other. Rulers and a "
              "T-square lie across the table.",
        background="A large drafting table running across the bottom of the frame, with "
                   "loose page layouts on it: rectangles, columns of squiggle lines and "
                   "crossed-out image boxes. A T-square and a long ruler lying flat. Faint "
                   "sketched wireframe pages pinned on the wall behind.",
        expression="heavy-lidded eyes narrowed in precision, mouth a small firm line",
        gaze="Both eyes look down at a table surface.",
        arm=("right", "holding a pencil down against a page on a table"),
        props=[("ruler", "long flat ruler", "slightly above"),
               ("layout", "page layout sheet: a rectangle divided into columns of squiggle "
                          "lines and one crossed-out image box, no real writing",
                "slightly above")],
        bubbles=[("right", "a single page layout icon: a rectangle divided into two columns "
                           "with a crossed-out image box at the top")],
        motion=[
            "The ruler slides across the layout and settles.",
            "Grid lines snap into place on the page one at a time, in rhythm.",
            "The pencil hand taps a mark at the end of each slide.",
            "The layout icon in the bubble redraws its columns as the grid lands.",
        ],
        usage="templates and the photo editor, any layout or composition step",
    ),
    dict(
        num=7, slug="coloring", title="Coloring", rig="desk", loop=4.0,
        outfit="a teal smock dotted with paint spots",
        scene="He sits at a table, dipping a brush into a paint palette and dabbing colour "
              "onto a half-finished drawing. A cup of coloured pencils stands beside him "
              "and loose pencils lie across the table.",
        background="A wooden table running across the bottom of the frame. On it: a round "
                   "paint palette with wells of colour, a cup of coloured pencils, and "
                   "several loose pencils lying scattered. A pale sketched bookshelf behind.",
        expression="heavy-lidded eyes and a faint contented half-smile",
        gaze="Both eyes look down at a table surface.",
        arm=("right", "holding a paintbrush pointed down toward a table"),
        props=[("brush", "paintbrush with a wooden handle", "the side"),
               ("palette", "round wooden paint palette with six wells of different colour",
                "slightly above"),
               ("drawing", "sheet of paper with a loose half-coloured drawing of a small "
                           "creature on it", "slightly above")],
        bubbles=[("right", "a row of six coloured pencils standing side by side")],
        motion=[
            "The brush dips into the palette, then dabs the page, then returns.",
            "A bloom of colour spreads outward on the drawing with each dab.",
            "The pencils in the bubble bounce in a staggered row, like a wave.",
            "The palette rocks very slightly on the table when the brush lands.",
        ],
        usage="visual studio and banner rendering, any colour or styling pass",
    ),
    dict(
        num=8, slug="submitting", title="Submitting", rig="standing", loop=3.2,
        outfit="a mustard-yellow knitted vest",
        scene="He stands facing the viewer, holding up a thick bundle of finished "
              "newspapers in one hand and giving an enthusiastic thumbs-up with the other. "
              "This is the one pose where he is genuinely, openly delighted — wide grin, "
              "eyes actually open.",
        background="A plain cream ground with a soft shadow area, and nothing else.",
        expression="a wide open grin showing both tusks, and eyes that are OPEN and bright "
                   "for once — this is the single scene where the droopy lids lift",
        gaze="Both eyes look straight at the viewer, open wide and cheerful.",
        arm=("right", "raised with the thumb up in an enthusiastic thumbs-up"),
        props=[("papers", "thick bundle of folded newspapers tied with a paper band, the "
                          "print shown only as fine squiggle lines", "the side")],
        bubbles=[("left", "a single five-pointed star"),
                 ("right", "a small trophy cup")],
        motion=[
            "The thumbs-up pumps upward twice, with a proud little overshoot.",
            "The bundle of papers riffles at its edge.",
            "The trophy bubble pops in with a bounce and shines.",
            "The star bubble spins once and settles.",
            "No blink — he is too pleased to blink.",
        ],
        usage="publish and post-success states, completed jobs",
    ),
    dict(
        num=9, slug="final-review", title="Final Review", rig="desk", loop=4.0,
        outfit="a brown tweed waistcoat",
        scene="He sits at a desk holding a magnifying glass over a large world map, "
              "checking it closely. A checklist and loose papers lie beside the map.",
        background="A wooden desk running across the bottom of the frame. On it: a large "
                   "world map drawn loosely in pale grey and blue, a checklist sheet, and "
                   "scattered loose papers. A faint sketched bookshelf behind.",
        expression="heavy-lidded eyes narrowed in suspicion, mouth pulled down at one corner",
        gaze="Both eyes look down and slightly right, scrutinising.",
        arm=("right", "holding a round magnifying glass by its handle, down over a desk"),
        props=[("magnifier", "round magnifying glass with a wooden handle and a clear lens",
                "slightly above"),
               ("map", "loose hand-drawn world map in pale grey and blue, no labels of any "
                       "kind", "the front"),
               ("checklist", "checklist sheet with four short squiggle lines and empty tick "
                             "boxes beside them", "slightly above")],
        bubbles=[("right", "a round magnifying glass")],
        motion=[
            "The magnifier glides across the map in a slow searching sweep.",
            "A glint travels across the lens each time it changes direction.",
            "Tick boxes on the checklist fill in one by one.",
            "A slow, sceptical blink at the top of each sweep.",
        ],
        usage="review queues, pre-publish checks",
    ),
    dict(
        num=10, slug="correcting-proofs", title="Correcting Proofs", rig="desk", loop=3.6,
        outfit="a dusty plum cardigan",
        scene="He sits at a desk holding up a proof page covered in red correction marks, "
              "shaking his head at it. A large red cross floats beside him.",
        background="A wooden desk running across the bottom of the frame, with marked-up "
                   "proof pages scattered on it and a red pen lying across them. A faint "
                   "sketched bookshelf behind.",
        expression="heavy-lidded eyes and a distinctly unimpressed downturned mouth",
        gaze="Both eyes look forward and slightly down, thoroughly unimpressed.",
        arm=("left", "holding up a sheet of paper at chest height"),
        props=[("proof", "sheet of paper covered in wavy squiggle lines with several red "
                         "correction marks and circles over them, no real letters",
                "slightly above"),
               ("cross", "bold red hand-drawn cross mark", "the front")],
        bubbles=[("left", "a bold red cross mark"),
                 ("right", "a green tick mark")],
        motion=[
            "His head shakes slowly from side to side — no, no, no.",
            "The red cross stamps in hard, then shudders and settles.",
            "The held proof page trembles slightly with the head shake.",
            "The green tick in the second bubble waits, dim, and never quite arrives.",
        ],
        usage="error and retry states, validation failures",
    ),
    dict(
        num=11, slug="approval", title="Approval", rig="desk", loop=3.6,
        outfit="a teal waistcoat with a dark plum tie",
        scene="He sits at a desk signing a document with a fountain pen, a wooden rubber "
              "stamp resting beside him and a fresh red stamp mark already on the page. He "
              "permits himself a very small satisfied smile.",
        background="A wooden desk running across the bottom of the frame. On it: a wooden "
                   "rubber stamp standing on its handle, a pen lying flat, and a document. "
                   "A faint sketched bookshelf behind.",
        expression="heavy-lidded eyes and a small, private, satisfied smile",
        gaze="Both eyes look down at a document below.",
        arm=("right", "holding a fountain pen down against a document on a desk"),
        props=[("pen", "fountain pen with a dark barrel", "the side"),
               ("stamp", "wooden rubber stamp with a round handle", "the side"),
               ("signature", "single looping handwritten flourish, like a signature, with "
                             "no readable letters", "the front"),
               ("document", "sheet of paper with a few squiggle lines and a red rectangular "
                            "stamp mark on it, no real letters", "slightly above")],
        bubbles=[("left", "a round award medal with a ribbon"),
                 ("right", "a green tick mark")],
        motion=[
            "The pen draws a looping signature flourish across the page, stroke by stroke.",
            "The stamp lifts and thuds down, and the page jumps a little on impact.",
            "The medal in the bubble catches a slow travelling shine.",
            "The tick brightens once the signature completes.",
        ],
        usage="approved and done states, successful completion",
    ),
    dict(
        num=12, slug="print-check", title="Print Check", rig="desk", loop=3.2,
        outfit="a plum cardigan",
        scene="He stands behind a desk holding a printed sheet, staring in alarm at a "
              "dangerously leaning tower of stacked books and paper about to topple. This "
              "is the one scene where his eyes are wide with alarm rather than droopy.",
        background="A wooden desk running across the bottom of the frame. On the left, a "
                   "tall precarious tower of stacked books and paper reams leaning "
                   "alarmingly. A faint sketched bookshelf behind.",
        expression="eyes WIDE OPEN in alarm — the droopy lids are fully raised here — brows "
                   "up, mouth open in a small dismayed oval",
        gaze="Both eyes wide open, looking up and to the left in alarm.",
        arm=("right", "holding a single printed sheet out at arm's length"),
        props=[("sheet", "printed sheet of paper with wavy squiggle lines and one smudged "
                         "ink blot on it", "slightly above"),
               ("tower", "tall precarious tower of stacked books and paper reams, leaning "
                         "to one side", "the front"),
               ("sweat", "single cartoon sweat droplet", "the front")],
        bubbles=[("right", "a bold red cross mark")],
        motion=[
            "The book tower sways further and further, always about to fall, never falling.",
            "A sweat droplet forms at his temple, swells, and slides away.",
            "The red cross in the bubble blinks on and off like a warning light.",
            "His eyes widen a little further on each sway.",
        ],
        usage="failure and overload states, export and render errors",
    ),
]

BY_SLUG = {s["slug"]: s for s in SCENES}

def frames(scene):
    """Loop length in frames. Every loop is a whole number of frames at 30fps."""
    return int(round(scene["loop"] * FPS))
