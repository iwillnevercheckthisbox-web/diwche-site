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

interface Options {
  locale: string;
  /** Mirrors the axis so time still runs in the reading direction. */
  rtl: boolean;
  /** Read to a screen reader in place of the picture. */
  summary: string;
}

const WIDTH = 720;
const HEIGHT = 200;
const PAD_TOP = 14;
const PAD_BOTTOM = 26;
/** Nothing narrower reads as a bar; nothing wider reads as a block. */
const MIN_BAR = 3;
const MAX_BAR = 16;

/**
 * A gap worth shading.
 *
 * Two weeks is the same boundary the backend judges the rhythm on, and the two must agree: a
 * page told its rhythm is broken while the chart shades nothing has contradicted itself on one
 * screen.
 */
const QUIET_DAYS = 14;
const DAY = 24 * 60 * 60 * 1000;

/** Which token colours a bar. Format names arrive from the backend already singular. */
function colorFor(format: string): string {
  switch (format) {
    case 'reel':
    case 'video':
      return 'var(--chart-reel)';
    case 'carousel':
      return 'var(--chart-carousel)';
    default:
      return 'var(--chart-photo)';
  }
}

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

export function drawTimeline(
  host: HTMLElement,
  points: TimelinePoint[],
  options: Options
): boolean {
  const usable = points.filter((p) => Number.isFinite(p.at));
  if (usable.length < 2) return false;

  const { from, to } = windowFor(usable);
  const span = Math.max(1, to - from);
  const inWindow = usable.filter((p) => p.at >= from);
  if (inWindow.length < 2) return false;

  const tallest = Math.max(1, ...inWindow.map((p) => p.engagement ?? 0));
  const plot = HEIGHT - PAD_TOP - PAD_BOTTOM;

  // Wide enough to see, narrow enough not to overlap its neighbour at this density.
  const bar = Math.max(MIN_BAR, Math.min(MAX_BAR, (WIDTH / inWindow.length) * 0.55));

  const x = (at: number) => {
    const share = (at - from) / span;
    const along = share * (WIDTH - bar) + bar / 2;
    return options.rtl ? WIDTH - along : along;
  };
  // Square root, so one post that travelled does not flatten the twenty beside it.
  const height = (value: number) => Math.max(2, Math.sqrt(value / tallest) * plot);

  const parts: string[] = [];

  // The longest silence inside the window, shaded behind everything else. Drawn first so the
  // bars sit on top of it rather than being tinted by it.
  const sorted = [...inWindow].sort((a, b) => a.at - b.at);
  let gapFrom = 0;
  let gapTo = 0;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].at - sorted[i - 1].at > gapTo - gapFrom) {
      gapFrom = sorted[i - 1].at;
      gapTo = sorted[i].at;
    }
  }
  const gapDays = Math.round((gapTo - gapFrom) / DAY);
  if (gapDays >= QUIET_DAYS) {
    const left = Math.min(x(gapFrom), x(gapTo));
    const width = Math.abs(x(gapTo) - x(gapFrom));
    parts.push(
      `<rect x="${left.toFixed(1)}" y="${PAD_TOP}" width="${width.toFixed(1)}" height="${plot}" fill="var(--chart-quiet)" />`
    );
    if (width > 44) {
      parts.push(
        `<text x="${(left + width / 2).toFixed(1)}" y="${PAD_TOP + 14}" class="chart__gap" text-anchor="middle">${gapDays}</text>`
      );
    }
  }

  // The baseline the bars stand on.
  const floor = HEIGHT - PAD_BOTTOM;
  parts.push(
    `<line x1="0" y1="${floor}" x2="${WIDTH}" y2="${floor}" stroke="var(--chart-axis)" stroke-width="1" />`
  );

  for (const point of inWindow) {
    const cx = x(point.at);
    if (point.engagement == null) {
      // Hidden likes are unknown, never zero. Drawn as an outline at a fixed low height so the
      // post is visibly there and visibly not counted — reading it as a zero is what made a busy
      // page look like one nobody answers.
      const h = plot * 0.12;
      parts.push(
        `<rect x="${(cx - bar / 2).toFixed(1)}" y="${(floor - h).toFixed(1)}" width="${bar.toFixed(1)}" height="${h.toFixed(1)}" fill="none" stroke="var(--chart-axis)" stroke-dasharray="2 2" rx="1" />`
      );
      continue;
    }
    const h = height(point.engagement);
    parts.push(
      `<rect x="${(cx - bar / 2).toFixed(1)}" y="${(floor - h).toFixed(1)}" width="${bar.toFixed(1)}" height="${h.toFixed(1)}" fill="${colorFor(point.format)}" rx="1"><title>${point.engagement}</title></rect>`
    );
  }

  // Month names along the bottom, from the reader's own calendar.
  const months = new Intl.DateTimeFormat(options.locale, { month: 'short' });
  const marks = new Set<string>();
  for (const point of inWindow) {
    const date = new Date(point.at);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (marks.has(key)) continue;
    marks.add(key);
    const first = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
    if (first < from) continue;
    parts.push(
      `<text x="${x(first).toFixed(1)}" y="${HEIGHT - 8}" class="chart__month" text-anchor="middle">${months.format(date)}</text>`
    );
  }

  host.innerHTML =
    `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" preserveAspectRatio="none" ` +
    `aria-label="${escapeAttribute(options.summary)}">${parts.join('')}</svg>`;
  return true;
}

/** The label is written into an attribute, so anything that could close it early is escaped. */
function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
