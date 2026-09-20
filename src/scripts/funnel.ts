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
  type Peer,
  type Projection,
  type Section,
  type Size,
  type Topic,
  type Verdict,
  startProof,
  getProof,
  setApiMessages,
  type Proof,
} from '../lib/publicApi';
import { turnstileToken } from './turnstile';
import { drawTimeline } from './readChart';

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
const SAVE_VERSION = 5;
/**
 * How long the wait lasts, whatever the read costs.
 *
 * This was 3.4 seconds, which is roughly what a cached read actually takes — so
 * the screen built to show the rest of the product appeared and left before
 * anybody could read a single card of it, and the ring got to about five per
 * cent before the report replaced it. That is not a fast product; that is a
 * screen nobody sees.
 *
 * Thirty seconds is the length the cards were written for. It is deliberately
 * not "however long the read takes": the read is usually finished in three
 * seconds and occasionally takes twenty, and a wait whose length is decided by
 * our cache hit rate is a different experience for every visitor.
 *
 * The read is still awaited first. A failure does not sit here for half a
 * minute before saying so — only a success waits, and it says so while it does.
 */
const MIN_ANALYZING = 30000;
/**
 * The ceiling the ring holds at while the read is still running.
 *
 * The ring is paced by the clock rather than by the work, because the work
 * finishes long before the screen does. But it must never sit at 100% with the
 * read unfinished, so a read that outlasts the wait parks the ring here until
 * it lands.
 */
const RING_HOLD = 0.94;
/**
 * When each card of "the rest of what he does" arrives.
 *
 * Six cards dealt in one frame is six cards a reader has finished with in four
 * seconds. Spread across the wait, each one is a reason to still be looking.
 */
const CARD_EVERY_MIN = 1200;
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
  /**
   * The receipt for an address left on this read.
   *
   * Kept so a reload does not ask for the address again, and sent on every later view. It
   * belongs to this visitor rather than to the read: a cached read is shared by everyone who
   * looks up the same handle, and the gate used to open for all of them the moment one person
   * left an address.
   */
  token: string | null;
  /** Pages the visitor named to be measured against, so a reload does not lose them. */
  rivals: string[];
  /**
   * The address, left at the end of the questionnaire rather than after the read.
   *
   * Kept so a reload does not ask for it twice, and so the read that finishes afterwards can be
   * attached to it without another screen. It is the visitor's own; nothing else on this page
   * carries it.
   */
  email: string;
  consent: boolean;
  /**
   * Whether the server is asking anybody to prove a page is theirs today.
   *
   * A deployment with the proof step switched off answers the first request with a 503, and the
   * verify screen then has nothing to show — so it leaves the walk entirely rather than being
   * landed on with no code. Remembered because a reload must not put it back.
   */
  proofOff: boolean;
}

/**
 * The slice of `FunnelCopy` the script needs, mirrored here because the script
 * reads it out of the page as JSON rather than importing the module.
 */
/** The order the report is drawn in. The backend sorts to it too; this is what names them. */
const SECTIONS: Section[] = ['rhythm', 'format', 'audience', 'peers', 'words'];

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
  result: Record<string, any>;
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
  // The two sentences the API module has to say for itself — a bare 429, and a response that
  // was not JSON — handed to it out of this page's own copy. Without this they were English
  // literals shown on a Persian screen at the worst possible moment.
  setApiMessages({ limit: say.runtime.limit, generic: say.runtime.generic });

  let index = 0;
  let answers: Answers = {};
  let auditId: string | null = null;
  let proofId: string | null = null;
  let handle = '';
  let branch: 'page' | 'idea' = 'page';
  let token: string | null = null;
  let rivals: string[] = [];
  let email = '';
  let consent = false;
  let proofOff = false;
  /**
   * Set when the address was taken but could not be attached to the read.
   *
   * The address is asked for before the read runs, so by the time it can be stored there is no
   * form on screen to complain to. Rather than lose it silently, the result screen puts its own
   * form back — which is what that form is for now, and the only time it is seen.
   */
  let addressUnsaved = false;

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
    // Only a page can be proven. The idea branch has nothing to send a code from, and a
    // deployment with the step switched off has no code to show — that used to be handled by
    // jumping over the screen, which stopped working the moment there was another screen
    // between the handle and the read. It leaves the walk instead.
    if (screen.dataset.kind === 'verify') return branch === 'page' && !proofOff;
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
        token,
        rivals,
        email,
        consent,
        proofOff,
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
          // The proof step is switched off on this server. The read goes ahead on the token
          // instead — but the walk carries on through the screens after this one rather than
          // leaping to the wait, because one of them is where the address is asked for.
          proofOff = true;
          beginRead(handle, human.token, null);
          recomputeSteps();
          save();
          next();
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

  // ---- Who they are up against ---------------------------------------------------

  const rivalsForm = root.querySelector<HTMLFormElement>('[data-rivals-form]');
  rivalsForm?.addEventListener('submit', (ev) => {
    ev.preventDefault();
    rivals = Array.from(rivalsForm.querySelectorAll<HTMLInputElement>('[data-rival]'))
      .map((input) => input.value.trim().replace(/^@/, ''))
      .filter((value) => HANDLE.test(value));
    save();
    next();
  });
  root.querySelector<HTMLElement>('[data-rivals-skip]')?.addEventListener('click', () => {
    rivals = [];
    save();
    next();
  });

  // ---- The address, asked before the read rather than after it ------------------

  /**
   * The last screen of the questionnaire.
   *
   * It used to sit on the result screen, holding four findings behind a blur until somebody
   * paid for them with an email. That only works if there is something behind the blur worth
   * paying for, and there is not — the whole report is shown either way, which made the trade a
   * toll booth rather than a bargain. Here it is the ordinary end of filling something in, and
   * the report that follows arrives whole.
   *
   * Nothing is sent from here. There is no read to attach an address to yet — that is the whole
   * point of asking now — so it is held and posted the moment the read lands, in `openWith`.
   */
  const emailForm = root.querySelector<HTMLFormElement>('[data-email-form]');
  emailForm?.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const input = emailForm.querySelector<HTMLInputElement>('#walk-email')!;
    const ticked = emailForm.querySelector<HTMLInputElement>('[data-email-consent]')!.checked;
    const error = emailForm.querySelector<HTMLElement>('[data-email-error]');

    const complaint = check(input.value.trim(), ticked);
    if (complaint) {
      if (error) {
        error.textContent = complaint;
        error.hidden = false;
      }
      return;
    }
    if (error) error.hidden = true;

    email = input.value.trim();
    consent = ticked;
    addressUnsaved = false;
    save();
    next();
  });

  /**
   * The read, with the address already given attached to it.
   *
   * Returns whatever should be shown: the unlocked view when the address went through, and the
   * read exactly as it arrived when it did not. Nothing here can lose the report — the worst
   * outcome is that the result screen puts its own address form back, which is what that form
   * is for now.
   */
  async function openWith(value: AuditResult | IdeaResult): Promise<AuditResult | IdeaResult> {
    if (!email || !auditId || token) return value;
    try {
      return await attach(null);
    } catch (err) {
      // One retry, and only for the one failure a retry can fix. The walk passed the human
      // check when the read began, minutes ago, and the backend's own grace covers that — so
      // this is rare, and asking the widget again is the only thing left to try.
      if (kindFor(err) === 'human') {
        try {
          const human = await turnstileToken();
          return await attach(human.token);
        } catch {
          /* Falls through to the form below, with the read intact. */
        }
      }
      addressUnsaved = true;
      return value;
    }
  }

  async function attach(human: string | null): Promise<AuditResult | IdeaResult> {
    const opened = await saveLead(auditId!, email, consent, answers, human);
    if (typeof opened.token === 'string') {
      token = opened.token;
      save();
    }
    return opened;
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
      const started = await startAudit(
        clean, human, document.documentElement.lang || 'en', proof, rivals);
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

      // An empty answer is a legitimate answer on this branch, and it always has been: nothing
      // was measured, so nothing is claimed, and the screen it leads to is written to hold a
      // page with no angles on it. What was not legitimate was killing the whole walk when the
      // call itself failed — a poll allowance spent by a dropped stream, a model over quota —
      // which is what put a Persian visitor on the error screen with "he stopped" over it and
      // made a transient refusal look like a broken feature.
      let answer: IdeaResult;
      try {
        answer = await getTopics(started.id, 'idea', idea, locale, token);
      } catch (err) {
        if (kindFor(err) === 'human') throw err;
        console.warn('The angles could not be fetched; showing the branch without them.', err);
        answer = { unlocked: false, topics: [], field: null, waiting: null };
      }
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
        return await getAudit(id, token);
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
        proofOff = true;
        beginRead(handle, human.token, null);
        recomputeSteps();
        save();
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
    const ready = screen?.querySelector<HTMLElement>('[data-analyzing-ready]');

    /**
     * The ring is paced by the clock, not by the work.
     *
     * It used to follow `readProgress`, which is the backend's own figure — and a cached read
     * reports nothing at all before it reports being finished, so the ring sat at the five per
     * cent floor for its whole life and then the screen changed. That is the reported bug, and
     * the figure was not wrong: there was simply no work left to describe.
     *
     * So the number on screen is how far through the wait the visitor is, which is the thing
     * the wait is actually about. The work still has a veto: until the read has landed the ring
     * holds below the end, so it can never claim to be finished before it is.
     */
    const startedAt = Date.now();
    let settled = false;
    let shown = 0;
    const paintRing = () => {
      const elapsed = (Date.now() - startedAt) / MIN_ANALYZING;
      const target = Math.min(settled ? 1 : RING_HOLD, Math.max(elapsed, 0.02));
      shown += (target - shown) * 0.12;
      const clamped = Math.max(0, Math.min(1, shown));
      if (ring) ring.style.strokeDashoffset = String(RING - RING * clamped);
      if (pct) pct.textContent = String(Math.round(clamped * 100));
      if (line && readLine) line.textContent = readLine;
    };
    paintRing();
    const ticker = setInterval(paintRing, 60);
    const dealing = dealCards(screen);

    const settle = new Promise((r) => setTimeout(r, MIN_ANALYZING));

    try {
      // Awaited before the wait, not alongside it. A read that failed says so at once rather
      // than holding somebody on a progress ring for half a minute to tell them bad news.
      const got = await (read ?? Promise.reject(new Error('no read')));
      // The address was taken at the end of the questionnaire, so this is where it becomes a
      // stored lead and an unlocked report — inside the wait, where it costs nothing.
      const value = await openWith(got);
      settled = true;
      readProgress = 1;
      // Said out loud rather than hidden: the read is done, the wait is not, and pretending
      // otherwise would be the one dishonest line on the page.
      if (ready) ready.hidden = false;
      await settle;
      // Let the ring visibly reach the end before the screen changes.
      await new Promise((r) => setTimeout(r, reduced ? 0 : 700));
      clearInterval(ticker);
      clearInterval(dealing);
      showResult(value);
    } catch (err) {
      clearInterval(ticker);
      clearInterval(dealing);
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

  /**
   * The cards, dealt one at a time across the wait.
   *
   * `renderRest` has already put them all in the DOM; this only decides when each becomes
   * visible. Spread across the wait rather than staggered by a fixed delay, so two cards and
   * six cards both fill the same thirty seconds — the number of them depends on what the
   * visitor admitted to on Q2, and a fixed stagger would leave four of the six unseen.
   */
  function dealCards(screen: HTMLElement | undefined): ReturnType<typeof setInterval> {
    const cards = Array.from(screen?.querySelectorAll<HTMLElement>('.rest__card') ?? []);
    if (!cards.length) return setInterval(() => {}, 1 << 30);
    let at = 0;
    const deal = () => {
      const card = cards[at++];
      if (card) card.setAttribute('data-in', '');
    };
    deal();
    // Two thirds of the wait, so the last card is not still arriving as the screen leaves.
    const every = Math.max(CARD_EVERY_MIN, (MIN_ANALYZING * 0.66) / cards.length);
    return setInterval(deal, every);
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
      renderReport(value);
      renderProjection(value);
      renderSize(value.size);
    }

    showTheWayOn(screen);
    go(steps.findIndex((s) => s.dataset.kind === 'result'));
  }

  /**
   * What sits under the report: a button, or the form that used to be there.
   *
   * The address is asked for at the end of the questionnaire now, so by the time anybody sees
   * this it has almost always been given and attached — and a form asking again for something
   * already handed over, under a report that is already whole, is the toll booth this change
   * exists to remove. The form survives for the one case that still needs it: an address that
   * was taken and could not be stored.
   */
  function showTheWayOn(screen: HTMLElement | undefined) {
    const teaser = screen?.querySelector<HTMLElement>('[data-result-teaser]');
    const onward = screen?.querySelector<HTMLElement>('[data-onward]');
    const form = screen?.querySelector<HTMLElement>('[data-lead-form]');
    const asked = Boolean(email) && !addressUnsaved;
    if (teaser) teaser.hidden = !asked;
    if (onward) onward.hidden = !asked;
    if (form) form.hidden = asked;
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

  /**
   * The whole read, as a report.
   *
   * The chart first — it is the evidence every section below is drawn from, and the only part a
   * reader can check against their own grid. Then one block per section, each headed by its own
   * word and a single verdict, so that findings which share an input are visibly grouped rather
   * than presented as five separate discoveries.
   */
  function renderReport(value: AuditResult) {
    const screen = steps.find((s) => s.dataset.kind === 'result');
    if (!screen) return;

    renderChart(screen, value);

    const host = screen.querySelector<HTMLElement>('[data-sections]');
    if (!host) return;
    host.textContent = '';

    for (const section of SECTIONS) {
      const facts = value.facts.filter((f) => f.section === section);
      const peers = section === 'peers' ? value.peers ?? [] : [];
      if (!facts.length && !peers.length) continue;

      const block = tpl('section');
      field(block, 'title')!.textContent = say.result.sections?.[section] ?? section;

      // The verdict is the section's own where the backend computed one for the whole thing,
      // and otherwise the worst of the findings under it — a section is only as good as its
      // weakest true statement.
      const verdict = verdictFor(section, facts, value);
      const word = field(block, 'verdict');
      if (word) {
        word.textContent = verdict ? say.result.verdicts?.[verdict] ?? '' : '';
        if (verdict) word.setAttribute('data-verdict', verdict);
        word.hidden = !verdict;
      }

      const factsHost = field(block, 'facts');
      if (factsHost) for (const fact of facts) factsHost.append(card(fact));

      const peersHost = field(block, 'peers');
      if (peersHost) {
        peersHost.hidden = peers.length === 0;
        for (const peer of peers) peersHost.append(peerRow(peer));
      }

      host.append(block);
    }
  }

  /** How bad a section reads: what the backend said about it, else its worst finding. */
  function verdictFor(section: Section, facts: Fact[], value: AuditResult): Verdict | null {
    if (section === 'rhythm' && value.rhythm) return value.rhythm.verdict;
    if (section === 'audience' && value.audience) return value.audience.verdict;
    const rank: Verdict[] = ['dead', 'bad', 'weak', 'neutral', 'good'];
    for (const level of rank) {
      if (facts.some((f) => f.verdict === level)) return level;
    }
    return null;
  }

  /**
   * One post per bar, drawn from the timeline the backend always sends.
   *
   * Skipped rather than faked when there is nothing datable to draw: an empty frame under a
   * heading promising every post is worse than no frame.
   */
  function renderChart(screen: HTMLElement, value: AuditResult) {
    const wrap = screen.querySelector<HTMLElement>('[data-chart]');
    const plot = screen.querySelector<HTMLElement>('[data-chart-plot]');
    if (!wrap || !plot) return;
    const points = value.timeline ?? [];
    if (points.length < 2) {
      wrap.hidden = true;
      return;
    }
    const locale = document.documentElement.lang || 'en';
    const drawn = drawTimeline(plot, points, {
      locale,
      rtl: document.documentElement.dir === 'rtl',
      summary: say.result.chartTitle ?? '',
      words: {
        quiet: say.result.chartQuiet ?? '{days}',
        count: say.result.chartCount ?? '{count}',
        hidden: say.result.chartHidden ?? '',
        hiddenNote: say.result.chartHiddenNote ?? '',
        formats: say.result.chartFormats ?? {},
      },
    });
    wrap.hidden = !drawn;
  }

  /** One finding. Locked ones keep their heading and show a shape where the figure would be. */
  function card(fact: Fact): HTMLElement {
    const el = tpl('fact');
    const locked = Boolean(fact.locked);
    el.toggleAttribute('data-locked', locked);
    // The heading comes from the locale, keyed by the finding. The English label the backend
    // computed under is the fallback, so a finding added on the server shows up in English
    // rather than blank.
    field(el, 'label')!.textContent = say.result.labels?.[fact.key] ?? fact.label;
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
      // Named `bar`, not `fill`: `fill()` is the placeholder substitution used two lines
      // below, and a local of that name shadows it.
      const bar = field(el, 'meter-fill');
      requestAnimationFrame(() => {
        if (bar) bar.style.width = `${width}%`;
      });
      const mark = field(el, 'meter-mark');
      if (mark && typeof fact.meter.benchmark === 'number') {
        mark.style.insetInlineStart = `${Math.max(0, Math.min(100, (fact.meter.benchmark / fact.meter.max) * 100))}%`;
      } else if (mark) {
        mark.hidden = true;
      }
      const legend = field(el, 'meter-legend');
      if (legend) {
        // The one English sentence that survived the move to a copy file, because it was a
        // template literal rather than a lookup — so a Persian report carried it under every
        // bar in it. The label inside is the backend's own, translated with the read.
        legend.textContent = fact.meter.benchmarkLabel
          ? fill(say.result.meterLegend ?? '', { label: fact.meter.benchmarkLabel })
          : '';
      }
    }
    return el;
  }

  /** One page this read is measured against, in the same four columns as the starter branch. */
  function peerRow(peer: Peer): HTMLElement {
    const el = tpl('page');
    field(el, 'handle')!.textContent = `@${peer.handle}`;
    field(el, 'followers-label')!.textContent = say.result.fieldFollowers;
    field(el, 'followers')!.textContent = peer.followersText || count(peer.followers);
    field(el, 'pace-label')!.textContent = say.result.fieldPace;
    field(el, 'pace')!.textContent = peer.postsPerMonth == null ? '—' : String(peer.postsPerMonth);
    field(el, 'rate-label')!.textContent = say.result.fieldRate;
    field(el, 'rate')!.textContent = peer.rate;
    // Who chose this page. A comparison the visitor asked for reads very differently from one
    // we proposed, and the difference is worth one word.
    field(el, 'format-label')!.textContent = peer.named
      ? say.result.peersNamed
      : say.result.peersFound;
    field(el, 'format')!.textContent = peer.bestFormat ?? '·';
    return el;
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

  root.querySelector<HTMLElement>('[data-onward]')?.addEventListener('click', () => {
    void toPlan();
  });

  /**
   * The result screen's own address form.
   *
   * The fallback, not the road. Everybody who walked the funnel gave an address on the screen
   * before the read, and this stays hidden for them — it is here for the one case that is left:
   * an address that was taken and could not be stored, where the report is already on screen
   * and there is nowhere else to ask.
   */
  const leadForm = root.querySelector<HTMLFormElement>('[data-lead-form]');
  leadForm?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const typed = leadForm.querySelector<HTMLInputElement>('#email')!.value.trim();
    const ticked = leadForm.querySelector<HTMLInputElement>('[data-consent]')!.checked;
    const error = leadForm.querySelector<HTMLElement>('[data-lead-error]');
    const submit = leadForm.querySelector<HTMLButtonElement>('[data-lead-submit]')!;

    const complaint = check(typed, ticked);
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
    email = typed;
    consent = ticked;

    const giveBack = (message: string) => {
      if (error) {
        error.textContent = message;
        error.hidden = false;
      }
      submit.disabled = false;
      submit.textContent = say.result.cta;
    };

    // No proof-of-human here on the first attempt.
    //
    // The walk passed the check when the read began, minutes ago, from this address, and the
    // backend keeps that for half an hour precisely so this screen does not have to ask again.
    // Asking anyway is what put a Cloudflare widget in front of people two and three times in
    // one walk — and the second answer once failed for a day while the first still stood. If
    // the backend does want one it says so, and the retry below mints it then.
    try {
      if (auditId) {
        // The answer is the same view, unlocked. Nothing is flipped here: what
        // the backend chose to open is what gets drawn.
        let opened: AuditResult | IdeaResult;
        try {
          opened = await attach(null);
        } catch (err) {
          // The one failure a retry can fix. Everything else is the backend's word, shown.
          if (kindFor(err) !== 'human') throw err;
          const human = await turnstileToken(submit);
          opened = await attach(human.token);
        }
        addressUnsaved = false;
        save();
        if (isIdea(opened)) {
          idea = opened;
          renderStarter(opened);
        } else if ('facts' in opened) {
          result = opened;
          renderReport(opened);
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
    token = saved.token ?? null;
    rivals = Array.isArray(saved.rivals) ? saved.rivals : [];
    email = typeof saved.email === 'string' ? saved.email : '';
    consent = saved.consent === true;
    proofOff = saved.proofOff === true;
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

    // The address, put back into the screen that asked for it. A reload half-way through the
    // walk must not ask twice for something already typed.
    const emailInput = root.querySelector<HTMLInputElement>('#walk-email');
    if (emailInput && email) emailInput.value = email;
    const consentBox = root.querySelector<HTMLInputElement>('[data-email-consent]');
    if (consentBox) consentBox.checked = consent;
  }
}

function messageFor(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return FALLBACK_GENERIC;
}

function kindFor(err: unknown): AuditErrorKind {
  return err instanceof ApiError ? err.kind : 'error';
}
