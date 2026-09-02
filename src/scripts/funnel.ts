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
  getTopics,
  startIdea,
  
  saveLead,
  saveWaitingLead,
  startAudit,
  watchAudit,
  type Answers,
  type AuditErrorKind,
  type AuditResult,
  type Fact,
  type IdeaResult,
  type Projection,
  type Size,
  type Topic,
  startProof,
  getProof,
  type Proof,
} from '../lib/publicApi';
import { turnstileToken } from './turnstile';

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
const SAVE_VERSION = 3;
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
const CLOSING = new Set(['verify', 'analyzing', 'result', 'plan']);

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
  /** The proof in flight, so a reload lands back on the code rather than asking again. */
  proofId: string | null;
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
  plan: { sizeTitle: Record<string, string> };
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
  let proofId: string | null = null;
  let handle = '';
  let branch: 'page' | 'idea' = 'page';

  /**
   * The screens actually in the walk, recomputed whenever an answer changes.
   *
   * Everything is in the DOM; this is the subset that is currently part of it.
   */
  let steps: HTMLElement[] = [];

  /** The read, running underneath the questions. Settled or not, it lives here. */
  let read: Promise<AuditResult | IdeaResult> | null = null;
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
    // Only a page can be proven. The idea branch has nothing to send a code from.
    if (screen.dataset.kind === 'verify') return branch === 'page';
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
        proofId,
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
    if (screen.dataset.kind === 'verify') {
      void runVerify(screen);
      return;
    }
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
    const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (submit?.disabled) return;
      const error = form.querySelector<HTMLElement>('[data-start-error]');
      const complain = (message: string) => {
        if (error) {
          error.textContent = message;
          error.hidden = false;
        }
      };

      const isIdea = form.dataset.field === 'idea';
      const idea = isIdea
        ? form.querySelector<HTMLTextAreaElement>('[data-idea]')!.value.trim()
        : '';
      const value = isIdea
        ? ''
        : form.querySelector<HTMLInputElement>('[data-handle]')!.value.trim();

      if (isIdea && idea.length < 3) return complain(say.runtime.ideaTooShort);
      if (!isIdea && !HANDLE.test(value)) return complain(say.runtime.handleInvalid);
      if (error) error.hidden = true;

      // The proof-of-human is minted here, while the button is still on
      // screen to place the widget above, rather than inside the read after
      // the screen has already moved on.
      if (submit) submit.disabled = true;
      const human = await turnstileToken(submit);
      if (submit) submit.disabled = false;
      // Never refused here. Whether a missing token matters is the backend's decision
      // and only the backend knows the answer: it may have the check switched off, it
      // may be unconfigured, or it may refuse — and if it refuses it says so in words
      // this page then shows. Deciding locally is how a page went on blocking people
      // for an hour after the server had started letting everybody through.

      if (isIdea) {
        answers.idea = idea;
        beginIdea(idea, human.token);
        next();
        return;
      }

      handle = value.replace(/^@/, '');
      answers.handle = handle;
      recomputeSteps();
      // The read waits for the proof. A server with the proof step switched off
      // says so with a 503, and the read then goes ahead on the token instead.
      if (submit) submit.disabled = true;
      try {
        const proof = await startProof(handle, human.token);
        if (!proof) {
          beginRead(handle, human.token, null);
          go(steps.findIndex((s) => s.dataset.kind === 'analyzing'));
          return;
        }
        proofId = proof.id;
        proofShown = proof;
        save();
        next();
      } catch (err) {
        complain(err instanceof ApiError ? err.message : say.runtime.generic);
      } finally {
        if (submit) submit.disabled = false;
      }
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

  function beginRead(clean: string, human: string | null, proof: string | null) {
    read = (async () => {
      const started = await startAudit(clean, human, document.documentElement.lang || 'en', proof);
      return track(started.id).done;
    })().catch((err) => {
      readFailed = err;
      throw err;
    });
  }

  /**
   * The starter branch: a subject and no page.
   *
   * Nothing is measured here, so nothing is claimed. What comes back is three
   * angles worth building on — and an empty list is an ordinary answer, not a
   * failure: the branch closes on an address either way.
   */
  function beginIdea(idea: string, human: string | null) {
    read = (async () => {
      const locale = document.documentElement.lang || 'en';
      const started = await startIdea(idea, human);
      auditId = started.id;
      save();
      readProgress = 0.55;
      readLine = say.runtime.thinking;
      const answer = await getTopics(started.id, 'idea', idea, locale);
      readProgress = 1;
      return answer;
    })().catch((err) => {
      readFailed = err;
      throw err;
    });
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

  // ---- Proving the page is theirs ----------------------------------------------

  /** The proof as last seen from the server; what the verify screen paints. */
  let proofShown: Proof | null = null;
  let proofTimer: number | null = null;
  const PROOF_POLL_MS = 4000;

  /**
   * Paints the code and watches for the verdict.
   *
   * The screen is static markup with every status line already in it; this
   * fills the code, the handles and the link, then shows the one line that is
   * true. Polling stops the moment the screen is left, and a verified proof
   * starts the read and moves on by itself.
   */
  async function runVerify(screen: HTMLElement) {
    stopProofWatch();
    if (!proofId) {
      go(steps.findIndex((s) => s.dataset.kind === 'start'));
      return;
    }

    const paint = (proof: Proof) => {
      proofShown = proof;
      const account = `@${proof.account}`;
      const page = `@${proof.handle}`;
      const sentBy = proof.sentBy ? `@${proof.sentBy}` : '';
      const code = screen.querySelector<HTMLElement>('[data-proof-code]');
      if (code) code.textContent = proof.code;
      const link = screen.querySelector<HTMLAnchorElement>('[data-proof-link]');
      if (link) link.href = `https://ig.me/m/${proof.account}`;
      for (const el of screen.querySelectorAll<HTMLElement>('[data-proof-step], [data-proof-status]')) {
        if (!el.dataset.template) el.dataset.template = el.textContent ?? '';
        el.textContent = el.dataset.template
          .replace(/\{account\}/g, account)
          .replace(/\{handle\}/g, page)
          .replace(/\{sentBy\}/g, sentBy);
      }
      for (const el of screen.querySelectorAll<HTMLElement>('[data-proof-status]')) {
        el.hidden = el.dataset.proofStatus !== proof.status;
      }
      const done = proof.status !== 'waiting';
      const again = screen.querySelector<HTMLElement>('[data-proof-again]');
      if (again) again.hidden = !done || proof.status === 'verified';
      const wrap = screen.querySelector<HTMLElement>('[data-proof-code-wrap]');
      if (wrap) wrap.hidden = done;
      if (link) link.hidden = done;
    };

    if (proofShown && proofShown.id === proofId) paint(proofShown);

    const id = proofId;
    const tick = async () => {
      if (proofId !== id || steps[index] !== screen) return;
      let proof: Proof;
      try {
        proof = await getProof(id);
      } catch (err) {
        // A limit here is the poll allowance, which a real visitor never
        // reaches; anything else is transient. Either way: try again later.
        proofTimer = window.setTimeout(tick, PROOF_POLL_MS * 3);
        return;
      }
      if (proofId !== id || steps[index] !== screen) return;
      paint(proof);
      if (proof.status === 'verified') {
        beginRead(proof.handle, null, proof.id);
        window.setTimeout(() => {
          if (steps[index] === screen) next();
        }, 900);
        return;
      }
      if (proof.status === 'waiting') proofTimer = window.setTimeout(tick, PROOF_POLL_MS);
    };
    void tick();
  }

  function stopProofWatch() {
    if (proofTimer !== null) {
      clearTimeout(proofTimer);
      proofTimer = null;
    }
  }

  // A fresh code, for a proof that ended without passing. Costs a new human
  // check, minted on the button that asks for it.
  root.querySelector<HTMLButtonElement>('[data-proof-again]')?.addEventListener('click', async (ev) => {
    const button = ev.currentTarget as HTMLButtonElement;
    const screen = steps[index];
    if (!screen || screen.dataset.kind !== 'verify') return;
    button.disabled = true;
    try {
      const human = await turnstileToken(button);
      const proof = await startProof(handle, human.token);
      if (!proof) {
        beginRead(handle, human.token, null);
        go(steps.findIndex((s) => s.dataset.kind === 'analyzing'));
        return;
      }
      proofId = proof.id;
      proofShown = proof;
      save();
      void runVerify(screen);
    } catch {
      /* The status line already says what happened; leave it. */
    } finally {
      button.disabled = false;
    }
  });

  root.querySelector<HTMLElement>('[data-proof-change]')?.addEventListener('click', () => {
    stopProofWatch();
    proofId = null;
    proofShown = null;
    save();
    go(steps.findIndex((s) => s.dataset.kind === 'start'), true);
  });

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
      if (kindFor(e) === 'human') {
        // The read never started: the backend could not tell they were a
        // person. That is retryable from the form, so the walk goes back a
        // screen with the backend's own words under it, rather than ending.
        backToStart(messageFor(e));
      } else {
        fail(messageFor(e), kindFor(e));
      }
    } finally {
      analyzing = false;
    }
  }

  function backToStart(message: string) {
    read = null;
    readFailed = null;
    readProgress = 0;
    auditId = null;
    const at = steps.findIndex((s) => s.dataset.kind === 'start');
    go(at >= 0 ? at : 0, true);
    const form = steps[at]?.querySelector<HTMLElement>('[data-start-form]');
    const error = form?.querySelector<HTMLElement>('[data-start-error]');
    if (error) {
      error.textContent = message;
      error.hidden = false;
    }
  }

  // ---- The findings ------------------------------------------------------------

  let result: AuditResult | null = null;
  let idea: IdeaResult | null = null;

  /** `{name}` placeholders, filled from the backend's figures. */
  function fill(template: string, values: object): string {
    const bag = values as Record<string, unknown>;
    return template.replace(/\{(\w+)\}/g, (m, k: string) =>
      k in bag ? String(bag[k]) : m,
    );
  }

  function tpl(name: string) {
    const t = root.querySelector<HTMLTemplateElement>(`[data-tpl="${name}"]`);
    if (!t) throw new Error(`missing template ${name}`);
    return t.content.firstElementChild!.cloneNode(true) as HTMLElement;
  }

  const field = (el: HTMLElement, name: string) =>
    el.querySelector<HTMLElement>(`[data-f="${name}"]`);

  const isIdea = (value: AuditResult | IdeaResult): value is IdeaResult => 'topics' in value;

  function showResult(value: AuditResult | IdeaResult) {
    const screen = steps.find((s) => s.dataset.kind === 'result');
    const headline = screen?.querySelector<HTMLElement>('[data-result-headline]');
    const factsHost = screen?.querySelector<HTMLElement>('[data-facts]');
    const eyebrow = screen?.querySelector<HTMLElement>('.screen__eyebrow');
    const teaser = screen?.querySelector<HTMLElement>('.lead__title');

    renderWho(screen, isIdea(value) ? null : value.profile);

    if (isIdea(value)) {
      // The starter branch. Nothing was measured about a page, so nothing is
      // claimed about one — what is shown is the field the idea is walking
      // into, and the address is asked for on that footing.
      idea = value;
      if (eyebrow) eyebrow.textContent = say.result.starterEyebrow;
      if (headline) headline.textContent = say.result.starterHeadline;
      if (teaser) teaser.textContent = say.result.starterTeaser;
      if (factsHost) factsHost.hidden = true;
      renderIdea(value);
    } else {
      result = value;
      if (headline) headline.textContent = value.headline;
      renderStarter(null);
      renderFacts(value.facts);
      renderProjection(value);
      renderSize(value.size);
    }

    go(steps.findIndex((s) => s.dataset.kind === 'result'));
  }

  /**
   * The starter branch's screen: the pages already doing this, the angles he
   * would open with, and what waiting costs. Drawn again, unlocked, once an
   * address has been left.
   */
  function renderIdea(value: IdeaResult) {
    renderStarter(value);
  }

  function renderStarter(value: IdeaResult | null) {
    const screen = steps.find((s) => s.dataset.kind === 'result');
    const fieldHost = screen?.querySelector<HTMLElement>('[data-field]');
    const fieldList = screen?.querySelector<HTMLElement>('[data-field-list]');
    const topicsHost = screen?.querySelector<HTMLElement>('[data-topics]');
    const waiting = screen?.querySelector<HTMLElement>('[data-waiting]');
    const rewards = screen?.querySelector<HTMLElement>('[data-rewards]');

    const pages = value?.field?.pages ?? [];
    if (fieldHost) fieldHost.hidden = pages.length === 0;
    if (fieldList) {
      fieldList.textContent = '';
      for (const page of pages) {
        const el = tpl('page');
        field(el, 'handle')!.textContent = `@${page.handle}`;
        field(el, 'followers-label')!.textContent = say.result.fieldFollowers;
        field(el, 'followers')!.textContent = page.followersText || count(page.followers);
        field(el, 'pace-label')!.textContent = say.result.fieldPace;
        field(el, 'pace')!.textContent = page.postsPerMonth;
        field(el, 'rate-label')!.textContent = say.result.fieldRate;
        field(el, 'rate')!.textContent = page.responseRate;
        field(el, 'format-label')!.textContent = say.result.fieldFormat;
        field(el, 'format')!.textContent = page.bestFormat;
        fieldList.append(el);
      }
    }

    const topics = value?.topics ?? [];
    if (topicsHost) {
      topicsHost.hidden = topics.length === 0;
      topicsHost.textContent = '';
      for (const topic of topics) renderTopic(topicsHost, topic);
    }

    if (waiting) {
      const w = value?.waiting;
      waiting.hidden = !w;
      waiting.textContent = w ? fill(say.result.waiting, w) : '';
    }

    if (rewards) {
      const r = value?.field?.rewards;
      rewards.hidden = !r;
      rewards.textContent = r ? fill(say.result.rewards, r) : '';
    }
  }

  function renderTopic(host: HTMLElement, topic: Topic) {
    const el = tpl('topic');
    const locked = Boolean(topic.locked) || !topic.hook;
    el.toggleAttribute('data-locked', locked);
    field(el, 'format')!.textContent = topic.format;
    field(el, 'title')!.textContent = topic.title;
    field(el, 'hook')!.textContent = locked ? '' : topic.hook;
    const held = field(el, 'held');
    if (held) {
      held.textContent = say.result.heldBack;
      held.hidden = !locked;
    }
    const ghost = field(el, 'ghost');
    if (ghost) ghost.hidden = !locked;
    host.append(el);
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
      // A locked fact arrives with its value and text empty. The card still
      // earns its place on the label; a shape stands in for the figure.
      const locked = Boolean(fact.locked);
      el.toggleAttribute('data-locked', locked);
      field(el, 'label')!.textContent = fact.label;
      field(el, 'value')!.textContent = locked ? '' : fact.value;
      field(el, 'text')!.textContent = locked ? '' : fact.text;
      const held = field(el, 'held');
      if (held) {
        held.textContent = say.result.heldBack;
        held.hidden = !locked;
      }
      const ghost = field(el, 'ghost');
      if (ghost) ghost.hidden = !locked;

      const meter = field(el, 'meter');
      if (fact.meter && meter && !locked) {
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
      // The locale names the bar; the backend only sizes it. `side.label` is composed in
      // English in the arithmetic and is the fallback, not the source.
      const gain = wrap.querySelector<HTMLElement>('.gain');
      const named = key === 'now' ? gain?.dataset.nowLabel : gain?.dataset.thenLabel;
      bar.querySelector<HTMLElement>('[data-bar-label]')!.textContent = named || side.label;
      bar.querySelector<HTMLElement>('[data-bar-amount]')!.textContent = side.amount;
      bar.querySelector<HTMLElement>('[data-bar-pace]')!.textContent = side.pace;
      const fill = bar.querySelector<HTMLElement>('[data-bar-fill]')!;
      // Next frame, so the transition has a zero to grow from.
      requestAnimationFrame(() =>
        fill.style.setProperty('--grown', String(Math.max(0.04, side.value / tallest))),
      );
    }

    renderHorizons(wrap, projection);

    const moves = wrap.querySelector<HTMLElement>('[data-projection-moves]');
    if (!moves) return;
    moves.textContent = '';
    for (const move of projection.moves) {
      const el = tpl('move');
      field(el, 'text')!.textContent = move;
      moves.append(el);
    }
  }

  /**
   * What a page this size could be doing.
   *
   * Arrives with the unlock, next to the projection. Skipped entirely when the
   * backend sent nothing — a titled block with no lines under it would be a
   * promise with nothing in it.
   */
  function renderSize(size: Size | null | undefined) {
    const screen = steps.find((s) => s.dataset.kind === 'plan');
    const block = screen?.querySelector<HTMLElement>('[data-size]');
    const title = screen?.querySelector<HTMLElement>('[data-size-title]');
    const list = screen?.querySelector<HTMLElement>('[data-size-list]');
    if (!block || !list) return;
    if (!size || !size.lines?.length) {
      block.hidden = true;
      return;
    }
    if (title) title.textContent = say.plan?.sizeTitle?.[size.tier] ?? say.plan?.sizeTitle?.['1k'] ?? '';
    list.textContent = '';
    for (const line of size.lines) {
      const el = tpl('size-line');
      field(el, 'value')!.textContent = line.value;
      field(el, 'text')!.textContent = line.text;
      list.append(el);
    }
    block.hidden = false;
  }

  /**
   * One month, six months, a year.
   *
   * Skipped entirely when the read was cached before horizons existed — an absent strip is
   * correct there, because the projection beside it is still true and a strip built from
   * nothing would not be.
   */
  function renderHorizons(wrap: HTMLElement, projection: Projection) {
    const section = wrap.querySelector<HTMLElement>('[data-horizons]');
    const list = wrap.querySelector<HTMLElement>('[data-horizons-list]');
    const horizons = projection.horizons;
    if (!section || !list) return;
    if (!horizons || !horizons.length) {
      section.hidden = true;
      return;
    }

    section.hidden = false;
    list.textContent = '';
    // Every bar is drawn against the longest window, so the three of them read as one
    // shape growing rather than three unrelated cards each full to its own edge.
    const furthest = Math.max(...horizons.map((h) => h.value), 1);

    // The "n of them new" wording rides on the section rather than the runtime copy
    // payload: it is the only string this function needs, and the payload is a
    // contract shared with several other screens.
    const newLabel = section.dataset.horizonsNew ?? '{n}';

    for (const horizon of horizons) {
      const el = tpl('horizon');
      // Same split: the month count is a fact, what to call it is a language. Keyed by
      // word rather than by number — `data-when-12` does not survive the dataset
      // camel-casing rule, which only folds a hyphen followed by a letter.
      const when =
        horizon.months <= 1
          ? section.dataset.whenMonth
          : horizon.months <= 6
            ? section.dataset.whenHalf
            : section.dataset.whenYear;
      field(el, 'label')!.textContent = when || horizon.label;
      field(el, 'total')!.textContent = horizon.total;
      field(el, 'extra')!.textContent = newLabel.replace('{n}', horizon.extra);
      const fill = field(el, 'fill');
      if (fill) {
        requestAnimationFrame(() =>
          fill.style.setProperty('--grown', String(Math.max(0.03, horizon.value / furthest))),
        );
      }
      list.append(el);
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

    const giveBack = (message: string) => {
      if (error) {
        error.textContent = message;
        error.hidden = false;
      }
      submit.disabled = false;
      submit.textContent = say.result.cta;
    };

    const human = await turnstileToken(submit);
      // Never refused here. Whether a missing token matters is the backend's decision
      // and only the backend knows the answer: it may have the check switched off, it
      // may be unconfigured, or it may refuse — and if it refuses it says so in words
      // this page then shows. Deciding locally is how a page went on blocking people
      // for an hour after the server had started letting everybody through.

    try {
      if (auditId) {
        // The answer is the same view, unlocked. Nothing is flipped here: what
        // the backend chose to open is what gets drawn.
        const opened = await saveLead(auditId, email, consent, answers, human.token);
        if (isIdea(opened)) {
          idea = opened;
          renderStarter(opened);
        } else if ('facts' in opened) {
          result = opened;
          renderFacts(opened.facts);
          renderProjection(opened);
          renderSize(opened.size);
        }
      }
      await toPlan();
    } catch (err) {
      // A refused human check keeps the form open: the backend's message says
      // what happened, and the next press mints a fresh token.
      giveBack(messageFor(err));
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
    const human = await turnstileToken(submit);
      // Never refused here. Whether a missing token matters is the backend's decision
      // and only the backend knows the answer: it may have the check switched off, it
      // may be unconfigured, or it may refuse — and if it refuses it says so in words
      // this page then shows. Deciding locally is how a page went on blocking people
      // for an hour after the server had started letting everybody through.

    try {
      await saveWaitingLead(handle, email, consent, answers, human.token);
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
    proofId = saved.proofId ?? null;
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
    // A proof in flight is the one closing screen worth landing back on.
    const proving = kind === 'verify' && Boolean(proofId);
    if (at < 0 || (!auditId && CLOSING.has(kind ?? '') && !proving)) {
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

function messageFor(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return FALLBACK_GENERIC;
}

function kindFor(err: unknown): AuditErrorKind {
  return err instanceof ApiError ? err.kind : 'error';
}
