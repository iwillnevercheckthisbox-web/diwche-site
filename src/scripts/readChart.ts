/**
 * Every post the read ran on, drawn once.
 *
 * <h2>Why this exists</h2>
 *
 * The report used to be five cards of arithmetic drawn from two inputs — the engagement of each
 * post, and the date of each post — multiplied into different shapes and given a different
 * poetic label each. Four of them were the same finding wearing four hats, and a reader could
 * check none of them against anything. This draws the two inputs themselves. The silence, the
 * one post that travelled and the drift downwards are all visible at a glance, and every figure
 * in the sections below can be traced back to a bar the reader can count on their own grid.
 *
 * <h2>The two decisions that matter</h2>
 *
 * The height is a square root, not a count. One reel at 343 next to twenty posts at 9 flattens a
 * linear axis into a single spike above a flat line, which hides the very thing the reader came
 * for. A square root keeps the spike obviously a spike while leaving the ordinary posts legible.
 * The chart says so underneath, because a scale nobody is told about is a scale that misleads.
 *
 * The x-axis is time, never post order. Spacing twenty posts evenly across a strip is how a
 * three-week silence becomes invisible: the gap is the finding, so it has to be drawn as a gap.
 *
 * <h2>Drawn at the size it is shown (#379)</h2>
 *
 * It used to be one 720-unit drawing scaled to whatever box it landed in, so on a phone every
 * label was set at half size, and the rules meant to colour and size them were scoped styles
 * that never reached an SVG built at runtime — the month names and the gap figure came out
 * black on the dark page. Now the drawing is made at the plot's own pixel width and made again
 * when that width changes: one unit is one CSS pixel, text is the size it says at every width,
 * and every colour is set on the element itself rather than hoped for from a stylesheet.
 *
 * No library. This is a few dozen rects and two lines, and the site's CSP allows scripts from a
 * short list of CDNs — pulling a charting library across the network to draw rectangles would be
 * slower than the page it sits on.
 */

export interface TimelinePoint {
  /** Epoch milliseconds. A number every locale draws the same way. */
  at: number;
  /** Likes plus comments, or null when the page hides its like counts. */
  engagement: number | null;
  format: string;
}

/** The chart's words, from the page's copy file. */
export interface ChartWords {
  /** The longest silence, on its shaded column. `{days}` arrives in the reader's digits. */
  quiet: string;
  /** One post's figure, in the readout: `{count}`. */
  count: string;
  /** In place of a figure, for a page that hides its like counts. Also the legend's word. */
  hidden: string;
  /** One line saying what that word means, on the legend entry. "Likes hidden" on its own read
   *  as something this report had done, or failed to do; it is a choice the page's owner made on
   *  Instagram, and the count is unknown rather than zero. */
  hiddenNote: string;
  /** Format names, keyed the way the backend sends them. */
  formats: Record<'reel' | 'video' | 'carousel' | 'photo' | 'post', string>;
}

interface Options {
  locale: string;
  /** Mirrors the axis so time still runs in the reading direction. */
  rtl: boolean;
  /** Read to a screen reader in place of the picture. */
  summary: string;
  words: ChartWords;
}

const SVG = 'http://www.w3.org/2000/svg';

/** Taller on a wide screen, where a short strip reads as a smudge. */
const HEIGHT_WIDE = 190;
const HEIGHT_NARROW = 156;
const NARROW = 480;
/** The lane above the bars that the gap's label sits in, so it never crosses a bar. */
const LANE_TOP = 22;
/** The lane under the baseline for the month names. */
const LANE_BOTTOM = 24;
/** Nothing narrower reads as a bar; nothing wider reads as a block. */
const MIN_BAR = 4;
const MAX_BAR = 14;
/** A post whose likes are hidden is drawn as an outline, which needs room to be one. */
const MIN_OUTLINE = 7;
const LABEL_SIZE = 11;
/** Space kept between two month names before the later one is dropped. */
const LABEL_GAP = 10;

/**
 * A gap worth shading.
 *
 * Two weeks is the same boundary the backend judges the rhythm on, and the two must agree: a
 * page told its rhythm is broken while the chart shades nothing has contradicted itself on one
 * screen.
 */
const QUIET_DAYS = 14;
const DAY = 24 * 60 * 60 * 1000;

type Tone = 'reel' | 'carousel' | 'photo';

/** Which of the three bar colours a format takes. Format names arrive already singular. */
function toneOf(format: string): Tone {
  if (format === 'reel' || format === 'video') return 'reel';
  if (format === 'carousel') return 'carousel';
  return 'photo';
}

const TONE_FILL: Record<Tone, string> = {
  reel: 'var(--chart-reel)',
  carousel: 'var(--chart-carousel)',
  photo: 'var(--chart-photo)',
};

/**
 * The window the chart covers.
 *
 * The last ninety days when there is enough in them to be a picture of the page as it runs now,
 * and otherwise everything we were given — a page that posts monthly would otherwise be drawn as
 * an empty strip with two bars at the end.
 */
function windowFor(points: TimelinePoint[]): { from: number; to: number } {
  const now = Date.now();
  const ninety = now - 90 * DAY;
  const recent = points.filter((p) => p.at >= ninety).length;
  const oldest = Math.min(...points.map((p) => p.at));
  return { from: recent >= 8 ? ninety : oldest, to: now };
}

/** A redraw per host, so a second report on the same screen does not leave the first one listening. */
const observers = new WeakMap<HTMLElement, ResizeObserver>();

export function drawTimeline(host: HTMLElement, points: TimelinePoint[], options: Options): boolean {
  observers.get(host)?.disconnect();

  const usable = points.filter((p) => Number.isFinite(p.at));
  if (usable.length < 2) return false;

  const { from, to } = windowFor(usable);
  const inWindow = usable.filter((p) => p.at >= from).sort((a, b) => a.at - b.at);
  if (inWindow.length < 2) return false;

  // Drawn at the width it is shown at. A hidden host has no width yet, so the first real
  // drawing happens when it is shown — which the observer reports like any other resize.
  let drawnWidth = -1;
  const paint = () => {
    const width = Math.floor(host.clientWidth);
    if (width <= 0 || width === drawnWidth) return;
    drawnWidth = width;
    render(host, inWindow, from, to, width, options);
  };

  if (typeof ResizeObserver === 'function') {
    // Painted on the next frame rather than inside the callback: a drawing changes the host's
    // height, and a size change made inside the observer's own callback is what the browser
    // reports as a ResizeObserver loop.
    const observer = new ResizeObserver(() => requestAnimationFrame(paint));
    observer.observe(host);
    observers.set(host, observer);
  }
  paint();
  return true;
}

function render(
  host: HTMLElement,
  posts: TimelinePoint[],
  from: number,
  to: number,
  width: number,
  options: Options
) {
  const { words, locale, rtl } = options;
  const height = width < NARROW ? HEIGHT_NARROW : HEIGHT_WIDE;
  const floor = height - LANE_BOTTOM;
  const plot = floor - LANE_TOP;
  const span = Math.max(1, to - from);
  const tallest = Math.max(1, ...posts.map((p) => p.engagement ?? 0));

  // Wide enough to see, narrow enough not to overlap its neighbour at this density.
  const bar = Math.max(MIN_BAR, Math.min(MAX_BAR, (width / posts.length) * 0.55));
  const edge = Math.max(bar, MIN_OUTLINE) / 2 + 1;
  const x = (at: number) => {
    const along = edge + ((at - from) / span) * (width - 2 * edge);
    return rtl ? width - along : along;
  };
  // Square root, so one post that travelled does not flatten the twenty beside it.
  const barHeight = (value: number) => Math.max(3, Math.sqrt(value / tallest) * plot);

  host.textContent = '';
  host.classList.add('chart__canvas');

  const svg = el('svg', {
    viewBox: `0 0 ${width} ${height}`,
    width: String(width),
    height: String(height),
    // Uniform, always. The drawing is already the size of its box; if the box ever disagrees
    // for a frame, the chart shrinks whole rather than squashing its text.
    preserveAspectRatio: 'xMidYMid meet',
    role: 'img',
    'aria-label': options.summary,
    tabindex: '0',
    class: 'chart__svg',
  });
  host.append(svg);

  // ---- The longest silence, behind everything, with its length written on it -----------------
  let gapFrom = 0;
  let gapTo = 0;
  for (let i = 1; i < posts.length; i++) {
    if (posts[i].at - posts[i - 1].at > gapTo - gapFrom) {
      gapFrom = posts[i - 1].at;
      gapTo = posts[i].at;
    }
  }
  const gapDays = Math.round((gapTo - gapFrom) / DAY);
  if (gapDays >= QUIET_DAYS) {
    // Between the two bars that bound it, not under them.
    const a = x(gapFrom);
    const b = x(gapTo);
    const left = Math.min(a, b) + bar / 2 + 1;
    const right = Math.max(a, b) - bar / 2 - 1;
    if (right > left) {
      svg.append(
        el('rect', {
          x: fix(left),
          // Starts at the top of the PLOT, not of the drawing, so its label sits above it rather
          // than inside it and the band stops competing with the bars for the reader's eye.
          y: String(LANE_TOP),
          width: fix(right - left),
          height: String(floor - LANE_TOP),
          fill: 'var(--chart-quiet)',
          // Lighter than it was, and the gridlines drawn after it cross it: a solid slab taller
          // than every bar read as the biggest bar on the chart rather than as empty time.
          'fill-opacity': '0.55',
          rx: '3',
        })
      );
      // The number in the reader's own digits, and a unit they can check: days.
      const days = new Intl.NumberFormat(locale).format(gapDays);
      const label = text(fill(words.quiet, { days }), {
        x: fix((left + right) / 2),
        y: String(LANE_TOP - 8),
        'text-anchor': 'middle',
        'font-weight': '600',
        fill: 'var(--ink-2)',
        class: 'chart__gap',
      });
      svg.append(label);
      clampInside(label, width);
    }
  }

  // ---- The value axis: what a height actually MEANS (#379, round 2) ---------------------------
  //
  // The chart had no numbers on it anywhere. A reader could see that one post towered over the
  // rest and could not tell whether the tower was fifty or three hundred and fifty, which is the
  // first thing anyone wants to know — "the labels and values are easy to understand" was the
  // retest, and there were no values to understand.
  //
  // The ticks are chosen by where they LAND, not by round arithmetic on the values: on a square
  // root scale evenly-spaced values bunch up at the top, so three heights are picked first
  // (35 %, 65 % and 100 % of the plot) and each is turned back into the value that sits there,
  // rounded to something a person would say. The top one is the real peak, unrounded, because
  // that post is the finding.
  //
  // Drawn across the full width and OVER the quiet band, which is also what stops that band
  // reading as an enormous bar: once three lines cross it, it is visibly behind the chart.
  const ticks = valueTicks(tallest);
  // Drawn with the gridlines, appended after the bars: on a phone the leftmost bar sits under the
  // leading edge, and a label printed before it came out half-covered ("20" reading as "2").
  const tickLabels: SVGTextElement[] = [];
  for (const value of ticks) {
    const y = floor - barHeight(value);
    svg.append(
      el('line', {
        x1: '0',
        y1: fix(y),
        x2: String(width),
        y2: fix(y),
        stroke: 'var(--chart-axis)',
        'stroke-width': '1',
        'stroke-opacity': '0.35',
        'stroke-dasharray': '2 4',
      })
    );
    // Sitting just above its own line at the leading edge, so the plot keeps its full width
    // instead of giving up a gutter to an axis column.
    tickLabels.push(
      text(new Intl.NumberFormat(locale).format(value), {
        x: rtl ? String(width - 2) : '2',
        y: fix(y - 3),
        'text-anchor': rtl ? 'end' : 'start',
        'font-size': '10',
        fill: 'var(--ink-3)',
        // A halo of the card's own background, so the number stays readable where a bar runs
        // underneath it. paint-order puts the stroke behind the glyph rather than over it.
        stroke: 'var(--paper-2)',
        'stroke-width': '3',
        'stroke-linejoin': 'round',
        'paint-order': 'stroke fill',
        class: 'chart__tick',
      })
    );
  }

  // ---- The baseline ---------------------------------------------------------------------------
  svg.append(
    el('line', {
      x1: '0',
      y1: String(floor + 0.5),
      x2: String(width),
      y2: String(floor + 0.5),
      stroke: 'var(--chart-axis)',
      'stroke-width': '1',
    })
  );

  // ---- Months: the reader's own calendar, each name centred under its own stretch of time ------
  drawMonths(svg, from, to, width, floor, x, locale);

  // ---- One mark per post ----------------------------------------------------------------------
  const marks: { post: TimelinePoint; cx: number; node: SVGGraphicsElement }[] = [];
  const tones = new Set<Tone>();
  let anyHidden = false;
  for (const post of posts) {
    const cx = x(post.at);
    let node: SVGGraphicsElement;
    if (post.engagement == null) {
      // Hidden likes are unknown, never zero. An outline at a fixed low height, so the post is
      // visibly there and visibly not counted — reading it as a zero is what made a busy page
      // look like one nobody answers. Solid and in text ink rather than a dotted hairline in the
      // axis colour, which on the dark page was a smudge you had to be told about.
      anyHidden = true;
      const w = Math.max(bar, MIN_OUTLINE);
      // Deliberately short and at the baseline: tall enough to see, low enough that nobody reads
      // a number off it. With a value axis on the chart now, a mid-height outline would look like
      // a post sitting on one of the gridlines.
      const h = Math.max(10, plot * 0.12);
      node = el('rect', {
        x: fix(cx - w / 2 + 0.75),
        y: fix(floor - h + 0.75),
        width: fix(w - 1.5),
        height: fix(h - 1.5),
        rx: '2',
        fill: 'none',
        stroke: 'var(--ink-2)',
        'stroke-width': '1.5',
        'data-hidden-likes': '',
      });
    } else {
      const tone = toneOf(post.format);
      tones.add(tone);
      node = el('path', {
        d: column(cx - bar / 2, floor, bar, barHeight(post.engagement)),
        fill: TONE_FILL[tone],
      });
    }
    node.setAttribute('data-post', '');
    node.setAttribute('class', 'chart__mark');
    svg.append(node);
    marks.push({ post, cx, node });
  }

  // The axis numbers go on last, over the bars — see tickLabels above.
  for (const label of tickLabels) svg.append(label);

  // ---- The readout: what a bar is, on hover, touch or the arrow keys ---------------------------
  const tip = document.createElement('div');
  tip.className = 'chart__tip';
  tip.hidden = true;
  tip.setAttribute('aria-live', 'polite');
  const tipValue = document.createElement('strong');
  const tipMeta = document.createElement('span');
  tip.append(tipValue, tipMeta);
  host.append(tip);

  const dates = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  const counts = new Intl.NumberFormat(locale);
  const visual = [...marks].sort((a, b) => a.cx - b.cx);
  let active = -1;

  const show = (index: number) => {
    const mark = visual[index];
    if (!mark) return;
    active = index;
    for (const m of marks) m.node.toggleAttribute('data-active', m === mark);
    svg.setAttribute('data-hovering', '');
    const { post } = mark;
    tipValue.textContent =
      post.engagement == null ? words.hidden : fill(words.count, { count: counts.format(post.engagement) });
    const format = words.formats[post.format as keyof ChartWords['formats']] ?? words.formats.post;
    tipMeta.textContent = `${dates.format(new Date(post.at))} · ${format}`;
    tip.hidden = false;
    // Over the bar, kept inside the plot on both edges. `left` and not a logical inset on
    // purpose: `cx` is a coordinate measured from the drawing's left edge, already mirrored
    // for a right-to-left page — a logical inset would mirror it a second time.
    const half = tip.offsetWidth / 2;
    const left = Math.min(Math.max(mark.cx, half), width - half);
    tip.style.left = `${left - half}px`;
    // Just above the top of the mark, so it never covers the bar it describes. Over the tallest
    // one that is above the drawing, which the card's own padding and title leave room for.
    const top = mark.node.getBBox().y;
    tip.style.top = `${Math.max(top - tip.offsetHeight - 6, -tip.offsetHeight)}px`;
  };
  const hide = () => {
    active = -1;
    tip.hidden = true;
    svg.removeAttribute('data-hovering');
    for (const m of marks) m.node.removeAttribute('data-active');
  };
  const nearest = (clientX: number) => {
    const box = svg.getBoundingClientRect();
    const px = ((clientX - box.left) / Math.max(1, box.width)) * width;
    let best = 0;
    for (let i = 1; i < visual.length; i++) {
      if (Math.abs(visual[i].cx - px) < Math.abs(visual[best].cx - px)) best = i;
    }
    return best;
  };

  // The whole strip is the target: a 4px bar is not something a thumb lands on.
  svg.addEventListener('pointermove', (e) => show(nearest(e.clientX)));
  svg.addEventListener('pointerdown', (e) => show(nearest(e.clientX)));
  svg.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse') hide();
  });
  svg.addEventListener('focus', () => show(active >= 0 ? active : visual.length - 1));
  svg.addEventListener('blur', hide);
  svg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const step = e.key === 'ArrowRight' ? 1 : -1;
      show(Math.max(0, Math.min(visual.length - 1, (active < 0 ? 0 : active) + step)));
    } else if (e.key === 'Escape') {
      hide();
    }
  });

  // ---- The legend: what the colours and the outline mean --------------------------------------
  const legend = document.createElement('ul');
  legend.className = 'chart__legend';
  const entries: { key: string; label: string }[] = [];
  for (const tone of ['reel', 'carousel', 'photo'] as const) {
    if (tones.has(tone)) entries.push({ key: tone, label: words.formats[tone] });
  }
  if (anyHidden) entries.push({ key: 'hidden', label: words.hidden });
  for (const entry of entries) {
    const item = document.createElement('li');
    const swatch = document.createElement('i');
    swatch.setAttribute('data-swatch', entry.key);
    if (entry.key !== 'hidden') swatch.style.background = TONE_FILL[entry.key as Tone];
    item.append(swatch, document.createTextNode(entry.label));
    // The one entry that names a state rather than a format says what it means, for a pointer and
    // for a screen reader; a tap gets it too, since the title shows on long-press.
    if (entry.key === 'hidden' && words.hiddenNote) item.title = words.hiddenNote;
    legend.append(item);
  }
  if (entries.length > 1 || anyHidden) host.append(legend);
}

/**
 * The month names along the bottom.
 *
 * Months are found by walking the window a day at a time in the reader's own calendar, so a
 * Persian page gets Persian months with Persian boundaries. It used to take a Gregorian month's
 * first day and print the Persian name of whatever day a post fell on, which put «شهریور» under
 * two different months side by side. Each name sits under the middle of its stretch; the first
 * and the last are always kept, and a name that would touch its neighbour is dropped.
 */
function drawMonths(
  svg: SVGSVGElement,
  from: number,
  to: number,
  width: number,
  floor: number,
  x: (at: number) => number,
  locale: string
) {
  const key = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'numeric' });
  const longWindow = to - from > 330 * DAY;
  const name = new Intl.DateTimeFormat(
    locale,
    longWindow ? { month: 'short', year: '2-digit' } : { month: 'short' }
  );

  const runs: { key: string; start: number; end: number }[] = [];
  for (let at = from; at <= to; at += DAY) {
    const k = key.format(at);
    const last = runs[runs.length - 1];
    if (last && last.key === k) last.end = at;
    else runs.push({ key: k, start: at, end: at });
  }

  // A tick where each month begins.
  for (const run of runs.slice(1)) {
    const tx = fix(x(run.start));
    svg.append(
      el('line', {
        x1: tx,
        y1: String(floor),
        x2: tx,
        y2: String(floor + 5),
        stroke: 'var(--chart-axis)',
        'stroke-width': '1',
      })
    );
  }

  const labels = runs.map((run) => {
    const label = text(name.format(run.start + (run.end - run.start) / 2), {
      x: fix((x(run.start) + x(run.end)) / 2),
      y: String(floor + LABEL_SIZE + 7),
      'text-anchor': 'middle',
      fill: 'var(--ink-2)',
      class: 'chart__month',
    });
    svg.append(label);
    clampInside(label, width);
    return label;
  });

  // In the order they sit on screen, which is reversed on a right-to-left page.
  const onScreen = labels
    .map((node) => ({ node, box: node.getBBox() }))
    .sort((a, b) => a.box.x - b.box.x);
  const kept: typeof onScreen = [];
  onScreen.forEach((label, i) => {
    const clashes = (other: (typeof onScreen)[number]) =>
      label.box.x < other.box.x + other.box.width + LABEL_GAP;
    if (i === onScreen.length - 1) {
      // The name at the far end outranks any middle one it collides with; the first stays.
      while (kept.length > 1 && clashes(kept[kept.length - 1])) kept.pop()!.node.remove();
      if (kept.length === 1 && clashes(kept[0])) label.node.remove();
      else kept.push(label);
      return;
    }
    if (kept.length && clashes(kept[kept.length - 1])) label.node.remove();
    else kept.push(label);
  });
}

/** A column with a rounded data end and a square foot on the baseline. */
function column(left: number, floor: number, w: number, h: number): string {
  const r = Math.min(3, w / 2, h);
  const top = floor - h;
  return (
    `M${fix(left)} ${fix(floor)}` +
    `V${fix(top + r)}` +
    `Q${fix(left)} ${fix(top)} ${fix(left + r)} ${fix(top)}` +
    `H${fix(left + w - r)}` +
    `Q${fix(left + w)} ${fix(top)} ${fix(left + w)} ${fix(top + r)}` +
    `V${fix(floor)}Z`
  );
}

/** Shifts a centred label back inside the drawing if it would run off either edge. */
function clampInside(label: SVGTextElement, width: number) {
  let box: DOMRect;
  try {
    box = label.getBBox();
  } catch {
    return;
  }
  if (!box.width) return;
  const cx = Number(label.getAttribute('x'));
  const half = box.width / 2;
  const clamped = Math.min(Math.max(cx, half + 1), width - half - 1);
  if (clamped !== cx) label.setAttribute('x', fix(clamped));
}

/**
 * Up to three values to rule the chart at, chosen by where they land rather than by their size.
 *
 * The heights are a square root, so picking round values (100, 200, 300) puts three lines in the
 * top third and nothing below. Picking the heights first and converting back gives lines that are
 * evenly spread down the plot; each is then rounded to 1, 2 or 5 x a power of ten, which is what
 * a person would say out loud. The peak keeps its exact value — it is the post the reader came
 * for, and rounding 343 to 300 would be drawing a line where no post is.
 */
function valueTicks(tallest: number): number[] {
  if (!(tallest > 0)) return [];
  const out: number[] = [tallest];
  for (const fraction of [0.35, 0.65]) {
    const value = round125(tallest * fraction * fraction);
    // Not worth a line if it rounds to nothing, or sits on top of one already drawn.
    if (value > 0 && out.every((v) => Math.abs(v - value) > tallest * 0.06)) out.push(value);
  }
  return out.sort((a, b) => a - b);
}

/** The nearest 1, 2 or 5 times a power of ten — 43 -> 50, 118 -> 100, 270 -> 200. */
function round125(value: number): number {
  if (!(value > 0)) return 0;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const n = value / magnitude;
  const step = n >= 5 ? 5 : n >= 2 ? 2 : 1;
  return step * magnitude;
}

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string>): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

function text(content: string, attrs: Record<string, string>): SVGTextElement {
  const node = el('text', { 'font-size': String(LABEL_SIZE), ...attrs });
  node.textContent = content;
  return node;
}

/** `{name}` placeholders, filled from what was computed here. */
function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? values[k] : m));
}

function fix(n: number): string {
  return n.toFixed(1);
}
