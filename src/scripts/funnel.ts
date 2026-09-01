/**
 * The funnel's clock.
 *
 * Four things here are worth knowing before changing anything.
 *
 * 1. **The walk is not a fixed length.** Every screen is in the DOM, but only
 *    some are in the walk: a screen carrying `data-when="blockers:ideas"` joins
 *    it the moment that answer is given. So the step total is recomputed after
 *    every answer, and is a runtime value — never a number baked into markup.
 * 2. **The read starts at the end now.** The handle is asked on the last screen
 *    before the analysing one, where it used to be asked third. There is no
 *    longer a run of questions to hide the work behind, so the analysing screen
 *    carries the rest of the product instead of a spinner, and it is allowed to
 *    take longer.
 * 3. A single-answer screen advances on tap. There is no Next button to press,
 *    so the only screens that carry one are the ones where several answers are
 *    allowed and the funnel cannot know when you are finished.
 * 4. Progress survives a reload — by screen id, not by index. An index is a
 *    promise that the walk never changes shape, and this walk changes shape in
 *    the middle of itself.
 */
import {
  ApiError,
  getAudit,
  requestProof,
  saveLead,
  saveWaitingLead,
  startAudit,
  watchAudit,
  type Answers,
  type AuditErrorKind,
  type AuditResult,
  type Fact,
  type Topic,
} from '../lib/publicApi';

const HANDLE = /^@?[A-Za-z0-9._]{1,30}$/;
const STORE = 'diwche-funnel';
/**
 * Bumped whenever the saved shape or the screen ids change.
 *
 * Saved state used to be a bare step index, which silently means "the walk will
 * always look like this". It will not: a stored index from the old thirteen-step
 * walk resolves to a different screen, and an over-large one is clamped straight
 * onto the last one. State that does not match this version is dropped.
 */
const SAVE_VERSION = 2;
/**
 * The wait, which is now doing real work rather than covering for it.
 *
 * The handle is asked on the screen immediately before this one, so unlike the
 * old walk there is no head start — this is the whole budget for the read. The
 * cards shown underneath are written for exactly this length.
 */
const MIN_ANALYZING = 3400;
/** The circumference the ring's stroke-dasharray is cut to. */
const RING = 327;
/** Screen order for the four blockers, and so the order of the cards. */
const BLOCKERS = ['ideas', 'editing', 'script', 'dm'] as const;
/** Past these there are no steps left to take, so the counter stops describing them. */
const CLOSING = new Set(['analyzing', 'result', 'plan']);

/**
 * The one string said outside `run()`, so it cannot read the payload from the
 * element. Set once the funnel is found; the default is only ever seen if the
 * page shipped without its copy block, which would be a build error.
 */
let FALLBACK_GENERIC = 'Something went wrong on our side, not yours.';

const root = document.querySelector<HTMLElement>('[data-funnel]');
if (root) run(root);

/**
 * The runtime strings, read from the page rather than imported.
 *
 * Importing them would mean bundling every language into every page. Reading
 * them from a JSON block means one script serves `/read` and `/fa/read`, and
 * each page carries only its own words.
 */
function readCopy(root: HTMLElement): RuntimeCopy {
  const payload = root.querySelector<HTMLElement>('[data-copy]');
  const parsed = JSON.parse(payload?.textContent ?? '{}') as RuntimeCopy;
  if (parsed.runtime?.generic) FALLBACK_GENERIC = parsed.runtime.generic;
  return parsed;
}

interface Saved {
  v: number;
  /** The screen id, not its position. Positions move; ids do not. */
  screen: string;
  answers: Answers;
  auditId: string | null;
  handle: string;
  branch: 'page' | 'idea';
}

/**
 * The slice of `FunnelCopy` the script needs, mirrored here because the script
 * reads it out of the page as JSON rather than importing the module.
 */
interface RuntimeCopy {
  ui: {
    continue: string;
    next: string;
    retry: string;
    of: string;
    working: string;
    sent: string;
    copy: string;
    copied: string;
    copyByHand: string;
  };
  runtime: Record<string, string>;
  result: Record<string, string>;
}

function run(root: HTMLElement) {
  const screens = Array.from(root.querySelectorAll<HTMLElement>('[data-screen]'));
  const errorScreen = screens.find((s) => s.dataset.kind === 'error') ?? null;

  const backBtn = root.querySelector<HTMLElement>('[data-back]');
  const progress = root.querySelector<HTMLElement>('[data-progress]');
  const countNow = root.querySelector<HTMLElement>('[data-step-now]');
  const countTotal = root.querySelector<HTMLElement>('[data-step-total]');
  const countWrap = root.querySelector<HTMLElement>('.bar__count');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const say = readCopy(root);

  let index = 0;
  let answers: Answers = {};
  let auditId: string | null = null;
  let handle = '';
  let branch: 'page' | 'idea' = 'page';

  /**
   * The screens actually in the walk, recomputed whenever an answer changes.
   *
   * Everything is in the DOM; this is the subset that is currently part of it.
   */
  let steps: HTMLElement[] = [];

  /** The read, running underneath the questions. Settled or not, it lives here. */
  let read: Promise<AuditResult | Topic[]> | null = null;
  let readFailed: unknown = null;
  let readProgress = 0;
  let readLine = say.runtime.reading;

  // ---- Which screens are in the walk ----------------------------------------

  /**
   * A screen with no condition is always in. One with `data-when="q:value"` is
   * in only while that answer holds — which is how picking two blockers gives
   * you two insight screens and picking four gives you four.
   */
  function isActive(screen: HTMLElement): boolean {
    if (screen.dataset.kind === 'error') return false;
    const when = screen.dataset.when;
    if (!when) return true;
    const at = when.indexOf(':');
    const key = when.slice(0, at);
    const value = when.slice(at + 1);
    const answer = answers[key];
    return Array.isArray(answer) ? answer.includes(value) : answer === value;
  }

  /**
   * Rebuild the walk, keeping the visitor on the screen they are looking at.
   *
   * Answering Q2 inserts screens *after* the current one, so the index of the
   * live screen can change underneath us. Re-finding it by identity means the
   * screen never jumps when the walk grows.
   */
  function recomputeSteps() {
    const live: HTMLElement | undefined = steps[index];
    steps = screens.filter(isActive);
    const at = live ? steps.indexOf(live) : -1;
    if (at >= 0) index = at;
  }

  /**
   * How many steps the counter is counting.
   *
   * Not `steps.length`: the analysing, result and plan screens are not steps
   * anyone takes, and including them meant the bar could never visibly finish.
   */
  function walkLength(): number {
    const end = steps.findIndex((s) => CLOSING.has(s.dataset.kind ?? ''));
    return end < 0 ? steps.length : end;
  }

  // ---- Persistence ---------------------------------------------------------

  function save() {
    try {
      const state: Saved = {
        v: SAVE_VERSION,
        screen: steps[index]?.dataset.screen ?? '',
        answers,
        auditId,
        handle,
        branch,
      };
      sessionStorage.setItem(STORE, JSON.stringify(state));
    } catch {
      /* Private mode. Losing the ability to resume is not worth an error. */
    }
  }

  function restore(): Saved | null {
    try {
      const raw = sessionStorage.getItem(STORE);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<Saved>;
      // State from a walk that no longer exists is worse than no state: it
      // resolves to a different screen, or gets clamped onto the last one.
      if (parsed.v !== SAVE_VERSION || typeof parsed.screen !== 'string') {
        forget();
        return null;
      }
      return parsed as Saved;
    } catch {
      return null;
    }
  }

  function forget() {
    try {
      sessionStorage.removeItem(STORE);
    } catch {
      /* Nothing to do, and nothing worth telling anyone. */
    }
  }

  // ---- Moving ---------------------------------------------------------------

  /**
   * The bar only. Ticking a box on a multi-select changes how long the walk is,
   * but it does not change which screen you are on — so this must never scroll
   * or move focus. Doing both in one function is why every tick threw the page
   * back to the top.
   */
  function paintBar() {
    const live = steps[index];
    const total = Math.max(1, walkLength());
    const pct = Math.min(100, ((index + 1) / total) * 100);
    if (progress) progress.style.width = `${pct}%`;
    if (countNow) countNow.textContent = String(Math.min(index + 1, total));
    if (countTotal) countTotal.textContent = String(total);

    // Past the analysing screen there are no more steps to take, so a counter
    // and a back arrow would both be describing something that is over.
    const closing = CLOSING.has(live?.dataset.kind ?? '');
    backBtn?.toggleAttribute('data-off', index === 0 || closing);
    countWrap?.toggleAttribute('data-off', closing);
  }

  /** A change of screen: swap what is visible, then reset the view for it. */
  function paint(reverse: boolean) {
    const live = steps[index];
    for (const s of screens) {
      const on = s === live;
      s.hidden = !on;
      s.toggleAttribute('data-live', on);
      s.toggleAttribute('data-reverse', on && reverse);
    }

    paintBar();

    const stage = root.querySelector<HTMLElement>('.stage');
    stage?.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    live?.querySelector<HTMLElement>('input, textarea')?.focus({ preventScroll: true });
    showMore(stage);
  }

  /**
   * The fade at the bottom edge, on only when there is more below.
   *
   * A fade that is always there is decoration and stops meaning anything; a
   * screen that is cut off with no fade looks broken. So it follows the actual
   * overflow, and disappears once you have reached the end.
   */
  function showMore(stage: HTMLElement | null | undefined) {
    if (!stage) return;
    const left = stage.scrollHeight - stage.clientHeight - stage.scrollTop;
    stage.style.setProperty('--more', left > 24 ? '1' : '0');
  }

  function go(to: number, reverse = false) {
    index = Math.max(0, Math.min(steps.length - 1, to));
    paint(reverse);
    save();
    onEnter(steps[index]);
  }

  function next() {
    go(index + 1);
  }

  function fail(message: string, kind: AuditErrorKind = 'error') {
    if (!errorScreen) return;
    const el = errorScreen.querySelector<HTMLElement>('[data-error-message]');
    if (el) el.textContent = message;
    // A private or missing page is the visitor's to fix. The day's cap, and
    // anything that broke on our side, is ours — and losing the address over
    // our own problem would be the mistake twice.
    // Two reasons to hide the address form: the visitor's own page is private
    // or missing (theirs to fix, not ours to chase), or there is no backend to
    // take the address at all — a form that cannot submit is worse than none.
    const connected = root.dataset.connected === 'yes';
    const waiting = errorScreen.querySelector<HTMLElement>('[data-waiting-form]');
    if (waiting) waiting.hidden = !connected || kind === 'private' || kind === 'not_found';

    for (const s of screens) {
      const on = s === errorScreen;
      s.hidden = !on;
      s.toggleAttribute('data-live', on);
    }
    backBtn?.setAttribute('data-off', '');
    countWrap?.setAttribute('data-off', '');
  }

  /** Work that has to happen the moment a particular screen becomes live. */
  function onEnter(screen: HTMLElement | undefined) {
    if (!screen) return;
    if (screen.dataset.kind === 'analyzing') {
      renderRest(screen);
      void runAnalyzing();
    }
  }

  /**
   * The rest of the product, shown while the read runs.
   *
   * Deliberately the blockers they did *not* pick: the ones they did have each
   * had a screen of their own already, and repeating them here would waste the
   * only place left to mention everything else. Account identity and scheduling
   * are never asked about, so they always appear.
   */
  function renderRest(screen: HTMLElement) {
    const host = screen.querySelector<HTMLElement>('[data-rest]');
    const payload = screen.querySelector<HTMLElement>('[data-features]');
    if (!host || !payload || host.childElementCount) return;

    let features: Record<string, { label: string; title: string; text: string }> = {};
    try {
      features = JSON.parse(payload.textContent ?? '{}');
    } catch {
      return;
    }

    const picked = Array.isArray(answers.blockers) ? answers.blockers : [];
    const keys = [...BLOCKERS.filter((b) => !picked.includes(b)), 'identity', 'scheduling'];

    for (const key of keys) {
      const card = features[key];
      if (!card) continue;
      const el = tpl('rest');
      field(el, 'label')!.textContent = card.label;
      field(el, 'title')!.textContent = card.title;
      field(el, 'text')!.textContent = card.text;
      host.append(el);
    }
  }

  // ---- Questions -------------------------------------------------------------

  for (const screen of screens) {
    if (screen.dataset.kind !== 'question') continue;
    const id = screen.dataset.screen!;
    const multi = Boolean(screen.querySelector('[data-continue]'));
    if (multi) screen.setAttribute('data-multi', '');
    const options = Array.from(screen.querySelectorAll<HTMLElement>('[data-option]'));
    const cont = screen.querySelector<HTMLButtonElement>('[data-continue]');

    for (const option of options) {
      option.addEventListener('click', () => {
        const value = option.dataset.option!;

        if (multi) {
          const chosen = option.toggleAttribute('data-chosen');
          option.setAttribute('aria-pressed', String(chosen));
          const picked = options
            .filter((o) => o.hasAttribute('data-chosen'))
            .map((o) => o.dataset.option!);
          answers[id] = picked;
          if (cont) cont.disabled = picked.length === 0;
          // Picking a blocker adds a screen to the walk; unpicking removes it.
          // The bar has to follow, but the screen has not changed, so nothing
          // scrolls and nothing takes focus.
          recomputeSteps();
          paintBar();
          save();
          return;
        }

        for (const other of options) other.removeAttribute('data-chosen');
        option.setAttribute('data-chosen', '');
        answers[id] = value;
        if (id === 'stage') applyStage(value);
        recomputeSteps();
        save();
        // A beat, so the choice is visibly registered before the screen leaves.
        setTimeout(next, reduced ? 0 : 220);
      });
    }

    cont?.addEventListener('click', () => next());
  }

  /**
   * Q1 decides two things: which branch of the walk runs, and how Q2 is worded.
   *
   * Someone with no page yet cannot have one read, so their branch asks for a
   * subject instead of a handle. And "why haven't you started posting" is an
   * odd thing to ask a person who posts daily, so the same question is worded
   * twice and the answer to this one picks which wording is shown.
   */
  function applyStage(value: string) {
    branch = value === 'new' ? 'idea' : 'page';

    for (const screen of screens) {
      const title = screen.querySelector<HTMLElement>('[data-title][data-title-when]');
      if (!title) continue;
      // Remember the authored wording once, so going back and changing the
      // answer restores it rather than leaving the variant behind.
      if (title.dataset.titleDefault === undefined) {
        title.dataset.titleDefault = title.textContent ?? '';
      }
      let variants: Record<string, string> = {};
      try {
        variants = JSON.parse(title.dataset.titleWhen ?? '{}') as Record<string, string>;
      } catch {
        variants = {};
      }
      title.textContent = variants[value] ?? title.dataset.titleDefault ?? '';
    }
  }

  // ---- Insights ---------------------------------------------------------------

  for (const button of root.querySelectorAll<HTMLElement>('[data-next]')) {
    button.addEventListener('click', () => next());
  }

  backBtn?.addEventListener('click', () => go(index - 1, true));

  // Cheap: one read of two properties, and only while a screen is being
  // scrolled. Passive so it never delays the scroll itself.
  root.querySelector<HTMLElement>('.stage')?.addEventListener(
    'scroll',
    () => showMore(root.querySelector<HTMLElement>('.stage')),
    { passive: true }
  );
  addEventListener('resize', () => showMore(root.querySelector<HTMLElement>('.stage')), {
    passive: true,
  });

  // ---- The handle, and the read that starts here --------------------------------

  // There are two of these now — a handle to read, and an idea to build from —
  // and which one is in the walk was decided back on Q1.
  for (const form of root.querySelectorAll<HTMLFormElement>('[data-start-form]')) {
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const error = form.querySelector<HTMLElement>('[data-start-error]');
      const complain = (message: string) => {
        if (error) {
          error.textContent = message;
          error.hidden = false;
        }
      };

      if (form.dataset.field === 'idea') {
        const idea = form.querySelector<HTMLTextAreaElement>('[data-idea]')!.value.trim();
        if (idea.length < 3) {
          complain(say.runtime.ideaTooShort);
          return;
        }
        if (error) error.hidden = true;
        answers.idea = idea;
        beginIdea(idea);
        next();
        return;
      }

      const value = form.querySelector<HTMLInputElement>('[data-handle]')!.value.trim();
      if (!HANDLE.test(value)) {
        complain(say.runtime.handleInvalid);
        return;
      }
      if (error) error.hidden = true;
      handle = value.replace(/^@/, '');
      answers.handle = handle;
      beginRead(handle);
      next();
    });
  }

  function track(id: string) {
    auditId = id;
    save();
    return watchAudit(id, (p) => {
      readProgress = p.progress;
      if (p.message) readLine = p.message;
    });
  }

  function beginRead(clean: string) {
    read = (async () => {
      const started = await startAudit(
        clean,
        await turnstileToken(),
        document.documentElement.lang || 'en'
      );
      return track(started.id).done;
    })().catch((err) => {
      readFailed = err;
      throw err;
    });
  }

  /**
   * The starter branch, which has nothing to read.
   *
   * There is no page, no handle and no numbers — and the endpoints that would
   * turn an idea into topics do not exist on the backend yet. So this asks for
   * nothing and promises nothing: the walk still reaches the address, and the
   * direction he would take the idea in is sent by email rather than claimed on
   * screen. When those endpoints land, this becomes a real call and the
   * starter branch gets its findings.
   */
  function beginIdea(idea: string) {
    void idea;
    read = (async () => {
      readProgress = 0.55;
      readLine = say.runtime.thinking;
      await new Promise((r) => setTimeout(r, 600));
      readProgress = 1;
      return [] as Topic[];
    })();
  }

  /** Re-attach to a read already in flight, after a reload. */
  function resumeRead(id: string) {
    read = (async () => {
      try {
        return await getAudit(id);
      } catch (err) {
        if (err instanceof ApiError && err.kind === 'error') return await track(id).done;
        throw err;
      }
    })().catch((err) => {
      readFailed = err;
      throw err;
    });
  }

  // ---- Analysing ------------------------------------------------------------------

  let analyzing = false;

  async function runAnalyzing() {
    if (analyzing) return;
    analyzing = true;

    const screen = steps.find((s) => s.dataset.kind === 'analyzing');
    const ring = screen?.querySelector<SVGCircleElement>('[data-ring]');
    const pct = screen?.querySelector<HTMLElement>('[data-pct]');
    const line = screen?.querySelector<HTMLElement>('[data-analyzing-line]');
    // The ring never shows the raw figure. A read that is already finished
    // would snap to full the moment this screen opened, which looks like a bug
    // rather than like speed, so it is eased towards wherever the work is.
    let shown = 0;
    const paintRing = () => {
      const target = Math.max(readProgress, 0.05);
      shown += (target - shown) * 0.08;
      const clamped = Math.max(0, Math.min(1, shown));
      if (ring) ring.style.strokeDashoffset = String(RING - RING * clamped);
      if (pct) pct.textContent = String(Math.round(clamped * 100));
      if (line && readLine) line.textContent = readLine;
    };
    const ticker = setInterval(paintRing, 60);

    const settle = new Promise((r) => setTimeout(r, MIN_ANALYZING));

    try {
      const [value] = await Promise.all([read ?? Promise.reject(new Error('no read')), settle]);
      readProgress = 1;
      // Let the ring visibly reach the end before the screen changes.
      await new Promise((r) => setTimeout(r, reduced ? 0 : 700));
      clearInterval(ticker);
      showResult(value);
    } catch (err) {
      clearInterval(ticker);
      const e = readFailed ?? err;
      fail(messageFor(e), kindFor(e));
    } finally {
      analyzing = false;
    }
  }

  // ---- The findings ------------------------------------------------------------

  let result: AuditResult | null = null;

  function tpl(name: string) {
    const t = root.querySelector<HTMLTemplateElement>(`[data-tpl="${name}"]`);
    if (!t) throw new Error(`missing template ${name}`);
    return t.content.firstElementChild!.cloneNode(true) as HTMLElement;
  }

  const field = (el: HTMLElement, name: string) =>
    el.querySelector<HTMLElement>(`[data-f="${name}"]`);

  function showResult(value: AuditResult | Topic[]) {
    const screen = steps.find((s) => s.dataset.kind === 'result');
    const headline = screen?.querySelector<HTMLElement>('[data-result-headline]');
    const factsHost = screen?.querySelector<HTMLElement>('[data-facts]');
    const topicsHost = screen?.querySelector<HTMLElement>('[data-topics]');
    const eyebrow = screen?.querySelector<HTMLElement>('.screen__eyebrow');
    const teaser = screen?.querySelector<HTMLElement>('.lead__title');

    renderWho(screen, Array.isArray(value) ? null : value.profile);

    if (Array.isArray(value)) {
      // The starter branch. Nothing was measured, so nothing is claimed — and
      // in particular no blurred report, because a report implies an analysis
      // of a page we have never seen. The address is asked for on its own
      // honest footing instead.
      if (eyebrow) eyebrow.textContent = say.result.starterEyebrow;
      if (headline) headline.textContent = '';
      if (teaser) teaser.textContent = say.result.starterTeaser;
      if (factsHost) factsHost.hidden = true;
      if (topicsHost) {
        topicsHost.hidden = value.length === 0;
        topicsHost.textContent = '';
        for (const topic of value) {
          const el = tpl('topic');
          field(el, 'format')!.textContent = topic.format;
          field(el, 'title')!.textContent = topic.title;
          field(el, 'hook')!.textContent = topic.hook;
          topicsHost.append(el);
        }
      }
    } else {
      result = value;
      if (headline) headline.textContent = value.headline;
      renderFacts(value.facts);
      renderProjection(value);
    }

    go(steps.findIndex((s) => s.dataset.kind === 'result'));
  }

  /**
   * The page he read, shown before anything is claimed about it.
   *
   * Hidden entirely when there is no profile — the starter branch has no page,
   * and a card with a blank face and two dashes in it would be worse than none.
   */
  function renderWho(screen: HTMLElement | undefined, profile: AuditResult['profile']) {
    const card = screen?.querySelector<HTMLElement>('[data-who]');
    if (!card) return;
    if (!profile) {
      card.hidden = true;
      return;
    }

    const face = card.querySelector<HTMLImageElement>('[data-who-avatar]');
    if (face) {
      // No picture is ordinary — a private-ish profile, or a fetch that failed.
      // The card still earns its place on the handle and the counts.
      if (profile.avatar) {
        face.src = profile.avatar;
        face.hidden = false;
      } else {
        face.hidden = true;
      }
      face.alt = `@${profile.handle}`;
    }

    card.querySelector<HTMLElement>('[data-who-handle]')!.textContent = `@${profile.handle}`;
    card.querySelector<HTMLElement>('[data-who-followers]')!.textContent = count(profile.followers);
    card.querySelector<HTMLElement>('[data-who-posts]')!.textContent = count(profile.posts);
    card.hidden = false;
  }

  /** Grouped the way the reader's own locale groups them. */
  function count(value: number | null): string {
    return value == null ? '—' : value.toLocaleString(document.documentElement.lang || 'en');
  }

  function renderFacts(facts: Fact[]) {
    const host = steps
      .find((s) => s.dataset.kind === 'result')
      ?.querySelector<HTMLElement>('[data-facts]');
    if (!host) return;
    host.hidden = false;
    host.textContent = '';

    for (const fact of facts) {
      const el = tpl('fact');
      el.toggleAttribute('data-locked', Boolean(fact.locked));
      field(el, 'label')!.textContent = fact.label;
      field(el, 'value')!.textContent = fact.value;
      field(el, 'text')!.textContent = fact.text;

      const meter = field(el, 'meter');
      if (fact.meter && meter) {
        meter.hidden = false;
        const width = Math.max(0, Math.min(100, (fact.meter.value / fact.meter.max) * 100));
        const fill = field(el, 'meter-fill');
        requestAnimationFrame(() => {
          if (fill) fill.style.width = `${width}%`;
        });
        const mark = field(el, 'meter-mark');
        if (mark && typeof fact.meter.benchmark === 'number') {
          mark.style.insetInlineStart = `${Math.max(0, Math.min(100, (fact.meter.benchmark / fact.meter.max) * 100))}%`;
        } else if (mark) {
          mark.hidden = true;
        }
        const legend = field(el, 'meter-legend');
        if (legend) {
          legend.textContent = fact.meter.benchmarkLabel
            ? `The mark is the ${fact.meter.benchmarkLabel} for pages your size.`
            : '';
        }
      }
      host.append(el);
    }
  }

  function renderProjection(value: AuditResult) {
    const screen = steps.find((s) => s.dataset.kind === 'plan');
    const wrap = screen?.querySelector<HTMLElement>('[data-projection]');
    const assumption = screen?.querySelector<HTMLElement>('[data-projection-assumption]');
    const headline = screen?.querySelector<HTMLElement>('[data-projection-headline]');

    // Too few posts to say anything honest is a legitimate answer, and a
    // skipped panel is better than a number we do not have.
    const projection = value.projection;
    if (!wrap) return;
    const none = screen?.querySelector<HTMLElement>('[data-projection-none]');
    if (!projection) {
      // Never an empty card under a heading promising a plan.
      if (none) none.hidden = false;
      return;
    }
    if (none) none.hidden = true;
    wrap.hidden = false;
    if (headline) headline.textContent = projection.headline;
    if (assumption) assumption.textContent = projection.assumption;

    // Both bars are scaled to the taller one, so the difference between them is
    // the whole picture and neither is drawn against an invented ceiling.
    const tallest = Math.max(projection.now.value, projection.then.value, 1);
    for (const [key, side] of [['now', projection.now], ['then', projection.then]] as const) {
      const bar = wrap.querySelector<HTMLElement>(`[data-bar="${key}"]`);
      if (!bar) continue;
      bar.querySelector<HTMLElement>('[data-bar-label]')!.textContent = side.label;
      bar.querySelector<HTMLElement>('[data-bar-amount]')!.textContent = side.amount;
      bar.querySelector<HTMLElement>('[data-bar-pace]')!.textContent = side.pace;
      const fill = bar.querySelector<HTMLElement>('[data-bar-fill]')!;
      // Next frame, so the transition has a zero to grow from.
      requestAnimationFrame(() =>
        fill.style.setProperty('--grown', String(Math.max(0.04, side.value / tallest))),
      );
    }

    const moves = wrap.querySelector<HTMLElement>('[data-projection-moves]');
    if (!moves) return;
    moves.textContent = '';
    for (const move of projection.moves) {
      const el = tpl('move');
      field(el, 'text')!.textContent = move;
      moves.append(el);
    }
  }

  // ---- The address, and the offer -------------------------------------------------

  const leadForm = root.querySelector<HTMLFormElement>('[data-lead-form]');
  leadForm?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const email = leadForm.querySelector<HTMLInputElement>('#email')!.value.trim();
    const consent = leadForm.querySelector<HTMLInputElement>('[data-consent]')!.checked;
    const error = leadForm.querySelector<HTMLElement>('[data-lead-error]');
    const submit = leadForm.querySelector<HTMLButtonElement>('[data-lead-submit]')!;

    const complaint = check(email, consent);
    if (complaint) {
      if (error) {
        error.textContent = complaint;
        error.hidden = false;
      }
      return;
    }
    if (error) error.hidden = true;
    submit.disabled = true;
    submit.textContent = say.ui.working;

    try {
      if (auditId) await saveLead(auditId, email, consent, answers, await turnstileToken());
      if (result) {
        result.facts = result.facts.map((f) => ({ ...f, locked: false }));
        renderFacts(result.facts);
      }
      await toPlan();
    } catch (err) {
      if (error) {
        error.textContent = messageFor(err);
        error.hidden = false;
      }
      submit.disabled = false;
      submit.textContent = say.result.cta;
    }
  });

  const waitingForm = root.querySelector<HTMLFormElement>('[data-waiting-form]');
  waitingForm?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const email = waitingForm.querySelector<HTMLInputElement>('#waiting-email')!.value.trim();
    const consent = waitingForm.querySelector<HTMLInputElement>('[data-waiting-consent]')!.checked;
    const error = waitingForm.querySelector<HTMLElement>('[data-waiting-error]');
    const submit = waitingForm.querySelector<HTMLButtonElement>('[data-waiting-submit]')!;

    const complaint = check(email, consent);
    if (complaint) {
      if (error) {
        error.textContent = complaint;
        error.hidden = false;
      }
      return;
    }
    if (error) error.hidden = true;
    submit.disabled = true;
    try {
      await saveWaitingLead(handle, email, consent, answers, await turnstileToken());
      submit.textContent = say.ui.sent;
    } catch (err) {
      if (error) {
        error.textContent = messageFor(err);
        error.hidden = false;
      }
      submit.disabled = false;
    }
  });

  function check(email: string, consent: boolean): string | null {
    if (!email.includes('@') || email.length < 5) return say.runtime.emailInvalid;
    if (!consent) return say.runtime.consentMissing;
    return null;
  }

  async function toPlan() {
    go(steps.findIndex((s) => s.dataset.kind === 'plan'));

    // The starter branch has no breakdown to promise, so it is told what it
    // will actually get.
    const starter = branch === 'idea';
    const body = root.querySelector<HTMLElement>('[data-plan-body]');
    const starterBody = root.querySelector<HTMLElement>('[data-plan-body-starter]');
    if (body) body.hidden = starter;
    if (starterBody) starterBody.hidden = !starter;

    // "Here is your complete breakdown" is a promise kept only on the branch
    // that had a page to read.
    const planTitle = root.querySelector<HTMLElement>('[data-plan-headline]');
    if (planTitle && starter && planTitle.dataset.planHeadlineStarter) {
      planTitle.textContent = planTitle.dataset.planHeadlineStarter;
    }

    const block = root.querySelector<HTMLElement>('[data-proof-block]');
    const fallback = root.querySelector<HTMLElement>('[data-proof-fallback]');

    const showFallback = () => {
      if (block) block.hidden = true;
      if (fallback) fallback.hidden = false;
    };

    if (!auditId) {
      showFallback();
      return;
    }
    try {
      const proof = await requestProof(auditId);
      const code = root.querySelector<HTMLElement>('[data-proof-code]');
      const account = root.querySelector<HTMLElement>('[data-proof-account]');
      const link = root.querySelector<HTMLAnchorElement>('[data-proof-link]');
      if (code) code.textContent = proof.code;
      if (account) account.textContent = `@${proof.account}`;
      if (link) link.href = `https://ig.me/m/${proof.account}`;
      if (block) block.hidden = false;
      if (fallback) fallback.hidden = true;
    } catch {
      // Proving ownership needs a permission we do not have yet. Showing a code
      // nobody can act on would be worse than closing on the address, which is
      // real: an unverified read still reaches them.
      showFallback();
    }
  }

  root.querySelector<HTMLElement>('[data-copy-code]')?.addEventListener('click', async (ev) => {
    const button = ev.currentTarget as HTMLButtonElement;
    const code = root.querySelector<HTMLElement>('[data-proof-code]')?.textContent ?? '';
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = say.ui.copied;
      setTimeout(() => (button.textContent = say.ui.copy), 1800);
    } catch {
      button.textContent = say.ui.copyByHand;
    }
  });

  // Both ends of the walk offer a way out of it. Forgetting first matters: the
  // resume state would otherwise drop the next visitor straight back onto the
  // screen they just asked to leave.
  for (const el of root.querySelectorAll<HTMLElement>('[data-retry], [data-restart]')) {
    el.addEventListener('click', () => {
      forget();
      location.reload();
    });
  }

  // ---- Start ------------------------------------------------------------------------

  const saved = restore();
  if (saved && saved.screen) {
    answers = saved.answers ?? {};
    auditId = saved.auditId;
    handle = saved.handle ?? '';
    branch = saved.branch ?? 'page';
    if (typeof answers.stage === 'string') applyStage(answers.stage);
    recomputeSteps();
    restoreChoices();
    // A read already in flight is picked back up by id rather than paid for
    // twice, which also means a reload never costs a second scrape.
    if (auditId) resumeRead(auditId);

    // Resolve by id. If the screen is no longer in the walk — the answer that
    // put it there has gone — fall back to the start rather than guessing.
    let at = steps.findIndex((s) => s.dataset.screen === saved.screen);
    const kind = at >= 0 ? steps[at]?.dataset.kind : '';
    // Landing straight back on the analysing screen with no read behind it
    // would hang, so that one goes back to the screen that asks.
    if (at < 0 || (!auditId && CLOSING.has(kind ?? ''))) {
      const asks = steps.findIndex((s) => s.dataset.kind === 'start');
      at = asks >= 0 ? asks : 0;
    }
    go(at);
  } else {
    recomputeSteps();
    go(0);
  }

  function restoreChoices() {
    for (const screen of screens) {
      const id = screen.dataset.screen;
      if (!id || !(id in answers)) continue;
      const value = answers[id];
      const chosen = Array.isArray(value) ? value : [value];
      const options = Array.from(screen.querySelectorAll<HTMLElement>('[data-option]'));
      for (const option of options) {
        const on = chosen.includes(option.dataset.option!);
        option.toggleAttribute('data-chosen', on);
        if (screen.hasAttribute('data-multi')) option.setAttribute('aria-pressed', String(on));
      }
      const cont = screen.querySelector<HTMLButtonElement>('[data-continue]');
      if (cont) cont.disabled = chosen.length === 0;
    }
    const handleInput = root.querySelector<HTMLInputElement>('#handle');
    if (handleInput && handle) handleInput.value = handle;
  }
}

/**
 * Proof-of-human, when it is switched on.
 *
 * Nothing third-party is loaded until a site key exists on the document, and
 * the backend — never this — decides whether a missing token is acceptable.
 * That split matters: a page can always be made to say it has a token, so this
 * is a way to give one, never a gate.
 *
 * The widget is rendered once into a hidden container and reused. Its mode is
 * set in the Cloudflare dashboard, not here; in the invisible and
 * non-interactive modes the callback fires on its own and nothing is shown.
 */
interface TurnstileApi {
  render: (el: HTMLElement, params: Record<string, unknown>) => string;
  reset: (id: string) => void;
}

let widget: { id: string; api: TurnstileApi } | null = null;
let pending: ((token: string | null) => void) | null = null;

/**
 * Hand whatever the widget produced to whoever is waiting.
 *
 * This is module-level rather than a closure inside the render call on purpose:
 * the widget is rendered once and reset for every later token, so its callbacks
 * belong to the first request forever. Routing through here means a reset
 * answers the call that asked for it.
 */
function settle(token: string | null) {
  const waiting = pending;
  pending = null;
  waiting?.(token);
}

async function turnstileToken(): Promise<string | null> {
  const key = document.documentElement.dataset.turnstileKey;
  if (!key) return null;

  const api = await waitForTurnstile();
  if (!api) return null;

  return new Promise<string | null>((resolve) => {
    // One outstanding request at a time. The funnel never asks twice at once,
    // and handing an old caller a new token would be a lie about which call it
    // belongs to.
    settle(null);
    pending = resolve;

    // Nothing waits forever on a third party. A null means the backend decides,
    // which is where that decision belongs anyway.
    const bail = window.setTimeout(() => {
      if (pending === resolve) settle(null);
    }, 8000);
    const stopWaiting = () => window.clearTimeout(bail);
    const originalResolve = resolve;
    resolve = ((token: string | null) => {
      stopWaiting();
      originalResolve(token);
    }) as typeof resolve;
    pending = resolve;

    try {
      if (widget) {
        // A token is single-use, so a second read needs a fresh one.
        widget.api.reset(widget.id);
        return;
      }
      const host = document.createElement('div');
      host.style.display = 'none';
      document.body.append(host);
      widget = {
        api,
        id: api.render(host, {
          sitekey: key,
          callback: (token: string) => settle(token),
          'error-callback': () => settle(null),
          'timeout-callback': () => settle(null),
          'expired-callback': () => settle(null),
        }),
      };
    } catch {
      settle(null);
    }
  });
}

/** The script is async, so it may not have arrived by the time the handle is typed. */
async function waitForTurnstile(): Promise<TurnstileApi | null> {
  const has = () => (window as unknown as { turnstile?: TurnstileApi }).turnstile ?? null;
  for (let i = 0; i < 40 && !has(); i++) {
    await new Promise((r) => setTimeout(r, 100));
  }
  return has();
}

function messageFor(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return FALLBACK_GENERIC;
}

function kindFor(err: unknown): AuditErrorKind {
  return err instanceof ApiError ? err.kind : 'error';
}
