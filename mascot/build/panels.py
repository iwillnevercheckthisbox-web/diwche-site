"""Per-panel geometry — the only thing that differs between the twelve cuts.

Coordinates are in each panel's own pixel space, measured off the drawing. Note the three
rows of the contact sheet are not the same height: 168, 150 and 129 rows top to bottom, so a
"y" means something different depending on which row a panel came from.

Each entry says four things at most:

    bottom      the line to cut along — the desk, the table, the ground he stands on.
                Traced under his forearms so his hands survive the cut.
    jaw         (jaw_y, neck_x0, neck_x1) — where the head ends, so it can drift on its own.
    drop        boxes for props he is near but not part of: a pencil cup, a rubber stamp,
                a tower of books. Colour cannot separate these from his clothing.
    chair       a box to search for upholstery, which runs redder than anything he wears.
    eyes        only where the automatic finder gets it wrong.
"""

PANELS = [
    dict(num=1, slug="writing",
         bottom=[(0, 130), (58, 136), (84, 144), (112, 150), (142, 148), (176, 142), (243, 133)],
         jaw=(112, 96, 130),
         chair=(40, 78, 80, 128)),

    dict(num=2, slug="editing",
         bottom=[(0, 152), (90, 156), (150, 156), (243, 150)],
         jaw=(100, 95, 135),
         drop=[(200, 120, 243, 168)]),                 # the red book on the desk

    dict(num=3, slug="illustrating",
         bottom=[(0, 160), (243, 160)],
         jaw=(96, 120, 158),
         # His apron is grey, which is the colour this cutter otherwise treats as scenery, so
         # the test has to be loosened here or he loses his body.
         sat=0.06,
         # The easel stays: he is leaning on it and drawing on it, so cutting it away leaves a
         # hand pressing on nothing. Only the furniture he is not touching goes.
         drop=[(0, 128, 100, 168),                     # the side table
               (40, 96, 88, 146)],                     # the jar of brushes
         eyes=[(122, 69, 143, 88)]),                   # turned away; only one eye shows

    dict(num=4, slug="brainstorming",
         bottom=[(0, 164), (243, 164)],
         jaw=(115, 100, 140),
         drop=[(178, 110, 228, 134)],                  # the whiteboard tray
         # No blink: his skin is nearly as pale as his eye-whites, so a painted lid reads as
         # a patch rather than an eyelid. He is staring into the middle distance anyway.
         blink=False,
         # His bubble overlaps the whiteboard frame, so connectivity cannot find it.
         bubbles=[(174, 0, 243, 82)]),

    dict(num=5, slug="pitching",
         bottom=[(0, 149), (243, 149)],       # standing; only the ground shadow to lose
         jaw=(95, 100, 130)),

    dict(num=6, slug="layout-design",
         bottom=[(0, 118), (70, 124), (130, 126), (200, 122), (243, 116)],
         jaw=(97, 105, 140),
         drop=[(22, 88, 60, 132),                      # the jar of pencils
               (0, 24, 78, 96)]),                      # wireframe pages on the wall

    dict(num=7, slug="coloring",
         bottom=[(0, 124), (70, 128), (120, 130), (180, 126), (243, 122)],
         jaw=(100, 95, 132),
         drop=[(162, 94, 186, 142),                    # the jar of pencils
               (0, 110, 62, 148),                      # the paint palette
               (0, 40, 80, 128)],                      # the bookshelf behind
         blink=False),          # pale skin again; a painted lid does not read

    dict(num=8, slug="submitting",
         bottom=[(0, 148), (243, 148)],
         jaw=(103, 95, 138)),

    dict(num=9, slug="final-review",
         bottom=[(0, 122), (80, 126), (140, 126), (243, 120)],
         jaw=(95, 100, 140),
         drop=[(0, 38, 78, 83)]),                      # the world map on the wall

    dict(num=10, slug="correcting-proofs",
         bottom=[(0, 116), (80, 120), (140, 120), (243, 114)],
         jaw=(88, 105, 140)),

    dict(num=11, slug="approval",
         bottom=[(0, 118), (80, 122), (150, 122), (243, 116)],
         jaw=(88, 100, 140),
         drop=[(196, 92, 238, 129)]),                  # the rubber stamp

    dict(num=12, slug="print-check",
         bottom=[(0, 120), (100, 124), (160, 124), (243, 118)],
         jaw=(85, 105, 145),
         drop=[(0, 46, 96, 129)],                      # the tower of books
         blink=False),          # wide with alarm — and not a face that should blink
]

BY_SLUG = {p["slug"]: p for p in PANELS}
