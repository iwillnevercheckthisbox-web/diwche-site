/**
 * The funnel's clock.
 *
 * Three things here are worth knowing before changing anything.
 *
 * 1. The read starts at the handle screen and runs underneath every question
 *    after it. By the time the analysing screen appears the work is usually
 *    already done, which is why that screen is a short honest wait rather than
 *    a staged one — and why the handle is asked early rather than at the end.
 * 2. A single-answer screen advances on tap. There is no Next button to press,
 *    so the only screens that carry one are the ones where several answers are
 *    allowed and the funnel cannot know when you are finished.
 * 3. Progress survives a reload. The answers, the step and the audit id are
 *    kept, and the read is re-attached by id rather than started again.
 */
import {
  ApiError,
  getAudit,
  getTopics,
  requestProof,
  saveLead,
  saveWaitingLead,
  startAudit,
  startIdea,
  watchAudit,
  type Answers,
  type AuditErrorKind,
  type AuditResult,
  type Fact,
  type Topic,
} from '../lib/publicApi';

const HANDLE = /^@?[A-Za-z0-9._]{1,30}$/;
const STORE = 'diwche-funnel';
/** Long enough that the ring reads as work, short enough not to be a stall. */
const MIN_ANALYZING = 2600;
const TIP_EVERY = 4200;
/** The circumference the ring's stroke-dasharray is cut to. */
const RING = 327;

const root = document.querySelector<HTMLElement>('[data-funnel]');
if (root) run(root);

interface Saved {
  step: number;
  answers: Answers;
  auditId: string | null;
  handle: string;
  branch: 'page' | 'idea';
}

function run(root: HTMLElement) {
  const screens = Array.from(root.querySelectorAll<HTMLElement>('[data-screen]'));
  const steps = screens.filter((s) => s.dataset.kind !== 'error');
  const errorScreen = screens.find((s) => s.dataset.kind === 'error') ?? null;

  const backBtn = root.querySelector<HTMLElement>('[data-back]');
  const progress = root.querySelector<HTMLElement>('[data-progress]');
  const countNow = root.querySelector<HTMLElement>('[data-step-now]');
  const countWrap = root.querySelector<HTMLElement>('.bar__count');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let index = 0;
  let answers: Answers = {};
  let auditId: string | null = null;
  let handle = '';
  let branch: 'page' | 'idea' = 'page';

  /** The read, running underneath the questions. Settled or not, it lives here. */
  let read: Promise<AuditResult | Topic[]> | null = null;
  let readFailed: unknown = null;
  let readProgress = 0;
  let readLine = 'Finding the page…';

  // ---- Persistence ---------------------------------------------------------

  function save() {
    try {
      const state: Saved = { step: index, answers, auditId, handle, branch };
      sessionStorage.setItem(STORE, JSON.stringify(state));
    } catch {
      /* Private mode. Losing the ability to resume is not worth an error. */
    }
  }

  function restore(): Saved | null {
    try {
      const raw = sessionStorage.getItem(STORE);
      return raw ? (JSON.parse(raw) as Saved) : null;
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

  function paint(reverse: boolean) {
    const live = steps[index];
    for (const s of screens) {
      const on = s === live;
      s.hidden = !on;
      s.toggleAttribute('data-live', on);
      s.toggleAttribute('data-reverse', on && reverse);
    }

    const pct = ((index + 1) / steps.length) * 100;
    if (progress) progress.style.width = `${pct}%`;
    if (countNow) countNow.textContent = String(index + 1);

    // Past the analysing screen there are no more steps to take, so a counter
    // and a back arrow would both be describing something that is over.
    const kind = live?.dataset.kind ?? '';
    const closing = kind === 'analyzing' || kind === 'result' || kind === 'plan';
    backBtn?.toggleAttribute('data-off', index === 0 || closing);
    countWrap?.toggleAttribute('data-off', closing);

    root.querySelector('.stage')?.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    live?.querySelector<HTMLElement>('input, textarea')?.focus({ preventScroll: true });
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
    if (screen.dataset.kind === 'analyzing') void runAnalyzing();
  }

  // ---- Questions -------------------------------------------------------------

  for (const screen of steps) {
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
          save();
          return;
        }

        for (const other of options) other.removeAttribute('data-chosen');
        option.setAttribute('data-chosen', '');
        answers[id] = value;
        if (id === 'goal') applyGoal(value);
        save();
        // A beat, so the choice is visibly registered before the screen leaves.
        setTimeout(next, reduced ? 0 : 220);
      });
    }

    cont?.addEventListener('click', () => next());
  }

  /**
   * Someone with no page yet cannot have one read, so the same screen asks for
   * the subject instead and the whole flow switches to the idea branch.
   */
  function applyGoal(value: string) {
    branch = value === 'new' ? 'idea' : 'page';
    const start = steps.find((s) => s.dataset.kind === 'start');
    if (!start) return;
    const title = start.querySelector<HTMLElement>('[data-start-title]');
    const lead = start.querySelector<HTMLElement>('[data-start-lead]');
    const handleWrap = start.querySelector<HTMLElement>('[data-handle-wrap]');
    const ideaWrap = start.querySelector<HTMLElement>('[data-idea-wrap]');

    if (branch === 'idea') {
      if (title) title.textContent = 'What would the page be about?';
      if (lead)
        lead.textContent =
          'He cannot read a page that does not exist yet, so tell him the subject and he will work out the angles worth building it on.';
      if (handleWrap) handleWrap.hidden = true;
      if (ideaWrap) ideaWrap.hidden = false;
    } else {
      if (title) title.textContent = 'Which page should he read?';
      if (lead)
        lead.textContent =
          'He reads only what your profile already shows. No password, and nothing is connected until you say so.';
      if (handleWrap) handleWrap.hidden = false;
      if (ideaWrap) ideaWrap.hidden = true;
    }
  }

  // ---- Insights ---------------------------------------------------------------

  for (const button of root.querySelectorAll<HTMLElement>('[data-next]')) {
    button.addEventListener('click', () => next());
  }

  backBtn?.addEventListener('click', () => go(index - 1, true));

  // ---- The handle, and the read that starts here --------------------------------

  const startForm = root.querySelector<HTMLFormElement>('[data-start-form]');
  startForm?.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const error = startForm.querySelector<HTMLElement>('[data-start-error]');

    if (branch === 'idea') {
      const idea = startForm.querySelector<HTMLTextAreaElement>('#idea')!.value.trim();
      if (idea.length < 3) {
        if (error) {
          error.textContent = 'A sentence is enough, but he needs one.';
          error.hidden = false;
        }
        return;
      }
      if (error) error.hidden = true;
      answers.idea = idea;
      beginIdea(idea);
      next();
      return;
    }

    const value = startForm.querySelector<HTMLInputElement>('#handle')!.value.trim();
    if (!HANDLE.test(value)) {
      if (error) {
        error.textContent = 'That is not an Instagram handle — letters, numbers, dots.';
        error.hidden = false;
      }
      return;
    }
    if (error) error.hidden = true;
    handle = value.replace(/^@/, '');
    answers.handle = handle;
    beginRead(handle);
    next();
  });

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
      const started = await startAudit(clean, await turnstileToken());
      return track(started.id).done;
    })().catch((err) => {
      readFailed = err;
      throw err;
    });
  }

  function beginIdea(idea: string) {
    read = (async () => {
      const started = await startIdea(idea, await turnstileToken());
      auditId = started.id;
      save();
      readProgress = 0.5;
      readLine = 'Turning it over…';
      const { topics } = await getTopics(started.id, 'idea', idea);
      readProgress = 1;
      return topics;
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

  // ---- Analysing ------------------------------------------------------------------

  let analyzing = false;

  async function runAnalyzing() {
    if (analyzing) return;
    analyzing = true;

    const screen = steps.find((s) => s.dataset.kind === 'analyzing');
    const ring = screen?.querySelector<SVGCircleElement>('[data-ring]');
    const pct = screen?.querySelector<HTMLElement>('[data-pct]');
    const line = screen?.querySelector<HTMLElement>('[data-analyzing-line]');
    const tip = screen?.querySelector<HTMLElement>('[data-tip]');
    const tipsPayload = screen?.querySelector<HTMLElement>('[data-tips]');

    let tips: string[] = [];
    try {
      tips = JSON.parse(tipsPayload?.textContent ?? '[]') as string[];
    } catch {
      tips = [];
    }

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

    let tipIndex = 0;
    const tipTimer = tips.length
      ? setInterval(() => {
          tipIndex = (tipIndex + 1) % tips.length;
          tip?.setAttribute('data-fading', '');
          setTimeout(
            () => {
              if (tip) tip.textContent = tips[tipIndex];
              tip?.removeAttribute('data-fading');
            },
            reduced ? 0 : 220
          );
        }, TIP_EVERY)
      : null;

    const settle = new Promise((r) => setTimeout(r, MIN_ANALYZING));

    try {
      const [value] = await Promise.all([read ?? Promise.reject(new Error('no read')), settle]);
      readProgress = 1;
      // Let the ring visibly reach the end before the screen changes.
      await new Promise((r) => setTimeout(r, reduced ? 0 : 700));
      clearInterval(ticker);
      if (tipTimer) clearInterval(tipTimer);
      showResult(value);
    } catch (err) {
      clearInterval(ticker);
      if (tipTimer) clearInterval(tipTimer);
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
    const leadTitle = screen?.querySelector<HTMLElement>('[data-lead-title]');

    if (Array.isArray(value)) {
      // The idea branch: nothing was measured, so there is nothing to claim.
      // Three angles is the honest equivalent of five findings.
      if (headline) headline.textContent = 'Three angles he would build it on.';
      if (factsHost) factsHost.hidden = true;
      if (topicsHost) {
        topicsHost.hidden = false;
        topicsHost.textContent = '';
        for (const topic of value) {
          const el = tpl('topic');
          field(el, 'format')!.textContent = topic.format;
          field(el, 'title')!.textContent = topic.title;
          field(el, 'hook')!.textContent = topic.hook;
          topicsHost.append(el);
        }
      }
      if (leadTitle) leadTitle.textContent = 'Where should he send the rest?';
    } else {
      result = value;
      if (headline) headline.textContent = value.headline;
      renderFacts(value.facts);
      renderProjection(value);
    }

    go(steps.findIndex((s) => s.dataset.kind === 'result'));
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
          mark.style.left = `${Math.max(0, Math.min(100, (fact.meter.benchmark / fact.meter.max) * 100))}%`;
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
    const headline = screen?.querySelector<HTMLElement>('[data-plan-headline]');

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
    submit.textContent = 'One moment…';

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
      submit.textContent = 'Show me the rest';
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
      submit.textContent = 'He has it';
    } catch (err) {
      if (error) {
        error.textContent = messageFor(err);
        error.hidden = false;
      }
      submit.disabled = false;
    }
  });

  function check(email: string, consent: boolean): string | null {
    if (!email.includes('@') || email.length < 5) return 'That address does not look right.';
    if (!consent) return 'Tick the box and he will know he may write to you.';
    return null;
  }

  async function toPlan() {
    go(steps.findIndex((s) => s.dataset.kind === 'plan'));
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
      button.textContent = 'Copied';
      setTimeout(() => (button.textContent = 'Copy the code'), 1800);
    } catch {
      button.textContent = 'Copy it by hand';
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
  if (saved && saved.step > 0) {
    answers = saved.answers ?? {};
    auditId = saved.auditId;
    handle = saved.handle ?? '';
    branch = saved.branch ?? 'page';
    if (typeof answers.goal === 'string') applyGoal(answers.goal);
    restoreChoices();
    // A read already in flight is picked back up by id rather than paid for
    // twice, which also means a reload never costs a second scrape.
    if (auditId) resumeRead(auditId);
    // Landing straight back on the analysing screen with no read behind it
    // would hang, so that one step goes back to the handle.
    const kind = steps[saved.step]?.dataset.kind;
    const safe = !auditId && (kind === 'analyzing' || kind === 'result' || kind === 'plan');
    go(safe ? steps.findIndex((s) => s.dataset.kind === 'start') : saved.step);
  } else {
    go(0);
  }

  function restoreChoices() {
    for (const screen of steps) {
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
  return 'Something went wrong on our side, not yours.';
}

function kindFor(err: unknown): AuditErrorKind {
  return err instanceof ApiError ? err.kind : 'error';
}
